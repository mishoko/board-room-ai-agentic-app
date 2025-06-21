import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CGROAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  growthConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.growthConcerns = [];
    this.recommendations = [];
  }
}

interface GrowthContext {
  currentGrowthRate?: number; // percentage
  targetGrowthRate?: number; // percentage
  marketExpansion?: 'local' | 'regional' | 'national' | 'global';
  customerSegments?: number;
  productPortfolio?: number;
  scalabilityIndex?: number; // 1-10 scale
  competitiveAdvantage?: 'none' | 'weak' | 'moderate' | 'strong' | 'dominant';
  growthInvestment?: number; // budget allocation
  customerRetention?: number; // percentage
  marketShare?: number; // percentage
  growthChannels?: string[];
  innovationPipeline?: 'empty' | 'limited' | 'moderate' | 'robust';
}

/**
 * ## Agent Role
 * CGRO focusing on sustainable growth strategy, market expansion, and revenue optimization
 * 
 * ## Core Principles
 * 1. Drive sustainable and profitable growth across all business dimensions
 * 2. Optimize customer acquisition, retention, and expansion strategies
 * 3. Identify and capitalize on new market opportunities
 * 4. Balance growth velocity with operational sustainability
 * 5. Build scalable growth engines and competitive moats
 * 
 * ## Analysis Framework
 * - Growth Trajectory: Evaluate current vs target growth performance
 * - Market Expansion: Assess market penetration and expansion opportunities
 * - Customer Growth: Analyze customer acquisition and retention strategies
 * - Scalability: Evaluate growth infrastructure and operational scalability
 * - Competitive Positioning: Assess competitive advantages for growth
 * - Innovation Pipeline: Analyze future growth drivers and opportunities
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "growthConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cgroAgent(state: Record<string, any>, growthContext: GrowthContext): Promise<CGROAssessment> {
  // Perform sub-analyses
  const trajectoryAnalysis = analyzeGrowthTrajectory(growthContext);
  const marketAnalysis = analyzeMarketExpansion(growthContext);
  const customerAnalysis = analyzeCustomerGrowth(growthContext);
  const scalabilityAnalysis = analyzeScalability(growthContext);
  const competitiveAnalysis = analyzeCompetitiveGrowth(growthContext);

  // Generate structured output
  return generateCGROOutput(state.proposal, growthContext, {
    trajectory: trajectoryAnalysis,
    market: marketAnalysis,
    customer: customerAnalysis,
    scalability: scalabilityAnalysis,
    competitive: competitiveAnalysis
  });
}

function analyzeGrowthTrajectory(context: GrowthContext): { score: number; details: string[] } {
  const { currentGrowthRate = 10, targetGrowthRate = 25, growthInvestment = 100000 } = context;
  
  let trajectoryScore = 70; // Base score
  const details: string[] = [];
  
  // Assess current growth performance
  if (currentGrowthRate >= 50) {
    trajectoryScore += 25;
    details.push(`Exceptional growth rate (${currentGrowthRate}%) demonstrates strong market traction`);
  } else if (currentGrowthRate >= 25) {
    trajectoryScore += 15;
    details.push(`Strong growth rate (${currentGrowthRate}%) shows healthy expansion`);
  } else if (currentGrowthRate >= 10) {
    trajectoryScore += 5;
    details.push(`Moderate growth rate (${currentGrowthRate}%) meets baseline expectations`);
  } else if (currentGrowthRate >= 0) {
    trajectoryScore -= 10;
    details.push(`Low growth rate (${currentGrowthRate}%) below market expectations`);
  } else {
    trajectoryScore -= 25;
    details.push(`Negative growth (${currentGrowthRate}%) indicates declining business`);
  }
  
  // Evaluate growth ambition vs reality
  const growthGap = targetGrowthRate - currentGrowthRate;
  if (growthGap > 50) {
    trajectoryScore -= 20;
    details.push(`Large growth gap (${growthGap}pp) may be unrealistic without major transformation`);
  } else if (growthGap > 25) {
    trajectoryScore -= 10;
    details.push(`Significant growth gap (${growthGap}pp) requires aggressive growth strategy`);
  } else if (growthGap > 0) {
    trajectoryScore += 5;
    details.push(`Achievable growth target (${growthGap}pp increase) with focused execution`);
  }
  
  // Consider growth investment adequacy
  if (growthInvestment < 50000) {
    trajectoryScore -= 15;
    details.push(`Limited growth investment ($${(growthInvestment/1000).toFixed(0)}K) may constrain growth initiatives`);
  } else if (growthInvestment > 500000) {
    trajectoryScore += 10;
    details.push(`Substantial growth investment ($${(growthInvestment/1000).toFixed(0)}K) enables aggressive expansion`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, trajectoryScore)), 
    details 
  };
}

function analyzeMarketExpansion(context: GrowthContext): { score: number; details: string[] } {
  const { marketExpansion = 'regional', marketShare = 5, customerSegments = 2 } = context;
  
  let marketScore = 70; // Base score
  const details: string[] = [];
  
  // Assess market expansion scope
  const expansionScores = {
    'local': -10,
    'regional': 0,
    'national': 15,
    'global': 25
  };
  
  marketScore += expansionScores[marketExpansion];
  details.push(`Market expansion: ${marketExpansion} - ${marketExpansion === 'global' ? 'maximum market opportunity' : marketExpansion === 'local' ? 'limited market scope' : 'solid market coverage'}`);
  
  // Evaluate market share potential
  if (marketShare < 1) {
    marketScore += 20;
    details.push(`Low market share (${marketShare}%) indicates significant growth opportunity`);
  } else if (marketShare < 5) {
    marketScore += 10;
    details.push(`Small market share (${marketShare}%) provides good expansion potential`);
  } else if (marketShare > 25) {
    marketScore -= 15;
    details.push(`High market share (${marketShare}%) may limit organic growth opportunities`);
  }
  
  // Consider customer segment diversification
  if (customerSegments <= 1) {
    marketScore -= 15;
    details.push(`Single customer segment creates concentration risk and limits growth`);
  } else if (customerSegments >= 5) {
    marketScore += 10;
    details.push(`Multiple customer segments (${customerSegments}) provide diversified growth opportunities`);
  } else {
    details.push(`Moderate segment diversification (${customerSegments}) supports steady growth`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, marketScore)), 
    details 
  };
}

function analyzeCustomerGrowth(context: GrowthContext): { score: number; details: string[] } {
  const { customerRetention = 80, growthChannels = [] } = context;
  
  let customerScore = 70; // Base score
  const details: string[] = [];
  
  // Assess customer retention
  if (customerRetention >= 95) {
    customerScore += 20;
    details.push(`Excellent retention (${customerRetention}%) provides strong growth foundation`);
  } else if (customerRetention >= 85) {
    customerScore += 10;
    details.push(`Good retention (${customerRetention}%) supports sustainable growth`);
  } else if (customerRetention >= 75) {
    details.push(`Moderate retention (${customerRetention}%) adequate but improvable`);
  } else {
    customerScore -= 20;
    details.push(`Low retention (${customerRetention}%) undermines growth sustainability`);
  }
  
  // Evaluate growth channel diversity
  if (growthChannels.length === 0) {
    customerScore -= 20;
    details.push('No defined growth channels limits customer acquisition capability');
  } else if (growthChannels.length >= 5) {
    customerScore += 15;
    details.push(`Diverse growth channels (${growthChannels.length}) provide multiple acquisition paths`);
  } else if (growthChannels.length >= 3) {
    customerScore += 5;
    details.push(`Multiple growth channels (${growthChannels.length}) support steady acquisition`);
  } else {
    customerScore -= 5;
    details.push(`Limited growth channels (${growthChannels.length}) create acquisition concentration risk`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, customerScore)), 
    details 
  };
}

function analyzeScalability(context: GrowthContext): { score: number; details: string[] } {
  const { scalabilityIndex = 5, productPortfolio = 3 } = context;
  
  let scalabilityScore = scalabilityIndex * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess scalability readiness
  if (scalabilityIndex >= 8) {
    details.push(`High scalability (${scalabilityIndex}/10) enables rapid growth execution`);
  } else if (scalabilityIndex >= 6) {
    details.push(`Good scalability (${scalabilityIndex}/10) supports moderate growth`);
  } else if (scalabilityIndex >= 4) {
    scalabilityScore -= 10;
    details.push(`Limited scalability (${scalabilityIndex}/10) may constrain growth velocity`);
  } else {
    scalabilityScore -= 25;
    details.push(`Poor scalability (${scalabilityIndex}/10) prevents sustainable growth`);
  }
  
  // Evaluate product portfolio breadth
  if (productPortfolio >= 10) {
    scalabilityScore += 15;
    details.push(`Broad product portfolio (${productPortfolio} products) provides multiple growth vectors`);
  } else if (productPortfolio >= 5) {
    scalabilityScore += 5;
    details.push(`Moderate product portfolio (${productPortfolio} products) supports diversified growth`);
  } else if (productPortfolio <= 1) {
    scalabilityScore -= 15;
    details.push(`Single product creates growth concentration risk and limits expansion`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, scalabilityScore)), 
    details 
  };
}

function analyzeCompetitiveGrowth(context: GrowthContext): { score: number; details: string[] } {
  const { competitiveAdvantage = 'moderate', innovationPipeline = 'moderate' } = context;
  
  let competitiveScore = 70; // Base score
  const details: string[] = [];
  
  // Assess competitive advantage for growth
  const advantageScores = {
    'none': -25,
    'weak': -10,
    'moderate': 0,
    'strong': 20,
    'dominant': 30
  };
  
  competitiveScore += advantageScores[competitiveAdvantage];
  details.push(`Competitive advantage: ${competitiveAdvantage} - ${competitiveAdvantage === 'dominant' ? 'exceptional growth protection' : competitiveAdvantage === 'none' ? 'vulnerable to competitive pressure' : 'adequate competitive position'}`);
  
  // Evaluate innovation pipeline for future growth
  const pipelineScores = {
    'empty': -20,
    'limited': -5,
    'moderate': 5,
    'robust': 20
  };
  
  competitiveScore += pipelineScores[innovationPipeline];
  
  if (innovationPipeline === 'robust') {
    details.push('Robust innovation pipeline ensures sustainable future growth');
  } else if (innovationPipeline === 'empty') {
    details.push('Empty innovation pipeline threatens long-term growth sustainability');
  }
  
  return { 
    score: Math.max(0, Math.min(100, competitiveScore)), 
    details 
  };
}

async function generateCGROOutput(proposal: string, context: GrowthContext, analyses: any): Promise<CGROAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CGRO (Chief Growth & Revenue Officer) analyzing a business proposal from a growth strategy and revenue optimization perspective.

Your role is to assess:
- Growth trajectory and performance against targets
- Market expansion opportunities and penetration strategies
- Customer acquisition, retention, and expansion potential
- Scalability infrastructure and growth enablement
- Competitive positioning for sustainable growth
- Innovation pipeline and future growth drivers

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific growth recommendations.

Focus on sustainable growth, revenue optimization, and market expansion. Consider both immediate growth impact and long-term growth sustainability.`],
    ['human', `Proposal: {proposal}

Growth Context:
- Current Growth Rate: {currentGrowthRate}%
- Target Growth Rate: {targetGrowthRate}%
- Market Expansion: {marketExpansion}
- Customer Segments: {customerSegments}
- Product Portfolio: {productPortfolio}
- Scalability Index: {scalabilityIndex}/10
- Competitive Advantage: {competitiveAdvantage}
- Growth Investment: ${growthInvestment}
- Customer Retention: {customerRetention}%
- Market Share: {marketShare}%
- Growth Channels: {growthChannels}
- Innovation Pipeline: {innovationPipeline}

Analysis Results:
- Growth Trajectory: {trajectoryScore}/100 - {trajectoryDetails}
- Market Expansion: {marketScore}/100 - {marketDetails}
- Customer Growth: {customerScore}/100 - {customerDetails}
- Scalability: {scalabilityScore}/100 - {scalabilityDetails}
- Competitive Growth: {competitiveScore}/100 - {competitiveDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, growthConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      currentGrowthRate: context.currentGrowthRate || 'Not specified',
      targetGrowthRate: context.targetGrowthRate || 'Not specified',
      marketExpansion: context.marketExpansion || 'Not specified',
      customerSegments: context.customerSegments || 'Not specified',
      productPortfolio: context.productPortfolio || 'Not specified',
      scalabilityIndex: context.scalabilityIndex || 'Not specified',
      competitiveAdvantage: context.competitiveAdvantage || 'Not specified',
      growthInvestment: context.growthInvestment || 'Not specified',
      customerRetention: context.customerRetention || 'Not specified',
      marketShare: context.marketShare || 'Not specified',
      growthChannels: context.growthChannels?.join(', ') || 'Not specified',
      innovationPipeline: context.innovationPipeline || 'Not specified',
      trajectoryScore: analyses.trajectory.score,
      trajectoryDetails: analyses.trajectory.details.join('; '),
      marketScore: analyses.market.score,
      marketDetails: analyses.market.details.join('; '),
      customerScore: analyses.customer.score,
      customerDetails: analyses.customer.details.join('; '),
      scalabilityScore: analyses.scalability.score,
      scalabilityDetails: analyses.scalability.details.join('; '),
      competitiveScore: analyses.competitive.score,
      competitiveDetails: analyses.competitive.details.join('; ')
    }) },
    model: CGROAssessment,
    agentName: 'cgroAgent',
    defaultFactory: () => {
      const assessment = new CGROAssessment();
      assessment.reasoning = 'Error in generating growth analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.growthConcerns = ['Unable to complete full growth analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated growth context'];
      return assessment;
    }
  });
}