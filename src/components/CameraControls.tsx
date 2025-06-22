import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ZapOff, RotateCcw, Mic, MicOff, Image } from 'lucide-react';

interface CameraControlsProps {
  flashEnabled: boolean;
  audioEnabled: boolean;
  onToggleFlash: () => void;
  onToggleAudio: () => void;
  onFlipCamera: () => void;
  onSelectFromLibrary: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  flashEnabled,
  audioEnabled,
  onToggleFlash,
  onToggleAudio,
  onFlipCamera,
  onSelectFromLibrary
}) => {
  return (
    <div className="flex justify-center space-x-4 p-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleFlash}
        aria-label={flashEnabled ? 'Turn off flash' : 'Turn on flash'}
        className="bg-black/20 border-white/20 text-white hover:bg-white/10"
      >
        {flashEnabled ? <Zap size={20} /> : <ZapOff size={20} />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onFlipCamera}
        aria-label="Flip camera"
        className="bg-black/20 border-white/20 text-white hover:bg-white/10"
      >
        <RotateCcw size={20} />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleAudio}
        aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
        className="bg-black/20 border-white/20 text-white hover:bg-white/10"
      >
        {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onSelectFromLibrary}
        aria-label="Select from photo library"
        className="bg-black/20 border-white/20 text-white hover:bg-white/10"
      >
        <Image size={20} />
      </Button>
    </div>
  );
};

export default CameraControls;