// Enhanced LLM Service with real-time AI integration via Bolt

export class LLMService {
  private static instance: LLMService

  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService()
    }
    return LLMService.instance
  }

  // Generate a single contextual comment using local LLM
  public async generateComment(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: {
      title: string
      description: string
      priority: string
      estimatedDuration: number
    },
    companyContext: {
      name: string
      industry: string
      size: string
      stage: string
      description: string
      challenges: string[]
      goals: string[]
    },
    context?: string
  ): Promise<string> {
    const prompt = this.buildCommentPrompt(
      agentRole,
      agentPersona,
      agentExpertise,
      topic,
      companyContext,
      context
    )

    try {
      // Use local LLM for comment generation
      const response = await this.callLocalLLM(prompt)
      return response
    } catch (error) {
      console.error("Error generating comment:", error)
      // Fallback to a simple contextual comment
      return this.generateFallbackComment(agentRole, topic, companyContext)
    }
  }

  private buildCommentPrompt(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: any,
    companyContext: any,
    context?: string
  ): string {
    return `You are the ${agentRole} of ${companyContext.name}, a ${
      companyContext.stage
    } ${companyContext.industry} company.

EXECUTIVE PROFILE:
- Role: ${agentRole}
- Persona: ${agentPersona}
- Expertise: ${agentExpertise.join(", ")}

COMPANY CONTEXT:
- Company: ${companyContext.name}
- Industry: ${companyContext.industry}
- Size: ${companyContext.size}
- Stage: ${companyContext.stage}
- Description: ${companyContext.description}
- Current Challenges: ${companyContext.challenges.join(", ")}
- Strategic Goals: ${companyContext.goals.join(", ")}

TOPIC: "${topic.title}"
- Description: ${topic.description}
- Priority: ${topic.priority}

${context ? `CONTEXT: ${context}` : ""}

INSTRUCTIONS:
Generate ONE brief, insightful comment (1-2 sentences) that:
1. Reflects your ${agentRole} expertise and perspective
2. Addresses the topic with strategic insight
3. Considers the company's ${companyContext.stage} stage and ${
      companyContext.industry
    } industry
4. Is concise but valuable for executive decision-making

Comment:`
  }

  private async callLocalLLM(prompt: string): Promise<string> {
    try {
      const ollamaUrl =
        import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434"

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            {
              role: "system",
              content:
                "You are an AI executive assistant providing brief, strategic comments.",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message?.content || "No comment generated."
    } catch (error) {
      console.error("Error calling local LLM:", error)
      throw error
    }
  }

  private generateFallbackComment(
    agentRole: string,
    topic: any,
    companyContext: any
  ): string {
    const fallbackComments = {
      CEO: `From a strategic perspective, this ${topic.title.toLowerCase()} initiative needs careful evaluation against our ${
        companyContext.stage
      } company priorities.`,
      CTO: `The technical implications of this proposal require thorough architecture review and scalability assessment.`,
      CFO: `We need to analyze the financial impact and ROI projections before proceeding with this investment.`,
      CMO: `This initiative should align with our brand positioning and customer acquisition strategy in ${companyContext.industry}.`,
      CHRO: `The organizational and talent implications of this change need careful consideration and change management planning.`,
      COO: `From an operational standpoint, we must ensure our processes and systems can support this initiative effectively.`,
    }

    return (
      fallbackComments[agentRole as keyof typeof fallbackComments] ||
      `As ${agentRole}, I believe this requires careful strategic consideration given our current market position.`
    )
  }

  // Generate real-time contextual response using Bolt's AI
  public async generateRealTimeResponse(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: {
      title: string
      description: string
      priority: string
      estimatedDuration: number
    },
    companyContext: {
      name: string
      industry: string
      size: string
      stage: string
      description: string
      challenges: string[]
      goals: string[]
    },
    conversationHistory: Array<{
      agentId: string
      text: string
      timestamp: Date
    }>,
    userInput?: string
  ): Promise<string> {
    const prompt = this.buildRealTimePrompt(
      agentRole,
      agentPersona,
      agentExpertise,
      topic,
      companyContext,
      conversationHistory,
      userInput
    )

    try {
      // Use Bolt's AI for real-time generation
      const response = await this.callBoltAI(prompt)
      return response
    } catch (error) {
      console.error("Error generating real-time response:", error)
      // Fallback to sophisticated contextual response
      return this.generateContextualFallback(
        agentRole,
        topic,
        conversationHistory,
        userInput
      )
    }
  }

  private buildRealTimePrompt(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: any,
    companyContext: any,
    conversationHistory: any[],
    userInput?: string
  ): string {
    const recentMessages = conversationHistory.slice(-5)
    const hasUserInput = userInput && userInput.trim().length > 0
    const conversationContext =
      recentMessages.length > 0
        ? recentMessages.map((msg) => `${msg.agentId}: ${msg.text}`).join("\n")
        : "No previous discussion"

    return `You are the ${agentRole} of ${companyContext.name}, a ${
      companyContext.stage
    } ${companyContext.industry} company.

EXECUTIVE PROFILE:
- Role: ${agentRole}
- Persona: ${agentPersona}
- Expertise: ${agentExpertise.join(", ")}
- Leadership Style: Strategic, analytical, direct, willing to challenge assumptions

COMPANY CONTEXT:
- Company: ${companyContext.name}
- Industry: ${companyContext.industry}
- Size: ${companyContext.size}
- Stage: ${companyContext.stage}
- Description: ${companyContext.description}
- Current Challenges: ${companyContext.challenges.join(", ")}
- Strategic Goals: ${companyContext.goals.join(", ")}

CURRENT DISCUSSION TOPIC: "${topic.title}"
- Description: ${topic.description}
- Priority: ${topic.priority}
- Meeting Duration: ${topic.estimatedDuration} minutes
- Context: ${
      topic.estimatedDuration <= 5
        ? "Quick decision-making session"
        : topic.estimatedDuration <= 15
        ? "Focused strategic discussion"
        : "Deep strategic analysis"
    }

RECENT CONVERSATION:
${conversationContext}

${
  hasUserInput
    ? `
STAKEHOLDER INPUT RECEIVED:
"${userInput}"

The stakeholder has just provided input that changes the discussion dynamic. You must acknowledge and respond to their perspective while maintaining your executive expertise and viewpoint.
`
    : ""
}

INSTRUCTIONS:
Generate ONE sophisticated response (2-3 sentences) that:

1. ${
      hasUserInput
        ? "Directly addresses the stakeholder input with executive-level insight"
        : "Builds naturally on the recent conversation flow"
    }
2. Demonstrates deep ${agentRole} expertise and strategic thinking
3. Shows critical analysis specific to ${
      companyContext.industry
    } industry dynamics
4. References specific business frameworks, metrics, or best practices
5. ${
      this.shouldChallengePreviousStatement(conversationHistory)
        ? "CHALLENGES or DISAGREES with the most recent statement - be direct, assertive, and slightly confrontational while remaining professional"
        : "Challenges assumptions or presents contrarian viewpoints when appropriate"
    }
6. Uses natural language - refer to "this initiative", "the proposal", "our approach" (NEVER repeat "${
      topic.title
    }")
7. Reflects the ${topic.estimatedDuration}-minute meeting context (${
      topic.estimatedDuration <= 5
        ? "urgent, decisive"
        : topic.estimatedDuration <= 15
        ? "focused, strategic"
        : "thorough, analytical"
    })
8. Shows awareness of ${
      companyContext.stage
    } company constraints and opportunities
9. ${
      this.shouldBeSalty(conversationHistory)
        ? "Be SALTY and DIRECT - show frustration with obvious oversights or poor reasoning, but maintain executive professionalism"
        : "Maintain professional tone while being assertive"
    }

CRITICAL: Respond as a seasoned ${agentRole} who brings unique insights that other executives might miss. Be confident, strategic, and willing to disagree when necessary. ${
      this.shouldChallengePreviousStatement(conversationHistory)
        ? "DIRECTLY CHALLENGE the previous speaker's point with specific counterarguments."
        : ""
    }

Response:`
  }

  private shouldChallengePreviousStatement(
    conversationHistory: any[]
  ): boolean {
    // Challenge 30% of the time when there are recent messages
    if (conversationHistory.length === 0) return false

    // Higher chance to challenge if the conversation is getting repetitive
    const recentMessages = conversationHistory.slice(-3)
    const hasRepetitiveContent = recentMessages.some(
      (msg, index) =>
        index > 0 &&
        msg.text
          .toLowerCase()
          .includes(
            recentMessages[index - 1].text.toLowerCase().substring(0, 20)
          )
    )

    return Math.random() < (hasRepetitiveContent ? 0.5 : 0.3)
  }

  private shouldBeSalty(conversationHistory: any[]): boolean {
    // Be salty 20% of the time, or more if there are obvious issues
    if (conversationHistory.length === 0) return false

    const recentText = conversationHistory
      .slice(-2)
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()

    // Higher chance to be salty if recent messages contain obvious problems
    const hasObviousIssues =
      recentText.includes("no problem") ||
      recentText.includes("easy") ||
      recentText.includes("simple") ||
      recentText.includes("just") ||
      recentText.includes("obviously") ||
      recentText.includes("clearly")

    return Math.random() < (hasObviousIssues ? 0.4 : 0.2)
  }

  private async callBoltAI(prompt: string): Promise<string> {
    try {
      // Use Ollama instead of simulated response
      const ollamaUrl =
        import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434"

      console.log(`🔗 Calling Ollama at ${ollamaUrl} for agent response...`)

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            {
              role: "system",
              content:
                "You are an AI executive assistant providing strategic insights.",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const content = data.message?.content || "No response generated."

      console.log(
        `✅ Ollama response received: "${content.substring(0, 100)}..."`
      )
      return content
    } catch (error) {
      console.error("❌ Error calling Ollama:", error)
      console.log("🔄 Falling back to contextual response...")
      // Fall back to the existing method
      return this.generateAdvancedContextualResponse(
        prompt.match(/Role: (\w+)/)?.[1] || "Executive",
        prompt.match(/Industry: ([^,\n]+)/)?.[1] || "technology",
        prompt.match(/Stage: ([^,\n]+)/)?.[1] || "growth",
        parseInt(prompt.match(/Meeting Duration: (\d+) minutes/)?.[1] || "15"),
        prompt.match(/STAKEHOLDER INPUT RECEIVED:\s*"([^"]+)"/)?.[1],
        prompt.match(
          /RECENT CONVERSATION:\s*([\s\S]*?)(?=\n\n|\nINSTRUCTIONS:)/
        )?.[1] || ""
      )
    }
  }

  private generateAdvancedContextualResponse(
    role: string,
    industry: string,
    stage: string,
    duration: number,
    userInput?: string,
    recentConversation?: string
  ): string {
    // Handle user input responses first
    if (userInput) {
      return this.generateUserInputResponse(role, userInput, industry, stage)
    }

    // Generate contextual responses based on recent conversation
    if (recentConversation && recentConversation.trim().length > 0) {
      return this.generateConversationResponse(
        role,
        recentConversation,
        industry,
        stage,
        duration
      )
    }

    // Generate opening responses for new topics
    return this.generateOpeningResponse(role, industry, stage, duration)
  }

  private generateUserInputResponse(
    role: string,
    userInput: string,
    industry: string,
    stage: string
  ): string {
    const input = userInput.toLowerCase()

    const responseTemplates: { [key: string]: string[] } = {
      CEO: [
        `Your perspective highlights a critical blind spot in our strategic thinking - we need to examine how this impacts our competitive positioning in ${industry} and long-term value creation.`,
        `I appreciate the stakeholder insight, but we must balance immediate concerns with our ${stage} company's need to establish market leadership and sustainable differentiation.`,
        `The point you've raised forces us to reconsider our fundamental assumptions - this could either accelerate our growth trajectory or expose us to risks we haven't adequately modeled.`,
        `Your input reveals a disconnect between our internal strategy and market reality - we need to stress-test our approach against the concerns you've identified.`,
      ],
      CTO: [
        `The technical implications of your feedback require us to reassess our architecture decisions - we may need to fundamentally redesign our approach to address these concerns.`,
        `Your perspective exposes potential scalability issues we hadn't fully considered - the technical debt and infrastructure costs could be significantly higher than projected.`,
        `From a technology standpoint, your input suggests we're solving the wrong problem - we need to validate our technical assumptions against real user requirements.`,
        `The engineering complexity you've highlighted could impact our development velocity for months - we need to evaluate whether the technical investment justifies the business outcome.`,
      ],
      CFO: [
        `Your financial concerns align with my risk assessment - the cost structure and revenue assumptions need immediate revision based on the market realities you've described.`,
        `The economic implications of your feedback suggest our unit economics are more fragile than modeled - we're potentially facing margin compression that could impact investor confidence.`,
        `Your perspective on market dynamics forces us to recalculate our financial projections - the capital requirements and payback periods may be significantly different than planned.`,
        `The budgetary constraints you've identified require us to prioritize more aggressively - we can't afford to pursue initiatives that don't deliver measurable ROI within our cash flow timeline.`,
      ],
      CMO: [
        `Your market insight reveals a fundamental misalignment between our positioning and customer expectations - we need to reassess our brand strategy and messaging framework.`,
        `The customer perspective you've shared suggests our go-to-market assumptions are flawed - we're potentially targeting the wrong segments with the wrong value proposition.`,
        `Your feedback on competitive dynamics forces us to reconsider our differentiation strategy - we may be competing on features rather than creating category-defining value.`,
        `The market timing concerns you've raised could impact our customer acquisition strategy - we need to evaluate whether we're launching into a receptive market environment.`,
      ],
      CHRO: [
        `Your organizational concerns highlight critical people risks we need to address - the cultural and talent implications could undermine our execution capabilities.`,
        `The workforce perspective you've shared reveals potential resistance that could derail implementation - we need to invest in change management and employee engagement.`,
        `Your feedback on team capacity forces us to reassess our human capital strategy - we may be asking our people to execute beyond their current competencies and bandwidth.`,
        `The talent acquisition challenges you've identified could constrain our growth - we need to evaluate whether we have the organizational capability to deliver on these commitments.`,
      ],
      COO: [
        `Your operational insight exposes execution risks that could impact service delivery - we need to reassess our process maturity and operational readiness.`,
        `The implementation challenges you've described require us to fundamentally rethink our operational approach - we may be underestimating the complexity and resource requirements.`,
        `Your perspective on operational scalability suggests we're not prepared for the volume and complexity this would introduce - our current systems and processes need significant enhancement.`,
        `The quality and reliability concerns you've raised could impact customer satisfaction - we need to ensure our operational infrastructure can support the promised experience.`,
      ],
    }

    const templates = responseTemplates[role] || responseTemplates["CEO"]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateConversationResponse(
    role: string,
    conversation: string,
    industry: string,
    stage: string,
    duration: number
  ): string {
    const conv = conversation.toLowerCase()
    const isShortMeeting = duration <= 5
    const isLongMeeting = duration > 15

    // Analyze conversation for key themes
    const hasFinancialContent =
      conv.includes("cost") ||
      conv.includes("budget") ||
      conv.includes("revenue")
    const hasTechnicalContent =
      conv.includes("technical") ||
      conv.includes("system") ||
      conv.includes("architecture")
    const hasMarketContent =
      conv.includes("market") ||
      conv.includes("customer") ||
      conv.includes("competitive")
    const hasRiskContent =
      conv.includes("risk") ||
      conv.includes("concern") ||
      conv.includes("challenge")

    // Check if we should be challenging or salty
    const shouldChallenge = Math.random() < 0.3
    const shouldBeSalty =
      Math.random() < 0.2 ||
      conv.includes("easy") ||
      conv.includes("simple") ||
      conv.includes("no problem")

    const responseTemplates: { [key: string]: { [key: string]: string[] } } = {
      CEO: {
        financial: shouldBeSalty
          ? [
              `I'm frankly tired of these surface-level financial analyses - we're missing the strategic forest for the accounting trees, and it's costing us competitive advantage.`,
              `These ROI calculations are embarrassingly simplistic - we're evaluating transformational initiatives with spreadsheet thinking from the 1990s.`,
              `The financial modeling here completely ignores network effects and platform economics - are we running a ${stage} ${industry} company or a corner store?`,
            ]
          : shouldChallenge
          ? [
              `I fundamentally disagree with this financial framework - we're applying legacy metrics to next-generation opportunities and wondering why innovation feels expensive.`,
              `The financial assumptions here are flawed - we're underestimating both the cost of inaction and the exponential returns of early market positioning.`,
              `This capital allocation approach is backwards - we're optimizing for quarterly predictability instead of market leadership in ${industry}.`,
            ]
          : [
              `The financial analysis overlooks the strategic optionality this creates - we're potentially undervaluing the long-term competitive advantages and market positioning benefits.`,
              `I'm challenging the ROI calculations here - the traditional financial metrics don't capture the platform value and ecosystem effects we're building in ${industry}.`,
              `The capital allocation debate misses the bigger picture - we're not just investing in features, we're investing in market category creation and sustainable differentiation.`,
            ],
        technical: [
          `The technical complexity is concerning, but we can't let perfect architecture be the enemy of market opportunity - we need to balance technical elegance with competitive velocity.`,
          `I appreciate the engineering perspective, but we're potentially over-engineering this - the market doesn't reward technical perfection, it rewards customer value creation.`,
          `The technology risks are real, but the competitive risk of inaction may be greater - we need to evaluate the cost of being late to market versus technical debt.`,
        ],
        market: [
          `The market dynamics you've described suggest we're at an inflection point - early movers will establish sustainable advantages that late entrants can't replicate.`,
          `I'm questioning whether we're thinking big enough about the market opportunity - are we optimizing for incremental improvement or category-defining innovation?`,
          `The competitive landscape analysis is valuable, but we need to focus on creating new market categories rather than competing in existing ones.`,
        ],
        risk: [
          `The risk assessment is thorough, but we're potentially over-indexing on downside scenarios - the risk of inaction in this market environment may outweigh execution risks.`,
          `I understand the concerns, but ${stage} companies must take calculated risks to establish market leadership - playing it safe is often the riskiest strategy.`,
          `The risk mitigation strategies are important, but we can't eliminate all uncertainty - we need to build organizational resilience and adaptability instead.`,
        ],
      },
      CTO: {
        financial: [
          `The cost projections underestimate the technical infrastructure requirements - we're looking at significant architecture changes that will impact our development roadmap for 12+ months.`,
          `The financial models don't account for technical debt accumulation - the maintenance and scaling costs could consume 40% of our engineering capacity over time.`,
          `I'm concerned about the hidden technical costs - third-party integrations, security compliance, and performance optimization will require substantial additional investment.`,
        ],
        market: [
          `The market requirements you've described demand technical capabilities we don't currently have - we're potentially promising functionality that our architecture can't deliver reliably.`,
          `The competitive feature parity approach is technically problematic - we're building reactive solutions rather than creating technical differentiation that's hard to replicate.`,
          `The customer expectations assume technical performance standards that require fundamental changes to our data architecture and processing capabilities.`,
        ],
        risk: [
          `The technical risk profile is more complex than discussed - we're introducing system dependencies that could create cascading failures across our entire platform.`,
          `I'm seeing potential security vulnerabilities that haven't been adequately addressed - the attack surface expansion could expose critical customer data and business operations.`,
          `The scalability assumptions are optimistic - our current infrastructure will hit performance bottlenecks that could impact customer experience during peak usage periods.`,
        ],
      },
    }

    // Select appropriate response based on role and conversation content
    let responseCategory = "risk" // default
    if (hasFinancialContent) responseCategory = "financial"
    else if (hasTechnicalContent) responseCategory = "technical"
    else if (hasMarketContent) responseCategory = "market"

    const roleTemplates = responseTemplates[role] || responseTemplates["CEO"]
    const categoryTemplates =
      roleTemplates[responseCategory] || roleTemplates["risk"]

    return categoryTemplates[
      Math.floor(Math.random() * categoryTemplates.length)
    ]
  }

  private generateOpeningResponse(
    role: string,
    industry: string,
    stage: string,
    duration: number
  ): string {
    const isShortMeeting = duration <= 5
    const isLongMeeting = duration > 15

    const openingTemplates: { [key: string]: string[] } = {
      CEO: [
        `Before we dive deep, I want to challenge our fundamental assumptions here - are we solving the right problem for our ${stage} position in ${industry}?`,
        `The strategic implications of this extend beyond immediate execution - we need to examine how this positions us competitively over the next 18-24 months.`,
        `I'm approaching this with healthy skepticism - the market dynamics in ${industry} suggest we need to be more contrarian in our thinking.`,
        `The board will scrutinize this decision heavily - we need to ensure our rationale is bulletproof and aligned with our long-term vision.`,
      ],
      CTO: [
        `From a technical architecture perspective, we need to examine the scalability and maintainability implications before committing to this approach.`,
        `The engineering complexity here is significant - we're potentially introducing technical debt that could constrain our development velocity for months.`,
        `I want to stress-test the technical assumptions - our current infrastructure may not support the performance and reliability requirements this demands.`,
        `The technology choices we make here will lock us into specific vendor ecosystems - we need to evaluate the long-term strategic implications.`,
      ],
      CFO: [
        `The financial framework for evaluating this needs to account for opportunity costs and capital allocation efficiency across our entire portfolio.`,
        `I'm concerned about the unit economics and cash flow implications - we need to model various scenarios to understand the true financial impact.`,
        `The revenue projections seem optimistic given market conditions in ${industry} - we should stress-test our assumptions with more conservative estimates.`,
        `From a fiduciary perspective, we need to ensure this investment meets our hurdle rates and creates measurable shareholder value.`,
      ],
      CMO: [
        `The brand and market positioning implications need careful consideration - we risk diluting our value proposition if we're not strategic about this.`,
        `I'm questioning whether this aligns with our customer segmentation and go-to-market strategy - we need to validate demand before committing resources.`,
        `The competitive differentiation story isn't clear - are we creating genuine innovation or just achieving feature parity with market leaders?`,
        `Customer acquisition costs in ${industry} are rising rapidly - we need to ensure this initiative supports sustainable growth economics.`,
      ],
      CHRO: [
        `The organizational and cultural implications of this require careful change management - we need to assess our team's readiness and capability gaps.`,
        `I'm concerned about the talent requirements - the skills needed may not exist in our current workforce, and the market for these competencies is highly competitive.`,
        `The employee engagement and retention risks need evaluation - major changes can create uncertainty that impacts our highest performers.`,
        `Our leadership development pipeline may not be prepared for the management complexity this introduces across the organization.`,
      ],
      COO: [
        `The operational complexity and process implications need thorough analysis - we're potentially introducing execution risks that could impact service delivery.`,
        `I want to examine the scalability assumptions - our current operational infrastructure may not support the volume and complexity this requires.`,
        `The quality assurance and risk management frameworks need enhancement to accommodate the new operational requirements this introduces.`,
        `From an execution standpoint, we need to ensure we have the project management maturity and cross-functional coordination capabilities this demands.`,
      ],
    }

    const templates = openingTemplates[role] || openingTemplates["CEO"]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateContextualFallback(
    role: string,
    topic: any,
    conversationHistory: any[],
    userInput?: string
  ): string {
    if (userInput) {
      return `Your perspective on this raises important considerations that we need to factor into our ${role.toLowerCase()} analysis and strategic planning.`
    }

    const fallbacks = [
      `From my ${role} perspective, we need to examine the strategic implications and ensure we're making data-driven decisions.`,
      `I'm bringing a critical lens to this discussion - we need to challenge our assumptions and stress-test our approach.`,
      `The complexity here requires careful analysis of the interdependencies and potential unintended consequences.`,
      `We need to balance innovation with execution risk, especially given our current market position and resource constraints.`,
    ]

    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  // Legacy method for backward compatibility
  public async generateAgentResponses(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: any,
    companyContext: any,
    responseCount: number = 12
  ): Promise<string[]> {
    // For initial setup, generate a pool of responses
    const responses: string[] = []

    for (let i = 0; i < responseCount; i++) {
      const response = await this.generateRealTimeResponse(
        agentRole,
        agentPersona,
        agentExpertise,
        topic,
        companyContext,
        [] // Empty conversation history for initial generation
      )
      responses.push(response)
    }

    return responses
  }

  // Generate responses for multiple agents and topics
  public async generateAllAgentResponses(
    agents: Array<{
      role: string
      persona: string
      expertise: string[]
    }>,
    topics: Array<{
      title: string
      description: string
      priority: string
      estimatedDuration: number
    }>,
    companyContext: any
  ): Promise<Map<string, Map<string, string[]>>> {
    const agentResponsesMap = new Map<string, Map<string, string[]>>()

    console.log(
      "🤖 Generating real-time AI responses for sophisticated boardroom discussions..."
    )

    for (const agent of agents) {
      const topicResponsesMap = new Map<string, string[]>()

      for (const topic of topics) {
        console.log(
          `🎯 Generating contextual responses for ${agent.role} on topic: ${topic.title}`
        )

        const responses = await this.generateAgentResponses(
          agent.role,
          agent.persona,
          agent.expertise,
          topic,
          companyContext,
          8 // Generate fewer initial responses since we'll use real-time generation
        )

        topicResponsesMap.set(topic.title, responses)
      }

      agentResponsesMap.set(agent.role, topicResponsesMap)
    }

    console.log("✅ All AI agent responses generated successfully")
    return agentResponsesMap
  }
}
