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