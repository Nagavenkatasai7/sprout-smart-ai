import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, CreditCard, User, Crown, Sparkles, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Account = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [manageLoading, setManageLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.subscribed) {
      navigate("/pricing");
      return;
    }

    setManageLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setManageLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case "Basic":
        return <Leaf className="h-5 w-5" />;
      case "Premium":
        return <Sparkles className="h-5 w-5" />;
      case "Pro":
        return <Crown className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "Basic":
        return "bg-green-100 text-green-800";
      case "Premium":
        return "bg-blue-100 text-blue-800";
      case "Pro":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">User ID</label>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your plant care subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading subscription information...</span>
                </div>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={subscription.subscribed ? "default" : "secondary"}
                      className={subscription.subscribed ? getTierColor(subscription.subscription_tier) : ""}
                    >
                      <div className="flex items-center gap-1">
                        {getTierIcon(subscription.subscription_tier)}
                        {subscription.subscribed 
                          ? `${subscription.subscription_tier} Plan` 
                          : "Free Plan"
                        }
                      </div>
                    </Badge>
                  </div>
                  
                  {subscription.subscribed && subscription.subscription_end && (
                    <div>
                      <label className="text-sm font-medium">Next billing date</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.subscription_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleManageSubscription}
                      disabled={manageLoading}
                      className="flex items-center gap-2"
                    >
                      {manageLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Settings className="h-4 w-4" />
                      )}
                      {subscription.subscribed ? "Manage Subscription" : "Subscribe Now"}
                    </Button>
                    
                    <Button variant="outline" onClick={checkSubscription}>
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Unable to load subscription information</p>
                  <Button onClick={checkSubscription}>Retry</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full sm:w-auto"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;