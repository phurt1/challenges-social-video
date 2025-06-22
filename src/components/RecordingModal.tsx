import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import EnhancedVideoRecorder from './EnhancedVideoRecorder';

interface Challenge {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
}

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  onUpload: (videoBlob: Blob, challengeId: string) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({ 
  isOpen, 
  onClose, 
  challenge, 
  onUpload 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  if (!challenge) return null;

  const handleRecordingComplete = async (blob: Blob, metadata?: any) => {
    setIsUploading(true);
    try {
      await onUpload(blob, challenge.id);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-2">{challenge.title}</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{challenge.description}</p>
          
          <EnhancedVideoRecorder
            timeLimit={challenge.timeLimit ? challenge.timeLimit * 60 : 300}
            onRecordingComplete={handleRecordingComplete}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;