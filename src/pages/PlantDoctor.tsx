import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Search, Bug, Droplets, Sun, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PlantDiagnosis {
  id: string;
  symptoms: string[];
  diagnosis_type: 'disease' | 'pest' | 'deficiency' | 'environmental';
  identified_issue?: string;
  treatment_plan?: any;
  prevention_tips?: string[];
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
}

const PlantDoctor = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<PlantDiagnosis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchDiagnoses();
    }
  }, [user, loading, navigate]);

  const commonSymptoms = [
    'Yellowing leaves',
    'Brown spots on leaves',
    'Wilting',
    'Stunted growth',
    'White powdery substance',
    'Black spots',
    'Curling leaves',
    'Dropping leaves',
    'Small holes in leaves',
    'Sticky residue',
    'Discolored stems',
    'Soft/mushy roots'
  ];

  const fetchDiagnoses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('plant_diagnoses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiagnoses((data || []).map(item => ({
        ...item,
        diagnosis_type: item.diagnosis_type as 'disease' | 'pest' | 'deficiency' | 'environmental',
        severity_level: item.severity_level as 'low' | 'medium' | 'high' | 'critical'
      })));
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
      setSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    setImages(prev => [...prev, previewUrl]);
  };

  const handleClearImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCurrentImage = () => {
    if (images.length > 0) {
      handleClearImage(currentImageIndex);
      if (currentImageIndex >= images.length - 1) {
        setCurrentImageIndex(Math.max(0, images.length - 2));
      }
    }
  };

  const analyzePlant = async () => {
    if (!user || symptoms.length === 0) return;

    setIsAnalyzing(true);
    try {
      // Log activity
      await supabase.rpc('log_user_activity', {
        user_id_param: user.id,
        activity_type_param: 'plant_diagnosis_requested',
        entity_type_param: 'plant_diagnosis',
        activity_data_param: JSON.stringify({ symptoms, image_count: images.length })
      });

      // Mock diagnosis logic - in a real app, this would call an AI service
      const mockDiagnosis = generateMockDiagnosis(symptoms);

      const { error } = await supabase
        .from('plant_diagnoses')
        .insert({
          user_id: user.id,
          symptoms,
          image_urls: images,
          diagnosis_type: mockDiagnosis.type,
          identified_issue: mockDiagnosis.issue,
          treatment_plan: mockDiagnosis.treatment,
          prevention_tips: mockDiagnosis.prevention,
          severity_level: mockDiagnosis.severity
        });

      if (error) throw error;
      
      // Reset form
      setSymptoms([]);
      setImages([]);
      setCurrentImageIndex(0);
      setCustomSymptom('');
      
      // Refresh diagnoses
      fetchDiagnoses();
    } catch (error) {
      console.error('Error analyzing plant:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockDiagnosis = (symptoms: string[]) => {
    // Simple mock logic based on symptoms
    if (symptoms.some(s => s.toLowerCase().includes('yellow'))) {
      return {
        type: 'deficiency' as const,
        issue: 'Nitrogen Deficiency',
        severity: 'medium' as const,
        treatment: {
          immediate: ['Apply nitrogen-rich fertilizer', 'Check watering schedule'],
          longTerm: ['Improve soil quality', 'Regular feeding schedule']
        },
        prevention: ['Regular fertilization', 'Soil testing', 'Proper watering']
      };
    } else if (symptoms.some(s => s.toLowerCase().includes('spot'))) {
      return {
        type: 'disease' as const,
        issue: 'Fungal Leaf Spot',
        severity: 'high' as const,
        treatment: {
          immediate: ['Remove affected leaves', 'Apply fungicide', 'Improve air circulation'],
          longTerm: ['Monitor closely', 'Adjust watering method']
        },
        prevention: ['Avoid overhead watering', 'Ensure good air circulation', 'Remove plant debris']
      };
    } else {
      return {
        type: 'environmental' as const,
        issue: 'Stress Response',
        severity: 'low' as const,
        treatment: {
          immediate: ['Check light conditions', 'Adjust watering', 'Monitor temperature'],
          longTerm: ['Optimize growing conditions', 'Regular monitoring']
        },
        prevention: ['Maintain consistent care', 'Monitor environmental conditions']
      };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disease': return <Bug className="h-4 w-4" />;
      case 'pest': return <Shield className="h-4 w-4" />;
      case 'deficiency': return <Droplets className="h-4 w-4" />;
      case 'environmental': return <Sun className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
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
              <h1 className="text-2xl font-bold text-foreground">Plant Doctor</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Diagnostic Tool */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Plant Symptom Checker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Symptom Selection */}
                <div>
                  <h3 className="font-medium mb-3">Select observed symptoms:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {commonSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant={symptoms.includes(symptom) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSymptom(symptom)}
                        className="text-xs h-auto py-2 px-3"
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Symptom */}
                <div>
                  <h3 className="font-medium mb-3">Add custom symptom:</h3>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Describe any other symptoms you've noticed..."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button 
                      onClick={addCustomSymptom}
                      disabled={!customSymptom.trim()}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Selected Symptoms */}
                {symptoms.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Selected symptoms:</h3>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer">
                          {symptom}
                          <button
                            onClick={() => toggleSymptom(symptom)}
                            className="ml-2 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <h3 className="font-medium mb-3">Upload photos (optional):</h3>
                  <div className="space-y-4">
                    <ImageUpload 
                      onImageSelect={handleImageSelect}
                      selectedImage={images[currentImageIndex] || ""}
                      onClearImage={images.length > 0 ? handleClearCurrentImage : undefined}
                    />
                    
                    {images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Image {currentImageIndex + 1} of {images.length}
                          </span>
                          {images.length > 1 && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                                disabled={currentImageIndex === 0}
                              >
                                Previous
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                                disabled={currentImageIndex === images.length - 1}
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Thumbnail strip */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {images.map((img, index) => (
                            <div 
                              key={index}
                              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                                index === currentImageIndex ? 'border-primary' : 'border-border'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img 
                                src={img} 
                                alt={`Upload ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearImage(index);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analyze Button */}
                <Button 
                  onClick={analyzePlant}
                  disabled={symptoms.length === 0 || isAnalyzing}
                  className="w-full bg-gradient-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Analyze Plant Issues
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Previous Diagnoses */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Previous Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnoses.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No diagnoses yet</h3>
                    <p className="text-muted-foreground">
                      Start by describing your plant's symptoms to get expert analysis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diagnoses.slice(0, 5).map((diagnosis) => (
                      <Card key={diagnosis.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(diagnosis.diagnosis_type)}
                              <span className="font-medium capitalize">
                                {diagnosis.diagnosis_type}
                              </span>
                            </div>
                            <Badge className={`${getSeverityColor(diagnosis.severity_level)} text-white text-xs`}>
                              {diagnosis.severity_level}
                            </Badge>
                          </div>
                          
                          {diagnosis.identified_issue && (
                            <h4 className="font-medium mb-2">{diagnosis.identified_issue}</h4>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {diagnosis.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {new Date(diagnosis.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDoctor;