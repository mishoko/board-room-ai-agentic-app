// Enhanced LLM Service for generating sophisticated agent responses
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
    responseCount: number = 12
  ): Promise<string[]> {
    
    const prompt = this.buildAdvancedAgentPrompt(
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
      const responses = await this.simulateAdvancedLLMCall(prompt, responseCount);
      return responses;
    } catch (error) {
      console.error('Error generating agent responses:', error);
      // Fallback to sophisticated responses if LLM fails
      return this.getAdvancedFallbackResponses(agentRole, topic.title, companyContext, responseCount);
    }
  }

  private buildAdvancedAgentPrompt(
    agentRole: string,
    agentPersona: string,
    agentExpertise: string[],
    topic: any,
    companyContext: any,
    responseCount: number
  ): string {
    return `You are an exceptionally experienced ${agentRole} of ${companyContext.name}, a ${companyContext.stage} ${companyContext.industry} company. You have 15+ years of C-level experience and are known for your sharp analytical mind, strategic thinking, and willingness to challenge assumptions.

Your Executive Profile:
- Role: ${agentRole}
- Persona: ${agentPersona}
- Deep Expertise: ${agentExpertise.join(', ')}
- Leadership Style: Direct, analytical, results-driven, and unafraid to voice contrarian views

Company Context:
- Company: ${companyContext.name}
- Industry: ${companyContext.industry} (you understand all market dynamics, competitive threats, and industry trends)
- Size: ${companyContext.size}
- Stage: ${companyContext.stage}
- Description: ${companyContext.description}
- Current Challenges: ${companyContext.challenges.join(', ')}
- Strategic Goals: ${companyContext.goals.join(', ')}

Discussion Topic: "${topic.title}"
- Description: ${topic.description}
- Priority: ${topic.priority}

CRITICAL: Generate ${responseCount} sophisticated, executive-level responses that demonstrate deep expertise and critical thinking. Each response should:

1. Show advanced domain knowledge specific to your role
2. Challenge assumptions or present contrarian viewpoints when appropriate
3. Reference specific metrics, frameworks, or industry best practices
4. Demonstrate understanding of complex interdependencies
5. Be assertive and confident, as befits a C-level executive
6. Include specific concerns, risks, or opportunities others might miss
7. Reference real-world examples or case studies (hypothetically)
8. Show willingness to disagree with other executives when necessary
9. Be 2-3 sentences long with sophisticated vocabulary
10. Demonstrate the strategic thinking expected at the C-suite level

IMPORTANT LANGUAGE GUIDELINES:
- NEVER repeat the topic title "${topic.title}" in your responses
- Use natural pronouns like "this", "it", "the initiative", "the proposal", "our approach"
- Speak as if you're in an ongoing conversation, not introducing the topic
- Use contextual references instead of explicit topic mentions
- Make responses flow naturally as part of a boardroom discussion

Examples of natural language (GOOD):
- "The financial projections don't account for customer acquisition costs and market saturation."
- "I'm concerned about the technical architecture implications of this initiative."
- "The proposed solution introduces significant complexity that our team isn't equipped to handle."

Examples to AVOID (BAD):
- "The financial projections for [topic name] don't account for..."
- "I'm concerned about [topic name] and its technical implications..."
- "[Topic name] introduces significant complexity..."

Format as JSON array: ["Response 1", "Response 2", ...]

Responses:`;
  }

  private async simulateAdvancedLLMCall(prompt: string, responseCount: number): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
    
    const responses = this.generateSophisticatedResponses(prompt, responseCount);
    return responses;
  }

  private generateSophisticatedResponses(prompt: string, responseCount: number): string[] {
    // Extract key information from prompt for contextual generation
    const roleMatch = prompt.match(/Role: (\w+)/);
    const companyMatch = prompt.match(/Company: ([^,\n]+)/);
    const industryMatch = prompt.match(/Industry: ([^,\n]+)/);
    const stageMatch = prompt.match(/Stage: ([^,\n]+)/);
    const topicMatch = prompt.match(/Topic: "([^"]+)"/);
    const challengesMatch = prompt.match(/Current Challenges: ([^,\n]+)/);
    const goalsMatch = prompt.match(/Strategic Goals: ([^,\n]+)/);
    
    const role = roleMatch?.[1] || 'Executive';
    const company = companyMatch?.[1] || 'the company';
    const industry = industryMatch?.[1] || 'our industry';
    const stage = stageMatch?.[1] || 'current stage';
    const topic = topicMatch?.[1] || 'this initiative';
    const challenges = challengesMatch?.[1] || 'our challenges';
    const goals = goalsMatch?.[1] || 'our objectives';

    const responseTemplates = this.getAdvancedResponseTemplatesByRole(role);
    const responses: string[] = [];

    for (let i = 0; i < responseCount; i++) {
      const template = responseTemplates[i % responseTemplates.length];
      const response = template
        .replace(/{company}/g, company)
        .replace(/{industry}/g, industry)
        .replace(/{stage}/g, stage)
        .replace(/{topic}/g, 'this initiative')
        .replace(/{challenges}/g, challenges)
        .replace(/{goals}/g, goals);
      
      responses.push(response);
    }

    return responses;
  }

  private getAdvancedResponseTemplatesByRole(role: string): string[] {
    const templates: { [key: string]: string[] } = {
      'CEO': [
        "I'm concerned we're approaching this with tunnel vision - the market dynamics in {industry} suggest we need to consider the competitive response and potential for commoditization.",
        "The strategic implications extend beyond our immediate goals; we risk creating organizational complexity that could undermine our {stage} advantages and dilute our core value proposition.",
        "While this aligns with our vision, I question whether we have the execution capabilities and market timing right - premature scaling has killed more companies at our stage than lack of innovation.",
        "The board will scrutinize the capital allocation against our other strategic priorities; we need to demonstrate clear differentiation and sustainable competitive moats.",
        "I'm seeing red flags in how we're framing this - we're solving for symptoms rather than root causes, which typically leads to expensive pivots down the road.",
        "The regulatory landscape in {industry} is shifting rapidly; this could expose us to compliance risks that haven't been adequately stress-tested in our scenario planning.",
        "Our stakeholder alignment is fragmented - investors, customers, and employees have conflicting expectations that we haven't reconciled strategically.",
        "The opportunity cost of pursuing this means deprioritizing initiatives that could deliver faster ROI and strengthen our market position more effectively.",
        "I'm challenging the fundamental assumptions here - are we building what the market needs or what we think it should need?",
        "The timing feels reactive rather than strategic; we're responding to competitive pressure instead of creating our own market category.",
        "We need to examine whether this creates genuine customer value or just feature parity - differentiation in {industry} requires bold, contrarian bets.",
        "The cultural implications could fundamentally alter our organizational DNA; we must ensure this aligns with the company we aspire to become."
      ],
      'CTO': [
        "The technical architecture introduces significant complexity that our current engineering team isn't equipped to handle - we're looking at 18+ months of technical debt accumulation.",
        "I'm concerned about the scalability assumptions; our infrastructure can't support the projected load without a complete re-architecture of our core systems.",
        "The security implications haven't been thoroughly vetted - we're potentially exposing attack vectors that could compromise our entire platform integrity.",
        "Our technology stack is already fragmented; this would require integrating disparate systems that weren't designed for interoperability, creating maintenance nightmares.",
        "The performance benchmarks are unrealistic given our current database architecture - we'd need to migrate to a distributed system, which is a 12-month project minimum.",
        "I'm questioning whether we're over-engineering this - the technical complexity doesn't justify the business value, and simpler solutions might deliver 80% of the benefit.",
        "The third-party dependencies create vendor lock-in risks that could constrain our future architectural decisions and increase operational costs significantly.",
        "Our DevOps pipeline isn't mature enough to support the deployment complexity - we need to invest in infrastructure automation before attempting this initiative.",
        "The data privacy requirements conflict with our current data architecture; compliance would require rebuilding our entire data governance framework.",
        "I'm seeing fundamental flaws in the technical specifications - the proposed solution doesn't account for edge cases that represent 30% of our user scenarios.",
        "The API design violates several architectural principles we've established; this could fragment our platform and create integration challenges for partners.",
        "We're underestimating the technical risk - the failure modes could cascade through our entire system, potentially causing extended outages."
      ],
      'CFO': [
        "The financial modeling is fundamentally flawed - the revenue projections don't account for customer acquisition cost inflation and market saturation dynamics.",
        "I'm seeing concerning cash flow implications; the working capital requirements during scaling could strain our liquidity position beyond acceptable risk thresholds.",
        "The unit economics don't improve with scale as projected - we're facing a contribution margin trap that could erode profitability across our entire portfolio.",
        "Our capital allocation framework suggests this has a negative NPV when properly risk-adjusted; we're essentially subsidizing growth that destroys shareholder value.",
        "The competitive pricing pressure in {industry} means this will face immediate margin compression - our cost structure isn't optimized for the price points market demands.",
        "I'm questioning the revenue recognition implications - the accounting treatment could smooth reported earnings but create audit risks and investor skepticism.",
        "The operational leverage assumptions are overly optimistic; fixed cost absorption won't improve as dramatically as modeled, limiting profitability upside.",
        "We're underestimating the total cost of ownership - maintenance, support, and upgrade costs could consume 40% of projected revenues over the lifecycle.",
        "The foreign exchange exposure creates hedging complexities that could introduce earnings volatility and complicate our financial reporting.",
        "I'm concerned about the working capital cycle - extended payment terms with enterprise customers could create cash flow timing mismatches.",
        "The tax implications haven't been properly structured; we could face double taxation issues that significantly impact after-tax returns.",
        "Our debt covenants may be triggered by the capital requirements - we need to renegotiate credit facilities before proceeding with this initiative."
      ],
      'CMO': [
        "The brand positioning conflicts with our established market perception - we risk confusing customers and diluting the brand equity we've built in {industry}.",
        "I'm seeing fundamental flaws in the customer segmentation - we're targeting demographics that don't align with our core value proposition or buying behavior patterns.",
        "The competitive differentiation is weak; we're essentially creating feature parity rather than category-defining innovation that commands premium pricing.",
        "Our customer acquisition channels aren't optimized for this - the CAC:LTV ratios suggest we'll be burning cash on unprofitable customer segments.",
        "The messaging strategy lacks emotional resonance; we're leading with features rather than outcomes, which historically underperforms in our market.",
        "I'm concerned about cannibalization effects - we could be stealing share from our higher-margin products without expanding the total addressable market.",
        "The go-to-market timeline conflicts with our seasonal buying patterns; launching during our customers' budget freeze periods will limit adoption velocity.",
        "Our brand architecture can't support this without creating confusion in the market - we need a clear product hierarchy that customers can navigate intuitively.",
        "The customer research is based on stated preferences rather than revealed behavior - actual adoption patterns could differ significantly from survey responses.",
        "I'm questioning whether this solves a real customer pain point or creates a solution looking for a problem - the market validation feels insufficient.",
        "The pricing strategy doesn't account for competitive response; we're vulnerable to price wars that could commoditize the entire category.",
        "Our marketing attribution models can't accurately measure the impact on customer lifetime value - we're flying blind on ROI optimization."
      ],
      'CHRO': [
        "The organizational design implications require restructuring that could disrupt our high-performing teams and create talent retention risks we can't afford.",
        "I'm concerned about the skills gap - our current workforce lacks the competencies needed, and the talent market for these skills is extremely competitive.",
        "The cultural change required conflicts with our core values and could create internal resistance that undermines execution and employee engagement.",
        "Our compensation philosophy doesn't align with the talent requirements - we'd need to restructure our entire rewards framework to attract necessary expertise.",
        "The performance management implications are complex; existing KPIs don't capture the new behaviors and outcomes we need to drive success.",
        "I'm seeing potential legal and compliance risks - the employment law implications haven't been thoroughly vetted, especially for multi-jurisdictional operations.",
        "The change management requirements exceed our organizational capacity; we're already managing multiple transformation initiatives that are straining our people.",
        "Our leadership development pipeline isn't prepared - we lack the management capabilities needed to scale this initiative effectively across the organization.",
        "The diversity and inclusion implications could inadvertently create barriers for underrepresented groups, conflicting with our DEI commitments and goals.",
        "I'm questioning whether our organizational culture can support this - the collaborative behaviors required don't align with our current incentive structures.",
        "The employee value proposition is unclear; we haven't articulated how this benefits our workforce or aligns with their career development aspirations.",
        "Our succession planning doesn't account for the leadership requirements - we're creating key person dependencies that increase organizational risk."
      ],
      'COO': [
        "The operational complexity will strain our process maturity and quality systems - we're not equipped to maintain service levels during this transition.",
        "I'm seeing significant supply chain risks - our vendor relationships and procurement processes aren't designed for the scale and complexity this requires.",
        "The process integration challenges could create operational silos that undermine our efficiency gains and customer experience consistency.",
        "Our quality assurance frameworks can't adequately test this - we're introducing failure modes that our current monitoring and alerting systems won't detect.",
        "The capacity planning is based on linear scaling assumptions that don't reflect operational realities - we'll hit bottlenecks that constrain growth.",
        "I'm concerned about the business continuity implications - our disaster recovery and risk management protocols need complete overhaul to accommodate this complexity.",
        "The operational metrics don't align with our existing KPI framework - we'll lose visibility into performance drivers and early warning indicators.",
        "Our service delivery model isn't optimized for this - customer support, implementation, and success functions will require significant restructuring and training.",
        "The regulatory compliance burden will overwhelm our current audit and control systems - we need substantial investment in governance infrastructure.",
        "I'm questioning the operational feasibility given our current resource constraints - we're already operating at capacity limits across multiple functions.",
        "The cross-functional coordination required exceeds our project management maturity - we lack the systems and processes for this level of complexity.",
        "Our operational risk profile changes dramatically - we're introducing single points of failure that could cascade through our entire service delivery."
      ]
    };

    return templates[role] || templates['CEO'];
  }

  private getAdvancedFallbackResponses(role: string, topicTitle: string, companyContext: any, count: number): string[] {
    const industry = companyContext.industry || 'our industry';
    const stage = companyContext.stage || 'current stage';
    
    const fallbacks = [
      `As ${role}, I'm challenging the fundamental assumptions here - we need to ensure we're solving the right problem before committing resources.`,
      `The strategic implications in the ${industry} sector require deeper analysis of competitive dynamics and market timing.`,
      `I'm concerned about the execution risks given our ${stage} position - we need to stress-test our capabilities against the requirements.`,
      `The interdependencies with our existing initiatives haven't been properly mapped - we risk creating organizational complexity.`,
      `From my experience in ${industry}, this could expose us to risks that aren't immediately apparent in our current analysis.`
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
    
    console.log('Generating sophisticated executive responses for all agents and topics...');
    
    for (const agent of agents) {
      const topicResponsesMap = new Map<string, string[]>();
      
      for (const topic of topics) {
        console.log(`Generating advanced responses for ${agent.role} on topic: ${topic.title}`);
        
        const responses = await this.generateAgentResponses(
          agent.role,
          agent.persona,
          agent.expertise,
          topic,
          companyContext,
          12 // Generate 12 sophisticated responses per agent per topic
        );
        
        topicResponsesMap.set(topic.title, responses);
      }
      
      agentResponsesMap.set(agent.role, topicResponsesMap);
    }
    
    console.log('All sophisticated agent responses generated successfully');
    return agentResponsesMap;
  }
}