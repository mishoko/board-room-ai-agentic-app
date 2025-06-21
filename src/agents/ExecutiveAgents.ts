import { BoardAgentBase } from "./BoardAgentBase"
import { Agent, Message, Topic } from "../types"
import { LLMService } from "../services/LLMService"
import { CommentService } from "../services/CommentService"

export class CEOAgent extends BoardAgentBase {
  private llmService = LLMService.getInstance()

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      // Always use the latest conversation history for context
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      console.log(
        `🎯 CEO generating response with ${
          conversationHistory.length
        } recent messages, userInput: ${context.userInput ? "YES" : "NO"}`
      )

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time CEO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    // Enhanced fallback that considers recent context and user input
    if (context.userInput) {
      return `Your perspective challenges our strategic assumptions - we need to reconsider how this impacts our competitive positioning and long-term value creation in ${this.companyContext.industry}.`
    }

    // Analyze recent conversation for challenging responses
    const recentText = context.recentMessages
      .slice(-2)
      .map((m) => m.text)
      .join(" ")
      .toLowerCase()

    if (recentText.includes("cost") || recentText.includes("budget")) {
      return `I'm challenging the financial assumptions here - we're potentially undervaluing the strategic optionality this creates for our ${this.companyContext.stage} company.`
    } else if (
      recentText.includes("technical") ||
      recentText.includes("architecture")
    ) {
      return `The technical complexity is concerning, but we can't let perfect architecture be the enemy of market opportunity - speed to market matters more than technical elegance.`
    } else if (recentText.includes("risk") || recentText.includes("concern")) {
      return `The risk assessment is thorough, but we're potentially over-indexing on downside scenarios - the competitive risk of inaction may outweigh execution risks.`
    }

    // Default challenging CEO response
    const challengingResponses = [
      `I'm questioning whether we're thinking big enough about this opportunity - are we optimizing for incremental improvement or category-defining innovation?`,
      `The strategic implications extend beyond immediate execution - we need to examine how this positions us competitively over the next 18-24 months.`,
      `I want to challenge our fundamental assumptions here - are we solving the right problem for our market position?`,
      `The board will scrutinize this heavily - we need bulletproof rationale that aligns with our long-term vision.`,
    ]

    return challengingResponses[
      Math.floor(Math.random() * challengingResponses.length)
    ]
  }

  // Optional method for backward compatibility
  setTopicResponses(responses: string[]): void {
    // No longer needed in comment-based approach
    console.log(
      `CEO agent received ${responses.length} pre-generated responses (not used in comment mode)`
    )
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    // CEO responds to strategic topics and high-priority items
    const strategicKeywords = [
      "strategy",
      "vision",
      "growth",
      "market",
      "competition",
      "decision",
      "risk",
      "opportunity",
    ]
    const hasStrategicContent =
      keywords?.some((keyword) =>
        strategicKeywords.some((strategic) => keyword.includes(strategic))
      ) || false

    const priorityWeight =
      topic.priority === "high" ? 0.9 : topic.priority === "medium" ? 0.7 : 0.5

    return Math.random() < (hasStrategicContent ? 0.9 : priorityWeight)
  }
}

export class CTOAgent extends BoardAgentBase {
  private llmService = LLMService.getInstance()

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      // Always use the latest conversation history for context
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      console.log(
        `🎯 CTO generating response with ${
          conversationHistory.length
        } recent messages, userInput: ${context.userInput ? "YES" : "NO"}`
      )

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time CTO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    // Enhanced fallback that considers recent context and user input
    if (context.userInput) {
      return `The technical implications of your feedback require us to reassess our architecture decisions - we may need to fundamentally redesign our approach to address these concerns.`
    }

    // Analyze recent conversation for challenging responses
    const recentText = context.recentMessages
      .slice(-2)
      .map((m) => m.text)
      .join(" ")
      .toLowerCase()

