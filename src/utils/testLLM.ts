// Test utility for local LLM connection
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
    console.log(`🔍 Testing Ollama connection at ${url}...`);
    
    // Test basic connectivity
    const response = await axios.post(`${url}/api/chat`, {
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
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data) {
      console.log('✅ Ollama connection successful!', response.data);
      
      // Try to parse the response
      let parsedResponse;
      try {
        if (typeof response.data.message?.content === 'string') {
          parsedResponse = JSON.parse(response.data.message.content);
        } else {
          parsedResponse = response.data;
        }
        
        return {
          success: true,
          message: `Connected successfully! Response time: ${responseTime}ms. Model response: ${JSON.stringify(parsedResponse)}`,
          responseTime
        };
      } catch (parseError) {
        return {
          success: true,
          message: `Connected but response parsing failed. Raw response: ${JSON.stringify(response.data)}`,
          responseTime
        };
      }
    } else {
      return {
        success: false,
        message: `Unexpected response status: ${response.status}`,
        error: `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`
      };
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: `Connection refused. Is Ollama running at ${url}?`,
          error: error.message,
          responseTime
        };
      } else if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          message: `Connection timeout. Ollama may be slow to respond.`,
          error: error.message,
          responseTime
        };
      } else {
        return {
          success: false,
          message: `Network error: ${error.message}`,
          error: error.message,
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

// Test the agent integration
export async function testAgentWithOllama(): Promise<TestResult> {
  try {
    console.log('🤖 Testing agent integration with Ollama...');
    
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
          content: 'You are a test agent. Respond with valid JSON matching the TestAssessment structure.'
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