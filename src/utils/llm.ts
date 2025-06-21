import OpenAI from 'openai';
import axios from 'axios';

type LLMProvider = 'openai' | 'ollama';

interface LLMOptions<T> {
  prompt: any;
  model: new () => T;
  agentName: string;
  state?: Record<string, any>;
  defaultFactory?: () => T;
  provider?: LLMProvider;
}

// Cache for detected model and endpoint
let detectedConfig: { model: string; endpoint: string } | null = null;

// Get available models from Open WebUI/Ollama
async function getAvailableModels(url: string): Promise<string[]> {
  const modelEndpoints = ['/api/models', '/api/tags', '/v1/models'];
  
  for (const endpoint of modelEndpoints) {
    try {
      const response = await axios.get(`${url}${endpoint}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status === 200 && response.data) {
        let models: string[] = [];
        
        if (response.data.models && Array.isArray(response.data.models)) {
          models = response.data.models.map((m: any) => m.name);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          models = response.data.data.map((m: any) => m.id || m.name);
        } else if (Array.isArray(response.data)) {
          models = response.data.map((m: any) => typeof m === 'string' ? m : m.name || m.id);
        }
        
        if (models.length > 0) {
          console.log(`✅ Found models via ${endpoint}:`, models);
          return models;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback to common model names
  return ['llama3', 'llama2', 'mistral', 'codellama', 'gpt-3.5-turbo'];
}

// Detect the best endpoint and model for Open WebUI/Ollama
async function detectLLMConfig(url: string): Promise<{ model: string; endpoint: string }> {
  if (detectedConfig) {
    return detectedConfig;
  }
  
  console.log('🔍 Detecting LLM configuration...');
  
  // Get available models
  const availableModels = await getAvailableModels(url);
  const testModel = availableModels[0];
  
  // Test endpoints in order of preference
  const testEndpoints = [
    '/api/chat',
    '/v1/chat/completions', 
    '/api/v1/chat/completions',
    '/api/generate'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      let requestData: any;
      
      if (endpoint.includes('v1/chat/completions')) {
        requestData = {
          model: testModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        };
      } else if (endpoint.includes('generate')) {
        requestData = {
          model: testModel,
          prompt: 'test',
          stream: false
        };
      } else {
        requestData = {
          model: testModel,
          messages: [{ role: 'user', content: 'test' }],
          stream: false
        };
      }
      
      const response = await axios.post(`${url}${endpoint}`, requestData, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 200) {
        detectedConfig = { model: testModel, endpoint };
        console.log(`✅ Detected LLM config: ${testModel} via ${endpoint}`);
        return detectedConfig;
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback
  detectedConfig = { model: testModel, endpoint: '/api/chat' };
  return detectedConfig;
}

export async function callLLM<T>({
  prompt,
  model,
  agentName,
  state,
  defaultFactory,
  provider = 'openai'
}: LLMOptions<T>): Promise<T> {
  const apiKey = import.meta.env.VITE_LLM_API_KEY;
  
  try {
    if (provider === 'openai') {
      if (!apiKey) throw new Error('OpenAI requires VITE_LLM_API_KEY');
      
      const openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true
      });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: prompt.toMessages(),
        response_format: { type: 'json_object' }
      });
      
      return Object.assign(new model(), JSON.parse(response.choices[0].message.content));
    } 
    else if (provider === 'ollama') {
      const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
      
      // Detect the best configuration for this Open WebUI/Ollama instance
      const config = await detectLLMConfig(ollamaUrl);
      
      console.log(`🔍 Using LLM config for ${agentName}: ${config.model} via ${config.endpoint}`);
      
      let requestData: any;
      
      if (config.endpoint.includes('v1/chat/completions')) {
        // OpenAI-compatible format for Open WebUI
        requestData = {
          model: config.model,
          messages: prompt.toMessages(),
          temperature: 0.7,
          max_tokens: 1000
        };
      } else if (config.endpoint.includes('generate')) {
        // Ollama generate format
        const messages = prompt.toMessages();
        const promptText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        requestData = {
          model: config.model,
          prompt: promptText,
          format: 'json',
          stream: false
        };
      } else {
        // Ollama chat format
        requestData = {
          model: config.model,
          messages: prompt.toMessages(),
          format: 'json',
          stream: false
        };
      }
      
      const response = await axios.post(`${ollamaUrl}${config.endpoint}`, requestData, {
        timeout: 60000, // 60 second timeout for LLM
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        let responseText = '';
        
        // Parse response based on endpoint format
        if (config.endpoint.includes('v1/chat/completions')) {
          // OpenAI format
          responseText = response.data.choices?.[0]?.message?.content || '';
        } else if (config.endpoint.includes('generate')) {
          // Ollama generate format
          responseText = response.data.response || '';
        } else {
          // Ollama chat format
          responseText = response.data.message?.content || '';
        }
        
        if (responseText) {
          try {
            const parsedResponse = JSON.parse(responseText);
            return Object.assign(new model(), parsedResponse);
          } catch (parseError) {
            console.warn(`JSON parse failed for ${agentName}, trying fallback...`);
            // If JSON parsing fails, try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsedResponse = JSON.parse(jsonMatch[0]);
              return Object.assign(new model(), parsedResponse);
            }
            throw parseError;
          }
        } else {
          throw new Error('Empty response from LLM');
        }
      }
      
      throw new Error(`Invalid response status: ${response.status}`);
    }
  } catch (error) {
    console.error(`LLM call failed for ${agentName}:`, error);
    if (defaultFactory) return defaultFactory();
    throw new Error(`LLM call failed for ${agentName}: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  throw new Error('Invalid provider specified');
}