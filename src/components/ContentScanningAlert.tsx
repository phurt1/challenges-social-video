import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanResult {
  isHarmful: boolean;
  isNSFW: boolean;
  isDangerous: boolean;
  confidence: number;
  flags: string[];
  reason: string;
}

interface ContentScanningAlertProps {
  scanResult: ScanResult;
  onProceed?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

const ContentScanningAlert: React.FC<ContentScanningAlertProps> = ({
  scanResult,
  onProceed,
  onCancel,
  showActions = true
}) => {
  const getAlertVariant = () => {
    if (scanResult.isDangerous) return 'destructive';
    if (scanResult.isHarmful || scanResult.isNSFW) return 'default';
    return 'default';
  };

  const getIcon = () => {
    if (scanResult.isDangerous) return <AlertTriangle className="h-4 w-4" />;
    if (scanResult.isNSFW) return <Eye className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (scanResult.isDangerous) return 'Dangerous Content Detected';
    if (scanResult.isNSFW) return 'NSFW Content Detected';
    if (scanResult.isHarmful) return 'Harmful Content Detected';
    return 'Content Warning';
  };

  if (!scanResult.isHarmful && !scanResult.isNSFW && !scanResult.isDangerous) {
    return null;
  }

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{scanResult.reason}</p>
        <p className="text-sm text-muted-foreground">
          Confidence: {Math.round(scanResult.confidence * 100)}%
        </p>
        {scanResult.flags.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Flags:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {scanResult.flags.map((flag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-muted rounded-md"
                >
                  {flag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        {showActions && (onProceed || onCancel) && (
          <div className="flex gap-2 mt-4">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onProceed && !scanResult.isDangerous && (
              <Button variant="secondary" size="sm" onClick={onProceed}>
                Proceed Anyway
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ContentScanningAlert;