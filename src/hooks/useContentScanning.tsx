import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  isHarmful: boolean;
  isNSFW: boolean;
  isDangerous: boolean;
  confidence: number;
  flags: string[];
  reason: string;
}

interface UseContentScanningReturn {
  scanContent: (content: string, type: 'text' | 'video', videoUrl?: string) => Promise<ScanResult | null>;
  isScanning: boolean;
  lastScanResult: ScanResult | null;
}

export const useContentScanning = (): UseContentScanningReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const scanContent = async (
    content: string,
    type: 'text' | 'video',
    videoUrl?: string
  ): Promise<ScanResult | null> => {
    setIsScanning(true);
    
    try {
      const response = await fetch(
        'https://ntjftvutadkasgmxeovg.supabase.co/functions/v1/eb5c4910-341b-41ff-b049-4c5c6e32b5fa',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            type,
            videoUrl
          })
        }
      );

      if (!response.ok) {
        throw new Error('Content scanning failed');
      }

      const result: ScanResult = await response.json();
      setLastScanResult(result);

      // Show warning if content is flagged
      if (result.isHarmful || result.isNSFW || result.isDangerous) {
        toast({
          title: 'Content Warning',
          description: result.reason || 'Content may violate community guidelines',
          variant: 'destructive'
        });
      }

      return result;
    } catch (error) {
      console.error('Content scanning error:', error);
      toast({
        title: 'Scanning Error',
        description: 'Unable to scan content. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanContent,
    isScanning,
    lastScanResult
  };
};
