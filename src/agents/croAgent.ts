import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CROAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  revenueConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.revenueConcerns = [];
    this.recommendations = [];
  }
}

interface RevenueContext {
  currentRevenue?: number;
  revenueGrowthRate?: number; // percentage
  salesCycleLength?: number; // months
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  churnRate?: number; // percentage
  salesTeamSize?: number;
  conversionRate?: number; // percentage
  averageDealSize?: number;
  pipelineValue?: number;
  marketPenetration?: number; // percentage
  competitivePressure?: 'low' | 'medium' | 'high';
}

/**
 * ## Agent Role
 * CRO focusing on revenue generation, sales optimization, and growth strategy
 * 
 * ## Core Principles
 * 1. Prioritize sustainable revenue growth over short-term gains
 * 2. Optimize sales processes and customer acquisition efficiency
 * 3. Balance customer acquisition with retention strategies
 * 4. Ensure scalable revenue operations and systems
 * 5. Align revenue strategy with market opportunities
 * 
 * ## Analysis Framework
 * - Revenue Impact: Evaluate direct and indirect revenue implications
 * - Sales Efficiency: Analyze sales process and team productivity
 * - Customer Economics: Assess CAC, LTV, and churn implications
 * - Market Opportunity: Evaluate market penetration and growth potential
 * - Competitive Position: Analyze competitive impact on revenue
 * - Scalability: Assess revenue operations scalability
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "revenueConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function croAgent(state: Record<string, any>, revenueContext: RevenueContext): Promise<CROAssessment> {
  // Perform sub-analyses
  const revenueAnalysis = analyzeRevenueImpact(revenueContext);
  const salesAnalysis = analyzeSalesEfficiency(revenueContext);
  const customerAnalysis = analyzeCustomerEconomics(revenueContext);
  const marketAnalysis = analyzeMarketOpportunity(revenueContext);
  const competitiveAnalysis = analyzeCompetitivePosition(revenueContext);

  // Generate structured output
  return generateCROOutput(state.proposal, revenueContext, {
    revenue: revenueAnalysis,
    sales: salesAnalysis,
    customer: customerAnalysis,
    market: marketAnalysis,
    competitive: competitiveAnalysis
  });
}

function analyzeRevenueImpact(context: RevenueContext): { score: number; details: string[] } {
  const { currentRevenue = 0, revenueGrowthRate = 10, averageDealSize = 10000 } = context;
  
  let revenueScore = 70; // Base score
  const details: string[] = [];
  
  // Assess current revenue base
  if (currentRevenue > 10000000) { // $10M+
    revenueScore += 15;
    details.push(`Strong revenue base ($${(currentRevenue/1000000).toFixed(1)}M) provides growth foundation`);
  } else if (currentRevenue > 1000000) { // $1M+
    revenueScore += 5;
    details.push(`Solid revenue base ($${(currentRevenue/1000000).toFixed(1)}M) supports expansion`);
  } else if (currentRevenue > 0) {
    details.push(`Early-stage revenue ($${(currentRevenue/1000).toFixed(0)}K) requires growth acceleration`);
  } else {
    revenueScore -= 20;
    details.push('No established revenue base increases execution risk');
  }
  
  // Evaluate growth rate
  if (revenueGrowthRate >= 50) {
    revenueScore += 20;
    details.push(`Exceptional growth rate (${revenueGrowthRate}%) indicates strong market traction`);
  } else if (revenueGrowthRate >= 25) {
    revenueScore += 10;
    details.push(`Strong growth rate (${revenueGrowthRate}%) shows healthy expansion`);
  } else if (revenueGrowthRate >= 10) {
    details.push(`Moderate growth rate (${revenueGrowthRate}%) meets industry standards`);
  } else {
    revenueScore -= 15;
    details.push(`Low growth rate (${revenueGrowthRate}%) below market expectations`);
  }
  
  // Consider deal size impact
  if (averageDealSize > 100000) {
    revenueScore += 10;
    details.push(`Large average deal size ($${(averageDealSize/1000).toFixed(0)}K) enables efficient scaling`);
  } else if (averageDealSize < 1000) {
    revenueScore -= 10;
    details.push(`Small average deal size ($${averageDealSize}) requires high-volume sales approach`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, revenueScore)), 
    details 
  };
}

function analyzeSalesEfficiency(context: RevenueContext): { score: number; details: string[] } {
  const { salesCycleLength = 6, conversionRate = 15, salesTeamSize = 5 } = context;
  
  let salesScore = 70; // Base score
  const details: string[] = [];
  
  // Assess sales cycle efficiency
  if (salesCycleLength <= 3) {
    salesScore += 15;
    details.push(`Short sales cycle (${salesCycleLength} months) enables rapid revenue generation`);
  } else if (salesCycleLength <= 6) {
    salesScore += 5;
    details.push(`Moderate sales cycle (${salesCycleLength} months) is manageable`);
  } else if (salesCycleLength > 12) {
    salesScore -= 20;
    details.push(`Long sales cycle (${salesCycleLength} months) slows revenue realization`);
  } else {
    salesScore -= 10;
    details.push(`Extended sales cycle (${salesCycleLength} months) impacts cash flow`);
  }
  
  // Evaluate conversion rates
  if (conversionRate >= 25) {
    salesScore += 20;
    details.push(`High conversion rate (${conversionRate}%) indicates strong sales effectiveness`);
  } else if (conversionRate >= 15) {
    salesScore += 10;
    details.push(`Good conversion rate (${conversionRate}%) shows solid sales performance`);
  } else if (conversionRate >= 10) {
    details.push(`Average conversion rate (${conversionRate}%) meets baseline expectations`);
  } else {
    salesScore -= 15;
    details.push(`Low conversion rate (${conversionRate}%) suggests sales process issues`);
  }
  
  // Consider team size adequacy
  if (salesTeamSize < 3) {
    salesScore -= 10;
    details.push(`Small sales team (${salesTeamSize}) may limit growth capacity`);
  } else if (salesTeamSize > 20) {
    salesScore -= 5;
    details.push(`Large sales team (${salesTeamSize}) requires strong management systems`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, salesScore)), 
    details 
  };
}

function analyzeCustomerEconomics(context: RevenueContext): { score: number; details: string[] } {
  const { customerAcquisitionCost = 5000, customerLifetimeValue = 25000, churnRate = 10 } = context;
  
  let economicsScore = 70; // Base score
  const details: string[] = [];
  
  // Calculate LTV:CAC ratio
  const ltvCacRatio = customerLifetimeValue / customerAcquisitionCost;
  
  if (ltvCacRatio >= 5) {
    economicsScore += 25;
    details.push(`Excellent LTV:CAC ratio (${ltvCacRatio.toFixed(1)}:1) indicates strong unit economics`);
  } else if (ltvCacRatio >= 3) {
    economicsScore += 15;
    details.push(`Good LTV:CAC ratio (${ltvCacRatio.toFixed(1)}:1) supports sustainable growth`);
  } else if (ltvCacRatio >= 2) {
    economicsScore += 5;
    details.push(`Acceptable LTV:CAC ratio (${ltvCacRatio.toFixed(1)}:1) meets minimum thresholds`);
  } else {
    economicsScore -= 20;
    details.push(`Poor LTV:CAC ratio (${ltvCacRatio.toFixed(1)}:1) indicates unsustainable economics`);
  }
  
  // Assess churn rate
  if (churnRate <= 5) {
    economicsScore += 15;
    details.push(`Low churn rate (${churnRate}%) indicates strong customer satisfaction`);
  } else if (churnRate <= 10) {
    economicsScore += 5;
    details.push(`Moderate churn rate (${churnRate}%) is manageable`);
  } else if (churnRate <= 20) {
    economicsScore -= 10;
    details.push(`High churn rate (${churnRate}%) impacts revenue predictability`);
  } else {
    economicsScore -= 25;
    details.push(`Very high churn rate (${churnRate}%) threatens revenue sustainability`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, economicsScore)), 
    details 
  };
}

function analyzeMarketOpportunity(context: RevenueContext): { score: number; details: string[] } {
  const { marketPenetration = 5, pipelineValue = 100000 } = context;
  
  let marketScore = 70; // Base score
  const details: string[] = [];
  
  // Assess market penetration
  if (marketPenetration <= 2) {
    marketScore += 20;
    details.push(`Low market penetration (${marketPenetration}%) indicates significant growth opportunity`);
  } else if (marketPenetration <= 10) {
    marketScore += 10;
    details.push(`Moderate market penetration (${marketPenetration}%) shows room for expansion`);
  } else if (marketPenetration >= 30) {
    marketScore -= 15;
    details.push(`High market penetration (${marketPenetration}%) may limit growth potential`);
  }
  
  // Evaluate pipeline strength
  if (pipelineValue > 1000000) {
    marketScore += 15;
    details.push(`Strong pipeline value ($${(pipelineValue/1000000).toFixed(1)}M) supports near-term growth`);
  } else if (pipelineValue > 100000) {
    marketScore += 5;
    details.push(`Solid pipeline value ($${(pipelineValue/1000).toFixed(0)}K) provides growth foundation`);
  } else {
    marketScore -= 10;
    details.push(`Limited pipeline value requires increased lead generation`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, marketScore)), 
    details 
  };
}

function analyzeCompetitivePosition(context: RevenueContext): { score: number; details: string[] } {
  const { competitivePressure = 'medium' } = context;
  
  let competitiveScore = 70; // Base score
  const details: string[] = [];
  
  // Assess competitive pressure impact
  const pressureImpact = {
    'low': 15,
    'medium': 0,
    'high': -20
  };
  
  competitiveScore += pressureImpact[competitivePressure];
  
  if (competitivePressure === 'low') {
    details.push('Low competitive pressure provides pricing flexibility and market opportunity');
  } else if (competitivePressure === 'high') {
    details.push('High competitive pressure may impact pricing power and customer acquisition');
  } else {
    details.push('Moderate competitive pressure requires strong differentiation strategy');
  }
  
  return { 
    score: Math.max(0, Math.min(100, competitiveScore)), 
    details 
  };
}

async function generateCROOutput(proposal: string, context: RevenueContext, analyses: any): Promise<CROAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CRO (Chief Revenue Officer) analyzing a business proposal from a revenue generation and sales optimization perspective.

Your role is to assess:
- Revenue impact and growth potential
- Sales efficiency and process optimization
- Customer acquisition and retention economics
- Market opportunity and penetration strategy
- Competitive positioning and pricing implications
- Revenue operations scalability

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific revenue recommendations.

Focus on sustainable revenue growth, sales effectiveness, and customer economics. Consider both immediate revenue impact and long-term growth potential.`],
    ['human', `Proposal: {proposal}

Revenue Context:
- Current Revenue: ${currentRevenue}
- Revenue Growth Rate: {revenueGrowthRate}%
- Sales Cycle Length: {salesCycleLength} months
- Customer Acquisition Cost: ${customerAcquisitionCost}
- Customer Lifetime Value: ${customerLifetimeValue}
- Churn Rate: {churnRate}%
- Sales Team Size: {salesTeamSize}
- Conversion Rate: {conversionRate}%
- Average Deal Size: ${averageDealSize}
- Pipeline Value: ${pipelineValue}
- Market Penetration: {marketPenetration}%
- Competitive Pressure: {competitivePressure}

Analysis Results:
- Revenue Impact: {revenueScore}/100 - {revenueDetails}
- Sales Efficiency: {salesScore}/100 - {salesDetails}
- Customer Economics: {customerScore}/100 - {customerDetails}
- Market Opportunity: {marketScore}/100 - {marketDetails}
- Competitive Position: {competitiveScore}/100 - {competitiveDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, revenueConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      currentRevenue: context.currentRevenue || 'Not specified',
      revenueGrowthRate: context.revenueGrowthRate || 'Not specified',
      salesCycleLength: context.salesCycleLength || 'Not specified',
      customerAcquisitionCost: context.customerAcquisitionCost || 'Not specified',
      customerLifetimeValue: context.customerLifetimeValue || 'Not specified',
      churnRate: context.churnRate || 'Not specified',
      salesTeamSize: context.salesTeamSize || 'Not specified',
      conversionRate: context.conversionRate || 'Not specified',
      averageDealSize: context.averageDealSize || 'Not specified',
      pipelineValue: context.pipelineValue || 'Not specified',
      marketPenetration: context.marketPenetration || 'Not specified',
      competitivePressure: context.competitivePressure || 'Not specified',
      revenueScore: analyses.revenue.score,
      revenueDetails: analyses.revenue.details.join('; '),
      salesScore: analyses.sales.score,
      salesDetails: analyses.sales.details.join('; '),
      customerScore: analyses.customer.score,
      customerDetails: analyses.customer.details.join('; '),
      marketScore: analyses.market.score,
      marketDetails: analyses.market.details.join('; '),
      competitiveScore: analyses.competitive.score,
      competitiveDetails: analyses.competitive.details.join('; ')
    }) },
    model: CROAssessment,
    agentName: 'croAgent',
    defaultFactory: () => {
      const assessment = new CROAssessment();
      assessment.reasoning = 'Error in generating revenue analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.revenueConcerns = ['Unable to complete full revenue analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated revenue context'];
      return assessment;
    }
  });
}