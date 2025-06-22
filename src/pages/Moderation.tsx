import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import ContentModerationPanel from '@/components/ContentModerationPanel';

const Moderation: React.FC = () => {
  const { user } = useAuth();

  // Simple role check - in a real app, you'd check user roles from database
  const isModerator = user?.email?.includes('admin') || user?.email?.includes('mod');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              Please log in to access moderation tools.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Insufficient Permissions</h2>
            <p className="text-muted-foreground">
              You don't have permission to access moderation tools.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Demo: Use an email with 'admin' or 'mod' to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <ContentModerationPanel />
    </div>
  );
};

export default Moderation;