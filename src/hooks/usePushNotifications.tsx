import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'like' | 'comment' | 'follow' | 'challenge';
  data?: any;
  timestamp: string;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) return null;
    
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      return reg;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  };

  const subscribeToPush = async (userId: string): Promise<boolean> => {
    if (!registration || permission !== 'granted') return false;
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
      });
      
      // Store subscription in database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  };

  const sendNotification = async (notification: Omit<PushNotification, 'id' | 'timestamp'>) => {
    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: notification.data
      });
    } else {
      toast({
        title: notification.title,
        description: notification.body
      });
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    registerServiceWorker,
    subscribeToPush,
    sendNotification
  };
};