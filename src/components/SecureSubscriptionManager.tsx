import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  RefreshCw,
  ExternalLink,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Lock,
} from 'lucide-react';
import { useSecureSubscription } from '@/hooks/useSecureSubscription';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function SecureSubscriptionManager() {
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    error,
    auditLogs,
    checkSubscription,
    createCheckoutSession,
    getCustomerPortalUrl,
    isExpiringSoon,
  } = useSecureSubscription();

  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCheckoutSession = async (priceAmount: number) => {
    try {
      setActionLoading('checkout');
      const url = await createCheckoutSession(priceAmount);
      
      // Open in new tab for security
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Checkout Session Created",
        description: "Redirecting to secure payment page...",
      });
    } catch (err) {
      toast({
        title: "Checkout Error",
        description: err instanceof Error ? err.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      setActionLoading('portal');
      const url = await getCustomerPortalUrl();
      
      // Open in new tab for security
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Customer Portal",
        description: "Opening secure customer portal...",
      });
    } catch (err) {
      toast({
        title: "Portal Error", 
        description: err instanceof Error ? err.message : "Failed to access customer portal",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      setActionLoading('refresh');
      await checkSubscription();
      toast({
        title: "Subscription Refreshed",
        description: "Latest subscription status has been loaded.",
      });
    } catch (err) {
      toast({
        title: "Refresh Error",
        description: "Failed to refresh subscription status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getSubscriptionStatusColor = () => {
    if (!subscribed) return 'bg-gray-100 text-gray-800';
    if (isExpiringSoon) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSubscriptionStatusIcon = () => {
    if (!subscribed) return <AlertTriangle className="h-4 w-4" />;
    if (isExpiringSoon) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (loading && !subscribed) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Subscription Management:</strong> Your payment data is protected with enterprise-grade security. 
          All sensitive information is encrypted and access is strictly controlled.
        </AlertDescription>
      </Alert>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Secure subscription management with full audit trail
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSubscription}
              disabled={actionLoading === 'refresh'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getSubscriptionStatusIcon()}
              <div>
                <div className="font-medium">
                  {subscribed ? `${subscriptionTier} Plan` : 'No Active Subscription'}
                </div>
                {subscriptionEnd && (
                  <div className="text-sm text-muted-foreground">
                    {isExpiringSoon ? 'Expires' : 'Renews'} {formatDistanceToNow(new Date(subscriptionEnd), { addSuffix: true })}
                  </div>
                )}
              </div>
            </div>
            <Badge className={getSubscriptionStatusColor()}>
              {subscribed ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {isExpiringSoon && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription expires soon! Manage your subscription to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-wrap">
            {!subscribed ? (
              <>
                <Button 
                  onClick={() => handleCheckoutSession(799)}
                  disabled={actionLoading === 'checkout'}
                >
                  Subscribe to Premium ($7.99/month)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCheckoutSession(1999)}
                  disabled={actionLoading === 'checkout'}
                >
                  Subscribe to Enterprise ($19.99/month)
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleCustomerPortal}
                disabled={actionLoading === 'portal'}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Audit Trail
          </CardTitle>
          <CardDescription>
            Complete history of subscription changes for transparency and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No audit logs yet</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                    <div>
                      <div className="font-medium">{log.action_type.replace('_', ' ')}</div>
                      <div className="text-muted-foreground">
                        Account: {log.masked_email}
                      </div>
                      {log.change_details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Status: {log.change_details.subscribed ? 'Active' : 'Inactive'}
                          {log.change_details.subscription_tier && ` (${log.change_details.subscription_tier})`}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Zero-trust data access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Complete audit logging</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>PII data masking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Row-level security (RLS)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Service role isolation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}