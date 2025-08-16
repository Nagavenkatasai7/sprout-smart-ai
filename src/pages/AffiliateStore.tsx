import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Star, Tag, TrendingUp, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AffiliateLink {
  id: string;
  product_name: string;
  product_description?: string;
  affiliate_url: string;
  commission_rate?: number;
  category: string;
  brand?: string;
  price_range?: any;
  image_url?: string;
  tags?: string[];
  is_featured: boolean;
  clicks_count: number;
  conversions_count: number;
  revenue_generated: number;
}

const AffiliateStore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchAffiliateLinks();
  }, []);

  useEffect(() => {
    filterLinks();
  }, [affiliateLinks, searchTerm, categoryFilter]);

  const fetchAffiliateLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("revenue_generated", { ascending: false });

      if (error) throw error;
      setAffiliateLinks(data || []);
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLinks = () => {
    let filtered = affiliateLinks;

    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.product_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(link => link.category === categoryFilter);
    }

    setFilteredLinks(filtered);
  };

  const handleAffiliateClick = async (link: AffiliateLink) => {
    // Track click analytics
    try {
      await supabase
        .from("affiliate_links")
        .update({ clicks_count: link.clicks_count + 1 })
        .eq("id", link.id);

      // Open affiliate link in new tab
      window.open(link.affiliate_url, '_blank');

      // Track user activity if logged in
      if (user) {
        await supabase.functions.invoke('track-user-activity', {
          body: {
            activity_type: 'affiliate_click',
            entity_type: 'affiliate_link',
            entity_id: link.id,
            activity_data: {
              product_name: link.product_name,
              category: link.category,
              commission_rate: link.commission_rate
            }
          }
        });
      }
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
    }
  };

  const getPriceRangeText = (priceRange: any) => {
    if (!priceRange) return "Price varies";
    if (priceRange.min && priceRange.max) {
      return `$${priceRange.min} - $${priceRange.max}`;
    }
    if (priceRange.min) return `From $${priceRange.min}`;
    if (priceRange.max) return `Up to $${priceRange.max}`;
    return "Price varies";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'tools': 'bg-blue-500 text-white',
      'fertilizers': 'bg-green-500 text-white',
      'pots': 'bg-orange-500 text-white',
      'seeds': 'bg-yellow-500 text-black',
      'soil': 'bg-brown-500 text-white',
      'lighting': 'bg-purple-500 text-white',
      'books': 'bg-red-500 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const categories = [...new Set(affiliateLinks.map(link => link.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Recommended Products
          </h1>
          <p className="text-muted-foreground">
            Curated plant care products from trusted brands - earn us a commission when you buy
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center text-sm text-muted-foreground">
            {filteredLinks.length} product{filteredLinks.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Featured Products */}
        {filteredLinks.some(link => link.is_featured) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.filter(link => link.is_featured).map((link) => (
                <Card key={link.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-yellow-200">
                  <CardHeader className="pb-3">
                    {link.image_url && (
                      <div className="aspect-video relative overflow-hidden rounded-md mb-3">
                        <img
                          src={link.image_url}
                          alt={link.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{link.product_name}</CardTitle>
                        {link.brand && (
                          <p className="text-sm text-muted-foreground mt-1">{link.brand}</p>
                        )}
                      </div>
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {link.product_description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {link.product_description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(link.category)}>
                        {link.category}
                      </Badge>
                      {link.commission_rate && (
                        <Badge variant="outline">
                          {link.commission_rate}% commission
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {getPriceRangeText(link.price_range)}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {link.clicks_count}
                      </div>
                    </div>
                    
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {link.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {link.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{link.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={() => handleAffiliateClick(link)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Shop Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Products</h2>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredLinks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredLinks.filter(link => !link.is_featured).map((link) => (
                <Card key={link.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    {link.image_url && (
                      <div className="aspect-square relative overflow-hidden rounded-md mb-3">
                        <img
                          src={link.image_url}
                          alt={link.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <CardTitle className="text-base line-clamp-2">{link.product_name}</CardTitle>
                    {link.brand && (
                      <CardDescription className="text-xs">{link.brand}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getCategoryColor(link.category)} variant="secondary">
                        {link.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">
                        {getPriceRangeText(link.price_range)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {link.clicks_count}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleAffiliateClick(link)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Shop
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateStore;