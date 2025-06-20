import { BoardAgentBase } from './BoardAgentBase';
import { Agent, Message, Topic } from '../types';

export class CEOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  // Set pre-generated responses for this topic
  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    // If user input is provided or conversation was interrupted, generate contextual response
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    // Use pre-generated responses from LLM if available and conversation hasn't been interrupted
    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      // Find an unused response, or reset if all have been used
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        // Reset used responses if we've exhausted the pool
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    // Generate contextual response based on conversation history
    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    // Check if there are any user messages in recent conversation
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic, userInput } = context;
    
    // Analyze recent conversation for sophisticated context
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-4);
    const companyContext = this.companyContext;
    
    // Advanced CEO responses based on user input - TOPIC-RELEVANT
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('budget') || userText.includes('cost') || userText.includes('expensive')) {
        return `I'm challenging the cost assumptions here - we need to examine the total economic impact of this initiative, including opportunity costs and strategic value creation, not just immediate budget implications.`;
      } else if (userText.includes('risk') || userText.includes('concern') || userText.includes('problem')) {
        return `Your risk assessment is valid, but we're potentially over-indexing on downside scenarios. The competitive risk of inaction on this initiative may outweigh the execution risks we're discussing.`;
      } else if (userText.includes('competition') || userText.includes('competitor') || userText.includes('market')) {
        return `The competitive dynamics you've raised are crucial - this isn't just about internal optimization, it's about market positioning and creating sustainable differentiation in ${companyContext.industry}.`;
      } else if (userText.includes('customer') || userText.includes('user') || userText.includes('client')) {
        return `Customer-centricity is essential, but we need to distinguish between what customers say they want and what actually drives purchasing behavior. This must create measurable customer value, not just satisfaction.`;
      } else if (userText.includes('timeline') || userText.includes('schedule') || userText.includes('deadline')) {
        return `Timeline pressure is real, but premature execution could be more damaging than delayed perfection. We need to balance speed-to-market with strategic coherence on this initiative.`;
      } else {
        return `Your perspective adds important nuance to our discussion. As CEO, I'm focused on ensuring this decision aligns with our long-term strategic vision while addressing the immediate concerns you've raised about ${topic.title.toLowerCase()}.`;
      }
    }
    
    // Generate sophisticated responses based on conversation flow and other executives' input
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CTO' && (messageText.includes('technical') || messageText.includes('architecture'))) {
        return `I appreciate the technical complexity you've outlined, but we can't let perfect architecture be the enemy of market opportunity. This initiative needs to balance technical elegance with business velocity.`;
      } else if (agentRole === 'CFO' && (messageText.includes('financial') || messageText.includes('cost') || messageText.includes('roi'))) {
        return `The financial analysis is thorough, but we're potentially undervaluing the strategic optionality this creates. Some investments pay dividends beyond immediate ROI calculations.`;
      } else if (agentRole === 'CMO' && (messageText.includes('brand') || messageText.includes('customer') || messageText.includes('market'))) {
        return `Brand considerations are important, but we can't let brand consistency constrain strategic evolution. This might require us to expand our brand narrative rather than fit within existing constraints.`;
      } else if (agentRole === 'CHRO' && (messageText.includes('team') || messageText.includes('culture') || messageText.includes('people'))) {
        return `People challenges are real, but organizational capability can be built. The question isn't whether we have the right team for this today, but whether we can develop it.`;
      } else if (agentRole === 'COO' && (messageText.includes('operational') || messageText.includes('process') || messageText.includes('execution'))) {
        return `Operational complexity is a valid concern, but we've scaled through complexity before. This requires us to elevate our operational sophistication, not avoid operational challenges.`;
      }
    }

    // Default sophisticated CEO response - TOPIC-RELEVANT
    const strategicFrameworks = [
      `The strategic implications of this initiative extend beyond immediate tactical execution - we're potentially reshaping our competitive positioning in ${companyContext.industry}.`,
      `I'm questioning whether we're thinking big enough about this opportunity. Are we optimizing for incremental improvement or creating category-defining differentiation?`,
      `The market timing for this feels critical - we're at an inflection point where early movers will establish sustainable advantages.`,
      `We need to examine this through the lens of stakeholder value creation - customers, employees, investors, and partners all have different success metrics for this initiative.`
    ];
    
    return strategicFrameworks[Math.floor(Math.random() * strategicFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    // Extract role from agent ID or return generic
    if (agentId.includes('cto') || agentId.includes('CTO')) return 'CTO';
    if (agentId.includes('cfo') || agentId.includes('CFO')) return 'CFO';
    if (agentId.includes('cmo') || agentId.includes('CMO')) return 'CMO';
    if (agentId.includes('chro') || agentId.includes('CHRO')) return 'CHRO';
    if (agentId.includes('coo') || agentId.includes('COO')) return 'COO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    // CEO responds more frequently if conversation was interrupted by user
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.85; // Higher chance to respond after user input
    }

    // CEO responds to strategic topics and when decisions need to be made
    const strategicKeywords = ['strategy', 'vision', 'growth', 'market', 'competition', 'decision', 'risk', 'opportunity'];
    const hasStrategicContent = keywords?.some(keyword => 
      strategicKeywords.some(strategic => keyword.includes(strategic))
    ) || false;

    // CEO is more likely to respond to high-priority topics and when challenging other executives
    const priorityWeight = topic.priority === 'high' ? 0.9 : topic.priority === 'medium' ? 0.7 : 0.5;
    
    // Increase response rate if other executives have spoken recently (CEO often challenges or builds on others' points)
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldChallenge = recentAgentMessages.length > 0 && Math.random() < 0.4;
    
    return Math.random() < (hasStrategicContent ? 0.9 : priorityWeight) || shouldChallenge;
  }
}

export class CTOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('security') || userText.includes('data') || userText.includes('privacy')) {
        return `Security architecture for this initiative is non-negotiable - we're looking at zero-trust implementation, end-to-end encryption, and compliance with SOC 2 Type II requirements, which adds 6-8 weeks to our timeline.`;
      } else if (userText.includes('scale') || userText.includes('performance') || userText.includes('load')) {
        return `The scalability concerns are valid - this will require horizontal scaling architecture with distributed caching and database sharding, fundamentally changing our infrastructure cost model.`;
      } else if (userText.includes('integration') || userText.includes('api') || userText.includes('system')) {
        return `API design for this must be backwards-compatible while supporting future extensibility - we're talking about versioning strategy, rate limiting, and webhook architecture that impacts every integration partner.`;
      } else if (userText.includes('cost') || userText.includes('budget') || userText.includes('expensive')) {
        return `The technical cost structure you're questioning includes infrastructure scaling, third-party service fees, and engineering overhead - this will require 40% more compute resources than current projections suggest.`;
      } else {
        return `From a technical architecture perspective, your input highlights critical dependencies for this initiative that we need to address in our system design and implementation roadmap.`;
      }
    }
    
    // Challenge other executives with technical expertise
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CEO' && messageText.includes('strategic')) {
        return `I appreciate the strategic vision, but the technical reality of this requires significant infrastructure investment and architectural changes that could impact our development velocity for 6+ months.`;
      } else if (agentRole === 'CFO' && messageText.includes('cost')) {
        return `The cost analysis is missing critical technical infrastructure expenses - cloud scaling, security compliance, and integration complexity will add 30-40% to the projected budget for this initiative.`;
      } else if (agentRole === 'CMO' && messageText.includes('customer')) {
        return `Customer expectations for this assume technical capabilities we don't currently have - the performance and reliability standards require significant backend optimization and monitoring infrastructure.`;
      } else if (agentRole === 'COO' && messageText.includes('process')) {
        return `The operational processes you're describing require automated workflows and real-time data synchronization that our current tech stack can't support without major architectural changes.`;
      }
    }

    // Default sophisticated CTO responses - TOPIC-RELEVANT
    const technicalFrameworks = [
      `The technical debt implications of this concern me - we're potentially creating maintenance overhead that could constrain our engineering velocity for the next 18 months.`,
      `I'm questioning the architectural assumptions behind this - the proposed solution doesn't account for fault tolerance and disaster recovery requirements at our scale.`,
      `The technology choices for this will lock us into specific vendor ecosystems - we need to evaluate the long-term strategic implications of these dependencies.`,
      `Performance benchmarking for this shows concerning latency patterns under load - we may need to reconsider the fundamental approach to data processing and caching.`
    ];
    
    return technicalFrameworks[Math.floor(Math.random() * technicalFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    if (agentId.includes('ceo') || agentId.includes('CEO')) return 'CEO';
    if (agentId.includes('cfo') || agentId.includes('CFO')) return 'CFO';
    if (agentId.includes('cmo') || agentId.includes('CMO')) return 'CMO';
    if (agentId.includes('chro') || agentId.includes('CHRO')) return 'CHRO';
    if (agentId.includes('coo') || agentId.includes('COO')) return 'COO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75;
    }

    const technicalKeywords = ['technology', 'system', 'infrastructure', 'development', 'security', 'performance', 'architecture', 'integration'];
    const hasTechnicalContent = keywords?.some(keyword => 
      technicalKeywords.some(technical => keyword.includes(technical))
    ) || false;

    // CTO often challenges non-technical executives on feasibility
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldChallengeFeasibility = recentAgentMessages.length > 0 && Math.random() < 0.35;

    return Math.random() < (hasTechnicalContent ? 0.9 : 0.6) || shouldChallengeFeasibility;
  }
}

