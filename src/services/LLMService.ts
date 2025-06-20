// LLM Service for generating dynamic agent responses
export class LLMService {
  private static instance: LLMService;
  
  private constructor() {}
  
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  // Generate personalized responses for an agent based on topic and context
  public async generateAgentResponses(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: {
      title: string;
      description: string;
      priority: string;
    },
    companyContext: {
      name: string;
      industry: string;
      size: string;
      stage: string;
      description: string;
      challenges: string[];
      goals: string[];
    },
    responseCount: number = 8
  ): Promise<string[]> {
    
    const prompt = this.buildAgentPrompt(
      agentRole,
      agentPersona,
      agentExpertise,
      topic,
      companyContext,
      responseCount
    );

    try {
      // In a real implementation, this would call an actual LLM API
      // For now, we'll simulate with enhanced contextual responses
      const responses = await this.simulateLLMCall(prompt, responseCount);
      return responses;
    } catch (error) {
      console.error('Error generating agent responses:', error);
      // Fallback to basic responses if LLM fails
      return this.getFallbackResponses(agentRole, topic.title, responseCount);
    }
  }

  private buildAgentPrompt(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: any,
    companyContext: any,
    responseCount: number
  ): string {
    return `You are the ${agentRole} of ${companyContext.name}, a ${companyContext.stage} ${companyContext.industry} company.

Your Profile:
- Role: ${agentRole}
- Persona: ${agentPersona}
- Expertise: ${agentExpertise.join(', ')}

Company Context:
- Company: ${companyContext.name}
- Industry: ${companyContext.industry}
- Size: ${companyContext.size}
- Stage: ${companyContext.stage}
- Description: ${companyContext.description}
- Current Challenges: ${companyContext.challenges.join(', ')}
- Goals: ${companyContext.goals.join(', ')}

Discussion Topic:
- Title: ${topic.title}
- Description: ${topic.description}
- Priority: ${topic.priority}

Generate ${responseCount} distinct, professional responses that you might give during a boardroom discussion about "${topic.title}". Each response should:

1. Be 1-2 sentences long and boardroom-appropriate
2. Reflect your role's perspective and expertise
3. Consider the company's specific context, challenges, and goals
4. Address different aspects of the topic (strategic, operational, risk, implementation, etc.)
5. Show your unique viewpoint as ${agentRole}
6. Be varied in tone and focus (some analytical, some cautionary, some optimistic)

Format your response as a JSON array of strings, like this:
["Response 1", "Response 2", "Response 3", ...]

Responses:`;
  }

  private async simulateLLMCall(prompt: string, responseCount: number): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // For demonstration, we'll generate contextual responses based on the prompt content
    // In production, this would be replaced with actual LLM API calls
    
