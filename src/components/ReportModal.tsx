import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  videoId?: string;
  reportType: 'user' | 'video';
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment or bullying',
  'Spam',
  'Violence or dangerous behavior',
  'Hate speech',
  'Copyright violation',
  'Other'
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  videoId,
  reportType
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          video_id: videoId,
          reason,
          description
        });

      if (error) throw error;

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.'
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {reportType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};