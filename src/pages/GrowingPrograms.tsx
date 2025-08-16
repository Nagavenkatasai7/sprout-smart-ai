import { useState, useEffect } from 'react';
import { BookOpen, Clock, Trophy, Users, Video, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface GrowingProgram {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'tutorial' | 'guide' | 'tracking';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_days: number;
  steps: any[];
  plant_types: string[];
  season: string;
}

interface UserProgress {
  id: string;
  program_id: string;
  current_step: number;
  completed_steps: number[];
  started_at: string;
  completed_at?: string;
}

const GrowingPrograms = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<GrowingProgram[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'challenges' | 'tutorials' | 'guides'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchPrograms();
      fetchUserProgress();
    }
  }, [user, loading, navigate]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('growing_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms((data || []).map(item => ({
        ...item,
        type: item.type as 'challenge' | 'tutorial' | 'guide' | 'tracking',
        difficulty_level: item.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        steps: Array.isArray(item.steps) ? item.steps : []
      })));
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_program_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const startProgram = async (programId: string) => {
    if (!user) return;

    try {
      // Log activity
      await supabase.rpc('log_user_activity', {
        user_id_param: user.id,
        activity_type_param: 'program_started',
        entity_type_param: 'growing_program',
        entity_id_param: programId
      });

      const { error } = await supabase
        .from('user_program_progress')
        .insert({
          user_id: user.id,
          program_id: programId,
          current_step: 1,
          completed_steps: []
        });

      if (error) throw error;
      fetchUserProgress();
    } catch (error) {
      console.error('Error starting program:', error);
    }
  };

  const getProgramProgress = (programId: string) => {
    const progress = userProgress.find(p => p.program_id === programId);
    if (!progress) return null;
    
    const program = programs.find(p => p.id === programId);
    if (!program) return null;
    
    const completionPercentage = (progress.completed_steps.length / program.steps.length) * 100;
    return { ...progress, completionPercentage };
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Trophy className="h-4 w-4" />;
      case 'tutorial': return <Video className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'tracking': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredPrograms = programs.filter(program => {
    if (activeTab === 'all') return true;
    if (activeTab === 'challenges') return program.type === 'challenge';
    if (activeTab === 'tutorials') return program.type === 'tutorial';
    if (activeTab === 'guides') return program.type === 'guide';
    return true;
  });

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
              <h1 className="text-2xl font-bold text-foreground">Growing Programs</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Guided Growing Programs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join structured growing programs designed to guide you from seed to harvest. 
            Perfect for beginners and experienced gardeners alike.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {[
              { key: 'all', label: 'All Programs', icon: BookOpen },
              { key: 'challenges', label: 'Challenges', icon: Trophy },
              { key: 'tutorials', label: 'Tutorials', icon: Video },
              { key: 'guides', label: 'Guides', icon: BookOpen }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading programs...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const progress = getProgramProgress(program.id);
              const isEnrolled = progress !== null;

              return (
                <Card key={program.id} className="group hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(program.type)}
                        <Badge variant="outline" className="text-xs">
                          {program.type}
                        </Badge>
                      </div>
                      <Badge className={`${getDifficultyColor(program.difficulty_level)} text-white text-xs`}>
                        {program.difficulty_level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{program.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {program.duration_days} days
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {program.steps.length} steps
                      </div>
                    </div>

                    {program.plant_types && program.plant_types.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {program.plant_types.slice(0, 3).map((plant, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {plant}
                          </Badge>
                        ))}
                        {program.plant_types.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{program.plant_types.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {isEnrolled && progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(progress.completionPercentage)}%</span>
                        </div>
                        <Progress value={progress.completionPercentage} className="h-2" />
                        {progress.completed_at ? (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Step {progress.current_step} of {program.steps.length}
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => isEnrolled ? navigate(`/growing-programs/${program.id}`) : startProgram(program.id)}
                      variant={isEnrolled ? "default" : "outline"}
                    >
                      {isEnrolled ? 'Continue Program' : 'Start Program'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredPrograms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later for new programs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowingPrograms;