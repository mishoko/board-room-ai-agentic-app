// Shared type definitions for all agent contexts

export interface HRContext {
  requiredSkills?: string[];
  teamSkills?: Record<string, number>;
  currentWorkload?: number;
  workloadIncrease?: number;
  teamSentiment?: string;
  avgHireTime?: number;
}

export interface TechContext {
  requiredSkills?: string[];
  currentArchitecture?: string;
  techDebtLevel?: number;
  resourceAvailability?: number;
  performanceRequirements?: string[];
  securityRequirements?: string[];
  scalabilityNeeds?: string;
}

export interface FinancialContext {
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

export interface MarketingContext {
  targetAudience?: string[];
  marketSize?: number;
  competitorAnalysis?: string[];
  brandAlignment?: number; // 1-10 scale
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  marketingBudget?: number;
  launchTimeline?: number; // months
  brandRisk?: 'low' | 'medium' | 'high';
  customerFeedback?: string[];
}

export interface OperationalContext {
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

export interface ProductContext {
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

// New context interfaces for specialized agents

export interface EngineeringContext {
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

export interface RevenueContext {
  currentRevenue?: number;
  revenueGrowthRate?: number; // percentage
  salesCycleLength?: number; // months
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  churnRate?: number; // percentage
  salesTeamSize?: number;
  conversionRate?: number; // percentage
  averageDealSize?: number;
  pipelineValue?: number;
  marketPenetration?: number; // percentage
  competitivePressure?: 'low' | 'medium' | 'high';
}

export interface SecurityContext {
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

export interface LegalContext {
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

export interface DataContext {
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

export interface StrategyContext {
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

export interface CultureContext {
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

export interface AIContext {
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

export interface GrowthContext {
  currentGrowthRate?: number; // percentage
  targetGrowthRate?: number; // percentage
  marketExpansion?: 'local' | 'regional' | 'national' | 'global';
  customerSegments?: number;
  productPortfolio?: number;
  scalabilityIndex?: number; // 1-10 scale
  competitiveAdvantage?: 'none' | 'weak' | 'moderate' | 'strong' | 'dominant';
  growthInvestment?: number; // budget allocation
  customerRetention?: number; // percentage
  marketShare?: number; // percentage
  growthChannels?: string[];
  innovationPipeline?: 'empty' | 'limited' | 'moderate' | 'robust';
}

// Base assessment interface that all agents implement
export interface BaseAssessment {
  assessment: 'approve' | 'reject' | 'neutral';
  confidence: number; // 0-100
  reasoning: string;
}

// Agent-specific assessment extensions
export interface HRAssessment extends BaseAssessment {
  talentConcerns: string[];
  hiringRecommendations: string[];
}

export interface CTOAssessment extends BaseAssessment {
  techConcerns: string[];
  recommendations: string[];
}

export interface CFOAssessment extends BaseAssessment {
  financialConcerns: string[];
  recommendations: string[];
}

export interface CMOAssessment extends BaseAssessment {
  marketingConcerns: string[];
  recommendations: string[];
}

export interface COOAssessment extends BaseAssessment {
  operationalConcerns: string[];
  recommendations: string[];
}

export interface CPOAssessment extends BaseAssessment {
  productConcerns: string[];
  recommendations: string[];
}

export interface CVCOAssessment extends BaseAssessment {
  engineeringConcerns: string[];
  recommendations: string[];
}

export interface CROAssessment extends BaseAssessment {
  revenueConcerns: string[];
  recommendations: string[];
}

export interface CISOAssessment extends BaseAssessment {
  securityConcerns: string[];
  recommendations: string[];
}

export interface CLOAssessment extends BaseAssessment {
  legalConcerns: string[];
  recommendations: string[];
}

export interface CDOAssessment extends BaseAssessment {
  dataConcerns: string[];
  recommendations: string[];
}

export interface CSOAssessment extends BaseAssessment {
  strategyConcerns: string[];
  recommendations: string[];
}

export interface CHCOAssessment extends BaseAssessment {
  cultureConcerns: string[];
  recommendations: string[];
}

export interface CAIOAssessment extends BaseAssessment {
  aiConcerns: string[];
  recommendations: string[];
}

export interface CGROAssessment extends BaseAssessment {
  growthConcerns: string[];
  recommendations: string[];
}