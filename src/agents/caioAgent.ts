import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CAIOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  aiConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.aiConcerns = [];
    this.recommendations = [];
  }
}

interface AIContext {
  aiMaturity?: 'none' | 'basic' | 'intermediate' | 'advanced' | 'expert';
  dataReadiness?: number; // 1-10 scale
  mlInfrastructure?: 'none' | 'basic' | 'cloud' | 'enterprise';
  aiTalent?: number; // team size
  ethicalAI?: 'none' | 'basic' | 'comprehensive';
  aiGovernance?: 'none' | 'developing' | 'established' | 'mature';
  automationLevel?: number; // percentage
  aiROI?: number; // percentage
  biasRisk?: 'low' | 'medium' | 'high' | 'critical';
  explainability?: 'black-box' | 'limited' | 'interpretable' | 'transparent';
  aiSecurity?: 'basic' | 'standard' | 'advanced';
  regulatoryCompliance?: 'non-compliant' | 'partial' | 'compliant';
}

/**
 * ## Agent Role
 * CAIO focusing on AI strategy, machine learning implementation, and ethical AI governance
 * 
 * ## Core Principles
 * 1. Ensure responsible and ethical AI development and deployment
 * 2. Maximize AI value creation while minimizing risks
 * 3. Build scalable and robust AI infrastructure
 * 4. Promote AI literacy and capability across organization
 * 5. Balance AI innovation with regulatory compliance
 * 
 * ## Analysis Framework
 * - AI Readiness: Evaluate organizational AI maturity and capabilities
 * - Data Foundation: Assess data quality and infrastructure for AI
 * - Ethical AI: Analyze bias, fairness, and ethical implications
 * - AI Governance: Evaluate AI oversight and risk management
 * - Technical Implementation: Assess AI architecture and scalability
 * - Regulatory Compliance: Analyze AI regulatory and compliance requirements
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "aiConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function caioAgent(state: Record<string, any>, aiContext: AIContext): Promise<CAIOAssessment> {
  // Perform sub-analyses
  const readinessAnalysis = analyzeAIReadiness(aiContext);
  const dataAnalysis = analyzeDataFoundation(aiContext);
  const ethicsAnalysis = analyzeEthicalAI(aiContext);
  const governanceAnalysis = analyzeAIGovernance(aiContext);
  const implementationAnalysis = analyzeTechnicalImplementation(aiContext);

  // Generate structured output
  return generateCAIOOutput(state.proposal, aiContext, {
    readiness: readinessAnalysis,
    data: dataAnalysis,
    ethics: ethicsAnalysis,
    governance: governanceAnalysis,
    implementation: implementationAnalysis
  });
}

function analyzeAIReadiness(context: AIContext): { score: number; details: string[] } {
  const { aiMaturity = 'basic', aiTalent = 2, automationLevel = 20 } = context;
  
  let readinessScore = 60; // Base score
  const details: string[] = [];
  
  // Assess AI maturity level
  const maturityScores = {
    'none': -30,
    'basic': 0,
    'intermediate': 20,
    'advanced': 35,
    'expert': 50
  };
  
  readinessScore += maturityScores[aiMaturity];
  details.push(`AI maturity: ${aiMaturity} - ${aiMaturity === 'expert' ? 'world-class AI capabilities' : aiMaturity === 'none' ? 'requires foundational AI development' : 'solid AI foundation'}`);
  
  // Evaluate AI talent capacity
  if (aiTalent >= 10) {
    readinessScore += 20;
    details.push(`Strong AI team (${aiTalent} members) provides robust implementation capacity`);
  } else if (aiTalent >= 5) {
    readinessScore += 10;
    details.push(`Adequate AI team (${aiTalent} members) supports moderate AI initiatives`);
  } else if (aiTalent >= 2) {
    details.push(`Small AI team (${aiTalent} members) limits complex AI project capacity`);
  } else {
    readinessScore -= 20;
    details.push(`Insufficient AI talent (${aiTalent} members) creates implementation bottlenecks`);
  }
  
  // Consider current automation level
  if (automationLevel >= 60) {
    readinessScore += 15;
    details.push(`High automation level (${automationLevel}%) demonstrates AI adoption success`);
  } else if (automationLevel >= 30) {
    readinessScore += 5;
    details.push(`Moderate automation (${automationLevel}%) shows AI integration progress`);
  } else {
    readinessScore -= 10;
    details.push(`Low automation (${automationLevel}%) indicates limited AI implementation experience`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, readinessScore)), 
    details 
  };
}

function analyzeDataFoundation(context: AIContext): { score: number; details: string[] } {
  const { dataReadiness = 5, mlInfrastructure = 'basic' } = context;
  
  let dataScore = dataReadiness * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess data readiness
  if (dataReadiness >= 8) {
    details.push(`Excellent data readiness (${dataReadiness}/10) enables advanced AI applications`);
  } else if (dataReadiness >= 6) {
    details.push(`Good data readiness (${dataReadiness}/10) supports most AI use cases`);
  } else if (dataReadiness >= 4) {
    dataScore -= 15;
    details.push(`Moderate data readiness (${dataReadiness}/10) limits AI model performance`);
  } else {
    dataScore -= 30;
    details.push(`Poor data readiness (${dataReadiness}/10) prevents effective AI implementation`);
  }
  
  // Evaluate ML infrastructure
  const infraScores = {
    'none': -25,
    'basic': 0,
    'cloud': 15,
    'enterprise': 25
  };
  
  dataScore += infraScores[mlInfrastructure];
  
  if (mlInfrastructure === 'enterprise') {
    details.push('Enterprise ML infrastructure supports large-scale AI deployment');
  } else if (mlInfrastructure === 'none') {
    details.push('No ML infrastructure requires significant technology investment');
  } else if (mlInfrastructure === 'cloud') {
    details.push('Cloud ML infrastructure provides scalable AI capabilities');
  }
  
  return { 
    score: Math.max(0, Math.min(100, dataScore)), 
    details 
  };
}

function analyzeEthicalAI(context: AIContext): { score: number; details: string[] } {
  const { ethicalAI = 'basic', biasRisk = 'medium', explainability = 'limited' } = context;
  
  let ethicsScore = 70; // Base score
  const details: string[] = [];
  
  // Assess ethical AI framework
  const ethicsScores = {
    'none': -30,
    'basic': 0,
    'comprehensive': 25
  };
  
  ethicsScore += ethicsScores[ethicalAI];
  details.push(`Ethical AI framework: ${ethicalAI} - ${ethicalAI === 'comprehensive' ? 'robust ethical guidelines' : ethicalAI === 'none' ? 'requires ethical AI development' : 'basic ethical considerations'}`);
  
  // Evaluate bias risk
  const biasImpact = {
    'low': 15,
    'medium': 0,
    'high': -20,
    'critical': -35
  };
  
  ethicsScore += biasImpact[biasRisk];
  
  if (biasRisk === 'critical') {
    details.push('Critical bias risk requires immediate ethical AI intervention');
  } else if (biasRisk === 'low') {
    details.push('Low bias risk indicates good ethical AI practices');
  }
  
  // Consider explainability
  const explainScores = {
    'black-box': -20,
    'limited': -5,
    'interpretable': 10,
    'transparent': 20
  };
  
  ethicsScore += explainScores[explainability];
  
  if (explainability === 'transparent') {
    details.push('Transparent AI models support ethical decision-making and compliance');
  } else if (explainability === 'black-box') {
    details.push('Black-box AI models create ethical and regulatory risks');
  }
  
  return { 
    score: Math.max(0, Math.min(100, ethicsScore)), 
    details 
  };
}

function analyzeAIGovernance(context: AIContext): { score: number; details: string[] } {
  const { aiGovernance = 'developing', regulatoryCompliance = 'partial', aiSecurity = 'standard' } = context;
  
  let governanceScore = 70; // Base score
  const details: string[] = [];
  
  // Assess AI governance maturity
  const governanceScores = {
    'none': -25,
    'developing': 0,
    'established': 20,
    'mature': 30
  };
  
  governanceScore += governanceScores[aiGovernance];
  details.push(`AI governance: ${aiGovernance} - ${aiGovernance === 'mature' ? 'comprehensive AI oversight' : aiGovernance === 'none' ? 'requires governance framework' : 'developing governance capabilities'}`);
  
  // Evaluate regulatory compliance
  const complianceImpact = {
    'non-compliant': -30,
    'partial': -10,
    'compliant': 15
  };
  
  governanceScore += complianceImpact[regulatoryCompliance];
  
  if (regulatoryCompliance === 'non-compliant') {
    details.push('AI regulatory non-compliance creates legal and operational risks');
  } else if (regulatoryCompliance === 'compliant') {
    details.push('AI regulatory compliance supports sustainable AI deployment');
  }
  
  // Consider AI security
  const securityScores = {
    'basic': -10,
    'standard': 0,
    'advanced': 15
  };
  
  governanceScore += securityScores[aiSecurity];
  
  if (aiSecurity === 'advanced') {
    details.push('Advanced AI security protects against AI-specific threats');
  } else if (aiSecurity === 'basic') {
    details.push('Basic AI security may be insufficient for enterprise AI deployment');
  }
  
  return { 
    score: Math.max(0, Math.min(100, governanceScore)), 
    details 
  };
}

function analyzeTechnicalImplementation(context: AIContext): { score: number; details: string[] } {
  const { mlInfrastructure = 'basic', aiRO = 0, aiMaturity = 'basic' } = context;
  
  let implementationScore = 60; // Base score
  const details: string[] = [];
  
  // Assess infrastructure capability
  const infraCapability = {
    'none': -20,
    'basic': 0,
    'cloud': 15,
    'enterprise': 25
  };
  
  implementationScore += infraCapability[mlInfrastructure];
  
  // Evaluate AI ROI track record
  if (aiRO > 200) {
    implementationScore += 25;
    details.push(`Exceptional AI ROI (${aiRO}%) demonstrates successful AI value creation`);
  } else if (aiRO > 100) {
    implementationScore += 15;
    details.push(`Strong AI ROI (${aiRO}%) shows effective AI implementation`);
  } else if (aiRO > 50) {
    implementationScore += 5;
    details.push(`Moderate AI ROI (${aiRO}%) indicates developing AI capabilities`);
  } else if (aiRO > 0) {
    details.push(`Limited AI ROI (${aiRO}%) suggests early-stage AI adoption`);
  } else {
    implementationScore -= 15;
    details.push('No demonstrated AI ROI indicates implementation challenges');
  }
  
  // Consider maturity-infrastructure alignment
  if (aiMaturity === 'advanced' && mlInfrastructure === 'basic') {
    implementationScore -= 15;
    details.push('Advanced AI maturity with basic infrastructure creates scaling bottlenecks');
  } else if (aiMaturity === 'expert' && mlInfrastructure === 'enterprise') {
    implementationScore += 10;
    details.push('Expert AI maturity with enterprise infrastructure enables cutting-edge AI');
  }
  
  return { 
    score: Math.max(0, Math.min(100, implementationScore)), 
    details 
  };
}

async function generateCAIOOutput(proposal: string, context: AIContext, analyses: any): Promise<CAIOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CAIO (Chief AI Officer) analyzing a business proposal from an artificial intelligence and machine learning perspective.

Your role is to assess:
- AI readiness and organizational AI maturity
- Data foundation and infrastructure for AI implementation
- Ethical AI considerations and bias mitigation
- AI governance and regulatory compliance
- Technical implementation feasibility and scalability
- AI value creation and ROI potential

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific AI recommendations.

Focus on responsible AI development, value creation, and sustainable AI capabilities. Consider both immediate AI impact and long-term AI strategy.`],
    ['human', `Proposal: {proposal}

AI Context:
- AI Maturity: {aiMaturity}
- Data Readiness: {dataReadiness}/10
- ML Infrastructure: {mlInfrastructure}
- AI Talent: {aiTalent} team members
- Ethical AI: {ethicalAI}
- AI Governance: {aiGovernance}
- Automation Level: {automationLevel}%
- AI ROI: {aiROI}%
- Bias Risk: {biasRisk}
- Explainability: {explainability}
- AI Security: {aiSecurity}
- Regulatory Compliance: {regulatoryCompliance}

Analysis Results:
- AI Readiness: {readinessScore}/100 - {readinessDetails}
- Data Foundation: {dataScore}/100 - {dataDetails}
- Ethical AI: {ethicsScore}/100 - {ethicsDetails}
- AI Governance: {governanceScore}/100 - {governanceDetails}
- Technical Implementation: {implementationScore}/100 - {implementationDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, aiConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      aiMaturity: context.aiMaturity || 'Not specified',
      dataReadiness: context.dataReadiness || 'Not specified',
      mlInfrastructure: context.mlInfrastructure || 'Not specified',
      aiTalent: context.aiTalent || 'Not specified',
      ethicalAI: context.ethicalAI || 'Not specified',
      aiGovernance: context.aiGovernance || 'Not specified',
      automationLevel: context.automationLevel || 'Not specified',
      aiROI: context.aiROI || 'Not specified',
      biasRisk: context.biasRisk || 'Not specified',
      explainability: context.explainability || 'Not specified',
      aiSecurity: context.aiSecurity || 'Not specified',
      regulatoryCompliance: context.regulatoryCompliance || 'Not specified',
      readinessScore: analyses.readiness.score,
      readinessDetails: analyses.readiness.details.join('; '),
      dataScore: analyses.data.score,
      dataDetails: analyses.data.details.join('; '),
      ethicsScore: analyses.ethics.score,
      ethicsDetails: analyses.ethics.details.join('; '),
      governanceScore: analyses.governance.score,
      governanceDetails: analyses.governance.details.join('; '),
      implementationScore: analyses.implementation.score,
      implementationDetails: analyses.implementation.details.join('; ')
    }) },
    model: CAIOAssessment,
    agentName: 'caioAgent',
    defaultFactory: () => {
      const assessment = new CAIOAssessment();
      assessment.reasoning = 'Error in generating AI analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.aiConcerns = ['Unable to complete full AI analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated AI context'];
      return assessment;
    }
  });
}