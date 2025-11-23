/**
 * ============================================================================
 * NOTIFICATION SETUP HOOK
 * ============================================================================
 * 
 * Registriert Push Notifications beim App-Start
 */

import { useEffect } from 'react';
import { registerForPushNotifications } from '@/lib/notifications-engine';
import { supabase } from '@/lib/supabase';

export function useNotificationSetup() {
  useEffect(() => {
    setupNotifications();
  }, []);

  async function setupNotifications() {
    try {
      // Prüfe ob User eingeloggt ist
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('📱 Registering push notifications for user:', session.user.id);
        await registerForPushNotifications(session.user.id);
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }
}
