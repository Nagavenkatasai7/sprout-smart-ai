import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import PlantGuideQuestionnaire from '@/components/PlantGuideQuestionnaire';

const PlantGuide = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">PlantCare AI</span>
            </div>
          </div>
          <UserNav />
        </div>
      </nav>

      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Plant Care Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get personalized plant care advice powered by AI. Ask questions about your plants and receive expert guidance based on your collection.
            </p>
          </div>

          <PlantGuideQuestionnaire />
        </div>
      </section>
    </div>
  );
};

export default PlantGuide;