import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, MessageCircle, Search, ChevronDown, ChevronRight, 
  Leaf, Camera, Brain, Calendar, Users, ShoppingCart, 
  Video, Package, DollarSign, Award, MapPin, Heart, 
  Scissors, Recycle, Eye, Bell, Play, Star, CheckCircle,
  Send, Bot, User, Sparkles, Zap, Crown, Globe, Shield,
  TrendingUp, Lightbulb, Gift, ArrowRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Documentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const documentationData = {
    overview: {
      title: "What is PlantCare AI?",
      content: `PlantCare AI is a comprehensive, AI-powered plant care platform designed to transform anyone into a successful gardener. Whether you're a complete beginner or an experienced horticulturist, our platform provides intelligent tools, expert guidance, and a supportive community to help your plants thrive.

Our mission is to make plant care accessible, enjoyable, and successful for everyone while building the world's largest plant care community.`
    },
    gettingStarted: {
      title: "Getting Started",
      content: `Welcome to PlantCare AI! Here's how to get the most out of our platform:

1. **Create Your Account**: Sign up for free to access all basic features
2. **Take a Photo**: Use our AI Plant Identification to identify any plant instantly
3. **Build Your Garden**: Save plants to your personal collection
4. **Set Up Care Reminders**: Let our AI create personalized care schedules
5. **Join the Community**: Connect with fellow plant enthusiasts
6. **Explore Premium Features**: Upgrade for advanced AI diagnostics and expert consultations

Your journey to becoming a plant care expert starts here!`
    },
    features: {
      title: "Core Features & Services",
      sections: [
        {
          id: "identification",
          title: "🔍 AI Plant Identification",
          description: "Instantly identify plants using advanced computer vision",
          features: [
            "99.2% accuracy rate with 10,000+ plant species",
            "Detailed plant information and care guides",
            "Disease and pest identification",
            "Growth stage recognition",
            "Offline mode available (Premium)"
          ],
          usage: "Simply take a photo or upload an image. Our AI analyzes leaf patterns, flowers, bark, and overall structure to provide accurate identification within seconds.",
          route: "/plant-identification"
        },
        {
          id: "garden",
          title: "🌱 My Garden Collection",
          description: "Organize and track all your plants in one place",
          features: [
            "Unlimited plant storage (Premium)",
            "Growth tracking with photos",
            "Care history and notes",
            "Health status monitoring",
            "Collection sharing with friends"
          ],
          usage: "Add plants to your collection after identification. Track their growth, log care activities, and monitor their health over time.",
          route: "/my-garden"
        },
        {
          id: "doctor",
          title: "🩺 Plant Doctor AI",
          description: "Advanced disease diagnosis and treatment recommendations",
          features: [
            "Disease identification from symptoms",
            "Treatment recommendations",
            "Pest identification and control",
            "Nutrient deficiency analysis",
            "Recovery progress tracking"
          ],
          usage: "Upload photos of sick plants and describe symptoms. Our AI diagnoses issues and provides step-by-step treatment plans.",
          route: "/plant-doctor"
        },
        {
          id: "calendar",
          title: "📅 Smart Care Calendar",
          description: "Automated care schedules based on your plants and location",
          features: [
            "Personalized watering schedules",
            "Fertilizing reminders",
            "Pruning and repotting alerts",
            "Seasonal care adjustments",
            "Weather-based recommendations"
          ],
          usage: "Set up your location and plant collection. The AI automatically creates optimized care schedules and sends timely reminders.",
          route: "/plant-calendar"
        },
        {
          id: "community",
          title: "👥 Community Features",
          description: "Connect, learn, and trade with fellow gardeners",
          features: [
            "Community marketplace for trading",
            "Plant transformation galleries",
            "Expert Q&A forums",
            "Local gardening groups",
            "Achievement system and challenges"
          ],
          usage: "Join discussions, share your plant journey, trade plants with others, and learn from experienced gardeners worldwide.",
          route: "/community-marketplace"
        }
      ]
    },
    premiumServices: {
      title: "Premium Services & Monetization",
      sections: [
        {
          id: "workshops",
          title: "🎓 Virtual Workshops & Masterclasses",
          description: "Learn from expert horticulturists through live and recorded sessions",
          offerings: [
            "Beginner Courses ($29-49): Plant care fundamentals",
            "Advanced Masterclasses ($99-199): Specialized techniques",
            "Specialty Workshops ($49-89): Propagation, hydroponics, bonsai",
            "Group Coaching ($149-299): Personal guidance with limited seats"
          ],
          benefits: [
            "Live interaction with experts",
            "Completion certificates",
            "Lifetime access to recordings",
            "Exclusive community access",
            "Follow-up support"
          ],
          route: "/virtual-workshops"
        },
        {
          id: "kits",
          title: "📦 Plant Care Kit Subscriptions",
          description: "Curated physical products delivered to your door",
          offerings: [
            "Beginner Kits ($24.99/month): Essential tools and supplies",
            "Seasonal Kits ($34.99/quarter): Season-specific plants and care",
            "Specialty Kits ($49.99/month): Advanced growing equipment",
            "Troubleshoot Kits ($19.99 one-time): Problem-solving supplies"
          ],
          benefits: [
            "Curated by plant experts",
            "Exclusive member pricing",
            "Detailed instruction guides",
            "Flexible delivery schedules",
            "Money-back guarantee"
          ],
          route: "/plant-care-kits"
        },
        {
          id: "affiliate",
          title: "🛒 Recommended Products",
          description: "Carefully selected products from trusted brands",
          categories: [
            "Essential Tools: Pruners, watering tools, soil meters",
            "Growing Supplies: Fertilizers, soil mixes, pots",
            "Lighting: Grow lights for indoor gardening",
            "Seeds & Plants: Premium varieties and rare species",
            "Books & Guides: Expert knowledge resources"
          ],
          benefits: [
            "Expert-tested recommendations",
            "Exclusive member discounts",
            "Quality guarantee",
            "Integration with plant care plans",
            "Customer reviews and ratings"
          ],
          route: "/affiliate-store"
        }
      ]
    },
    pricing: {
      title: "Pricing Plans",
      plans: [
        {
          name: "Basic",
          price: "$9.99/month",
          description: "Perfect for plant enthusiasts starting their journey",
          features: [
            "Save up to 50 plants",
            "Basic care reminders", 
            "Community forum access",
            "Plant identification (50/month)",
            "Basic plant calendar",
            "Email support"
          ],
          bestFor: "Beginners with small plant collections"
        },
        {
          name: "Premium",
          price: "$24.99/month", 
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
          bestFor: "Dedicated gardeners with growing collections",
          popular: true
        },
        {
          name: "Pro",
          price: "$49.99/month",
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
          bestFor: "Professional landscapers, nurseries, and plant businesses"
        }
      ]
    },
    valueProposition: {
      title: "Why Choose PlantCare AI?",
      benefits: [
        {
          icon: Brain,
          title: "Advanced AI Technology",
          description: "State-of-the-art machine learning models trained on millions of plant images and expert knowledge"
        },
        {
          icon: Users,
          title: "Expert Community",
          description: "Access to certified horticulturists, botanists, and experienced gardeners from around the world"
        },
        {
          icon: Zap,
          title: "Comprehensive Solution",
          description: "Everything you need in one platform - from identification to care to community"
        },
        {
          icon: Shield,
          title: "Proven Results",
          description: "Over 100,000 plants successfully identified with 99.2% accuracy rate"
        },
        {
          icon: Globe,
          title: "Global Coverage",
          description: "Works worldwide with localized care recommendations for your specific climate"
        },
        {
          icon: TrendingUp,
          title: "Continuous Learning",
          description: "Our AI improves daily, and new features are added monthly based on user feedback"
        }
      ]
    }
  };

  const navigationSections = [
    { id: 'overview', title: 'Overview', icon: Globe },
    { id: 'gettingStarted', title: 'Getting Started', icon: Play },
    { id: 'features', title: 'Core Features', icon: Zap },
    { id: 'premiumServices', title: 'Premium Services', icon: Crown },
    { id: 'pricing', title: 'Pricing Plans', icon: DollarSign },
    { id: 'valueProposition', title: 'Why Choose Us', icon: Star }
  ];

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('support-chat', {
        body: { 
          message: chatMessage,
          context: 'documentation',
          documentationData: JSON.stringify(documentationData)
        }
      });

      if (error) throw error;

      const assistantMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant' as const, 
        content: data.message || 'I apologize, but I encountered an error. Please try asking your question again.' 
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error. Please try asking your question again.' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const filteredContent = searchQuery 
    ? Object.entries(documentationData).filter(([key, value]) => 
        value.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('content' in value && typeof value.content === 'string' && value.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [[activeSection, documentationData[activeSection as keyof typeof documentationData]]];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← Back to App
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">PlantCare AI Documentation</h1>
              </div>
            </div>
            <Button onClick={() => setChatOpen(!chatOpen)} className="bg-gradient-primary">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask AI Assistant
            </Button>
          </div>
          
          {/* Search */}
          <div className="mt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {navigationSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveSection(section.id);
                        setSearchQuery('');
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {filteredContent.map(([key, section]) => {
                const sectionData = section as any; // Type assertion for dynamic content
                return (
                <Card key={key + '-card'}>
                  <CardHeader>
                    <CardTitle className="text-3xl">{sectionData.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overview and Getting Started */}
                    {(key === 'overview' || key === 'gettingStarted') && sectionData.content && (
                      <div className="prose max-w-none">
                        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                          {sectionData.content}
                        </p>
                      </div>
                    )}

                    {/* Features Section */}
                    {key === 'features' && sectionData.sections && (
                      <div className="space-y-6">
                        {sectionData.sections.map((feature: any) => (
                          <Collapsible key={feature.id}>
                            <CollapsibleTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-all">
                                <CardHeader className="pb-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                                      <CardDescription className="text-base mt-1">
                                        {feature.description}
                                      </CardDescription>
                                    </div>
                                    <ChevronDown className="h-5 w-5" />
                                  </div>
                                </CardHeader>
                              </Card>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <Card className="mt-2 border-l-4 border-l-primary">
                                <CardContent className="pt-6">
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-3">Features:</h4>
                                      <ul className="space-y-2">
                                        {feature.features.map((item, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3">How to Use:</h4>
                                      <p className="text-sm text-muted-foreground">{feature.usage}</p>
                                      <Button 
                                        className="mt-4" 
                                        onClick={() => navigate(feature.route)}
                                      >
                                        Try This Feature
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    )}

                    {/* Premium Services */}
                    {key === 'premiumServices' && sectionData.sections && (
                      <div className="space-y-6">
                        {sectionData.sections.map((service: any) => (
                          <Card key={service.id} className="border-primary/20">
                            <CardHeader>
                              <CardTitle className="text-xl">{service.title}</CardTitle>
                              <CardDescription className="text-base">
                                {service.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    {service.offerings ? 'Offerings:' : service.categories ? 'Categories:' : 'Features:'}
                                  </h4>
                                  <ul className="space-y-2">
                                    {(service.offerings || service.categories || []).map((item: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <DollarSign className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-3">Benefits:</h4>
                                  <ul className="space-y-2">
                                    {(service.benefits || []).map((item: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <Button 
                                    className="mt-4 bg-gradient-primary" 
                                    onClick={() => navigate(service.route)}
                                  >
                                    Explore {service.title.split(' ')[1]}
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Pricing Plans */}
                    {key === 'pricing' && sectionData.plans && (
                      <div className="grid md:grid-cols-3 gap-6">
                        {sectionData.plans.map((plan: any) => (
                          <Card 
                            key={plan.name}
                            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                          >
                            {plan.popular && (
                              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                                Most Popular
                              </Badge>
                            )}
                            <CardHeader className="text-center">
                              <CardTitle className="text-2xl">{plan.name}</CardTitle>
                              <div className="text-3xl font-bold text-primary">{plan.price}</div>
                              <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="text-xs text-muted-foreground mb-4">
                                <strong>Best for:</strong> {plan.bestFor}
                              </div>
                              <Button 
                                className="w-full" 
                                variant={plan.popular ? 'default' : 'outline'}
                                onClick={() => navigate('/pricing')}
                              >
                                Choose {plan.name}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Value Proposition */}
                    {key === 'valueProposition' && sectionData.benefits && (
                      <div className="grid md:grid-cols-2 gap-6">
                        {sectionData.benefits.map((benefit: any, index: number) => {
                          const Icon = benefit.icon;
                          return (
                            <Card key={index} className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                  <p className="text-muted-foreground">{benefit.description}</p>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-96 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-semibold">Documentation Assistant</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)}>
                ×
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatHistory.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm">
                    <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                    Hi! I'm your documentation assistant. Ask me anything about PlantCare AI features, pricing, or how to use the platform.
                  </div>
                )}
                
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about features, pricing, or usage..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !chatMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation;