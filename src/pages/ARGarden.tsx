import { useState, useEffect, useRef } from 'react';
import { Camera, Scan, RotateCcw, Download, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  mature_size: {
    height: number;
    width: number;
  };
  growth_stages: {
    seedling: { weeks: number; height: number };
    vegetative: { weeks: number; height: number };
    flowering: { weeks: number; height: number };
    mature: { weeks: number; height: number };
  };
}

const ARGarden = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [arMode, setArMode] = useState<'placement' | 'growth' | 'size'>('placement');
  const [currentGrowthStage, setCurrentGrowthStage] = useState(0);
  const [placedPlants, setPlacedPlants] = useState<Array<{
    id: string;
    plant: Plant;
    x: number;
    y: number;
    stage: number;
  }>>([]);

  // Sample plant data - in a real app, this would come from your database
  const samplePlants: Plant[] = [
    {
      id: '1',
      name: 'Tomato',
      scientific_name: 'Solanum lycopersicum',
      mature_size: { height: 150, width: 60 },
      growth_stages: {
        seedling: { weeks: 2, height: 10 },
        vegetative: { weeks: 6, height: 50 },
        flowering: { weeks: 8, height: 100 },
        mature: { weeks: 12, height: 150 }
      }
    },
    {
      id: '2',
      name: 'Sunflower',
      scientific_name: 'Helianthus annuus',
      mature_size: { height: 200, width: 40 },
      growth_stages: {
        seedling: { weeks: 1, height: 5 },
        vegetative: { weeks: 4, height: 80 },
        flowering: { weeks: 8, height: 150 },
        mature: { weeks: 12, height: 200 }
      }
    },
    {
      id: '3',
      name: 'Basil',
      scientific_name: 'Ocimum basilicum',
      mature_size: { height: 60, width: 40 },
      growth_stages: {
        seedling: { weeks: 1, height: 5 },
        vegetative: { weeks: 4, height: 30 },
        flowering: { weeks: 8, height: 50 },
        mature: { weeks: 10, height: 60 }
      }
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const startAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsARActive(true);
      toast.success('AR camera activated!');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopAR = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
    setPlacedPlants([]);
  };

  const placePlant = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!selectedPlant || !isARActive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPlant = {
      id: Date.now().toString(),
      plant: selectedPlant,
      x,
      y,
      stage: currentGrowthStage
    };

    setPlacedPlants(prev => [...prev, newPlant]);
    toast.success(`${selectedPlant.name} placed in AR space!`);
  };

  const getPlantHeight = (plant: Plant, stage: number) => {
    const stages = Object.values(plant.growth_stages);
    return stages[stage]?.height || 0;
  };

  const getStageWeeks = (plant: Plant, stage: number) => {
    const stages = Object.values(plant.growth_stages);
    return stages[stage]?.weeks || 0;
  };

  const getStageName = (stage: number) => {
    const stageNames = ['Seedling', 'Vegetative', 'Flowering', 'Mature'];
    return stageNames[stage] || 'Unknown';
  };

  const captureAR = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Here you would overlay the AR elements
        // For now, we'll just capture the video frame
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'ar-garden-preview.png';
        link.href = dataUrl;
        link.click();
        
        toast.success('AR preview captured!');
      }
    }
  };

  const shareARPreview = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AR Garden Preview',
          text: 'Check out how my plants will look in this space!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
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
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary/80"
              >
                ← Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-foreground">AR Garden</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Augmented Reality Garden</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visualize how your plants will look in your space with our AR technology. 
            See mature plant sizes, growth stages, and plan your garden layout.
          </p>
        </div>

        {/* Controls */}
        {!isARActive ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  See It Grow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize how your plants will look when fully grown in your actual space.
                </p>
                <Button onClick={startAR} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Start AR Camera
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Virtual Placement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Place virtual plants in your space to see how they fit before buying.
                </p>
                <Select 
                  value={selectedPlant?.id || ''} 
                  onValueChange={(value) => {
                    const plant = samplePlants.find(p => p.id === value);
                    setSelectedPlant(plant || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePlants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  See time-lapse predictions of how your plants will grow over time.
                </p>
                <Select 
                  value={currentGrowthStage.toString()} 
                  onValueChange={(value) => setCurrentGrowthStage(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Seedling</SelectItem>
                    <SelectItem value="1">Vegetative</SelectItem>
                    <SelectItem value="2">Flowering</SelectItem>
                    <SelectItem value="3">Mature</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex gap-4 items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={stopAR}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Stop AR
                </Button>
                <Button variant="outline" onClick={captureAR}>
                  <Download className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={shareARPreview}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {selectedPlant && (
                <div className="text-sm text-muted-foreground">
                  Click to place: {selectedPlant.name} ({getStageName(currentGrowthStage)})
                </div>
              )}
            </div>
          </div>
        )}

        {/* AR Display */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-8" style={{ height: '60vh' }}>
          {isARActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onClick={placePlant}
                style={{ cursor: selectedPlant ? 'crosshair' : 'default' }}
              />
              
              {/* AR Overlays */}
              {placedPlants.map((placedPlant) => (
                <div
                  key={placedPlant.id}
                  className="absolute"
                  style={{
                    left: `${placedPlant.x}%`,
                    top: `${placedPlant.y}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  {/* Virtual Plant Representation */}
                  <div className="relative">
                    <div
                      className="bg-green-500 opacity-70 rounded-full"
                      style={{
                        width: `${Math.max(20, placedPlant.plant.mature_size.width / 5)}px`,
                        height: `${Math.max(30, getPlantHeight(placedPlant.plant, placedPlant.stage) / 2)}px`,
                      }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {placedPlant.plant.name}
                      <br />
                      {getPlantHeight(placedPlant.plant, placedPlant.stage)}cm
                    </div>
                  </div>
                </div>
              ))}
              
              {/* AR Instructions */}
              {selectedPlant && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4" />
                    Tap anywhere to place {selectedPlant.name}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">AR Camera Not Active</p>
                <p className="text-sm opacity-75">Click "Start AR Camera" to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Plant Information Panel */}
        {selectedPlant && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedPlant.name} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Scientific Name</p>
                  <p className="text-sm text-muted-foreground">{selectedPlant.scientific_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Mature Size</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlant.mature_size.height}cm H × {selectedPlant.mature_size.width}cm W
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Stage</p>
                  <p className="text-sm text-muted-foreground">
                    {getStageName(currentGrowthStage)} ({getPlantHeight(selectedPlant, currentGrowthStage)}cm)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Time to Maturity</p>
                  <p className="text-sm text-muted-foreground">
                    {getStageWeeks(selectedPlant, currentGrowthStage)} weeks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ARGarden;