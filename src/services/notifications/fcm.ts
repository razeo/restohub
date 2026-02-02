// ===========================================
// Firebase Cloud Messaging Service
// RestoHub v2.0
// ===========================================

import { NotificationPayload, NotificationSector } from './types';

interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Get Firebase config from environment
const getFirebaseConfig = (): FirebaseConfig => ({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL || '',
  privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
});

// Check if FCM is configured
export const isFcmConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return !!(config.projectId && config.clientEmail && config.privateKey);
};

// Request FCM permission and get token
export const requestFcmPermission = async (): Promise<string | null> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getFcmToken();
    return token;
  } catch (error) {
    console.error('Error requesting FCM permission:', error);
    return null;
  }
};

// Get FCM token using VAPID key
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // Check if Firebase is available
    const { getToken } = await import('firebase/messaging');
    
    const config = getFirebaseConfig();
    
    if (!isFcmConfigured()) {
      console.warn('Firebase is not configured');
      return null;
    }

    // For client-side, we use the firebase config
    // In production, you'd initialize Firebase app here
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
    
    // Dynamic import for Firebase
    const { initializeApp, getApps } = await import('firebase/app');
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: `${config.projectId}.firebaseapp.com`,
      projectId: config.projectId,
      storageBucket: `${config.projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Initialize Firebase only if not already initialized
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }

    const app = getApps()[0];
    if (!app) {
      console.warn('Firebase app not initialized');
      return null;
    }

    const { getMessaging } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Send notification via Supabase Edge Function (recommended for server-side)
export const sendFcmNotification = async (
  tokens: string[],
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-fcm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
        },
        data: {
          type: payload.type,
          sector: payload.sector,
          priority: payload.priority,
          ...payload.data,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to send FCM notification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return { success: false, error: String(error) };
  }
};

// Subscribe to topic for sector-based notifications
export const subscribeToSector = async (sector: NotificationSector): Promise<boolean> => {
  try {
    const topic = `sector_${sector}`;
    
    // Note: Topic subscription typically requires server-side API call
    // This is a placeholder for the concept
    console.log(`Subscribing to topic: ${topic}`);
    
    // Store subscription preference locally
    localStorage.setItem(`fcm_sector_${sector}`, 'true');
    
    return true;
  } catch (error) {
    console.error('Error subscribing to sector:', error);
    return false;
  }
};

// Unsubscribe from sector topic
export const unsubscribeFromSector = async (sector: NotificationSector): Promise<boolean> => {
  try {
    localStorage.removeItem(`fcm_sector_${sector}`);
    return true;
  } catch (error) {
    console.error('Error unsubscribing from sector:', error);
    return false;
  }
};

// Check if subscribed to sector
export const isSubscribedToSector = (sector: NotificationSector): boolean => {
  return localStorage.getItem(`fcm_sector_${sector}`) === 'true';
};
