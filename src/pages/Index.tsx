import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, Camera, BookOpen, Bell, Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { PlantIdentification } from '@/components/PlantIdentification';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import heroPlant from '@/assets/hero-plant.jpg';

interface PlantMatch {
  name: string;
  scientific_name: string;
  confidence: number;
  description: string;
  care_level: 'Easy' | 'Moderate' | 'Difficult';
  light_needs: string;
  watering_frequency: string;
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResults, setIdentificationResults] = useState<PlantMatch[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantMatch | null>(null);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [identificationCount, setIdentificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkSubscription();
      getIdentificationCount();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke("check-subscription");
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const getIdentificationCount = async () => {
    if (!user) return;
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setIdentificationCount(count || 0);
    } catch (error) {
      console.error("Error getting identification count:", error);
    }
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    // Convert file to base64 for API
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIdentificationResults([]);
    setSelectedPlant(null);
  };

  const handleIdentifyPlant = async () => {
    if (!uploadedImage) return;

    // Check subscription limits
    if (!subscription?.subscribed && identificationCount >= 5) {
      navigate('/pricing');
      return;
    }
    
    setIsIdentifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('identify-plant', {
        body: { image: uploadedImage }
      });

      if (error) {
        throw error;
      }

      setIdentificationResults(data.matches || []);
      // Refresh count after successful identification
      getIdentificationCount();
    } catch (error) {
      console.error('Error identifying plant:', error);
      setIdentificationResults([]);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSelectPlant = (plant: PlantMatch) => {
    setSelectedPlant(plant);
  };

  const handleClearImage = () => {
    setUploadedImage('');
    setIdentificationResults([]);
    setSelectedPlant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">PlantCare AI</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <UserNav />
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-primary/20 hover:bg-primary/5"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Leaf className="h-6 w-6" />
                  <span className="font-medium">AI Plant Care Assistant</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Your Plants Deserve 
                  <span className="text-primary block">Perfect Care</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Upload a photo and get instant plant identification with personalized care schedules powered by Google Cloud Vision AI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Button 
                      size="lg" 
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                      onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Identifying
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-primary/20 hover:bg-primary/5"
                      onClick={() => navigate('/my-garden')}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      My Garden
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                      onClick={() => navigate('/auth')}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Get Started
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-primary/20 hover:bg-primary/5"
                      onClick={() => navigate('/auth')}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Sign Up Free
                    </Button>
                  </>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">AI Powered</h3>
                  <p className="text-xs text-muted-foreground">Advanced plant recognition</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">Smart Reminders</h3>
                  <p className="text-xs text-muted-foreground">Never miss watering again</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">Health Tracking</h3>
                  <p className="text-xs text-muted-foreground">Monitor plant wellness</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-up">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary-glow/30 rounded-full blur-3xl" />
              <img 
                src={heroPlant} 
                alt="Beautiful plant for identification" 
                className="relative z-10 w-full max-w-md mx-auto rounded-2xl shadow-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      {user && (
        <section id="upload-section" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Identify Your Plant
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take a clear photo of your plant and let our AI identify it instantly. We'll provide care instructions tailored to your specific plant.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  selectedImage={uploadedImage}
                  onClearImage={handleClearImage}
                />
                
                {uploadedImage && identificationResults.length === 0 && !isIdentifying && (
                  <div className="mt-6 text-center space-y-4">
                    {!subscription?.subscribed && (
                      <div className="text-sm text-muted-foreground">
                        Free plan: {identificationCount}/5 identifications this month
                      </div>
                    )}
                    <Button 
                      size="lg"
                      onClick={handleIdentifyPlant}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                      disabled={!subscription?.subscribed && identificationCount >= 5}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {!subscription?.subscribed && identificationCount >= 5 
                        ? "Upgrade to Continue" 
                        : "Identify Plant"
                      }
                    </Button>
                  </div>
                )}
              </div>

              <div>
                {(isIdentifying || identificationResults.length > 0) && (
                  <PlantIdentification
                    isLoading={isIdentifying}
                    matches={identificationResults}
                    onSelectPlant={handleSelectPlant}
                    selectedPlant={selectedPlant}
                    onPlantSaved={() => {
                      setIdentificationResults([]);
                      setSelectedPlant(null);
                      setUploadedImage('');
                      getIdentificationCount(); // Refresh count
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing CTA for non-subscribers */}
      {user && !subscription?.subscribed && (
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary-glow/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Unlock Unlimited Plant Care</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get unlimited plant identifications, advanced AI care guidance, and personalized recommendations.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/pricing')}
              className="bg-gradient-primary hover:shadow-glow"
            >
              View Pricing Plans
            </Button>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Why Choose Our Plant Care AI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of plant parents who've transformed their plant care with our intelligent assistant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "99% Accuracy",
                description: "Our AI recognizes over 10,000 plant species with exceptional precision."
              },
              {
                icon: Bell,
                title: "Smart Scheduling",
                description: "Automated care reminders based on your plant's specific needs and environment."
              },
              {
                icon: Heart,
                title: "Health Monitoring",
                description: "Track your plant's progress with photo comparisons and health scoring."
              },
              {
                icon: BookOpen,
                title: "Expert Knowledge",
                description: "Access to comprehensive plant care guides and troubleshooting tips."
              },
              {
                icon: Camera,
                title: "Instant Diagnosis",
                description: "Quick identification of plant problems and diseases from photos."
              },
              {
                icon: Leaf,
                title: "Growth Tracking",
                description: "Monitor your plant's development over time with progress analytics."
              }
            ].map((benefit, index) => (
              <Card key={index} className="p-6 bg-card shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-up">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;