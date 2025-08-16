import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPreferences {
  sidebar_collapsed: boolean;
  dashboard_layout: any[];
  notification_settings: {
    care_reminders: boolean;
    social_notifications: boolean;
    achievement_notifications: boolean;
    community_updates: boolean;
    email_notifications: boolean;
  };
  theme_preference: string;
}

const defaultPreferences: UserPreferences = {
  sidebar_collapsed: false,
  dashboard_layout: [],
  notification_settings: {
    care_reminders: true,
    social_notifications: true,
    achievement_notifications: true,
    community_updates: true,
    email_notifications: false,
  },
  theme_preference: 'system',
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(defaultPreferences);
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
      }

      if (data) {
        setPreferences({
          sidebar_collapsed: data.sidebar_collapsed,
          dashboard_layout: Array.isArray(data.dashboard_layout) ? data.dashboard_layout : [],
          notification_settings: typeof data.notification_settings === 'object' ? data.notification_settings as any : defaultPreferences.notification_settings,
          theme_preference: data.theme_preference,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          sidebar_collapsed: newPreferences.sidebar_collapsed,
          dashboard_layout: newPreferences.dashboard_layout,
          notification_settings: newPreferences.notification_settings,
          theme_preference: newPreferences.theme_preference,
        });

      if (error) {
        console.error('Error updating preferences:', error);
        // Revert on error
        setPreferences(preferences);
      }
    } catch (error) {
      console.error('Error:', error);
      setPreferences(preferences);
    }
  };

  return {
    preferences,
    updatePreferences,
    loading,
  };
}