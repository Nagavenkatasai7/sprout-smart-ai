import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Leaf, 
  Calendar, 
  Trophy, 
  Bell, 
  Camera, 
  Heart, 
  Droplet, 
  Sun, 
  TrendingUp,
  Clock,
  Users,
  Star,
  Plus,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  totalPlants: number;
  healthyPlants: number;
  plantsNeedingCare: number;
  totalAchievements: number;
  upcomingTasks: number;
  recentActivity: number;
}

interface PlantTask {
  id: string;
  plant_name: string;
  task_type: string;
  task_date: string;
  priority: string;
}

interface RecentPlant {
  id: string;
  plant_name: string;
  health_status: string;
  image_url?: string;
  created_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  unlocked_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlants: 0,
    healthyPlants: 0,
    plantsNeedingCare: 0,
    totalAchievements: 0,
    upcomingTasks: 0,
    recentActivity: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<PlantTask[]>([]);
  const [recentPlants, setRecentPlants] = useState<RecentPlant[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadUpcomingTasks(),
        loadRecentPlants(),
        loadRecentAchievements(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const [plantsResult, tasksResult, achievementsResult] = await Promise.all([
      supabase.from('plants').select('health_status').eq('user_id', user?.id),
      supabase.from('plant_calendar_tasks').select('*').eq('user_id', user?.id).eq('completed', false),
      supabase.from('user_achievements').select('*').eq('user_id', user?.id),
    ]);

    const plants = plantsResult.data || [];
    const tasks = tasksResult.data || [];
    const achievements = achievementsResult.data || [];

    setStats({
      totalPlants: plants.length,
      healthyPlants: plants.filter(p => p.health_status === 'healthy').length,
      plantsNeedingCare: plants.filter(p => p.health_status !== 'healthy').length,
      totalAchievements: achievements.length,
      upcomingTasks: tasks.length,
      recentActivity: tasks.filter(t => new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    });
  };

  const loadUpcomingTasks = async () => {
    const { data } = await supabase
      .from('plant_calendar_tasks')
      .select('*')
      .eq('user_id', user?.id)
      .eq('completed', false)
      .gte('task_date', new Date().toISOString().split('T')[0])
      .order('task_date', { ascending: true })
      .limit(5);

    if (data) {
      setUpcomingTasks(data);
    }
  };

  const loadRecentPlants = async () => {
    const { data } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(4);

    if (data) {
      setRecentPlants(data);
    }
  };

  const loadRecentAchievements = async () => {
    const { data } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements:achievement_id (
          name,
          description,
          badge_icon
        )
      `)
      .eq('user_id', user?.id)
      .order('unlocked_at', { ascending: false })
      .limit(3);

    if (data) {
      setRecentAchievements(data.map(ua => ({
        id: ua.id,
        name: ua.achievements?.name || 'Achievement',
        description: ua.achievements?.description || '',
        badge_icon: ua.achievements?.badge_icon || '🏆',
        unlocked_at: ua.unlocked_at,
      })));
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50';
      case 'sick': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back! 🌱</h1>
          <p className="text-muted-foreground">Here's what's happening in your garden</p>
        </div>
        <Button onClick={() => navigate('/plant-identification')}>
          <Camera className="mr-2 h-4 w-4" />
          Add Plant
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlants}</div>
            <p className="text-xs text-muted-foreground">
              {stats.healthyPlants} healthy, {stats.plantsNeedingCare} need care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Activities this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Don't forget to take care of your plants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.plant_name}</p>
                    <p className="text-sm text-muted-foreground">{task.task_type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(task.task_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming tasks</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/plant-calendar')}
                >
                  Schedule a task
                </Button>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/plant-calendar')}
              >
                View All Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Plants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Recent Plants
            </CardTitle>
            <CardDescription>Your latest garden additions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPlants.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recentPlants.map((plant) => (
                  <div key={plant.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                       onClick={() => navigate('/my-garden')}>
                    <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                      {plant.image_url ? (
                        <img src={plant.image_url} alt={plant.plant_name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Leaf className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{plant.plant_name}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getHealthStatusColor(plant.health_status)}`}
                    >
                      {plant.health_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No plants yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/plant-identification')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first plant
                </Button>
              </div>
            )}
            {recentPlants.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/my-garden')}
              >
                View All Plants
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">{achievement.badge_icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet</p>
                <p className="text-xs">Complete tasks to earn badges!</p>
              </div>
            )}
            {recentAchievements.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/achievements')}
              >
                View All Achievements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/plant-identification')}
            >
              <Camera className="mr-2 h-4 w-4" />
              Identify a Plant
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/plant-doctor')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Diagnose Plant Issues
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/community-marketplace')}
            >
              <Users className="mr-2 h-4 w-4" />
              Explore Community
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/plant-wishlist')}
            >
              <Star className="mr-2 h-4 w-4" />
              Manage Wishlist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}