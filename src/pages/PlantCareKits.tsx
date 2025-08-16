import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Star, Truck, Leaf, Calendar, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PlantCareKit {
  id: string;
  kit_name: string;
  description: string;
  kit_type: string;
  target_plants?: string[];
  kit_contents: any;
  retail_price: number;
  subscriber_price: number;
  shipping_details?: any;
  inventory_count: number;
  monthly_limit?: number;
  customer_rating: number;
  review_count: number;
  featured_image_url?: string;
  gallery_images?: string[];
  care_instructions?: string;
  video_tutorial_url?: string;
  is_featured: boolean;
  seasonal_availability?: string[];
}

interface KitSubscription {
  kit_id: string;
  subscription_frequency: string;
  delivery_address: any;
  customization_preferences?: any;
  zapier_webhook_url?: string;
}

const PlantCareKits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [kits, setKits] = useState<PlantCareKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [selectedKit, setSelectedKit] = useState<PlantCareKit | null>(null);
  const [subscriptionForm, setSubscriptionForm] = useState<KitSubscription>({
    kit_id: "",
    subscription_frequency: "monthly",
    delivery_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "US"
    },
    zapier_webhook_url: ""
  });

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const { data, error } = await supabase
        .from("plant_care_kits")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("popularity_score", { ascending: false });

      if (error) throw error;
      setKits(data || []);
    } catch (error) {
      console.error("Error fetching plant care kits:", error);
      toast({
        title: "Error",
        description: "Failed to load plant care kits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !selectedKit) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to plant care kits",
        variant: "destructive",
      });
      return;
    }

    if (!subscriptionForm.delivery_address.street || !subscriptionForm.delivery_address.city) {
      toast({
        title: "Invalid Address",
        description: "Please provide a complete delivery address",
        variant: "destructive",
      });
      return;
    }

    setSubscribing(selectedKit.id);

    try {
      const { error } = await supabase.from("kit_subscriptions").insert({
        user_id: user.id,
        kit_id: selectedKit.id,
        subscription_frequency: subscriptionForm.subscription_frequency,
        delivery_address: subscriptionForm.delivery_address,
        customization_preferences: subscriptionForm.customization_preferences || null,
        zapier_webhook_url: subscriptionForm.zapier_webhook_url || null,
      });

      if (error) throw error;

      // Trigger Zapier webhook if provided
      if (subscriptionForm.zapier_webhook_url) {
        try {
          await fetch(subscriptionForm.zapier_webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
              event: "kit_subscription",
              kit_name: selectedKit.kit_name,
              user_email: user.email,
              frequency: subscriptionForm.subscription_frequency,
              delivery_address: subscriptionForm.delivery_address,
              price: selectedKit.subscriber_price,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.log("Webhook notification sent (no-cors mode)");
        }
      }

      toast({
        title: "Subscription Started!",
        description: `You've subscribed to ${selectedKit.kit_name}. Your first kit will arrive soon!`,
      });

      setSelectedKit(null);
      setSubscriptionForm({
        kit_id: "",
        subscription_frequency: "monthly",
        delivery_address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "US"
        },
        zapier_webhook_url: ""
      });
    } catch (error) {
      console.error("Error subscribing to kit:", error);
      toast({
        title: "Subscription Failed",
        description: "Failed to start subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getKitTypeColor = (type: string) => {
    const colors = {
      'beginner': 'bg-green-500 text-white',
      'seasonal': 'bg-blue-500 text-white',
      'specialty': 'bg-purple-500 text-white',
      'troubleshoot': 'bg-red-500 text-white'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Every Month';
      case 'quarterly': return 'Every 3 Months';
      case 'seasonal': return 'Seasonally (4x/year)';
      default: return frequency;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Package className="h-8 w-8 text-primary" />
            Plant Care Kits & Bundles
          </h1>
          <p className="text-muted-foreground">
            Curated plant care essentials delivered to your door - exclusive for subscribers
          </p>
        </div>

        {/* Featured Kits */}
        {kits.some(kit => kit.is_featured) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Kits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kits.filter(kit => kit.is_featured).map((kit) => (
                <Card key={kit.id} className="border-2 border-yellow-200 overflow-hidden">
                  <CardHeader className="pb-3">
                    {kit.featured_image_url && (
                      <div className="aspect-video relative overflow-hidden rounded-md mb-3">
                        <img
                          src={kit.featured_image_url}
                          alt={kit.kit_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{kit.kit_name}</CardTitle>
                        <CardDescription className="mt-2">
                          {kit.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getKitTypeColor(kit.kit_type)}>
                        {kit.kit_type}
                      </Badge>
                      {kit.target_plants && kit.target_plants.length > 0 && (
                        <Badge variant="outline">
                          <Leaf className="h-3 w-3 mr-1" />
                          {kit.target_plants.slice(0, 2).join(', ')}
                          {kit.target_plants.length > 2 && ' +more'}
                        </Badge>
                      )}
                    </div>
                    
                    {kit.kit_contents && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Kit Contents:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(kit.kit_contents) ? (
                            kit.kit_contents.slice(0, 4).map((item: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {typeof item === 'string' ? item : item.name || item.item}
                              </Badge>
                            ))
                          ) : null}
                          {Array.isArray(kit.kit_contents) && kit.kit_contents.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{kit.kit_contents.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Retail Price</p>
                        <p className="text-lg line-through text-muted-foreground">${kit.retail_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Subscriber Price</p>
                        <p className="text-2xl font-bold text-primary">${kit.subscriber_price}</p>
                      </div>
                    </div>
                    
                    {kit.customer_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{kit.customer_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({kit.review_count} reviews)
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {kit.inventory_count} available
                      </div>
                      {kit.monthly_limit && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Max {kit.monthly_limit}/month
                        </div>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedKit(kit);
                            setSubscriptionForm({
                              ...subscriptionForm,
                              kit_id: kit.id
                            });
                          }}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Subscribe to Kit</DialogTitle>
                          <DialogDescription>
                            Set up your subscription for "{kit.kit_name}"
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-secondary/20 p-4 rounded-lg">
                            <h4 className="font-semibold">{kit.kit_name}</h4>
                            <p className="text-sm text-muted-foreground">{kit.description}</p>
                            <p className="text-lg font-bold text-primary mt-2">
                              ${kit.subscriber_price}/delivery
                            </p>
                          </div>
                          
                          <div>
                            <Label>Delivery Frequency</Label>
                            <Select 
                              value={subscriptionForm.subscription_frequency}
                              onValueChange={(value) => setSubscriptionForm({
                                ...subscriptionForm,
                                subscription_frequency: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly - ${kit.subscriber_price}/month</SelectItem>
                                <SelectItem value="quarterly">Quarterly - ${(kit.subscriber_price * 3 * 0.9).toFixed(2)} (10% off)</SelectItem>
                                <SelectItem value="seasonal">Seasonal - ${(kit.subscriber_price * 4 * 0.85).toFixed(2)} (15% off)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Delivery Address</Label>
                            <Input
                              placeholder="Street Address"
                              value={subscriptionForm.delivery_address.street}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                delivery_address: {
                                  ...subscriptionForm.delivery_address,
                                  street: e.target.value
                                }
                              })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="City"
                                value={subscriptionForm.delivery_address.city}
                                onChange={(e) => setSubscriptionForm({
                                  ...subscriptionForm,
                                  delivery_address: {
                                    ...subscriptionForm.delivery_address,
                                    city: e.target.value
                                  }
                                })}
                              />
                              <Input
                                placeholder="State"
                                value={subscriptionForm.delivery_address.state}
                                onChange={(e) => setSubscriptionForm({
                                  ...subscriptionForm,
                                  delivery_address: {
                                    ...subscriptionForm.delivery_address,
                                    state: e.target.value
                                  }
                                })}
                              />
                            </div>
                            <Input
                              placeholder="ZIP Code"
                              value={subscriptionForm.delivery_address.zip}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                delivery_address: {
                                  ...subscriptionForm.delivery_address,
                                  zip: e.target.value
                                }
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="zapier_webhook">Zapier Webhook URL (Optional)</Label>
                            <Input
                              id="zapier_webhook"
                              placeholder="https://hooks.zapier.com/hooks/catch/..."
                              value={subscriptionForm.zapier_webhook_url}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                zapier_webhook_url: e.target.value
                              })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Get shipping notifications via Zapier
                            </p>
                          </div>
                          
                          <Button 
                            onClick={handleSubscribe} 
                            className="w-full"
                            disabled={subscribing === kit.id}
                          >
                            {subscribing === kit.id ? "Setting up..." : `Start ${getFrequencyText(subscriptionForm.subscription_frequency)} Subscription`}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Kits */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Plant Care Kits</h2>
          {loading ? (
            <div className="text-center py-8">Loading plant care kits...</div>
          ) : kits.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No kits available</h3>
                <p className="text-muted-foreground">
                  Check back soon for new plant care kit offerings
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.filter(kit => !kit.is_featured).map((kit) => (
                <Card key={kit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    {kit.featured_image_url && (
                      <div className="aspect-square relative overflow-hidden rounded-md mb-3">
                        <img
                          src={kit.featured_image_url}
                          alt={kit.kit_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardTitle className="text-lg">{kit.kit_name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {kit.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getKitTypeColor(kit.kit_type)} variant="secondary">
                        {kit.kit_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm line-through text-muted-foreground">${kit.retail_price}</span>
                        <span className="text-lg font-bold text-primary ml-2">${kit.subscriber_price}</span>
                      </div>
                      {kit.customer_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{kit.customer_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => {
                            setSelectedKit(kit);
                            setSubscriptionForm({
                              ...subscriptionForm,
                              kit_id: kit.id
                            });
                          }}
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Subscribe
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        {/* Same dialog content as featured kits */}
                        <DialogHeader>
                          <DialogTitle>Subscribe to Kit</DialogTitle>
                          <DialogDescription>
                            Set up your subscription for "{kit.kit_name}"
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="bg-secondary/20 p-4 rounded-lg">
                            <h4 className="font-semibold">{kit.kit_name}</h4>
                            <p className="text-sm text-muted-foreground">{kit.description}</p>
                            <p className="text-lg font-bold text-primary mt-2">
                              ${kit.subscriber_price}/delivery
                            </p>
                          </div>
                          
                          <div>
                            <Label>Delivery Frequency</Label>
                            <Select 
                              value={subscriptionForm.subscription_frequency}
                              onValueChange={(value) => setSubscriptionForm({
                                ...subscriptionForm,
                                subscription_frequency: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly (10% off)</SelectItem>
                                <SelectItem value="seasonal">Seasonal (15% off)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-3">
                            <Label>Delivery Address</Label>
                            <Input
                              placeholder="Street Address"
                              value={subscriptionForm.delivery_address.street}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                delivery_address: {
                                  ...subscriptionForm.delivery_address,
                                  street: e.target.value
                                }
                              })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="City"
                                value={subscriptionForm.delivery_address.city}
                                onChange={(e) => setSubscriptionForm({
                                  ...subscriptionForm,
                                  delivery_address: {
                                    ...subscriptionForm.delivery_address,
                                    city: e.target.value
                                  }
                                })}
                              />
                              <Input
                                placeholder="State"
                                value={subscriptionForm.delivery_address.state}
                                onChange={(e) => setSubscriptionForm({
                                  ...subscriptionForm,
                                  delivery_address: {
                                    ...subscriptionForm.delivery_address,
                                    state: e.target.value
                                  }
                                })}
                              />
                            </div>
                            <Input
                              placeholder="ZIP Code"
                              value={subscriptionForm.delivery_address.zip}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                delivery_address: {
                                  ...subscriptionForm.delivery_address,
                                  zip: e.target.value
                                }
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="zapier_webhook">Zapier Webhook URL (Optional)</Label>
                            <Input
                              id="zapier_webhook"
                              placeholder="https://hooks.zapier.com/hooks/catch/..."
                              value={subscriptionForm.zapier_webhook_url}
                              onChange={(e) => setSubscriptionForm({
                                ...subscriptionForm,
                                zapier_webhook_url: e.target.value
                              })}
                            />
                          </div>
                          
                          <Button 
                            onClick={handleSubscribe} 
                            className="w-full"
                            disabled={subscribing === kit.id}
                          >
                            {subscribing === kit.id ? "Setting up..." : "Start Subscription"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCareKits;