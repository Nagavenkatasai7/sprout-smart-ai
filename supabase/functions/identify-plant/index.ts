import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlantMatch {
  name: string;
  scientific_name: string;
  confidence: number;
  description: string;
  care_level: 'Easy' | 'Moderate' | 'Difficult';
  light_needs: string;
  watering_frequency: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Google Cloud Vision credentials from Supabase secrets
    const credentials = Deno.env.get('GOOGLE_CLOUD_VISION_CREDENTIALS')
    if (!credentials) {
      throw new Error('Google Cloud Vision credentials not configured')
    }

    let credentialsJson
    try {
      credentialsJson = JSON.parse(credentials)
    } catch (error) {
      console.error('Failed to parse credentials:', error)
      throw new Error('Invalid Google Cloud Vision credentials format. Please ensure you upload the complete service account JSON file.')
    }

    // Generate access token for Google Cloud Vision API
    const jwt = await createJWT(credentialsJson)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: image.split(',')[1], // Remove data:image/jpeg;base64, prefix
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 10,
                },
                {
                  type: 'WEB_DETECTION',
                  maxResults: 5,
                },
              ],
            },
          ],
        }),
      }
    )

    const visionData = await visionResponse.json()
    const annotations = visionData.responses[0]

    // Process the vision results to identify plants
    const plantMatches = await processVisionResults(annotations)

    return new Response(
      JSON.stringify({ matches: plantMatches }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in identify-plant function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to identify plant' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createJWT(credentials: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encoder = new TextEncoder()
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signingInput = `${encodedHeader}.${encodedPayload}`

  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new Uint8Array(atob(credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|\r?\n|-----END PRIVATE KEY-----/g, '')).split('').map(c => c.charCodeAt(0))),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signingInput)
  )

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signingInput}.${encodedSignature}`
}

async function processVisionResults(annotations: any): Promise<PlantMatch[]> {
  const labels = annotations.labelAnnotations || []
  const webEntities = annotations.webDetection?.webEntities || []
  
  // Look for plant-related labels
  const plantLabels = labels.filter((label: any) => 
    label.description.toLowerCase().includes('plant') ||
    label.description.toLowerCase().includes('flower') ||
    label.description.toLowerCase().includes('leaf') ||
    label.description.toLowerCase().includes('tree') ||
    label.description.toLowerCase().includes('herb') ||
    label.description.toLowerCase().includes('succulent') ||
    label.description.toLowerCase().includes('fern') ||
    label.description.toLowerCase().includes('moss')
  )

  // Combine with web entities for better plant identification
  const plantEntities = webEntities.filter((entity: any) =>
    entity.description && (
      entity.description.toLowerCase().includes('plant') ||
      entity.description.toLowerCase().includes('flower') ||
      entity.description.toLowerCase().includes('tree') ||
      entity.description.toLowerCase().includes('succulent')
    )
  )

  // Generate plant matches based on identified features
  const matches: PlantMatch[] = []
  
  // Use the most confident plant-related detections
  const topDetections = [...plantLabels, ...plantEntities]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3)

  for (const detection of topDetections) {
    const plantName = detection.description
    const confidence = Math.round((detection.score || 0.5) * 100)
    
    matches.push({
      name: formatPlantName(plantName),
      scientific_name: generateScientificName(plantName),
      confidence,
      description: generateDescription(plantName),
      care_level: generateCareLevel(plantName),
      light_needs: generateLightNeeds(plantName),
      watering_frequency: generateWateringFrequency(plantName)
    })
  }

  // If no plant matches found, provide generic plant suggestions
  if (matches.length === 0) {
    matches.push({
      name: "Unknown Plant Species",
      scientific_name: "Species unknown",
      confidence: 50,
      description: "We detected plant-like features but couldn't identify the specific species. Consider taking a clearer photo with better lighting.",
      care_level: "Moderate",
      light_needs: "Bright, indirect light",
      watering_frequency: "Weekly"
    })
  }

  return matches
}

function formatPlantName(name: string): string {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function generateScientificName(plantName: string): string {
  const scientificNames: { [key: string]: string } = {
    'rose': 'Rosa spp.',
    'tulip': 'Tulipa spp.',
    'sunflower': 'Helianthus annuus',
    'oak': 'Quercus spp.',
    'maple': 'Acer spp.',
    'succulent': 'Various families',
    'fern': 'Pteridophyta',
    'moss': 'Bryophyta',
    'lily': 'Lilium spp.',
    'daisy': 'Bellis perennis'
  }
  
  const lowerName = plantName.toLowerCase()
  for (const [key, value] of Object.entries(scientificNames)) {
    if (lowerName.includes(key)) {
      return value
    }
  }
  
  return `${plantName.split(' ')[0]} spp.`
}

function generateDescription(plantName: string): string {
  const descriptions: { [key: string]: string } = {
    'rose': 'A classic flowering plant known for its beautiful blooms and thorny stems.',
    'succulent': 'A water-storing plant adapted to arid climates, perfect for beginners.',
    'fern': 'An ancient plant that thrives in humid, shaded environments.',
    'tree': 'A woody perennial plant with a main trunk and branches.',
    'flower': 'A beautiful flowering plant that adds color to any garden.',
    'herb': 'A useful plant often grown for culinary or medicinal purposes.'
  }
  
  const lowerName = plantName.toLowerCase()
  for (const [key, value] of Object.entries(descriptions)) {
    if (lowerName.includes(key)) {
      return value
    }
  }
  
  return `A ${plantName.toLowerCase()} with unique characteristics and growing requirements.`
}

function generateCareLevel(plantName: string): 'Easy' | 'Moderate' | 'Difficult' {
  const lowerName = plantName.toLowerCase()
  
  if (lowerName.includes('succulent') || lowerName.includes('cactus')) return 'Easy'
  if (lowerName.includes('orchid') || lowerName.includes('bonsai')) return 'Difficult'
  
  return 'Moderate'
}

function generateLightNeeds(plantName: string): string {
  const lowerName = plantName.toLowerCase()
  
  if (lowerName.includes('succulent') || lowerName.includes('cactus')) return 'Bright, direct light'
  if (lowerName.includes('fern') || lowerName.includes('moss')) return 'Low to medium light'
  
  return 'Bright, indirect light'
}

function generateWateringFrequency(plantName: string): string {
  const lowerName = plantName.toLowerCase()
  
  if (lowerName.includes('succulent') || lowerName.includes('cactus')) return 'Every 2-3 weeks'
  if (lowerName.includes('fern') || lowerName.includes('moss')) return 'Keep soil moist'
  
  return 'Weekly'
}