// Central export file for all agent implementations
export { hrAgent } from './hrAgent';
export { ctoAgent } from './ctoAgent';
export { cfoAgent } from './cfoAgent';
export { cmoAgent } from './cmoAgent';
export { cooAgent } from './cooAgent';
export { cpoAgent } from './cpoAgent';

// Export agent types for type safety
export type { HRAssessment } from './hrAgent';
export type { CTOAssessment } from './ctoAgent';
export type { CFOAssessment } from './cfoAgent';
export type { CMOAssessment } from './cmoAgent';
export type { COOAssessment } from './cooAgent';
export type { CPOAssessment } from './cpoAgent';

// Export context interfaces
export type { 
  HRContext,
  TechContext,
  FinancialContext,
  MarketingContext,
  OperationalContext,
  ProductContext
} from './types';

/**
 * Agent Implementation Guide
 * 
 * All agents follow the same sophisticated architecture pattern:
 * 
 * 1. **Role Definition**: Clear C-level role with specific expertise
 * 2. **Core Principles**: 5 key principles guiding decision-making
 * 3. **Analysis Framework**: Multiple sub-analyses for comprehensive evaluation
 * 4. **Structured Output**: Consistent assessment format with confidence scoring
 * 5. **LLM Integration**: Uses central callLLM utility with error handling
 * 6. **Domain Expertise**: Role-specific analysis functions and metrics
 * 
 * Each agent provides:
 * - Assessment (approve/reject/neutral)
 * - Confidence score (0-100)
 * - Detailed reasoning
 * - Role-specific concerns array
 * - Actionable recommendations array
 * 
 * The agents are designed to work together in boardroom simulations,
 * providing diverse C-level perspectives on business proposals.
 */