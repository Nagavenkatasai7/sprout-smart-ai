import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Heart, Clock, TrendingUp, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Transformation {
  id: string;
  title: string;
  description?: string;
  before_image_url: string;
  after_image_url: string;
  plant_type?: string;
  transformation_period?: number;
  tips_used?: string[];
  is_featured: boolean;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const TransformationGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    plant_type: "",
    transformation_period: "",
    tips_used: "",
    before_image_url: "",
    after_image_url: ""
  });

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    try {
      const { data, error } = await supabase
        .from("user_transformations")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("likes_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransformations(data || []);
    } catch (error) {
      console.error("Error fetching transformations:", error);
      toast({
        title: "Error",
        description: "Failed to load transformations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransformation = async () => {
    if (!user || !formData.title.trim() || !formData.before_image_url || !formData.after_image_url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("user_transformations").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        before_image_url: formData.before_image_url,
        after_image_url: formData.after_image_url,
        plant_type: formData.plant_type || null,
        transformation_period: formData.transformation_period ? parseInt(formData.transformation_period) : null,
        tips_used: formData.tips_used ? formData.tips_used.split(',').map(tip => tip.trim()) : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your transformation has been shared!",
      });

      setFormData({
        title: "",
        description: "",
        plant_type: "",
        transformation_period: "",
        tips_used: "",
        before_image_url: "",
        after_image_url: ""
      });
      setIsDialogOpen(false);
      fetchTransformations();
    } catch (error) {
      console.error("Error submitting transformation:", error);
      toast({
        title: "Error",
        description: "Failed to submit transformation",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like transformations",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_transformations")
        .update({ likes_count: currentLikes + 1 })
        .eq("id", id);

      if (error) throw error;
      fetchTransformations();
    } catch (error) {
      console.error("Error liking transformation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              Transformation Gallery
            </h1>
            <p className="text-muted-foreground mt-2">
              Inspiring before & after stories from our plant community
            </p>
          </div>
          
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Share Transformation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share Your Plant Transformation</DialogTitle>
                  <DialogDescription>
                    Show off your amazing plant care results and inspire others!
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., My Fiddle Leaf Fig Recovery"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="before_image_url">Before Image URL *</Label>
                    <Input
                      id="before_image_url"
                      value={formData.before_image_url}
                      onChange={(e) => setFormData({...formData, before_image_url: e.target.value})}
                      placeholder="https://example.com/before.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="after_image_url">After Image URL *</Label>
                    <Input
                      id="after_image_url"
                      value={formData.after_image_url}
                      onChange={(e) => setFormData({...formData, after_image_url: e.target.value})}
                      placeholder="https://example.com/after.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plant_type">Plant Type</Label>
                    <Input
                      id="plant_type"
                      value={formData.plant_type}
                      onChange={(e) => setFormData({...formData, plant_type: e.target.value})}
                      placeholder="e.g., Fiddle Leaf Fig"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="transformation_period">Transformation Period (days)</Label>
                    <Input
                      id="transformation_period"
                      type="number"
                      value={formData.transformation_period}
                      onChange={(e) => setFormData({...formData, transformation_period: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tips_used">Tips Used (comma-separated)</Label>
                    <Input
                      id="tips_used"
                      value={formData.tips_used}
                      onChange={(e) => setFormData({...formData, tips_used: e.target.value})}
                      placeholder="Better lighting, consistent watering, fertilizing"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell us about your plant's journey and what made the difference..."
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleSubmitTransformation} className="w-full">
                    Share Transformation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading transformations...</div>
        ) : transformations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No transformations yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your amazing plant transformation!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformations.map((transformation) => (
              <Card key={transformation.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {transformation.title}
                      </CardTitle>
                      {transformation.plant_type && (
                        <Badge variant="outline" className="mt-2">
                          {transformation.plant_type}
                        </Badge>
                      )}
                    </div>
                    {transformation.is_featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Before/After Images */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">BEFORE</p>
                      <div className="aspect-square relative overflow-hidden rounded-md">
                        <img
                          src={transformation.before_image_url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">AFTER</p>
                      <div className="aspect-square relative overflow-hidden rounded-md">
                        <img
                          src={transformation.after_image_url}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {transformation.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {transformation.description}
                    </p>
                  )}
                  
                  {transformation.transformation_period && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {transformation.transformation_period} days
                    </div>
                  )}
                  
                  {transformation.tips_used && transformation.tips_used.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">TIPS USED:</p>
                      <div className="flex flex-wrap gap-1">
                        {transformation.tips_used.slice(0, 3).map((tip, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tip}
                          </Badge>
                        ))}
                        {transformation.tips_used.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{transformation.tips_used.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(transformation.id, transformation.likes_count)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {transformation.likes_count}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {new Date(transformation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformationGallery;