import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, Star, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WishlistItem {
  id: string;
  plant_name: string;
  scientific_name?: string;
  notes?: string;
  priority: number;
  image_url?: string;
  care_difficulty?: string;
  estimated_cost?: number;
  where_to_buy?: string;
  created_at: string;
}

const PlantWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plant_name: "",
    scientific_name: "",
    notes: "",
    priority: 1,
    care_difficulty: "",
    estimated_cost: "",
    where_to_buy: ""
  });

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const { data, error } = await supabase
        .from("plant_wishlists")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load your wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!user || !formData.plant_name.trim()) return;

    try {
      const { error } = await supabase.from("plant_wishlists").insert({
        user_id: user.id,
        plant_name: formData.plant_name,
        scientific_name: formData.scientific_name || null,
        notes: formData.notes || null,
        priority: formData.priority,
        care_difficulty: formData.care_difficulty || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        where_to_buy: formData.where_to_buy || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plant added to your wishlist!",
      });

      setFormData({
        plant_name: "",
        scientific_name: "",
        notes: "",
        priority: 1,
        care_difficulty: "",
        estimated_cost: "",
        where_to_buy: ""
      });
      setIsDialogOpen(false);
      fetchWishlistItems();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add plant to wishlist",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("plant_wishlists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plant removed from wishlist",
      });
      fetchWishlistItems();
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      toast({
        title: "Error",
        description: "Failed to remove plant from wishlist",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return "bg-red-500 text-white";
      case 2: return "bg-yellow-500 text-white";
      default: return "bg-green-500 text-white";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return "High";
      case 2: return "Medium";
      default: return "Low";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your plant wishlist</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              My Plant Wishlist
            </h1>
            <p className="text-muted-foreground mt-2">
              Keep track of plants you want to grow and organize your gardening goals
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Plant to Wishlist</DialogTitle>
                <DialogDescription>
                  Add a new plant you'd like to grow to your wishlist
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plant_name">Plant Name *</Label>
                  <Input
                    id="plant_name"
                    value={formData.plant_name}
                    onChange={(e) => setFormData({...formData, plant_name: e.target.value})}
                    placeholder="e.g., Monstera Deliciosa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="scientific_name">Scientific Name</Label>
                  <Input
                    id="scientific_name"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({...formData, scientific_name: e.target.value})}
                    placeholder="e.g., Monstera deliciosa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority.toString()} 
                    onValueChange={(value) => setFormData({...formData, priority: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="3">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="care_difficulty">Care Difficulty</Label>
                  <Select 
                    value={formData.care_difficulty} 
                    onValueChange={(value) => setFormData({...formData, care_difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                  <Input
                    id="estimated_cost"
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                    placeholder="25.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="where_to_buy">Where to Buy</Label>
                  <Input
                    id="where_to_buy"
                    value={formData.where_to_buy}
                    onChange={(e) => setFormData({...formData, where_to_buy: e.target.value})}
                    placeholder="Local nursery, online store, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Why do you want this plant? Any specific care requirements?"
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddItem} className="w-full">
                  Add to Wishlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your wishlist...</div>
        ) : wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start adding plants you'd like to grow to build your gardening goals
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.plant_name}</CardTitle>
                      {item.scientific_name && (
                        <p className="text-sm italic text-muted-foreground">
                          {item.scientific_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        <Star className="h-3 w-3 mr-1" />
                        {getPriorityText(item.priority)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {item.care_difficulty && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <Badge variant="outline" className="capitalize">
                        {item.care_difficulty}
                      </Badge>
                    </div>
                  )}
                  
                  {item.estimated_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Est. Cost:</span>
                      <span className="font-medium">${item.estimated_cost}</span>
                    </div>
                  )}
                  
                  {item.where_to_buy && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Where to buy:</span>
                      <p className="mt-1">{item.where_to_buy}</p>
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1 text-sm">{item.notes}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Added {new Date(item.created_at).toLocaleDateString()}
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

export default PlantWishlist;