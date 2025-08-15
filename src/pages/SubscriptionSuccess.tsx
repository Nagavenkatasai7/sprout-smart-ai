import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-subscription");
        
        if (error) throw error;
        
        setSubscriptionData(data);
        
        toast({
          title: "Welcome to PlantCare AI!",
          description: "Your subscription is now active. Enjoy unlimited plant care!",
        });
      } catch (error) {
        console.error("Error refreshing subscription:", error);
        toast({
          title: "Subscription Active",
          description: "Your payment was successful! It may take a moment for your subscription to activate.",
        });
      } finally {
        setLoading(false);
      }
    };

    // Delay to allow Stripe to process the webhook
    const timer = setTimeout(refreshSubscription, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            {loading ? (
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl text-green-600">
            {loading ? "Processing..." : "Payment Successful!"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {loading ? (
            <p className="text-muted-foreground">
              We're setting up your subscription. This may take a moment...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Thank you for subscribing to PlantCare AI! Your subscription is now active.
              </p>
              
              {subscriptionData && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="font-medium">
                    Plan: {subscriptionData.subscription_tier || "Premium"}
                  </p>
                  {subscriptionData.subscription_end && (
                    <p className="text-sm text-muted-foreground">
                      Next billing: {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate("/")} 
                  className="w-full"
                >
                  Start Identifying Plants
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/account")}
                  className="w-full"
                >
                  View Account Details
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;