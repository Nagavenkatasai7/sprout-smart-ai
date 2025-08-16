import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Calendar,
  Droplet,
  Heart,
  TrendingUp,
  Upload,
  Star,
  Sprout,
  Image as ImageIcon,
} from 'lucide-react';
import { usePlantHealth } from '@/hooks/usePlantHealth';
import { formatDistanceToNow } from 'date-fns';

interface PlantHealthTrackerProps {
  plantId: string;
  plantName: string;
}

export function PlantHealthTracker({ plantId, plantName }: PlantHealthTrackerProps) {
  const {
    plantPhotos,
    healthData,
    loading,
    uploadPlantPhoto,
    updateHealthData,
    calculateHealthScore,
    getHealthStatusColor,
    getGrowthStageIcon,
  } = usePlantHealth(plantId);

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoForm, setPhotoForm] = useState({
    caption: '',
    milestone: '',
  });

  const [healthForm, setHealthForm] = useState({
    health_status: healthData?.health_status || 'healthy',
    growth_stage: healthData?.growth_stage || 'seedling',
    notes: healthData?.notes || '',
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      await uploadPlantPhoto(file, photoForm.caption, photoForm.milestone);
      setPhotoDialogOpen(false);
      setPhotoForm({ caption: '', milestone: '' });
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleHealthUpdate = async () => {
    await updateHealthData(healthForm);
    setHealthDialogOpen(false);
  };

  const markAsWatered = async () => {
    await updateHealthData({ last_watered: new Date().toISOString().split('T')[0] });
  };

  const markAsFertilized = async () => {
    await updateHealthData({ last_fertilized: new Date().toISOString().split('T')[0] });
  };

  const healthScore = calculateHealthScore();

  if (loading) {
    return <PlantHealthTrackerSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Plant Health Score
              </CardTitle>
              <CardDescription>Overall health indicator for {plantName}</CardDescription>
            </div>
            <Dialog open={healthDialogOpen} onOpenChange={setHealthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Update Health
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Plant Health</DialogTitle>
                  <DialogDescription>
                    Record the current health status and growth stage of your plant
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="health_status">Health Status</Label>
                    <Select
                      value={healthForm.health_status}
                      onValueChange={(value) => setHealthForm(prev => ({ ...prev, health_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="needs_attention">Needs Attention</SelectItem>
                        <SelectItem value="sick">Sick</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="growth_stage">Growth Stage</Label>
                    <Select
                      value={healthForm.growth_stage}
                      onValueChange={(value) => setHealthForm(prev => ({ ...prev, growth_stage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedling">🌱 Seedling</SelectItem>
                        <SelectItem value="vegetative">🌿 Vegetative</SelectItem>
                        <SelectItem value="flowering">🌸 Flowering</SelectItem>
                        <SelectItem value="fruiting">🍅 Fruiting</SelectItem>
                        <SelectItem value="mature">🌳 Mature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any observations about your plant..."
                      value={healthForm.notes}
                      onChange={(e) => setHealthForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleHealthUpdate} className="w-full">
                    Update Health Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{healthScore}/100</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getHealthStatusColor(healthData?.health_status || 'healthy')}>
                  {healthData?.health_status?.replace('_', ' ') || 'Unknown'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getGrowthStageIcon(healthData?.growth_stage || 'seedling')} 
                  {healthData?.growth_stage || 'seedling'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={markAsWatered} variant="outline" size="sm">
                <Droplet className="h-4 w-4 mr-2" />
                Watered
              </Button>
              <Button onClick={markAsFertilized} variant="outline" size="sm">
                <Sprout className="h-4 w-4 mr-2" />
                Fertilized
              </Button>
            </div>
          </div>
          
          <Progress value={healthScore} className="h-3" />
          
          {healthData?.notes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{healthData.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Watered:</span>
              <p className="font-medium">
                {healthData?.last_watered 
                  ? formatDistanceToNow(new Date(healthData.last_watered), { addSuffix: true })
                  : 'Never recorded'
                }
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Fertilized:</span>
              <p className="font-medium">
                {healthData?.last_fertilized 
                  ? formatDistanceToNow(new Date(healthData.last_fertilized), { addSuffix: true })
                  : 'Never recorded'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-500" />
                Photo Timeline
              </CardTitle>
              <CardDescription>Track your plant's growth journey</CardDescription>
            </div>
            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Plant Photo</DialogTitle>
                  <DialogDescription>
                    Document your plant's growth with a new photo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo">Photo</Label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        disabled={uploadingPhoto}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="caption">Caption</Label>
                    <Input
                      id="caption"
                      placeholder="Describe what's happening with your plant..."
                      value={photoForm.caption}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="milestone">Growth Milestone (Optional)</Label>
                    <Select
                      value={photoForm.milestone}
                      onValueChange={(value) => setPhotoForm(prev => ({ ...prev, milestone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a milestone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_sprout">First Sprout</SelectItem>
                        <SelectItem value="first_leaves">First True Leaves</SelectItem>
                        <SelectItem value="flowering">First Flower</SelectItem>
                        <SelectItem value="fruiting">First Fruit</SelectItem>
                        <SelectItem value="harvest">Harvest</SelectItem>
                        <SelectItem value="repotting">Repotting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {plantPhotos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photos yet</p>
              <p className="text-sm">Start documenting your plant's journey!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Plant photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  {photo.growth_milestone && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      {photo.growth_milestone.replace('_', ' ')}
                    </Badge>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium">{photo.caption}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(photo.photo_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlantHealthTrackerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-20" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}