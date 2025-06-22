import React, { useState } from "react"
import {
  Play,
  CheckCircle,
  XCircle,
  Loader,
  Wifi,
  WifiOff,
  Info,
  Settings,
} from "lucide-react"
import {
  testOllamaConnection,
  testAgentWithOllama,
  checkOpenWebUIStatus,
  getAvailableModels,
} from "../utils/testLLM"

interface TestResult {
  success: boolean
  message: string
  responseTime?: number
  error?: string
  detectedModel?: string
  detectedEndpoint?: string
}

const LLMTestPanel: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingAgent, setIsTestingAgent] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(
    null
  )
  const [agentResult, setAgentResult] = useState<TestResult | null>(null)
  const [statusResult, setStatusResult] = useState<TestResult | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [ollamaUrl, setOllamaUrl] = useState(
    import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434"
  )

  const currentProvider = import.meta.env.VITE_LLM_PROVIDER || "ollama"
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const isOpenRouter = apiKey?.startsWith("sk-or-v1-")

  const testOpenRouterConnection = async (): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      if (!apiKey) {
        return {
          success: false,
          message:
            "No API key found. Please set VITE_LLM_API_KEY in your .env file.",
          error: "Missing API key",
        }
      }

      const baseURL = isOpenRouter
        ? "https://openrouter.ai/api/v1"
        : "https://api.openai.com/v1"
      const model = import.meta.env.VITE_DEFAULT_AI_MODEL || "gpt-3.5-turbo"

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: 'Say "Connection test successful" and nothing else.',
            },
          ],
          max_tokens: 50,
        }),
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}`

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        return {
          success: false,
          message: `${
            isOpenRouter ? "OpenRouter" : "OpenAI"
          } API error: ${errorMessage}`,
          responseTime,
          error: errorText,
        }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || "No response"

      return {
        success: true,
        message: `${
          isOpenRouter ? "OpenRouter" : "OpenAI"
        } connection successful!\nModel: ${model}\nResponse: ${content}`,
        responseTime,
        detectedModel: model,
        detectedEndpoint: baseURL,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        message: `Connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        responseTime,
        error: String(error),
      }
    }
  }

  const handleLoadModels = async () => {
    setIsLoadingModels(true)
    try {
      const models = await getAvailableModels(ollamaUrl)
      setAvailableModels(models)
    } catch (error) {
      console.error("Failed to load models:", error)
      setAvailableModels([])
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true)
    setStatusResult(null)

    try {
      const result = await checkOpenWebUIStatus(ollamaUrl)
      setStatusResult(result)

      // Also load models if status check succeeds
      if (result.success) {
        await handleLoadModels()
      }
    } catch (error) {
      setStatusResult({
        success: false,
        message: `Status check failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: String(error),
      })
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      let result: TestResult

      if (currentProvider === "openai") {
        result = await testOpenRouterConnection()
      } else {
        result = await testOllamaConnection(ollamaUrl)
      }

      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Test failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: String(error),
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleTestAgent = async () => {
    setIsTestingAgent(true)
    setAgentResult(null)

    try {
      const result = await testAgentWithOllama()
      setAgentResult(result)
    } catch (error) {
      setAgentResult({
        success: false,
        message: `Agent test failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error: String(error),
      })
    } finally {
      setIsTestingAgent(false)
    }
  }

  const ResultDisplay: React.FC<{ result: TestResult; title: string }> = ({
    result,
    title,
  }) => (
    <div
      className={`mt-4 p-4 rounded-lg border ${
        result.success
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {result.success ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <h4 className="font-medium">{title}</h4>
        {result.responseTime && (
          <span className="text-sm opacity-75">({result.responseTime}ms)</span>
        )}
      </div>
      <p className="text-sm mb-2 whitespace-pre-line">{result.message}</p>

      {/* Show detected configuration */}
      {result.detectedModel && result.detectedEndpoint && (
        <div className="text-xs opacity-75 mb-2">
          <strong>Detected:</strong> Model: {result.detectedModel}, Endpoint:{" "}
          {result.detectedEndpoint}
        </div>
      )}

      {result.error && (
        <details className="text-xs opacity-75">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 p-2 bg-black/10 rounded overflow-x-auto whitespace-pre-wrap">
            {result.error}
          </pre>
        </details>
      )}
    </div>
  )

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Wifi className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">
          {currentProvider === "openai"
            ? `${isOpenRouter ? "OpenRouter" : "OpenAI"} Connection Test`
            : "Open WebUI Connection Test"}
        </h2>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
          {currentProvider === "openai"
            ? isOpenRouter
              ? "OpenRouter"
              : "OpenAI"
            : "Ollama"}
        </span>
      </div>

      {/* Configuration */}
      <div className="mb-6">
        {currentProvider === "openai" ? (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-sm text-green-300">
              <p className="font-medium mb-1">
                Using {isOpenRouter ? "OpenRouter" : "OpenAI"} API
              </p>
              <p className="text-xs opacity-90">
                Model:{" "}
                {import.meta.env.VITE_DEFAULT_AI_MODEL || "gpt-3.5-turbo"}
              </p>
              <p className="text-xs opacity-90">
                API Key:{" "}
                {apiKey ? `${apiKey.substring(0, 12)}...` : "Not configured"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Open WebUI URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="http://localhost:11434"
              />
              <button
                onClick={handleLoadModels}
                disabled={isLoadingModels}
                className="px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:opacity-50"
                title="Load available models"
              >
                {isLoadingModels ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Environment: {import.meta.env.VITE_OLLAMA_URL || "Not set"} |
              Current: {ollamaUrl}
            </p>

            {/* Available Models Display */}
            {availableModels.length > 0 && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs">
                <span className="text-slate-300">Available models: </span>
                <span className="text-blue-300">
                  {availableModels.join(", ")}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">
              Testing Open WebUI/Ollama at {ollamaUrl}
            </p>
            <p className="text-xs opacity-90">
              This will automatically detect your model and API format. Works
              with both Open WebUI and standard Ollama.
            </p>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4">
        {/* Status Check - Only for Ollama */}
        {currentProvider !== "openai" && (
          <div>
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  isCheckingStatus
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }
              `}
            >
              {isCheckingStatus ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              {isCheckingStatus
                ? "Checking Status..."
                : "Check Open WebUI Status"}
            </button>

            {statusResult && (
              <ResultDisplay result={statusResult} title="Open WebUI Status" />
            )}
          </div>
        )}

        {/* Connection Test */}
        <div>
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isTestingConnection
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isTestingConnection ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isTestingConnection
              ? "Testing API Connection..."
              : "Test API Connection"}
          </button>

          {connectionResult && (
            <ResultDisplay
              result={connectionResult}
              title="API Connection Test"
            />
          )}
        </div>

        {/* Agent Integration Test */}
        <div>
          <button
            onClick={handleTestAgent}
            disabled={isTestingAgent || !connectionResult?.success}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isTestingAgent || !connectionResult?.success
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }
            `}
          >
            {isTestingAgent ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isTestingAgent
              ? "Testing Agent Integration..."
              : "Test Agent Integration"}
          </button>

          {!connectionResult?.success && (
            <p className="text-xs text-slate-400 mt-1">
              Complete API connection test first
            </p>
          )}

          {agentResult && (
            <ResultDisplay
              result={agentResult}
              title="Agent Integration Test"
            />
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          {connectionResult?.success ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">
                Connected to {connectionResult.detectedModel || "LLM"}
                {connectionResult.detectedEndpoint &&
                  ` via ${connectionResult.detectedEndpoint}`}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Not connected</span>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-2">
          Testing Steps:
        </h4>
        <ol className="text-xs text-slate-400 space-y-1">
          <li>
            1. <strong>Check Status:</strong> Verify Open WebUI is running and
            detect available models
          </li>
          <li>
            2. <strong>Test API:</strong> Test the chat API with automatic
            endpoint and model detection
          </li>
          <li>
            3. <strong>Test Integration:</strong> Verify the boardroom agents
            can use your LLM
          </li>
          <li>
            4. <strong>Check Console:</strong> View detailed logs in browser
            developer tools
          </li>
        </ol>

        <div className="mt-3 pt-2 border-t border-slate-600">
          <p className="text-xs text-slate-400">
            <strong>Supports:</strong> Open WebUI, standard Ollama, and multiple
            API formats. The system will automatically detect your configuration
            and use the best available model.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LLMTestPanel
