import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Leaf, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      description: "Perfect for plant enthusiasts starting their journey",
      features: [
        "Save up to 50 plants",
        "Basic care reminders",
        "Community forum access",
        "Plant identification (50/month)",
        "Basic plant calendar",
        "Email support"
      ],
      tier: "Basic",
      icon: <Leaf className="h-6 w-6" />,
      popular: false
    },
    {
      name: "Premium",
      price: "$24.99",
      description: "Best for serious gardeners who want comprehensive care",
      features: [
        "Unlimited plant tracking",
        "Advanced AI diagnostics",
        "Personalized expert advice (weekly)",
        "Offline mode access",
        "Premium plant calendar features",
        "Advanced care reminders",
        "Priority email support",
        "Plant health analytics"
      ],
      tier: "Premium",
      icon: <Sparkles className="h-6 w-6" />,
      popular: true
    },
    {
      name: "Pro",
      price: "$49.99",
      description: "For professional gardeners and commercial operations",
      features: [
        "Everything in Premium",
        "1-on-1 video consultations with horticulturists",
        "Commercial growing features",
        "Bulk plant management (1000+ plants)",
        "API access for smart home integration",
        "Custom reporting for plant collections",
        "Multi-location management",
        "Phone support",
        "Advanced analytics dashboard"
      ],
      tier: "Pro", 
      icon: <Crown className="h-6 w-6" />,
      popular: false
    }
  ];

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(tier);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier },
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
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading === plan.tier}
                >
                  {loading === plan.tier ? "Creating checkout..." : `Subscribe to ${plan.name}`}
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