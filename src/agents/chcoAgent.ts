import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CHCOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  cultureConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.cultureConcerns = [];
    this.recommendations = [];
  }
}

interface CultureContext {
  employeeEngagement?: number; // 1-10 scale
  culturalAlignment?: number; // 1-10 scale
  workLifeBalance?: 'poor' | 'fair' | 'good' | 'excellent';
  diversityInclusion?: number; // 1-10 scale
  employeeWellbeing?: 'low' | 'moderate' | 'high' | 'exceptional';
  changeReadiness?: 'resistant' | 'cautious' | 'adaptable' | 'eager';
  communicationQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  leadershipTrust?: number; // 1-10 scale
  teamCollaboration?: number; // 1-10 scale
  innovationCulture?: 'stagnant' | 'emerging' | 'active' | 'thriving';
  retentionRate?: number; // percentage
  employeeSatisfaction?: number; // 1-10 scale
}

/**
 * ## Agent Role
 * CHCO focusing on organizational culture, employee happiness, and workplace wellbeing
 * 
 * ## Core Principles
 * 1. Prioritize employee wellbeing and happiness
 * 2. Foster inclusive and diverse workplace culture
 * 3. Promote work-life balance and mental health
 * 4. Build trust and psychological safety
 * 5. Support continuous learning and personal growth
 * 
 * ## Analysis Framework
 * - Employee Engagement: Evaluate impact on workforce motivation and satisfaction
 * - Cultural Alignment: Assess fit with organizational values and culture
 * - Wellbeing Impact: Analyze effects on employee mental and physical health
 * - Diversity & Inclusion: Evaluate inclusive culture implications
 * - Change Management: Assess cultural readiness for organizational change
 * - Communication: Analyze impact on organizational communication and transparency
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "cultureConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function chcoAgent(state: Record<string, any>, cultureContext: CultureContext): Promise<CHCOAssessment> {
  // Perform sub-analyses
  const engagementAnalysis = analyzeEmployeeEngagement(cultureContext);
  const cultureAnalysis = analyzeCulturalAlignment(cultureContext);
  const wellbeingAnalysis = analyzeEmployeeWellbeing(cultureContext);
  const diversityAnalysis = analyzeDiversityInclusion(cultureContext);
  const changeAnalysis = analyzeChangeReadiness(cultureContext);

  // Generate structured output
  return generateCHCOOutput(state.proposal, cultureContext, {
    engagement: engagementAnalysis,
    culture: cultureAnalysis,
    wellbeing: wellbeingAnalysis,
    diversity: diversityAnalysis,
    change: changeAnalysis
  });
}

function analyzeEmployeeEngagement(context: CultureContext): { score: number; details: string[] } {
  const { employeeEngagement = 6, employeeSatisfaction = 6, retentionRate = 85 } = context;
  
  let engagementScore = employeeEngagement * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess engagement level
  if (employeeEngagement >= 8) {
    details.push(`High employee engagement (${employeeEngagement}/10) creates positive workplace energy`);
  } else if (employeeEngagement >= 6) {
    details.push(`Moderate employee engagement (${employeeEngagement}/10) has room for improvement`);
  } else if (employeeEngagement >= 4) {
    engagementScore -= 15;
    details.push(`Low employee engagement (${employeeEngagement}/10) risks productivity and morale`);
  } else {
    engagementScore -= 30;
    details.push(`Very low employee engagement (${employeeEngagement}/10) indicates serious culture issues`);
  }
  
  // Evaluate satisfaction correlation
  if (employeeSatisfaction >= 8) {
    engagementScore += 10;
    details.push(`High employee satisfaction (${employeeSatisfaction}/10) supports engagement initiatives`);
  } else if (employeeSatisfaction < 5) {
    engagementScore -= 15;
    details.push(`Low employee satisfaction (${employeeSatisfaction}/10) undermines engagement efforts`);
  }
  
  // Consider retention as engagement indicator
  if (retentionRate >= 90) {
    engagementScore += 15;
    details.push(`Excellent retention rate (${retentionRate}%) indicates strong employee commitment`);
  } else if (retentionRate >= 80) {
    engagementScore += 5;
    details.push(`Good retention rate (${retentionRate}%) shows adequate employee satisfaction`);
  } else {
    engagementScore -= 20;
    details.push(`Low retention rate (${retentionRate}%) suggests engagement and culture challenges`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, engagementScore)), 
    details 
  };
}

function analyzeCulturalAlignment(context: CultureContext): { score: number; details: string[] } {
  const { culturalAlignment = 6, innovationCulture = 'emerging', leadershipTrust = 6 } = context;
  
  let cultureScore = culturalAlignment * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess cultural alignment
  if (culturalAlignment >= 8) {
    details.push(`Strong cultural alignment (${culturalAlignment}/10) supports organizational cohesion`);
  } else if (culturalAlignment >= 6) {
    details.push(`Good cultural alignment (${culturalAlignment}/10) provides solid foundation`);
  } else if (culturalAlignment >= 4) {
    cultureScore -= 15;
    details.push(`Weak cultural alignment (${culturalAlignment}/10) may create resistance to change`);
  } else {
    cultureScore -= 25;
    details.push(`Poor cultural alignment (${culturalAlignment}/10) indicates fundamental culture issues`);
  }
  
  // Evaluate innovation culture
  const innovationScores = {
    'stagnant': -20,
    'emerging': 0,
    'active': 15,
    'thriving': 25
  };
  
  cultureScore += innovationScores[innovationCulture];
  details.push(`Innovation culture: ${innovationCulture} - ${innovationCulture === 'thriving' ? 'excellent creative environment' : innovationCulture === 'stagnant' ? 'needs innovation stimulus' : 'developing innovation mindset'}`);
  
  // Consider leadership trust
  if (leadershipTrust >= 8) {
    cultureScore += 15;
    details.push(`High leadership trust (${leadershipTrust}/10) enables effective change management`);
  } else if (leadershipTrust < 5) {
    cultureScore -= 20;
    details.push(`Low leadership trust (${leadershipTrust}/10) creates implementation barriers`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, cultureScore)), 
    details 
  };
}

function analyzeEmployeeWellbeing(context: CultureContext): { score: number; details: string[] } {
  const { employeeWellbeing = 'moderate', workLifeBalance = 'fair', communicationQuality = 'fair' } = context;
  
  let wellbeingScore = 70; // Base score
  const details: string[] = [];
  
  // Assess wellbeing level
  const wellbeingScores = {
    'low': -25,
    'moderate': 0,
    'high': 20,
    'exceptional': 30
  };
  
  wellbeingScore += wellbeingScores[employeeWellbeing];
  details.push(`Employee wellbeing: ${employeeWellbeing} - ${employeeWellbeing === 'exceptional' ? 'outstanding employee care' : employeeWellbeing === 'low' ? 'requires immediate attention' : 'adequate but improvable'}`);
  
  // Evaluate work-life balance
  const balanceScores = {
    'poor': -20,
    'fair': 0,
    'good': 15,
    'excellent': 25
  };
  
  wellbeingScore += balanceScores[workLifeBalance];
  
  if (workLifeBalance === 'poor') {
    details.push('Poor work-life balance creates burnout and retention risks');
  } else if (workLifeBalance === 'excellent') {
    details.push('Excellent work-life balance supports employee satisfaction and productivity');
  }
  
  // Consider communication quality
  const commScores = {
    'poor': -15,
    'fair': 0,
    'good': 10,
    'excellent': 20
  };
  
  wellbeingScore += commScores[communicationQuality];
  
  if (communicationQuality === 'excellent') {
    details.push('Excellent communication quality builds trust and reduces workplace stress');
  } else if (communicationQuality === 'poor') {
    details.push('Poor communication quality creates confusion and workplace tension');
  }
  
  return { 
    score: Math.max(0, Math.min(100, wellbeingScore)), 
    details 
  };
}

function analyzeDiversityInclusion(context: CultureContext): { score: number; details: string[] } {
  const { diversityInclusion = 6, teamCollaboration = 6 } = context;
  
  let diversityScore = diversityInclusion * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess D&I level
  if (diversityInclusion >= 8) {
    details.push(`Strong diversity & inclusion (${diversityInclusion}/10) creates inclusive workplace`);
  } else if (diversityInclusion >= 6) {
    details.push(`Good diversity & inclusion (${diversityInclusion}/10) with growth opportunities`);
  } else if (diversityInclusion >= 4) {
    diversityScore -= 15;
    details.push(`Moderate D&I (${diversityInclusion}/10) needs focused improvement efforts`);
  } else {
    diversityScore -= 30;
    details.push(`Low D&I (${diversityInclusion}/10) creates exclusion and legal risks`);
  }
  
  // Evaluate team collaboration as D&I indicator
  if (teamCollaboration >= 8) {
    diversityScore += 10;
    details.push(`High team collaboration (${teamCollaboration}/10) indicates inclusive team dynamics`);
  } else if (teamCollaboration < 5) {
    diversityScore -= 15;
    details.push(`Low team collaboration (${teamCollaboration}/10) may indicate inclusion challenges`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, diversityScore)), 
    details 
  };
}

function analyzeChangeReadiness(context: CultureContext): { score: number; details: string[] } {
  const { changeReadiness = 'cautious', leadershipTrust = 6, communicationQuality = 'fair' } = context;
  
  let changeScore = 70; // Base score
  const details: string[] = [];
  
  // Assess change readiness
  const readinessScores = {
    'resistant': -30,
    'cautious': -10,
    'adaptable': 15,
    'eager': 25
  };
  
  changeScore += readinessScores[changeReadiness];
  details.push(`Change readiness: ${changeReadiness} - ${changeReadiness === 'eager' ? 'excellent change adoption potential' : changeReadiness === 'resistant' ? 'requires extensive change management' : 'manageable with proper support'}`);
  
  // Consider trust and communication as change enablers
  if (leadershipTrust >= 7 && communicationQuality === 'excellent') {
    changeScore += 15;
    details.push('High trust and excellent communication enable smooth change implementation');
  } else if (leadershipTrust < 5 || communicationQuality === 'poor') {
    changeScore -= 20;
    details.push('Low trust or poor communication creates change resistance risks');
  }
  
  return { 
    score: Math.max(0, Math.min(100, changeScore)), 
    details 
  };
}

async function generateCHCOOutput(proposal: string, context: CultureContext, analyses: any): Promise<CHCOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CHCO (Chief Happiness & Culture Officer) analyzing a business proposal from an employee wellbeing and organizational culture perspective.

Your role is to assess:
- Employee engagement and satisfaction implications
- Cultural alignment and organizational values impact
- Employee wellbeing and work-life balance effects
- Diversity, inclusion, and equity considerations
- Change readiness and cultural adaptation capacity
- Communication and trust implications

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific culture recommendations.

Focus on employee happiness, cultural health, and sustainable workplace practices. Consider both immediate culture impact and long-term organizational wellbeing.`],
    ['human', `Proposal: {proposal}

Culture Context:
- Employee Engagement: {employeeEngagement}/10
- Cultural Alignment: {culturalAlignment}/10
- Work-Life Balance: {workLifeBalance}
- Diversity & Inclusion: {diversityInclusion}/10
- Employee Wellbeing: {employeeWellbeing}
- Change Readiness: {changeReadiness}
- Communication Quality: {communicationQuality}
- Leadership Trust: {leadershipTrust}/10
- Team Collaboration: {teamCollaboration}/10
- Innovation Culture: {innovationCulture}
- Retention Rate: {retentionRate}%
- Employee Satisfaction: {employeeSatisfaction}/10

Analysis Results:
- Employee Engagement: {engagementScore}/100 - {engagementDetails}
- Cultural Alignment: {cultureScore}/100 - {cultureDetails}
- Employee Wellbeing: {wellbeingScore}/100 - {wellbeingDetails}
- Diversity & Inclusion: {diversityScore}/100 - {diversityDetails}
- Change Readiness: {changeScore}/100 - {changeDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, cultureConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      employeeEngagement: context.employeeEngagement || 'Not specified',
      culturalAlignment: context.culturalAlignment || 'Not specified',
      workLifeBalance: context.workLifeBalance || 'Not specified',
      diversityInclusion: context.diversityInclusion || 'Not specified',
      employeeWellbeing: context.employeeWellbeing || 'Not specified',
      changeReadiness: context.changeReadiness || 'Not specified',
      communicationQuality: context.communicationQuality || 'Not specified',
      leadershipTrust: context.leadershipTrust || 'Not specified',
      teamCollaboration: context.teamCollaboration || 'Not specified',
      innovationCulture: context.innovationCulture || 'Not specified',
      retentionRate: context.retentionRate || 'Not specified',
      employeeSatisfaction: context.employeeSatisfaction || 'Not specified',
      engagementScore: analyses.engagement.score,
      engagementDetails: analyses.engagement.details.join('; '),
      cultureScore: analyses.culture.score,
      cultureDetails: analyses.culture.details.join('; '),
      wellbeingScore: analyses.wellbeing.score,
      wellbeingDetails: analyses.wellbeing.details.join('; '),
      diversityScore: analyses.diversity.score,
      diversityDetails: analyses.diversity.details.join('; '),
      changeScore: analyses.change.score,
      changeDetails: analyses.change.details.join('; ')
    }) },
    model: CHCOAssessment,
    agentName: 'chcoAgent',
    defaultFactory: () => {
      const assessment = new CHCOAssessment();
      assessment.reasoning = 'Error in generating culture analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.cultureConcerns = ['Unable to complete full culture analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated culture context'];
      return assessment;
    }
  });
}