    const responses = this.generateContextualResponses(prompt, responseCount);
    return responses;
  }

  private generateContextualResponses(prompt: string, responseCount: number): string[] {
    // Extract key information from prompt for contextual generation
    const roleMatch = prompt.match(/Role: (\w+)/);
    const companyMatch = prompt.match(/Company: ([^,\n]+)/);
    const industryMatch = prompt.match(/Industry: ([^,\n]+)/);
    const stageMatch = prompt.match(/Stage: ([^,\n]+)/);
    const topicMatch = prompt.match(/Title: ([^,\n]+)/);
    const challengesMatch = prompt.match(/Current Challenges: ([^,\n]+)/);
    const goalsMatch = prompt.match(/Goals: ([^,\n]+)/);
    
    const role = roleMatch?.[1] || 'Executive';
    const company = companyMatch?.[1] || 'the company';
    const industry = industryMatch?.[1] || 'our industry';
    const stage = stageMatch?.[1] || 'current stage';
    const topic = topicMatch?.[1] || 'this topic';
    const challenges = challengesMatch?.[1] || 'our challenges';
    const goals = goalsMatch?.[1] || 'our objectives';

    const responseTemplates = this.getResponseTemplatesByRole(role);
    const responses: string[] = [];

    for (let i = 0; i < responseCount; i++) {
      const template = responseTemplates[i % responseTemplates.length];
      const response = template
        .replace('{company}', company)
        .replace('{industry}', industry)
        .replace('{stage}', stage)
        .replace('{topic}', topic)
        .replace('{challenges}', challenges)
        .replace('{goals}', goals);
      
      responses.push(response);
    }

    return responses;
  }

  private getResponseTemplatesByRole(role: string): string[] {
    const templates: { [key: string]: string[] } = {
      'CEO': [
        "From a strategic perspective on {topic}, we need to ensure this aligns with {company}'s long-term vision and market positioning.",
        "I'm particularly interested in how this initiative will differentiate us in the {industry} sector and drive sustainable growth.",
        "We must consider the stakeholder impact of {topic} - our customers, employees, and investors all have expectations we need to meet.",
        "The board expects measurable ROI on this initiative. What are our key performance indicators and success metrics?",
        "Given our {stage} position, we need to balance innovation with operational stability in approaching {topic}.",
        "This decision could significantly impact our competitive advantage. How do we ensure we're making the right strategic choice?",
        "I want to understand the regulatory implications and compliance requirements associated with {topic}.",
        "Our company culture and values must be reflected in how we approach {topic}. Let's ensure alignment with our core principles."
      ],
      'CTO': [
        "From a technical architecture standpoint, {topic} will require significant infrastructure considerations and scalability planning.",
        "We need to evaluate the technology stack requirements and ensure our current systems can support this initiative effectively.",
        "The engineering team's capacity and technical debt must be factored into our {topic} implementation timeline.",
        "Security and data privacy are critical concerns for {topic}. We must implement robust safeguards from the ground up.",
        "I recommend conducting a thorough technical feasibility study before committing resources to {topic}.",
        "Our DevOps pipeline and deployment strategies need to accommodate the technical requirements of {topic}.",
        "We should consider the long-term maintenance and technical support implications of implementing {topic}.",
        "Integration with our existing technology ecosystem is crucial. We need to ensure seamless interoperability."
      ],
      'CFO': [
        "The financial implications of {topic} require careful analysis of both immediate costs and long-term revenue impact.",
        "We need to model different budget scenarios and understand the cash flow implications of this {topic} initiative.",
        "From a risk management perspective, what are the financial exposures and how do we mitigate potential losses?",
        "The ROI timeline for {topic} must align with our quarterly targets and annual financial planning.",
        "We should explore financing options and determine the optimal capital structure for funding {topic}.",
        "Tax implications and potential financial incentives need to be evaluated as part of our {topic} strategy.",
        "Our financial controls and reporting systems must be updated to track the performance of {topic} effectively.",
        "The cost-benefit analysis shows we need to carefully balance investment in {topic} with other strategic priorities."
      ],
      'CMO': [
        "From a brand perspective, {topic} presents an opportunity to strengthen our market position and customer relationships.",
        "We need to develop a comprehensive marketing strategy that communicates the value of {topic} to our target audience.",
        "Customer feedback and market research should inform our approach to {topic} to ensure market fit.",
        "The competitive landscape analysis shows that {topic} could be a key differentiator in the {industry} market.",
        "Our digital marketing channels and customer acquisition strategies need to be aligned with the {topic} rollout.",
        "Brand consistency and messaging around {topic} will be crucial for maintaining customer trust and loyalty.",
        "We should leverage {topic} as a content marketing opportunity to establish thought leadership in {industry}.",
        "Customer segmentation and personalization strategies will be essential for the successful adoption of {topic}."
      ],
      'CHRO': [
        "The people impact of {topic} requires careful change management and employee communication strategies.",
        "We need to assess our current talent capabilities and identify any skill gaps that {topic} might create.",
        "Employee engagement and cultural alignment with {topic} will be critical for successful implementation.",
        "Training and development programs must be designed to support our team's transition to {topic}.",
        "Organizational structure and reporting relationships may need adjustment to accommodate {topic} effectively.",
        "We should consider the recruitment and retention implications of implementing {topic} in our organization.",
        "Performance management systems and employee incentives should be aligned with {topic} objectives.",
        "Diversity, equity, and inclusion considerations must be integrated into our {topic} planning and execution."
      ],
      'COO': [
        "From an operational efficiency standpoint, {topic} needs to integrate seamlessly with our existing processes and workflows.",
        "We must evaluate the supply chain and vendor management implications of implementing {topic}.",
        "Quality assurance and operational risk management protocols need to be established for {topic}.",
        "The operational timeline and resource allocation for {topic} must be realistic and achievable.",
        "We need to ensure that {topic} doesn't disrupt our core business operations during implementation.",
        "Process optimization and automation opportunities should be identified as part of the {topic} initiative.",
        "Operational metrics and KPIs must be defined to measure the success of {topic} implementation.",
        "Cross-functional coordination and project management will be essential for {topic} success."
      ]
    };

    return templates[role] || templates['CEO'];
  }

  private getFallbackResponses(role: string, topicTitle: string, count: number): string[] {
    const fallbacks = [
      `As ${role}, I believe we need to carefully consider the implications of ${topicTitle} for our organization.`,
      `From my perspective, ${topicTitle} presents both opportunities and challenges that we must evaluate thoroughly.`,
      `I think we should approach ${topicTitle} with a strategic mindset and clear success metrics.`,
      `The implementation of ${topicTitle} will require cross-functional collaboration and careful planning.`,
      `We need to ensure that ${topicTitle} aligns with our broader business objectives and values.`
    ];

    const responses: string[] = [];
    for (let i = 0; i < count; i++) {
      responses.push(fallbacks[i % fallbacks.length]);
    }
    return responses;
  }

  // Generate responses for multiple agents and topics
  public async generateAllAgentResponses(
    agents: Array<{
      role: string;
      persona: string;
      expertise: string[];
    }>,
    topics: Array<{
      title: string;
      description: string;
      priority: string;
    }>,
    companyContext: any
  ): Promise<Map<string, Map<string, string[]>>> {
    
    const agentResponsesMap = new Map<string, Map<string, string[]>>();
    
    console.log('Generating personalized responses for all agents and topics...');
    
    for (const agent of agents) {
      const topicResponsesMap = new Map<string, string[]>();
      
      for (const topic of topics) {
        console.log(`Generating responses for ${agent.role} on topic: ${topic.title}`);
        
        const responses = await this.generateAgentResponses(
          agent.role,
          agent.persona,
          agent.expertise,
          topic,
          companyContext,
          8 // Generate 8 responses per agent per topic
        );
        
        topicResponsesMap.set(topic.title, responses);
      }
      
      agentResponsesMap.set(agent.role, topicResponsesMap);
    }
    
    console.log('All agent responses generated successfully');
    return agentResponsesMap;
  }
}