import { useState, useEffect } from 'react';
import { Plus, Camera, BookOpen, Trash2, Edit, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Plant {
  id: string;
  plant_name: string;
  scientific_name?: string;
  image_url?: string;
  difficulty_level?: string;
  confidence_score?: number;
  light_requirements?: string;
  watering_frequency?: number;
  care_instructions?: any;
  created_at: string;
  identified_at: string;
}

const MyGarden = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchUserPlants();
    }
  }, [user, loading, navigate]);

  const fetchUserPlants = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'difficult': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">My Garden</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Plant Collection</h2>
            <p className="text-muted-foreground">
              {plants.length} plant{plants.length !== 1 ? 's' : ''} in your virtual garden
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/plant-matchmaker')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Find Perfect Plant
            </Button>
            <Button 
              onClick={() => navigate('/plant-identification')}
              className="bg-gradient-primary"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add New Plant
            </Button>
          </div>
        </div>

        {/* Garden Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{plants.length}</div>
              <p className="text-sm text-muted-foreground">Total Plants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {plants.filter(p => p.difficulty_level?.toLowerCase() === 'easy').length}
              </div>
              <p className="text-sm text-muted-foreground">Easy Care</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {plants.filter(p => p.difficulty_level?.toLowerCase() === 'moderate').length}
              </div>
              <p className="text-sm text-muted-foreground">Moderate Care</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {plants.filter(p => p.difficulty_level?.toLowerCase() === 'difficult').length}
              </div>
              <p className="text-sm text-muted-foreground">Challenging</p>
            </CardContent>
          </Card>
        </div>

        {/* Plant Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your garden...</p>
          </div>
        ) : plants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Start Your Garden</h3>
                <p className="text-muted-foreground">
                  Add your first plant by taking a photo and identifying it with our AI.
                </p>
                <Button 
                  onClick={() => navigate('/plant-identification')}
                  className="bg-gradient-primary"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Identify Your First Plant
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <Card key={plant.id} className="group hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{plant.plant_name}</CardTitle>
                      {plant.scientific_name && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          {plant.scientific_name}
                        </p>
                      )}
                    </div>
                    {plant.difficulty_level && (
                      <Badge className={`${getDifficultyColor(plant.difficulty_level)} text-white text-xs`}>
                        {plant.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plant.image_url && (
                    <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                      <img 
                        src={plant.image_url} 
                        alt={plant.plant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Plant Details */}
                  <div className="space-y-3">
                    {plant.confidence_score && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{Math.round(plant.confidence_score * 100)}%</span>
                      </div>
                    )}
                    
                    {plant.light_requirements && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Light: </span>
                        <span className="font-medium">{plant.light_requirements}</span>
                      </div>
                    )}
                    
                    {plant.watering_frequency && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Watering: </span>
                        <span className="font-medium">Every {plant.watering_frequency} days</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-3 w-3 mr-1" />
                      Log Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Care Guide
                    </Button>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Progress
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Journal
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Added {new Date(plant.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGarden;