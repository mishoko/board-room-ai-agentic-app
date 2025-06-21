import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class COOAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  operationalConcerns: string[];
  recommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.operationalConcerns = [];
    this.recommendations = [];
  }
}

interface OperationalContext {
  currentCapacity?: number; // percentage
  requiredCapacityIncrease?: number; // percentage
  processComplexity?: 'low' | 'medium' | 'high';
  qualityRequirements?: string[];
  complianceRequirements?: string[];
  vendorDependencies?: string[];
  implementationTimeline?: number; // months
  operationalRisk?: 'low' | 'medium' | 'high';
  scalabilityNeeds?: 'low' | 'medium' | 'high';
  existingProcesses?: string[];
}

/**
 * ## Agent Role
 * COO focusing on operational excellence, process optimization, and execution feasibility
 * 
 * ## Core Principles
 * 1. Prioritize operational efficiency and process scalability
 * 2. Assess execution feasibility against current capabilities
 * 3. Evaluate quality and compliance implications
 * 4. Ensure sustainable operational growth
 * 5. Balance innovation with operational stability
 * 
 * ## Analysis Framework
 * - Capacity Analysis: Evaluate current capacity against requirements
 * - Process Impact: Assess impact on existing operational processes
 * - Quality Assurance: Analyze quality control and compliance requirements
 * - Vendor Management: Evaluate supplier and vendor dependencies
 * - Implementation Feasibility: Assess execution timeline and complexity
 * - Risk Management: Analyze operational risks and mitigation strategies
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "operationalConcerns": ["concern1", "concern2"],
 *   "recommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function cooAgent(state: Record<string, any>, operationalContext: OperationalContext): Promise<COOAssessment> {
  // Perform sub-analyses
  const capacityAnalysis = analyzeCapacity(operationalContext);
  const processAnalysis = analyzeProcessImpact(operationalContext);
  const qualityAnalysis = analyzeQualityRequirements(operationalContext);
  const vendorAnalysis = analyzeVendorDependencies(operationalContext);
  const implementationAnalysis = analyzeImplementationFeasibility(operationalContext);
  const riskAnalysis = analyzeOperationalRisk(operationalContext);

  // Generate structured output
  return generateCOOOutput(state.proposal, operationalContext, {
    capacity: capacityAnalysis,
    process: processAnalysis,
    quality: qualityAnalysis,
    vendor: vendorAnalysis,
    implementation: implementationAnalysis,
    risk: riskAnalysis
  });
}

function analyzeCapacity(context: OperationalContext): { score: number; details: string[] } {
  const { currentCapacity = 80, requiredCapacityIncrease = 20, scalabilityNeeds = 'medium' } = context;
  
  let capacityScore = 70; // Base score
  const details: string[] = [];
  
  // Assess current capacity utilization
  if (currentCapacity > 90) {
    capacityScore -= 25;
    details.push(`Critical capacity utilization (${currentCapacity}%) leaves no buffer for growth`);
  } else if (currentCapacity > 80) {
    capacityScore -= 15;
    details.push(`High capacity utilization (${currentCapacity}%) requires immediate scaling`);
  } else if (currentCapacity > 70) {
    capacityScore -= 5;
    details.push(`Moderate capacity utilization (${currentCapacity}%) manageable with planning`);
  } else {
    capacityScore += 10;
    details.push(`Good capacity headroom (${currentCapacity}%) supports growth initiatives`);
  }
  
  // Evaluate required capacity increase
  const projectedCapacity = currentCapacity + requiredCapacityIncrease;
  if (projectedCapacity > 100) {
    capacityScore -= 30;
    details.push(`Projected capacity (${projectedCapacity}%) exceeds maximum - requires infrastructure expansion`);
  } else if (projectedCapacity > 90) {
    capacityScore -= 20;
    details.push(`Projected capacity (${projectedCapacity}%) approaches limits - scaling critical`);
  }
  
  // Consider scalability requirements
  const scalabilityImpact = {
    'low': 5,
    'medium': 0,
    'high': -15
  };
  
  capacityScore += scalabilityImpact[scalabilityNeeds];
  if (scalabilityNeeds === 'high') {
    details.push('High scalability requirements demand significant operational infrastructure investment');
  }
  
  return { 
    score: Math.max(0, Math.min(100, capacityScore)), 
    details 
  };
}

function analyzeProcessImpact(context: OperationalContext): { score: number; details: string[] } {
  const { processComplexity = 'medium', existingProcesses = [] } = context;
  
  let processScore = 70; // Base score
  const details: string[] = [];
  
  // Assess process complexity
  const complexityImpact = {
    'low': 15,
    'medium': 0,
    'high': -20
  };
  
  processScore += complexityImpact[processComplexity];
  details.push(`Process complexity: ${processComplexity} - ${processComplexity === 'high' ? 'requires significant process redesign' : 'manageable with current capabilities'}`);
  
  // Evaluate existing process integration
  if (existingProcesses.length === 0) {
    processScore -= 10;
    details.push('No existing process documentation creates integration uncertainty');
  } else if (existingProcesses.length > 10) {
    processScore -= 15;
    details.push(`Complex process landscape (${existingProcesses.length} processes) increases integration risk`);
  } else {
    processScore += 5;
    details.push(`Manageable process integration with ${existingProcesses.length} existing processes`);
  }
  
  // Check for process standardization opportunities
  const standardProcesses = existingProcesses.filter(process =>
    process.toLowerCase().includes('standard') || 
    process.toLowerCase().includes('automated') ||
    process.toLowerCase().includes('optimized')
  );
  
  if (standardProcesses.length > existingProcesses.length * 0.5) {
    processScore += 10;
    details.push('Well-standardized existing processes support efficient integration');
  }
  
  return { 
    score: Math.max(0, Math.min(100, processScore)), 
    details 
  };
}

function analyzeQualityRequirements(context: OperationalContext): { score: number; details: string[] } {
  const { qualityRequirements = [], complianceRequirements = [] } = context;
  
  let qualityScore = 75; // Base score
  const details: string[] = [];
  
  // Assess quality requirement complexity
  const complexQualityReqs = qualityRequirements.filter(req =>
    req.toLowerCase().includes('iso') ||
    req.toLowerCase().includes('six sigma') ||
    req.toLowerCase().includes('certification') ||
    req.toLowerCase().includes('audit')
  );
  
  if (complexQualityReqs.length > 0) {
    qualityScore -= complexQualityReqs.length * 10;
    details.push(`Complex quality requirements: ${complexQualityReqs.join(', ')} - requires specialized QA processes`);
  }
  
  // Evaluate compliance burden
  const regulatoryCompliance = complianceRequirements.filter(req =>
    ['GDPR', 'HIPAA', 'SOX', 'FDA', 'ISO', 'SOC2'].some(regulation =>
      req.toUpperCase().includes(regulation)
    )
  );
  
  if (regulatoryCompliance.length > 0) {
    qualityScore -= regulatoryCompliance.length * 15;
    details.push(`Regulatory compliance required: ${regulatoryCompliance.join(', ')} - adds operational overhead`);
  }
  
  // Check for quality automation opportunities
  if (qualityRequirements.some(req => req.toLowerCase().includes('automated'))) {
    qualityScore += 10;
    details.push('Automated quality processes reduce manual oversight burden');
  }
  
  return { 
    score: Math.max(0, Math.min(100, qualityScore)), 
    details 
  };
}

function analyzeVendorDependencies(context: OperationalContext): { score: number; details: string[] } {
  const { vendorDependencies = [] } = context;
  
  let vendorScore = 80; // Base score
  const details: string[] = [];
  
  if (vendorDependencies.length === 0) {
    details.push('No external vendor dependencies simplifies operational control');
  } else if (vendorDependencies.length <= 3) {
    vendorScore -= 5;
    details.push(`Limited vendor dependencies (${vendorDependencies.length}) manageable with standard contracts`);
  } else if (vendorDependencies.length <= 6) {
    vendorScore -= 15;
    details.push(`Multiple vendor dependencies (${vendorDependencies.length}) require enhanced vendor management`);
  } else {
    vendorScore -= 25;
    details.push(`High vendor dependency (${vendorDependencies.length} vendors) creates operational complexity and risk`);
  }
  
  // Check for critical vendor dependencies
  const criticalVendors = vendorDependencies.filter(vendor =>
    vendor.toLowerCase().includes('critical') ||
    vendor.toLowerCase().includes('sole source') ||
    vendor.toLowerCase().includes('exclusive')
  );
  
  if (criticalVendors.length > 0) {
    vendorScore -= 20;
    details.push(`Critical vendor dependencies: ${criticalVendors.join(', ')} - requires contingency planning`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, vendorScore)), 
    details 
  };
}

function analyzeImplementationFeasibility(context: OperationalContext): { score: number; details: string[] } {
  const { implementationTimeline = 12, processComplexity = 'medium', operationalRisk = 'medium' } = context;
  
  let implementationScore = 70; // Base score
  const details: string[] = [];
  
  // Assess timeline realism
  if (implementationTimeline <= 3) {
    implementationScore -= 25;
    details.push(`Aggressive timeline (${implementationTimeline} months) creates execution risk`);
  } else if (implementationTimeline <= 6) {
    implementationScore -= 10;
    details.push(`Tight timeline (${implementationTimeline} months) requires focused execution`);
  } else if (implementationTimeline <= 12) {
    implementationScore += 5;
    details.push(`Reasonable timeline (${implementationTimeline} months) allows proper planning`);
  } else {
    implementationScore -= 5;
    details.push(`Extended timeline (${implementationTimeline} months) may lose momentum`);
  }
  
  // Factor in complexity and risk
  if (processComplexity === 'high' && implementationTimeline <= 6) {
    implementationScore -= 20;
    details.push('High complexity with short timeline significantly increases implementation risk');
  }
  
  if (operationalRisk === 'high') {
    implementationScore -= 15;
    details.push('High operational risk requires enhanced change management and monitoring');
  }
  
  return { 
    score: Math.max(0, Math.min(100, implementationScore)), 
    details 
  };
}

function analyzeOperationalRisk(context: OperationalContext): { score: number; details: string[] } {
  const { operationalRisk = 'medium', vendorDependencies = [], complianceRequirements = [] } = context;
  
  let riskScore = 70; // Base score (higher is better)
  const details: string[] = [];
  
  // Assess stated operational risk
  const riskImpact = {
    'low': 15,
    'medium': 0,
    'high': -25
  };
  
  riskScore += riskImpact[operationalRisk];
  details.push(`Operational risk level: ${operationalRisk} - ${operationalRisk === 'high' ? 'requires comprehensive risk mitigation' : 'manageable with standard controls'}`);
  
  // Factor in vendor risk
  if (vendorDependencies.length > 5) {
    riskScore -= 15;
    details.push('High vendor dependency increases operational risk exposure');
  }
  
  // Consider compliance risk
  if (complianceRequirements.length > 3) {
    riskScore -= 10;
    details.push('Multiple compliance requirements increase regulatory risk');
  }
  
  // Check for risk mitigation indicators
  const riskMitigationKeywords = ['backup', 'redundancy', 'failover', 'contingency'];
  const hasMitigation = vendorDependencies.some(vendor =>
    riskMitigationKeywords.some(keyword => vendor.toLowerCase().includes(keyword))
  );
  
  if (hasMitigation) {
    riskScore += 10;
    details.push('Risk mitigation strategies identified in vendor planning');
  }
  
  return { 
    score: Math.max(0, Math.min(100, riskScore)), 
    details 
  };
}

async function generateCOOOutput(proposal: string, context: OperationalContext, analyses: any): Promise<COOAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced COO analyzing a business proposal from an operational excellence and execution perspective.

Your role is to assess:
- Operational capacity and scalability requirements
- Process integration and workflow implications
- Quality assurance and compliance obligations
- Vendor management and supply chain dependencies
- Implementation feasibility and execution timeline
- Operational risk factors and mitigation strategies

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific operational recommendations.

Focus on execution excellence, process optimization, and sustainable operational growth. Consider both immediate operational impact and long-term scalability.`],
    ['human', `Proposal: {proposal}

Operational Context:
- Current Capacity: {currentCapacity}%
- Required Capacity Increase: {requiredCapacityIncrease}%
- Process Complexity: {processComplexity}
- Quality Requirements: {qualityRequirements}
- Compliance Requirements: {complianceRequirements}
- Vendor Dependencies: {vendorDependencies}
- Implementation Timeline: {implementationTimeline} months
- Operational Risk: {operationalRisk}
- Scalability Needs: {scalabilityNeeds}
- Existing Processes: {existingProcesses}

Analysis Results:
- Capacity Analysis: {capacityScore}/100 - {capacityDetails}
- Process Impact: {processScore}/100 - {processDetails}
- Quality Requirements: {qualityScore}/100 - {qualityDetails}
- Vendor Dependencies: {vendorScore}/100 - {vendorDetails}
- Implementation Feasibility: {implementationScore}/100 - {implementationDetails}
- Operational Risk: {riskScore}/100 - {riskDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, operationalConcerns array, and recommendations array:`]
  ]);

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      currentCapacity: context.currentCapacity || 'Not specified',
      requiredCapacityIncrease: context.requiredCapacityIncrease || 'Not specified',
      processComplexity: context.processComplexity || 'Not specified',
      qualityRequirements: context.qualityRequirements?.join(', ') || 'Not specified',
      complianceRequirements: context.complianceRequirements?.join(', ') || 'Not specified',
      vendorDependencies: context.vendorDependencies?.join(', ') || 'Not specified',
      implementationTimeline: context.implementationTimeline || 'Not specified',
      operationalRisk: context.operationalRisk || 'Not specified',
      scalabilityNeeds: context.scalabilityNeeds || 'Not specified',
      existingProcesses: context.existingProcesses?.join(', ') || 'Not specified',
      capacityScore: analyses.capacity.score,
      capacityDetails: analyses.capacity.details.join('; '),
      processScore: analyses.process.score,
      processDetails: analyses.process.details.join('; '),
      qualityScore: analyses.quality.score,
      qualityDetails: analyses.quality.details.join('; '),
      vendorScore: analyses.vendor.score,
      vendorDetails: analyses.vendor.details.join('; '),
      implementationScore: analyses.implementation.score,
      implementationDetails: analyses.implementation.details.join('; '),
      riskScore: analyses.risk.score,
      riskDetails: analyses.risk.details.join('; ')
    }) },
    model: COOAssessment,
    agentName: 'cooAgent',
    defaultFactory: () => {
      const assessment = new COOAssessment();
      assessment.reasoning = 'Error in generating operational analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.operationalConcerns = ['Unable to complete full operational analysis due to system error'];
      assessment.recommendations = ['Retry analysis with updated operational context'];
      return assessment;
    }
  });
}