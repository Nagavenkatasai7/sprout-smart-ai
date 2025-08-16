import { useState, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

interface Nursery {
  name: string;
  address: string;
  rating: number;
  coordinates: { lat: number; lng: number };
  specialties: string[];
}

export const LocationPicker = ({ onLocationSelect, selectedLocation }: LocationPickerProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyNurseries, setNearbyNurseries] = useState<Nursery[]>([]);
  const [showNurseries, setShowNurseries] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address
          const { data, error } = await supabase.functions.invoke('location-services', {
            body: {
              action: 'reverse_geocode',
              location: { lat: latitude, lng: longitude }
            }
          });

          if (error) throw error;

          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: data.address
          });

          toast({
            title: "Location found",
            description: "Your location has been set successfully.",
          });
        } catch (error) {
          console.error('Error getting address:', error);
          toast({
            title: "Error",
            description: "Failed to get address for your location.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: "Location error",
          description: "Unable to get your current location.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('location-services', {
        body: {
          action: 'geocode',
          query: searchQuery
        }
      });

      if (error) throw error;

      onLocationSelect({
        lat: data.coordinates.lat,
        lng: data.coordinates.lng,
        address: data.formatted_address
      });

      setSearchQuery('');
      toast({
        title: "Location found",
        description: "Location has been set successfully.",
      });
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Error",
        description: "Failed to find the specified location.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const findNearbyNurseries = async () => {
    if (!selectedLocation) {
      toast({
        title: "No location selected",
        description: "Please select a location first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('location-services', {
        body: {
          action: 'find_nurseries',
          location: selectedLocation
        }
      });

      if (error) throw error;
      
      setNearbyNurseries(data.nurseries || []);
      setShowNurseries(true);
      
      toast({
        title: "Nurseries found",
        description: `Found ${data.nurseries?.length || 0} nearby nurseries.`,
      });
    } catch (error) {
      console.error('Error finding nurseries:', error);
      toast({
        title: "Error",
        description: "Failed to find nearby nurseries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location */}
          <div className="flex gap-2">
            <Button 
              onClick={getCurrentLocation} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              Use Current Location
            </Button>
          </div>

          {/* Search Location */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button 
              onClick={searchLocation} 
              disabled={isLoading || !searchQuery.trim()}
              variant="outline"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Location */}
          {selectedLocation && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              <p className="text-xs text-muted-foreground">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Find Nurseries Button */}
          {selectedLocation && (
            <Button 
              onClick={findNearbyNurseries}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Find Nearby Nurseries
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Nearby Nurseries */}
      {showNurseries && nearbyNurseries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Nurseries ({nearbyNurseries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {nearbyNurseries.map((nursery, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{nursery.name}</h4>
                    {nursery.rating > 0 && (
                      <Badge variant="secondary">
                        ⭐ {nursery.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{nursery.address}</p>
                  {nursery.specialties && nursery.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {nursery.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};