export class CFOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('expensive') || userText.includes('cost') || userText.includes('budget')) {
        return `The cost structure for this is concerning - we're looking at 18-month payback period with significant working capital requirements that could strain our cash position during scaling phases.`;
      } else if (userText.includes('revenue') || userText.includes('profit') || userText.includes('roi')) {
        return `Revenue projections for this assume customer acquisition costs that are 40% below industry benchmarks - the unit economics don't support the growth trajectory we're modeling.`;
      } else if (userText.includes('risk') || userText.includes('financial risk')) {
        return `The financial risk profile of this includes currency exposure, regulatory compliance costs, and potential write-downs that could impact our debt covenant ratios.`;
      } else if (userText.includes('investment') || userText.includes('funding')) {
        return `Capital allocation for this competes with higher-IRR opportunities in our pipeline - we need to justify this investment against our hurdle rate and strategic portfolio optimization.`;
      } else {
        return `Your financial concerns about this align with my analysis - we need to stress-test the assumptions and model downside scenarios before committing capital.`;
      }
    }
    
    // Challenge other executives with financial rigor
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CEO' && messageText.includes('strategic')) {
        return `Strategic value is important, but this needs to clear our financial hurdles - the NPV analysis shows negative returns under conservative assumptions, and we can't ignore fiduciary responsibility.`;
      } else if (agentRole === 'CTO' && messageText.includes('technical')) {
        return `The technical requirements you've outlined translate to significant CapEx and OpEx increases - infrastructure costs alone could consume 60% of projected gross margins.`;
      } else if (agentRole === 'CMO' && messageText.includes('customer')) {
        return `Customer acquisition costs for this are trending 3x higher than our blended CAC - the marketing spend required to achieve projected adoption rates would destroy unit economics.`;
      } else if (agentRole === 'COO' && messageText.includes('operational')) {
        return `The operational scaling costs you've described aren't reflected in our financial models - we're underestimating the working capital and overhead requirements by at least 25%.`;
      }
    }

    // Default sophisticated CFO responses - TOPIC-RELEVANT
    const financialFrameworks = [
      `The capital efficiency of this is questionable - we're deploying significant resources for returns that don't meet our weighted average cost of capital thresholds.`,
      `I'm concerned about the cash flow timing for this - the J-curve effect could strain liquidity during our peak growth phase when we need maximum financial flexibility.`,
      `The competitive pricing pressure in our market means this will face immediate margin compression - our cost structure isn't optimized for the price points customers will accept.`,
      `Risk-adjusted returns for this don't justify the capital allocation when compared to our other strategic initiatives - we need to prioritize based on financial discipline, not just strategic appeal.`
    ];
    
    return financialFrameworks[Math.floor(Math.random() * financialFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    if (agentId.includes('ceo') || agentId.includes('CEO')) return 'CEO';
    if (agentId.includes('cto') || agentId.includes('CTO')) return 'CTO';
    if (agentId.includes('cmo') || agentId.includes('CMO')) return 'CMO';
    if (agentId.includes('chro') || agentId.includes('CHRO')) return 'CHRO';
    if (agentId.includes('coo') || agentId.includes('COO')) return 'COO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.85; // CFO often responds to financial concerns
    }

    const financialKeywords = ['budget', 'cost', 'revenue', 'profit', 'investment', 'financial', 'roi', 'margin', 'cash', 'capital'];
    const hasFinancialContent = keywords?.some(keyword => 
      financialKeywords.some(financial => keyword.includes(financial))
    ) || false;

    // CFO frequently challenges spending and investment decisions
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldChallengeSpending = recentAgentMessages.length > 0 && Math.random() < 0.45;

    return Math.random() < (hasFinancialContent ? 0.95 : 0.7) || shouldChallengeSpending;
  }
}

