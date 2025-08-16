import { useState, useEffect } from 'react';
import { Calendar, Clock, Droplets, Scissors, Sun, MapPin, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  task_type: string;
  plant_name: string;
  scheduled_time: string;
  priority: string;
  completed: boolean;
  task_date: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  precipitation: number;
}

const PlantCalendar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchTasks();
      fetchCurrentLocation();
    }
  }, [user, loading, navigate]);

  const fetchTasks = async () => {
    if (!user) return;
    
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke('plant-calendar', {
        body: { action: 'get_tasks' }
      });

      if (error) throw error;
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchCurrentLocation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('plant-calendar', {
        body: { action: 'get_current_location' }
      });

      if (error) throw error;
      
      if (data.location) {
        setWeatherData({
          location: data.location.location_name,
          temperature: data.location.weather_data?.temperature || 22,
          condition: data.location.weather_data?.condition || 'clear',
          humidity: data.location.weather_data?.humidity || 65,
          precipitation: data.location.weather_data?.precipitation_chance || 10
        });
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { data, error } = await supabase.functions.invoke('plant-calendar', {
        body: { 
          action: 'update_task',
          taskId,
          taskData: { completed: !task.completed }
        }
      });

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: !t.completed, completed_at: data.task.completed_at }
          : t
      ));
      
      toast({
        title: task.completed ? "Task marked as pending" : "Task completed!",
        description: `${task.plant_name} ${task.task_type} ${task.completed ? 'marked as pending' : 'marked as done'}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const updateLocation = async () => {
    if (!location.trim()) {
      toast({
        title: "Please enter a location",
        description: "Enter your city or address to get weather updates",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingLocation(true);
    try {
      // First geocode the location
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('location-services', {
        body: {
          action: 'geocode',
          query: location.trim()
        }
      });

      if (geocodeError) throw geocodeError;

      // Save the location with coordinates
      const { data, error } = await supabase.functions.invoke('plant-calendar', {
        body: {
          action: 'save_location',
          locationData: {
            name: location.trim(),
            address: geocodeData.formatted_address,
            latitude: geocodeData.coordinates.lat,
            longitude: geocodeData.coordinates.lng
          }
        }
      });

      if (error) throw error;

      setWeatherData({
        location: location.trim(),
        temperature: data.weather?.temperature || 22,
        condition: data.weather?.condition || 'clear',
        humidity: data.weather?.humidity || 65,
        precipitation: data.weather?.precipitation_chance || 10
      });
      
      toast({
        title: "Location updated!",
        description: `Weather data loaded for ${location.trim()}`,
      });
      
      setLocation('');
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error updating location",
        description: "Please try again with a different location",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplets className="h-4 w-4" />;
      case 'fertilizing': return <Sun className="h-4 w-4" />;
      case 'pruning': return <Scissors className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const todaysTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.task_date === today;
  });

  const incompleteTasks = todaysTasks.filter(task => !task.completed);
  const completedTasks = todaysTasks.filter(task => task.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
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
              <h1 className="text-2xl font-bold text-foreground">Plant Care Calendar</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Tasks</span>
                  <Badge variant="outline">
                    {incompleteTasks.length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : incompleteTasks.length === 0 && completedTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tasks for today</h3>
                    <p className="text-muted-foreground">All caught up! Your plants are well cared for.</p>
                  </div>
                ) : (
                  <>
                    {/* Incomplete Tasks */}
                    {incompleteTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                          {getTaskIcon(task.task_type)}
                          <div>
                            <p className="font-medium">{task.plant_name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{task.task_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.scheduled_time}</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markTaskComplete(task.id)}
                            className="hover:bg-green-50 hover:border-green-300"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground border-t pt-4">
                          Completed Today ({completedTasks.length})
                        </h4>
                        {completedTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 opacity-75">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div className="line-through">
                                <p className="font-medium text-green-800">{task.plant_name}</p>
                                <p className="text-sm text-green-600 capitalize">{task.task_type}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markTaskComplete(task.id)}
                              className="hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Weather Alert */}
            <Card className={`${weatherData ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${weatherData ? 'text-blue-800' : 'text-orange-800'}`}>
                  <AlertCircle className="h-5 w-5" />
                  {weatherData ? 'Weather Update' : 'Weather Alert'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <div className="space-y-2">
                    <p className="text-blue-700 font-medium">
                      {weatherData.location}: {weatherData.temperature}°C, {weatherData.condition}
                    </p>
                    <p className="text-blue-600 text-sm">
                      Humidity: {weatherData.humidity}% | Precipitation: {weatherData.precipitation}%
                    </p>
                    <p className="text-blue-600 text-sm">
                      Perfect conditions for outdoor plant care today!
                    </p>
                  </div>
                ) : (
                  <p className="text-orange-700">
                    Set your location below to get personalized weather-based plant care recommendations.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location & Climate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Set your location to receive weather-based plant care recommendations
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your city or address..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && updateLocation()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={updateLocation}
                    disabled={isUpdatingLocation || !location.trim()}
                    variant="outline"
                  >
                    {isUpdatingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Location'
                    )}
                  </Button>
                </div>
                {weatherData && (
                  <div className="text-sm text-muted-foreground">
                    Current location: {weatherData.location}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCalendar;