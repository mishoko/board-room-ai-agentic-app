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
      return this.generateContextualResponse(context);
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
    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    // Check if there are any user messages in recent conversation
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic, userInput } = context;
    
    // Analyze recent conversation for context
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    const recentAgentMessages = recentMessages.filter(msg => msg.agentId !== 'user').slice(-3);
    
    // If there's user input, respond to it directly
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      // Generate contextual CEO response based on user input
      if (userText.includes('budget') || userText.includes('cost') || userText.includes('financial')) {
        return `That's an important financial consideration. As CEO, I want to ensure we balance fiscal responsibility with strategic growth in our approach to ${topic.title}.`;
      } else if (userText.includes('risk') || userText.includes('concern') || userText.includes('problem')) {
        return `You raise a valid concern. From a strategic perspective, we need to carefully assess and mitigate these risks while pursuing ${topic.title}.`;
      } else if (userText.includes('opportunity') || userText.includes('potential') || userText.includes('benefit')) {
        return `I agree there's significant potential here. We should explore how ${topic.title} aligns with our long-term strategic vision and competitive positioning.`;
      } else if (userText.includes('timeline') || userText.includes('when') || userText.includes('schedule')) {
        return `Timing is crucial for ${topic.title}. We need to balance speed to market with thorough execution to ensure sustainable success.`;
      } else {
        return `Thank you for that perspective. As CEO, I think we should carefully evaluate how your input affects our strategic approach to ${topic.title} and ensure it aligns with our company's long-term vision.`;
      }
    }
    
    // Generate response based on conversation flow
    if (recentAgentMessages.length > 0) {
      const lastMessage = recentAgentMessages[recentAgentMessages.length - 1];
      const messageText = lastMessage.text.toLowerCase();
      
      if (messageText.includes('technical') || messageText.includes('infrastructure')) {
        return `Building on the technical discussion, we need to ensure ${topic.title} supports our scalability goals and doesn't create technical debt.`;
      } else if (messageText.includes('financial') || messageText.includes('budget')) {
        return `The financial implications are clear. As CEO, I'm focused on how ${topic.title} drives long-term value creation for our stakeholders.`;
      } else if (messageText.includes('market') || messageText.includes('customer')) {
        return `Market positioning is key. ${topic.title} should strengthen our competitive advantage and customer value proposition.`;
      }
    }

    // Fallback to strategic CEO response
    return `From a strategic perspective on ${topic.title}, we need to align this with our company vision and market positioning while ensuring sustainable execution.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    // CEO responds more frequently if conversation was interrupted by user
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.8; // Higher chance to respond after user input
    }

    // CEO responds to strategic topics and when decisions need to be made
    const strategicKeywords = ['strategy', 'vision', 'growth', 'market', 'competition', 'decision'];
    const hasStrategicContent = keywords?.some(keyword => 
      strategicKeywords.some(strategic => keyword.includes(strategic))
    ) || false;

    // CEO is more likely to respond to high-priority topics
    const priorityWeight = topic.priority === 'high' ? 0.8 : topic.priority === 'medium' ? 0.6 : 0.4;
    
    return Math.random() < (hasStrategicContent ? 0.9 : priorityWeight);
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
      return this.generateContextualResponse(context);
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

    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('security') || userText.includes('data') || userText.includes('privacy')) {
        return `From a security standpoint, we need to implement robust safeguards and ensure compliance with data protection requirements for ${topic.title}.`;
      } else if (userText.includes('scale') || userText.includes('performance') || userText.includes('infrastructure')) {
        return `The scalability and performance implications are significant. We need to architect ${topic.title} to handle future growth and maintain system reliability.`;
      } else if (userText.includes('integration') || userText.includes('system') || userText.includes('platform')) {
        return `Integration complexity is a key concern. We must ensure ${topic.title} works seamlessly with our existing technology stack and doesn't create technical debt.`;
      } else {
        return `From a technical perspective, I think we need to evaluate the feasibility and infrastructure requirements for what you've suggested regarding ${topic.title}.`;
      }
    }

    return `From a technical standpoint, we need to consider the infrastructure requirements and system architecture implications for ${topic.title}.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7;
    }

    const technicalKeywords = ['technology', 'system', 'infrastructure', 'development', 'security', 'performance'];
    const hasTechnicalContent = keywords?.some(keyword => 
      technicalKeywords.some(technical => keyword.includes(technical))
    ) || false;

    return Math.random() < (hasTechnicalContent ? 0.9 : 0.5);
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
      return this.generateContextualResponse(context);
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

    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('expensive') || userText.includes('cost') || userText.includes('budget')) {
        return `I share your cost concerns. We need to conduct a thorough cost-benefit analysis and explore more budget-friendly approaches to ${topic.title}.`;
      } else if (userText.includes('revenue') || userText.includes('profit') || userText.includes('roi')) {
        return `The revenue impact is crucial. We need to model different scenarios and ensure ${topic.title} delivers measurable financial returns within our target timeframe.`;
      } else if (userText.includes('risk') || userText.includes('financial risk')) {
        return `Financial risk management is paramount. We must identify potential exposures and develop mitigation strategies for ${topic.title}.`;
      } else {
        return `I need to understand the financial impact of your suggestion. Can we quantify the costs and benefits for ${topic.title}?`;
      }
    }

    return `We need to carefully analyze the financial implications of ${topic.title}. What's our projected ROI and how does this fit within our budget constraints?`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.8; // CFO often responds to financial concerns
    }

    const financialKeywords = ['budget', 'cost', 'revenue', 'profit', 'investment', 'financial', 'roi'];
    const hasFinancialContent = keywords?.some(keyword => 
      financialKeywords.some(financial => keyword.includes(financial))
    ) || false;

    return Math.random() < (hasFinancialContent ? 0.9 : 0.6);
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
      return this.generateContextualResponse(context);
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

    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('customer') || userText.includes('user') || userText.includes('client')) {
        return `Customer impact is essential. We need to understand how ${topic.title} affects our customer experience and brand perception.`;
      } else if (userText.includes('brand') || userText.includes('reputation') || userText.includes('image')) {
        return `Brand implications are significant. ${topic.title} must align with our brand values and strengthen our market position.`;
      } else if (userText.includes('market') || userText.includes('competition') || userText.includes('competitor')) {
        return `From a competitive standpoint, ${topic.title} could be a key differentiator. We need to analyze how this positions us in the market.`;
      } else {
        return `From a marketing perspective, we need to consider how this impacts our brand positioning and customer perception regarding ${topic.title}.`;
      }
    }

    return `From a brand perspective, ${topic.title} presents an opportunity to strengthen our market position and customer relationships.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7;
    }

    const marketingKeywords = ['brand', 'marketing', 'customer', 'market', 'campaign', 'audience'];
    const hasMarketingContent = keywords?.some(keyword => 
      marketingKeywords.some(marketing => keyword.includes(marketing))
    ) || false;

    return Math.random() < (hasMarketingContent ? 0.9 : 0.5);
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
      return this.generateContextualResponse(context);
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

    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('team') || userText.includes('employee') || userText.includes('staff')) {
        return `Team impact is crucial. We need to consider how ${topic.title} affects our employees and what support they'll need during this transition.`;
      } else if (userText.includes('culture') || userText.includes('morale') || userText.includes('engagement')) {
        return `Cultural alignment is essential. ${topic.title} must support our company values and maintain employee engagement throughout the process.`;
      } else if (userText.includes('training') || userText.includes('skill') || userText.includes('development')) {
        return `Skills development will be key. We need to assess training requirements and ensure our team has the capabilities needed for ${topic.title}.`;
      } else {
        return `From a people perspective, we need to consider the organizational and cultural impact of your suggestion on ${topic.title}.`;
      }
    }

    return `The people impact of ${topic.title} requires careful change management and employee communication strategies.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.6;
    }

    const hrKeywords = ['people', 'team', 'culture', 'talent', 'hiring', 'employee', 'training'];
    const hasHRContent = keywords?.some(keyword => 
      hrKeywords.some(hr => keyword.includes(hr))
    ) || false;

    return Math.random() < (hasHRContent ? 0.9 : 0.5);
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
      return this.generateContextualResponse(context);
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

    return this.generateContextualResponse(context);
  }

  private wasConversationInterrupted(messages: Message[]): boolean {
    return messages.some(msg => msg.agentId === 'user');
  }

  private generateContextualResponse(context: {
    recentMessages: Message[];
    topic: Topic;
    userInput?: string;
  }): string {
    const { recentMessages, topic } = context;
    const recentUserMessages = recentMessages.filter(msg => msg.agentId === 'user');
    
    if (recentUserMessages.length > 0) {
      const latestUserMessage = recentUserMessages[recentUserMessages.length - 1];
      const userText = latestUserMessage.text.toLowerCase();
      
      if (userText.includes('process') || userText.includes('workflow') || userText.includes('operation')) {
        return `Process optimization is key. We need to ensure ${topic.title} integrates smoothly with our existing workflows and doesn't disrupt operations.`;
      } else if (userText.includes('efficiency') || userText.includes('productivity') || userText.includes('performance')) {
        return `Operational efficiency is paramount. ${topic.title} should streamline our processes and improve overall productivity.`;
      } else if (userText.includes('implementation') || userText.includes('execution') || userText.includes('rollout')) {
        return `Implementation strategy is critical. We need a detailed execution plan with clear milestones and success metrics for ${topic.title}.`;
      } else {
        return `From an operational standpoint, we need to assess how your suggestion impacts our processes and execution capabilities for ${topic.title}.`;
      }
    }

    return `From an operational efficiency standpoint, ${topic.title} needs to integrate seamlessly with our existing processes and workflows.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    if (this.wasConversationInterrupted(recentMessages)) {
      return Math.random() < 0.7;
    }

    const operationalKeywords = ['operations', 'process', 'efficiency', 'workflow', 'execution', 'delivery'];
    const hasOperationalContent = keywords?.some(keyword => 
      operationalKeywords.some(ops => keyword.includes(ops))
    ) || false;

    return Math.random() < (hasOperationalContent ? 0.9 : 0.5);
  }
}

// NOTE: These executive agents now properly handle interruptions and generate contextual responses
// When a user interrupts, agents will:
// 1. Clear their pre-generated response pools
// 2. Generate contextual responses based on user input and conversation history
// 3. Adapt their discussion to the new direction provided by the user
// 4. Continue with contextual responses rather than returning to pre-generated ones