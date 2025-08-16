import { useState } from 'react';
import { Leaf, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ImageUpload';
import { PlantIdentification } from '@/components/PlantIdentification';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PlantIdentificationPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // Plant identification state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [plantMatches, setPlantMatches] = useState<any[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

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
        
        // Call the identify-plant function using Supabase
        const { data, error } = await supabase.functions.invoke('identify-plant', {
          body: { image: base64 },
        });

        if (error) {
          throw error;
        }

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
          name: 'Plant Species',
          scientific_name: 'Analysis incomplete',
          confidence: 75,
          description: 'We detected a plant but need a clearer image for accurate identification.',
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
      description: "Plant added to your collection successfully.",
    });
    // Clear the form after saving
    handleClearImage();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">PlantCare AI</span>
            </div>
          </div>
          <UserNav />
        </div>
      </nav>

      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Camera className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Plant Identification
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload a photo of any plant and let our advanced AI identify it instantly. Get detailed care information and add it to your collection.
            </p>
          </div>

          {/* Plant Identification Interface */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-card">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Upload Plant Photo</h3>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                    onClearImage={handleClearImage}
                  />
                </Card>

                {/* Tips Card */}
                <Card className="p-6 bg-gradient-card">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Tips for Best Results</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Use good lighting - natural light works best</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Include leaves, flowers, or distinctive features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Keep the plant in focus and fill the frame</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>Avoid blurry or heavily filtered images</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-card">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Identification Results</h3>
                  {selectedImage ? (
                    <PlantIdentification
                      isLoading={isIdentifying}
                      matches={plantMatches}
                      onSelectPlant={handleSelectPlant}
                      selectedPlant={selectedPlant}
                      onPlantSaved={handlePlantSaved}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Ready to Identify
                      </h4>
                      <p className="text-muted-foreground">
                        Upload a plant photo to get started with AI identification
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlantIdentificationPage;