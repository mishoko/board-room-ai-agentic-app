// Test utility for local LLM connection (Open WebUI compatible)
import axios from "axios"

interface TestResult {
  success: boolean
  message: string
  responseTime?: number
  error?: string
  detectedModel?: string
  detectedEndpoint?: string
}

interface ModelInfo {
  name: string
  size?: number
  modified_at?: string
}

// Get available models from Open WebUI/Ollama
export async function getAvailableModels(
  url: string = "http://localhost:3000"
): Promise<string[]> {
  const modelEndpoints = ["/api/models", "/api/tags", "/v1/models"]

  for (const endpoint of modelEndpoints) {
    try {
      console.log(`🔍 Checking models at ${url}${endpoint}`)
      const response = await axios.get(`${url}${endpoint}`, {
        timeout: 5000,
        headers: { Accept: "application/json" },
      })

      if (response.status === 200 && response.data) {
        let models: string[] = []

        // Parse different response formats
        if (response.data.models && Array.isArray(response.data.models)) {
          // Ollama format: { models: [{ name: "llama3" }] }
          models = response.data.models.map((m: ModelInfo) => m.name)
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // OpenAI format: { data: [{ id: "model-name" }] }
          models = response.data.data.map((m: any) => m.id || m.name)
        } else if (Array.isArray(response.data)) {
          // Direct array format
          models = response.data.map((m: any) =>
            typeof m === "string" ? m : m.name || m.id
          )
        }

        if (models.length > 0) {
          console.log(`✅ Found models via ${endpoint}:`, models)
          return models
        }
      }
    } catch (error: any) {
      console.log(`❌ Model endpoint ${endpoint} failed:`, error.message)
      continue
    }
  }

  // Fallback to common model names
  console.log("⚠️ No models detected, using fallback list")
  return ["llama3", "llama2", "mistral", "codellama", "gpt-3.5-turbo"]
}

