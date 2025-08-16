import { useState, useEffect } from 'react';
import { Users, MapPin, Star, MessageCircle, Package, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CommunityPost {
  id: string;
  user_id: string;
  type: 'seed_swap' | 'cutting_exchange' | 'meetup' | 'vendor_recommendation';
  title: string;
  description: string;
  plant_type?: string;
  location?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const CommunityMarketplace = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'seeds' | 'cuttings' | 'meetups' | 'vendors'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'seed_swap' as const,
    title: '',
    description: '',
    plant_type: '',
    location: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchPosts();
    }
  }, [user, loading, navigate]);

  const fetchPosts = async () => {
    try {
      // Use the NEW secure function that prevents contact_info exposure
      const { data, error } = await supabase.rpc('get_safe_community_posts');

      if (error) throw error;
      
      // The function automatically masks contact_info for non-owners
      setPosts((data || []).map(item => ({
        ...item,
        type: item.type as 'seed_swap' | 'cutting_exchange' | 'meetup' | 'vendor_recommendation',
        status: item.status as 'active' | 'completed' | 'cancelled',
        // Ensure contact_info is properly handled - will be null for non-owners
        contact_info: item.contact_info
      })));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title.trim()) return;

    try {
      // Log activity
      await supabase.rpc('log_user_activity', {
        user_id_param: user.id,
        activity_type_param: 'community_post_created',
        entity_type_param: 'community_post',
        activity_data_param: JSON.stringify({ type: newPost.type, title: newPost.title })
      });

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          type: newPost.type,
          title: newPost.title,
          description: newPost.description,
          plant_type: newPost.plant_type || null,
          location: newPost.location || null
        });

      if (error) throw error;
      
      // Reset form
      setNewPost({
        type: 'seed_swap',
        title: '',
        description: '',
        plant_type: '',
        location: ''
      });
      setIsCreateDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'seed_swap': return <Package className="h-4 w-4" />;
      case 'cutting_exchange': return <Users className="h-4 w-4" />;
      case 'meetup': return <Calendar className="h-4 w-4" />;
      case 'vendor_recommendation': return <Star className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'seed_swap': return 'Seed Swap';
      case 'cutting_exchange': return 'Cutting Exchange';
      case 'meetup': return 'Meetup';
      case 'vendor_recommendation': return 'Vendor Recommendation';
      default: return type;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'seeds') return post.type === 'seed_swap';
    if (activeTab === 'cuttings') return post.type === 'cutting_exchange';
    if (activeTab === 'meetups') return post.type === 'meetup';
    if (activeTab === 'vendors') return post.type === 'vendor_recommendation';
    return true;
  });

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
              <h1 className="text-2xl font-bold text-foreground">Community Marketplace</h1>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Post Type</Label>
                      <Select 
                        value={newPost.type} 
                        onValueChange={(value: any) => setNewPost(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seed_swap">Seed Swap</SelectItem>
                          <SelectItem value="cutting_exchange">Cutting Exchange</SelectItem>
                          <SelectItem value="meetup">Meetup</SelectItem>
                          <SelectItem value="vendor_recommendation">Vendor Recommendation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What are you offering or looking for?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="plant_type">Plant Type (optional)</Label>
                      <Input
                        id="plant_type"
                        value={newPost.plant_type}
                        onChange={(e) => setNewPost(prev => ({ ...prev, plant_type: e.target.value }))}
                        placeholder="e.g., Tomatoes, Succulents, Herbs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location (optional)</Label>
                      <Input
                        id="location"
                        value={newPost.location}
                        onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State or general area"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPost.description}
                        onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide more details about your post..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={createPost}
                      disabled={!newPost.title.trim()}
                      className="w-full"
                    >
                      Create Post
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Community Marketplace & Exchange</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow plant enthusiasts. Share seeds, exchange cuttings, organize meetups, 
            and discover trusted local vendors.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {[
              { key: 'all', label: 'All Posts', icon: MessageCircle },
              { key: 'seeds', label: 'Seed Swaps', icon: Package },
              { key: 'cuttings', label: 'Cuttings', icon: Users },
              { key: 'meetups', label: 'Meetups', icon: Calendar },
              { key: 'vendors', label: 'Vendors', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPostTypeIcon(post.type)}
                    <Badge variant="outline" className="text-xs">
                      {getPostTypeLabel(post.type)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  by Anonymous
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {post.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {post.plant_type && (
                    <Badge variant="secondary" className="text-xs">
                      {post.plant_type}
                    </Badge>
                  )}
                  {post.location && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="h-2 w-2" />
                      {post.location}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      // Instead of exposing contact info, we'll implement a secure contact system
                      // For now, show a message that contact is available for authenticated users
                      if (!user) {
                        alert('Please log in to contact the post owner');
                        return;
                      }
                      alert('Contact feature coming soon - secure messaging will be implemented');
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share something with the community!
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMarketplace;