// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, data: notificationData } = data;

    const options = {
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      data: notificationData,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-dismiss.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click - open app or specific page
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app not open
      if (self.clients.openWindow) {
        const url = event.notification.data?.url || '/';
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Track notification dismissal if needed
});