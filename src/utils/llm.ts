/**
 * Central LLM utility with multi-provider support
 * Provides standardized JSON output and error handling fallbacks
 */

// Environment configuration
const LLM_PROVIDER = process.env.VITE_LLM_PROVIDER || 'openai'; // 'openai' | 'ollama'
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const OLLAMA_BASE_URL = process.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';

// Provider configurations
const PROVIDER_CONFIG = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  ollama: {
    baseURL: OLLAMA_BASE_URL,
    model: 'llama2',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

export interface LLMResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  model: string;
}

export interface AgentAnalysisRequest {
  role: string;
  persona: string;
  expertise: string[];
  topic: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedDuration: number;
  };
  companyContext: {
    name: string;
    industry: string;
    size: string;
    stage: string;
    description: string;
    challenges: string[];
    goals: string[];
  };
  conversationHistory?: Array<{
    agentId: string;
    text: string;
    timestamp: Date;
  }>;
  userInput?: string;
}

export interface AgentAnalysisOutput {
  decision: 'approve' | 'reject' | 'neutral' | 'conditional';
  confidence: number; // 0-100
  reasoning: string;
  role_specific_insights: string[];
  concerns?: string[];
  recommendations?: string[];
  next_steps?: string[];
}

/**
 * Central LLM call function with provider abstraction
 */
export async function call_llm<T = AgentAnalysisOutput>(
  prompt: string,
  outputSchema?: any,
  options: {
    temperature?: number;
    maxTokens?: number;
    provider?: 'openai' | 'ollama';
  } = {}
): Promise<LLMResponse<T>> {
  const provider = options.provider || LLM_PROVIDER;
  const config = PROVIDER_CONFIG[provider as keyof typeof PROVIDER_CONFIG];
  
  if (!config) {
    return {
      success: false,
      error: `Unsupported provider: ${provider}`,
      provider,
      model: 'unknown'
    };
  }

  try {
    console.log(`🤖 Calling ${provider} LLM with model ${config.model}`);
    
    const response = await callProvider(provider, prompt, config, options);
    
    if (!response.success) {
      console.warn(`❌ ${provider} failed, attempting fallback`);
      return getFallbackResponse<T>(prompt, provider, config.model);
    }

    // Validate and parse JSON response
    const parsedData = parseAndValidateResponse<T>(response.data, outputSchema);
    
    return {
      success: true,
      data: parsedData,
      provider,
      model: config.model
    };

  } catch (error) {
    console.error(`❌ LLM call failed for ${provider}:`, error);
    return getFallbackResponse<T>(prompt, provider, config.model);
  }
}

/**
 * Provider-specific API calls
 */
async function callProvider(
  provider: string,
  prompt: string,
  config: any,
  options: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  if (provider === 'openai') {
    return callOpenAI(prompt, config, options);
  } else if (provider === 'ollama') {
    return callOllama(prompt, config, options);
  }
  
  return { success: false, error: 'Unknown provider' };
}

/**
 * OpenAI API integration
 */
async function callOpenAI(
  prompt: string,
  config: any,
  options: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  if (!OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  const requestBody = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert executive advisor. Always respond with valid JSON matching the requested schema.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
    response_format: { type: 'json_object' }
  };

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return { success: false, error: `OpenAI API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return { success: false, error: 'No content in OpenAI response' };
    }

    return { success: true, data: content };
    
  } catch (error) {
    return { success: false, error: `OpenAI request failed: ${error}` };
  }
}

/**
 * Ollama API integration
 */
async function callOllama(
  prompt: string,
  config: any,
  options: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  const requestBody = {
    model: config.model,
    prompt: `${prompt}\n\nRespond with valid JSON only.`,
    stream: false,
    options: {
      temperature: options.temperature || 0.7,
      num_predict: options.maxTokens || 1000
    }
  };

  try {
    const response = await fetch(`${config.baseURL}/api/generate`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return { success: false, error: `Ollama API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.response;
    
    if (!content) {
      return { success: false, error: 'No content in Ollama response' };
    }

    return { success: true, data: content };
    
  } catch (error) {
    return { success: false, error: `Ollama request failed: ${error}` };
  }
}

/**
 * Parse and validate JSON response
 */
function parseAndValidateResponse<T>(
  responseText: string,
  schema?: any
): T {
  try {
    // Clean the response text (remove markdown code blocks if present)
    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanedText);
    
    // Basic validation - ensure required fields exist
    if (schema && !validateSchema(parsed, schema)) {
      throw new Error('Response does not match expected schema');
    }
    
    return parsed as T;
    
  } catch (error) {
    console.warn('Failed to parse LLM response as JSON:', error);
    throw new Error(`Invalid JSON response: ${error}`);
  }
}

/**
 * Basic schema validation
 */
function validateSchema(data: any, schema: any): boolean {
  // Simple validation - check if required fields exist
  const requiredFields = ['decision', 'confidence', 'reasoning', 'role_specific_insights'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate confidence is a number between 0-100
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
    console.warn('Invalid confidence value');
    return false;
  }
  
  // Validate decision is one of allowed values
  const allowedDecisions = ['approve', 'reject', 'neutral', 'conditional'];
  if (!allowedDecisions.includes(data.decision)) {
    console.warn('Invalid decision value');
    return false;
  }
  
  return true;
}

