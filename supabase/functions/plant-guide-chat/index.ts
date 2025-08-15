import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlantContext {
  name: string;
  scientific_name?: string;
  care_instructions?: any;
  light_requirements?: string;
  watering_frequency?: number;
  humidity_preference?: string;
  difficulty_level?: string;
  toxic_to_pets?: boolean;
}

interface PreviousQuestion {
  question: string;
  answer: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, plantContext, previousQuestions } = await req.json()

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build context from user's plants
    let plantContextText = '';
    if (plantContext && plantContext.length > 0) {
      plantContextText = `\n\nUser's Plant Collection:\n${plantContext.map((plant: PlantContext) => {
        return `- ${plant.name}${plant.scientific_name ? ` (${plant.scientific_name})` : ''}
  Light: ${plant.light_requirements || 'Not specified'}
  Watering: ${plant.watering_frequency ? `Every ${plant.watering_frequency} days` : 'Not specified'}
  Humidity: ${plant.humidity_preference || 'Not specified'}
  Difficulty: ${plant.difficulty_level || 'Not specified'}
  Pet Safe: ${plant.toxic_to_pets === false ? 'Yes' : plant.toxic_to_pets === true ? 'No' : 'Unknown'}
  Care Instructions: ${plant.care_instructions ? JSON.stringify(plant.care_instructions) : 'None available'}`
      }).join('\n\n')}`;
    }

    // Build conversation context
    let conversationContext = '';
    if (previousQuestions && previousQuestions.length > 0) {
      conversationContext = `\n\nPrevious Conversation:\n${previousQuestions.map((qa: PreviousQuestion) => 
        `Q: ${qa.question}\nA: ${qa.answer}`
      ).join('\n\n')}`;
    }

    const systemPrompt = `You are an expert plant care assistant with deep knowledge of botany, horticulture, and plant care. Your role is to provide helpful, accurate, and personalized advice about plant care.

Guidelines:
- Always provide specific, actionable advice
- Consider the user's specific plants when giving recommendations
- If the user's question relates to their plants, reference them specifically
- Include care tips, troubleshooting, and prevention advice
- Be encouraging and supportive
- If you're unsure about something, say so and suggest consulting a local expert
- Focus on practical solutions that a home gardener can implement
- Include seasonal considerations when relevant
- Always prioritize plant and human safety

Format your responses clearly with:
- Direct answers to the question
- Specific care recommendations
- Warning signs to watch for
- Next steps or follow-up care

${plantContextText}${conversationContext}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_completion_tokens: 1000,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('OpenAI API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const answer = data.choices[0]?.message?.content || 'No answer generated'

    return new Response(
      JSON.stringify({ answer }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in plant-guide-chat function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})