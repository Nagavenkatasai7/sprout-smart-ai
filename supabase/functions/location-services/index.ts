import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOCATION-SERVICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const { action, location, query } = await req.json();
    const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    if (!googleMapsApiKey) {
      throw new Error("Google Maps API key not configured");
    }

    logStep("Processing request", { action, location: location?.lat ? 'provided' : 'missing' });

    switch (action) {
      case 'geocode':
        // Convert address to coordinates
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleMapsApiKey}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
          const result = geocodeData.results[0];
          return new Response(JSON.stringify({
            coordinates: result.geometry.location,
            formatted_address: result.formatted_address,
            components: result.address_components
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Address not found");

      case 'reverse_geocode':
        // Convert coordinates to address
        const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${googleMapsApiKey}`;
        const reverseResponse = await fetch(reverseUrl);
        const reverseData = await reverseResponse.json();
        
        if (reverseData.status === 'OK' && reverseData.results.length > 0) {
          return new Response(JSON.stringify({
            address: reverseData.results[0].formatted_address,
            components: reverseData.results[0].address_components
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Location not found");

      case 'find_nurseries':
        // Find nearby nurseries using Google Places API
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=50000&type=store&keyword=nursery garden center plants&key=${googleMapsApiKey}`;
        const placesResponse = await fetch(placesUrl);
        const placesData = await placesResponse.json();
        
        if (placesData.status === 'OK') {
          const nurseries = placesData.results.map((place: any) => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating || 0,
            coordinates: place.geometry.location,
            place_id: place.place_id,
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            specialties: ['General Nursery'], // Default, could be enhanced
            review_count: place.user_ratings_total || 0
          }));

          // Store in database for future reference
          for (const nursery of nurseries.slice(0, 10)) { // Limit to 10 to avoid quota issues
            try {
              await supabaseClient
                .from('nurseries')
                .insert({
                  name: nursery.name,
                  address: nursery.address,
                  phone: nursery.phone,
                  website: nursery.website,
                  specialties: nursery.specialties,
                  rating: nursery.rating,
                  review_count: nursery.review_count,
                  coordinates: nursery.coordinates,
                  region_id: null // Will need to be mapped later
                })
                .on('conflict', 'name')
                .ignore();
            } catch (error) {
              logStep("Error storing nursery", { name: nursery.name, error: error.message });
            }
          }

          return new Response(JSON.stringify({ nurseries }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Failed to find nurseries");

      case 'get_weather':
        // Get current weather using OpenWeatherMap API
        const openWeatherApiKey = Deno.env.get("OPENWEATHER_API_KEY");
        
        if (!openWeatherApiKey) {
          throw new Error("OpenWeather API key not configured");
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${openWeatherApiKey}&units=metric`;
        logStep("Fetching weather data", { url: weatherUrl.replace(openWeatherApiKey, 'API_KEY_HIDDEN') });
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        if (weatherResponse.ok) {
          const weather = {
            temperature: Math.round(weatherData.main.temp),
            humidity: weatherData.main.humidity,
            condition: weatherData.weather[0].main.toLowerCase().replace(' ', '_'),
            description: weatherData.weather[0].description,
            wind_speed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
            precipitation_chance: weatherData.clouds?.all || 0,
            uv_index: 5, // UV data requires separate API call in free tier
            feels_like: Math.round(weatherData.main.feels_like),
            pressure: weatherData.main.pressure,
            visibility: weatherData.visibility ? Math.round(weatherData.visibility / 1000) : null,
            location_name: weatherData.name
          };

          logStep("Weather data retrieved successfully", { temperature: weather.temperature, condition: weather.condition });
          
          return new Response(JSON.stringify({ weather }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          throw new Error(`Weather API error: ${weatherData.message || 'Unknown error'}`);
        }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});