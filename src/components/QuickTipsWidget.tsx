import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw, Clock } from "lucide-react";

interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty_level: string;
  season?: string;
  plant_types?: string[];
  image_url?: string;
}

const QuickTipsWidget = () => {
  const [currentTip, setCurrentTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyTip();
  }, []);

  const fetchDailyTip = async () => {
    setLoading(true);
    try {
      // Get a random tip from the database
      const { data, error } = await supabase
        .from("daily_tips")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      if (data && data.length > 0) {
        // Select a random tip
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrentTip(data[randomIndex]);
      }
    } catch (error) {
      console.error("Error fetching daily tip:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'watering': return 'bg-blue-500 text-white';
      case 'light': return 'bg-yellow-400 text-black';
      case 'fertilizing': return 'bg-green-600 text-white';
      case 'pruning': return 'bg-purple-500 text-white';
      case 'repotting': return 'bg-orange-500 text-white';
      case 'pest control': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Quick Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTip) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tips available right now</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Quick Tip
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDailyTip}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentTip.image_url && (
          <div className="aspect-video relative overflow-hidden rounded-md">
            <img
              src={currentTip.image_url}
              alt={currentTip.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-foreground mb-2">{currentTip.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentTip.content}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(currentTip.category)}>
            {currentTip.category}
          </Badge>
          <Badge className={getDifficultyColor(currentTip.difficulty_level)}>
            {currentTip.difficulty_level}
          </Badge>
          {currentTip.season && (
            <Badge variant="outline" className="capitalize">
              <Clock className="h-3 w-3 mr-1" />
              {currentTip.season}
            </Badge>
          )}
        </div>
        
        {currentTip.plant_types && currentTip.plant_types.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Good for:</span> {currentTip.plant_types.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickTipsWidget;