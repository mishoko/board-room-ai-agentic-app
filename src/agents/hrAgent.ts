import { callLLM } from '../utils/llm';
import { ChatPromptTemplate } from 'langchain/prompts';

type Assessment = 'approve' | 'reject' | 'neutral';

class HRAssessment {
  assessment: Assessment;
  confidence: number;
  reasoning: string;
  talentConcerns: string[];
  hiringRecommendations: string[];

  constructor() {
    this.assessment = 'neutral';
    this.confidence = 0;
    this.reasoning = '';
    this.talentConcerns = [];
    this.hiringRecommendations = [];
  }
}

interface HRContext {
  requiredSkills?: string[];
  teamSkills?: Record<string, number>;
  currentWorkload?: number;
  workloadIncrease?: number;
  teamSentiment?: string;
  avgHireTime?: number;
}

/**
 * ## Agent Role
 * CHRO focusing on organizational capability, talent strategy, and cultural impact
 * 
 * ## Core Principles
 * 1. Prioritize sustainable team growth over rapid scaling
 * 2. Ensure cultural alignment with organizational values
 * 3. Assess realistic talent acquisition timelines
 * 4. Evaluate impact on employee engagement and retention
 * 5. Balance skill requirements with development opportunities
 * 
 * ## Analysis Framework
 * - Talent Availability: Evaluate market availability of required skills
 * - Team Impact: Assess workload and cultural implications
 * - Hiring Feasibility: Analyze recruitment timeline and success probability
 * - Skills Gap: Identify training vs hiring needs
 * - Cultural Fit: Ensure alignment with company values and stage
 * 
 * ## Output Structure
 * ```json
 * {
 *   "assessment": "approve|reject|neutral",
 *   "confidence": 0-100,
 *   "reasoning": "string",
 *   "talentConcerns": ["concern1", "concern2"],
 *   "hiringRecommendations": ["rec1", "rec2"]
 * }
 * ```
 */
export async function hrAgent(state: Record<string, any>, hrContext: HRContext): Promise<HRAssessment> {
  // Perform sub-analyses
  const talentAnalysis = analyzeTalentAvailability(hrContext);
  const teamImpactAnalysis = analyzeTeamImpact(hrContext);
  const hiringAnalysis = analyzeHiringNeeds(hrContext);

  // Generate structured output
  return generateHROutput(state.proposal, hrContext, {
    talent: talentAnalysis,
    teamImpact: teamImpactAnalysis,
    hiring: hiringAnalysis
  });
}

function analyzeTalentAvailability(context: HRContext): { score: number; details: string[] } {
  const { requiredSkills = [], teamSkills = {}, avgHireTime = 90 } = context;
  
  // Calculate talent availability score based on skill rarity and market conditions
  let availabilityScore = 70; // Base score
  const details: string[] = [];
  
  // Assess skill rarity
  const rareSkills = requiredSkills.filter(skill => 
    ['AI/ML', 'Blockchain', 'Quantum Computing', 'Advanced Security'].some(rare => 
      skill.toLowerCase().includes(rare.toLowerCase())
    )
  );
  
  if (rareSkills.length > 0) {
    availabilityScore -= rareSkills.length * 15;
    details.push(`Rare skills identified: ${rareSkills.join(', ')} - limited market availability`);
  }
  
  // Check existing team capabilities
  const skillGaps = requiredSkills.filter(skill => !teamSkills[skill] || teamSkills[skill] < 3);
  if (skillGaps.length > requiredSkills.length * 0.7) {
    availabilityScore -= 20;
    details.push(`Significant skill gaps: ${skillGaps.length}/${requiredSkills.length} skills missing`);
  }
  
  // Factor in hiring timeline
  if (avgHireTime > 120) {
    availabilityScore -= 15;
    details.push(`Extended hiring timeline: ${avgHireTime} days average`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, availabilityScore)), 
    details 
  };
}

function analyzeTeamImpact(context: HRContext): { score: number; details: string[] } {
  const { currentWorkload = 80, workloadIncrease = 20, teamSentiment = 'neutral' } = context;
  
  let impactScore = 70; // Base score
  const details: string[] = [];
  
  // Assess current workload
  if (currentWorkload > 85) {
    impactScore -= 25;
    details.push(`Team already at high capacity: ${currentWorkload}% utilization`);
  }
  
  // Evaluate workload increase
  const projectedWorkload = currentWorkload + workloadIncrease;
  if (projectedWorkload > 95) {
    impactScore -= 30;
    details.push(`Projected workload unsustainable: ${projectedWorkload}% utilization`);
  }
  
  // Factor in team sentiment
  const sentimentImpact = {
    'positive': 10,
    'neutral': 0,
    'negative': -20,
    'concerned': -15
  };
  
  impactScore += sentimentImpact[teamSentiment] || 0;
  if (teamSentiment !== 'positive') {
    details.push(`Team sentiment: ${teamSentiment} - may affect adoption and performance`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, impactScore)), 
    details 
  };
}

function analyzeHiringNeeds(context: HRContext): { score: number; details: string[] } {
  const { requiredSkills = [], teamSkills = {}, avgHireTime = 90 } = context;
  
  let feasibilityScore = 75; // Base score
  const details: string[] = [];
  
  // Calculate hiring vs training ratio
  const skillsNeedingHiring = requiredSkills.filter(skill => 
    !teamSkills[skill] || teamSkills[skill] < 2
  );
  
  const hiringRatio = skillsNeedingHiring.length / requiredSkills.length;
  
  if (hiringRatio > 0.6) {
    feasibilityScore -= 25;
    details.push(`High hiring dependency: ${Math.round(hiringRatio * 100)}% of skills require external hiring`);
  }
  
  // Assess market competition for talent
  const competitiveSkills = requiredSkills.filter(skill =>
    ['React', 'Python', 'AWS', 'DevOps', 'Data Science'].some(competitive =>
      skill.toLowerCase().includes(competitive.toLowerCase())
    )
  );
  
  if (competitiveSkills.length > 0) {
    feasibilityScore -= 15;
    details.push(`Competitive talent market for: ${competitiveSkills.join(', ')}`);
  }
  
  // Factor in hiring timeline constraints
  if (avgHireTime > 90) {
    feasibilityScore -= 10;
    details.push(`Extended hiring timeline may delay project execution`);
  }
  
  return { 
    score: Math.max(0, Math.min(100, feasibilityScore)), 
    details 
  };
}

async function generateHROutput(proposal: string, context: HRContext, analyses: any): Promise<HRAssessment> {
  const template = ChatPromptTemplate.fromMessages([
    ['system', `You are an experienced CHRO analyzing a business proposal from a people and organizational perspective.

Your role is to assess:
- Talent availability and acquisition feasibility
- Impact on current team capacity and morale
- Cultural alignment and organizational readiness
- Skills development vs hiring trade-offs
- Timeline realism for people-related deliverables

Provide a structured JSON response with your assessment, confidence level, reasoning, and specific recommendations.

Focus on practical people challenges and realistic solutions. Consider both immediate needs and long-term organizational health.`],
    ['human', `Proposal: {proposal}

HR Context:
- Required Skills: {requiredSkills}
- Current Team Skills: {teamSkills}
- Current Workload: {currentWorkload}%
- Workload Increase: {workloadIncrease}%
- Team Sentiment: {teamSentiment}
- Average Hire Time: {avgHireTime} days

Analysis Results:
- Talent Availability: {talentScore}/100 - {talentDetails}
- Team Impact: {teamScore}/100 - {teamDetails}
- Hiring Feasibility: {hiringScore}/100 - {hiringDetails}

Return JSON response with assessment (approve/reject/neutral), confidence (0-100), reasoning, talentConcerns array, and hiringRecommendations array:`]
  ]);

  const prompt = await template.format({
    proposal,
    requiredSkills: context.requiredSkills?.join(', ') || 'Not specified',
    teamSkills: JSON.stringify(context.teamSkills || {}),
    currentWorkload: context.currentWorkload || 'Unknown',
    workloadIncrease: context.workloadIncrease || 'Unknown',
    teamSentiment: context.teamSentiment || 'Unknown',
    avgHireTime: context.avgHireTime || 'Unknown',
    talentScore: analyses.talent.score,
    talentDetails: analyses.talent.details.join('; '),
    teamScore: analyses.teamImpact.score,
    teamDetails: analyses.teamImpact.details.join('; '),
    hiringScore: analyses.hiring.score,
    hiringDetails: analyses.hiring.details.join('; ')
  });

  return callLLM({
    prompt: { toMessages: () => template.formatMessages({
      proposal,
      requiredSkills: context.requiredSkills?.join(', ') || 'Not specified',
      teamSkills: JSON.stringify(context.teamSkills || {}),
      currentWorkload: context.currentWorkload || 'Unknown',
      workloadIncrease: context.workloadIncrease || 'Unknown',
      teamSentiment: context.teamSentiment || 'Unknown',
      avgHireTime: context.avgHireTime || 'Unknown',
      talentScore: analyses.talent.score,
      talentDetails: analyses.talent.details.join('; '),
      teamScore: analyses.teamImpact.score,
      teamDetails: analyses.teamImpact.details.join('; '),
      hiringScore: analyses.hiring.score,
      hiringDetails: analyses.hiring.details.join('; ')
    }) },
    model: HRAssessment,
    agentName: 'hrAgent',
    defaultFactory: () => {
      const assessment = new HRAssessment();
      assessment.reasoning = 'Error in generating HR analysis - defaulting to neutral assessment';
      assessment.confidence = 50;
      assessment.talentConcerns = ['Unable to complete full analysis due to system error'];
      assessment.hiringRecommendations = ['Retry analysis with updated context'];
      return assessment;
    }
  });
}

/**
 * ## Example Interaction
 * 
 * Input:
 * ```javascript
 * const proposal = "Launch AI-powered customer service platform requiring ML engineers and data scientists";
 * const context = {
 *   requiredSkills: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
 *   teamSkills: { "Python": 4, "Machine Learning": 2, "TensorFlow": 1, "Data Science": 3 },
 *   currentWorkload: 85,
 *   workloadIncrease: 25,
 *   teamSentiment: "concerned",
 *   avgHireTime: 120
 * };
 * ```
 * 
 * Output:
 * ```json
 * {
 *   "assessment": "neutral",
 *   "confidence": 65,
 *   "reasoning": "While the team has foundational ML skills, the combination of high current workload, significant skill gaps in TensorFlow, and extended hiring timeline creates execution risks. Team sentiment concerns suggest change management challenges.",
 *   "talentConcerns": [
 *     "Limited TensorFlow expertise in current team",
 *     "120-day hiring timeline may delay project launch",
 *     "Team already at 85% capacity with 25% increase projected"
 *   ],
 *   "hiringRecommendations": [
 *     "Prioritize senior ML engineer with TensorFlow expertise",
 *     "Consider contracting specialists for initial implementation",
 *     "Implement skills development program for existing team",
 *     "Address team concerns through transparent communication"
 *   ]
 * }
 * ```
 */