export class CMOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    const companyContext = this.companyContext;
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('customer') || userText.includes('user') || userText.includes('client')) {
        return `Customer research for this reveals a significant gap between stated preferences and actual buying behavior - we're optimizing for survey responses rather than purchase intent signals.`;
      } else if (userText.includes('brand') || userText.includes('reputation') || userText.includes('image')) {
        return `Brand architecture implications of this could create confusion in our positioning - we risk diluting brand equity we've built in ${companyContext.industry} by expanding beyond our core value proposition.`;
      } else if (userText.includes('market') || userText.includes('competition') || userText.includes('competitor')) {
        return `Competitive analysis shows this puts us in direct competition with category leaders who have deeper pockets and established customer relationships - we need differentiation, not feature parity.`;
      } else if (userText.includes('price') || userText.includes('pricing') || userText.includes('cost')) {
        return `Pricing strategy for this is vulnerable to competitive response - we're entering a market where price wars have historically destroyed category profitability and customer loyalty.`;
      } else {
        return `Your market perspective on this highlights critical customer adoption challenges that our current go-to-market strategy doesn't adequately address.`;
      }
    }
    
    // Challenge other executives with market and customer insights
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CEO' && messageText.includes('strategic')) {
        return `Strategic positioning is crucial, but this doesn't align with our brand promise or customer expectations - we risk confusing the market about what we stand for.`;
      } else if (agentRole === 'CFO' && messageText.includes('financial')) {
        return `The financial projections assume customer acquisition costs that ignore the competitive reality - CAC in this category has increased 200% over the past 18 months due to market saturation.`;
      } else if (agentRole === 'CTO' && messageText.includes('technical')) {
        return `Technical capabilities are table stakes, but this needs to solve a customer problem that creates emotional engagement - features don't drive adoption, outcomes do.`;
      } else if (agentRole === 'COO' && messageText.includes('operational')) {
        return `Operational efficiency matters, but this requires a customer experience that our current service delivery model can't support - we're optimizing for internal metrics, not customer value.`;
      }
    }

    // Default sophisticated CMO responses - TOPIC-RELEVANT
    const marketingFrameworks = [
      `The customer segmentation for this is flawed - we're targeting demographics rather than behavioral cohorts, which explains why our messaging isn't resonating with actual buyers.`,
      `Brand differentiation for this is weak - we're competing on features rather than creating an emotional connection that drives customer loyalty and premium pricing power.`,
      `The go-to-market timing for this conflicts with our customers' budget cycles and decision-making processes - we're launching when they're least likely to evaluate new solutions.`,
      `Customer lifetime value assumptions for this don't account for churn patterns in this category - retention rates are significantly lower than our models suggest.`
    ];
    
    return marketingFrameworks[Math.floor(Math.random() * marketingFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    if (agentId.includes('ceo') || agentId.includes('CEO')) return 'CEO';
    if (agentId.includes('cto') || agentId.includes('CTO')) return 'CTO';
    if (agentId.includes('cfo') || agentId.includes('CFO')) return 'CFO';
    if (agentId.includes('chro') || agentId.includes('CHRO')) return 'CHRO';
    if (agentId.includes('coo') || agentId.includes('COO')) return 'COO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75;
    }

    const marketingKeywords = ['brand', 'marketing', 'customer', 'market', 'campaign', 'audience', 'positioning', 'competitive', 'pricing'];
    const hasMarketingContent = keywords?.some(keyword => 
      marketingKeywords.some(marketing => keyword.includes(marketing))
    ) || false;

    // CMO often challenges assumptions about customer needs and market dynamics
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldChallengeCustomerAssumptions = recentAgentMessages.length > 0 && Math.random() < 0.4;

    return Math.random() < (hasMarketingContent ? 0.9 : 0.6) || shouldChallengeCustomerAssumptions;
  }
}

