import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CSOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  strategyConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.strategyConcerns = [];
    this.recommendations = [];
  }
}

interface StrategyContext {
  strategicAlignment?: number; // 1-10 scale
  competitivePosition?: 'weak' | 'average' | 'strong' | 'dominant';
  marketTiming?: 'early' | 'optimal' | 'late' | 'missed';
  resourceAllocation?: 'insufficient' | 'adequate' | 'optimal' | 'excessive';
  strategicRisk?: 'low' | 'medium' | 'high' | 'critical';
  innovationLevel?: 'incremental' | 'substantial' | 'breakthrough' | 'disruptive';
  stakeholderAlignment?: number; // 1-10 scale
  executionComplexity?: 'low' | 'medium' | 'high' | 'extreme';
  strategicValue?: number; // 1-10 scale
  longTermImpact?: 'minimal' | 'moderate' | 'significant' | 'transformational';
  competitorResponse?: 'none' | 'minimal' | 'moderate' | 'aggressive';
}

/**
 * ## Agent Role
 * CSO focusing on strategic planning, competitive positioning, and long-term value creation
 * 
 * ## Core Principles
 * 1. Align initiatives with long-term strategic vision
 * 2. Maximize competitive advantage and market positioning
 * 3. Balance innovation with execution feasibility
 * 4. Ensure optimal resource allocation and strategic focus
 * 5. Create sustainable value and strategic differentiation
 * 
 * ## Analysis Framework
 * - Strategic Alignment: Evaluate fit with company vision and strategy
 * - Competitive Impact: Analyze competitive positioning implications
 * - Market Timing: Assess market readiness and timing optimization
 * - Resource Optimization: Evaluate resource allocation efficiency
 * - Innovation Value: Analyze innovation level and differentiation potential
 * - Execution Feasibility: Assess strategic implementation complexity
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "strategyConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function csoAgent(state: Record<string, any>, strategyContext: StrategyContext): Promise<CSOAssessment> {
  // Perform sub-analyses
  const alignmentAnalysis = analyzeStrategicAlignment(strategyContext);
  const competitiveAnalysis = analyzeCompetitiveImpact(strategyContext);
  const timingAnalysis = analyzeMarketTiming(strategyContext);
  const resourceAnalysis = analyzeResourceOptimization(strategyContext);
  const innovationAnalysis = analyzeInnovationValue(strategyContext);

  // Generate structured output
  return generateCSOOutput(state.proposal, strategyContext, {
    alignment: alignmentAnalysis,
    competitive: competitiveAnalysis,
    timing: timingAnalysis,
    resource: resourceAnalysis,
    innovation: innovationAnalysis
  });
}

function analyzeStrategicAlignment(context: StrategyContext): { score: number; details: string[] } {
  const { strategicAlignment = 5, stakeholderAlignment = 5, strategicValue = 5 } = context;
  
  let alignmentScore = strategicAlignment * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess strategic alignment
  if (strategicAlignment >= 8) {
    details.push(`Strong strategic alignment (${strategicAlignment}/10) supports long-term vision`);
  } else if (strategicAlignment >= 6) {
    details.push(`Good strategic alignment (${strategicAlignment}/10) fits company direction`);
  } else if (strategicAlignment >= 4) {
    alignmentScore -= 10;
    details.push(`Moderate strategic alignment (${strategicAlignment}/10) requires justification`);
  } else {
    alignmentScore -= 25;
    details.push(`Poor strategic alignment (${strategicAlignment}/10) conflicts with company strategy`);
  }
  
  // Evaluate stakeholder alignment
  if (stakeholderAlignment >= 8) {
    alignmentScore += 15;
    details.push(`High stakeholder alignment (${stakeholderAlignment}/10) ensures execution support`);
  } else if (stakeholderAlignment >= 6) {
    alignmentScore += 5;
    details.push(`Good stakeholder alignment (${stakeholderAlignment}/10) provides adequate support`);
  } else {
    alignmentScore -= 15;
    details.push(`Low stakeholder alignment (${stakeholderAlignment}/10) creates execution risks`);
  }
  
  // Consider strategic value
  if (strategicValue >= 8) {
    alignmentScore += 10;
    details.push(`High strategic value (${strategicValue}/10) creates significant competitive advantage`);
  } else if (strategicValue < 4) {
    alignmentScore -= 10;
    details.push(`Low strategic value (${strategicValue}/10) questions investment priority`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, alignmentScore)), 
    details 
  };
}

function analyzeCompetitiveImpact(context: StrategyContext): { score: number; details: string[] } {
  const { competitivePosition = 'average', competitorResponse = 'moderate', innovationLevel = 'incremental' } = context;
  
  let competitiveScore = 70; // Base score
  const details: string[] = [];
  
  // Assess current competitive position
  const positionScores = {
    'weak': -20,
    'average': 0,
    'strong': 15,
    'dominant': 25
  };
  
  competitiveScore += positionScores[competitivePosition];
  details.push(`Competitive position: ${competitivePosition} - ${competitivePosition === 'dominant' ? 'excellent market leadership' : competitivePosition === 'weak' ? 'requires competitive strengthening' : 'solid market position'}`);
  
  // Evaluate competitor response risk
  const responseImpact = {
    'none': 15,
    'minimal': 10,
    'moderate': 0,
    'aggressive': -15
  };
  
  competitiveScore += responseImpact[competitorResponse];
  
  if (competitorResponse === 'aggressive') {
    details.push('Aggressive competitor response expected - requires defensive strategy');
  } else if (competitorResponse === 'none') {
    details.push('No competitor response expected - provides first-mover advantage');
  }
  
  // Consider innovation differentiation
  const innovationImpact = {
    'incremental': 0,
    'substantial': 10,
    'breakthrough': 20,
    'disruptive': 30
  };
  
  competitiveScore += innovationImpact[innovationLevel];
  
  if (innovationLevel === 'disruptive') {
    details.push('Disruptive innovation creates significant competitive moats');
  } else if (innovationLevel === 'incremental') {
    details.push('Incremental innovation provides limited competitive differentiation');
  }
  
  return { 
    score: Math.max(0, Math.min(100, competitiveScore)), 
    details 
  };
}

function analyzeMarketTiming(context: StrategyContext): { score: number; details: string[] } {
  const { marketTiming = 'optimal', strategicRisk = 'medium' } = context;
  
  let timingScore = 70; // Base score
  const details: string[] = [];
  
  // Assess market timing
  const timingScores = {
    'early': 5,
    'optimal': 25,
    'late': -10,
    'missed': -30
  };
  
  timingScore += timingScores[marketTiming];
  details.push(`Market timing: ${marketTiming} - ${marketTiming === 'optimal' ? 'perfect market entry timing' : marketTiming === 'missed' ? 'market opportunity has passed' : marketTiming === 'early' ? 'may need market development' : 'competitive timing pressure'}`);
  
  // Consider strategic risk in timing context
  const riskImpact = {
    'low': 10,
    'medium': 0,
    'high': -15,
    'critical': -25
  };
  
  timingScore += riskImpact[strategicRisk];
  
  if (strategicRisk === 'critical' && marketTiming !== 'optimal') {
    timingScore -= 10;
    details.push('Critical risk with suboptimal timing creates compound strategic challenges');
  }
  
  return { 
    score: Math.max(0, Math.min(100, timingScore)), 
    details 
  };
}

function analyzeResourceOptimization(context: StrategyContext): { score: number; details: string[] } {
  const { resourceAllocation = 'adequate', executionComplexity = 'medium' } = context;
  
  let resourceScore = 70; // Base score
  const details: string[] = [];
  
  // Assess resource allocation
  const allocationScores = {
    'insufficient': -25,
    'adequate': 0,
    'optimal': 20,
    'excessive': -10
  };
  
  resourceScore += allocationScores[resourceAllocation];
  details.push(`Resource allocation: ${resourceAllocation} - ${resourceAllocation === 'optimal' ? 'perfect resource optimization' : resourceAllocation === 'insufficient' ? 'under-resourced for success' : resourceAllocation === 'excessive' ? 'over-investment reduces efficiency' : 'sufficient for execution'}`);
  
  // Evaluate execution complexity
  const complexityImpact = {
    'low': 15,
    'medium': 0,
    'high': -15,
    'extreme': -25
  };
  
  resourceScore += complexityImpact[executionComplexity];
  
  if (executionComplexity === 'extreme') {
    details.push('Extreme execution complexity requires exceptional resource management');
  } else if (executionComplexity === 'low') {
    details.push('Low execution complexity enables efficient resource utilization');
  }
  
  // Check resource-complexity alignment
  if (resourceAllocation === 'insufficient' && executionComplexity === 'high') {
    resourceScore -= 15;
    details.push('Insufficient resources for high complexity creates execution failure risk');
  }
  
  return { 
    score: Math.max(0, Math.min(100, resourceScore)), 
    details 
  };
}

function analyzeInnovationValue(context: StrategyContext): { score: number; details: string[] } {
  const { innovationLevel = 'incremental', longTermImpact = 'moderate', strategicValue = 5 } = context;
  
  let innovationScore = 60; // Base score
  const details: string[] = [];
  
  // Assess innovation level
  const innovationScores = {
    'incremental': 0,
    'substantial': 15,
    'breakthrough': 25,
    'disruptive': 35
  };
  
  innovationScore += innovationScores[innovationLevel];
  details.push(`Innovation level: ${innovationLevel} - ${innovationLevel === 'disruptive' ? 'market-changing innovation potential' : innovationLevel === 'incremental' ? 'limited innovation differentiation' : 'meaningful innovation advancement'}`);
  
  // Evaluate long-term impact
  const impactScores = {
    'minimal': -10,
    'moderate': 0,
    'significant': 15,
    'transformational': 25
  };
  
  innovationScore += impactScores[longTermImpact];
  
  if (longTermImpact === 'transformational') {
    details.push('Transformational impact creates lasting competitive advantages');
  } else if (longTermImpact === 'minimal') {
    details.push('Minimal long-term impact questions strategic investment value');
  }
  
  // Consider strategic value alignment
  if (strategicValue >= 8 && innovationLevel === 'disruptive') {
    innovationScore += 10;
    details.push('High strategic value with disruptive innovation creates exceptional opportunity');
  }
  
  return { 
    score: Math.max(0, Math.min(100, innovationScore)), 
    details 
  };
}

async function generateCSOOutput(proposal: string, context: StrategyContext, analyses: any): Promise<CSOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CSO (Chief Strategy Officer) analyzing a business proposal from a strategic planning and competitive positioning perspective.

Your role is to assess:
- Strategic alignment with company vision and long-term goals
- Competitive positioning and market advantage implications
- Market timing and strategic opportunity assessment
- Resource allocation optimization and strategic focus
- Innovation value and differentiation potential
- Long-term strategic impact and value creation

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific strategic recommendations.

Focus on strategic value creation, competitive advantage, and long-term positioning. Consider both immediate strategic impact and sustainable competitive differentiation.`],
    ['human', `Proposal: {proposal}

Strategy Context:
- Strategic Alignment: {strategicAlignment}/10
- Competitive Position: {competitivePosition}
- Market Timing: {marketTiming}
- Resource Allocation: {resourceAllocation}
- Strategic Risk: {strategicRisk}
- Innovation Level: {innovationLevel}
- Stakeholder Alignment: {stakeholderAlignment}/10
- Execution Complexity: {executionComplexity}
- Strategic Value: {strategicValue}/10
- Long-term Impact: {longTermImpact}
- Competitor Response: {competitorResponse}

Analysis Results:
- Strategic Alignment: {alignmentScore}/100 - {alignmentDetails}
- Competitive Impact: {competitiveScore}/100 - {competitiveDetails}
- Market Timing: {timingScore}/100 - {timingDetails}
- Resource Optimization: {resourceScore}/100 - {resourceDetails}
- Innovation Value: {innovationScore}/100 - {innovationDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, strategyConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      strategicAlignment: context.strategicAlignment || 'Not specified',
      competitivePosition: context.competitivePosition || 'Not specified',
      marketTiming: context.marketTiming || 'Not specified',
      resourceAllocation: context.resourceAllocation || 'Not specified',
      strategicRisk: context.strategicRisk || 'Not specified',
      innovationLevel: context.innovationLevel || 'Not specified',
      stakeholderAlignment: context.stakeholderAlignment || 'Not specified',
      executionComplexity: context.executionComplexity || 'Not specified',
      strategicValue: context.strategicValue || 'Not specified',
      longTermImpact: context.longTermImpact || 'Not specified',
      competitorResponse: context.competitorResponse || 'Not specified',
      alignmentScore: analyses.alignment.score,
      alignmentDetails: analyses.alignment.details.join('; '),
      competitiveScore: analyses.competitive.score,
      competitiveDetails: analyses.competitive.details.join('; '),
      timingScore: analyses.timing.score,
      timingDetails: analyses.timing.details.join('; '),
      resourceScore: analyses.resource.score,
      resourceDetails: analyses.resource.details.join('; '),
      innovationScore: analyses.innovation.score,
      innovationDetails: analyses.innovation.details.join('; ')
    }) },
    model: CSOAssessment,
    agentName: 'csoAgent',
    defaultFactory: () => {
      const assessment = new CSOAssessment();
      assessment.reasoning = 'Error in generating strategy analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.strategyConcerns = ['Unable to complete full strategy analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated strategy context'];
      return assessment;
    }
  });
}