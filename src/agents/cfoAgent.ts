import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CFOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  financialConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.financialConcerns = [];
    this.recommendations = [];
  }
}

interface FinancialContext {
  projectBudget?: number;
  expectedROI?: number;
  paybackPeriod?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  cashFlowImpact?: number;
  operationalCosts?: number;
  revenueProjections?: number[];
  marketConditions?: string;
  competitorSpending?: number;
}

/**
 * ## Agent Role
 * CFO focusing on financial viability, risk assessment, and capital allocation optimization
 * 
 * ## Core Principles
 * 1. Prioritize sustainable financial growth over short-term gains
 * 2. Assess risk-adjusted returns and capital efficiency
 * 3. Evaluate cash flow implications and liquidity impact
 * 4. Ensure compliance with financial covenants and regulations
 * 5. Balance growth investments with profitability requirements
 * 
 * ## Analysis Framework
 * - ROI Analysis: Evaluate return on investment and payback periods
 * - Risk Assessment: Analyze financial risks and mitigation strategies
 * - Cash Flow Impact: Assess working capital and liquidity implications
 * - Budget Alignment: Evaluate fit within current budget constraints
 * - Market Viability: Assess revenue projections against market conditions
 * - Cost Structure: Analyze operational and capital expenditure requirements
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "financialConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cfoAgent(state: Record<string, any>, financialContext: FinancialContext): Promise<CFOAssessment> {
  // Perform sub-analyses
  const roiAnalysis = analyzeROI(financialContext);
  const riskAnalysis = analyzeFinancialRisk(financialContext);
  const cashFlowAnalysis = analyzeCashFlow(financialContext);
  const budgetAnalysis = analyzeBudgetAlignment(financialContext);
  const marketAnalysis = analyzeMarketViability(financialContext);

  // Generate structured output
  return generateCFOOutput(state.proposal, financialContext, {
    roi: roiAnalysis,
    risk: riskAnalysis,
    cashFlow: cashFlowAnalysis,
    budget: budgetAnalysis,
    market: marketAnalysis
  });
}

function analyzeROI(context: FinancialContext): { score: number; details: string[] } {
  const { expectedROI = 0, paybackPeriod = 36, projectBudget = 0 } = context;
  
  let roiScore = 50; // Base score
  const details: string[] = [];
  
  // Evaluate ROI percentage
  if (expectedROI > 25) {
    roiScore += 30;
    details.push(`Strong ROI projection: ${expectedROI}% exceeds target thresholds`);
  } else if (expectedROI > 15) {
    roiScore += 15;
    details.push(`Acceptable ROI: ${expectedROI}% meets minimum requirements`);
  } else if (expectedROI > 0) {
    roiScore -= 10;
    details.push(`Low ROI: ${expectedROI}% below optimal investment threshold`);
  } else {
    roiScore -= 30;
    details.push(`Negative or unclear ROI projection raises investment concerns`);
  }
  
  // Assess payback period
  if (paybackPeriod <= 12) {
    roiScore += 20;
    details.push(`Excellent payback period: ${paybackPeriod} months`);
  } else if (paybackPeriod <= 24) {
    roiScore += 10;
    details.push(`Acceptable payback period: ${paybackPeriod} months`);
  } else if (paybackPeriod <= 36) {
    roiScore -= 5;
    details.push(`Extended payback period: ${paybackPeriod} months increases risk`);
  } else {
    roiScore -= 20;
    details.push(`Long payback period: ${paybackPeriod} months may strain capital allocation`);
  }
  
  // Consider investment size
  if (projectBudget > 1000000) {
    roiScore -= 10;
    details.push(`Large capital requirement: $${(projectBudget/1000000).toFixed(1)}M requires board approval`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, roiScore)), 
    details 
  };
}

function analyzeFinancialRisk(context: FinancialContext): { score: number; details: string[] } {
  const { riskLevel = 'medium', marketConditions = 'stable', revenueProjections = [] } = context;
  
  let riskScore = 70; // Base score (higher is better)
  const details: string[] = [];
  
  // Assess stated risk level
  const riskImpact = {
    'low': 10,
    'medium': 0,
    'high': -25
  };
  
  riskScore += riskImpact[riskLevel];
  details.push(`Project risk level: ${riskLevel} - ${riskLevel === 'high' ? 'requires enhanced monitoring' : 'manageable with standard controls'}`);
  
  // Evaluate market conditions
  const marketImpact = {
    'favorable': 15,
    'stable': 0,
    'uncertain': -15,
    'declining': -25
  };
  
  riskScore += marketImpact[marketConditions.toLowerCase()] || 0;
  if (marketConditions !== 'stable' && marketConditions !== 'favorable') {
    details.push(`Market conditions (${marketConditions}) add external risk factors`);
  }
  
  // Assess revenue projection volatility
  if (revenueProjections.length > 1) {
    const variance = calculateVariance(revenueProjections);
    if (variance > 0.3) {
      riskScore -= 15;
      details.push(`High revenue projection variance indicates execution uncertainty`);
    }
  }
  
  return { 
    score: Math.max(0, Math.min(100, riskScore)), 
    details 
  };
}

function analyzeCashFlow(context: FinancialContext): { score: number; details: string[] } {
  const { cashFlowImpact = 0, operationalCosts = 0, projectBudget = 0 } = context;
  
  let cashFlowScore = 70; // Base score
  const details: string[] = [];
  
  // Assess immediate cash flow impact
  if (cashFlowImpact < 0) {
    const impactRatio = Math.abs(cashFlowImpact) / (projectBudget || 1);
    if (impactRatio > 0.5) {
      cashFlowScore -= 30;
      details.push(`Significant negative cash flow impact: ${(impactRatio * 100).toFixed(1)}% of project budget`);
    } else if (impactRatio > 0.2) {
      cashFlowScore -= 15;
      details.push(`Moderate cash flow impact requires liquidity planning`);
    }
  } else if (cashFlowImpact > 0) {
    cashFlowScore += 15;
    details.push(`Positive cash flow impact improves liquidity position`);
  }
  
  // Evaluate operational cost burden
  if (operationalCosts > 0) {
    const costRatio = operationalCosts / (projectBudget || 1);
    if (costRatio > 0.3) {
      cashFlowScore -= 20;
      details.push(`High ongoing operational costs: ${(costRatio * 100).toFixed(1)}% of initial investment`);
    }
  }
  
  return { 
    score: Math.max(0, Math.min(100, cashFlowScore)), 
    details 
  };
}

function analyzeBudgetAlignment(context: FinancialContext): { score: number; details: string[] } {
  const { projectBudget = 0, operationalCosts = 0 } = context;
  
  let budgetScore = 75; // Base score
  const details: string[] = [];
  
  // Assess budget size relative to typical projects
  if (projectBudget > 5000000) {
    budgetScore -= 20;
    details.push(`Large budget requirement: $${(projectBudget/1000000).toFixed(1)}M requires comprehensive justification`);
  } else if (projectBudget > 1000000) {
    budgetScore -= 10;
    details.push(`Significant investment: $${(projectBudget/1000000).toFixed(1)}M needs careful monitoring`);
  }
  
  // Consider total cost of ownership
  const totalCost = projectBudget + (operationalCosts * 12); // Assume annual operational costs
  if (totalCost > projectBudget * 1.5) {
    budgetScore -= 15;
    details.push(`High total cost of ownership: operational costs significantly impact budget`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, budgetScore)), 
    details 
  };
}

function analyzeMarketViability(context: FinancialContext): { score: number; details: string[] } {
  const { revenueProjections = [], marketConditions = 'stable', competitorSpending = 0 } = context;
  
  let marketScore = 70; // Base score
  const details: string[] = [];
  
  // Assess revenue growth trajectory
  if (revenueProjections.length > 1) {
    const growthRate = calculateGrowthRate(revenueProjections);
    if (growthRate > 0.2) {
      marketScore += 20;
      details.push(`Strong revenue growth projection: ${(growthRate * 100).toFixed(1)}% annually`);
    } else if (growthRate > 0.1) {
      marketScore += 10;
      details.push(`Moderate revenue growth expected: ${(growthRate * 100).toFixed(1)}% annually`);
    } else if (growthRate < 0) {
      marketScore -= 25;
      details.push(`Declining revenue projections raise market viability concerns`);
    }
  }
  
  // Consider competitive spending
  if (competitorSpending > 0) {
    // Assume our project budget should be competitive
    const competitiveRatio = (context.projectBudget || 0) / competitorSpending;
    if (competitiveRatio < 0.5) {
      marketScore -= 20;
      details.push(`Investment below competitive levels may limit market impact`);
    } else if (competitiveRatio > 2) {
      marketScore -= 10;
      details.push(`Investment significantly above competitors requires justification`);
    }
  }
  
  return { 
    score: Math.max(0, Math.min(100, marketScore)), 
    details 
  };
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean; // Coefficient of variation
}

function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const periods = values.length - 1;
  return Math.pow(lastValue / firstValue, 1 / periods) - 1;
}

async function generateCFOOutput(proposal: string, context: FinancialContext, analyses: any): Promise<CFOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CFO analyzing a business proposal from a financial and risk management perspective.

Your role is to assess:
- Financial viability and return on investment
- Risk factors and mitigation strategies
- Cash flow and liquidity implications
- Budget alignment and capital allocation efficiency
- Market conditions and revenue sustainability
- Compliance and regulatory financial requirements

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific financial recommendations.

Focus on quantitative analysis, risk-adjusted returns, and sustainable financial growth. Consider both immediate financial impact and long-term financial health.`],
    ['human', `Proposal: {proposal}

Financial Context:
- Project Budget: ${projectBudget}
- Expected ROI: {expectedROI}%
- Payback Period: {paybackPeriod} months
- Risk Level: {riskLevel}
- Cash Flow Impact: ${cashFlowImpact}
- Operational Costs: ${operationalCosts}
- Revenue Projections: {revenueProjections}
- Market Conditions: {marketConditions}
- Competitor Spending: ${competitorSpending}

Analysis Results:
- ROI Analysis: {roiScore}/100 - {roiDetails}
- Risk Assessment: {riskScore}/100 - {riskDetails}
- Cash Flow Impact: {cashFlowScore}/100 - {cashFlowDetails}
- Budget Alignment: {budgetScore}/100 - {budgetDetails}
- Market Viability: {marketScore}/100 - {marketDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, financialConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      projectBudget: context.projectBudget || 'Not specified',
      expectedROI: context.expectedROI || 'Not specified',
      paybackPeriod: context.paybackPeriod || 'Not specified',
      riskLevel: context.riskLevel || 'Not specified',
      cashFlowImpact: context.cashFlowImpact || 'Not specified',
      operationalCosts: context.operationalCosts || 'Not specified',
      revenueProjections: context.revenueProjections?.join(', ') || 'Not specified',
      marketConditions: context.marketConditions || 'Not specified',
      competitorSpending: context.competitorSpending || 'Not specified',
      roiScore: analyses.roi.score,
      roiDetails: analyses.roi.details.join('; '),
      riskScore: analyses.risk.score,
      riskDetails: analyses.risk.details.join('; '),
      cashFlowScore: analyses.cashFlow.score,
      cashFlowDetails: analyses.cashFlow.details.join('; '),
      budgetScore: analyses.budget.score,
      budgetDetails: analyses.budget.details.join('; '),
      marketScore: analyses.market.score,
      marketDetails: analyses.market.details.join('; ')
    }) },
    model: CFOAssessment,
    agentName: 'cfoAgent',
    defaultFactory: () => {
      const assessment = new CFOAssessment();
      assessment.reasoning = 'Error in generating financial analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.financialConcerns = ['Unable to complete full financial analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated financial context'];
      return assessment;
    }
  });
}