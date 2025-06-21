// Test utility for local LLM connection (Open WebUI compatible)
import axios from 'axios';

interface TestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
}

export async function testOllamaConnection(url: string = 'http://localhost:3000'): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing Open WebUI connection at ${url}...`);
    
    // First, try to check if the service is running by testing the root endpoint
    try {
      const healthCheck = await axios.get(`${url}/`, {
        timeout: 5000,
        headers: {
          'Accept': 'text/html,application/json'
        }
      });
      console.log('✅ Open WebUI service is responding:', healthCheck.status);
    } catch (healthError) {
      console.log('⚠️ Health check failed, trying API directly...');
    }
    
    // Test the API endpoint - Open WebUI typically uses /api/chat or /v1/chat/completions
    const testEndpoints = [
      '/api/chat',
      '/v1/chat/completions',
      '/api/v1/chat/completions'
    ];
    
    let lastError: any = null;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${url}${endpoint}`);
        
        const requestData = endpoint.includes('v1/chat/completions') ? {
          // OpenAI-compatible format
          model: 'llama3',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: 'Please respond with a simple JSON object containing a "test" field with value "success" and a "message" field with a brief greeting.'
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        } : {
          // Ollama format
          model: 'llama3',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: 'Please respond with a simple JSON object containing a "test" field with value "success" and a "message" field with a brief greeting.'
            }
          ],
          format: 'json',
          stream: false
        };
        
        const response = await axios.post(`${url}${endpoint}`, requestData, {
          timeout: 15000, // 15 second timeout for LLM response
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200 && response.data) {
          console.log('✅ Open WebUI API response successful!', response.data);
          
          // Try to parse the response based on the endpoint format
          let parsedResponse;
          let responseText = '';
          
          try {
            if (endpoint.includes('v1/chat/completions')) {
              // OpenAI format response
              responseText = response.data.choices?.[0]?.message?.content || JSON.stringify(response.data);
            } else {
              // Ollama format response
              responseText = response.data.message?.content || response.data.response || JSON.stringify(response.data);
            }
            
            // Try to parse as JSON
            if (typeof responseText === 'string') {
              try {
                parsedResponse = JSON.parse(responseText);
              } catch {
                parsedResponse = { message: responseText };
              }
            } else {
              parsedResponse = responseText;
            }
            
            return {
              success: true,
              message: `Connected successfully to ${endpoint}! Response time: ${responseTime}ms. Model response: ${JSON.stringify(parsedResponse)}`,
              responseTime
            };
          } catch (parseError) {
            return {
              success: true,
              message: `Connected to ${endpoint} but response parsing failed. Raw response: ${JSON.stringify(response.data)}`,
              responseTime
            };
          }
        }
        
      } catch (endpointError) {
        lastError = endpointError;
        console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
        continue;
      }
    }
    
    // If we get here, all endpoints failed
    throw lastError || new Error('All API endpoints failed');
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: `Connection refused. Is Open WebUI running at ${url}?`,
          error: `${error.message}. Make sure Open WebUI is started and accessible.`,
          responseTime
        };
      } else if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          message: `Connection timeout. Open WebUI may be slow to respond or the model is loading.`,
          error: `${error.message}. Try again in a few moments.`,
          responseTime
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: `API endpoint not found. Open WebUI may use a different API structure.`,
          error: `Status: ${error.response.status}. Available endpoints may differ.`,
          responseTime
        };
      } else if (error.response?.status === 500) {
        return {
          success: false,
          message: `Server error. The model may not be loaded or there's an internal error.`,
          error: `Status: ${error.response.status}. Check Open WebUI logs.`,
          responseTime
        };
      } else {
        return {
          success: false,
          message: `Network error: ${error.message}`,
          error: `${error.message}. Response: ${JSON.stringify(error.response?.data)}`,
          responseTime
        };
      }
    } else {
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        error: String(error),
        responseTime
      };
    }
  }
}

// Test the agent integration with Open WebUI
export async function testAgentWithOllama(): Promise<TestResult> {
  try {
    console.log('🤖 Testing agent integration with Open WebUI...');
    
    // Import the LLM utility
    const { callLLM } = await import('./llm');
    
    // Create a simple test model
    class TestAssessment {
      assessment: 'approve' | 'reject' | 'neutral' = 'neutral';
      confidence: number = 0;
      reasoning: string = '';
      testConcerns: string[] = [];
      recommendations: string[] = [];
    }
    
    // Create a simple prompt template
    const testPrompt = {
      toMessages: () => [
        {
          role: 'system',
          content: 'You are a test agent. Respond with valid JSON matching the TestAssessment structure. Be concise.'
        },
        {
          role: 'user',
          content: 'Analyze this test proposal: "Implement a simple test feature". Return JSON with assessment (approve/reject/neutral), confidence (0-100), reasoning, testConcerns array, and recommendations array.'
        }
      ]
    };
    
    const result = await callLLM({
      prompt: testPrompt,
      model: TestAssessment,
      agentName: 'testAgent',
      provider: 'ollama',
      defaultFactory: () => {
        const assessment = new TestAssessment();
        assessment.reasoning = 'Test completed successfully with fallback';
        assessment.confidence = 75;
        assessment.testConcerns = ['This is a test concern'];
        assessment.recommendations = ['This is a test recommendation'];
        return assessment;
      }
    });
    
    return {
      success: true,
      message: `Agent integration test successful! Result: ${JSON.stringify(result, null, 2)}`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Agent integration test failed: ${error instanceof Error ? error.message : String(error)}`,
      error: String(error)
    };
  }
}

// Additional utility to check Open WebUI specific endpoints
export async function checkOpenWebUIStatus(url: string = 'http://localhost:3000'): Promise<TestResult> {
  try {
    console.log(`🔍 Checking Open WebUI status at ${url}...`);
    
    // Check common Open WebUI endpoints
    const statusEndpoints = [
      '/api/models',
      '/api/version',
      '/health',
      '/'
    ];
    
    for (const endpoint of statusEndpoints) {
      try {
        const response = await axios.get(`${url}${endpoint}`, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.status === 200) {
          return {
            success: true,
            message: `Open WebUI is running! Endpoint ${endpoint} responded with: ${JSON.stringify(response.data).substring(0, 200)}...`
          };
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }
    
    return {
      success: false,
      message: 'Open WebUI status check failed - no endpoints responded',
      error: 'All status endpoints failed to respond'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Status check failed: ${error instanceof Error ? error.message : String(error)}`,
      error: String(error)
    };
  }
}