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

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    console.log('OpenRouter API Key exists:', !!openrouterApiKey)
    
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not configured')
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
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

    console.log('Plant context length:', plantContextText.length)
    console.log('Question:', question)
    
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

    console.log('Making OpenRouter API request...')
    
    // Choose model based on complexity - rotate between different advanced models
    const models = [
      'deepseek/deepseek-chat',           // DeepSeek Chat - great for reasoning
      'anthropic/claude-3.5-sonnet',     // Claude Sonnet - excellent for detailed responses
      'qwen/qwen-2.5-72b-instruct',      // Qwen - good for technical content
      'meta-llama/llama-3.1-70b-instruct' // Llama - balanced performance
    ];
    
    // Use hash of question to consistently select model for similar questions
    const questionHash = question.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const selectedModel = models[Math.abs(questionHash) % models.length];
    
    console.log('Selected model:', selectedModel);
    
    const requestBody = {
      model: selectedModel,
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
      max_tokens: 2000,
      temperature: 0.7,
      stream: false
    }
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-site.com', // Replace with your actual site
        'X-Title': 'PlantCare AI',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('OpenRouter response status:', response.status)
    console.log('OpenRouter response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    console.log('OpenRouter response data:', JSON.stringify(data, null, 2))
    
    if (!response.ok) {
      console.error('OpenRouter API error - Status:', response.status)
      console.error('OpenRouter API error - Data:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response', details: data }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the structure to understand what we're getting
    console.log('Choices array:', data.choices)
    console.log('First choice:', data.choices?.[0])
    console.log('Message:', data.choices?.[0]?.message)
    console.log('Content:', data.choices?.[0]?.message?.content)
    
    const answer = data.choices?.[0]?.message?.content || 'No answer generated'
    console.log('Final answer from', selectedModel + ':', answer)

    return new Response(
      JSON.stringify({ 
        answer,
        model: selectedModel 
      }),
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