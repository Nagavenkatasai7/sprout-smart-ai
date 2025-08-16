import { useState, useEffect } from 'react';
import { Calculator, ShoppingCart, Beaker, CheckSquare, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price_range: { min: number; max: number };
  specifications: any;
  rating: number;
}

interface SoilCalculation {
  volume_liters: number;
  cost_estimate: number;
  soil_mix: string;
}

const ShoppingAssistant = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calculator' | 'fertilizer' | 'checklist' | 'comparison'>('calculator');
  
  // Soil Calculator State
  const [potDimensions, setPotDimensions] = useState({
    length: '',
    width: '',
    height: '',
    shape: 'rectangular'
  });
  const [soilResult, setSoilResult] = useState<SoilCalculation | null>(null);

  // Fertilizer Calculator State
  const [fertilizerData, setFertilizerData] = useState({
    plantType: '',
    gardenSize: '',
    growthStage: '',
    soilType: ''
  });

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<any[]>([]);

  // Beginner Equipment Checklist
  const beginnerEquipment = [
    { item: 'Hand Trowel', essential: true, price_range: '$15-30' },
    { item: 'Watering Can', essential: true, price_range: '$20-40' },
    { item: 'Pruning Shears', essential: true, price_range: '$25-50' },
    { item: 'Garden Gloves', essential: true, price_range: '$10-20' },
    { item: 'Plant Pots (various sizes)', essential: true, price_range: '$15-50' },
    { item: 'Potting Soil', essential: true, price_range: '$15-25' },
    { item: 'Plant Stakes', essential: false, price_range: '$10-20' },
    { item: 'Spray Bottle', essential: false, price_range: '$5-15' },
    { item: 'Plant Labels', essential: false, price_range: '$8-15' },
    { item: 'pH Testing Kit', essential: false, price_range: '$10-25' }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProducts();
    }
  }, [user, loading, navigate]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      const typedProducts = (data || []).map(product => ({
        ...product,
        price_range: product.price_range as { min: number; max: number },
        specifications: product.specifications as any
      }));
      setProducts(typedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateSoil = async () => {
    const { length, width, height, shape } = potDimensions;
    
    if (!length || !width || !height) {
      toast.error('Please fill in all pot dimensions');
      return;
    }

    let volume = 0;
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);

    // Calculate volume based on shape
    if (shape === 'rectangular') {
      volume = l * w * h;
    } else if (shape === 'circular') {
      // Treat length as diameter
      const radius = l / 2;
      volume = Math.PI * radius * radius * h;
    } else if (shape === 'square') {
      volume = l * l * h;
    }

    // Convert from cubic cm to liters
    const volumeLiters = volume / 1000;
    
    // Estimate cost (rough estimate: $0.50-1.00 per liter)
    const costEstimate = volumeLiters * 0.75;

    const result: SoilCalculation = {
      volume_liters: Math.round(volumeLiters * 100) / 100,
      cost_estimate: Math.round(costEstimate * 100) / 100,
      soil_mix: 'Premium Potting Mix'
    };

    setSoilResult(result);

    // Save calculation to database
    if (user) {
      try {
        await supabase.from('soil_calculations').insert({
          user_id: user.id,
          pot_dimensions: potDimensions,
          soil_volume_liters: result.volume_liters,
          estimated_cost: result.cost_estimate
        });
      } catch (error) {
        console.error('Error saving calculation:', error);
      }
    }

    toast.success('Soil calculation completed!');
  };

  const calculateFertilizer = () => {
    const { plantType, gardenSize, growthStage } = fertilizerData;
    
    if (!plantType || !gardenSize || !growthStage) {
      toast.error('Please fill in all fertilizer details');
      return;
    }

    // Basic fertilizer recommendations
    const size = parseFloat(gardenSize);
    let npkRatio = '10-10-10'; // balanced
    let amount = size * 0.1; // kg per square meter

    if (growthStage === 'seedling') {
      npkRatio = '5-10-5'; // lower nitrogen
      amount *= 0.5;
    } else if (growthStage === 'flowering') {
      npkRatio = '5-10-10'; // higher phosphorus
    } else if (growthStage === 'vegetative') {
      npkRatio = '15-5-10'; // higher nitrogen
    }

    toast.success(`Recommendation: ${amount.toFixed(1)}kg of ${npkRatio} fertilizer for your ${plantType} garden`);
  };

  const addToShoppingList = (product: Product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      price_range: product.price_range,
      quantity: 1
    };

    setShoppingList(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });

    toast.success(`${product.name} added to shopping list!`);
  };

  const removeFromShoppingList = (productId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== productId));
  };

  const getTotalCost = () => {
    return shoppingList.reduce((total, item) => {
      const avgPrice = (item.price_range.min + item.price_range.max) / 2;
      return total + (avgPrice * item.quantity);
    }, 0);
  };

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
              <h1 className="text-2xl font-bold text-foreground">Shopping Assistant</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Smart Garden Shopping Assistant</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calculate soil needs, get fertilizer recommendations, and build your perfect gardening toolkit.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: 'calculator', label: 'Soil Calculator', icon: Calculator },
            { key: 'fertilizer', label: 'Fertilizer Guide', icon: Beaker },
            { key: 'checklist', label: 'Equipment Checklist', icon: CheckSquare },
            { key: 'comparison', label: 'Price Comparison', icon: DollarSign }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => setActiveTab(key as any)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'calculator' && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Soil Volume Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shape">Pot Shape</Label>
                  <Select value={potDimensions.shape} onValueChange={(value) => 
                    setPotDimensions(prev => ({ ...prev, shape: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">Rectangular</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="length">
                      {potDimensions.shape === 'circular' ? 'Diameter (cm)' : 'Length (cm)'}
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      value={potDimensions.length}
                      onChange={(e) => setPotDimensions(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                  
                  {potDimensions.shape !== 'circular' && potDimensions.shape !== 'square' && (
                    <div>
                      <Label htmlFor="width">Width (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={potDimensions.width}
                        onChange={(e) => setPotDimensions(prev => ({ ...prev, width: e.target.value }))}
                        placeholder="20"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={potDimensions.height}
                    onChange={(e) => setPotDimensions(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="25"
                  />
                </div>

                <Button onClick={calculateSoil} className="w-full">
                  Calculate Soil Needed
                </Button>
              </CardContent>
            </Card>

            {soilResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {soilResult.volume_liters}L
                    </div>
                    <p className="text-muted-foreground">Soil Volume Needed</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Recommended Mix:</span>
                      <span className="font-medium">{soilResult.soil_mix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Cost:</span>
                      <span className="font-medium">${soilResult.cost_estimate}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Add to Shopping List
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'fertilizer' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Fertilizer Dosage Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plantType">Plant Type</Label>
                  <Select value={fertilizerData.plantType} onValueChange={(value) => 
                    setFertilizerData(prev => ({ ...prev, plantType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="flowers">Flowers</SelectItem>
                      <SelectItem value="herbs">Herbs</SelectItem>
                      <SelectItem value="houseplants">Houseplants</SelectItem>
                      <SelectItem value="trees">Trees/Shrubs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gardenSize">Garden Size (sq meters)</Label>
                  <Input
                    id="gardenSize"
                    type="number"
                    value={fertilizerData.gardenSize}
                    onChange={(e) => setFertilizerData(prev => ({ ...prev, gardenSize: e.target.value }))}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="growthStage">Growth Stage</Label>
                  <Select value={fertilizerData.growthStage} onValueChange={(value) => 
                    setFertilizerData(prev => ({ ...prev, growthStage: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seedling">Seedling</SelectItem>
                      <SelectItem value="vegetative">Vegetative Growth</SelectItem>
                      <SelectItem value="flowering">Flowering/Fruiting</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select value={fertilizerData.soilType} onValueChange={(value) => 
                    setFertilizerData(prev => ({ ...prev, soilType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="loamy">Loamy</SelectItem>
                      <SelectItem value="potting">Potting Mix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateFertilizer} className="w-full">
                Get Fertilizer Recommendation
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'checklist' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Beginner Equipment Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {beginnerEquipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.item}</span>
                        </div>
                        {item.essential && (
                          <Badge variant="secondary">Essential</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.price_range}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Estimated Total Cost</h4>
                  <div className="text-sm text-muted-foreground">
                    Essential items: $100-165 | Complete kit: $150-265
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${product.price_range.min}-{product.price_range.max}
                        </div>
                        {product.rating && (
                          <div className="text-sm text-muted-foreground">
                            ⭐ {product.rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.description}
                    </p>
                    
                    <Button 
                      onClick={() => addToShoppingList(product)}
                      variant="outline" 
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to List
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shopping List Summary */}
            {shoppingList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shopping List ({shoppingList.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {shoppingList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            ${((item.price_range.min + item.price_range.max) / 2 * item.quantity).toFixed(2)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromShoppingList(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-medium">Total Estimated Cost:</span>
                    <span className="text-lg font-bold">${getTotalCost().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingAssistant;