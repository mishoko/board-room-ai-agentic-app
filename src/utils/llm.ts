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
      
      // Try multiple API endpoints for Open WebUI compatibility
      const endpoints = [
        '/api/chat',
        '/v1/chat/completions',
        '/api/v1/chat/completions'
      ];
      
      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying LLM endpoint: ${ollamaUrl}${endpoint}`);
          
          const requestData = endpoint.includes('v1/chat/completions') ? {
            // OpenAI-compatible format for Open WebUI
            model: 'llama3',
            messages: prompt.toMessages(),
            temperature: 0.7,
            max_tokens: 500
          } : {
            // Ollama format
            model: 'llama3',
            messages: prompt.toMessages(),
            format: 'json',
            stream: false
          };
          
          const response = await axios.post(`${ollamaUrl}${endpoint}`, requestData, {
            timeout: 30000, // 30 second timeout for LLM
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (response.status === 200 && response.data) {
            let responseText = '';
            
            // Parse response based on endpoint format
            if (endpoint.includes('v1/chat/completions')) {
              // OpenAI format
              responseText = response.data.choices?.[0]?.message?.content || '';
            } else {
              // Ollama format
              responseText = response.data.message?.content || response.data.response || '';
            }
            
            if (responseText) {
              try {
                const parsedResponse = JSON.parse(responseText);
                return Object.assign(new model(), parsedResponse);
              } catch (parseError) {
                console.warn(`JSON parse failed for ${endpoint}, trying fallback...`);
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
          
        } catch (endpointError) {
          lastError = endpointError;
          console.warn(`Endpoint ${endpoint} failed:`, endpointError.message);
          continue;
        }
      }
      
      // If all endpoints failed, throw the last error
      throw lastError || new Error('All LLM endpoints failed');
    }
  } catch (error) {
    console.error(`LLM call failed for ${agentName}:`, error);
    if (defaultFactory) return defaultFactory();
    throw new Error(`LLM call failed for ${agentName}: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  throw new Error('Invalid provider specified');
}