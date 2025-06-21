import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CVCOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  engineeringConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.engineeringConcerns = [];
    this.recommendations = [];
  }
}

interface EngineeringContext {
  codeQuality?: number; // 1-10 scale
  developmentVelocity?: number; // percentage
  teamProductivity?: number; // percentage
  technicalStandards?: string[];
  codeReviewProcess?: string;
  testingCoverage?: number; // percentage
  deploymentFrequency?: string;
  bugRate?: number; // bugs per release
  developerSatisfaction?: number; // 1-10 scale
  mentorshipPrograms?: string[];
}

/**
 * ## Agent Role
 * CVCO focusing on engineering excellence, code quality, and development team leadership
 * 
 * ## Core Principles
 * 1. Prioritize code quality and engineering best practices
 * 2. Foster developer growth and technical excellence
 * 3. Balance development velocity with sustainable practices
 * 4. Ensure robust testing and deployment processes
 * 5. Build high-performing engineering teams through mentorship
 * 
 * ## Analysis Framework
 * - Code Quality: Evaluate code standards and technical debt
 * - Development Velocity: Assess team productivity and delivery speed
 * - Engineering Practices: Analyze testing, deployment, and review processes
 * - Team Development: Evaluate mentorship and skill development programs
 * - Technical Leadership: Assess engineering culture and standards
 * - Innovation Balance: Balance cutting-edge tech with proven solutions
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "engineeringConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cvcoAgent(state: Record<string, any>, engineeringContext: EngineeringContext): Promise<CVCOAssessment> {
  // Perform sub-analyses
  const codeQualityAnalysis = analyzeCodeQuality(engineeringContext);
  const velocityAnalysis = analyzeDevelopmentVelocity(engineeringContext);
  const practicesAnalysis = analyzeEngineeringPractices(engineeringContext);
  const teamAnalysis = analyzeTeamDevelopment(engineeringContext);
  const leadershipAnalysis = analyzeTechnicalLeadership(engineeringContext);

  // Generate structured output
  return generateCVCOOutput(state.proposal, engineeringContext, {
    codeQuality: codeQualityAnalysis,
    velocity: velocityAnalysis,
    practices: practicesAnalysis,
    team: teamAnalysis,
    leadership: leadershipAnalysis
  });
}

function analyzeCodeQuality(context: EngineeringContext): { score: number; details: string[] } {
  const { codeQuality = 5, testingCoverage = 60, bugRate = 5 } = context;
  
  let qualityScore = codeQuality * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess code quality metrics
  if (codeQuality >= 8) {
    details.push(`Excellent code quality standards (${codeQuality}/10) support maintainable development`);
  } else if (codeQuality >= 6) {
    details.push(`Good code quality (${codeQuality}/10) with room for improvement`);
  } else {
    qualityScore -= 20;
    details.push(`Code quality concerns (${codeQuality}/10) may impact long-term maintainability`);
  }
  
  // Evaluate testing coverage
  if (testingCoverage >= 80) {
    qualityScore += 10;
    details.push(`Strong testing coverage (${testingCoverage}%) ensures code reliability`);
  } else if (testingCoverage >= 60) {
    details.push(`Adequate testing coverage (${testingCoverage}%) meets minimum standards`);
  } else {
    qualityScore -= 15;
    details.push(`Low testing coverage (${testingCoverage}%) increases deployment risk`);
  }
  
  // Consider bug rate
  if (bugRate <= 2) {
    qualityScore += 5;
    details.push(`Low bug rate (${bugRate} per release) indicates quality processes`);
  } else if (bugRate > 5) {
    qualityScore -= 10;
    details.push(`High bug rate (${bugRate} per release) suggests quality issues`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, qualityScore)), 
    details 
  };
}

function analyzeDevelopmentVelocity(context: EngineeringContext): { score: number; details: string[] } {
  const { developmentVelocity = 70, deploymentFrequency = 'weekly', teamProductivity = 75 } = context;
  
  let velocityScore = developmentVelocity;
  const details: string[] = [];
  
  // Assess development velocity
  if (developmentVelocity >= 85) {
    details.push(`High development velocity (${developmentVelocity}%) enables rapid feature delivery`);
  } else if (developmentVelocity >= 70) {
    details.push(`Good development velocity (${developmentVelocity}%) supports steady progress`);
  } else {
    velocityScore -= 10;
    details.push(`Low development velocity (${developmentVelocity}%) may delay project timelines`);
  }
  
  // Evaluate deployment frequency
  const deploymentScores = {
    'daily': 20,
    'multiple times per week': 15,
    'weekly': 10,
    'bi-weekly': 5,
    'monthly': 0,
    'quarterly': -10
  };
  
  const deployScore = deploymentScores[deploymentFrequency.toLowerCase()] || 0;
  velocityScore += deployScore;
  
  if (deployScore > 10) {
    details.push(`Frequent deployments (${deploymentFrequency}) enable rapid iteration`);
  } else if (deployScore < 0) {
    details.push(`Infrequent deployments (${deploymentFrequency}) may slow feature delivery`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, velocityScore)), 
    details 
  };
}

function analyzeEngineeringPractices(context: EngineeringContext): { score: number; details: string[] } {
  const { codeReviewProcess = 'basic', technicalStandards = [] } = context;
  
  let practicesScore = 70; // Base score
  const details: string[] = [];
  
  // Assess code review process
  const reviewScores = {
    'comprehensive': 20,
    'thorough': 15,
    'standard': 10,
    'basic': 5,
    'minimal': -5,
    'none': -20
  };
  
  const reviewScore = reviewScores[codeReviewProcess.toLowerCase()] || 5;
  practicesScore += reviewScore;
  
  if (reviewScore > 10) {
    details.push(`${codeReviewProcess} code review process ensures quality standards`);
  } else if (reviewScore < 0) {
    details.push(`${codeReviewProcess} code review process creates quality risks`);
  }
  
  // Evaluate technical standards
  if (technicalStandards.length >= 5) {
    practicesScore += 15;
    details.push(`Comprehensive technical standards (${technicalStandards.length} areas) guide development`);
  } else if (technicalStandards.length >= 3) {
    practicesScore += 5;
    details.push(`Basic technical standards cover key development areas`);
  } else {
    practicesScore -= 10;
    details.push(`Limited technical standards may lead to inconsistent code quality`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, practicesScore)), 
    details 
  };
}

function analyzeTeamDevelopment(context: EngineeringContext): { score: number; details: string[] } {
  const { developerSatisfaction = 6, mentorshipPrograms = [] } = context;
  
  let teamScore = developerSatisfaction * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess developer satisfaction
  if (developerSatisfaction >= 8) {
    details.push(`High developer satisfaction (${developerSatisfaction}/10) supports retention and productivity`);
  } else if (developerSatisfaction >= 6) {
    details.push(`Moderate developer satisfaction (${developerSatisfaction}/10) indicates room for improvement`);
  } else {
    teamScore -= 20;
    details.push(`Low developer satisfaction (${developerSatisfaction}/10) risks talent retention`);
  }
  
  // Evaluate mentorship programs
  if (mentorshipPrograms.length >= 3) {
    teamScore += 15;
    details.push(`Strong mentorship programs (${mentorshipPrograms.length}) support career development`);
  } else if (mentorshipPrograms.length >= 1) {
    teamScore += 5;
    details.push(`Basic mentorship programs provide some career support`);
  } else {
    teamScore -= 10;
    details.push(`Lack of mentorship programs may limit developer growth`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, teamScore)), 
    details 
  };
}

function analyzeTechnicalLeadership(context: EngineeringContext): { score: number; details: string[] } {
  const { teamProductivity = 75, codeQuality = 5, developmentVelocity = 70 } = context;
  
  let leadershipScore = 70; // Base score
  const details: string[] = [];
  
  // Assess overall team performance balance
  const balanceScore = (teamProductivity + (codeQuality * 10) + developmentVelocity) / 3;
  
  if (balanceScore >= 80) {
    leadershipScore += 20;
    details.push(`Excellent balance of productivity, quality, and velocity demonstrates strong technical leadership`);
  } else if (balanceScore >= 70) {
    leadershipScore += 10;
    details.push(`Good technical leadership balance across key engineering metrics`);
  } else {
    leadershipScore -= 15;
    details.push(`Technical leadership challenges evident in unbalanced engineering metrics`);
  }
  
  // Check for quality vs velocity balance
  const qualityVelocityGap = Math.abs((codeQuality * 10) - developmentVelocity);
  if (qualityVelocityGap > 30) {
    leadershipScore -= 10;
    details.push(`Significant gap between code quality and velocity suggests leadership focus needed`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, leadershipScore)), 
    details 
  };
}

async function generateCVCOOutput(proposal: string, context: EngineeringContext, analyses: any): Promise<CVCOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CVCO (Chief Vice Coding Officer) analyzing a business proposal from an engineering excellence and development team perspective.

Your role is to assess:
- Code quality and engineering standards impact
- Development velocity and team productivity implications
- Engineering practices and process requirements
- Team development and mentorship needs
- Technical leadership and culture considerations
- Innovation balance with proven engineering practices

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific engineering recommendations.

Focus on engineering excellence, sustainable development practices, and team growth. Consider both immediate engineering impact and long-term technical culture.`],
    ['human', `Proposal: {proposal}

Engineering Context:
- Code Quality: {codeQuality}/10
- Development Velocity: {developmentVelocity}%
- Team Productivity: {teamProductivity}%
- Technical Standards: {technicalStandards}
- Code Review Process: {codeReviewProcess}
- Testing Coverage: {testingCoverage}%
- Deployment Frequency: {deploymentFrequency}
- Bug Rate: {bugRate} per release
- Developer Satisfaction: {developerSatisfaction}/10
- Mentorship Programs: {mentorshipPrograms}

Analysis Results:
- Code Quality: {codeQualityScore}/100 - {codeQualityDetails}
- Development Velocity: {velocityScore}/100 - {velocityDetails}
- Engineering Practices: {practicesScore}/100 - {practicesDetails}
- Team Development: {teamScore}/100 - {teamDetails}
- Technical Leadership: {leadershipScore}/100 - {leadershipDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, engineeringConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      codeQuality: context.codeQuality || 'Not specified',
      developmentVelocity: context.developmentVelocity || 'Not specified',
      teamProductivity: context.teamProductivity || 'Not specified',
      technicalStandards: context.technicalStandards?.join(', ') || 'Not specified',
      codeReviewProcess: context.codeReviewProcess || 'Not specified',
      testingCoverage: context.testingCoverage || 'Not specified',
      deploymentFrequency: context.deploymentFrequency || 'Not specified',
      bugRate: context.bugRate || 'Not specified',
      developerSatisfaction: context.developerSatisfaction || 'Not specified',
      mentorshipPrograms: context.mentorshipPrograms?.join(', ') || 'Not specified',
      codeQualityScore: analyses.codeQuality.score,
      codeQualityDetails: analyses.codeQuality.details.join('; '),
      velocityScore: analyses.velocity.score,
      velocityDetails: analyses.velocity.details.join('; '),
      practicesScore: analyses.practices.score,
      practicesDetails: analyses.practices.details.join('; '),
      teamScore: analyses.team.score,
      teamDetails: analyses.team.details.join('; '),
      leadershipScore: analyses.leadership.score,
      leadershipDetails: analyses.leadership.details.join('; ')
    }) },
    model: CVCOAssessment,
    agentName: 'cvcoAgent',
    defaultFactory: () => {
      const assessment = new CVCOAssessment();
      assessment.reasoning = 'Error in generating engineering analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.engineeringConcerns = ['Unable to complete full engineering analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated engineering context'];
      return assessment;
    }
  });
}