import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class CLOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  legalConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.legalConcerns = [];
    this.recommendations = [];
  }
}

interface LegalContext {
  jurisdiction?: string[];
  contractualObligations?: string[];
  intellectualProperty?: 'none' | 'basic' | 'comprehensive';
  regulatoryCompliance?: string[];
  litigationRisk?: 'low' | 'medium' | 'high';
  dataPrivacyLaws?: string[];
  employmentLaw?: 'compliant' | 'needs-review' | 'non-compliant';
  corporateGovernance?: 'basic' | 'standard' | 'advanced';
  insuranceCoverage?: 'minimal' | 'adequate' | 'comprehensive';
  vendorContracts?: number;
  complianceHistory?: 'clean' | 'minor-issues' | 'major-issues';
}

/**
 * ## Agent Role
 * CLO focusing on legal compliance, risk mitigation, and regulatory adherence
 * 
 * ## Core Principles
 * 1. Ensure full regulatory compliance and legal adherence
 * 2. Minimize legal and litigation risks
 * 3. Protect intellectual property and corporate assets
 * 4. Maintain strong corporate governance standards
 * 5. Balance legal protection with business agility
 * 
 * ## Analysis Framework
 * - Regulatory Compliance: Evaluate adherence to applicable laws and regulations
 * - Contract Risk: Assess contractual obligations and vendor relationships
 * - IP Protection: Analyze intellectual property implications and protection
 * - Litigation Risk: Evaluate potential legal exposure and liability
 * - Governance: Assess corporate governance and compliance frameworks
 * - Privacy Compliance: Analyze data privacy and protection requirements
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "legalConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cloAgent(state: Record<string, any>, legalContext: LegalContext): Promise<CLOAssessment> {
  // Perform sub-analyses
  const complianceAnalysis = analyzeRegulatoryCompliance(legalContext);
  const contractAnalysis = analyzeContractRisk(legalContext);
  const ipAnalysis = analyzeIPProtection(legalContext);
  const litigationAnalysis = analyzeLitigationRisk(legalContext);
  const governanceAnalysis = analyzeGovernance(legalContext);

  // Generate structured output
  return generateCLOOutput(state.proposal, legalContext, {
    compliance: complianceAnalysis,
    contract: contractAnalysis,
    ip: ipAnalysis,
    litigation: litigationAnalysis,
    governance: governanceAnalysis
  });
}

function analyzeRegulatoryCompliance(context: LegalContext): { score: number; details: string[] } {
  const { regulatoryCompliance = [], jurisdiction = [], complianceHistory = 'clean' } = context;
  
  let complianceScore = 80; // Base score
  const details: string[] = [];
  
  // Assess regulatory complexity
  const complexRegulations = regulatoryCompliance.filter(reg =>
    ['GDPR', 'CCPA', 'HIPAA', 'SOX', 'FINRA', 'FDA', 'FTC'].some(complex =>
      reg.toUpperCase().includes(complex)
    )
  );
  
  if (complexRegulations.length > 0) {
    complianceScore -= complexRegulations.length * 10;
    details.push(`Complex regulatory requirements: ${complexRegulations.join(', ')} - requires specialized compliance expertise`);
  }
  
  // Evaluate multi-jurisdictional complexity
  if (jurisdiction.length > 3) {
    complianceScore -= 15;
    details.push(`Multi-jurisdictional operations (${jurisdiction.length} jurisdictions) increase compliance complexity`);
  } else if (jurisdiction.length > 1) {
    complianceScore -= 5;
    details.push(`Multi-jurisdictional compliance requires coordinated legal strategy`);
  }
  
  // Consider compliance history
  const historyImpact = {
    'clean': 10,
    'minor-issues': 0,
    'major-issues': -25
  };
  
  complianceScore += historyImpact[complianceHistory];
  
  if (complianceHistory === 'major-issues') {
    details.push('Previous compliance issues require enhanced monitoring and remediation');
  } else if (complianceHistory === 'clean') {
    details.push('Clean compliance history demonstrates strong legal management');
  }
  
  return { 
    score: Math.max(0, Math.min(100, complianceScore)), 
    details 
  };
}

function analyzeContractRisk(context: LegalContext): { score: number; details: string[] } {
  const { contractualObligations = [], vendorContracts = 5 } = context;
  
  let contractScore = 75; // Base score
  const details: string[] = [];
  
  // Assess contractual complexity
  const highRiskObligations = contractualObligations.filter(obligation =>
    obligation.toLowerCase().includes('penalty') ||
    obligation.toLowerCase().includes('liability') ||
    obligation.toLowerCase().includes('indemnification') ||
    obligation.toLowerCase().includes('exclusivity')
  );
  
  if (highRiskObligations.length > 0) {
    contractScore -= highRiskObligations.length * 15;
    details.push(`High-risk contractual obligations: ${highRiskObligations.length} identified - requires careful management`);
  }
  
  // Evaluate vendor contract volume
  if (vendorContracts > 20) {
    contractScore -= 15;
    details.push(`High vendor contract volume (${vendorContracts}) requires robust contract management`);
  } else if (vendorContracts > 10) {
    contractScore -= 5;
    details.push(`Moderate vendor contracts (${vendorContracts}) need systematic review`);
  }
  
  // Check for standard obligations
  if (contractualObligations.length === 0) {
    contractScore -= 10;
    details.push('No documented contractual obligations may indicate incomplete legal review');
  }
  
  return { 
    score: Math.max(0, Math.min(100, contractScore)), 
    details 
  };
}

function analyzeIPProtection(context: LegalContext): { score: number; details: string[] } {
  const { intellectualProperty = 'basic' } = context;
  
  let ipScore = 70; // Base score
  const details: string[] = [];
  
  // Assess IP protection level
  const ipScores = {
    'none': -30,
    'basic': 0,
    'comprehensive': 25
  };
  
  ipScore += ipScores[intellectualProperty];
  
  if (intellectualProperty === 'none') {
    details.push('No IP protection creates significant competitive and legal risks');
  } else if (intellectualProperty === 'comprehensive') {
    details.push('Comprehensive IP protection provides strong competitive advantages');
  } else {
    details.push('Basic IP protection covers fundamentals but could be enhanced');
  }
  
  return { 
    score: Math.max(0, Math.min(100, ipScore)), 
    details 
  };
}

function analyzeLitigationRisk(context: LegalContext): { score: number; details: string[] } {
  const { litigationRisk = 'medium', insuranceCoverage = 'adequate', employmentLaw = 'compliant' } = context;
  
  let litigationScore = 70; // Base score (higher is better)
  const details: string[] = [];
  
  // Assess litigation risk level
  const riskImpact = {
    'low': 20,
    'medium': 0,
    'high': -30
  };
  
  litigationScore += riskImpact[litigationRisk];
  details.push(`Litigation risk: ${litigationRisk} - ${litigationRisk === 'high' ? 'requires immediate risk mitigation' : litigationRisk === 'low' ? 'minimal legal exposure' : 'manageable with proper controls'}`);
  
  // Evaluate insurance coverage
  const insuranceScores = {
    'minimal': -15,
    'adequate': 0,
    'comprehensive': 15
  };
  
  litigationScore += insuranceScores[insuranceCoverage];
  
  if (insuranceCoverage === 'minimal') {
    details.push('Minimal insurance coverage increases financial exposure to legal claims');
  } else if (insuranceCoverage === 'comprehensive') {
    details.push('Comprehensive insurance coverage provides strong protection against legal claims');
  }
  
  // Consider employment law compliance
  const employmentImpact = {
    'compliant': 10,
    'needs-review': -5,
    'non-compliant': -20
  };
  
  litigationScore += employmentImpact[employmentLaw];
  
  if (employmentLaw === 'non-compliant') {
    details.push('Employment law non-compliance creates significant litigation exposure');
  }
  
  return { 
    score: Math.max(0, Math.min(100, litigationScore)), 
    details 
  };
}

function analyzeGovernance(context: LegalContext): { score: number; details: string[] } {
  const { corporateGovernance = 'standard', dataPrivacyLaws = [] } = context;
  
  let governanceScore = 75; // Base score
  const details: string[] = [];
  
  // Assess governance maturity
  const governanceScores = {
    'basic': -10,
    'standard': 0,
    'advanced': 20
  };
  
  governanceScore += governanceScores[corporateGovernance];
  details.push(`Corporate governance: ${corporateGovernance} - ${corporateGovernance === 'advanced' ? 'excellent oversight and compliance' : corporateGovernance === 'basic' ? 'needs enhancement' : 'meets standard requirements'}`);
  
  // Evaluate privacy law compliance
  const complexPrivacyLaws = dataPrivacyLaws.filter(law =>
    ['GDPR', 'CCPA', 'PIPEDA', 'LGPD'].some(complex =>
      law.toUpperCase().includes(complex)
    )
  );
  
  if (complexPrivacyLaws.length > 0) {
    governanceScore -= complexPrivacyLaws.length * 10;
    details.push(`Complex privacy law requirements: ${complexPrivacyLaws.join(', ')} - requires specialized compliance programs`);
  }
  
  if (dataPrivacyLaws.length > 3) {
    governanceScore -= 5;
    details.push(`Multiple privacy law jurisdictions (${dataPrivacyLaws.length}) increase governance complexity`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, governanceScore)), 
    details 
  };
}

async function generateCLOOutput(proposal: string, context: LegalContext, analyses: any): Promise<CLOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CLO (Chief Legal Officer) analyzing a business proposal from a legal compliance and risk management perspective.

Your role is to assess:
- Regulatory compliance and legal adherence requirements
- Contractual obligations and vendor relationship risks
- Intellectual property protection and implications
- Litigation risk and liability exposure
- Corporate governance and compliance frameworks
- Data privacy and protection legal requirements

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific legal recommendations.

Focus on legal risk mitigation, compliance adherence, and regulatory requirements. Consider both immediate legal impact and long-term legal sustainability.`],
    ['human', `Proposal: {proposal}

Legal Context:
- Jurisdiction: {jurisdiction}
- Contractual Obligations: {contractualObligations}
- Intellectual Property: {intellectualProperty}
- Regulatory Compliance: {regulatoryCompliance}
- Litigation Risk: {litigationRisk}
- Data Privacy Laws: {dataPrivacyLaws}
- Employment Law: {employmentLaw}
- Corporate Governance: {corporateGovernance}
- Insurance Coverage: {insuranceCoverage}
- Vendor Contracts: {vendorContracts}
- Compliance History: {complianceHistory}

Analysis Results:
- Regulatory Compliance: {complianceScore}/100 - {complianceDetails}
- Contract Risk: {contractScore}/100 - {contractDetails}
- IP Protection: {ipScore}/100 - {ipDetails}
- Litigation Risk: {litigationScore}/100 - {litigationDetails}
- Governance: {governanceScore}/100 - {governanceDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, legalConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      jurisdiction: context.jurisdiction?.join(', ') || 'Not specified',
      contractualObligations: context.contractualObligations?.join(', ') || 'Not specified',
      intellectualProperty: context.intellectualProperty || 'Not specified',
      regulatoryCompliance: context.regulatoryCompliance?.join(', ') || 'Not specified',
      litigationRisk: context.litigationRisk || 'Not specified',
      dataPrivacyLaws: context.dataPrivacyLaws?.join(', ') || 'Not specified',
      employmentLaw: context.employmentLaw || 'Not specified',
      corporateGovernance: context.corporateGovernance || 'Not specified',
      insuranceCoverage: context.insuranceCoverage || 'Not specified',
      vendorContracts: context.vendorContracts || 'Not specified',
      complianceHistory: context.complianceHistory || 'Not specified',
      complianceScore: analyses.compliance.score,
      complianceDetails: analyses.compliance.details.join('; '),
      contractScore: analyses.contract.score,
      contractDetails: analyses.contract.details.join('; '),
      ipScore: analyses.ip.score,
      ipDetails: analyses.ip.details.join('; '),
      litigationScore: analyses.litigation.score,
      litigationDetails: analyses.litigation.details.join('; '),
      governanceScore: analyses.governance.score,
      governanceDetails: analyses.governance.details.join('; ')
    }) },
    model: CLOAssessment,
    agentName: 'cloAgent',
    defaultFactory: () => {
      const assessment = new CLOAssessment();
      assessment.reasoning = 'Error in generating legal analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.legalConcerns = ['Unable to complete full legal analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated legal context'];
      return assessment;
    }
  });
}