import { BoardAgentBase } from './BoardAgentBase';
import { Agent, Message, Topic } from '../types';
import { LLMService } from '../services/LLMService';

export class CEOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    // Always use real-time AI generation for dynamic, contextual responses
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time CEO response:', error);
      // Fallback to sophisticated contextual response
      return this.generateAdvancedContextualResponse(context);
    }
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

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }
}

export class CTOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time CTO response:', error);
      return this.generateAdvancedContextualResponse(context);
    }
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

// Similar pattern for other agents - CFO, CMO, CHRO, COO
export class CFOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time CFO response:', error);
      return this.generateAdvancedContextualResponse(context);
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const financialFrameworks = [
      `The capital efficiency of this is questionable - we're deploying significant resources for returns that don't meet our weighted average cost of capital thresholds.`,
      `I'm concerned about the cash flow timing for this - the J-curve effect could strain liquidity during our peak growth phase when we need maximum financial flexibility.`,
      `The competitive pricing pressure in our market means this will face immediate margin compression - our cost structure isn't optimized for the price points customers will accept.`,
      `Risk-adjusted returns for this don't justify the capital allocation when compared to our other strategic initiatives - we need to prioritize based on financial discipline, not just strategic appeal.`
    ];
    
    return financialFrameworks[Math.floor(Math.random() * financialFrameworks.length)];
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.85;
    }

    const financialKeywords = ['budget', 'cost', 'revenue', 'profit', 'investment', 'financial', 'roi', 'margin', 'cash', 'capital'];
    const hasFinancialContent = keywords?.some(keyword => 
      financialKeywords.some(financial => keyword.includes(financial))
    ) || false;

    return Math.random() < (hasFinancialContent ? 0.95 : 0.7);
  }
}

export class CMOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time CMO response:', error);
      return this.generateAdvancedContextualResponse(context);
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const marketingFrameworks = [
      `The customer segmentation for this is flawed - we're targeting demographics rather than behavioral cohorts, which explains why our messaging isn't resonating with actual buyers.`,
      `Brand differentiation for this is weak - we're competing on features rather than creating an emotional connection that drives customer loyalty and premium pricing power.`,
      `The go-to-market timing for this conflicts with our customers' budget cycles and decision-making processes - we're launching when they're least likely to evaluate new solutions.`,
      `Customer lifetime value assumptions for this don't account for churn patterns in this category - retention rates are significantly lower than our models suggest.`
    ];
    
    return marketingFrameworks[Math.floor(Math.random() * marketingFrameworks.length)];
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75;
    }

    const marketingKeywords = ['brand', 'marketing', 'customer', 'market', 'campaign', 'audience', 'positioning', 'competitive', 'pricing'];
    const hasMarketingContent = keywords?.some(keyword => 
      marketingKeywords.some(marketing => keyword.includes(marketing))
    ) || false;

    return Math.random() < (hasMarketingContent ? 0.9 : 0.6);
  }
}

export class CHROAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time CHRO response:', error);
      return this.generateAdvancedContextualResponse(context);
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const organizationalFrameworks = [
      `The change management requirements for this exceed our organizational capacity - we're already managing multiple transformation initiatives that are straining our people and culture.`,
      `Performance management implications of this are complex - existing KPIs don't capture the new behaviors we need, and our review processes aren't designed for this type of work.`,
      `Leadership development pipeline isn't prepared for this - we lack the management capabilities needed to scale this initiative effectively across the organization.`,
      `Diversity and inclusion implications of this could inadvertently create barriers for underrepresented groups - we need to ensure equitable access to opportunities and advancement.`
    ];
    
    return organizationalFrameworks[Math.floor(Math.random() * organizationalFrameworks.length)];
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7;
    }

    const hrKeywords = ['people', 'team', 'culture', 'talent', 'hiring', 'employee', 'training', 'organizational', 'skills', 'development'];
    const hasHRContent = keywords?.some(keyword => 
      hrKeywords.some(hr => keyword.includes(hr))
    ) || false;

    return Math.random() < (hasHRContent ? 0.9 : 0.6);
  }
}

export class COOAgent extends BoardAgentBase {
  private responsePool: string[] = [];
  private usedResponses: Set<string> = new Set();
  private llmService = LLMService.getInstance();

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
    try {
      const conversationHistory = context.recentMessages.map(msg => ({
        agentId: msg.agentId,
        text: msg.text,
        timestamp: msg.timestamp
      }));

      const response = await this.llmService.generateRealTimeResponse(
        this.agent.role,
        this.agent.persona,
        this.agent.expertise,
        {
          title: context.topic.title,
          description: context.topic.description,
          priority: context.topic.priority,
          estimatedDuration: context.topic.estimatedDuration
        },
        this.companyContext,
        conversationHistory,
        context.userInput
      );

      return response;
    } catch (error) {
      console.error('Error generating real-time COO response:', error);
      return this.generateAdvancedContextualResponse(context);
    }
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateAdvancedContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const operationalFrameworks = [
      `The operational risk profile of this introduces single points of failure that could cascade through our entire service delivery - we need redundancy and failover processes we don't currently have.`,
      `Quality assurance frameworks can't adequately monitor this - we're introducing complexity that our current systems can't detect or prevent from impacting customers.`,
      `Supply chain implications of this create vendor dependencies and procurement challenges that could constrain our operational flexibility and increase costs significantly.`,
      `Business continuity planning for this reveals gaps in our disaster recovery and risk management protocols - we're not prepared for the operational failure modes this introduces.`
    ];
    
    return operationalFrameworks[Math.floor(Math.random() * operationalFrameworks.length)];
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.75;
    }

    const operationalKeywords = ['operations', 'process', 'efficiency', 'workflow', 'execution', 'delivery', 'implementation', 'scaling', 'quality'];
    const hasOperationalContent = keywords?.some(keyword => 
      operationalKeywords.some(ops => keyword.includes(ops))
    ) || false;

    return Math.random() < (hasOperationalContent ? 0.9 : 0.65);
  }
}