import { Message, Topic, CompanyContext } from "../types"

export class SummaryAgent {
  private companyContext: CompanyContext

  constructor(companyContext: CompanyContext) {
    this.companyContext = companyContext
  }

  // Generate a comprehensive conversation summary
  public generateConversationSummary(
    topic: Topic,
    messages: Message[]
  ): {
    summary: string
    outcome: string | null
    keyDecisions: string[]
    mainConcerns: string[]
    nextSteps: string[]
  } {
    if (messages.length === 0) {
      return {
        summary: "No discussion has taken place yet.",
        outcome: null,
        keyDecisions: [],
        mainConcerns: [],
        nextSteps: [],
      }
    }

    const agentMessages = messages.filter((msg) => msg.agentId !== "user")
    const userMessages = messages.filter((msg) => msg.agentId === "user")
    const participants = new Set(messages.map((msg) => msg.agentId))

    // Analyze conversation content
    const allText = messages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()

    // Generate comprehensive summary
    const summary = this.generateDetailedSummary(
      topic,
      messages,
      participants.size
    )

    // Determine outcome based on conversation analysis
    const outcome = this.determineOutcome(allText, topic)

    // Extract key decisions, concerns, and next steps
    const keyDecisions = this.extractKeyDecisions(messages)
    const mainConcerns = this.extractMainConcerns(messages)
    const nextSteps = this.extractNextSteps(messages, topic)

    return {
      summary,
      outcome,
      keyDecisions,
      mainConcerns,
      nextSteps,
    }
  }

  private generateDetailedSummary(
    topic: Topic,
    messages: Message[],
    participantCount: number
  ): string {
    const agentMessages = messages.filter((msg) => msg.agentId !== "user")
    const userMessages = messages.filter((msg) => msg.agentId === "user")

    // Analyze conversation dynamics
    const conversationLength = messages.length
    const avgMessageLength =
      messages.reduce((sum, msg) => sum + msg.text.length, 0) / messages.length

    // Determine conversation intensity
    let intensity = "moderate"
    if (conversationLength > 10 && avgMessageLength > 150) {
      intensity = "intense"
    } else if (conversationLength < 6 || avgMessageLength < 100) {
      intensity = "brief"
    }

    // Analyze executive perspectives
    const executiveRoles = this.getExecutiveRoles(messages)
    const perspectiveAnalysis = this.analyzeExecutivePerspectives(messages)

    // Generate contextual summary
    let summary = `The board conducted a${
      intensity === "intense"
        ? "n intense"
        : intensity === "brief"
        ? " brief"
        : ""
    } discussion on ${topic.title.toLowerCase()}`

    if (userMessages.length > 0) {
      summary += ` with stakeholder input`
    }

    summary += `. ${
      executiveRoles.length
    } executives participated, bringing diverse perspectives from ${executiveRoles
      .join(", ")
      .toLowerCase()} functions.`

    // Add perspective analysis
    if (perspectiveAnalysis.consensus) {
      summary += ` The discussion revealed general consensus around the strategic direction, though executives raised important implementation considerations.`
    } else if (perspectiveAnalysis.majorDisagreement) {
      summary += ` The conversation highlighted significant disagreements between executives, particularly around feasibility, costs, and strategic priorities.`
    } else {
      summary += ` Executives presented balanced viewpoints, with healthy debate around execution challenges and strategic implications.`
    }

    // Add company context relevance
    summary += ` Given ${this.companyContext.name}'s position as a ${
      this.companyContext.stage
    } ${
      this.companyContext.industry
    } company, the discussion focused on ${this.getContextualFocus(
      topic,
      messages
    )}.`

    return summary
  }

  private getExecutiveRoles(messages: Message[]): string[] {
    const roles = new Set<string>()
    messages.forEach((msg) => {
      if (msg.agentId !== "user") {
        // Extract role from agent ID or message context
        if (msg.agentId.includes("CEO") || msg.agentId.includes("ceo"))
          roles.add("CEO")
        if (msg.agentId.includes("CTO") || msg.agentId.includes("cto"))
          roles.add("CTO")
        if (msg.agentId.includes("CFO") || msg.agentId.includes("cfo"))
          roles.add("CFO")
        if (msg.agentId.includes("CMO") || msg.agentId.includes("cmo"))
          roles.add("CMO")
        if (msg.agentId.includes("CHRO") || msg.agentId.includes("chro"))
          roles.add("CHRO")
        if (msg.agentId.includes("COO") || msg.agentId.includes("coo"))
          roles.add("COO")
      }
    })
    return Array.from(roles)
  }

  private analyzeExecutivePerspectives(messages: Message[]): {
    consensus: boolean
    majorDisagreement: boolean
    balancedDebate: boolean
  } {
    const agentMessages = messages.filter((msg) => msg.agentId !== "user")
    const allText = agentMessages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()

    // Look for consensus indicators
    const consensusWords = [
      "agree",
      "aligned",
      "consensus",
      "support",
      "endorse",
    ]
    const disagreementWords = [
      "disagree",
      "concerned",
      "challenge",
      "question",
      "oppose",
      "risk",
    ]
    const challengingWords = [
      "however",
      "but",
      "although",
      "questioning",
      "challenging",
    ]

    const consensusCount = consensusWords.filter((word) =>
      allText.includes(word)
    ).length
    const disagreementCount = disagreementWords.filter((word) =>
      allText.includes(word)
    ).length
    const challengingCount = challengingWords.filter((word) =>
      allText.includes(word)
    ).length

    const consensus = consensusCount > disagreementCount && challengingCount < 3
    const majorDisagreement =
      disagreementCount > consensusCount * 1.5 || challengingCount > 5
    const balancedDebate = !consensus && !majorDisagreement

    return { consensus, majorDisagreement, balancedDebate }
  }

  private getContextualFocus(topic: Topic, messages: Message[]): string {
    const allText = messages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()
    const industry = this.companyContext.industry.toLowerCase()
    const stage = this.companyContext.stage

    // Determine focus based on content analysis
    if (allText.includes("market") || allText.includes("competitive")) {
      return `market positioning and competitive dynamics in the ${industry} sector`
    } else if (
      allText.includes("financial") ||
      allText.includes("cost") ||
      allText.includes("budget")
    ) {
      return `financial implications and capital allocation priorities for a ${stage} company`
    } else if (
      allText.includes("technical") ||
      allText.includes("technology")
    ) {
      return `technical feasibility and infrastructure requirements`
    } else if (allText.includes("team") || allText.includes("organizational")) {
      return `organizational capabilities and talent requirements`
    } else if (allText.includes("customer") || allText.includes("user")) {
      return `customer impact and market adoption strategies`
    } else {
      return `strategic execution and operational considerations`
    }
  }

