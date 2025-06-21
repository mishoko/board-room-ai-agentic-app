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
  const apiKey = process.env.LLM_API_KEY;
  
  try {
    if (provider === 'openai') {
      if (!apiKey) throw new Error('OpenAI requires LLM_API_KEY');
      
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: prompt.toMessages(),
        response_format: { type: 'json_object' }
      });
      
      return Object.assign(new model(), JSON.parse(response.choices[0].message.content));
    } 
    else if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await axios.post(`${ollamaUrl}/api/chat`, {
        model: 'llama3',
        messages: prompt.toMessages(),
        format: 'json'
      });
      
      return Object.assign(new model(), JSON.parse(response.data.message.content));
    }
  } catch (error) {
    if (defaultFactory) return defaultFactory();
    throw new Error(`LLM call failed for ${agentName}: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  throw new Error('Invalid provider specified');
}