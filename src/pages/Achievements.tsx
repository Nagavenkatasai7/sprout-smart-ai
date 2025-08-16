import { useState, useEffect } from 'react';
import { Trophy, Star, Calendar, Target, Award, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  rarity: string;
  unlocked?: boolean;
  unlocked_at?: string;
  progress?: number;
}

interface UserStats {
  plants_grown: number;
  harvests_completed: number;
  programs_completed: number;
  diagnoses_performed: number;
  current_streak_days: number;
  best_streak_days: number;
  total_points: number;
  current_level: string;
  level_progress: number;
}

interface Certificate {
  id: string;
  program_id: string;
  certificate_data: any;
  issued_at: string;
  share_token: string;
}

const Achievements = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'stats' | 'certificates'>('achievements');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchAchievements();
      fetchUserStats();
      fetchCertificates();
    }
  }, [user, loading, navigate]);

  const fetchAchievements = async () => {
    try {
      // Get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Get user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user?.id);

      if (userError) throw userError;

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      
      const achievementsWithStatus = allAchievements?.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlocked_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
      })) || [];

      setAchievements(achievementsWithStatus);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('user_id', user?.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelInfo = (totalPoints: number) => {
    const levels = [
      { name: 'Seedling', min: 0, max: 100 },
      { name: 'Sprout', min: 100, max: 300 },
      { name: 'Young Plant', min: 300, max: 600 },
      { name: 'Blooming Gardener', min: 600, max: 1200 },
      { name: 'Expert Cultivator', min: 1200, max: 2500 },
      { name: 'Master Gardener', min: 2500, max: Infinity }
    ];

    const currentLevel = levels.find(level => totalPoints >= level.min && totalPoints < level.max) || levels[0];
    const progress = currentLevel.max === Infinity ? 100 : 
      ((totalPoints - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;

    return { currentLevel: currentLevel.name, progress: Math.min(progress, 100) };
  };

  const shareCertificate = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/certificate/${certificate.share_token}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Plant Growing Certificate',
          text: 'Check out my plant growing certificate!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentLevelInfo = userStats ? getLevelInfo(userStats.total_points) : null;

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
              <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{userStats?.total_points || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="text-lg font-bold">{currentLevelInfo?.currentLevel || 'Seedling'}</p>
                  {currentLevelInfo && (
                    <Progress value={currentLevelInfo.progress} className="mt-1" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{userStats?.current_streak_days || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'achievements', label: 'Achievements', icon: Trophy },
            { key: 'stats', label: 'Statistics', icon: Target },
            { key: 'certificates', label: 'Certificates', icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => setActiveTab(key as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`group transition-all duration-300 ${
                  achievement.unlocked ? 'border-green-200 bg-green-50/50' : 'opacity-75'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-300'
                      }`}>
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="default" className="bg-green-500">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {achievement.points} points
                    </span>
                    {achievement.unlocked_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'stats' && userStats && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growing Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Plants Grown:</span>
                  <span className="font-semibold">{userStats.plants_grown}</span>
                </div>
                <div className="flex justify-between">
                  <span>Harvests Completed:</span>
                  <span className="font-semibold">{userStats.harvests_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Programs Completed:</span>
                  <span className="font-semibold">{userStats.programs_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diagnoses Performed:</span>
                  <span className="font-semibold">{userStats.diagnoses_performed}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streak Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-semibold">{userStats.current_streak_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="font-semibold">{userStats.best_streak_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points:</span>
                  <span className="font-semibold">{userStats.total_points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Level:</span>
                  <span className="font-semibold">{userStats.current_level}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="group hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Program Certificate
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Issued: {new Date(certificate.issued_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => shareCertificate(certificate)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {certificates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete growing programs to earn certificates!
                </p>
                <Button onClick={() => navigate('/growing-programs')}>
                  Browse Programs
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;