import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useContentScanning } from '@/hooks/useContentScanning';
import ContentScanningAlert from './ContentScanningAlert';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateChallengeModal({ open, onOpenChange, onSuccess }: CreateChallengeModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 50,
    duration: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanAlert, setShowScanAlert] = useState(false);
  const { scanContent, isScanning, lastScanResult } = useContentScanning();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Scan content before submission
    const contentToScan = `${formData.title} ${formData.description}`;
    const scanResult = await scanContent(contentToScan, 'text');
    
    if (scanResult && (scanResult.isHarmful || scanResult.isNSFW || scanResult.isDangerous)) {
      setShowScanAlert(true);
      if (scanResult.isDangerous) {
        return; // Block dangerous content
      }
      return; // Show alert for other flagged content
    }

    await submitChallenge();
  };

  const submitChallenge = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + formData.duration);

      const { error } = await supabase
        .from('live_challenges')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          creator_id: user.id,
          max_participants: formData.maxParticipants,
          end_time: endTime.toISOString()
        });

      if (error) throw error;

      setFormData({ title: '', description: '', maxParticipants: 50, duration: 30 });
      setShowScanAlert(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Live Challenge</DialogTitle>
        </DialogHeader>
        
        {showScanAlert && lastScanResult && (
          <ContentScanningAlert
            scanResult={lastScanResult}
            onProceed={() => {
              setShowScanAlert(false);
              submitChallenge();
            }}
            onCancel={() => setShowScanAlert(false)}
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter challenge title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your challenge..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="1000"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="480"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isScanning || !formData.title.trim()}>
              {isSubmitting ? 'Creating...' : isScanning ? 'Scanning...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}