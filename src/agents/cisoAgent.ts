import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CISOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  securityConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.securityConcerns = [];
    this.recommendations = [];
  }
}

interface SecurityContext {
  currentSecurityPosture?: 'weak' | 'basic' | 'strong' | 'advanced';
  complianceRequirements?: string[];
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  securityBudget?: number;
  incidentHistory?: number; // incidents per year
  securityTraining?: 'none' | 'basic' | 'regular' | 'comprehensive';
  vulnerabilityScore?: number; // 1-10 scale (10 = most secure)
  accessControls?: 'basic' | 'rbac' | 'zero-trust';
  dataEncryption?: 'none' | 'basic' | 'comprehensive';
  backupStrategy?: 'none' | 'basic' | 'robust' | 'enterprise';
}

/**
 * ## Agent Role
 * CISO focusing on cybersecurity, risk management, and information protection
 * 
 * ## Core Principles
 * 1. Prioritize data protection and privacy compliance
 * 2. Implement defense-in-depth security strategies
 * 3. Balance security controls with business functionality
 * 4. Ensure regulatory compliance and audit readiness
 * 5. Foster security-aware organizational culture
 * 
 * ## Analysis Framework
 * - Threat Assessment: Evaluate security risks and threat vectors
 * - Compliance Impact: Analyze regulatory and compliance implications
 * - Data Protection: Assess data handling and encryption requirements
 * - Access Control: Evaluate authentication and authorization needs
 * - Incident Response: Analyze incident management and recovery capabilities
 * - Security Culture: Assess training and awareness requirements
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "securityConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cisoAgent(state: Record<string, any>, securityContext: SecurityContext): Promise<CISOAssessment> {
  // Perform sub-analyses
  const threatAnalysis = analyzeThreatAssessment(securityContext);
  const complianceAnalysis = analyzeComplianceImpact(securityContext);
  const dataAnalysis = analyzeDataProtection(securityContext);
  const accessAnalysis = analyzeAccessControl(securityContext);
  const incidentAnalysis = analyzeIncidentResponse(securityContext);

  // Generate structured output
  return generateCISOOutput(state.proposal, securityContext, {
    threat: threatAnalysis,
    compliance: complianceAnalysis,
    data: dataAnalysis,
    access: accessAnalysis,
    incident: incidentAnalysis
  });
}

function analyzeThreatAssessment(context: SecurityContext): { score: number; details: string[] } {
  const { threatLevel = 'medium', vulnerabilityScore = 5, incidentHistory = 2 } = context;
  
  let threatScore = 70; // Base score
  const details: string[] = [];
  
  // Assess threat level
  const threatImpact = {
    'low': 15,
    'medium': 0,
    'high': -20,
    'critical': -35
  };
  
  threatScore += threatImpact[threatLevel];
  details.push(`Threat level: ${threatLevel} - ${threatLevel === 'critical' ? 'requires immediate security enhancement' : threatLevel === 'high' ? 'demands robust security measures' : 'manageable with standard controls'}`);
  
  // Evaluate vulnerability posture
  const vulnScore = vulnerabilityScore * 10; // Convert to percentage
  threatScore = (threatScore + vulnScore) / 2;
  
  if (vulnerabilityScore >= 8) {
    details.push(`Strong security posture (${vulnerabilityScore}/10) provides good threat resistance`);
  } else if (vulnerabilityScore >= 6) {
    details.push(`Moderate security posture (${vulnerabilityScore}/10) needs improvement`);
  } else {
    details.push(`Weak security posture (${vulnerabilityScore}/10) creates significant risk exposure`);
  }
  
  // Consider incident history
  if (incidentHistory === 0) {
    threatScore += 10;
    details.push('No recent security incidents indicate effective controls');
  } else if (incidentHistory <= 2) {
    details.push(`Limited incident history (${incidentHistory}/year) shows manageable risk`);
  } else {
    threatScore -= 15;
    details.push(`High incident frequency (${incidentHistory}/year) suggests security gaps`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, threatScore)), 
    details 
  };
}

function analyzeComplianceImpact(context: SecurityContext): { score: number; details: string[] } {
  const { complianceRequirements = [], dataClassification = 'internal' } = context;
  
  let complianceScore = 80; // Base score
  const details: string[] = [];
  
  // Assess compliance complexity
  const highRiskCompliance = complianceRequirements.filter(req =>
    ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'SOC2', 'ISO27001'].some(standard =>
      req.toUpperCase().includes(standard)
    )
  );
  
  if (highRiskCompliance.length > 0) {
    complianceScore -= highRiskCompliance.length * 15;
    details.push(`High-risk compliance requirements: ${highRiskCompliance.join(', ')} - requires specialized controls`);
  }
  
  if (complianceRequirements.length > 5) {
    complianceScore -= 10;
    details.push(`Multiple compliance frameworks (${complianceRequirements.length}) increase complexity`);
  }
  
  // Evaluate data classification impact
  const classificationImpact = {
    'public': 5,
    'internal': 0,
    'confidential': -10,
    'restricted': -20
  };
  
  complianceScore += classificationImpact[dataClassification];
  if (dataClassification === 'restricted') {
    details.push('Restricted data classification requires highest security controls');
  } else if (dataClassification === 'confidential') {
    details.push('Confidential data requires enhanced protection measures');
  }
  
  return { 
    score: Math.max(0, Math.min(100, complianceScore)), 
    details 
  };
}

function analyzeDataProtection(context: SecurityContext): { score: number; details: string[] } {
  const { dataEncryption = 'basic', backupStrategy = 'basic', dataClassification = 'internal' } = context;
  
  let dataScore = 70; // Base score
  const details: string[] = [];
  
  // Assess encryption adequacy
  const encryptionScores = {
    'none': -30,
    'basic': 0,
    'comprehensive': 20
  };
  
  dataScore += encryptionScores[dataEncryption];
  
  if (dataEncryption === 'none') {
    details.push('No data encryption creates significant data protection risks');
  } else if (dataEncryption === 'comprehensive') {
    details.push('Comprehensive encryption provides strong data protection');
  } else {
    details.push('Basic encryption meets minimum requirements but could be enhanced');
  }
  
  // Evaluate backup strategy
  const backupScores = {
    'none': -25,
    'basic': 0,
    'robust': 10,
    'enterprise': 15
  };
  
  dataScore += backupScores[backupStrategy];
  
  if (backupStrategy === 'none') {
    details.push('No backup strategy creates data loss and recovery risks');
  } else if (backupStrategy === 'enterprise') {
    details.push('Enterprise backup strategy ensures business continuity');
  }
  
  // Consider data classification requirements
  if (dataClassification === 'restricted' && dataEncryption !== 'comprehensive') {
    dataScore -= 20;
    details.push('Restricted data requires comprehensive encryption - current protection insufficient');
  }
  
  return { 
    score: Math.max(0, Math.min(100, dataScore)), 
    details 
  };
}

function analyzeAccessControl(context: SecurityContext): { score: number; details: string[] } {
  const { accessControls = 'basic', securityTraining = 'basic' } = context;
  
  let accessScore = 70; // Base score
  const details: string[] = [];
  
  // Assess access control sophistication
  const accessScores = {
    'basic': 0,
    'rbac': 15,
    'zero-trust': 25
  };
  
  accessScore += accessScores[accessControls];
  
  if (accessControls === 'zero-trust') {
    details.push('Zero-trust architecture provides advanced access security');
  } else if (accessControls === 'rbac') {
    details.push('Role-based access control provides good security foundation');
  } else {
    details.push('Basic access controls may be insufficient for complex environments');
  }
  
  // Evaluate security training
  const trainingScores = {
    'none': -20,
    'basic': 0,
    'regular': 10,
    'comprehensive': 15
  };
  
  accessScore += trainingScores[securityTraining];
  
  if (securityTraining === 'none') {
    details.push('No security training creates human factor vulnerabilities');
  } else if (securityTraining === 'comprehensive') {
    details.push('Comprehensive security training strengthens human firewall');
  }
  
  return { 
    score: Math.max(0, Math.min(100, accessScore)), 
    details 
  };
}

function analyzeIncidentResponse(context: SecurityContext): { score: number; details: string[] } {
  const { currentSecurityPosture = 'basic', securityBudget = 50000, incidentHistory = 2 } = context;
  
  let incidentScore = 70; // Base score
  const details: string[] = [];
  
  // Assess security posture maturity
  const postureScores = {
    'weak': -20,
    'basic': 0,
    'strong': 15,
    'advanced': 25
  };
  
  incidentScore += postureScores[currentSecurityPosture];
  details.push(`Security posture: ${currentSecurityPosture} - ${currentSecurityPosture === 'advanced' ? 'excellent incident prevention and response' : currentSecurityPosture === 'weak' ? 'requires immediate improvement' : 'adequate but could be enhanced'}`);
  
  // Evaluate security budget adequacy
  if (securityBudget < 25000) {
    incidentScore -= 15;
    details.push(`Limited security budget ($${(securityBudget/1000).toFixed(0)}K) may constrain incident response capabilities`);
  } else if (securityBudget > 100000) {
    incidentScore += 10;
    details.push(`Adequate security budget ($${(securityBudget/1000).toFixed(0)}K) supports robust incident response`);
  }
  
  // Factor in incident learning
  if (incidentHistory > 0 && currentSecurityPosture !== 'weak') {
    incidentScore += 5;
    details.push('Previous incidents with improved posture indicate effective learning');
  }
  
  return { 
    score: Math.max(0, Math.min(100, incidentScore)), 
    details 
  };
}

async function generateCISOOutput(proposal: string, context: SecurityContext, analyses: any): Promise<CISOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CISO (Chief Information Security Officer) analyzing a business proposal from a cybersecurity and risk management perspective.

Your role is to assess:
- Security threats and vulnerability implications
- Regulatory compliance and audit requirements
- Data protection and privacy considerations
- Access control and authentication needs
- Incident response and business continuity impact
- Security culture and training requirements

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific security recommendations.

Focus on risk mitigation, compliance adherence, and security best practices. Consider both immediate security impact and long-term security posture.`],
    ['human', `Proposal: {proposal}

Security Context:
- Current Security Posture: {currentSecurityPosture}
- Compliance Requirements: {complianceRequirements}
- Data Classification: {dataClassification}
- Threat Level: {threatLevel}
- Security Budget: ${securityBudget}
- Incident History: {incidentHistory} per year
- Security Training: {securityTraining}
- Vulnerability Score: {vulnerabilityScore}/10
- Access Controls: {accessControls}
- Data Encryption: {dataEncryption}
- Backup Strategy: {backupStrategy}

Analysis Results:
- Threat Assessment: {threatScore}/100 - {threatDetails}
- Compliance Impact: {complianceScore}/100 - {complianceDetails}
- Data Protection: {dataScore}/100 - {dataDetails}
- Access Control: {accessScore}/100 - {accessDetails}
- Incident Response: {incidentScore}/100 - {incidentDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, securityConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      currentSecurityPosture: context.currentSecurityPosture || 'Not specified',
      complianceRequirements: context.complianceRequirements?.join(', ') || 'Not specified',
      dataClassification: context.dataClassification || 'Not specified',
      threatLevel: context.threatLevel || 'Not specified',
      securityBudget: context.securityBudget || 'Not specified',
      incidentHistory: context.incidentHistory || 'Not specified',
      securityTraining: context.securityTraining || 'Not specified',
      vulnerabilityScore: context.vulnerabilityScore || 'Not specified',
      accessControls: context.accessControls || 'Not specified',
      dataEncryption: context.dataEncryption || 'Not specified',
      backupStrategy: context.backupStrategy || 'Not specified',
      threatScore: analyses.threat.score,
      threatDetails: analyses.threat.details.join('; '),
      complianceScore: analyses.compliance.score,
      complianceDetails: analyses.compliance.details.join('; '),
      dataScore: analyses.data.score,
      dataDetails: analyses.data.details.join('; '),
      accessScore: analyses.access.score,
      accessDetails: analyses.access.details.join('; '),
      incidentScore: analyses.incident.score,
      incidentDetails: analyses.incident.details.join('; ')
    }) },
    model: CISOAssessment,
    agentName: 'cisoAgent',
    defaultFactory: () => {
      const assessment = new CISOAssessment();
      assessment.reasoning = 'Error in generating security analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.securityConcerns = ['Unable to complete full security analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated security context'];
      return assessment;
    }
  });
}