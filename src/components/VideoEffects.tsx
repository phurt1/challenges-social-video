import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sparkles, Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VideoEffectsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onEffectChange?: (effects: VideoEffectSettings) => void;
}

interface VideoEffectSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: string;
}

const VideoEffects: React.FC<VideoEffectsProps> = ({ videoRef, onEffectChange }) => {
  const [effects, setEffects] = useState<VideoEffectSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    filter: 'none'
  });
  const [showControls, setShowControls] = useState(false);

  const filters = [
    { name: 'None', value: 'none', preview: 'bg-gray-500' },
    { name: 'Sepia', value: 'sepia(1)', preview: 'bg-yellow-600' },
    { name: 'Grayscale', value: 'grayscale(1)', preview: 'bg-gray-400' },
    { name: 'Vintage', value: 'sepia(0.5) contrast(1.2) brightness(1.1)', preview: 'bg-orange-400' },
    { name: 'Cool', value: 'hue-rotate(180deg) saturate(1.2)', preview: 'bg-blue-400' },
    { name: 'Warm', value: 'hue-rotate(-20deg) saturate(1.3)', preview: 'bg-red-400' },
    { name: 'High Contrast', value: 'contrast(1.5) brightness(1.1)', preview: 'bg-white' },
    { name: 'Dreamy', value: 'blur(1px) brightness(1.2) saturate(1.3)', preview: 'bg-pink-300' }
  ];

  useEffect(() => {
    applyEffects();
  }, [effects]);

  const applyEffects = () => {
    if (!videoRef.current) return;

    const { brightness, contrast, saturation, blur, filter } = effects;
    
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    if (blur > 0) {
      filterString += ` blur(${blur}px)`;
    }
    
    if (filter !== 'none') {
      filterString += ` ${filter}`;
    }

    videoRef.current.style.filter = filterString;
    onEffectChange?.(effects);
  };

  const updateEffect = (key: keyof VideoEffectSettings, value: number | string) => {
    setEffects(prev => ({ ...prev, [key]: value }));
  };

  const resetEffects = () => {
    setEffects({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      filter: 'none'
    });
  };

  const selectFilter = (filterValue: string) => {
    updateEffect('filter', filterValue);
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        onClick={() => setShowControls(!showControls)}
        variant="ghost"
        size="sm"
        className="bg-black/50 text-white hover:bg-black/70 mb-2"
      >
        <Palette size={16} />
      </Button>

      {showControls && (
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-4 w-64">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center">
              <Sparkles size={16} className="mr-2" />
              Effects
            </h3>
            <Button
              onClick={resetEffects}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
            >
              <RotateCcw size={14} />
            </Button>
          </div>

          {/* Filter presets */}
          <div>
            <Label className="text-white text-sm mb-2 block">Filters</Label>
            <div className="grid grid-cols-4 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => selectFilter(filter.value)}
                  className={cn(
                    'w-12 h-12 rounded-lg border-2 transition-all',
                    filter.preview,
                    effects.filter === filter.value
                      ? 'border-[#843dff] scale-105'
                      : 'border-gray-600 hover:border-gray-400'
                  )}
                  title={filter.name}
                />
              ))}
            </div>
          </div>

          {/* Brightness */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Brightness: {effects.brightness}%
            </Label>
            <Slider
              value={[effects.brightness]}
              onValueChange={([value]) => updateEffect('brightness', value)}
              min={50}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Contrast */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Contrast: {effects.contrast}%
            </Label>
            <Slider
              value={[effects.contrast]}
              onValueChange={([value]) => updateEffect('contrast', value)}
              min={50}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Saturation */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Saturation: {effects.saturation}%
            </Label>
            <Slider
              value={[effects.saturation]}
              onValueChange={([value]) => updateEffect('saturation', value)}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Blur */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Blur: {effects.blur}px
            </Label>
            <Slider
              value={[effects.blur]}
              onValueChange={([value]) => updateEffect('blur', value)}
              min={0}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEffects;