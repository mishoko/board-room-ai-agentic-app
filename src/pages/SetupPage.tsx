import React, { useState } from 'react';
import { Users, Plus, X, Building, Target, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Agent, Topic, CompanyContext, BoardroomSession } from '../types';
import { LLMService } from '../services/LLMService';

interface SetupPageProps {
  onSessionStart: (session: BoardroomSession) => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onSessionStart }) => {
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [companyContext, setCompanyContext] = useState<CompanyContext>({
    name: '',
    industry: '',
    size: '',
    stage: '',
    description: '',
    challenges: [],
    goals: []
  });
  const [currentStep, setCurrentStep] = useState<'agents' | 'topics' | 'context' | 'review'>('agents');
  const [newChallenge, setNewChallenge] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false);

  // Original creative executive templates with the Chief Vibe Coding Officer and others
  const availableAgents: Omit<Agent, 'id' | 'isActive'>[] = [
    {
      role: 'CEO',
      name: 'Chief Executive Officer',
      persona: 'Visionary strategic leader with 15+ years of C-suite experience, known for challenging assumptions and driving transformational growth',
      experience: '15+ years in executive leadership across multiple industries',
      expertise: ['Strategic Planning & Execution', 'Market Analysis & Competitive Intelligence', 'Stakeholder Management', 'M&A Strategy', 'Board Relations', 'Crisis Management', 'Organizational Transformation', 'Capital Markets']
    },
    {
      role: 'CTO',
      name: 'Chief Technology Officer',
      persona: 'Technical visionary and engineering leader with deep expertise in scalable architecture and emerging technologies',
      experience: '12+ years in technology leadership at high-growth companies',
      expertise: ['Enterprise Architecture', 'Cloud Infrastructure & DevOps', 'Cybersecurity & Compliance', 'AI/ML Implementation', 'API Strategy', 'Technical Due Diligence', 'Engineering Team Scaling', 'Technology Risk Management']
    },
    {
      role: 'CFO',
      name: 'Chief Financial Officer',
      persona: 'Strategic financial leader with expertise in capital markets, M&A, and operational finance across multiple business cycles',
      experience: '12+ years in financial leadership including IPO and acquisition experience',
      expertise: ['Financial Planning & Analysis', 'Capital Structure Optimization', 'Risk Management & Controls', 'M&A Financial Modeling', 'Investor Relations', 'Tax Strategy', 'Working Capital Management', 'Financial Systems & Reporting']
    },
    {
      role: 'CMO',
      name: 'Chief Marketing Officer',
      persona: 'Growth-focused marketing executive with expertise in brand building, digital transformation, and customer acquisition at scale',
      experience: '10+ years in marketing leadership across B2B and B2C environments',
      expertise: ['Brand Strategy & Positioning', 'Digital Marketing & MarTech', 'Customer Acquisition & Retention', 'Product Marketing', 'Marketing Analytics & Attribution', 'Content Strategy', 'Partnership Marketing', 'Crisis Communications']
    },
    {
      role: 'CHRO',
      name: 'Chief Human Resources Officer',
      persona: 'People-first executive leader specializing in organizational development, culture transformation, and talent strategy',
      experience: '12+ years in HR leadership through hypergrowth and organizational change',
      expertise: ['Talent Acquisition & Retention', 'Organizational Design & Development', 'Culture & Change Management', 'Compensation & Benefits Strategy', 'Leadership Development', 'Employee Relations & Legal Compliance', 'Diversity, Equity & Inclusion', 'Performance Management Systems']
    },
    {
      role: 'COO',
      name: 'Chief Operating Officer',
      persona: 'Operations excellence leader with expertise in scaling processes, supply chain optimization, and cross-functional execution',
      experience: '14+ years in operations leadership across multiple industries and business models',
      expertise: ['Operations Strategy & Execution', 'Process Optimization & Automation', 'Supply Chain Management', 'Quality Assurance & Six Sigma', 'Project Management & PMO', 'Vendor Management & Procurement', 'Business Continuity Planning', 'Operational Risk Management']
    },
    {
      role: 'CVCO',
      name: 'Chief Vibe Coding Officer',
      persona: 'Innovative tech leader who bridges engineering excellence with company culture, ensuring code quality while maintaining team morale and creative energy',
      experience: '8+ years combining technical leadership with cultural development in fast-paced startups',
      expertise: ['Full-Stack Development', 'Team Culture & Morale', 'Code Quality & Standards', 'Developer Experience', 'Technical Mentoring', 'Agile Methodologies', 'Innovation Labs', 'Work-Life Balance Optimization']
    },
    {
      role: 'CPO',
      name: 'Chief Product Officer',
      persona: 'Product visionary with deep expertise in user experience, product strategy, and data-driven product development',
      experience: '10+ years in product leadership at technology companies',
      expertise: ['Product Strategy & Roadmapping', 'User Experience Design', 'Product Analytics & Data Science', 'Agile Development Methodologies', 'Market Research & Validation', 'Product-Market Fit', 'Growth Product Management', 'Platform Strategy']
    },
    {
      role: 'CRO',
      name: 'Chief Revenue Officer',
      persona: 'Revenue growth expert with proven track record in sales strategy, customer success, and revenue operations',
      experience: '12+ years in revenue leadership across SaaS and enterprise sales',
      expertise: ['Sales Strategy & Execution', 'Revenue Operations & Analytics', 'Customer Success & Retention', 'Sales Team Development', 'Channel Partner Management', 'Pricing Strategy', 'Sales Technology & CRM', 'Revenue Forecasting']
    },
    {
      role: 'CISO',
      name: 'Chief Information Security Officer',
      persona: 'Cybersecurity expert with extensive experience in enterprise security, compliance, and risk management',
      experience: '10+ years in cybersecurity leadership across regulated industries',
      expertise: ['Cybersecurity Strategy', 'Risk Assessment & Management', 'Compliance & Governance', 'Incident Response & Recovery', 'Security Architecture', 'Identity & Access Management', 'Security Awareness Training', 'Vendor Security Assessment']
    },
    {
      role: 'CLO',
      name: 'Chief Legal Officer',
      persona: 'Legal strategist with expertise in corporate law, regulatory compliance, and business risk management',
      experience: '12+ years in legal leadership including corporate counsel and private practice',
      expertise: ['Corporate Governance', 'Regulatory Compliance', 'Contract Negotiation', 'Intellectual Property', 'Employment Law', 'M&A Legal Strategy', 'Litigation Management', 'Privacy & Data Protection']
    },
    {
      role: 'CDO',
      name: 'Chief Data Officer',
      persona: 'Data strategy leader with expertise in analytics, data governance, and AI-driven business transformation',
      experience: '8+ years in data leadership across analytics and business intelligence',
      expertise: ['Data Strategy & Governance', 'Business Intelligence & Analytics', 'Machine Learning & AI', 'Data Architecture & Engineering', 'Data Privacy & Ethics', 'Advanced Analytics', 'Data Monetization', 'Predictive Modeling']
    },
    {
      role: 'CSO',
      name: 'Chief Strategy Officer',
      persona: 'Strategic planning expert with deep experience in corporate strategy, market analysis, and business transformation',
      experience: '10+ years in strategy consulting and corporate strategy roles',
      expertise: ['Corporate Strategy Development', 'Market Analysis & Intelligence', 'Business Model Innovation', 'Strategic Planning & Execution', 'Competitive Analysis', 'Portfolio Management', 'Strategic Partnerships', 'Digital Transformation Strategy']
    },
    {
      role: 'CHCO',
      name: 'Chief Happiness & Culture Officer',
      persona: 'Culture evangelist focused on employee wellbeing, organizational happiness, and creating positive work environments that drive performance',
      experience: '7+ years in organizational psychology and culture development',
      expertise: ['Employee Wellbeing Programs', 'Culture Design & Implementation', 'Team Building & Engagement', 'Mental Health Advocacy', 'Remote Work Culture', 'Fun & Recreation Planning', 'Conflict Resolution', 'Positive Psychology Applications']
    },
    {
      role: 'CAIO',
      name: 'Chief AI Officer',
      persona: 'AI strategist and machine learning expert driving artificial intelligence adoption and ethical AI implementation across the organization',
      experience: '6+ years in AI/ML leadership and research',
      expertise: ['AI Strategy & Implementation', 'Machine Learning Operations', 'Ethical AI & Bias Prevention', 'Natural Language Processing', 'Computer Vision', 'AI Governance & Policy', 'Automation Strategy', 'AI Training & Education']
    },
    {
      role: 'CGRO',
      name: 'Chief Growth & Revenue Officer',
      persona: 'Growth hacker and revenue optimization expert focused on scaling customer acquisition, retention, and lifetime value through data-driven strategies',
      experience: '9+ years in growth marketing and revenue optimization',
      expertise: ['Growth Hacking & Experimentation', 'Customer Lifecycle Management', 'Revenue Optimization', 'Conversion Rate Optimization', 'Viral Marketing Strategies', 'Product-Led Growth', 'Retention & Churn Analysis', 'Growth Analytics & Metrics']
    }
  ];

  const toggleAgent = (agentTemplate: Omit<Agent, 'id' | 'isActive'>) => {
    const isSelected = selectedAgents.some(agent => agent.role === agentTemplate.role);
    
    if (isSelected) {
      setSelectedAgents(prev => prev.filter(agent => agent.role !== agentTemplate.role));
    } else if (selectedAgents.length < 10) {
      const newAgent: Agent = {
        ...agentTemplate,
        id: `agent-${Date.now()}-${agentTemplate.role}`,
        isActive: true
      };
      setSelectedAgents(prev => [...prev, newAgent]);
    }
  };

  const addTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      estimatedDuration: 15
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, ...updates } : topic
    ));
  };

  const removeTopic = (id: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== id));
  };

  const addToList = (field: 'challenges' | 'goals', value: string) => {
    if (value.trim()) {
      setCompanyContext(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromList = (field: 'challenges' | 'goals', index: number) => {
    setCompanyContext(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'agents':
        return selectedAgents.length >= 2;
      case 'topics':
        return topics.length > 0 && topics.every(topic => topic.title.trim());
      case 'context':
        return companyContext.name.trim() && companyContext.industry.trim();
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const startSession = async () => {
    setIsGeneratingResponses(true);

    try {
      // Generate personalized responses for all agents and topics
      const llmService = LLMService.getInstance();
      
      const agentData = selectedAgents.map(agent => ({
        role: agent.role,
        persona: agent.persona,
        expertise: agent.expertise
      }));

      const topicData = topics.map(topic => ({
        title: topic.title,
        description: topic.description,
        priority: topic.priority
      }));

      // Generate all responses with enhanced sophistication
      const agentResponsesMap = await llmService.generateAllAgentResponses(
        agentData,
        topicData,
        companyContext
      );

      // Create session with generated responses
      const session: BoardroomSession = {
        id: `session-${Date.now()}`,
        agents: selectedAgents,
        topics,
        companyContext,
        timelines: [],
        status: 'setup',
        createdAt: new Date(),
        // Store generated responses in session for later use
        agentResponses: agentResponsesMap
      };
      
      // Small delay for smooth transition
      setTimeout(() => {
        onSessionStart(session);
      }, 500);

    } catch (error) {
      console.error('Error generating agent responses:', error);
      
      // Fallback: create session without pre-generated responses
      setTimeout(() => {
        const session: BoardroomSession = {
          id: `session-${Date.now()}`,
          agents: selectedAgents,
          topics,
          companyContext,
          timelines: [],
          status: 'setup',
          createdAt: new Date()
        };
        onSessionStart(session);
      }, 1000);
    }
  };

  const renderAgentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Executive Board Members</h2>
        <p className="text-slate-300">Choose 2-10 executives for sophisticated boardroom discussions</p>
        <p className="text-sm text-slate-400 mt-1">Selected: {selectedAgents.length}/10 • Each executive brings deep domain expertise and critical thinking</p>
      </div>

      {/* Updated grid to show all cards properly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availableAgents.map((agent) => {
          const isSelected = selectedAgents.some(selected => selected.role === agent.role);
          const canSelect = selectedAgents.length < 10 || isSelected;

          return (
            <div
              key={agent.role}
              onClick={() => canSelect && toggleAgent(agent)}
              className={`
                p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 h-full
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25' 
                  : canSelect
                    ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/70'
                    : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{agent.role}</h3>
                {isSelected && <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>}
              </div>
              <p className="text-sm text-slate-300 mb-3 font-medium">{agent.name}</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{agent.persona}</p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-300">Core Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.expertise.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-xs bg-slate-700/70 text-slate-300 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {agent.expertise.length > 4 && (
                    <span className="text-xs text-slate-400">+{agent.expertise.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTopicSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Strategic Discussion Topics</h2>
        <p className="text-slate-300">Define complex business topics that will generate intense executive debate</p>
        <p className="text-sm text-slate-400 mt-1">Each topic will be thoroughly analyzed from multiple C-level perspectives</p>
      </div>

      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  placeholder="Strategic topic title (e.g., 'Market Expansion Strategy', 'Technology Infrastructure Overhaul')..."
                  value={topic.title}
                  onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg font-medium"
                />
                <textarea
                  placeholder="Detailed topic description - provide context, challenges, and key considerations that will drive executive discussion..."
                  value={topic.description}
                  onChange={(e) => updateTopic(topic.id, { description: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Priority Level:</label>
                    <select
                      value={topic.priority}
                      onChange={(e) => updateTopic(topic.id, { priority: e.target.value as Topic['priority'] })}
                      className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority - Critical</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">Discussion Duration:</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={topic.estimatedDuration}
                      onChange={(e) => updateTopic(topic.id, { estimatedDuration: parseInt(e.target.value) })}
                      className="w-20 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                    />
                    <span className="text-sm text-slate-400">minutes</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeTopic(topic.id)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addTopic}
          className="w-full border-2 border-dashed border-slate-600 rounded-xl p-6 text-slate-400 hover:border-slate-500 hover:text-slate-300 hover:bg-slate-800/30 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Strategic Discussion Topic</span>
        </button>
      </div>
    </div>
  );

  const renderContextSetup = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Company Context & Background</h2>
          <p className="text-slate-300">Provide detailed company information to enable sophisticated, contextual executive discussions</p>
          <p className="text-sm text-slate-400 mt-1">This context will inform every executive's perspective and strategic recommendations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input
                type="text"
                value={companyContext.name}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Industry Sector</label>
              <input
                type="text"
                value={companyContext.industry}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Enterprise SaaS, FinTech, Healthcare Technology, E-commerce"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Size</label>
              <select
                value={companyContext.size}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, size: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select company size</option>
                <option value="startup">Startup (1-50 employees)</option>
                <option value="small">Small Business (51-200 employees)</option>
                <option value="medium">Mid-Market (201-1000 employees)</option>
                <option value="large">Enterprise (1000+ employees)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Stage</label>
              <select
                value={companyContext.stage}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select business stage</option>
                <option value="pre-seed">Pre-seed / Ideation</option>
                <option value="seed">Seed Stage</option>
                <option value="series-a">Series A Growth</option>
                <option value="series-b">Series B Scaling</option>
                <option value="growth">Growth Stage / Late Stage</option>
                <option value="public">Public Company</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Description</label>
              <textarea
                value={companyContext.description}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                placeholder="Detailed description of your business model, target market, competitive positioning, and key value propositions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Strategic Challenges</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newChallenge}
                  onChange={(e) => setNewChallenge(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList('challenges', newChallenge);
                      setNewChallenge('');
                    }
                  }}
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a strategic challenge or business concern"
                />
                <button
                  onClick={() => {
                    addToList('challenges', newChallenge);
                    setNewChallenge('');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {companyContext.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800/70 px-4 py-2 rounded-lg">
                    <span className="text-sm text-slate-300">{challenge}</span>
                    <button
                      onClick={() => removeFromList('challenges', index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Strategic Goals & Objectives</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToList('goals', newGoal);
                      setNewGoal('');
                    }
                  }}
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Add a strategic goal or business objective"
                />
                <button
                  onClick={() => {
                    addToList('goals', newGoal);
                    setNewGoal('');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {companyContext.goals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800/70 px-4 py-2 rounded-lg">
                    <span className="text-sm text-slate-300">{goal}</span>
                    <button
                      onClick={() => removeFromList('goals', index)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Launch Boardroom Session</h2>
        <p className="text-slate-300">Review your sophisticated boardroom configuration before launching intense executive discussions</p>
        <p className="text-sm text-slate-400 mt-1">AI agents will generate contextual, challenging responses based on this configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
              <Users className="w-5 h-5 text-blue-400" />
              Executive Board Members ({selectedAgents.length})
            </h3>
            <div className="space-y-3">
              {selectedAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <span className="text-slate-200 font-medium">{agent.role}</span>
                    <p className="text-xs text-slate-400 mt-1">{agent.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">{agent.expertise.length} expertise areas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
              <Target className="w-5 h-5 text-purple-400" />
              Strategic Discussion Topics ({topics.length})
            </h3>
            <div className="space-y-3">
              {topics.map((topic) => (
                <div key={topic.id} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-200 font-medium text-sm">{topic.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        topic.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        topic.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {topic.priority} priority
                      </span>
                      <span className="text-xs text-slate-400">{topic.estimatedDuration}min</span>
                    </div>
                  </div>
                  {topic.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{topic.description.slice(0, 100)}...</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h3 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
            <Building className="w-5 h-5 text-green-400" />
            Company Context & Background
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-400">Company:</span>
                <p className="text-slate-200 font-medium">{companyContext.name}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Industry:</span>
                <p className="text-slate-200 font-medium">{companyContext.industry}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Size:</span>
                <p className="text-slate-200 font-medium">{companyContext.size}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Stage:</span>
                <p className="text-slate-200 font-medium">{companyContext.stage}</p>
              </div>
            </div>
            
            {companyContext.description && (
              <div>
                <span className="text-sm text-slate-400">Business Description:</span>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">{companyContext.description}</p>
              </div>
            )}
            
            {companyContext.challenges.length > 0 && (
              <div>
                <span className="text-sm text-slate-400">Strategic Challenges ({companyContext.challenges.length}):</span>
                <ul className="text-slate-300 text-sm mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {companyContext.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-500 mt-1">•</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {companyContext.goals.length > 0 && (
              <div>
                <span className="text-sm text-slate-400">Strategic Goals ({companyContext.goals.length}):</span>
                <ul className="text-slate-300 text-sm mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {companyContext.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-500 mt-1">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Simplified loading overlay without progress text
  if (isGeneratingResponses) {
    return (
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Preparing Your AI Executive Boardroom</h2>
            <div className="w-80 h-3 bg-slate-700 rounded-full overflow-hidden mx-auto mb-6">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <p className="text-sm text-slate-400 mb-3">
                Generating sophisticated responses for <span className="text-white font-medium">{selectedAgents.length} executives</span> across <span className="text-white font-medium">{topics.length} strategic topics</span>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span>• Advanced domain expertise</span>
                <span>• Critical thinking patterns</span>
                <span>• Challenging perspectives</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              AI Executive Boardroom Setup
            </h1>
            <p className="text-slate-300 text-lg">
              Configure sophisticated C-level executives for intense strategic discussions
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Each AI executive brings deep domain expertise, critical thinking, and willingness to challenge assumptions
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center space-x-4">
              {[
                { key: 'agents', label: 'Executive Selection', icon: Users },
                { key: 'topics', label: 'Strategic Topics', icon: Target },
                { key: 'context', label: 'Company Context', icon: Building },
                { key: 'review', label: 'Review & Launch', icon: FileText }
              ].map((step, index) => {
                const isActive = currentStep === step.key;
                const isCompleted = ['agents', 'topics', 'context', 'review'].indexOf(currentStep) > index;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.key}>
                    <div className={`
                      flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 font-medium
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-500/30 shadow-lg' 
                        : isCompleted
                          ? 'bg-green-500/20 text-green-300 border-2 border-green-500/30'
                          : 'bg-slate-800/50 text-slate-400 border-2 border-slate-700'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{step.label}</span>
                    </div>
                    {index < 3 && (
                      <ArrowRight className={`w-5 h-5 ${isCompleted ? 'text-green-400' : 'text-slate-600'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-800/30 rounded-2xl p-10 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
            {currentStep === 'agents' && renderAgentSelection()}
            {currentStep === 'topics' && renderTopicSetup()}
            {currentStep === 'context' && renderContextSetup()}
            {currentStep === 'review' && renderReview()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => {
                const steps = ['agents', 'topics', 'context', 'review'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1] as typeof currentStep);
                }
              }}
              disabled={currentStep === 'agents'}
              className={`
                px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                ${currentStep === 'agents'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 text-white hover:bg-slate-600 shadow-lg'
                }
              `}
            >
              Previous Step
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Step {['agents', 'topics', 'context', 'review'].indexOf(currentStep) + 1} of 4
              </p>
              <div className="w-32 h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${((['agents', 'topics', 'context', 'review'].indexOf(currentStep) + 1) / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {currentStep === 'review' ? (
              <button
                onClick={startSession}
                disabled={isGeneratingResponses}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-blue-500/25"
              >
                {isGeneratingResponses ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating AI Responses...
                  </>
                ) : (
                  <>
                    Launch Executive Boardroom
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  const steps = ['agents', 'topics', 'context', 'review'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1] as typeof currentStep);
                  }
                }}
                disabled={!canProceed()}
                className={`
                  px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-3
                  ${canProceed()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;