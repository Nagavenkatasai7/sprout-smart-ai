import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PLANT-CALENDAR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    logStep("User authenticated", { userId: user.id });

    const { action, taskData, taskId, locationData } = await req.json();

    switch (action) {
      case 'get_tasks':
        const { data: tasks, error: tasksError } = await supabaseClient
          .from('plant_calendar_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('task_date', { ascending: true });

        if (tasksError) throw tasksError;

        logStep("Tasks retrieved", { count: tasks?.length || 0 });
        
        return new Response(JSON.stringify({ tasks }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'create_task':
        if (!taskData) throw new Error('Task data required');

        const newTask = {
          user_id: user.id,
          task_type: taskData.type,
          plant_name: taskData.plant,
          scheduled_time: taskData.time,
          priority: taskData.priority || 'medium',
          task_date: taskData.date,
          notes: taskData.notes || null
        };

        const { data: createdTask, error: createError } = await supabaseClient
          .from('plant_calendar_tasks')
          .insert(newTask)
          .select()
          .single();

        if (createError) throw createError;

        // Log activity
        await supabaseClient.rpc('log_user_activity', {
          user_id_param: user.id,
          activity_type_param: 'task_created',
          entity_type_param: 'plant_calendar_task',
          entity_id_param: createdTask.id,
          activity_data_param: JSON.stringify({ task_type: taskData.type, plant: taskData.plant })
        });

        logStep("Task created", { taskId: createdTask.id, type: taskData.type });

        return new Response(JSON.stringify({ task: createdTask }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'update_task':
        if (!taskId) throw new Error('Task ID required');

        const updateData: any = {};
        if (taskData.completed !== undefined) {
          updateData.completed = taskData.completed;
          updateData.completed_at = taskData.completed ? new Date().toISOString() : null;
        }
        if (taskData.notes !== undefined) updateData.notes = taskData.notes;
        if (taskData.priority) updateData.priority = taskData.priority;

        const { data: updatedTask, error: updateError } = await supabaseClient
          .from('plant_calendar_tasks')
          .update(updateData)
          .eq('id', taskId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log activity
        await supabaseClient.rpc('log_user_activity', {
          user_id_param: user.id,
          activity_type_param: taskData.completed ? 'task_completed' : 'task_updated',
          entity_type_param: 'plant_calendar_task',
          entity_id_param: taskId,
          activity_data_param: JSON.stringify(updateData)
        });

        logStep("Task updated", { taskId, completed: taskData.completed });

        return new Response(JSON.stringify({ task: updatedTask }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'delete_task':
        if (!taskId) throw new Error('Task ID required');

        const { error: deleteError } = await supabaseClient
          .from('plant_calendar_tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Log activity
        await supabaseClient.rpc('log_user_activity', {
          user_id_param: user.id,
          activity_type_param: 'task_deleted',
          entity_type_param: 'plant_calendar_task',
          entity_id_param: taskId
        });

        logStep("Task deleted", { taskId });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'save_location':
        if (!locationData) throw new Error('Location data required');

        // Set all other locations as not current
        await supabaseClient
          .from('user_locations')
          .update({ is_current: false })
          .eq('user_id', user.id);

        // Save new location as current
        const { data: savedLocation, error: locationError } = await supabaseClient
          .from('user_locations')
          .insert({
            user_id: user.id,
            location_name: locationData.name,
            formatted_address: locationData.address,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            is_current: true
          })
          .select()
          .single();

        if (locationError) throw locationError;

        // Get weather data for the location
        const weatherResponse = await supabaseClient.functions.invoke('location-services', {
          body: {
            action: 'get_weather',
            location: {
              lat: locationData.latitude,
              lng: locationData.longitude
            }
          }
        });

        if (weatherResponse.data && !weatherResponse.error) {
          // Update location with weather data
          await supabaseClient
            .from('user_locations')
            .update({
              weather_data: weatherResponse.data.weather,
              last_weather_update: new Date().toISOString()
            })
            .eq('id', savedLocation.id);
        }

        // Log activity
        await supabaseClient.rpc('log_user_activity', {
          user_id_param: user.id,
          activity_type_param: 'location_updated',
          entity_type_param: 'user_location',
          entity_id_param: savedLocation.id,
          activity_data_param: JSON.stringify({ location: locationData.name })
        });

        logStep("Location saved", { locationId: savedLocation.id, name: locationData.name });

        return new Response(JSON.stringify({ 
          location: savedLocation, 
          weather: weatherResponse.data?.weather 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case 'get_current_location':
        const { data: currentLocation, error: locError } = await supabaseClient
          .from('user_locations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_current', true)
          .maybeSingle();

        if (locError) throw locError;

        // If we have a location but weather data is stale (older than 1 hour), refresh it
        if (currentLocation && currentLocation.last_weather_update) {
          const lastUpdate = new Date(currentLocation.last_weather_update);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (lastUpdate < oneHourAgo) {
            const weatherResponse = await supabaseClient.functions.invoke('location-services', {
              body: {
                action: 'get_weather',
                location: {
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude
                }
              }
            });

            if (weatherResponse.data && !weatherResponse.error) {
              await supabaseClient
                .from('user_locations')
                .update({
                  weather_data: weatherResponse.data.weather,
                  last_weather_update: new Date().toISOString()
                })
                .eq('id', currentLocation.id);

              currentLocation.weather_data = weatherResponse.data.weather;
            }
          }
        }

        logStep("Current location retrieved", { 
          hasLocation: !!currentLocation, 
          hasWeather: !!currentLocation?.weather_data 
        });

        return new Response(JSON.stringify({ location: currentLocation }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

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