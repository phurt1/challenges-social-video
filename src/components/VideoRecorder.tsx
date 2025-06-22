import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video, Square, RotateCcw, Upload } from 'lucide-react';
import CameraControls from './CameraControls';
import RecordingTimer from './RecordingTimer';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  timeLimit?: number;
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  timeLimit = 300, 
  onRecordingComplete, 
  onCancel 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode }, 
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
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onRecordingComplete(blob);
      setHasRecorded(true);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000);
    setIsRecording(true);
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setHasRecorded(false);
    setTimeElapsed(0);
    chunksRef.current = [];
  };

  const handleToggleFlash = () => {
    setFlashEnabled(!flashEnabled);
    // Note: Flash control would require additional camera API implementation
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
      onRecordingComplete(blob);
    }
  };

  const progressPercentage = (timeElapsed / timeLimit) * 100;

  return (
    <div className="space-y-4" role="main" aria-label="Video recording interface">
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
          isRecording={isRecording}
          timeElapsed={timeElapsed}
          timeLimit={timeLimit}
        />
        
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
        {!hasRecorded ? (
          <>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#843dff] hover:bg-[#7c3aef]'}`}
              disabled={timeElapsed >= timeLimit}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <><Square size={16} className="mr-2" />Stop Recording</>
              ) : (
                <><Video size={16} className="mr-2" />Start Recording</>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel} aria-label="Cancel recording">
              Cancel
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

export default VideoRecorder;