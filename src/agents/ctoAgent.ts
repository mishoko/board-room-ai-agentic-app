import { callLLM } from "../utils/llm"
import { ChatPromptTemplate } from "langchain/prompts"

type Assessment = "approve" | "reject" | "neutral"

class CTOAssessment {
  assessment: Assessment
  confidence: number
  reasoning: string
  techConcerns: string[]
  recommendations: string[]

  constructor() {
    this.assessment = "neutral"
    this.confidence = 0
    this.reasoning = ""
    this.techConcerns = []
    this.recommendations = []
  }
}

interface TechContext {
  requiredSkills?: string[]
  currentArchitecture?: string
  techDebtLevel?: number
  resourceAvailability?: number
  performanceRequirements?: string[]
  securityRequirements?: string[]
  scalabilityNeeds?: string
}

/**
 * ## Agent Role
 * CTO focusing on technical architecture, scalability, and engineering execution
 *
 * ## Core Principles
 * 1. Prioritize scalable and maintainable solutions
 * 2. Assess technical feasibility against current capabilities
 * 3. Evaluate security and compliance implications
 * 4. Consider long-term technical debt impact
 * 5. Balance innovation with engineering velocity
 *
 * ## Analysis Framework
 * - Scalability: Evaluate horizontal and vertical scaling needs
 * - Tech Debt: Assess impact on current technical debt and future maintainability
 * - Resource Requirements: Analyze engineering capacity and skill requirements
 * - Architecture Fit: Evaluate alignment with existing technical architecture
 * - Security & Compliance: Assess security implications and regulatory requirements
 * - Performance: Evaluate performance requirements against current capabilities
 *
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "techConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function ctoAgent(
  state: Record<string, any>,
  techContext: TechContext
): Promise<CTOAssessment> {
  // Perform sub-analyses
  const scalabilityAnalysis = analyzeScalability(techContext)
  const techDebtAnalysis = analyzeTechDebt(techContext)
  const resourceAnalysis = analyzeResourceNeeds(techContext)
  const architectureAnalysis = analyzeArchitectureFit(techContext)
  const securityAnalysis = analyzeSecurityRequirements(techContext)

  // Generate structured output
  return generateCTOOutput(state.proposal, techContext, {
    scalability: scalabilityAnalysis,
    techDebt: techDebtAnalysis,
    resources: resourceAnalysis,
    architecture: architectureAnalysis,
    security: securityAnalysis,
  })
}

function analyzeScalability(context: TechContext): {
  score: number
  details: string[]
} {
  const {
    scalabilityNeeds = "moderate",
    currentArchitecture = "monolithic",
    performanceRequirements = [],
  } = context

  let scalabilityScore = 70 // Base score
  const details: string[] = []

  // Assess current architecture scalability
  const architectureScalability = {
    microservices: 90,
    "modular-monolith": 70,
    monolithic: 40,
    legacy: 20,
  }

  const archScore =
    architectureScalability[currentArchitecture.toLowerCase()] || 50
  scalabilityScore = (scalabilityScore + archScore) / 2

  if (archScore < 60) {
    details.push(
      `Current ${currentArchitecture} architecture limits scalability options`
    )
  }

  // Evaluate scalability requirements
  const scalabilityMultiplier = {
    low: 1.1,
    moderate: 1.0,
    high: 0.8,
    extreme: 0.6,
  }

  scalabilityScore *=
    scalabilityMultiplier[scalabilityNeeds.toLowerCase()] || 1.0

  if (scalabilityNeeds === "high" || scalabilityNeeds === "extreme") {
    details.push(
      `${scalabilityNeeds} scalability requirements may require architecture redesign`
    )
  }

  // Check performance requirements complexity
  const complexPerformanceReqs = performanceRequirements.filter(
    (req) =>
      req.toLowerCase().includes("real-time") ||
      req.toLowerCase().includes("sub-second") ||
      req.toLowerCase().includes("high-throughput")
  )

  if (complexPerformanceReqs.length > 0) {
    scalabilityScore -= 15
    details.push(
      `Complex performance requirements: ${complexPerformanceReqs.join(", ")}`
    )
  }

  return {
    score: Math.max(0, Math.min(100, scalabilityScore)),
    details,
  }
}

function analyzeTechDebt(context: TechContext): {
  score: number
  details: string[]
} {
  const { techDebtLevel = 50, currentArchitecture = "monolithic" } = context

  let debtScore = 100 - techDebtLevel // Invert debt level to get health score
  const details: string[] = []

  // High tech debt impacts new development
  if (techDebtLevel > 70) {
    debtScore -= 20
    details.push(
      `High technical debt (${techDebtLevel}%) will slow development velocity`
    )
  }

  // Legacy architecture adds debt risk
  if (currentArchitecture.toLowerCase() === "legacy") {
    debtScore -= 25
    details.push(
      "Legacy architecture increases technical debt accumulation risk"
    )
  }

  // Moderate debt requires careful planning
  if (techDebtLevel > 40 && techDebtLevel <= 70) {
    details.push(
      `Moderate technical debt requires careful feature planning to avoid accumulation`
    )
  }

  return {
    score: Math.max(0, Math.min(100, debtScore)),
    details,
  }
}

function analyzeResourceNeeds(context: TechContext): {
  score: number
  details: string[]
} {
  const { requiredSkills = [], resourceAvailability = 70 } = context

  let resourceScore = resourceAvailability
  const details: string[] = []

  // Assess skill complexity
  const complexSkills = requiredSkills.filter((skill) =>
    [
      "Kubernetes",
      "Machine Learning",
      "Blockchain",
      "WebAssembly",
      "Rust",
      "Go",
    ].some((complex) => skill.toLowerCase().includes(complex.toLowerCase()))
  )

  if (complexSkills.length > 0) {
    resourceScore -= complexSkills.length * 10
    details.push(
      `Complex skills required: ${complexSkills.join(
        ", "
      )} - may need specialized hiring`
    )
  }

  // Check resource availability
  if (resourceAvailability < 60) {
    details.push(
      `Limited engineering capacity (${resourceAvailability}%) may constrain development`
    )
  }

  // Assess skill diversity requirements
  if (requiredSkills.length > 5) {
    resourceScore -= 10
    details.push(
      `High skill diversity (${requiredSkills.length} skills) increases coordination complexity`
    )
  }

  return {
    score: Math.max(0, Math.min(100, resourceScore)),
    details,
  }
}

function analyzeArchitectureFit(context: TechContext): {
  score: number
  details: string[]
} {
  const { currentArchitecture = "monolithic", requiredSkills = [] } = context

  let fitScore = 70 // Base score
  const details: string[] = []

  // Check if required skills align with current architecture
  const modernSkills = requiredSkills.filter((skill) =>
    ["React", "Node.js", "Docker", "Kubernetes", "GraphQL", "TypeScript"].some(
      (modern) => skill.toLowerCase().includes(modern.toLowerCase())
    )
  )

  const legacySkills = requiredSkills.filter((skill) =>
    ["COBOL", "Mainframe", "Legacy", "Monolith"].some((legacy) =>
      skill.toLowerCase().includes(legacy.toLowerCase())
    )
  )

  // Modern skills with legacy architecture
  if (
    modernSkills.length > 0 &&
    currentArchitecture.toLowerCase() === "legacy"
  ) {
    fitScore -= 30
    details.push(
      "Modern technology requirements conflict with legacy architecture"
    )
  }

  // Microservices skills with monolithic architecture
  const microservicesSkills = requiredSkills.filter((skill) =>
    ["Kubernetes", "Docker", "Service Mesh", "API Gateway"].some((micro) =>
      skill.toLowerCase().includes(micro.toLowerCase())
    )
  )

  if (
    microservicesSkills.length > 0 &&
    currentArchitecture.toLowerCase() === "monolithic"
  ) {
    fitScore -= 20
    details.push(
      "Microservices technologies may require architectural migration"
    )
  }

  return {
    score: Math.max(0, Math.min(100, fitScore)),
    details,
  }
}

function analyzeSecurityRequirements(context: TechContext): {
  score: number
  details: string[]
} {
  const { securityRequirements = [] } = context

  let securityScore = 80 // Base score
  const details: string[] = []

  // Assess security complexity
  const highSecurityReqs = securityRequirements.filter(
    (req) =>
      req.toLowerCase().includes("encryption") ||
      req.toLowerCase().includes("compliance") ||
      req.toLowerCase().includes("audit") ||
      req.toLowerCase().includes("zero-trust")
  )

  if (highSecurityReqs.length > 0) {
    securityScore -= highSecurityReqs.length * 15
    details.push(
      `High security requirements: ${highSecurityReqs.join(
        ", "
      )} - requires specialized expertise`
    )
  }

  // Check for regulatory compliance
  const complianceReqs = securityRequirements.filter((req) =>
    ["GDPR", "HIPAA", "SOX", "PCI-DSS", "SOC2"].some((compliance) =>
      req.toUpperCase().includes(compliance)
    )
  )

  if (complianceReqs.length > 0) {
    securityScore -= 20
    details.push(
      `Regulatory compliance required: ${complianceReqs.join(
        ", "
      )} - adds development overhead`
    )
  }

  return {
    score: Math.max(0, Math.min(100, securityScore)),
    details,
  }
}

async function generateCTOOutput(
  proposal: string,
  context: TechContext,
  analyses: any
): Promise<CTOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an experienced CTO analyzing a technical proposal from an engineering and architecture perspective.

Your role is to assess:
- Technical feasibility and implementation complexity
- Scalability and performance implications
- Security and compliance requirements
- Impact on existing technical architecture
- Engineering resource requirements and timeline
- Technical debt and maintainability concerns

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific technical recommendations.

Focus on practical engineering challenges, architectural decisions, and realistic implementation timelines. Consider both immediate technical needs and long-term system health.`,
    ],
    [
      "human",
      `Proposal: {proposal}

Technical Context:
- Required Skills: {requiredSkills}
- Current Architecture: {currentArchitecture}
- Technical Debt Level: {techDebtLevel}%
- Resource Availability: {resourceAvailability}%
- Performance Requirements: {performanceRequirements}
- Security Requirements: {securityRequirements}
- Scalability Needs: {scalabilityNeeds}

Analysis Results:
- Scalability: {scalabilityScore}/100 - {scalabilityDetails}
- Tech Debt Impact: {techDebtScore}/100 - {techDebtDetails}
- Resource Feasibility: {resourceScore}/100 - {resourceDetails}
- Architecture Fit: {architectureScore}/100 - {architectureDetails}
- Security Complexity: {securityScore}/100 - {securityDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, techConcerns array, and recommendations array:`,
    ],
  ])

  return callLLM({
    prompt: {
      toMessages: () =>
        template.formatMessages({
          proposal,
          requiredSkills: context.requiredSkills?.join(", ") || "Not specified",
          currentArchitecture: context.currentArchitecture || "Unknown",
          techDebtLevel: context.techDebtLevel || "Unknown",
          resourceAvailability: context.resourceAvailability || "Unknown",
          performanceRequirements:
            context.performanceRequirements?.join(", ") || "Not specified",
          securityRequirements:
            context.securityRequirements?.join(", ") || "Not specified",
          scalabilityNeeds: context.scalabilityNeeds || "Not specified",
          scalabilityScore: analyses.scalability.score,
          scalabilityDetails: analyses.scalability.details.join("; "),
          techDebtScore: analyses.techDebt.score,
          // ... other parameters
        }),
    },
    model: CTOAssessment,
    agentName: "ctoAgent",
    provider: "ollama", // Explicitly set to use Ollama
    defaultFactory: () => {
      const assessment = new CTOAssessment()
      assessment.reasoning =
        "Error in generating technical analysis - defaulting to neutral assessment"
      assessment.confidence = 50
      assessment.techConcerns = [
        "Unable to complete full technical analysis due to system error",
      ]
      assessment.recommendations = [
        "Retry analysis with updated technical context",
      ]
      return assessment
    },
  })
}

/**
 * ## Example Interaction
 *
 * Input:
 * ```javascript
 * const proposal = "Implement real-time analytics dashboard with machine learning predictions";
 * const context = {
 *   requiredSkills: ["React", "Node.js", "Machine Learning", "Redis", "WebSockets"],
 *   currentArchitecture: "monolithic",
 *   techDebtLevel: 65,
 *   resourceAvailability: 70,
 *   performanceRequirements: ["real-time updates", "sub-second response"],
 *   securityRequirements: ["data encryption", "user authentication"],
 *   scalabilityNeeds: "high"
 * };
 * ```
 *
 * Output:
 * ```json
 * {
 *   "assessment": "neutral",
 *   "confidence": 72,
 *   "reasoning": "The proposal is technically feasible but requires significant architectural considerations. Real-time requirements and ML integration with current monolithic architecture present scalability challenges. High technical debt may slow implementation.",
 *   "techConcerns": [
 *     "Monolithic architecture limits real-time scalability options",
 *     "High technical debt (65%) will slow development velocity",
 *     "Complex performance requirements: real-time updates, sub-second response",
 *     "Machine Learning integration requires specialized expertise"
 *   ],
 *   "recommendations": [
 *     "Consider microservices migration for real-time components",
 *     "Implement caching layer with Redis for performance optimization",
 *     "Establish ML pipeline with proper model versioning",
 *     "Address technical debt in critical path components first",
 *     "Implement WebSocket infrastructure for real-time updates",
 *     "Plan phased rollout to manage complexity"
 *   ]
 * }
 * ```
 */
