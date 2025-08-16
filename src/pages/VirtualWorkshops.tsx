import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Video, Clock, Users, Star, Calendar, Play, Award, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  instructor_bio?: string;
  instructor_avatar_url?: string;
  workshop_type: string;
  skill_level: string;
  duration_minutes: number;
  max_participants?: number;
  price: number;
  subscriber_discount_percent: number;
  topics_covered?: string[];
  materials_needed?: string[];
  scheduled_datetime?: string;
  is_featured: boolean;
  registration_count: number;
  rating_average: number;
  review_count: number;
  status: string;
}

interface WorkshopRegistration {
  workshop_id: string;
  payment_amount: number;
  zapier_webhook_url?: string;
}

const VirtualWorkshops = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [registrationForm, setRegistrationForm] = useState<WorkshopRegistration>({
    workshop_id: "",
    payment_amount: 0,
    zapier_webhook_url: ""
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from("virtual_workshops")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("scheduled_datetime", { ascending: true });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error("Error fetching workshops:", error);
      toast({
        title: "Error",
        description: "Failed to load workshops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !selectedWorkshop) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for workshops",
        variant: "destructive",
      });
      return;
    }

    setRegistering(selectedWorkshop.id);

    try {
      const { error } = await supabase.from("workshop_registrations").insert({
        user_id: user.id,
        workshop_id: selectedWorkshop.id,
        payment_amount: registrationForm.payment_amount,
        zapier_webhook_url: registrationForm.zapier_webhook_url || null,
      });

      if (error) throw error;

      // Trigger Zapier webhook if provided
      if (registrationForm.zapier_webhook_url) {
        try {
          await fetch(registrationForm.zapier_webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
              event: "workshop_registration",
              workshop_title: selectedWorkshop.title,
              instructor: selectedWorkshop.instructor_name,
              user_email: user.email,
              scheduled_datetime: selectedWorkshop.scheduled_datetime,
              payment_amount: registrationForm.payment_amount,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.log("Webhook notification sent (no-cors mode)");
        }
      }

      toast({
        title: "Registration Successful!",
        description: "You've been registered for the workshop. Check your email for details.",
      });

      setSelectedWorkshop(null);
      setRegistrationForm({
        workshop_id: "",
        payment_amount: 0,
        zapier_webhook_url: ""
      });
      fetchWorkshops();
    } catch (error) {
      console.error("Error registering for workshop:", error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for workshop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  const calculatePrice = (basePrice: number, discountPercent: number, hasSubscription: boolean) => {
    if (hasSubscription) {
      return basePrice * (1 - discountPercent / 100);
    }
    return basePrice;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getWorkshopTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'live': return <Video className="h-4 w-4" />;
      case 'recorded': return <Play className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Video className="h-8 w-8 text-primary" />
            Virtual Workshops & Masterclasses
          </h1>
          <p className="text-muted-foreground">
            Learn from expert horticulturists and take your plant care skills to the next level
          </p>
        </div>

        {/* Featured Workshops */}
        {workshops.some(w => w.is_featured) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Workshops
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.filter(w => w.is_featured).map((workshop) => (
                <Card key={workshop.id} className="border-2 border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl line-clamp-2">{workshop.title}</CardTitle>
                        <CardDescription className="mt-2">
                          by {workshop.instructor_name}
                        </CardDescription>
                      </div>
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {workshop.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {workshop.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {getWorkshopTypeIcon(workshop.workshop_type)}
                        {workshop.workshop_type}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {workshop.registration_count} registered
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {workshop.rating_average.toFixed(1)} ({workshop.review_count})
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getSkillLevelColor(workshop.skill_level)}>
                        {workshop.skill_level}
                      </Badge>
                      {workshop.scheduled_datetime && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(workshop.scheduled_datetime).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-2xl font-bold text-primary">${workshop.price}</span>
                        {workshop.subscriber_discount_percent > 0 && (
                          <div className="text-xs text-green-600">
                            {workshop.subscriber_discount_percent}% off for subscribers
                          </div>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setRegistrationForm({
                                workshop_id: workshop.id,
                                payment_amount: calculatePrice(workshop.price, workshop.subscriber_discount_percent, false),
                                zapier_webhook_url: ""
                              });
                            }}
                          >
                            Register Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Register for Workshop</DialogTitle>
                            <DialogDescription>
                              Complete your registration for "{workshop.title}"
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="bg-secondary/20 p-4 rounded-lg">
                              <h4 className="font-semibold">{workshop.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Instructor: {workshop.instructor_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Duration: {workshop.duration_minutes} minutes
                              </p>
                              {workshop.scheduled_datetime && (
                                <p className="text-sm text-muted-foreground">
                                  Date: {new Date(workshop.scheduled_datetime).toLocaleString()}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="payment_amount">Payment Amount</Label>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <Input
                                  id="payment_amount"
                                  type="number"
                                  value={registrationForm.payment_amount}
                                  onChange={(e) => setRegistrationForm({
                                    ...registrationForm,
                                    payment_amount: parseFloat(e.target.value)
                                  })}
                                  step="0.01"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="zapier_webhook">Zapier Webhook URL (Optional)</Label>
                              <Input
                                id="zapier_webhook"
                                placeholder="https://hooks.zapier.com/hooks/catch/..."
                                value={registrationForm.zapier_webhook_url}
                                onChange={(e) => setRegistrationForm({
                                  ...registrationForm,
                                  zapier_webhook_url: e.target.value
                                })}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Get notified via Zapier when you register for this workshop
                              </p>
                            </div>
                            
                            <Button 
                              onClick={handleRegister} 
                              className="w-full"
                              disabled={registering === workshop.id}
                            >
                              {registering === workshop.id ? "Registering..." : "Complete Registration"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Workshops */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Workshops</h2>
          {loading ? (
            <div className="text-center py-8">Loading workshops...</div>
          ) : workshops.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No workshops available</h3>
                <p className="text-muted-foreground">
                  Check back soon for new workshops and masterclasses
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.filter(w => !w.is_featured).map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
                    <CardDescription>by {workshop.instructor_name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {workshop.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workshop.duration_minutes}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {workshop.registration_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {workshop.rating_average.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getSkillLevelColor(workshop.skill_level)} variant="secondary">
                        {workshop.skill_level}
                      </Badge>
                      <Badge variant="outline">
                        {getWorkshopTypeIcon(workshop.workshop_type)}
                        {workshop.workshop_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-lg font-bold text-primary">${workshop.price}</span>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedWorkshop(workshop);
                              setRegistrationForm({
                                workshop_id: workshop.id,
                                payment_amount: calculatePrice(workshop.price, workshop.subscriber_discount_percent, false),
                                zapier_webhook_url: ""
                              });
                            }}
                          >
                            Register
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {/* Same dialog content as featured workshops */}
                          <DialogHeader>
                            <DialogTitle>Register for Workshop</DialogTitle>
                            <DialogDescription>
                              Complete your registration for "{workshop.title}"
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="bg-secondary/20 p-4 rounded-lg">
                              <h4 className="font-semibold">{workshop.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Instructor: {workshop.instructor_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Duration: {workshop.duration_minutes} minutes
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor="payment_amount">Payment Amount</Label>
                              <Input
                                id="payment_amount"
                                type="number"
                                value={registrationForm.payment_amount}
                                onChange={(e) => setRegistrationForm({
                                  ...registrationForm,
                                  payment_amount: parseFloat(e.target.value)
                                })}
                                step="0.01"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="zapier_webhook">Zapier Webhook URL (Optional)</Label>
                              <Input
                                id="zapier_webhook"
                                placeholder="https://hooks.zapier.com/hooks/catch/..."
                                value={registrationForm.zapier_webhook_url}
                                onChange={(e) => setRegistrationForm({
                                  ...registrationForm,
                                  zapier_webhook_url: e.target.value
                                })}
                              />
                            </div>
                            
                            <Button 
                              onClick={handleRegister} 
                              className="w-full"
                              disabled={registering === workshop.id}
                            >
                              {registering === workshop.id ? "Registering..." : "Complete Registration"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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

export default VirtualWorkshops;