/**
 * Fallback response when LLM fails
 */
function getFallbackResponse<T>(
  prompt: string,
  provider: string,
  model: string
): LLMResponse<T> {
  
  console.log('🔄 Generating fallback response');
  
  // Extract role from prompt for contextual fallback
  const roleMatch = prompt.match(/Role:\s*(\w+)/i);
  const role = roleMatch?.[1] || 'Executive';
  
  const fallbackData = {
    decision: 'neutral' as const,
    confidence: 65,
    reasoning: `As ${role}, I need more detailed analysis before making a definitive recommendation. The proposal has both opportunities and risks that require careful evaluation.`,
    role_specific_insights: [
      `From a ${role.toLowerCase()} perspective, this initiative requires thorough due diligence`,
      'The strategic implications need deeper analysis before proceeding',
      'Risk mitigation strategies should be developed and evaluated'
    ],
    concerns: [
      'Insufficient data for comprehensive analysis',
      'Potential implementation challenges not fully addressed',
      'Resource allocation and timeline considerations need review'
    ],
    recommendations: [
      'Conduct additional stakeholder analysis',
      'Develop detailed implementation roadmap',
      'Establish clear success metrics and KPIs'
    ]
  } as T;

  return {
    success: true,
    data: fallbackData,
    provider: `${provider}-fallback`,
    model: `${model}-fallback`
  };
}

/**
 * Utility function for agent-specific prompts
 */
export function buildAgentPrompt(request: AgentAnalysisRequest): string {
  const { role, persona, expertise, topic, companyContext, conversationHistory, userInput } = request;
  
  const conversationContext = conversationHistory && conversationHistory.length > 0
    ? conversationHistory.slice(-5).map(msg => `${msg.agentId}: ${msg.text}`).join('\n')
    : 'No previous discussion';

  const userInputSection = userInput 
    ? `\n\nSTAKEHOLDER INPUT:\n"${userInput}"\n\nYou must address this stakeholder input in your analysis.`
    : '';

  return `You are the ${role} of ${companyContext.name}, a ${companyContext.stage} ${companyContext.industry} company.

## Agent Role
${role} focusing on ${role === 'CEO' ? 'strategic leadership and vision' : 
  role === 'CTO' ? 'technical architecture and innovation' :
  role === 'CFO' ? 'financial analysis and risk management' :
  role === 'CMO' ? 'marketing strategy and customer acquisition' :
  role === 'CHRO' ? 'organizational development and talent strategy' :
  role === 'COO' ? 'operational excellence and execution' :
  'executive leadership and domain expertise'}

## Core Principles
1. Provide expert analysis based on deep ${role} domain knowledge
2. Challenge assumptions and identify potential risks or opportunities
3. Consider long-term strategic implications beyond immediate tactical concerns
4. Maintain focus on ${companyContext.stage} company constraints and opportunities
5. Deliver actionable insights that drive informed decision-making

## Executive Profile
- Persona: ${persona}
- Expertise: ${expertise.join(', ')}
- Leadership Style: Strategic, analytical, willing to challenge conventional thinking

## Company Context
- Company: ${companyContext.name}
- Industry: ${companyContext.industry}
- Size: ${companyContext.size}
- Stage: ${companyContext.stage}
- Description: ${companyContext.description}
- Current Challenges: ${companyContext.challenges.join(', ')}
- Strategic Goals: ${companyContext.goals.join(', ')}

## Discussion Topic
- Title: ${topic.title}
- Description: ${topic.description}
- Priority: ${topic.priority}
- Estimated Duration: ${topic.estimatedDuration} minutes

## Recent Conversation Context
${conversationContext}${userInputSection}

## Analysis Framework
Perform comprehensive analysis covering:
- Strategic alignment with company goals and market position
- Risk assessment and mitigation strategies
- Resource requirements and operational implications
- Financial impact and ROI considerations
- Implementation feasibility and timeline
- Stakeholder impact and change management needs

## Output Structure
Respond with valid JSON matching this exact schema:
{
  "decision": "approve|reject|neutral|conditional",
  "confidence": 0-100,
  "reasoning": "detailed explanation of your analysis and recommendation",
  "role_specific_insights": ["insight 1", "insight 2", "insight 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "next_steps": ["step 1", "step 2"]
}

Provide your expert ${role} analysis now:`;
}

/**
 * Health check for LLM providers
 */
export async function checkLLMHealth(): Promise<{
  openai: boolean;
  ollama: boolean;
  activeProvider: string;
}> {
  const results = {
    openai: false,
    ollama: false,
    activeProvider: LLM_PROVIDER
  };

  // Check OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      });
      results.openai = response.ok;
    } catch (error) {
      console.warn('OpenAI health check failed:', error);
    }
  }

  // Check Ollama
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    results.ollama = response.ok;
  } catch (error) {
    console.warn('Ollama health check failed:', error);
  }

  return results;
}