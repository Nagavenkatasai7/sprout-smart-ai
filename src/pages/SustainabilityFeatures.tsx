import { useState, useEffect } from 'react';
import { Recycle, Droplets, TreePine, Beaker, Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompostingGuide {
  id: string;
  title: string;
  method: string;
  difficulty_level: string;
  time_to_compost: string;
  materials_needed: string[];
  steps: any[];
}

interface UserComposting {
  id: string;
  guide_id: string;
  batch_name: string;
  start_date: string;
  current_status: string;
  materials_added: any[];
  temperature_logs: any[];
  notes: string;
}

interface WaterUsage {
  id: string;
  plant_id: string;
  date: string;
  amount_liters: number;
  method: string;
  efficiency_score: number;
}

interface CarbonFootprint {
  id: string;
  calculation_date: string;
  garden_size_sqm: number;
  carbon_sequestered_kg: number;
  carbon_emissions_kg: number;
  net_carbon_kg: number;
  breakdown: any;
}

interface PestControlRecipe {
  id: string;
  name: string;
  target_pests: string[];
  ingredients: any[];
  instructions: string[];
  application_method: string;
  effectiveness_rating: number;
}

const SustainabilityFeatures = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'composting' | 'water' | 'carbon' | 'pest'>('composting');
  
  // Composting State
  const [compostingGuides, setCompostingGuides] = useState<CompostingGuide[]>([]);
  const [userComposting, setUserComposting] = useState<UserComposting[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<string>('');
  const [newBatch, setNewBatch] = useState({
    name: '',
    guide_id: '',
    notes: ''
  });

  // Water Usage State
  const [waterUsage, setWaterUsage] = useState<WaterUsage[]>([]);
  const [newWaterEntry, setNewWaterEntry] = useState({
    plant_id: '',
    date: new Date().toISOString().split('T')[0],
    amount_liters: '',
    method: ''
  });

  // Carbon Footprint State
  const [carbonFootprints, setCarbonFootprints] = useState<CarbonFootprint[]>([]);
  const [carbonCalculation, setCarbonCalculation] = useState({
    garden_size_sqm: '',
    plant_count: '',
    fertilizer_usage: '',
    transport_miles: ''
  });

  // Pest Control State
  const [pestRecipes, setPestRecipes] = useState<PestControlRecipe[]>([]);
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    target_pests: '',
    ingredients: '',
    instructions: '',
    application_method: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchData();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch composting guides
      const { data: guidesData } = await supabase
        .from('composting_guides')
        .select('*')
        .order('difficulty_level');
      setCompostingGuides((guidesData || []).map(guide => ({
        ...guide,
        steps: guide.steps as any[]
      })));

      // Fetch user composting
      const { data: userCompostData } = await supabase
        .from('user_composting')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: false });
      setUserComposting((userCompostData || []).map(compost => ({
        ...compost,
        materials_added: compost.materials_added as any[],
        temperature_logs: compost.temperature_logs as any[]
      })));

      // Fetch water usage
      const { data: waterData } = await supabase
        .from('water_usage')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);
      setWaterUsage(waterData || []);

      // Fetch carbon footprints
      const { data: carbonData } = await supabase
        .from('carbon_footprint')
        .select('*')
        .eq('user_id', user?.id)
        .order('calculation_date', { ascending: false });
      setCarbonFootprints(carbonData || []);

      // Fetch pest control recipes
      const { data: pestData } = await supabase
        .from('pest_control_recipes')
        .select('*')
        .eq('approved', true)
        .order('effectiveness_rating', { ascending: false });
      setPestRecipes((pestData || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as any[]
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const startCompostBatch = async () => {
    if (!user || !newBatch.name || !newBatch.guide_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_composting')
        .insert({
          user_id: user.id,
          guide_id: newBatch.guide_id,
          batch_name: newBatch.name,
          start_date: new Date().toISOString().split('T')[0],
          notes: newBatch.notes
        });

      if (error) throw error;
      
      setNewBatch({ name: '', guide_id: '', notes: '' });
      fetchData();
      toast.success('Compost batch started successfully!');
    } catch (error) {
      console.error('Error starting compost batch:', error);
      toast.error('Failed to start compost batch');
    }
  };

  const addWaterEntry = async () => {
    if (!user || !newWaterEntry.amount_liters || !newWaterEntry.method) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Calculate efficiency score (simplified)
      let efficiency = 0.5; // base efficiency
      if (newWaterEntry.method === 'drip') efficiency = 0.9;
      else if (newWaterEntry.method === 'rain') efficiency = 1.0;
      else if (newWaterEntry.method === 'manual') efficiency = 0.7;

      const { error } = await supabase
        .from('water_usage')
        .insert({
          user_id: user.id,
          plant_id: newWaterEntry.plant_id || null,
          date: newWaterEntry.date,
          amount_liters: parseFloat(newWaterEntry.amount_liters),
          method: newWaterEntry.method,
          efficiency_score: efficiency
        });

      if (error) throw error;
      
      setNewWaterEntry({
        plant_id: '',
        date: new Date().toISOString().split('T')[0],
        amount_liters: '',
        method: ''
      });
      fetchData();
      toast.success('Water usage recorded!');
    } catch (error) {
      console.error('Error adding water entry:', error);
      toast.error('Failed to record water usage');
    }
  };

  const calculateCarbonFootprint = async () => {
    if (!user || !carbonCalculation.garden_size_sqm) {
      toast.error('Please enter your garden size');
      return;
    }

    try {
      const size = parseFloat(carbonCalculation.garden_size_sqm);
      const plants = parseInt(carbonCalculation.plant_count) || 0;
      const fertilizer = parseFloat(carbonCalculation.fertilizer_usage) || 0;
      const transport = parseFloat(carbonCalculation.transport_miles) || 0;

      // Simplified carbon calculations
      const sequestered = size * 2.5 + plants * 0.5; // kg CO2 per year
      const emissions = fertilizer * 2.98 + transport * 0.404; // kg CO2
      const net = sequestered - emissions;

      const breakdown = {
        plant_sequestration: size * 2.5,
        tree_sequestration: plants * 0.5,
        fertilizer_emissions: fertilizer * 2.98,
        transport_emissions: transport * 0.404
      };

      const { error } = await supabase
        .from('carbon_footprint')
        .insert({
          user_id: user.id,
          calculation_date: new Date().toISOString().split('T')[0],
          garden_size_sqm: size,
          carbon_sequestered_kg: sequestered,
          carbon_emissions_kg: emissions,
          net_carbon_kg: net,
          breakdown: breakdown
        });

      if (error) throw error;
      
      fetchData();
      toast.success(`Carbon footprint calculated! Net impact: ${net.toFixed(2)}kg CO2`);
    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      toast.error('Failed to calculate carbon footprint');
    }
  };

  const createPestRecipe = async () => {
    if (!user || !newRecipe.name || !newRecipe.target_pests || !newRecipe.ingredients) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const pestsArray = newRecipe.target_pests.split(',').map(p => p.trim());
      const ingredientsArray = newRecipe.ingredients.split('\n').map(i => {
        const parts = i.trim().split(':');
        return {
          ingredient: parts[0]?.trim() || '',
          amount: parts[1]?.trim() || '',
          unit: 'as needed'
        };
      }).filter(i => i.ingredient);
      const instructionsArray = newRecipe.instructions.split('\n').map(i => i.trim()).filter(i => i);

      const { error } = await supabase
        .from('pest_control_recipes')
        .insert({
          user_id: user.id,
          name: newRecipe.name,
          target_pests: pestsArray,
          ingredients: ingredientsArray,
          instructions: instructionsArray,
          application_method: newRecipe.application_method,
          user_submitted: true,
          approved: false // Requires approval
        });

      if (error) throw error;
      
      setNewRecipe({
        name: '',
        target_pests: '',
        ingredients: '',
        instructions: '',
        application_method: ''
      });
      setIsCreateRecipeOpen(false);
      toast.success('Recipe submitted for review!');
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('Failed to create recipe');
    }
  };

  const getTotalWaterUsage = () => {
    return waterUsage.reduce((total, entry) => total + entry.amount_liters, 0);
  };

  const getAverageEfficiency = () => {
    if (waterUsage.length === 0) return 0;
    return waterUsage.reduce((total, entry) => total + (entry.efficiency_score || 0), 0) / waterUsage.length;
  };

  const getLatestCarbonFootprint = () => {
    return carbonFootprints.length > 0 ? carbonFootprints[0] : null;
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
              <h1 className="text-2xl font-bold text-foreground">Sustainability Hub</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Sustainable Gardening Hub</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your composting, optimize water usage, calculate your carbon footprint, and discover organic pest control solutions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto justify-center">
          {[
            { key: 'composting', label: 'Composting', icon: Recycle },
            { key: 'water', label: 'Water Usage', icon: Droplets },
            { key: 'carbon', label: 'Carbon Footprint', icon: TreePine },
            { key: 'pest', label: 'Organic Pest Control', icon: Beaker }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => setActiveTab(key as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'composting' && (
          <div className="space-y-8">
            {/* Start New Batch */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Start New Compost Batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch-name">Batch Name</Label>
                    <Input
                      id="batch-name"
                      value={newBatch.name}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Kitchen Scraps Batch #1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guide">Composting Method</Label>
                    <Select value={newBatch.guide_id} onValueChange={(value) => 
                      setNewBatch(prev => ({ ...prev, guide_id: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {compostingGuides.map((guide) => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.title} ({guide.difficulty_level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={newBatch.notes}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Starting materials, location, etc."
                  />
                </div>
                
                <Button onClick={startCompostBatch} className="w-full">
                  Start Compost Batch
                </Button>
              </CardContent>
            </Card>

            {/* Active Batches */}
            <div className="grid md:grid-cols-2 gap-6">
              {userComposting.filter(batch => batch.current_status === 'active').map((batch) => (
                <Card key={batch.id}>
                  <CardHeader>
                    <CardTitle>{batch.batch_name}</CardTitle>
                    <Badge variant="outline">{batch.current_status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span>{new Date(batch.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials Added:</span>
                        <span>{batch.materials_added?.length || 0} entries</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Add Materials
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Log Temperature
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Composting Guides */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Composting Guides</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compostingGuides.map((guide) => (
                  <Card key={guide.id} className="group hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{guide.difficulty_level}</Badge>
                        <Badge variant="secondary">{guide.time_to_compost}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Materials needed:</span>
                          <ul className="text-muted-foreground mt-1">
                            {guide.materials_needed?.slice(0, 3).map((material, index) => (
                              <li key={index}>• {material}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'water' && (
          <div className="space-y-8">
            {/* Water Usage Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Usage (30 days)</p>
                      <p className="text-2xl font-bold">{getTotalWaterUsage().toFixed(1)}L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Efficiency Score</p>
                      <p className="text-2xl font-bold">{(getAverageEfficiency() * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Entries Logged</p>
                      <p className="text-2xl font-bold">{waterUsage.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Water Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Log Water Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="water-date">Date</Label>
                    <Input
                      id="water-date"
                      type="date"
                      value={newWaterEntry.date}
                      onChange={(e) => setNewWaterEntry(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="water-amount">Amount (Liters)</Label>
                    <Input
                      id="water-amount"
                      type="number"
                      value={newWaterEntry.amount_liters}
                      onChange={(e) => setNewWaterEntry(prev => ({ ...prev, amount_liters: e.target.value }))}
                      placeholder="5.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="water-method">Watering Method</Label>
                    <Select value={newWaterEntry.method} onValueChange={(value) => 
                      setNewWaterEntry(prev => ({ ...prev, method: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual/Hose</SelectItem>
                        <SelectItem value="drip">Drip Irrigation</SelectItem>
                        <SelectItem value="sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="rain">Rain Water</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={addWaterEntry} className="w-full">
                  Log Water Usage
                </Button>
              </CardContent>
            </Card>

            {/* Recent Water Usage */}
            {waterUsage.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Water Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {waterUsage.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{entry.amount_liters}L</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            via {entry.method}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{new Date(entry.date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((entry.efficiency_score || 0) * 100).toFixed(0)}% efficient
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'carbon' && (
          <div className="space-y-8">
            {/* Current Carbon Status */}
            {getLatestCarbonFootprint() && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Carbon Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {getLatestCarbonFootprint()?.carbon_sequestered_kg.toFixed(1)}kg
                      </div>
                      <p className="text-sm text-muted-foreground">CO₂ Sequestered</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {getLatestCarbonFootprint()?.carbon_emissions_kg.toFixed(1)}kg
                      </div>
                      <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        (getLatestCarbonFootprint()?.net_carbon_kg || 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getLatestCarbonFootprint()?.net_carbon_kg.toFixed(1)}kg
                      </div>
                      <p className="text-sm text-muted-foreground">Net Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carbon Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Calculate Carbon Footprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="garden-size">Garden Size (sq meters)</Label>
                    <Input
                      id="garden-size"
                      type="number"
                      value={carbonCalculation.garden_size_sqm}
                      onChange={(e) => setCarbonCalculation(prev => ({ ...prev, garden_size_sqm: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plant-count">Number of Trees/Large Plants</Label>
                    <Input
                      id="plant-count"
                      type="number"
                      value={carbonCalculation.plant_count}
                      onChange={(e) => setCarbonCalculation(prev => ({ ...prev, plant_count: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fertilizer">Fertilizer Usage (kg/year)</Label>
                    <Input
                      id="fertilizer"
                      type="number"
                      value={carbonCalculation.fertilizer_usage}
                      onChange={(e) => setCarbonCalculation(prev => ({ ...prev, fertilizer_usage: e.target.value }))}
                      placeholder="2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="transport">Transport for Supplies (miles/year)</Label>
                    <Input
                      id="transport"
                      type="number"
                      value={carbonCalculation.transport_miles}
                      onChange={(e) => setCarbonCalculation(prev => ({ ...prev, transport_miles: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                </div>
                
                <Button onClick={calculateCarbonFootprint} className="w-full">
                  Calculate Carbon Footprint
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'pest' && (
          <div className="space-y-8">
            {/* Create Recipe Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Organic Pest Control Recipes</h3>
              <Dialog open={isCreateRecipeOpen} onOpenChange={setIsCreateRecipeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Share Your Pest Control Recipe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipe-name">Recipe Name</Label>
                      <Input
                        id="recipe-name"
                        value={newRecipe.name}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Neem Oil Spray"
                      />
                    </div>

                    <div>
                      <Label htmlFor="target-pests">Target Pests (comma-separated)</Label>
                      <Input
                        id="target-pests"
                        value={newRecipe.target_pests}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, target_pests: e.target.value }))}
                        placeholder="aphids, spider mites, whiteflies"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ingredients">Ingredients (one per line, format: ingredient: amount)</Label>
                      <Textarea
                        id="ingredients"
                        value={newRecipe.ingredients}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, ingredients: e.target.value }))}
                        placeholder="neem oil: 2 tablespoons&#10;water: 1 liter&#10;mild soap: 1 teaspoon"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions (one per line)</Label>
                      <Textarea
                        id="instructions"
                        value={newRecipe.instructions}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Mix neem oil with water&#10;Add mild soap as emulsifier&#10;Shake well before use"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="application">Application Method</Label>
                      <Input
                        id="application"
                        value={newRecipe.application_method}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, application_method: e.target.value }))}
                        placeholder="Spray on affected leaves in evening"
                      />
                    </div>

                    <Button onClick={createPestRecipe} className="w-full">
                      Submit Recipe
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Recipe Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {pestRecipes.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      {recipe.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {recipe.target_pests?.slice(0, 3).map((pest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pest}
                        </Badge>
                      ))}
                    </div>
                    {recipe.effectiveness_rating && (
                      <div className="text-sm text-muted-foreground">
                        ⭐ {recipe.effectiveness_rating}/5 effectiveness
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Ingredients:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {recipe.ingredients?.slice(0, 3).map((ingredient: any, index) => (
                          <li key={index}>
                            • {ingredient.ingredient}: {ingredient.amount} {ingredient.unit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Application:</p>
                      <p className="text-sm text-muted-foreground">
                        {recipe.application_method}
                      </p>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      View Full Recipe
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pestRecipes.length === 0 && (
              <div className="text-center py-12">
                <Beaker className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share an organic pest control recipe!
                </p>
                <Button onClick={() => setIsCreateRecipeOpen(true)}>
                  Share Your Recipe
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SustainabilityFeatures;