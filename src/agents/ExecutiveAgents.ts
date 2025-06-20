import { BoardAgentBase } from './BoardAgentBase';
import { Agent, Message, Topic } from '../types';

export class CEOAgent extends BoardAgentBase {
  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    // For now, using predefined responses. Later integrate with LLM API
    const ceoResponses = [
      `From a strategic perspective on ${context.topic.title}, we need to align this with our company vision and market positioning.`,
      `I'm concerned about the long-term implications of this decision. How does it affect our competitive advantage?`,
      `Let's ensure we're considering all stakeholders - customers, employees, and shareholders - in this discussion.`,
      `The board expects measurable results. What are our key performance indicators for this initiative?`,
      `We should also consider the regulatory environment and potential compliance issues.`,
      `This aligns well with our growth strategy, but we need to manage execution risks carefully.`
    ];

    // Simple context-aware selection (can be enhanced with AI)
    if (context.userInput) {
      return `Thank you for that input. As CEO, I think we should carefully consider how this affects our overall strategy for ${context.topic.title}.`;
    }

    return ceoResponses[Math.floor(Math.random() * ceoResponses.length)];
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
  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    const ctoResponses = [
      `From a technical standpoint, we need to consider the infrastructure requirements for ${context.topic.title}.`,
      `The engineering team has been working on similar challenges. We have some proven solutions we can leverage.`,
      `We should evaluate the technical risks and ensure we have proper testing and monitoring in place.`,
      `This will require significant development resources. I recommend we prioritize this in our next sprint planning.`,
      `We need to consider scalability and performance implications from the start.`,
      `The security aspects of this initiative are critical. We must implement proper safeguards.`,
      `Our current tech stack can support this, but we may need to upgrade some components.`
    ];

    if (context.userInput) {
      return `From a technical perspective, I think we need to evaluate the feasibility and resource requirements for what you've suggested regarding ${context.topic.title}.`;
    }

    return ctoResponses[Math.floor(Math.random() * ctoResponses.length)];
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
  async generateResponse(
    prompt: string,
    context: {
      recentMessages: Message[];
      topic: Topic;
      userInput?: string;
    }
  ): Promise<string> {
    const cfoResponses = [
      `We need to carefully analyze the financial implications of ${context.topic.title}. What's our projected ROI?`,
      `The budget allocation for this initiative needs to be reviewed against our quarterly targets.`,
      `From a cost perspective, we should consider both immediate expenses and long-term operational costs.`,
      `This investment needs to align with our financial planning and cash flow projections.`,
      `We should establish clear financial metrics to measure the success of this initiative.`,
      `The risk-reward ratio looks favorable, but we need to monitor expenses closely.`,
      `Have we considered the tax implications and potential financial incentives available?`
    ];

    if (context.userInput) {
      return `I need to understand the financial impact of your suggestion. Can we quantify the costs and benefits for ${context.topic.title}?`;
    }

    return cfoResponses[Math.floor(Math.random() * cfoResponses.length)];
  }

  shouldRespond(recentMessages: Message[], topic: Topic, keywords?: string[]): boolean {
    const financialKeywords = ['budget', 'cost', 'revenue', 'profit', 'investment', 'financial', 'roi'];
    const hasFinancialContent = keywords?.some(keyword => 
      financialKeywords.some(financial => keyword.includes(financial))
    ) || false;

    return Math.random() < (hasFinancialContent ? 0.9 : 0.6);
  }
}

// NOTE: These executive agents provide role-specific responses and decision-making patterns
// TODO: Integrate with actual LLM API for more sophisticated and contextual responses
// TODO: Implement agent memory and learning from previous conversations
// TODO: Add more executive roles (CMO, CHRO, COO, etc.) as needed
// TODO: Enhance personality traits and communication styles for each role