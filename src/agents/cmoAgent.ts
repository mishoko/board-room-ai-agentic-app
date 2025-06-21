import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CMOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  marketingConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.marketingConcerns = [];
    this.recommendations = [];
  }
}

interface MarketingContext {
  targetAudience?: string[];
  marketSize?: number;
  competitorAnalysis?: string[];
  brandAlignment?: number; // 1-10 scale
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  marketingBudget?: number;
  launchTimeline?: number; // months
  brandRisk?: 'low' | 'medium' | 'high';
  customerFeedback?: string[];
}

/**
 * ## Agent Role
 * CMO focusing on market positioning, brand strategy, and customer acquisition
 * 
 * ## Core Principles
 * 1. Prioritize customer-centric solutions and market fit
 * 2. Assess brand alignment and reputation impact
 * 3. Evaluate competitive positioning and differentiation
 * 4. Ensure sustainable customer acquisition economics
 * 5. Balance innovation with brand consistency
 * 
 * ## Analysis Framework
 * - Market Opportunity: Evaluate target market size and accessibility
 * - Brand Impact: Assess alignment with brand values and positioning
 * - Competitive Analysis: Analyze competitive landscape and differentiation
 * - Customer Economics: Evaluate CAC, LTV, and acquisition sustainability
 * - Go-to-Market: Assess launch strategy and market timing
 * - Customer Validation: Analyze customer feedback and market demand
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "marketingConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cmoAgent(state: Record<string, any>, marketingContext: MarketingContext): Promise<CMOAssessment> {
  // Perform sub-analyses
  const marketAnalysis = analyzeMarketOpportunity(marketingContext);
  const brandAnalysis = analyzeBrandImpact(marketingContext);
  const competitiveAnalysis = analyzeCompetitiveLandscape(marketingContext);
  const economicsAnalysis = analyzeCustomerEconomics(marketingContext);
  const launchAnalysis = analyzeGoToMarket(marketingContext);
  const validationAnalysis = analyzeCustomerValidation(marketingContext);

  // Generate structured output
  return generateCMOOutput(state.proposal, marketingContext, {
    market: marketAnalysis,
    brand: brandAnalysis,
    competitive: competitiveAnalysis,
    economics: economicsAnalysis,
    launch: launchAnalysis,
    validation: validationAnalysis
  });
}

function analyzeMarketOpportunity(context: MarketingContext): { score: number; details: string[] } {
  const { marketSize = 0, targetAudience = [] } = context;
  
  let marketScore = 60; // Base score
  const details: string[] = [];
  
  // Assess market size
  if (marketSize > 1000000000) { // $1B+ market
    marketScore += 25;
    details.push(`Large market opportunity: $${(marketSize/1000000000).toFixed(1)}B total addressable market`);
  } else if (marketSize > 100000000) { // $100M+ market
    marketScore += 15;
    details.push(`Significant market opportunity: $${(marketSize/1000000).toFixed(0)}M market size`);
  } else if (marketSize > 10000000) { // $10M+ market
    marketScore += 5;
    details.push(`Moderate market opportunity: $${(marketSize/1000000).toFixed(0)}M market size`);
  } else if (marketSize > 0) {
    marketScore -= 10;
    details.push(`Limited market size: $${(marketSize/1000000).toFixed(1)}M may constrain growth potential`);
  }
  
  // Evaluate target audience clarity
  if (targetAudience.length === 0) {
    marketScore -= 20;
    details.push('Undefined target audience creates marketing execution risks');
  } else if (targetAudience.length > 5) {
    marketScore -= 10;
    details.push(`Broad target audience (${targetAudience.length} segments) may dilute messaging effectiveness`);
  } else {
    marketScore += 10;
    details.push(`Well-defined target audience: ${targetAudience.join(', ')}`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, marketScore)), 
    details 
  };
}

function analyzeBrandImpact(context: MarketingContext): { score: number; details: string[] } {
  const { brandAlignment = 5, brandRisk = 'medium' } = context;
  
  let brandScore = brandAlignment * 10; // Convert 1-10 scale to percentage
  const details: string[] = [];
  
  // Assess brand alignment
  if (brandAlignment >= 8) {
    details.push(`Strong brand alignment (${brandAlignment}/10) supports brand equity`);
  } else if (brandAlignment >= 6) {
    details.push(`Moderate brand alignment (${brandAlignment}/10) requires careful positioning`);
  } else if (brandAlignment >= 4) {
    brandScore -= 10;
    details.push(`Weak brand alignment (${brandAlignment}/10) may confuse brand positioning`);
  } else {
    brandScore -= 25;
    details.push(`Poor brand alignment (${brandAlignment}/10) risks brand dilution`);
  }
  
  // Evaluate brand risk
  const riskImpact = {
    'low': 5,
    'medium': 0,
    'high': -20
  };
  
  brandScore += riskImpact[brandRisk];
  if (brandRisk === 'high') {
    details.push('High brand risk requires comprehensive reputation management strategy');
  }
  
  return { 
    score: Math.max(0, Math.min(100, brandScore)), 
    details 
  };
}

function analyzeCompetitiveLandscape(context: MarketingContext): { score: number; details: string[] } {
  const { competitorAnalysis = [] } = context;
  
  let competitiveScore = 70; // Base score
  const details: string[] = [];
  
  // Assess competitive intensity
  if (competitorAnalysis.length === 0) {
    competitiveScore -= 15;
    details.push('Lack of competitive analysis creates market positioning risks');
  } else if (competitorAnalysis.length > 10) {
    competitiveScore -= 20;
    details.push(`Highly competitive market (${competitorAnalysis.length}+ competitors) requires strong differentiation`);
  } else if (competitorAnalysis.length > 5) {
    competitiveScore -= 10;
    details.push(`Competitive market (${competitorAnalysis.length} competitors) needs clear value proposition`);
  } else {
    competitiveScore += 10;
    details.push(`Manageable competitive landscape (${competitorAnalysis.length} main competitors)`);
  }
  
  // Look for competitive advantages in analysis
  const advantageKeywords = ['unique', 'first', 'innovative', 'proprietary', 'exclusive'];
  const hasAdvantages = competitorAnalysis.some(analysis =>
    advantageKeywords.some(keyword => analysis.toLowerCase().includes(keyword))
  );
  
  if (hasAdvantages) {
    competitiveScore += 15;
    details.push('Competitive analysis identifies potential differentiation opportunities');
  }
  
  return { 
    score: Math.max(0, Math.min(100, competitiveScore)), 
    details 
  };
}

function analyzeCustomerEconomics(context: MarketingContext): { score: number; details: string[] } {
  const { customerAcquisitionCost = 0, customerLifetimeValue = 0, marketingBudget = 0 } = context;
  
  let economicsScore = 60; // Base score
  const details: string[] = [];
  
  // Calculate LTV:CAC ratio
  if (customerAcquisitionCost > 0 && customerLifetimeValue > 0) {
    const ltvCacRatio = customerLifetimeValue / customerAcquisitionCost;
    
    if (ltvCacRatio >= 5) {
      economicsScore += 25;
      details.push(`Excellent unit economics: LTV:CAC ratio of ${ltvCacRatio.toFixed(1)}:1`);
    } else if (ltvCacRatio >= 3) {
      economicsScore += 15;
      details.push(`Good unit economics: LTV:CAC ratio of ${ltvCacRatio.toFixed(1)}:1`);
    } else if (ltvCacRatio >= 2) {
      economicsScore += 5;
      details.push(`Acceptable unit economics: LTV:CAC ratio of ${ltvCacRatio.toFixed(1)}:1`);
    } else {
      economicsScore -= 20;
      details.push(`Poor unit economics: LTV:CAC ratio of ${ltvCacRatio.toFixed(1)}:1 below sustainable threshold`);
    }
  } else {
    economicsScore -= 15;
    details.push('Missing customer economics data (CAC/LTV) prevents profitability assessment');
  }
  
  // Assess marketing budget adequacy
  if (marketingBudget > 0 && customerAcquisitionCost > 0) {
    const potentialAcquisitions = marketingBudget / customerAcquisitionCost;
    if (potentialAcquisitions < 100) {
      economicsScore -= 10;
      details.push(`Limited marketing budget: can acquire ~${Math.round(potentialAcquisitions)} customers`);
    }
  }
  
  return { 
    score: Math.max(0, Math.min(100, economicsScore)), 
    details 
  };
}

function analyzeGoToMarket(context: MarketingContext): { score: number; details: string[] } {
  const { launchTimeline = 12, marketingBudget = 0 } = context;
  
  let launchScore = 70; // Base score
  const details: string[] = [];
  
  // Assess launch timeline
  if (launchTimeline <= 3) {
    launchScore -= 15;
    details.push(`Aggressive launch timeline (${launchTimeline} months) may limit market preparation`);
  } else if (launchTimeline <= 6) {
    launchScore += 5;
    details.push(`Reasonable launch timeline (${launchTimeline} months) allows adequate preparation`);
  } else if (launchTimeline <= 12) {
    launchScore += 10;
    details.push(`Conservative launch timeline (${launchTimeline} months) enables thorough market preparation`);
  } else {
    launchScore -= 10;
    details.push(`Extended launch timeline (${launchTimeline} months) risks market timing and competitive response`);
  }
  
  // Evaluate marketing budget adequacy
  if (marketingBudget === 0) {
    launchScore -= 25;
    details.push('No marketing budget allocated creates launch execution risks');
  } else if (marketingBudget < 50000) {
    launchScore -= 15;
    details.push(`Limited marketing budget ($${(marketingBudget/1000).toFixed(0)}K) constrains launch reach`);
  } else if (marketingBudget > 500000) {
    launchScore += 10;
    details.push(`Substantial marketing budget ($${(marketingBudget/1000).toFixed(0)}K) enables comprehensive launch`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, launchScore)), 
    details 
  };
}

function analyzeCustomerValidation(context: MarketingContext): { score: number; details: string[] } {
  const { customerFeedback = [] } = context;
  
  let validationScore = 50; // Base score
  const details: string[] = [];
  
  if (customerFeedback.length === 0) {
    validationScore -= 20;
    details.push('No customer feedback available - market validation incomplete');
  } else {
    // Analyze sentiment of feedback
    const positiveKeywords = ['love', 'great', 'excellent', 'amazing', 'perfect', 'useful', 'valuable'];
    const negativeKeywords = ['hate', 'terrible', 'awful', 'useless', 'confusing', 'expensive', 'complicated'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    customerFeedback.forEach(feedback => {
      const text = feedback.toLowerCase();
      if (positiveKeywords.some(keyword => text.includes(keyword))) positiveCount++;
      if (negativeKeywords.some(keyword => text.includes(keyword))) negativeCount++;
    });
    
    const sentimentRatio = positiveCount / (positiveCount + negativeCount + 1);
    
    if (sentimentRatio > 0.7) {
      validationScore += 25;
      details.push(`Strong customer validation: ${Math.round(sentimentRatio * 100)}% positive sentiment`);
    } else if (sentimentRatio > 0.5) {
      validationScore += 10;
      details.push(`Moderate customer validation: ${Math.round(sentimentRatio * 100)}% positive sentiment`);
    } else {
      validationScore -= 15;
      details.push(`Weak customer validation: ${Math.round(sentimentRatio * 100)}% positive sentiment raises concerns`);
    }
    
    details.push(`Customer feedback analysis: ${customerFeedback.length} responses reviewed`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, validationScore)), 
    details 
  };
}

async function generateCMOOutput(proposal: string, context: MarketingContext, analyses: any): Promise<CMOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CMO analyzing a business proposal from a marketing and customer perspective.

Your role is to assess:
- Market opportunity and target audience alignment
- Brand impact and positioning implications
- Competitive landscape and differentiation strategy
- Customer acquisition economics and sustainability
- Go-to-market strategy and execution feasibility
- Customer validation and market demand

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific marketing recommendations.

Focus on customer-centric analysis, market positioning, and sustainable growth strategies. Consider both immediate marketing impact and long-term brand health.`],
    ['human', `Proposal: {proposal}

Marketing Context:
- Target Audience: {targetAudience}
- Market Size: ${marketSize}
- Competitor Analysis: {competitorAnalysis}
- Brand Alignment: {brandAlignment}/10
- Customer Acquisition Cost: ${customerAcquisitionCost}
- Customer Lifetime Value: ${customerLifetimeValue}
- Marketing Budget: ${marketingBudget}
- Launch Timeline: {launchTimeline} months
- Brand Risk: {brandRisk}
- Customer Feedback: {customerFeedback}

Analysis Results:
- Market Opportunity: {marketScore}/100 - {marketDetails}
- Brand Impact: {brandScore}/100 - {brandDetails}
- Competitive Analysis: {competitiveScore}/100 - {competitiveDetails}
- Customer Economics: {economicsScore}/100 - {economicsDetails}
- Go-to-Market: {launchScore}/100 - {launchDetails}
- Customer Validation: {validationScore}/100 - {validationDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, marketingConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      targetAudience: context.targetAudience?.join(', ') || 'Not specified',
      marketSize: context.marketSize || 'Not specified',
      competitorAnalysis: context.competitorAnalysis?.join('; ') || 'Not specified',
      brandAlignment: context.brandAlignment || 'Not specified',
      customerAcquisitionCost: context.customerAcquisitionCost || 'Not specified',
      customerLifetimeValue: context.customerLifetimeValue || 'Not specified',
      marketingBudget: context.marketingBudget || 'Not specified',
      launchTimeline: context.launchTimeline || 'Not specified',
      brandRisk: context.brandRisk || 'Not specified',
      customerFeedback: context.customerFeedback?.join('; ') || 'Not specified',
      marketScore: analyses.market.score,
      marketDetails: analyses.market.details.join('; '),
      brandScore: analyses.brand.score,
      brandDetails: analyses.brand.details.join('; '),
      competitiveScore: analyses.competitive.score,
      competitiveDetails: analyses.competitive.details.join('; '),
      economicsScore: analyses.economics.score,
      economicsDetails: analyses.economics.details.join('; '),
      launchScore: analyses.launch.score,
      launchDetails: analyses.launch.details.join('; '),
      validationScore: analyses.validation.score,
      validationDetails: analyses.validation.details.join('; ')
    }) },
    model: CMOAssessment,
    agentName: 'cmoAgent',
    defaultFactory: () => {
      const assessment = new CMOAssessment();
      assessment.reasoning = 'Error in generating marketing analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.marketingConcerns = ['Unable to complete full marketing analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated marketing context'];
      return assessment;
    }
  });
}