    if (recentText.includes("cost") || recentText.includes("budget")) {
      return `The cost projections underestimate the technical infrastructure requirements - we're looking at significant architecture changes that will impact our development roadmap for 12+ months.`
    } else if (
      recentText.includes("market") ||
      recentText.includes("customer")
    ) {
      return `The market requirements you've described demand technical capabilities we don't currently have - we're potentially promising functionality that our architecture can't deliver reliably.`
    } else if (recentText.includes("risk") || recentText.includes("concern")) {
      return `The technical risk profile is more complex than discussed - we're introducing system dependencies that could create cascading failures across our entire platform.`
    }

    // Default challenging CTO response
    const challengingResponses = [
      `The technical debt implications of this concern me - we're potentially creating maintenance overhead that could constrain our engineering velocity for the next 18 months.`,
      `I'm questioning the architectural assumptions behind this - the proposed solution doesn't account for fault tolerance and disaster recovery requirements at our scale.`,
      `The technology choices for this will lock us into specific vendor ecosystems - we need to evaluate the long-term strategic implications of these dependencies.`,
      `Performance benchmarking for this shows concerning latency patterns under load - we may need to reconsider the fundamental approach to data processing and caching.`,
    ]

    return challengingResponses[
      Math.floor(Math.random() * challengingResponses.length)
    ]
  }

  setTopicResponses(responses: string[]): void {
    console.log(
      `CTO agent received ${responses.length} pre-generated responses (not used in comment mode)`
    )
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    const technicalKeywords = [
      "technology",
      "system",
      "infrastructure",
      "development",
      "security",
      "performance",
      "architecture",
      "integration",
    ]
    const hasTechnicalContent =
      keywords?.some((keyword) =>
        technicalKeywords.some((technical) => keyword.includes(technical))
      ) || false

    return Math.random() < (hasTechnicalContent ? 0.9 : 0.6)
  }
}

// Similar pattern for other agents - CFO, CMO, CHRO, COO
export class CFOAgent extends BoardAgentBase {
  private responsePool: string[] = []
  private usedResponses: Set<string> = new Set()
  private llmService = LLMService.getInstance()

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses
    this.usedResponses.clear()
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time CFO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some((msg) => msg.agentId === "user")
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    const financialFrameworks = [
      `The capital efficiency of this is questionable - we're deploying significant resources for returns that don't meet our weighted average cost of capital thresholds.`,
      `I'm concerned about the cash flow timing for this - the J-curve effect could strain liquidity during our peak growth phase when we need maximum financial flexibility.`,
      `The competitive pricing pressure in our market means this will face immediate margin compression - our cost structure isn't optimized for the price points customers will accept.`,
      `Risk-adjusted returns for this don't justify the capital allocation when compared to our other strategic initiatives - we need to prioritize based on financial discipline, not just strategic appeal.`,
    ]

    return financialFrameworks[
      Math.floor(Math.random() * financialFrameworks.length)
    ]
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.85
    }

    const financialKeywords = [
      "budget",
      "cost",
      "revenue",
      "profit",
      "investment",
      "financial",
      "roi",
      "margin",
      "cash",
      "capital",
    ]
    const hasFinancialContent =
      keywords?.some((keyword) =>
        financialKeywords.some((financial) => keyword.includes(financial))
      ) || false

    return Math.random() < (hasFinancialContent ? 0.95 : 0.7)
  }
}

export class CMOAgent extends BoardAgentBase {
  private responsePool: string[] = []
  private usedResponses: Set<string> = new Set()
  private llmService = LLMService.getInstance()

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses
    this.usedResponses.clear()
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time CMO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some((msg) => msg.agentId === "user")
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    const marketingFrameworks = [
      `The customer segmentation for this is flawed - we're targeting demographics rather than behavioral cohorts, which explains why our messaging isn't resonating with actual buyers.`,
      `Brand differentiation for this is weak - we're competing on features rather than creating an emotional connection that drives customer loyalty and premium pricing power.`,
      `The go-to-market timing for this conflicts with our customers' budget cycles and decision-making processes - we're launching when they're least likely to evaluate new solutions.`,
      `Customer lifetime value assumptions for this don't account for churn patterns in this category - retention rates are significantly lower than our models suggest.`,
    ]

