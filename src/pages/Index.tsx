// Cache-busting comment: Updated 2024-08-16 22:05
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, Sparkles, Camera, BookOpen, Bell, Heart, LogIn, 
  Brain, Calendar, Users, ShoppingCart, Eye, MapPin, 
  Recycle, Trophy, ArrowRight, Star, Check, Play, 
  Smartphone, Globe, Shield, Zap, Award, TrendingUp,
  MessageCircle, Search, ChevronDown, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ImageUpload';
import { PlantIdentification } from '@/components/PlantIdentification';
import { useToast } from '@/hooks/use-toast';
import heroPlant from '@/assets/hero-plant.jpg';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Plant recognition demo state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [plantMatches, setPlantMatches] = useState<any[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const { toast } = useToast();

  const features = [
    {
      icon: Camera,
      title: "AI Plant Identification",
      description: "Instantly identify plants using advanced computer vision technology",
      route: "/plant-guide",
      badge: "Most Popular"
    },
    {
      icon: Brain,
      title: "Plant Doctor AI",
      description: "Diagnose plant diseases and get treatment recommendations",
      route: "/plant-doctor",
      badge: "AI Powered"
    },
    {
      icon: Calendar,
      title: "Smart Care Calendar",
      description: "Automated watering, fertilizing, and pruning schedules",
      route: "/plant-calendar",
      badge: "Premium"
    },
    {
      icon: BookOpen,
      title: "Growing Programs",
      description: "Step-by-step guides for growing specific plants successfully",
      route: "/growing-programs",
      badge: null
    },
    {
      icon: Users,
      title: "Community Marketplace",
      description: "Buy, sell, and trade plants with fellow gardeners",
      route: "/community-marketplace",
      badge: "New"
    },
    {
      icon: ShoppingCart,
      title: "Shopping Assistant",
      description: "Get personalized product recommendations for your garden",
      route: "/shopping-assistant",
      badge: null
    },
    {
      icon: Eye,
      title: "AR Garden Planner",
      description: "Visualize your garden layout using augmented reality",
      route: "/ar-garden",
      badge: "Coming Soon"
    },
    {
      icon: MapPin,
      title: "Regional Intelligence",
      description: "Localized growing tips based on your climate zone",
      route: "/regional-intelligence",
      badge: null
    },
    {
      icon: Recycle,
      title: "Sustainability Features",
      description: "Track your environmental impact and carbon footprint",
      route: "/sustainability-features",
      badge: "Eco-Friendly"
    },
    {
      icon: Trophy,
      title: "Achievements & Gamification",
      description: "Unlock badges and compete with other gardeners",
      route: "/achievements",
      badge: null
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Urban Gardener",
      content: "PlantCare AI transformed my black thumb into a green one! The plant identification is incredibly accurate.",
      rating: 5,
      avatar: "🌱"
    },
    {
      name: "Mike Chen",
      role: "Landscape Designer",
      content: "The AR garden planner is a game-changer for my business. Clients love visualizing their space.",
      rating: 5,
      avatar: "🌿"
    },
    {
      name: "Emma Davis",
      role: "Plant Enthusiast",
      content: "I've saved so many plants thanks to the disease diagnosis feature. It's like having a plant doctor in my pocket!",
      rating: 5,
      avatar: "🍃"
    }
  ];

  const stats = [
    { number: "100K+", label: "Plants Identified" },
    { number: "50K+", label: "Happy Users" },
    { number: "99.2%", label: "Accuracy Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  // Plant recognition demo handlers
  const handleImageSelect = async (file: File, previewUrl: string) => {
    setSelectedImage(previewUrl);
    setIsIdentifying(true);
    setPlantMatches([]);
    setSelectedPlant(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Call the identify-plant function
        const response = await fetch('/functions/v1/identify-plant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) {
          throw new Error('Failed to identify plant');
        }

        const data = await response.json();
        setPlantMatches(data.matches || []);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error identifying plant:', error);
      toast({
        title: "Identification failed",
        description: "Please try again with a clearer image.",
        variant: "destructive",
      });
      // Show mock data on error for demo purposes
      setPlantMatches([
        {
          name: 'Monstera Deliciosa',
          scientific_name: 'Monstera deliciosa',
          confidence: 92,
          description: 'Popular houseplant with distinctive split leaves.',
          care_level: 'Moderate',
          light_needs: 'Bright indirect light',
          watering_frequency: 'Every 7-10 days'
        }
      ]);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage("");
    setPlantMatches([]);
    setSelectedPlant(null);
    setIsIdentifying(false);
  };

  const handleSelectPlant = (plant: any) => {
    setSelectedPlant(plant);
  };

  const handlePlantSaved = () => {
    toast({
      title: "Plant saved!",
      description: "Add more plants to build your collection.",
    });
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
      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PlantCare AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Button variant="ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Features
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')}>
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>
                Reviews
              </Button>
              {user ? (
                <UserNav />
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="bg-gradient-primary hover:shadow-glow">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="px-4 py-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Features
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/pricing')}>
                  Pricing
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}>
                  Reviews
                </Button>
                {user ? (
                  <UserNav />
                ) : (
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                    <Button className="w-full bg-gradient-primary" onClick={() => navigate('/auth')}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Plant Care
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Transform Your
                  <span className="text-primary block">Garden Journey</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  From plant identification to disease diagnosis, our comprehensive AI platform helps you become the gardener you've always wanted to be.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
                  onClick={() => user ? document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/auth')}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {user ? 'Explore Features' : 'Start Free Trial'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-glow/30 rounded-full blur-3xl animate-pulse delay-1000" />
              <img 
                src={heroPlant} 
                alt="AI Plant Identification Demo" 
                className="relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-glow"
              />
              <div className="absolute top-8 right-8 bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-soft">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-foreground font-medium">AI Analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Zap className="h-3 w-3 mr-1" />
              Complete Platform
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Everything You Need for Plant Care
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools covers every aspect of plant care, from identification to advanced gardening techniques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group p-8 bg-card hover:shadow-glow transition-all duration-300 cursor-pointer border-border hover:border-primary/20"
                onClick={() => navigate(feature.route)}
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Learn more 
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Recognition Demo Section */}
      <section id="demo" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Camera className="h-3 w-3 mr-1" />
              Try It Now
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              See Plant Identification in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of any plant and watch our AI identify it instantly with detailed care information.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Upload Plant Photo</h3>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onClearImage={handleClearImage}
                />
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Identification Results</h3>
                {selectedImage ? (
                  <PlantIdentification
                    isLoading={isIdentifying}
                    matches={plantMatches}
                    onSelectPlant={handleSelectPlant}
                    selectedPlant={selectedPlant}
                    onPlantSaved={handlePlantSaved}
                  />
                ) : (
                  <Card className="p-8 bg-gradient-card text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-foreground">
                          Ready to Identify
                        </h4>
                        <p className="text-muted-foreground">
                          Upload a plant photo to see our AI identification in action
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Demo CTA */}
            <div className="text-center mt-12">
              <Card className="p-8 bg-gradient-primary text-primary-foreground">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Love what you see?</h4>
                  <p className="text-primary-foreground/80">
                    Sign up to save your identified plants and access all our premium features
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={() => navigate('/auth')}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get Started Free
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Heart className="h-3 w-3 mr-1" />
              Customer Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Loved by Plant Enthusiasts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of gardeners who've transformed their plant care journey with our AI platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-card">
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-foreground leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-primary-glow/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Award className="h-3 w-3 mr-1" />
              Start Today
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Ready to Transform Your Garden?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our community of successful gardeners and discover the power of AI-driven plant care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6"
                onClick={() => navigate('/pricing')}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">PlantCare AI</span>
              </div>
              <p className="text-muted-foreground">
                Transforming plant care with artificial intelligence.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/plant-guide')}>Plant Identification</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/plant-doctor')}>Disease Diagnosis</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/plant-calendar')}>Care Calendar</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/growing-programs')}>Growing Guides</Button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/community-marketplace')}>Marketplace</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/achievements')}>Achievements</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Help Center</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Contact</Button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/pricing')}>Pricing</Button></li>
                <li><Button variant="link" className="p-0 h-auto">About</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Privacy</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Terms</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 PlantCare AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;