export class CHROAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('team') || userText.includes('employee') || userText.includes('staff')) {
        return `Organizational impact of this requires restructuring that could disrupt our highest-performing teams - we're risking talent flight during a critical growth phase when retention is paramount.`;
      } else if (userText.includes('culture') || userText.includes('morale') || userText.includes('engagement')) {
        return `Cultural alignment with this conflicts with our core values around autonomy and innovation - this could create internal resistance that undermines execution and employee satisfaction.`;
      } else if (userText.includes('training') || userText.includes('skill') || userText.includes('development')) {
        return `Skills gap analysis for this reveals we need capabilities that don't exist in our current workforce - the talent market for these skills is extremely competitive with 40% salary premiums.`;
      } else if (userText.includes('hiring') || userText.includes('recruitment') || userText.includes('talent')) {
        return `Talent acquisition for this competes with our existing hiring priorities - we're already struggling to fill critical roles, and this adds complexity to our recruitment strategy.`;
      } else {
        return `Your people-focused concerns about this align with my organizational assessment - we need to address the human capital implications before proceeding with implementation.`;
      }
    }
    
    // Challenge other executives with people and organizational insights
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CEO' && messageText.includes('strategic')) {
        return `Strategic vision is important, but this requires organizational capabilities we don't have - we're asking our people to execute beyond their current competencies without adequate support.`;
      } else if (agentRole === 'CTO' && messageText.includes('technical')) {
        return `Technical complexity you've described demands engineering talent we can't recruit fast enough - the skills shortage in our market means 6+ month hiring cycles for senior roles.`;
      } else if (agentRole === 'CFO' && messageText.includes('cost')) {
        return `Cost projections underestimate the total compensation required to attract necessary talent - we're looking at 30-40% salary increases plus equity to compete for these skills.`;
      } else if (agentRole === 'CMO' && messageText.includes('customer')) {
        return `Customer-facing aspects of this require service capabilities our team isn't trained for - we need significant investment in customer success and support infrastructure.`;
      }
    }

    // Default sophisticated CHRO responses - TOPIC-RELEVANT
    const organizationalFrameworks = [
      `The change management requirements for this exceed our organizational capacity - we're already managing multiple transformation initiatives that are straining our people and culture.`,
      `Performance management implications of this are complex - existing KPIs don't capture the new behaviors we need, and our review processes aren't designed for this type of work.`,
      `Leadership development pipeline isn't prepared for this - we lack the management capabilities needed to scale this initiative effectively across the organization.`,
      `Diversity and inclusion implications of this could inadvertently create barriers for underrepresented groups - we need to ensure equitable access to opportunities and advancement.`
    ];
    
    return organizationalFrameworks[Math.floor(Math.random() * organizationalFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    if (agentId.includes('ceo') || agentId.includes('CEO')) return 'CEO';
    if (agentId.includes('cto') || agentId.includes('CTO')) return 'CTO';
    if (agentId.includes('cfo') || agentId.includes('CFO')) return 'CFO';
    if (agentId.includes('cmo') || agentId.includes('CMO')) return 'CMO';
    if (agentId.includes('coo') || agentId.includes('COO')) return 'COO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7;
    }

    const hrKeywords = ['people', 'team', 'culture', 'talent', 'hiring', 'employee', 'training', 'organizational', 'skills', 'development'];
    const hasHRContent = keywords?.some(keyword => 
      hrKeywords.some(hr => keyword.includes(hr))
    ) || false;

    // CHRO often raises concerns about organizational readiness and people impact
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldRaisePeopleConcerns = recentAgentMessages.length > 0 && Math.random() < 0.35;

    return Math.random() < (hasHRContent ? 0.9 : 0.6) || shouldRaisePeopleConcerns;
  }
}

