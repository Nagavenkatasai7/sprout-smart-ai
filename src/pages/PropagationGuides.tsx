import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Search, Clock, Target, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PropagationGuide {
  id: string;
  plant_name: string;
  scientific_name?: string;
  propagation_method: string;
  difficulty_level: string;
  time_to_propagate?: string;
  success_rate?: number;
  best_season?: string;
  materials_needed?: string[];
  step_by_step_guide: any;
  tips?: string[];
  common_mistakes?: string[];
  image_urls?: string[];
}

const PropagationGuides = () => {
  const [guides, setGuides] = useState<PropagationGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<PropagationGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedGuide, setSelectedGuide] = useState<PropagationGuide | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [guides, searchTerm, difficultyFilter, methodFilter]);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from("propagation_guides")
        .select("*")
        .order("plant_name");

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error("Error fetching propagation guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterGuides = () => {
    let filtered = guides;

    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.plant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.propagation_method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(guide => guide.difficulty_level === difficultyFilter);
    }

    if (methodFilter !== "all") {
      filtered = filtered.filter(guide => guide.propagation_method.toLowerCase().includes(methodFilter.toLowerCase()));
    }

    setFilteredGuides(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSuccessRateColor = (rate?: number) => {
    if (!rate) return 'bg-gray-500 text-white';
    if (rate >= 80) return 'bg-green-500 text-white';
    if (rate >= 60) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Scissors className="h-8 w-8 text-primary" />
            Propagation Guides
          </h1>
          <p className="text-muted-foreground">
            Learn how to multiply your plants for free with step-by-step propagation guides
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cutting">Stem Cutting</SelectItem>
              <SelectItem value="water">Water Propagation</SelectItem>
              <SelectItem value="division">Division</SelectItem>
              <SelectItem value="leaf">Leaf Propagation</SelectItem>
              <SelectItem value="seed">Seed Propagation</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center text-sm text-muted-foreground">
            {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading propagation guides...</div>
        ) : filteredGuides.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No guides found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Dialog key={guide.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      {guide.image_urls && guide.image_urls[0] && (
                        <div className="aspect-video relative overflow-hidden rounded-md mb-3">
                          <img
                            src={guide.image_urls[0]}
                            alt={guide.plant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <CardTitle className="text-lg">{guide.plant_name}</CardTitle>
                      {guide.scientific_name && (
                        <CardDescription className="italic">
                          {guide.scientific_name}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(guide.difficulty_level)}>
                          {guide.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {guide.propagation_method}
                        </Badge>
                        {guide.success_rate && (
                          <Badge className={getSuccessRateColor(guide.success_rate)}>
                            <Target className="h-3 w-3 mr-1" />
                            {guide.success_rate}%
                          </Badge>
                        )}
                      </div>
                      
                      {guide.time_to_propagate && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {guide.time_to_propagate}
                        </div>
                      )}
                      
                      {guide.best_season && (
                        <div className="text-sm">
                          <span className="font-medium">Best season:</span> {guide.best_season}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{guide.plant_name}</DialogTitle>
                    {guide.scientific_name && (
                      <DialogDescription className="italic text-lg">
                        {guide.scientific_name}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{guide.difficulty_level}</div>
                        <div className="text-sm text-muted-foreground">Difficulty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{guide.propagation_method}</div>
                        <div className="text-sm text-muted-foreground">Method</div>
                      </div>
                      {guide.time_to_propagate && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{guide.time_to_propagate}</div>
                          <div className="text-sm text-muted-foreground">Time</div>
                        </div>
                      )}
                      {guide.success_rate && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{guide.success_rate}%</div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Materials Needed */}
                    {guide.materials_needed && guide.materials_needed.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Materials Needed</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {guide.materials_needed.map((material, index) => (
                            <Badge key={index} variant="outline" className="justify-center py-2">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step by Step Guide */}
                    {guide.step_by_step_guide && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Step by Step Instructions</h3>
                        <div className="space-y-3">
                          {Array.isArray(guide.step_by_step_guide) ? (
                            guide.step_by_step_guide.map((step: any, index: number) => (
                              <div key={index} className="flex gap-3 p-3 bg-secondary/20 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div className="text-sm">{typeof step === 'string' ? step : step.description || step.step}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {JSON.stringify(guide.step_by_step_guide, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Tips */}
                    {guide.tips && guide.tips.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Pro Tips
                        </h3>
                        <ul className="space-y-2">
                          {guide.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Common Mistakes */}
                    {guide.common_mistakes && guide.common_mistakes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Common Mistakes to Avoid
                        </h3>
                        <ul className="space-y-2">
                          {guide.common_mistakes.map((mistake, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Additional Images */}
                    {guide.image_urls && guide.image_urls.length > 1 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Reference Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {guide.image_urls.slice(1).map((url, index) => (
                            <div key={index} className="aspect-square relative overflow-hidden rounded-md">
                              <img
                                src={url}
                                alt={`${guide.plant_name} propagation ${index + 2}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropagationGuides;