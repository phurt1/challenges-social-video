import React, { useState } from 'react';
import { Play, Download, Share, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import VideoPlayer from './VideoPlayer';
import { useToast } from '@/hooks/use-toast';

interface VideoPreviewProps {
  videoBlob: Blob;
  onSave: (metadata: VideoMetadata) => void;
  onDiscard: () => void;
  onRetake: () => void;
}

interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoBlob,
  onSave,
  onDiscard,
  onRetake
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(() => URL.createObjectURL(videoBlob));
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    tags: [],
    isPublic: true
  });
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!metadata.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your video.',
        variant: 'destructive'
      });
      return;
    }
    onSave(metadata);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const file = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
        await navigator.share({
          title: metadata.title || 'My Video',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyVideoUrl();
      }
    } else {
      copyVideoUrl();
    }
  };

  const copyVideoUrl = () => {
    navigator.clipboard.writeText(videoUrl);
    toast({
      title: 'Link Copied',
      description: 'Video link copied to clipboard.'
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${metadata.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video">
        <VideoPlayer
          src={videoUrl}
          controls={true}
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setShowEditDialog(true)}
          className="flex-1 bg-[#843dff] hover:bg-[#7c3aef]"
        >
          <Edit3 size={16} className="mr-2" />
          Edit Details
        </Button>
        
        <Button onClick={handleShare} variant="outline" className="flex-1">
          <Share size={16} className="mr-2" />
          Share
        </Button>
        
        <Button onClick={handleDownload} variant="outline">
          <Download size={16} />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={onRetake} variant="outline" className="flex-1">
          Retake
        </Button>
        <Button onClick={onDiscard} variant="destructive" className="flex-1">
          <Trash2 size={16} className="mr-2" />
          Discard
        </Button>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Video Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video"
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="tags" className="text-white">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tags"
                  className="bg-gray-800 border-gray-600 text-white flex-1"
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#843dff] text-white px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-[#7c3aef]"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setShowEditDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSave();
                  setShowEditDialog(false);
                }}
                className="bg-[#843dff] hover:bg-[#7c3aef]"
              >
                Save Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPreview;