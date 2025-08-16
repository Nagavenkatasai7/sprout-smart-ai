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

      // Generate detailed diagnosis based on symptoms
      const diagnosis = generateDetailedDiagnosis(symptoms);

      const { error } = await supabase
        .from('plant_diagnoses')
        .insert({
          user_id: user.id,
          symptoms,
          image_urls: images,
          diagnosis_type: diagnosis.type,
          identified_issue: diagnosis.issue,
          treatment_plan: diagnosis.treatment,
          prevention_tips: diagnosis.prevention,
          severity_level: diagnosis.severity
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

  const generateDetailedDiagnosis = (symptoms: string[]) => {
    const symptomsLower = symptoms.map(s => s.toLowerCase());
    
    // Comprehensive symptom analysis
    const hasYellowing = symptomsLower.some(s => s.includes('yellow'));
    const hasSpots = symptomsLower.some(s => s.includes('spot'));
    const hasWilting = symptomsLower.some(s => s.includes('wilt'));
    const hasCurling = symptomsLower.some(s => s.includes('curl'));
    const hasDropping = symptomsLower.some(s => s.includes('drop'));
    const hasStunted = symptomsLower.some(s => s.includes('stunt'));
    const hasWhitePowder = symptomsLower.some(s => s.includes('white') && s.includes('powder'));
    const hasHoles = symptomsLower.some(s => s.includes('hole'));
    const hasSticky = symptomsLower.some(s => s.includes('sticky'));
    const hasSoftRoots = symptomsLower.some(s => s.includes('soft') || s.includes('mushy'));
    
    // Complex diagnosis logic
    if (hasYellowing && hasWilting && hasStunted) {
      return {
        type: 'deficiency' as const,
        issue: 'Severe Nitrogen Deficiency with Root Stress',
        severity: 'high' as const,
        treatment: {
          immediate: [
            'Apply balanced liquid fertilizer (10-10-10) diluted to half strength immediately',
            'Check soil drainage - ensure no waterlogging',
            'Remove yellowed leaves to redirect energy to healthy growth',
            'Test soil pH (should be 6.0-7.0 for most plants)',
            'Inspect roots for signs of rot or damage'
          ],
          longTerm: [
            'Establish regular feeding schedule: liquid fertilizer every 2 weeks during growing season',
            'Improve soil with organic compost or well-rotted manure',
            'Consider soil test for comprehensive nutrient analysis',
            'Monitor new growth for improvement over 2-3 weeks',
            'Gradually increase fertilizer to full strength as plant recovers'
          ]
        },
        prevention: [
          'Regular soil testing every 6 months',
          'Consistent watering schedule - soil should be moist but not waterlogged',
          'Use slow-release fertilizer granules in spring',
          'Mulch around base to retain moisture and nutrients',
          'Watch for early signs: slight yellowing of older leaves first'
        ]
      };
    } else if (hasSpots && hasYellowing) {
      return {
        type: 'disease' as const,
        issue: 'Bacterial or Fungal Leaf Blight',
        severity: 'high' as const,
        treatment: {
          immediate: [
            'Isolate plant immediately to prevent spread to other plants',
            'Remove ALL affected leaves and dispose in trash (not compost)',
            'Sterilize pruning tools with 70% isopropyl alcohol between cuts',
            'Apply copper-based fungicide spray in early morning or evening',
            'Improve air circulation around plant - space from other plants',
            'Stop overhead watering immediately - water at soil level only'
          ],
          longTerm: [
            'Continue fungicide treatment every 7-10 days for 3-4 weeks',
            'Monitor daily for new spots or spread',
            'Gradually reintroduce to normal spacing once no new symptoms for 2 weeks',
            'Consider systemic fungicide if problem persists',
            'Improve growing conditions: better drainage, air flow, appropriate humidity'
          ]
        },
        prevention: [
          'Always water at soil level, never on leaves',
          'Ensure adequate spacing between plants for air circulation',
          'Remove fallen leaves and plant debris regularly',
          'Avoid working with plants when wet',
          'Quarantine new plants for 2 weeks before introducing to collection'
        ]
      };
    } else if (hasWhitePowder) {
      return {
        type: 'disease' as const,
        issue: 'Powdery Mildew Infection',
        severity: 'medium' as const,
        treatment: {
          immediate: [
            'Increase air circulation immediately - use fan if indoors',
            'Reduce humidity around plant (ideal: 40-50%)',
            'Remove heavily affected leaves and dispose properly',
            'Spray with baking soda solution: 1 tsp per quart water + few drops dish soap',
            'Apply in evening to avoid leaf burn',
            'Move to location with better air flow'
          ],
          longTerm: [
            'Treat weekly with neem oil or horticultural oil',
            'Monitor humidity levels and maintain proper ventilation',
            'Consider fungicide spray if home remedies ineffective',
            'Gradually improve growing conditions over 2-3 weeks',
            'Watch for new growth to be clean and healthy'
          ]
        },
        prevention: [
          'Maintain good air circulation at all times',
          'Avoid overcrowding plants',
          'Water early in day so leaves dry quickly',
          'Keep humidity levels appropriate for plant type',
          'Regular inspection for early white dusting on leaves'
        ]
      };
    } else if (hasHoles && hasSticky) {
      return {
        type: 'pest' as const,
        issue: 'Aphid and Pest Infestation',
        severity: 'medium' as const,
        treatment: {
          immediate: [
            'Rinse plant with strong stream of water to dislodge aphids',
            'Apply insecticidal soap spray to all surfaces, including undersides of leaves',
            'Wipe sticky honeydew residue with damp cloth',
            'Check surrounding plants for spread',
            'Apply neem oil treatment in evening hours'
          ],
          longTerm: [
            'Repeat insecticidal soap treatment every 3-4 days for 2 weeks',
            'Introduce beneficial insects like ladybugs if outdoors',
            'Monitor weekly for new pest activity',
            'Improve plant health to increase natural resistance',
            'Consider systemic insecticide if infestation severe'
          ]
        },
        prevention: [
          'Regular inspection of new growth and leaf undersides',
          'Encourage beneficial insects with diverse plantings',
          'Avoid over-fertilizing with nitrogen (attracts aphids)',
          'Quarantine new plants before adding to collection',
          'Maintain proper plant spacing and air circulation'
        ]
      };
    } else if (hasSoftRoots || (hasWilting && hasYellowing)) {
      return {
        type: 'environmental' as const,
        issue: 'Root Rot from Overwatering',
        severity: 'critical' as const,
        treatment: {
          immediate: [
            'STOP watering immediately',
            'Remove plant from pot and inspect root system',
            'Cut away all black, mushy, or foul-smelling roots with sterile scissors',
            'Rinse remaining healthy roots with clean water',
            'Dust cut roots with rooting hormone or cinnamon powder',
            'Repot in fresh, well-draining potting mix',
            'Use terracotta pot with drainage holes if possible'
          ],
          longTerm: [
            'Wait 1-2 weeks before watering again, depending on soil moisture',
            'Water only when top inch of soil is dry',
            'Monitor closely for new growth over 4-6 weeks',
            'Consider adding perlite or sand to improve soil drainage',
            'May take several months for full recovery'
          ]
        },
        prevention: [
          'Always check soil moisture before watering',
          'Ensure all pots have proper drainage holes',
          'Use well-draining potting mix appropriate for plant type',
          'Water deeply but infrequently rather than frequent light watering',
          'Adjust watering frequency with seasons and plant growth stage'
        ]
      };
    } else if (hasCurling && hasDropping) {
      return {
        type: 'environmental' as const,
        issue: 'Environmental Stress - Light or Temperature',
        severity: 'medium' as const,
        treatment: {
          immediate: [
            'Assess current light conditions - too much direct sun or too little light',
            'Check for temperature extremes: cold drafts, heat sources, AC vents',
            'Move to location with appropriate light for plant species',
            'Ensure temperature is within plant\'s preferred range (usually 65-75°F)',
            'Check humidity levels - many houseplants prefer 40-60% humidity'
          ],
          longTerm: [
            'Gradually acclimate plant to new conditions over 1-2 weeks',
            'Monitor for improvement in new growth',
            'Consider grow light if natural light insufficient',
            'Use humidity tray or humidifier if air too dry',
            'Maintain consistent environmental conditions'
          ]
        },
        prevention: [
          'Research specific light and temperature needs for your plant species',
          'Use thermometer and light meter to monitor conditions',
          'Rotate plant weekly for even light exposure',
          'Keep away from heat sources, cold windows, and air vents',
          'Group plants together to create beneficial microclimate'
        ]
      };
    } else {
      // Default comprehensive care advice
      return {
        type: 'environmental' as const,
        issue: 'General Plant Health Assessment Needed',
        severity: 'low' as const,
        treatment: {
          immediate: [
            'Conduct thorough plant inspection: check roots, stems, and all leaf surfaces',
            'Assess watering schedule and soil moisture levels',
            'Evaluate light conditions and plant placement',
            'Check for any signs of pests on undersides of leaves',
            'Review recent changes in care routine or environment'
          ],
          longTerm: [
            'Establish consistent care routine based on plant species requirements',
            'Keep care log to track watering, fertilizing, and plant responses',
            'Research specific needs for your plant variety',
            'Consider seasonal adjustments to care routine',
            'Plan regular health check-ups monthly'
          ]
        },
        prevention: [
          'Learn about your specific plant\'s native habitat and preferred conditions',
          'Maintain consistent watering and fertilizing schedule',
          'Provide appropriate light, temperature, and humidity',
          'Regular inspection for early problem detection',
          'Keep plants in appropriate-sized containers with good drainage'
        ]
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