export class COOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();

  public setTopicResponses(responses: string[]): void {
    this.responsePool = responses;
    this.usedResponses.clear();
  }

  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    if (context.userInput || this.wasConversationInterrupted(context.recentMessages)) {
      return this.generateAdvancedContextualResponse(context);
    }

    if (this.responsePool.length > 0 && !this.wasConversationInterrupted(context.recentMessages)) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return this.generateAdvancedContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('process') || userText.includes('workflow') || userText.includes('operation')) {
        return `Process integration for this will create operational silos that undermine our efficiency gains - we're adding complexity without corresponding improvements in customer value delivery.`;
      } else if (userText.includes('efficiency') || userText.includes('productivity') || userText.includes('performance')) {
        return `Operational efficiency metrics for this don't account for the coordination overhead and process friction this introduces - we could see 20-30% productivity decline during transition.`;
      } else if (userText.includes('implementation') || userText.includes('execution') || userText.includes('rollout')) {
        return `Implementation complexity of this exceeds our project management maturity - we lack the cross-functional coordination systems needed for this level of operational integration.`;
      } else if (userText.includes('scale') || userText.includes('scaling') || userText.includes('growth')) {
        return `Scaling implications of this reveal bottlenecks in our current operations - we're already at capacity limits, and this adds operational burden without proportional resource increases.`;
      } else {
        return `Your operational concerns about this highlight execution risks that could impact our service delivery and customer satisfaction during implementation.`;
      }
    }
    
    // Challenge other executives with operational realities
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      const agentRole = this.getAgentRoleFromId(lastMessage.agentId);
      
      if (agentRole === 'CEO' && messageText.includes('strategic')) {
        return `Strategic objectives are clear, but this requires operational capabilities we don't have - we're setting ambitious goals without the execution infrastructure to deliver consistently.`;
      } else if (agentRole === 'CTO' && messageText.includes('technical')) {
        return `Technical architecture you've described creates operational dependencies that our current service delivery model can't support - we need process redesign before technology implementation.`;
      } else if (agentRole === 'CFO' && messageText.includes('financial')) {
        return `Financial projections don't account for the operational scaling costs - we'll need additional headcount, systems, and process infrastructure that aren't in the budget.`;
      } else if (agentRole === 'CMO' && messageText.includes('customer')) {
        return `Customer experience promises exceed our operational delivery capabilities - we're creating expectations we can't consistently meet with our current service infrastructure.`;
      }
    }

    // Default sophisticated COO responses - TOPIC-RELEVANT
    const operationalFrameworks = [
      `The operational risk profile of this introduces single points of failure that could cascade through our entire service delivery - we need redundancy and failover processes we don't currently have.`,
      `Quality assurance frameworks can't adequately monitor this - we're introducing complexity that our current systems can't detect or prevent from impacting customers.`,
      `Supply chain implications of this create vendor dependencies and procurement challenges that could constrain our operational flexibility and increase costs significantly.`,
      `Business continuity planning for this reveals gaps in our disaster recovery and risk management protocols - we're not prepared for the operational failure modes this introduces.`
    ];
    
    return operationalFrameworks[Math.floor(Math.random() * operationalFrameworks.length)];
  }

  private getAgentRoleFromId(agentId: string): string {
    if (agentId.includes('ceo') || agentId.includes('CEO')) return 'CEO';
    if (agentId.includes('cto') || agentId.includes('CTO')) return 'CTO';
    if (agentId.includes('cfo') || agentId.includes('CFO')) return 'CFO';
    if (agentId.includes('cmo') || agentId.includes('CMO')) return 'CMO';
    if (agentId.includes('chro') || agentId.includes('CHRO')) return 'CHRO';
    return 'Executive';
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75;
    }

    const operationalKeywords = ['operations', 'process', 'efficiency', 'workflow', 'execution', 'delivery', 'implementation', 'scaling', 'quality'];
    const hasOperationalContent = keywords?.some(keyword => 
      operationalKeywords.some(ops => keyword.includes(ops))
    ) || false;

    // COO often challenges feasibility and execution assumptions
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-2);
    const shouldChallengeFeasibility = recentAgentMessages.length > 0 && Math.random() < 0.4;

    return Math.random() < (hasOperationalContent ? 0.9 : 0.65) || shouldChallengeFeasibility;
  }
}

// NOTE: These enhanced executive agents now provide:
// 1. TOPIC-RELEVANT responses that directly relate to the current discussion
// 2. Natural language using "this", "the initiative", "this proposal" instead of repeating topic names
// 3. Sophisticated domain expertise with specific metrics and frameworks
// 4. Critical thinking that challenges assumptions and identifies risks
// 5. Contrarian viewpoints that create realistic boardroom tension
// 6. Advanced vocabulary and executive-level communication
// 7. Willingness to disagree and debate with other executives
// 8. Deep understanding of interdependencies and complex business dynamics
// 9. Reference to industry best practices and real-world constraints
// 10. Strategic thinking that goes beyond surface-level analysis