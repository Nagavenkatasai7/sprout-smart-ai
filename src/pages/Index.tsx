import { useState } from 'react';
import { Leaf, Sparkles, Camera, BookOpen, Bell, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { PlantIdentification } from '@/components/PlantIdentification';
import heroPlant from '@/assets/hero-plant.jpg';

interface PlantMatch {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  careLevel: 'Beginner' | 'Intermediate' | 'Expert';
  lightNeeds: string;
  waterFrequency: string;
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantMatch | null>(null);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setUploadedImage(previewUrl);
    setShowResults(false);
    setSelectedPlant(null);
  };

  const handleIdentifyPlant = () => {
    setIsIdentifying(true);
    // Simulate API call
    setTimeout(() => {
      setIsIdentifying(false);
      setShowResults(true);
    }, 3000);
  };

  const handleSelectPlant = (plant: PlantMatch) => {
    setSelectedPlant(plant);
  };

  const handleClearImage = () => {
    setUploadedImage('');
    setShowResults(false);
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-background">
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
                  Upload a photo and get instant plant identification with personalized care schedules powered by AI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Identifying
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Plant Guide
                </Button>
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
      <section className="py-16 lg:py-24">
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
                
                {uploadedImage && !showResults && (
                  <div className="mt-6 text-center">
                    <Button 
                      size="lg"
                      onClick={handleIdentifyPlant}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Identify Plant
                    </Button>
                  </div>
                )}
              </div>

              <div>
                {(isIdentifying || showResults) && (
                  <PlantIdentification
                    isLoading={isIdentifying}
                    matches={[]}
                    onSelectPlant={handleSelectPlant}
                    selectedPlantId={selectedPlant?.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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