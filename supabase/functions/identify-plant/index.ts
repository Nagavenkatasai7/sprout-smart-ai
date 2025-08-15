import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Starting plant identification with OpenAI...')

    // Call OpenAI Vision API for plant identification
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a plant identification expert. Analyze the image and identify the plant species. Return your response as a JSON array of plant matches, each containing:
            - name: Common name of the plant
            - scientific_name: Scientific/botanical name
            - confidence: Confidence percentage (1-100)
            - description: Brief description of the plant
            - care_level: One of "Easy", "Moderate", or "Difficult"
            - light_needs: Light requirements description
            - watering_frequency: How often to water

            Provide up to 3 possible matches, ordered by confidence. If you cannot identify the plant clearly, provide general plant care advice with lower confidence scores.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please identify this plant and provide care information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('OpenAI response received')

    let plantMatches: PlantMatch[]
    
    try {
      // Try to parse the response as JSON
      const content = data.choices[0].message.content
      console.log('Raw content:', content)
      
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        plantMatches = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON found, create a fallback response
        throw new Error('No JSON array found in response')
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, creating fallback response:', parseError)
      
      // Fallback: create a response based on the text content
      const content = data.choices[0].message.content
      plantMatches = [{
        name: "Plant Species Identified",
        scientific_name: "Based on visual analysis",
        confidence: 75,
        description: content.substring(0, 200) + "...",
        care_level: "Moderate",
        light_needs: "Bright, indirect light",
        watering_frequency: "Weekly"
      }]
    }

    // Ensure we have valid data
    if (!Array.isArray(plantMatches) || plantMatches.length === 0) {
      plantMatches = [{
        name: "Unknown Plant Species",
        scientific_name: "Species unknown",
        confidence: 50,
        description: "We detected a plant but couldn't identify the specific species. Consider taking a clearer photo with better lighting.",
        care_level: "Moderate",
        light_needs: "Bright, indirect light",
        watering_frequency: "Weekly"
      }]
    }

    console.log('Returning plant matches:', plantMatches.length)

    return new Response(
      JSON.stringify({ matches: plantMatches }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in identify-plant function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to identify plant',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})