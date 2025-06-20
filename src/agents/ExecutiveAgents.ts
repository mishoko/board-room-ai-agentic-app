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
    // If user input is provided, generate a contextual response
    if (context.userInput) {
      return `Thank you for that input. As CEO, I think we should carefully evaluate how this affects our strategic approach to ${context.topic.title} and ensure it aligns with our company's long-term vision.`;
    }

    // Use pre-generated responses from LLM
    if (this.responsePool.length > 0) {
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

    // Fallback to basic response if no pre-generated responses available
    return `From a strategic perspective on ${context.topic.title}, we need to align this with our company vision and market positioning.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
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
    if (context.userInput) {
      return `From a technical perspective, I think we need to evaluate the feasibility and infrastructure requirements for what you've suggested regarding ${context.topic.title}.`;
    }

    if (this.responsePool.length > 0) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return `From a technical standpoint, we need to consider the infrastructure requirements for ${context.topic.title}.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
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
    if (context.userInput) {
      return `I need to understand the financial impact of your suggestion. Can we quantify the costs and benefits for ${context.topic.title}?`;
    }

    if (this.responsePool.length > 0) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return `We need to carefully analyze the financial implications of ${context.topic.title}. What's our projected ROI?`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
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
    if (context.userInput) {
      return `From a marketing perspective, we need to consider how this impacts our brand positioning and customer perception regarding ${context.topic.title}.`;
    }

    if (this.responsePool.length > 0) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return `From a brand perspective, ${context.topic.title} presents an opportunity to strengthen our market position.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
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
    if (context.userInput) {
      return `From a people perspective, we need to consider the organizational and cultural impact of your suggestion on ${context.topic.title}.`;
    }

    if (this.responsePool.length > 0) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return `The people impact of ${context.topic.title} requires careful change management and employee communication strategies.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
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
    if (context.userInput) {
      return `From an operational standpoint, we need to assess how your suggestion impacts our processes and execution capabilities for ${context.topic.title}.`;
    }

    if (this.responsePool.length > 0) {
      const availableResponses = this.responsePool.filter(response => !this.usedResponses.has(response));
      
      if (availableResponses.length === 0) {
        this.usedResponses.clear();
      }
      
      const responses = availableResponses.length > 0 ? availableResponses : this.responsePool;
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      this.usedResponses.add(selectedResponse);
      
      return selectedResponse;
    }

    return `From an operational efficiency standpoint, ${context.topic.title} needs to integrate seamlessly with our existing processes.`;
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    const operationalKeywords = ['operations', 'process', 'efficiency', 'workflow', 'execution', 'delivery'];
    const hasOperationalContent = keywords?.some(keyword => 
      operationalKeywords.some(ops => keyword.includes(ops))
    ) || false;

    return Math.random() < (hasOperationalContent ? 0.9 : 0.5);
  }
}

// NOTE: These executive agents now use pre-generated, contextual responses from LLM
// TODO: Integrate with actual LLM API for real-time response generation
// TODO: Implement more sophisticated response selection based on conversation context
// TODO: Add personality traits and communication styles for each role