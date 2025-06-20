import { Agent, Message, CompanyContext, Topic } from '../types';

export abstract class BoardAgentBase {
  protected agent: Agent;
  protected companyContext: CompanyContext;
  protected conversationHistory: Message[] = [];
  protected currentTopic?: Topic;

  constructor(agent: Agent, companyContext: CompanyContext) {
    this.agent = agent;
    this.companyContext = companyContext;
  }

  // Abstract methods that must be implemented by specific agent types
  abstract generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string>;

  abstract shouldRespond(
    recentMessages: Message[],
    topic: Topic,
    keywords?: string[]
  ): boolean;

  // New method for setting pre-generated responses
  abstract setTopicResponses?(responses: string[]): void;

  // Common methods available to all agents
  public setCurrentTopic(topic: Topic): void {
    this.currentTopic = topic;
  }

  public addToHistory(message: Message): void {
    this.conversationHistory.push(message);
  }

  public getPersonaPrompt(): string {
    return `You are the ${this.agent.role} of ${this.companyContext.name}, a ${this.companyContext.industry} company. 
    
    Your background: ${this.agent.persona}
    Your experience: ${this.agent.experience}
    Your expertise: ${this.agent.expertise.join(', ')}
    
    Company context:
    - Industry: ${this.companyContext.industry}
    - Size: ${this.companyContext.size}
    - Stage: ${this.companyContext.stage}
    - Description: ${this.companyContext.description}
    - Current challenges: ${this.companyContext.challenges.join(', ')}
    - Goals: ${this.companyContext.goals.join(', ')}
    
    You should respond in character as a ${this.agent.role}, providing expert insight while considering the company's specific context and challenges. Keep responses concise but insightful, suitable for executive-level discussion.`;
  }

  public getAgent(): Agent {
    return this.agent;
  }

  public getConversationHistory(): Message[] {
    return this.conversationHistory;
  }

  // Utility method to analyze message sentiment and extract keywords
  protected analyzeMessage(text: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
    confidence: number;
  } {
    // Simple keyword-based sentiment analysis (can be enhanced with AI later)
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'success', 'growth', 'opportunity', 'benefit'];
    const negativeWords = ['bad', 'poor', 'negative', 'problem', 'issue', 'challenge', 'risk', 'concern'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Extract potential keywords (simple approach - can be enhanced)
    const keywords = words.filter(word => 
      word.length > 4 && 
      !['that', 'this', 'with', 'from', 'they', 'have', 'will', 'been', 'were'].includes(word)
    ).slice(0, 5);
    
    const confidence = Math.min(0.9, 0.5 + (Math.abs(positiveCount - negativeCount) * 0.1));
    
    return { sentiment, keywords, confidence };
  }
}

// NOTE: This base class now supports pre-generated responses from LLM
// TODO: Integrate with actual LLM API for more sophisticated response generation
// TODO: Implement more advanced sentiment analysis and keyword extraction
// TODO: Add memory management for long conversations
// TODO: Implement agent personality traits and decision-making patterns