export async function testOllamaConnection(
  url: string = "http://localhost:3000"
): Promise<TestResult> {
  const startTime = Date.now()

  try {
    console.log(`🔍 Testing Open WebUI/Ollama connection at ${url}...`)

    // First, get available models
    const availableModels = await getAvailableModels(url)
    const testModel = availableModels[0] // Use the first available model

    console.log(
      `🤖 Using model: ${testModel} from available models:`,
      availableModels
    )

    // Test the API endpoint - Open WebUI typically uses /api/chat or /v1/chat/completions
    const testEndpoints = [
      "/api/chat",
      "/v1/chat/completions",
      "/api/v1/chat/completions",
      "/api/generate",
    ]

    let lastError: any = null

    for (const endpoint of testEndpoints) {
      try {
        console.log(
          `🔍 Trying endpoint: ${url}${endpoint} with model: ${testModel}`
        )

        let requestData: any

        if (endpoint.includes("v1/chat/completions")) {
          // OpenAI-compatible format
          requestData = {
            model: testModel,
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant. Respond with valid JSON only.",
              },
              {
                role: "user",
                content:
                  'Please respond with a simple JSON object containing a "test" field with value "success" and a "message" field with a brief greeting.',
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
          }
        } else if (endpoint.includes("generate")) {
          // Ollama generate format
          requestData = {
            model: testModel,
            prompt:
              'Please respond with a simple JSON object containing a "test" field with value "success" and a "message" field with a brief greeting.',
            format: "json",
            stream: false,
          }
        } else {
          // Ollama chat format
          requestData = {
            model: testModel,
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant. Respond with valid JSON only.",
              },
              {
                role: "user",
                content:
                  'Please respond with a simple JSON object containing a "test" field with value "success" and a "message" field with a brief greeting.',
              },
            ],
            format: "json",
            stream: false,
          }
        }

        const response = await axios.post(`${url}${endpoint}`, requestData, {
          timeout: 30000, // 30 second timeout for LLM response
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        const responseTime = Date.now() - startTime

        if (response.status === 200 && response.data) {
          console.log("✅ Open WebUI API response successful!", response.data)

          // Try to parse the response based on the endpoint format
          let parsedResponse
          let responseText = ""

          try {
            if (endpoint.includes("v1/chat/completions")) {
              // OpenAI format response
              responseText = response.data.choices?.[0]?.message?.content || ""
            } else if (endpoint.includes("generate")) {
              // Ollama generate format
              responseText = response.data.response || ""
            } else {
              // Ollama chat format
              responseText = response.data.message?.content || ""
            }

            // Try to parse as JSON
            if (typeof responseText === "string" && responseText.trim()) {
              try {
                parsedResponse = JSON.parse(responseText)
              } catch {
                parsedResponse = { message: responseText }
              }
            } else {
              parsedResponse = response.data
            }

            return {
              success: true,
              message: `Connected successfully to ${endpoint}! Response time: ${responseTime}ms. Model: ${testModel}`,
              responseTime,
              detectedModel: testModel,
              detectedEndpoint: endpoint,
            }
          } catch (parseError) {
            return {
              success: true,
              message: `Connected to ${endpoint} but response parsing failed. Raw response received.`,
              responseTime,
              detectedModel: testModel,
              detectedEndpoint: endpoint,
            }
          }
        }
      } catch (endpointError: any) {
        lastError = endpointError
        console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message)
        continue
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error("All API endpoints failed")
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED") {
        return {
          success: false,
          message: `Connection refused. Is Open WebUI running at ${url}?`,
          error: `${error.message}. Make sure Open WebUI is started and accessible.`,
          responseTime,
        }
      } else if (error.code === "ETIMEDOUT") {
        return {
          success: false,
          message: `Connection timeout. Open WebUI may be slow to respond or the model is loading.`,
          error: `${error.message}. Try again in a few moments.`,
          responseTime,
        }
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: `API endpoint not found. Open WebUI may use a different API structure.`,
          error: `Status: ${error.response.status}. Available endpoints may differ.`,
          responseTime,
        }
      } else if (error.response?.status === 500) {
        return {
          success: false,
          message: `Server error. The model may not be loaded or there's an internal error.`,
          error: `Status: ${error.response.status}. Check Open WebUI logs.`,
          responseTime,
        }
      } else {
        return {
          success: false,
          message: `Network error: ${error.message}`,
          error: `${error.message}. Response: ${JSON.stringify(
            error.response?.data
          )}`,
          responseTime,
        }
      }
    } else {
      return {
        success: false,
        message: `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: String(error),
        responseTime,
      }
    }
  }
}

// Test the agent integration with Open WebUI
export async function testAgentWithOllama(): Promise<TestResult> {
  try {
    console.log("🤖 Testing agent integration with Open WebUI...")

    // Import the LLM utility
    const { callLLM } = await import("./llm")

    // Create a simple test model
    class TestAssessment {
      assessment: "approve" | "reject" | "neutral" = "neutral"
      confidence: number = 0
      reasoning: string = ""
      testConcerns: string[] = []
      recommendations: string[] = []
    }

    // Create a simple prompt template
    const testPrompt = {
      toMessages: () => [
        {
          role: "system",
          content:
            "You are a test agent. Respond with valid JSON matching the TestAssessment structure. Be concise.",
        },
        {
          role: "user",
          content:
            'Analyze this test proposal: "Implement a simple test feature". Return JSON with assessment (approve/reject/neutral), confidence (0-100), reasoning, testConcerns array, and recommendations array.',
        },
      ],
    }

    const result = await callLLM({
      prompt: testPrompt,
      model: TestAssessment,
      agentName: "testAgent",
      defaultFactory: () => {
        const assessment = new TestAssessment()
        assessment.reasoning = "Test completed successfully with fallback"
        assessment.confidence = 75
        assessment.testConcerns = ["This is a test concern"]
        assessment.recommendations = ["This is a test recommendation"]
        return assessment
      },
    })

    return {
      success: true,
      message: `Agent integration test successful! Result: ${JSON.stringify(
        result,
        null,
        2
      )}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Agent integration test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      error: String(error),
    }
  }
}

// Additional utility to check Open WebUI specific endpoints
export async function checkOpenWebUIStatus(
  url: string = "http://localhost:3000"
): Promise<TestResult> {
  try {
    console.log(`🔍 Checking Open WebUI status at ${url}...`)

    // Check common Open WebUI endpoints
    const statusEndpoints = [
      { path: "/api/models", description: "Available models" },
      { path: "/api/version", description: "Version info" },
      { path: "/health", description: "Health check" },
      { path: "/", description: "Main interface" },
    ]

    const results: string[] = []

    for (const endpoint of statusEndpoints) {
      try {
        const response = await axios.get(`${url}${endpoint.path}`, {
          timeout: 5000,
          headers: {
            Accept: "application/json,text/html",
          },
        })

        if (response.status === 200) {
          const dataPreview =
            typeof response.data === "string"
              ? response.data.substring(0, 100)
              : JSON.stringify(response.data).substring(0, 100)

          results.push(
            `✅ ${endpoint.description} (${endpoint.path}): ${dataPreview}...`
          )
        }
      } catch (error: any) {
        results.push(
          `❌ ${endpoint.description} (${endpoint.path}): ${error.message}`
        )
      }
    }

    // Try to get model information
    try {
      const models = await getAvailableModels(url)
      results.push(`🤖 Available models: ${models.join(", ")}`)
    } catch (error: any) {
      results.push(`❌ Model detection failed: ${error.message}`)
    }

    const hasSuccess = results.some((r) => r.startsWith("✅"))

    return {
      success: hasSuccess,
      message: hasSuccess
        ? `Open WebUI is running! Status check results:\n${results.join("\n")}`
        : `Open WebUI status check failed:\n${results.join("\n")}`,
      error: hasSuccess ? undefined : "No endpoints responded successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: `Status check failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      error: String(error),
    }
  }
}
