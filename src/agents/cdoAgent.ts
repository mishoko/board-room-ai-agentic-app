import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CDOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  dataConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.dataConcerns = [];
    this.recommendations = [];
  }
}

interface DataContext {
  dataVolume?: number; // TB
  dataQuality?: number; // 1-10 scale
  dataGovernance?: 'none' | 'basic' | 'mature' | 'advanced';
  analyticsCapability?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  dataPrivacy?: 'compliant' | 'needs-improvement' | 'non-compliant';
  dataIntegration?: number; // number of data sources
  realTimeRequirements?: boolean;
  mlAiCapability?: 'none' | 'basic' | 'intermediate' | 'advanced';
  dataRetention?: 'compliant' | 'needs-review' | 'non-compliant';
  dataBackup?: 'none' | 'basic' | 'comprehensive';
  dataTeamSize?: number;
  businessIntelligence?: 'basic' | 'standard' | 'advanced';
}

/**
 * ## Agent Role
 * CDO focusing on data strategy, governance, and analytics capabilities
 * 
 * ## Core Principles
 * 1. Ensure data quality, integrity, and accessibility
 * 2. Implement robust data governance and privacy protection
 * 3. Maximize data value through analytics and insights
 * 4. Balance data innovation with compliance requirements
 * 5. Build scalable data infrastructure and capabilities
 * 
 * ## Analysis Framework
 * - Data Quality: Evaluate data accuracy, completeness, and reliability
 * - Data Governance: Assess data management policies and procedures
 * - Analytics Capability: Analyze current and required analytics maturity
 * - Privacy Compliance: Evaluate data privacy and protection measures
 * - Infrastructure: Assess data storage, integration, and processing capabilities
 * - Team Capability: Analyze data team skills and capacity
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "dataConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cdoAgent(state: Record<string, any>, dataContext: DataContext): Promise<CDOAssessment> {
  // Perform sub-analyses
  const qualityAnalysis = analyzeDataQuality(dataContext);
  const governanceAnalysis = analyzeDataGovernance(dataContext);
  const analyticsAnalysis = analyzeAnalyticsCapability(dataContext);
  const privacyAnalysis = analyzeDataPrivacy(dataContext);
  const infrastructureAnalysis = analyzeDataInfrastructure(dataContext);

  // Generate structured output
  return generateCDOOutput(state.proposal, dataContext, {
    quality: qualityAnalysis,
    governance: governanceAnalysis,
    analytics: analyticsAnalysis,
    privacy: privacyAnalysis,
    infrastructure: infrastructureAnalysis
  });
}

function analyzeDataQuality(context: DataContext): { score: number; details: string[] } {
  const { dataQuality = 5, dataVolume = 1, dataIntegration = 3 } = context;
  
  let qualityScore = dataQuality * 10; // Convert to percentage
  const details: string[] = [];
  
  // Assess data quality level
  if (dataQuality >= 8) {
    details.push(`High data quality (${dataQuality}/10) provides reliable foundation for analytics`);
  } else if (dataQuality >= 6) {
    details.push(`Good data quality (${dataQuality}/10) supports most analytical needs`);
  } else if (dataQuality >= 4) {
    qualityScore -= 10;
    details.push(`Moderate data quality (${dataQuality}/10) may limit analytical accuracy`);
  } else {
    qualityScore -= 25;
    details.push(`Poor data quality (${dataQuality}/10) creates significant analytical risks`);
  }
  
  // Consider data volume complexity
  if (dataVolume > 100) { // 100+ TB
    qualityScore -= 10;
    details.push(`Large data volume (${dataVolume}TB) increases quality management complexity`);
  } else if (dataVolume > 10) {
    qualityScore -= 5;
    details.push(`Significant data volume (${dataVolume}TB) requires robust quality processes`);
  }
  
  // Evaluate integration complexity
  if (dataIntegration > 10) {
    qualityScore -= 15;
    details.push(`High integration complexity (${dataIntegration} sources) increases quality risks`);
  } else if (dataIntegration > 5) {
    qualityScore -= 5;
    details.push(`Multiple data sources (${dataIntegration}) require quality harmonization`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, qualityScore)), 
    details 
  };
}

function analyzeDataGovernance(context: DataContext): { score: number; details: string[] } {
  const { dataGovernance = 'basic', dataRetention = 'needs-review' } = context;
  
  let governanceScore = 70; // Base score
  const details: string[] = [];
  
  // Assess governance maturity
  const governanceScores = {
    'none': -30,
    'basic': 0,
    'mature': 20,
    'advanced': 30
  };
  
  governanceScore += governanceScores[dataGovernance];
  details.push(`Data governance: ${dataGovernance} - ${dataGovernance === 'advanced' ? 'excellent data management framework' : dataGovernance === 'none' ? 'requires immediate governance implementation' : 'adequate but could be enhanced'}`);
  
  // Evaluate retention compliance
  const retentionImpact = {
    'compliant': 10,
    'needs-review': -5,
    'non-compliant': -20
  };
  
  governanceScore += retentionImpact[dataRetention];
  
  if (dataRetention === 'non-compliant') {
    details.push('Data retention non-compliance creates regulatory and legal risks');
  } else if (dataRetention === 'compliant') {
    details.push('Compliant data retention policies support governance framework');
  }
  
  return { 
    score: Math.max(0, Math.min(100, governanceScore)), 
    details 
  };
}

function analyzeAnalyticsCapability(context: DataContext): { score: number; details: string[] } {
  const { analyticsCapability = 'basic', mlAiCapability = 'basic', businessIntelligence = 'basic', dataTeamSize = 3 } = context;
  
  let analyticsScore = 60; // Base score
  const details: string[] = [];
  
  // Assess analytics maturity
  const analyticsScores = {
    'basic': 0,
    'intermediate': 15,
    'advanced': 25,
    'expert': 35
  };
  
  analyticsScore += analyticsScores[analyticsCapability];
  details.push(`Analytics capability: ${analyticsCapability} - ${analyticsCapability === 'expert' ? 'world-class analytical capabilities' : analyticsCapability === 'basic' ? 'foundational analytics only' : 'solid analytical foundation'}`);
  
  // Evaluate ML/AI capability
  const mlScores = {
    'none': -10,
    'basic': 0,
    'intermediate': 15,
    'advanced': 25
  };
  
  analyticsScore += mlScores[mlAiCapability];
  
  if (mlAiCapability === 'advanced') {
    details.push('Advanced ML/AI capabilities enable sophisticated data insights');
  } else if (mlAiCapability === 'none') {
    details.push('No ML/AI capability limits advanced analytics potential');
  }
  
  // Consider team capacity
  if (dataTeamSize < 3) {
    analyticsScore -= 15;
    details.push(`Small data team (${dataTeamSize}) may limit analytical capacity`);
  } else if (dataTeamSize > 10) {
    analyticsScore += 10;
    details.push(`Large data team (${dataTeamSize}) provides strong analytical capacity`);
  }
  
  // Evaluate BI maturity
  const biScores = {
    'basic': 0,
    'standard': 10,
    'advanced': 20
  };
  
  analyticsScore += biScores[businessIntelligence];
  
  return { 
    score: Math.max(0, Math.min(100, analyticsScore)), 
    details 
  };
}

function analyzeDataPrivacy(context: DataContext): { score: number; details: string[] } {
  const { dataPrivacy = 'needs-improvement', dataGovernance = 'basic' } = context;
  
  let privacyScore = 70; // Base score
  const details: string[] = [];
  
  // Assess privacy compliance
  const privacyImpact = {
    'compliant': 20,
    'needs-improvement': -10,
    'non-compliant': -30
  };
  
  privacyScore += privacyImpact[dataPrivacy];
  details.push(`Data privacy: ${dataPrivacy} - ${dataPrivacy === 'non-compliant' ? 'immediate compliance action required' : dataPrivacy === 'compliant' ? 'strong privacy protection' : 'privacy improvements needed'}`);
  
  // Consider governance support for privacy
  if (dataGovernance === 'advanced' && dataPrivacy !== 'compliant') {
    privacyScore -= 10;
    details.push('Advanced governance with poor privacy compliance indicates implementation gaps');
  } else if (dataGovernance === 'none' && dataPrivacy === 'compliant') {
    privacyScore += 5;
    details.push('Privacy compliance without governance framework shows good privacy focus');
  }
  
  return { 
    score: Math.max(0, Math.min(100, privacyScore)), 
    details 
  };
}

function analyzeDataInfrastructure(context: DataContext): { score: number; details: string[] } {
  const { dataBackup = 'basic', realTimeRequirements = false, dataVolume = 1, dataIntegration = 3 } = context;
  
  let infrastructureScore = 70; // Base score
  const details: string[] = [];
  
  // Assess backup strategy
  const backupScores = {
    'none': -25,
    'basic': 0,
    'comprehensive': 15
  };
  
  infrastructureScore += backupScores[dataBackup];
  
  if (dataBackup === 'none') {
    details.push('No data backup strategy creates significant data loss risks');
  } else if (dataBackup === 'comprehensive') {
    details.push('Comprehensive backup strategy ensures data protection and recovery');
  }
  
  // Consider real-time requirements
  if (realTimeRequirements) {
    infrastructureScore -= 15;
    details.push('Real-time data requirements demand advanced infrastructure capabilities');
  }
  
  // Evaluate scale challenges
  if (dataVolume > 50 && dataIntegration > 8) {
    infrastructureScore -= 20;
    details.push('High volume and integration complexity requires enterprise-grade infrastructure');
  } else if (dataVolume > 10 || dataIntegration > 5) {
    infrastructureScore -= 10;
    details.push('Moderate scale requires robust infrastructure planning');
  }
  
  return { 
    score: Math.max(0, Math.min(100, infrastructureScore)), 
    details 
  };
}

async function generateCDOOutput(proposal: string, context: DataContext, analyses: any): Promise<CDOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CDO (Chief Data Officer) analyzing a business proposal from a data strategy and analytics perspective.

Your role is to assess:
- Data quality, integrity, and reliability implications
- Data governance and management requirements
- Analytics and business intelligence capabilities
- Data privacy and compliance considerations
- Data infrastructure and scalability needs
- Data team capacity and skill requirements

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific data recommendations.

Focus on data value creation, governance excellence, and analytical capabilities. Consider both immediate data impact and long-term data strategy.`],
    ['human', `Proposal: {proposal}

Data Context:
- Data Volume: {dataVolume}TB
- Data Quality: {dataQuality}/10
- Data Governance: {dataGovernance}
- Analytics Capability: {analyticsCapability}
- Data Privacy: {dataPrivacy}
- Data Integration: {dataIntegration} sources
- Real-time Requirements: {realTimeRequirements}
- ML/AI Capability: {mlAiCapability}
- Data Retention: {dataRetention}
- Data Backup: {dataBackup}
- Data Team Size: {dataTeamSize}
- Business Intelligence: {businessIntelligence}

Analysis Results:
- Data Quality: {qualityScore}/100 - {qualityDetails}
- Data Governance: {governanceScore}/100 - {governanceDetails}
- Analytics Capability: {analyticsScore}/100 - {analyticsDetails}
- Data Privacy: {privacyScore}/100 - {privacyDetails}
- Data Infrastructure: {infrastructureScore}/100 - {infrastructureDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, dataConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      dataVolume: context.dataVolume || 'Not specified',
      dataQuality: context.dataQuality || 'Not specified',
      dataGovernance: context.dataGovernance || 'Not specified',
      analyticsCapability: context.analyticsCapability || 'Not specified',
      dataPrivacy: context.dataPrivacy || 'Not specified',
      dataIntegration: context.dataIntegration || 'Not specified',
      realTimeRequirements: context.realTimeRequirements || 'Not specified',
      mlAiCapability: context.mlAiCapability || 'Not specified',
      dataRetention: context.dataRetention || 'Not specified',
      dataBackup: context.dataBackup || 'Not specified',
      dataTeamSize: context.dataTeamSize || 'Not specified',
      businessIntelligence: context.businessIntelligence || 'Not specified',
      qualityScore: analyses.quality.score,
      qualityDetails: analyses.quality.details.join('; '),
      governanceScore: analyses.governance.score,
      governanceDetails: analyses.governance.details.join('; '),
      analyticsScore: analyses.analytics.score,
      analyticsDetails: analyses.analytics.details.join('; '),
      privacyScore: analyses.privacy.score,
      privacyDetails: analyses.privacy.details.join('; '),
      infrastructureScore: analyses.infrastructure.score,
      infrastructureDetails: analyses.infrastructure.details.join('; ')
    }) },
    model: CDOAssessment,
    agentName: 'cdoAgent',
    defaultFactory: () => {
      const assessment = new CDOAssessment();
      assessment.reasoning = 'Error in generating data analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.dataConcerns = ['Unable to complete full data analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated data context'];
      return assessment;
    }
  });
}