    return marketingFrameworks[
      Math.floor(Math.random() * marketingFrameworks.length)
    ]
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75
    }

    const marketingKeywords = [
      "brand",
      "marketing",
      "customer",
      "market",
      "campaign",
      "audience",
      "positioning",
      "competitive",
      "pricing",
    ]
    const hasMarketingContent =
      keywords?.some((keyword) =>
        marketingKeywords.some((marketing) => keyword.includes(marketing))
      ) || false

    return Math.random() < (hasMarketingContent ? 0.9 : 0.6)
  }
}

export class CHROAgent extends BoardAgentBase {
  private responsePool: string[] = []
  private usedResponses: Set<string> = new Set()
  private llmService = LLMService.getInstance()

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses
    this.usedResponses.clear()
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time CHRO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some((msg) => msg.agentId === "user")
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    const organizationalFrameworks = [
      `The change management requirements for this exceed our organizational capacity - we're already managing multiple transformation initiatives that are straining our people and culture.`,
      `Performance management implications of this are complex - existing KPIs don't capture the new behaviors we need, and our review processes aren't designed for this type of work.`,
      `Leadership development pipeline isn't prepared for this - we lack the management capabilities needed to scale this initiative effectively across the organization.`,
      `Diversity and inclusion implications of this could inadvertently create barriers for underrepresented groups - we need to ensure equitable access to opportunities and advancement.`,
    ]

    return organizationalFrameworks[
      Math.floor(Math.random() * organizationalFrameworks.length)
    ]
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7
    }

    const hrKeywords = [
      "people",
      "team",
      "culture",
      "talent",
      "hiring",
      "employee",
      "training",
      "organizational",
      "skills",
      "development",
    ]
    const hasHRContent =
      keywords?.some((keyword) =>
        hrKeywords.some((hr) => keyword.includes(hr))
      ) || false

    return Math.random() < (hasHRContent ? 0.9 : 0.6)
  }
}

export class COOAgent extends BoardAgentBase {
  private responsePool: string[] = []
  private usedResponses: Set<string> = new Set()
  private llmService = LLMService.getInstance()

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses
    this.usedResponses.clear()
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[]
      topic: Topic
      userInput?: string
    }
  ): Promise<string> {
    try {
      const conversationHistory = context.recentMessages.map((msg) => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp,
      }))

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration,
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      )

      return response
    } catch (error) {
      console.error("Error generating real-time COO response:", error)
      return this.generateAdvancedContextualResponse(context)
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some((msg) => msg.agentId === "user")
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[]
    topic: Topic
    userInput?: string
  }): string {
    const operationalFrameworks = [
      `The operational risk profile of this introduces single points of failure that could cascade through our entire service delivery - we need redundancy and failover processes we don't currently have.`,
      `Quality assurance frameworks can't adequately monitor this - we're introducing complexity that our current systems can't detect or prevent from impacting customers.`,
      `Supply chain implications of this create vendor dependencies and procurement challenges that could constrain our operational flexibility and increase costs significantly.`,
      `Business continuity planning for this reveals gaps in our disaster recovery and risk management protocols - we're not prepared for the operational failure modes this introduces.`,
    ]

    return operationalFrameworks[
      Math.floor(Math.random() * operationalFrameworks.length)
    ]
  }

  shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75
    }

    const operationalKeywords = [
      "operations",
      "process",
      "efficiency",
      "workflow",
      "execution",
      "delivery",
      "implementation",
      "scaling",
      "quality",
    ]
    const hasOperationalContent =
      keywords?.some((keyword) =>
        operationalKeywords.some((ops) => keyword.includes(ops))
      ) || false

    return Math.random() < (hasOperationalContent ? 0.9 : 0.65)
  }
}
