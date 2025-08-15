import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Leaf, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Stripe Price IDs - Replace these with your actual Stripe Price IDs
const PRICE_IDS = {
  basic: "price_basic_monthly", // Replace with actual price ID
  premium: "price_premium_monthly", // Replace with actual price ID  
  pro: "price_pro_monthly", // Replace with actual price ID
};

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic",
      price: "$4.99",
      description: "Perfect for plant enthusiasts starting their journey",
      features: [
        "50 plant identifications per month",
        "Basic care advice",
        "Plant collection tracking",
        "Email support"
      ],
      priceId: PRICE_IDS.basic,
      tier: "Basic",
      icon: <Leaf className="h-6 w-6" />,
      popular: false
    },
    {
      name: "Premium",
      price: "$9.99",
      description: "Best for serious gardeners who want comprehensive care",
      features: [
        "Unlimited plant identifications",
        "Advanced AI care guidance",
        "Personalized care recommendations",
        "Plant health monitoring",
        "Priority email support",
        "Advanced plant analytics"
      ],
      priceId: PRICE_IDS.premium,
      tier: "Premium",
      icon: <Sparkles className="h-6 w-6" />,
      popular: true
    },
    {
      name: "Pro",
      price: "$19.99",
      description: "For professional gardeners and plant businesses",
      features: [
        "Everything in Premium",
        "Expert consultation access",
        "Custom care schedules",
        "Multi-location management",
        "API access",
        "Phone support",
        "Advanced reporting"
      ],
      priceId: PRICE_IDS.pro,
      tier: "Pro", 
      icon: <Crown className="h-6 w-6" />,
      popular: false
    }
  ];

  const handleSubscribe = async (priceId: string, tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(priceId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, tier },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plant Care Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered plant identification and personalized care advice to help your plants thrive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.priceId, plan.tier)}
                  disabled={loading === plan.priceId}
                >
                  {loading === plan.priceId ? "Creating checkout..." : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at support@plantcare.ai
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;