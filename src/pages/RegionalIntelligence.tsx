import { useState, useEffect } from 'react';
import { MapPin, Leaf, AlertTriangle, Building, Users, Search, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserNav } from '@/components/UserNav';
import { LocationPicker } from '@/components/LocationPicker';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Region {
  id: string;
  name: string;
  country: string;
  state_province: string;
  hardiness_zones: string[];
  climate_data: any;
}

interface NativePlant {
  id: string;
  plant_name: string;
  scientific_name: string;
  plant_type: string;
  bloom_time: string;
  mature_size: any;
  benefits: string[];
  care_instructions: string;
}

interface InvasiveSpecies {
  id: string;
  species_name: string;
  scientific_name: string;
  threat_level: string;
  description: string;
  identification_tips: string[];
  control_methods: string[];
}

interface Nursery {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  specialties: string[];
  rating: number;
}

interface GardeningClub {
  id: string;
  name: string;
  description: string;
  meeting_schedule: string;
  focus_areas: string[];
  membership_fee: number;
  member_count: number;
}

const RegionalIntelligence = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'native' | 'invasive' | 'nurseries' | 'clubs'>('native');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [nativePlants, setNativePlants] = useState<NativePlant[]>([]);
  const [invasiveSpecies, setInvasiveSpecies] = useState<InvasiveSpecies[]>([]);
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [gardeningClubs, setGardeningClubs] = useState<GardeningClub[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchRegions();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (selectedRegion) {
      fetchRegionalData();
    }
  }, [selectedRegion, activeTab]);

  useEffect(() => {
    if (userLocation) {
      fetchWeatherData();
    }
  }, [userLocation]);

  const fetchWeatherData = async () => {
    if (!userLocation) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('location-services', {
        body: {
          action: 'get_weather',
          location: userLocation
        }
      });

      if (error) throw error;
      setWeatherData(data.weather);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
      if (data && data.length > 0) {
        setSelectedRegion(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchRegionalData = async () => {
    if (!selectedRegion) return;

    try {
      switch (activeTab) {
        case 'native':
          const { data: plantsData, error: plantsError } = await supabase
            .from('native_plants')
            .select('*')
            .eq('region_id', selectedRegion)
            .order('plant_name');
          if (plantsError) throw plantsError;
          setNativePlants(plantsData || []);
          break;

        case 'invasive':
          const { data: invasiveData, error: invasiveError } = await supabase
            .from('invasive_species')
            .select('*')
            .eq('region_id', selectedRegion)
            .order('threat_level', { ascending: false });
          if (invasiveError) throw invasiveError;
          setInvasiveSpecies(invasiveData || []);
          break;

        case 'nurseries':
          const { data: nurseriesData, error: nurseriesError } = await supabase
            .from('nurseries')
            .select('*')
            .eq('region_id', selectedRegion)
            .order('rating', { ascending: false });
          if (nurseriesError) throw nurseriesError;
          setNurseries(nurseriesData || []);
          break;

        case 'clubs':
          const { data: clubsData, error: clubsError } = await supabase
            .from('gardening_clubs')
            .select('*')
            .eq('region_id', selectedRegion)
            .order('member_count', { ascending: false });
          if (clubsError) throw clubsError;
          setGardeningClubs(clubsData || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching regional data:', error);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNativePlants = nativePlants.filter(plant =>
    plant.plant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvasiveSpecies = invasiveSpecies.filter(species =>
    species.species_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNurseries = nurseries.filter(nursery =>
    nursery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nursery.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredClubs = gardeningClubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.focus_areas.some(area => 
      area.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
              <h1 className="text-2xl font-bold text-foreground">Regional Intelligence</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Local Gardening Intelligence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover native plants, avoid invasive species, find local nurseries, and connect with gardening communities in your area.
          </p>
        </div>

        {/* Location Services */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              variant={userLocation ? "secondary" : "default"}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {userLocation ? 'Change Location' : 'Set Your Location'}
            </Button>
            {userLocation && weatherData && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🌡️ {weatherData.temperature}°C</span>
                <span>💧 {weatherData.humidity}%</span>
                <span>☀️ UV {weatherData.uv_index}</span>
              </div>
            )}
          </div>
          
          {showLocationPicker && (
            <div className="max-w-2xl mx-auto mb-6">
              <LocationPicker 
                onLocationSelect={(location) => {
                  setUserLocation(location);
                  setShowLocationPicker(false);
                  toast({
                    title: "Location updated",
                    description: "Now finding relevant local information for your area.",
                  });
                }}
                selectedLocation={userLocation}
              />
            </div>
          )}
        </div>

        {/* Region Selection */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-medium mb-2">Select Your Region</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}, {region.state_province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Tabs with Location Context */}
        <div className="flex gap-2 mb-8 overflow-x-auto justify-center">
          {[
            { key: 'native', label: userLocation ? 'Local Native Plants' : 'Native Plants', icon: Leaf },
            { key: 'invasive', label: 'Invasive Species', icon: AlertTriangle },
            { key: 'nurseries', label: userLocation ? 'Nearby Nurseries' : 'Local Nurseries', icon: Building },
            { key: 'clubs', label: 'Gardening Clubs', icon: Users }
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

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'native' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNativePlants.map((plant) => (
              <Card key={plant.id} className="group hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{plant.plant_name}</CardTitle>
                  <p className="text-sm text-muted-foreground italic">{plant.scientific_name}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{plant.plant_type}</Badge>
                    {plant.bloom_time && (
                      <Badge variant="secondary">{plant.bloom_time}</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {plant.benefits && plant.benefits.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Benefits:</p>
                      <div className="flex flex-wrap gap-1">
                        {plant.benefits.slice(0, 3).map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plant.care_instructions && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {plant.care_instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredNativePlants.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No native plants found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different region or adjusting your search.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invasive' && (
          <div className="space-y-6">
            {filteredInvasiveSpecies.map((species) => (
              <Card key={species.id} className="border-destructive/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {species.species_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground italic">{species.scientific_name}</p>
                    </div>
                    <Badge className={getThreatLevelColor(species.threat_level)}>
                      {species.threat_level.toUpperCase()} THREAT
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm">{species.description}</p>

                  {species.identification_tips && species.identification_tips.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Identification Tips:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {species.identification_tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {species.control_methods && species.control_methods.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Control Methods:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {species.control_methods.map((method, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                            {method}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredInvasiveSpecies.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No invasive species data</h3>
                <p className="text-muted-foreground">
                  This region currently has no invasive species warnings or your search returned no results.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nurseries' && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredNurseries.map((nursery) => (
              <Card key={nursery.id} className="group hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {nursery.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{nursery.address}</p>
                    </div>
                    {nursery.rating && (
                      <Badge variant="secondary">
                        ⭐ {nursery.rating}/5
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {nursery.specialties && nursery.specialties.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {nursery.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {nursery.phone && (
                      <Button variant="outline" size="sm">
                        Call
                      </Button>
                    )}
                    {nursery.website && (
                      <Button variant="outline" size="sm">
                        Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNurseries.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No nurseries found</h3>
                <p className="text-muted-foreground">
                  No local nurseries found for this region or search term.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredClubs.map((club) => (
              <Card key={club.id} className="group hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {club.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{club.member_count} members</span>
                    {club.membership_fee && (
                      <span>${club.membership_fee}/year</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {club.description && (
                    <p className="text-sm text-muted-foreground">{club.description}</p>
                  )}

                  {club.meeting_schedule && (
                    <div>
                      <p className="text-sm font-medium">Meeting Schedule:</p>
                      <p className="text-sm text-muted-foreground">{club.meeting_schedule}</p>
                    </div>
                  )}

                  {club.focus_areas && club.focus_areas.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Focus Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {club.focus_areas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full">
                    Contact Club
                  </Button>
                </CardContent>
              </Card>
            ))}

            {filteredClubs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No gardening clubs found</h3>
                <p className="text-muted-foreground">
                  No local gardening clubs found for this region or search term.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalIntelligence;