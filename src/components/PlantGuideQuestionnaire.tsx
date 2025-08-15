import { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, MessageSquare, Database, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPlant {
  id: string;
  plant_name: string;
  scientific_name: string;
  care_instructions: any;
  light_requirements: string;
  watering_frequency: number;
  humidity_preference: string;
  difficulty_level: string;
  toxic_to_pets: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  model?: string;
}

const PlantGuideQuestionnaire = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserPlants();
    }
  }, [user]);

  const fetchUserPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserPlants(data || []);
    } catch (error) {
      console.error('Error fetching user plants:', error);
      toast({
        title: "Error",
        description: "Failed to load your plants.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlants(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create plant context from user's plants
      const plantContext = userPlants.map(plant => ({
        name: plant.plant_name,
        scientific_name: plant.scientific_name,
        care_instructions: plant.care_instructions,
        light_requirements: plant.light_requirements,
        watering_frequency: plant.watering_frequency,
        humidity_preference: plant.humidity_preference,
        difficulty_level: plant.difficulty_level,
        toxic_to_pets: plant.toxic_to_pets
      }));

      const { data, error } = await supabase.functions.invoke('plant-guide-chat', {
        body: {
          question: currentQuestion,
          plantContext: plantContext,
          previousQuestions: questions.slice(-5) // Include last 5 questions for context
        }
      });

      if (error) throw error;

      const newQuestion: Question = {
        id: Date.now().toString(),
        question: currentQuestion,
        answer: data.answer,
        timestamp: new Date(),
        model: data.model // Store which model was used
      };

      setQuestions(prev => [...prev, newQuestion]);
      setCurrentQuestion('');
      
      toast({
        title: "Answer generated!",
        description: "Your plant care question has been answered.",
      });
    } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  if (loadingPlants) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading your plants...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Plant Care Questionnaire
          </CardTitle>
          <CardDescription>
            Ask questions about plant care and get personalized answers based on your plant collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userPlants.length === 0 ? (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                You don't have any plants identified yet. Start by uploading a plant photo to build your collection and get personalized advice.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Your Plant Collection ({userPlants.length} plants)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userPlants.map((plant) => (
                    <span
                      key={plant.id}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {plant.plant_name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything about plant care (e.g., 'Why are my monstera leaves turning yellow?')"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={isLoading || !currentQuestion.trim()}
                  size="sm"
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recent Questions & Answers
          </h3>
          {questions.slice(-10).reverse().map((qa) => (
            <Card key={qa.id} className="bg-gradient-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm text-muted-foreground mb-1">Your Question:</p>
                    <p className="text-foreground">{qa.question}</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Answer:
                      </p>
                      {qa.model && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {qa.model.includes('deepseek') ? 'DeepSeek' : 
                           qa.model.includes('claude') ? 'Claude' :
                           qa.model.includes('qwen') ? 'Qwen' :
                           qa.model.includes('llama') ? 'Llama' : 'AI'}
                        </span>
                      )}
                    </div>
                    <div className="text-foreground whitespace-pre-wrap">{qa.answer}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {qa.timestamp.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantGuideQuestionnaire;