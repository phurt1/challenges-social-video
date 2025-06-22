import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useContentScanning } from '@/hooks/useContentScanning';

interface VideoUploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
  scanResult?: any;
}

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { scanContent } = useContentScanning();

  const uploadVideo = async (videoBlob: Blob, challengeId: string): Promise<VideoUploadResult> => {
    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create unique filename
      const fileName = `${user.id}/${challengeId}/${Date.now()}.webm`;
      
      // Upload to Supabase storage first
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/webm',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Scan video content
      const scanResult = await scanContent('', 'video', publicUrl);
      
      // Check if content should be blocked
      if (scanResult && scanResult.isDangerous) {
        // Delete uploaded file if dangerous
        await supabase.storage.from('videos').remove([fileName]);
        
        return {
          success: false,
          error: 'Video blocked due to dangerous content',
          scanResult
        };
      }

      // Save video record to database with scan results
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          video_url: publicUrl,
          title: `Challenge Video - ${new Date().toLocaleDateString()}`,
          description: 'Challenge completion video',
          is_flagged: scanResult ? (scanResult.isHarmful || scanResult.isNSFW) : false,
          scan_flags: scanResult ? scanResult.flags : [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Show appropriate toast based on scan results
      if (scanResult && (scanResult.isHarmful || scanResult.isNSFW)) {
        toast({
          title: "Video Uploaded with Warning",
          description: "Your video has been flagged for review but uploaded successfully.",
          variant: "default"
        });
      } else {
        toast({
          title: "Success!",
          description: "Your challenge video has been uploaded successfully.",
        });
      }

      return {
        success: true,
        videoId: videoData.id,
        scanResult
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVideo,
    isUploading
  };
};