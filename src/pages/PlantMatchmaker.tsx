import { useState, useEffect } from 'react';
import { Heart, Home, Shield, Droplets, Sun, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface QuizAnswers {
  experience: string;
  lightConditions: string;
  space: string;
  petSafe: boolean;
  lowMaintenance: boolean;
  airPurifying: boolean;
  decorative: boolean;
}

interface PlantRecommendation {
  name: string;
  scientific_name: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  light: string;
  water: string;
  petSafe: boolean;
  airPurifying: boolean;
  features: string[];
  image?: string;
}

const PlantMatchmaker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    experience: '',
    lightConditions: '',
    space: '',
    petSafe: false,
    lowMaintenance: false,
    airPurifying: false,
    decorative: false,
  });
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const questions = [
    {
      id: 'experience',
      title: "What's your plant care experience?",
      type: 'radio',
      options: [
        { value: 'beginner', label: 'Beginner - I\'m new to plant care' },
        { value: 'intermediate', label: 'Intermediate - I have some experience' },
        { value: 'expert', label: 'Expert - I love challenging plants' },
      ]
    },
    {
      id: 'lightConditions',
      title: "What are your light conditions?",
      type: 'radio',
      options: [
        { value: 'low', label: 'Low light - North-facing or no direct sun' },
        { value: 'medium', label: 'Medium light - East/West-facing windows' },
        { value: 'bright', label: 'Bright light - South-facing or very sunny' },
      ]
    },
    {
      id: 'space',
      title: "Where will you place your plant?",
      type: 'radio',
      options: [
        { value: 'desktop', label: 'Desk or small table' },
        { value: 'floor', label: 'Floor space' },
        { value: 'bathroom', label: 'Bathroom' },
        { value: 'bedroom', label: 'Bedroom' },
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'balcony', label: 'Balcony or outdoor' },
      ]
    },
    {
      id: 'preferences',
      title: "What features are important to you?",
      type: 'checkbox',
      options: [
        { value: 'petSafe', label: 'Pet-safe (non-toxic to cats/dogs)' },
        { value: 'lowMaintenance', label: 'Low maintenance' },
        { value: 'airPurifying', label: 'Air purifying' },
        { value: 'decorative', label: 'Highly decorative/beautiful' },
      ]
    }
  ];

  const generateRecommendations = () => {
    // Mock recommendations based on answers
    const mockRecommendations: PlantRecommendation[] = [
      {
        name: "Snake Plant",
        scientific_name: "Sansevieria trifasciata",
        difficulty: "Easy",
        light: "Low to bright indirect",
        water: "Every 2-3 weeks",
        petSafe: false,
        airPurifying: true,
        features: ["Air purifying", "Low maintenance", "Tolerates neglect"]
      },
      {
        name: "Pothos",
        scientific_name: "Epipremnum aureum",
        difficulty: "Easy",
        light: "Low to medium",
        water: "Weekly",
        petSafe: false,
        airPurifying: true,
        features: ["Fast growing", "Trails beautifully", "Air purifying"]
      },
      {
        name: "Spider Plant",
        scientific_name: "Chlorophytum comosum",
        difficulty: "Easy",
        light: "Medium to bright indirect",
        water: "Weekly",
        petSafe: true,
        airPurifying: true,
        features: ["Pet safe", "Produces babies", "Air purifying"]
      }
    ];

    // Filter based on preferences
    let filtered = mockRecommendations;
    
    if (answers.petSafe) {
      filtered = filtered.filter(plant => plant.petSafe);
    }
    
    if (answers.experience === 'beginner') {
      filtered = filtered.filter(plant => plant.difficulty === 'Easy');
    }

    setRecommendations(filtered.slice(0, 3));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
      setCurrentStep(questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    const question = questions[currentStep];
    if (!question) return true;
    
    if (question.type === 'radio') {
      return answers[question.id as keyof QuizAnswers] !== '';
    }
    return true;
  };

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
              <h1 className="text-2xl font-bold text-foreground">Plant Matchmaker</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {currentStep < questions.length ? (
          // Quiz Section
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  {questions[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions[currentStep].type === 'radio' ? (
                  <RadioGroup
                    value={answers[questions[currentStep].id as keyof QuizAnswers] as string}
                    onValueChange={(value) => updateAnswer(questions[currentStep].id, value)}
                  >
                    {questions[currentStep].options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-3">
                    {questions[currentStep].options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={answers[option.value as keyof QuizAnswers] as boolean}
                          onCheckedChange={(checked) => updateAnswer(option.value, checked)}
                        />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="bg-gradient-primary"
                  >
                    {currentStep === questions.length - 1 ? 'Get Recommendations' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Results Section
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Your Perfect Plant Matches!</h2>
              <p className="text-muted-foreground">
                Based on your preferences, here are our top recommendations
              </p>
            </div>

            {recommendations.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No plants match your exact criteria, but don't worry!
                  </p>
                  <Button onClick={() => setCurrentStep(0)}>
                    Retake Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {recommendations.map((plant, index) => (
                  <Card key={index} className="group hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground italic">
                            {plant.scientific_name}
                          </p>
                        </div>
                        <Badge className={`
                          ${plant.difficulty === 'Easy' ? 'bg-green-500' : 
                            plant.difficulty === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'} 
                          text-white
                        `}>
                          {plant.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span>{plant.light}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span>{plant.water}</span>
                        </div>
                        {plant.petSafe && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>Pet Safe</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {plant.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-primary">
                        <Heart className="h-4 w-4 mr-2" />
                        Add to Wishlist
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(0)}
                className="mr-4"
              >
                Retake Quiz
              </Button>
              <Button onClick={() => navigate('/my-garden')}>
                View My Garden
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantMatchmaker;