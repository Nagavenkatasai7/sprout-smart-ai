import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SecureSubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface SubscriptionAuditLog {
  id: string;
  action_type: string;
  masked_email: string;
  change_details: any;
  created_at: string;
}

export function useSecureSubscription() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SecureSubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [auditLogs, setAuditLogs] = useState<SubscriptionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status securely
  const checkSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the secure edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'check-subscription',
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
      });

    } catch (err) {
      console.error('Subscription check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
      
      // Fallback to safe function if edge function fails
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('get_user_subscription_safe');

        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          const subData = fallbackData[0];
          setSubscriptionData({
            subscribed: subData.subscribed || false,
            subscription_tier: subData.subscription_tier || null,
            subscription_end: subData.subscription_end || null,
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback subscription check failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load audit logs for transparency
  const loadAuditLogs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscription_audit_log')
        .select('id, action_type, masked_email, change_details, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading audit logs:', error);
        return;
      }

      setAuditLogs(data || []);
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }, [user]);

  // Check subscription when user changes or component mounts
  useEffect(() => {
    checkSubscription();
    loadAuditLogs();
  }, [checkSubscription, loadAuditLogs]);

  // Set up real-time subscription to audit logs
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription_audit')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'subscription_audit_log',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setAuditLogs(prev => [payload.new as SubscriptionAuditLog, ...prev.slice(0, 9)]);
          // Refresh subscription data when changes are detected
          checkSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkSubscription]);

  // Create checkout session
  const createCheckoutSession = async (priceAmount: number = 799) => {
    if (!user) {
      throw new Error('User must be authenticated to create checkout session');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceAmount },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.url;
    } catch (err) {
      console.error('Checkout creation error:', err);
      throw err;
    }
  };

  // Get customer portal URL
  const getCustomerPortalUrl = async () => {
    if (!user) {
      throw new Error('User must be authenticated to access customer portal');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.url;
    } catch (err) {
      console.error('Customer portal error:', err);
      throw err;
    }
  };

  return {
    // Subscription data
    subscribed: subscriptionData.subscribed,
    subscriptionTier: subscriptionData.subscription_tier,
    subscriptionEnd: subscriptionData.subscription_end,
    
    // State
    loading,
    error,
    
    // Audit logs for transparency
    auditLogs,
    
    // Actions
    checkSubscription,
    createCheckoutSession,
    getCustomerPortalUrl,
    
    // Helper computed values
    isBasic: subscriptionData.subscription_tier === 'Basic',
    isPremium: subscriptionData.subscription_tier === 'Premium',
    isEnterprise: subscriptionData.subscription_tier === 'Enterprise',
    
    // Check if subscription is expiring soon (within 7 days)
    isExpiringSoon: subscriptionData.subscription_end 
      ? new Date(subscriptionData.subscription_end).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
      : false,
  };
}