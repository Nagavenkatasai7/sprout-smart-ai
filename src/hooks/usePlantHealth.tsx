import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PlantPhoto {
  id: string;
  plant_id: string;
  photo_url: string;
  caption?: string;
  photo_date: string;
  growth_milestone?: string;
  created_at: string;
}

interface PlantHealthData {
  health_status: string;
  last_watered?: string;
  last_fertilized?: string;
  growth_stage: string;
  notes?: string;
}

export function usePlantHealth(plantId?: string) {
  const { user } = useAuth();
  const [plantPhotos, setPlantPhotos] = useState<PlantPhoto[]>([]);
  const [healthData, setHealthData] = useState<PlantHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (plantId && user) {
      loadPlantData();
    }
  }, [plantId, user]);

  const loadPlantData = async () => {
    if (!plantId || !user) return;

    try {
      setLoading(true);
      
      // Load plant health data
      const { data: plantData, error: plantError } = await supabase
        .from('plants')
        .select('health_status, last_watered, last_fertilized, growth_stage, notes')
        .eq('id', plantId)
        .eq('user_id', user.id)
        .single();

      if (plantError) throw plantError;
      setHealthData(plantData);

      // Load plant photos
      const { data: photosData, error: photosError } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', plantId)
        .eq('user_id', user.id)
        .order('photo_date', { ascending: false });

      if (photosError) throw photosError;
      setPlantPhotos(photosData || []);

    } catch (error) {
      console.error('Error loading plant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPlantPhoto = async (
    file: File,
    caption?: string,
    growthMilestone?: string
  ) => {
    if (!plantId || !user) return null;

    try {
      // Upload image to Supabase Storage (you'll need to set this up)
      const fileExt = file.name.split('.').pop();
      const fileName = `${plantId}/${Date.now()}.${fileExt}`;
      
      // For now, we'll use a placeholder URL
      // In production, you'd upload to Supabase Storage
      const photoUrl = URL.createObjectURL(file);

      const { data, error } = await supabase
        .from('plant_photos')
        .insert({
          plant_id: plantId,
          user_id: user.id,
          photo_url: photoUrl,
          caption,
          growth_milestone: growthMilestone,
          photo_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setPlantPhotos(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const updateHealthData = async (updates: Partial<PlantHealthData>) => {
    if (!plantId || !user) return;

    try {
      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .eq('user_id', user.id);

      if (error) throw error;

      setHealthData(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating health data:', error);
    }
  };

  const calculateHealthScore = () => {
    if (!healthData) return 0;

    let score = 50; // Base score

    // Health status impact
    switch (healthData.health_status) {
      case 'healthy':
        score += 30;
        break;
      case 'needs_attention':
        score += 10;
        break;
      case 'sick':
        score -= 20;
        break;
    }

    // Recent care impact
    const now = new Date();
    if (healthData.last_watered) {
      const daysSinceWatered = Math.floor(
        (now.getTime() - new Date(healthData.last_watered).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceWatered <= 7) score += 10;
      else if (daysSinceWatered > 14) score -= 10;
    }

    if (healthData.last_fertilized) {
      const daysSinceFertilized = Math.floor(
        (now.getTime() - new Date(healthData.last_fertilized).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceFertilized <= 30) score += 10;
    }

    // Photo frequency impact
    const recentPhotos = plantPhotos.filter(photo => {
      const photoDate = new Date(photo.photo_date);
      const daysSincePhoto = Math.floor((now.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSincePhoto <= 7;
    });

    if (recentPhotos.length > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'needs_attention':
        return 'text-yellow-600 bg-yellow-100';
      case 'sick':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGrowthStageIcon = (stage: string) => {
    switch (stage) {
      case 'seedling':
        return '🌱';
      case 'vegetative':
        return '🌿';
      case 'flowering':
        return '🌸';
      case 'fruiting':
        return '🍅';
      case 'mature':
        return '🌳';
      default:
        return '🌱';
    }
  };

  return {
    plantPhotos,
    healthData,
    loading,
    uploadPlantPhoto,
    updateHealthData,
    calculateHealthScore,
    getHealthStatusColor,
    getGrowthStageIcon,
    refetch: loadPlantData,
  };
}