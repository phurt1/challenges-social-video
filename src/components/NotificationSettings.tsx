import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  challenges: boolean;
  pushEnabled: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    likes: true,
    comments: true,
    follows: true,
    challenges: true,
    pushEnabled: false
  });
  const [loading, setLoading] = useState(false);
  const { isSupported, permission, requestPermission, registerServiceWorker, subscribeToPush } = usePushNotifications();
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          likes: data.likes ?? true,
          comments: data.comments ?? true,
          follows: data.follows ?? true,
          challenges: data.challenges ?? true,
          pushEnabled: data.push_enabled ?? false
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          likes: newPreferences.likes,
          comments: newPreferences.comments,
          follows: newPreferences.follows,
          challenges: newPreferences.challenges,
          push_enabled: newPreferences.pushEnabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (enabled) {
      await registerServiceWorker();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await subscribeToPush(user.id);
      }
    }

    const newPreferences = { ...preferences, pushEnabled: enabled };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const handlePreferenceChange = async (key: keyof Omit<NotificationPreferences, 'pushEnabled'>, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get notified instantly about important activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Label htmlFor="push-notifications">Enable push notifications</Label>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || loading}
            />
          </div>
          {!isSupported && (
            <p className="text-sm text-muted-foreground mt-2">
              Push notifications are not supported in this browser.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose what types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="likes">Likes on your videos</Label>
            <Switch
              id="likes"
              checked={preferences.likes}
              onCheckedChange={(value) => handlePreferenceChange('likes', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Comments on your videos</Label>
            <Switch
              id="comments"
              checked={preferences.comments}
              onCheckedChange={(value) => handlePreferenceChange('comments', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="follows">New followers</Label>
            <Switch
              id="follows"
              checked={preferences.follows}
              onCheckedChange={(value) => handlePreferenceChange('follows', value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="challenges">New challenges</Label>
            <Switch
              id="challenges"
              checked={preferences.challenges}
              onCheckedChange={(value) => handlePreferenceChange('challenges', value)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};