  private determineOutcome(allText: string, topic: Topic): string | null {
    // Analyze actual conversation content for realistic outcomes
    const positiveWords = [
      "approved",
      "proceed",
      "move forward",
      "implement",
      "execute",
      "green light",
      "agree",
      "support",
      "recommend",
    ]
    const negativeWords = [
      "rejected",
      "postpone",
      "table",
      "reconsider",
      "not ready",
      "too risky",
      "concern",
      "challenge",
      "disagree",
    ]
    const neutralWords = [
      "further analysis",
      "more research",
      "additional information",
      "next phase",
      "review",
      "evaluate",
      "assess",
    ]

    const positiveCount = positiveWords.filter((word) =>
      allText.includes(word)
    ).length
    const negativeCount = negativeWords.filter((word) =>
      allText.includes(word)
    ).length
    const neutralCount = neutralWords.filter((word) =>
      allText.includes(word)
    ).length

    // Analyze conversation sentiment more realistically
    const hasStrongConcerns =
      allText.includes("risk") ||
      allText.includes("concern") ||
      allText.includes("challenge")
    const hasFinancialIssues =
      allText.includes("cost") ||
      allText.includes("budget") ||
      allText.includes("expensive")
    const hasTechnicalIssues =
      allText.includes("complex") ||
      allText.includes("difficult") ||
      allText.includes("architecture")
    const hasMarketConcerns =
      allText.includes("market") ||
      allText.includes("competitive") ||
      allText.includes("timing")

    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      return `The board reached a preliminary consensus to move forward with ${topic.title.toLowerCase()}, pending resolution of identified implementation challenges.`
    } else if (negativeCount > positiveCount) {
      return `The discussion revealed significant concerns about ${topic.title.toLowerCase()}, with executives recommending further analysis before proceeding.`
    } else if (
      neutralCount > 0 ||
      (positiveCount === negativeCount && positiveCount > 0)
    ) {
      return `The board agreed that ${topic.title.toLowerCase()} requires additional research and stakeholder input before making a final decision.`
    } else {
      return `The discussion provided valuable insights on ${topic.title.toLowerCase()}, with executives presenting diverse perspectives for future consideration.`
    }
  }

  private extractKeyDecisions(messages: Message[]): string[] {
    const decisions: string[] = []
    const agentMessages = messages.filter((msg) => msg.agentId !== "user")

    // Look for decision-indicating language
    agentMessages.forEach((msg) => {
      const text = msg.text.toLowerCase()
      if (
        text.includes("we need to") ||
        text.includes("we should") ||
        text.includes("we must")
      ) {
        // Extract the decision/action
        const sentences = msg.text.split(/[.!?]+/)
        sentences.forEach((sentence) => {
          if (
            sentence.toLowerCase().includes("we need to") ||
            sentence.toLowerCase().includes("we should") ||
            sentence.toLowerCase().includes("we must")
          ) {
            decisions.push(sentence.trim())
          }
        })
      }
    })

    // Add some contextual decisions based on conversation analysis
    const allText = messages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()

    if (allText.includes("budget") && allText.includes("analysis")) {
      decisions.push("Conduct detailed financial analysis and budget planning")
    }
    if (allText.includes("technical") && allText.includes("architecture")) {
      decisions.push(
        "Review technical architecture and infrastructure requirements"
      )
    }
    if (allText.includes("market") && allText.includes("research")) {
      decisions.push(
        "Perform additional market research and competitive analysis"
      )
    }

    return decisions.slice(0, 5) // Limit to top 5 decisions
  }

  private extractMainConcerns(messages: Message[]): string[] {
    const concerns: string[] = []
    const agentMessages = messages.filter((msg) => msg.agentId !== "user")

    // Look for concern-indicating language
    agentMessages.forEach((msg) => {
      const text = msg.text.toLowerCase()
      if (
        text.includes("concern") ||
        text.includes("risk") ||
        text.includes("challenge") ||
        text.includes("problem")
      ) {
        // Extract the concern
        const sentences = msg.text.split(/[.!?]+/)
        sentences.forEach((sentence) => {
          if (
            sentence.toLowerCase().includes("concern") ||
            sentence.toLowerCase().includes("risk") ||
            sentence.toLowerCase().includes("challenge") ||
            sentence.toLowerCase().includes("problem")
          ) {
            concerns.push(sentence.trim())
          }
        })
      }
    })

    // Add contextual concerns based on executive roles and content
    const allText = messages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()

    if (allText.includes("cost") && allText.includes("budget")) {
      concerns.push("Financial impact and budget constraints")
    }
    if (allText.includes("technical") && allText.includes("complex")) {
      concerns.push("Technical complexity and implementation challenges")
    }
    if (allText.includes("team") && allText.includes("capacity")) {
      concerns.push("Organizational capacity and talent availability")
    }
    if (allText.includes("market") && allText.includes("timing")) {
      concerns.push("Market timing and competitive response")
    }

    return concerns.slice(0, 6) // Limit to top 6 concerns
  }

  private extractNextSteps(messages: Message[], topic: Topic): string[] {
    const nextSteps: string[] = []
    const agentMessages = messages.filter((msg) => msg.agentId !== "user")

    // Look for next step language
    agentMessages.forEach((msg) => {
      const text = msg.text.toLowerCase()
      if (
        text.includes("next step") ||
        text.includes("follow up") ||
        text.includes("action item")
      ) {
        const sentences = msg.text.split(/[.!?]+/)
        sentences.forEach((sentence) => {
          if (
            sentence.toLowerCase().includes("next step") ||
            sentence.toLowerCase().includes("follow up") ||
            sentence.toLowerCase().includes("action item")
          ) {
            nextSteps.push(sentence.trim())
          }
        })
      }
    })

    // Generate realistic next steps based on actual conversation content and concerns raised
    const allText = messages
      .map((msg) => msg.text)
      .join(" ")
      .toLowerCase()
    const executiveRoles = this.getExecutiveRoles(messages)

    // Analyze specific concerns mentioned in conversation
    if (
      allText.includes("cost") ||
      allText.includes("budget") ||
      allText.includes("financial")
    ) {
      nextSteps.push(
        `CFO to prepare detailed financial analysis and ROI projections for ${topic.title.toLowerCase()}`
      )
    }
    if (
      allText.includes("technical") ||
      allText.includes("architecture") ||
      allText.includes("system")
    ) {
      nextSteps.push(
        `CTO to conduct technical feasibility assessment and architecture review`
      )
    }
    if (
      allText.includes("market") ||
      allText.includes("customer") ||
      allText.includes("competitive")
    ) {
      nextSteps.push(
        `CMO to provide market analysis and competitive positioning strategy`
      )
    }
    if (
      allText.includes("team") ||
      allText.includes("capacity") ||
      allText.includes("resource")
    ) {
      nextSteps.push(
        `CHRO to assess organizational capacity and talent requirements`
      )
    }
    if (
      allText.includes("risk") ||
      allText.includes("concern") ||
      allText.includes("challenge")
    ) {
      nextSteps.push(
        `Risk assessment committee to evaluate and mitigate identified concerns`
      )
    }

    // Add follow-up based on conversation outcome
    if (nextSteps.length > 0) {
      nextSteps.push(
        `Schedule follow-up board meeting in 2 weeks to review analysis and make final decision on ${topic.title.toLowerCase()}`
      )
    } else {
      nextSteps.push(
        `Proceed with implementation planning for ${topic.title.toLowerCase()} as discussed`
      )
    }

    return nextSteps.slice(0, 4) // Limit to top 4 next steps for readability
  }
}
