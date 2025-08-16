import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Leaf, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeasonalPlant {
  id: string;
  plant_name: string;
  scientific_name?: string;
  plant_type: string;
  planting_month: number;
  harvesting_month?: number;
  region?: string;
  climate_zone?: string;
  indoor_outdoor: string;
  care_difficulty: string;
  planting_tips?: string[];
  care_instructions?: string[];
  companion_plants?: string[];
  image_url?: string;
}

const SeasonalPlanting = () => {
  const [plants, setPlants] = useState<SeasonalPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<SeasonalPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [plantTypeFilter, setPlantTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchSeasonalPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [plants, selectedMonth, plantTypeFilter, locationFilter]);

  const fetchSeasonalPlants = async () => {
    try {
      const { data, error } = await supabase
        .from("seasonal_plants")
        .select("*")
        .order("planting_month")
        .order("plant_name");

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error("Error fetching seasonal plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlants = () => {
    let filtered = plants.filter(plant => plant.planting_month === selectedMonth);

    if (plantTypeFilter !== "all") {
      filtered = filtered.filter(plant => plant.plant_type.toLowerCase() === plantTypeFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(plant => plant.indoor_outdoor === locationFilter);
    }

    setFilteredPlants(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPlantTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vegetable': return 'bg-green-600 text-white';
      case 'herb': return 'bg-blue-500 text-white';
      case 'flower': return 'bg-pink-500 text-white';
      case 'fruit': return 'bg-orange-500 text-white';
      case 'houseplant': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCurrentSeasonMessage = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = Math.floor((currentMonth % 12) / 3);
    const seasons = ["Winter", "Spring", "Summer", "Fall"];
    return `It's ${seasons[currentSeason]}! Here's what you can plant this month.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            Seasonal Planting Calendar
          </h1>
          <p className="text-muted-foreground mb-4">
            Discover what to plant each month for the best growing success
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-primary font-medium">{getCurrentSeasonMessage()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={plantTypeFilter} onValueChange={setPlantTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Plant Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vegetable">Vegetables</SelectItem>
              <SelectItem value="herb">Herbs</SelectItem>
              <SelectItem value="flower">Flowers</SelectItem>
              <SelectItem value="fruit">Fruits</SelectItem>
              <SelectItem value="houseplant">Houseplants</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="indoor">Indoor</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center text-sm text-muted-foreground">
            {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''} for {months[selectedMonth - 1]}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading seasonal plants...</div>
        ) : filteredPlants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No plants found</h3>
              <p className="text-muted-foreground">
                Try selecting a different month or adjusting your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  {plant.image_url && (
                    <div className="aspect-video relative overflow-hidden rounded-md mb-3">
                      <img
                        src={plant.image_url}
                        alt={plant.plant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardTitle className="text-lg">{plant.plant_name}</CardTitle>
                  {plant.scientific_name && (
                    <CardDescription className="italic">
                      {plant.scientific_name}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPlantTypeColor(plant.plant_type)}>
                      {plant.plant_type}
                    </Badge>
                    <Badge className={getDifficultyColor(plant.care_difficulty)}>
                      {plant.care_difficulty}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      <MapPin className="h-3 w-3 mr-1" />
                      {plant.indoor_outdoor}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Plant:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {months[plant.planting_month - 1]}
                      </div>
                    </div>
                    {plant.harvesting_month && (
                      <div>
                        <span className="font-medium text-muted-foreground">Harvest:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {months[plant.harvesting_month - 1]}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {plant.region && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Best for:</span>
                      <span className="ml-1">{plant.region}</span>
                      {plant.climate_zone && (
                        <span className="text-muted-foreground"> • Zone {plant.climate_zone}</span>
                      )}
                    </div>
                  )}
                  
                  {plant.planting_tips && plant.planting_tips.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground text-sm">Planting Tips:</span>
                      <ul className="mt-1 space-y-1">
                        {plant.planting_tips.slice(0, 2).map((tip, index) => (
                          <li key={index} className="text-xs flex items-start gap-1">
                            <Leaf className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                        {plant.planting_tips.length > 2 && (
                          <li className="text-xs text-muted-foreground">
                            +{plant.planting_tips.length - 2} more tips
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {plant.companion_plants && plant.companion_plants.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground text-sm">Good companions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plant.companion_plants.slice(0, 3).map((companion, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {companion}
                          </Badge>
                        ))}
                        {plant.companion_plants.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plant.companion_plants.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalPlanting;