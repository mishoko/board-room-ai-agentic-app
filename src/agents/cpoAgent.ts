import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CPOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  productConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.productConcerns = [];
    this.recommendations = [];
  }
}

interface ProductContext {
  userResearch?: string[];
  productMarketFit?: number; // 1-10 scale
  featureComplexity?: 'low' | 'medium' | 'high';
  developmentTimeline?: number; // months
  userExperienceImpact?: 'positive' | 'neutral' | 'negative';
  competitiveAdvantage?: string[];
  technicalFeasibility?: number; // 1-10 scale
  userAdoptionRisk?: 'low' | 'medium' | 'high';
  productStrategy?: string;
  metricsImpact?: string[];
}

/**
 * ## Agent Role
 * CPO focusing on product strategy, user experience, and market fit validation
 * 
 * ## Core Principles
 * 1. Prioritize user-centric design and product-market fit
 * 2. Assess feature value against development complexity
 * 3. Evaluate competitive positioning and differentiation
 * 4. Ensure sustainable product growth and adoption
 * 5. Balance innovation with user experience consistency
 * 
 * ## Analysis Framework
 * - User Research: Evaluate user needs and validation data
 * - Product-Market Fit: Assess alignment with market demands
 * - Feature Analysis: Analyze feature complexity vs value
 * - UX Impact: Evaluate user experience implications
 * - Competitive Position: Assess differentiation and advantages
 * - Adoption Risk: Analyze user adoption and retention factors
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "productConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cpoAgent(state: Record<string, any>, productContext: ProductContext): Promise<CPOAssessment> {
  // Perform sub-analyses
  const userResearchAnalysis = analyzeUserResearch(productContext);
  const productMarketFitAnalysis = analyzeProductMarketFit(productContext);
  const featureAnalysis = analyzeFeatureComplexity(productContext);
  const uxAnalysis = analyzeUserExperience(productContext);
  const competitiveAnalysis = analyzeCompetitiveAdvantage(productContext);
  const adoptionAnalysis = analyzeAdoptionRisk(productContext);

  // Generate structured output
  return generateCPOOutput(state.proposal, productContext, {
    userResearch: userResearchAnalysis,
    productMarketFit: productMarketFitAnalysis,
    feature: featureAnalysis,
    ux: uxAnalysis,
    competitive: competitiveAnalysis,
    adoption: adoptionAnalysis
  });
}

function analyzeUserResearch(context: ProductContext): { score: number; details: string[] } {
  const { userResearch = [] } = context;
  
  let researchScore = 50; // Base score
  const details: string[] = [];
  
  if (userResearch.length === 0) {
    researchScore -= 25;
    details.push('No user research data available - product decisions lack user validation');
  } else {
    // Analyze quality of research insights
    const qualitativeInsights = userResearch.filter(research =>
      research.toLowerCase().includes('interview') ||
      research.toLowerCase().includes('survey') ||
      research.toLowerCase().includes('feedback') ||
      research.toLowerCase().includes('usability')
    );
    
    const quantitativeData = userResearch.filter(research =>
      research.toLowerCase().includes('analytics') ||
      research.toLowerCase().includes('metrics') ||
      research.toLowerCase().includes('data') ||
      research.toLowerCase().includes('conversion')
    );
    
    if (qualitativeInsights.length > 0 && quantitativeData.length > 0) {
      researchScore += 25;
      details.push('Comprehensive user research with both qualitative and quantitative insights');
    } else if (qualitativeInsights.length > 0) {
      researchScore += 15;
      details.push('Good qualitative user research - consider adding quantitative validation');
    } else if (quantitativeData.length > 0) {
      researchScore += 10;
      details.push('Quantitative data available - needs qualitative user insights');
    }
    
    // Check for recent research
    const recentResearch = userResearch.filter(research =>
      research.toLowerCase().includes('recent') ||
      research.toLowerCase().includes('current') ||
      research.toLowerCase().includes('latest')
    );
    
    if (recentResearch.length > 0) {
      researchScore += 10;
      details.push('Recent user research ensures current market understanding');
    }
    
    details.push(`User research analysis: ${userResearch.length} research sources reviewed`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, researchScore)), 
    details 
  };
}

function analyzeProductMarketFit(context: ProductContext): { score: number; details: string[] } {
  const { productMarketFit = 5, productStrategy = '' } = context;
  
  let fitScore = productMarketFit * 10; // Convert 1-10 scale to percentage
  const details: string[] = [];
  
  // Assess product-market fit score
  if (productMarketFit >= 8) {
    details.push(`Strong product-market fit (${productMarketFit}/10) indicates high user demand`);
  } else if (productMarketFit >= 6) {
    details.push(`Moderate product-market fit (${productMarketFit}/10) shows potential with optimization`);
  } else if (productMarketFit >= 4) {
    fitScore -= 10;
    details.push(`Weak product-market fit (${productMarketFit}/10) requires significant product iteration`);
  } else {
    fitScore -= 25;
    details.push(`Poor product-market fit (${productMarketFit}/10) suggests fundamental product issues`);
  }
  
  // Evaluate product strategy alignment
  const strategyKeywords = ['differentiation', 'unique', 'value proposition', 'competitive advantage'];
  const hasStrategy = strategyKeywords.some(keyword => 
    productStrategy.toLowerCase().includes(keyword)
  );
  
  if (hasStrategy) {
    fitScore += 10;
    details.push('Clear product strategy with differentiation focus');
  } else if (productStrategy.length > 0) {
    details.push('Product strategy defined but lacks clear differentiation');
  } else {
    fitScore -= 15;
    details.push('Missing product strategy creates market positioning risks');
  }
  
  return { 
    score: Math.max(0, Math.min(100, fitScore)), 
    details 
  };
}

function analyzeFeatureComplexity(context: ProductContext): { score: number; details: string[] } {
  const { featureComplexity = 'medium', developmentTimeline = 6, technicalFeasibility = 5 } = context;
  
  let complexityScore = 70; // Base score
  const details: string[] = [];
  
  // Assess feature complexity
  const complexityImpact = {
    'low': 15,
    'medium': 0,
    'high': -20
  };
  
  complexityScore += complexityImpact[featureComplexity];
  details.push(`Feature complexity: ${featureComplexity} - ${featureComplexity === 'high' ? 'requires careful scope management' : 'manageable development effort'}`);
  
  // Evaluate development timeline realism
  if (featureComplexity === 'high' && developmentTimeline <= 3) {
    complexityScore -= 25;
    details.push(`High complexity with short timeline (${developmentTimeline} months) creates delivery risk`);
  } else if (featureComplexity === 'low' && developmentTimeline > 6) {
    complexityScore -= 10;
    details.push(`Simple features with long timeline (${developmentTimeline} months) may indicate inefficiency`);
  }
  
  // Factor in technical feasibility
  if (technicalFeasibility < 5) {
    complexityScore -= 20;
    details.push(`Low technical feasibility (${technicalFeasibility}/10) increases development risk`);
  } else if (technicalFeasibility >= 8) {
    complexityScore += 10;
    details.push(`High technical feasibility (${technicalFeasibility}/10) supports reliable delivery`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, complexityScore)), 
    details 
  };
}

function analyzeUserExperience(context: ProductContext): { score: number; details: string[] } {
  const { userExperienceImpact = 'neutral', metricsImpact = [] } = context;
  
  let uxScore = 60; // Base score
  const details: string[] = [];
  
  // Assess UX impact
  const uxImpact = {
    'positive': 25,
    'neutral': 0,
    'negative': -30
  };
  
  uxScore += uxImpact[userExperienceImpact];
  details.push(`User experience impact: ${userExperienceImpact} - ${userExperienceImpact === 'negative' ? 'requires UX mitigation strategy' : 'supports user satisfaction'}`);
  
  // Evaluate metrics impact
  if (metricsImpact.length > 0) {
    const positiveMetrics = metricsImpact.filter(metric =>
      metric.toLowerCase().includes('increase') ||
      metric.toLowerCase().includes('improve') ||
      metric.toLowerCase().includes('enhance') ||
      metric.toLowerCase().includes('boost')
    );
    
    const negativeMetrics = metricsImpact.filter(metric =>
      metric.toLowerCase().includes('decrease') ||
      metric.toLowerCase().includes('reduce') ||
      metric.toLowerCase().includes('worsen') ||
      metric.toLowerCase().includes('decline')
    );
    
    if (positiveMetrics.length > negativeMetrics.length) {
      uxScore += 15;
      details.push(`Positive metrics impact expected: ${positiveMetrics.join(', ')}`);
    } else if (negativeMetrics.length > positiveMetrics.length) {
      uxScore -= 15;
      details.push(`Concerning metrics impact: ${negativeMetrics.join(', ')}`);
    }
  } else {
    uxScore -= 10;
    details.push('No metrics impact analysis - difficult to measure success');
  }
  
  return { 
    score: Math.max(0, Math.min(100, uxScore)), 
    details 
  };
}

function analyzeCompetitiveAdvantage(context: ProductContext): { score: number; details: string[] } {
  const { competitiveAdvantage = [] } = context;
  
  let competitiveScore = 60; // Base score
  const details: string[] = [];
  
  if (competitiveAdvantage.length === 0) {
    competitiveScore -= 20;
    details.push('No competitive advantages identified - product may lack differentiation');
  } else {
    // Analyze strength of competitive advantages
    const strongAdvantages = competitiveAdvantage.filter(advantage =>
      advantage.toLowerCase().includes('unique') ||
      advantage.toLowerCase().includes('proprietary') ||
      advantage.toLowerCase().includes('patent') ||
      advantage.toLowerCase().includes('exclusive')
    );
    
    const moderateAdvantages = competitiveAdvantage.filter(advantage =>
      advantage.toLowerCase().includes('better') ||
      advantage.toLowerCase().includes('faster') ||
      advantage.toLowerCase().includes('cheaper') ||
      advantage.toLowerCase().includes('easier')
    );
    
    if (strongAdvantages.length > 0) {
      competitiveScore += 25;
      details.push(`Strong competitive advantages: ${strongAdvantages.join(', ')}`);
    }
    
    if (moderateAdvantages.length > 0) {
      competitiveScore += 10;
      details.push(`Moderate competitive advantages: ${moderateAdvantages.join(', ')}`);
    }
    
    // Check for sustainable advantages
    const sustainableAdvantages = competitiveAdvantage.filter(advantage =>
      advantage.toLowerCase().includes('network effect') ||
      advantage.toLowerCase().includes('data advantage') ||
      advantage.toLowerCase().includes('platform') ||
      advantage.toLowerCase().includes('ecosystem')
    );
    
    if (sustainableAdvantages.length > 0) {
      competitiveScore += 15;
      details.push(`Sustainable competitive advantages identified: ${sustainableAdvantages.join(', ')}`);
    }
  }
  
  return { 
    score: Math.max(0, Math.min(100, competitiveScore)), 
    details 
  };
}

function analyzeAdoptionRisk(context: ProductContext): { score: number; details: string[] } {
  const { userAdoptionRisk = 'medium', userExperienceImpact = 'neutral', featureComplexity = 'medium' } = context;
  
  let adoptionScore = 70; // Base score (higher is better)
  const details: string[] = [];
  
  // Assess stated adoption risk
  const riskImpact = {
    'low': 15,
    'medium': 0,
    'high': -25
  };
  
  adoptionScore += riskImpact[userAdoptionRisk];
  details.push(`User adoption risk: ${userAdoptionRisk} - ${userAdoptionRisk === 'high' ? 'requires comprehensive adoption strategy' : 'manageable with standard onboarding'}`);
  
  // Factor in UX impact on adoption
  if (userExperienceImpact === 'negative') {
    adoptionScore -= 20;
    details.push('Negative UX impact significantly increases adoption risk');
  } else if (userExperienceImpact === 'positive') {
    adoptionScore += 10;
    details.push('Positive UX impact supports user adoption');
  }
  
  // Consider complexity impact on adoption
  if (featureComplexity === 'high') {
    adoptionScore -= 15;
    details.push('High feature complexity may create adoption barriers');
  } else if (featureComplexity === 'low') {
    adoptionScore += 5;
    details.push('Low complexity supports easy user adoption');
  }
  
  return { 
    score: Math.max(0, Math.min(100, adoptionScore)), 
    details 
  };
}

async function generateCPOOutput(proposal: string, context: ProductContext, analyses: any): Promise<CPOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CPO analyzing a business proposal from a product strategy and user experience perspective.

Your role is to assess:
- User research validation and market demand
- Product-market fit and strategic alignment
- Feature complexity and development feasibility
- User experience impact and adoption factors
- Competitive positioning and differentiation
- Product metrics and success measurement

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific product recommendations.

Focus on user-centric analysis, product strategy, and sustainable growth. Consider both immediate product impact and long-term product vision.`],
    ['human', `Proposal: {proposal}

Product Context:
- User Research: {userResearch}
- Product-Market Fit: {productMarketFit}/10
- Feature Complexity: {featureComplexity}
- Development Timeline: {developmentTimeline} months
- User Experience Impact: {userExperienceImpact}
- Competitive Advantage: {competitiveAdvantage}
- Technical Feasibility: {technicalFeasibility}/10
- User Adoption Risk: {userAdoptionRisk}
- Product Strategy: {productStrategy}
- Metrics Impact: {metricsImpact}

Analysis Results:
- User Research: {userResearchScore}/100 - {userResearchDetails}
- Product-Market Fit: {productMarketFitScore}/100 - {productMarketFitDetails}
- Feature Analysis: {featureScore}/100 - {featureDetails}
- User Experience: {uxScore}/100 - {uxDetails}
- Competitive Advantage: {competitiveScore}/100 - {competitiveDetails}
- Adoption Risk: {adoptionScore}/100 - {adoptionDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, productConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      userResearch: context.userResearch?.join('; ') || 'Not specified',
      productMarketFit: context.productMarketFit || 'Not specified',
      featureComplexity: context.featureComplexity || 'Not specified',
      developmentTimeline: context.developmentTimeline || 'Not specified',
      userExperienceImpact: context.userExperienceImpact || 'Not specified',
      competitiveAdvantage: context.competitiveAdvantage?.join('; ') || 'Not specified',
      technicalFeasibility: context.technicalFeasibility || 'Not specified',
      userAdoptionRisk: context.userAdoptionRisk || 'Not specified',
      productStrategy: context.productStrategy || 'Not specified',
      metricsImpact: context.metricsImpact?.join('; ') || 'Not specified',
      userResearchScore: analyses.userResearch.score,
      userResearchDetails: analyses.userResearch.details.join('; '),
      productMarketFitScore: analyses.productMarketFit.score,
      productMarketFitDetails: analyses.productMarketFit.details.join('; '),
      featureScore: analyses.feature.score,
      featureDetails: analyses.feature.details.join('; '),
      uxScore: analyses.ux.score,
      uxDetails: analyses.ux.details.join('; '),
      competitiveScore: analyses.competitive.score,
      competitiveDetails: analyses.competitive.details.join('; '),
      adoptionScore: analyses.adoption.score,
      adoptionDetails: analyses.adoption.details.join('; ')
    }) },
    model: CPOAssessment,
    agentName: 'cpoAgent',
    defaultFactory: () => {
      const assessment = new CPOAssessment();
      assessment.reasoning = 'Error in generating product analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.productConcerns = ['Unable to complete full product analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated product context'];
      return assessment;
    }
  });
}