import { useState } from 'react';
import { Check, Leaf, Star, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlantMatch {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  careLevel: 'Beginner' | 'Intermediate' | 'Expert';
  lightNeeds: string;
  waterFrequency: string;
}

interface PlantIdentificationProps {
  isLoading: boolean;
  matches: PlantMatch[];
  onSelectPlant: (plant: PlantMatch) => void;
  selectedPlantId?: string;
}

// Mock data for demonstration
const mockMatches: PlantMatch[] = [
  {
    id: '1',
    name: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    confidence: 94,
    description: 'A popular trailing houseplant with heart-shaped, golden-green leaves.',
    careLevel: 'Beginner',
    lightNeeds: 'Low to bright indirect light',
    waterFrequency: 'Every 7-10 days'
  },
  {
    id: '2',
    name: 'Philodendron Brasil',
    scientificName: 'Philodendron hederaceum',
    confidence: 87,
    description: 'Fast-growing vine with heart-shaped leaves featuring lime green variegation.',
    careLevel: 'Beginner',
    lightNeeds: 'Medium to bright indirect light',
    waterFrequency: 'Every 5-7 days'
  },
  {
    id: '3',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    confidence: 78,
    description: 'Iconic split-leaf tropical plant, perfect for statement pieces.',
    careLevel: 'Intermediate',
    lightNeeds: 'Bright indirect light',
    waterFrequency: 'Every 7-14 days'
  }
];

export const PlantIdentification = ({ 
  isLoading, 
  matches = mockMatches, 
  onSelectPlant, 
  selectedPlantId 
}: PlantIdentificationProps) => {
  const [selectedMatch, setSelectedMatch] = useState<PlantMatch | null>(null);

  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-card shadow-soft animate-fade-up">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Identifying your plant...</h3>
            <p className="text-muted-foreground">
              Our AI is analyzing your image
            </p>
          </div>
          <div className="space-y-2">
            <Progress value={75} className="w-full" />
            <p className="text-sm text-muted-foreground">Processing image...</p>
          </div>
        </div>
      </Card>
    );
  }

  const handleSelectPlant = (plant: PlantMatch) => {
    setSelectedMatch(plant);
    onSelectPlant(plant);
  };

  const getCareColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Plant Identification Results</h3>
        <p className="text-muted-foreground">
          We found {matches.length} possible matches. Select the most accurate one:
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((match, index) => (
          <Card 
            key={match.id}
            className={`
              p-6 cursor-pointer transition-all duration-300 hover:shadow-soft
              ${selectedMatch?.id === match.id ? 'ring-2 ring-primary shadow-glow bg-primary/5' : 'bg-gradient-card hover:scale-[1.01]'}
            `}
            onClick={() => handleSelectPlant(match)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-foreground">
                      {match.name}
                    </span>
                    {selectedMatch?.id === match.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <Badge 
                    variant="outline"
                    className={getCareColor(match.careLevel)}
                  >
                    {match.careLevel}
                  </Badge>
                </div>

                <p className="text-sm italic text-muted-foreground">
                  {match.scientificName}
                </p>

                <p className="text-sm text-foreground">
                  {match.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Light needs:</span>
                    </div>
                    <p className="text-muted-foreground">{match.lightNeeds}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Watering:</span>
                    </div>
                    <p className="text-muted-foreground">{match.waterFrequency}</p>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {match.confidence}%
                </div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <Progress 
                  value={match.confidence} 
                  className="w-20" 
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedMatch && (
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow animate-scale-in">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold">Perfect! You've selected {selectedMatch.name}</h4>
            <p className="text-primary-foreground/80">
              Let's create your personalized care schedule
            </p>
            <Button 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Continue to Care Setup
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};