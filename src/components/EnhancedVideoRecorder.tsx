import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video, Square, RotateCcw, Upload, Play } from 'lucide-react';
import CameraControls from './CameraControls';
import RecordingTimer from './RecordingTimer';
import VideoEffects from './VideoEffects';
import VideoPreview from './VideoPreview';
import { useToast } from '@/hooks/use-toast';

interface EnhancedVideoRecorderProps {
  timeLimit?: number;
  onRecordingComplete: (blob: Blob, metadata?: any) => void;
  onCancel: () => void;
}

type RecordingState = 'idle' | 'recording' | 'stopped' | 'preview';

const EnhancedVideoRecorder: React.FC<EnhancedVideoRecorderProps> = ({ 
  timeLimit = 300, 
  onRecordingComplete, 
  onCancel 
}) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state !== 'preview') {
      startCamera();
    }
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode, state]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode, width: 1280, height: 720 }, 
        audio: audioEnabled 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setState('preview');
      stopCamera();
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setState('recording');
    setTimeElapsed(0);
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= timeLimit - 1) {
          stopRecording();
          return timeLimit;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('stopped');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setState('idle');
    setTimeElapsed(0);
    setRecordedBlob(null);
    chunksRef.current = [];
  };

  const handleToggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleSelectFromLibrary = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const blob = new Blob([file], { type: file.type });
      setRecordedBlob(blob);
      setState('preview');
    }
  };

  const handleSaveVideo = (metadata: any) => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, metadata);
    }
  };

  const handleDiscardVideo = () => {
    resetRecording();
  };

  const handleRetakeVideo = () => {
    resetRecording();
  };

  const progressPercentage = (timeElapsed / timeLimit) * 100;

  if (state === 'preview' && recordedBlob) {
    return (
      <div className="space-y-4">
        <VideoPreview
          videoBlob={recordedBlob}
          onSave={handleSaveVideo}
          onDiscard={handleDiscardVideo}
          onRetake={handleRetakeVideo}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" role="main" aria-label="Enhanced video recording interface">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-64 object-cover"
          aria-label="Camera preview"
        />
        
        <RecordingTimer 
          isRecording={state === 'recording'}
          timeElapsed={timeElapsed}
          timeLimit={timeLimit}
        />
        
        <VideoEffects videoRef={videoRef} />
        
        <div className="absolute bottom-0 left-0 right-0">
          <CameraControls
            flashEnabled={flashEnabled}
            audioEnabled={audioEnabled}
            onToggleFlash={handleToggleFlash}
            onToggleAudio={handleToggleAudio}
            onFlipCamera={handleFlipCamera}
            onSelectFromLibrary={handleSelectFromLibrary}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Recording Progress</span>
          <span>{Math.max(0, timeLimit - timeElapsed)}s remaining</span>
        </div>
        <Progress value={progressPercentage} className="h-2" aria-label="Recording progress" />
      </div>
      
      <div className="flex space-x-2">
        {state === 'idle' ? (
          <>
            <Button
              onClick={startRecording}
              className="flex-1 bg-[#843dff] hover:bg-[#7c3aef]"
              disabled={timeElapsed >= timeLimit}
              aria-label="Start recording"
            >
              <Video size={16} className="mr-2" />Start Recording
            </Button>
            <Button variant="outline" onClick={onCancel} aria-label="Cancel recording">
              Cancel
            </Button>
          </>
        ) : state === 'recording' ? (
          <>
            <Button
              onClick={stopRecording}
              className="flex-1 bg-red-500 hover:bg-red-600"
              aria-label="Stop recording"
            >
              <Square size={16} className="mr-2" />Stop Recording
            </Button>
          </>
        ) : (
          <Button
            onClick={resetRecording}
            variant="outline"
            className="flex-1"
            aria-label="Record again"
          >
            <RotateCcw size={16} className="mr-2" />
            Record Again
          </Button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select video from library"
      />
    </div>
  );
};

export default EnhancedVideoRecorder;