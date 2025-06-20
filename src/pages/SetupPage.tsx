import React, { useState } from 'react';
import { Users, Plus, X, Building, Target, FileText, ArrowRight } from 'lucide-react';
import { Agent, Topic, CompanyContext, BoardroomSession } from '../types';

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

  // Available agent templates
  const availableAgents: Omit<Agent, 'id' | 'isActive'>[] = [
    {
      role: 'CEO',
      name: 'Chief Executive Officer',
      persona: 'Visionary leader focused on strategic direction and company growth',
      experience: '15+ years in executive leadership',
      expertise: ['Strategic Planning', 'Market Analysis', 'Leadership', 'Stakeholder Management']
    },
    {
      role: 'CTO',
      name: 'Chief Technology Officer',
      persona: 'Technical expert driving innovation and technology strategy',
      experience: '12+ years in technology leadership',
      expertise: ['Technology Strategy', 'Software Architecture', 'Team Management', 'Innovation']
    },
    {
      role: 'CFO',
      name: 'Chief Financial Officer',
      persona: 'Financial strategist ensuring fiscal responsibility and growth',
      experience: '10+ years in financial management',
      expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy', 'Compliance']
    },
    {
      role: 'CMO',
      name: 'Chief Marketing Officer',
      persona: 'Brand champion driving customer acquisition and market presence',
      experience: '8+ years in marketing leadership',
      expertise: ['Brand Strategy', 'Digital Marketing', 'Customer Analytics', 'Growth Marketing']
    },
    {
      role: 'CHRO',
      name: 'Chief Human Resources Officer',
      persona: 'People-focused leader building organizational culture and talent',
      experience: '10+ years in human resources',
      expertise: ['Talent Management', 'Organizational Development', 'Culture Building', 'Employee Relations']
    },
    {
      role: 'COO',
      name: 'Chief Operating Officer',
      persona: 'Operations expert ensuring efficient execution and delivery',
      experience: '12+ years in operations management',
      expertise: ['Operations Management', 'Process Optimization', 'Supply Chain', 'Quality Assurance']
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

  const startSession = () => {
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
  };

  const renderAgentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Board Members</h2>
        <p className="text-slate-300">Choose 2-10 executives for your boardroom discussion</p>
        <p className="text-sm text-slate-400 mt-1">Selected: {selectedAgents.length}/10</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableAgents.map((agent) => {
          const isSelected = selectedAgents.some(selected => selected.role === agent.role);
          const canSelect = selectedAgents.length < 10 || isSelected;

          return (
            <div
              key={agent.role}
              onClick={() => canSelect && toggleAgent(agent)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : canSelect
                    ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{agent.role}</h3>
                {isSelected && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
              </div>
              <p className="text-sm text-slate-300 mb-2">{agent.name}</p>
              <p className="text-xs text-slate-400 mb-2">{agent.persona}</p>
              <div className="flex flex-wrap gap-1">
                {agent.expertise.slice(0, 2).map((skill) => (
                  <span key={skill} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
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
        <h2 className="text-2xl font-bold text-white mb-2">Discussion Topics</h2>
        <p className="text-slate-300">Define the topics your board will discuss</p>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Topic title..."
                  value={topic.title}
                  onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                />
                <textarea
                  placeholder="Topic description (optional)..."
                  value={topic.description}
                  onChange={(e) => updateTopic(topic.id, { description: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 h-20 resize-none"
                />
                <div className="flex items-center gap-4">
                  <select
                    value={topic.priority}
                    onChange={(e) => updateTopic(topic.id, { priority: e.target.value as Topic['priority'] })}
                    className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Duration:</span>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={topic.estimatedDuration}
                      onChange={(e) => updateTopic(topic.id, { estimatedDuration: parseInt(e.target.value) })}
                      className="w-16 bg-slate-700 text-white rounded px-2 py-1 border border-slate-600"
                    />
                    <span className="text-sm text-slate-400">min</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeTopic(topic.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addTopic}
          className="w-full border-2 border-dashed border-slate-600 rounded-lg p-4 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>
    </div>
  );

  const renderContextSetup = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Company Context</h2>
          <p className="text-slate-300">Provide context about your company for more relevant discussions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input
                type="text"
                value={companyContext.name}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
              <input
                type="text"
                value={companyContext.industry}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Size</label>
              <select
                value={companyContext.size}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, size: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
              >
                <option value="">Select size</option>
                <option value="startup">Startup (1-50 employees)</option>
                <option value="small">Small (51-200 employees)</option>
                <option value="medium">Medium (201-1000 employees)</option>
                <option value="large">Large (1000+ employees)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Stage</label>
              <select
                value={companyContext.stage}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
              >
                <option value="">Select stage</option>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="growth">Growth Stage</option>
                <option value="public">Public Company</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Description</label>
              <textarea
                value={companyContext.description}
                onChange={(e) => setCompanyContext(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 h-24 resize-none"
                placeholder="Brief description of what your company does"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Challenges</label>
              <div className="flex gap-2 mb-2">
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
                  className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                  placeholder="Add a challenge"
                />
                <button
                  onClick={() => {
                    addToList('challenges', newChallenge);
                    setNewChallenge('');
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {companyContext.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded">
                    <span className="text-sm text-slate-300">{challenge}</span>
                    <button
                      onClick={() => removeFromList('challenges', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Goals</label>
              <div className="flex gap-2 mb-2">
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
                  className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500"
                  placeholder="Add a goal"
                />
                <button
                  onClick={() => {
                    addToList('goals', newGoal);
                    setNewGoal('');
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {companyContext.goals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded">
                    <span className="text-sm text-slate-300">{goal}</span>
                    <button
                      onClick={() => removeFromList('goals', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Start Session</h2>
        <p className="text-slate-300">Review your configuration before starting the boardroom discussion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Selected Board Members ({selectedAgents.length})
            </h3>
            <div className="space-y-2">
              {selectedAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <span className="text-slate-300">{agent.role}</span>
                  <span className="text-xs text-slate-400">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Discussion Topics ({topics.length})
            </h3>
            <div className="space-y-2">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{topic.title}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      topic.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      topic.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {topic.priority}
                    </span>
                    <span className="text-xs text-slate-400">{topic.estimatedDuration}min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Context
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-400">Company:</span>
              <span className="text-slate-300 ml-2">{companyContext.name}</span>
            </div>
            <div>
              <span className="text-sm text-slate-400">Industry:</span>
              <span className="text-slate-300 ml-2">{companyContext.industry}</span>
            </div>
            <div>
              <span className="text-sm text-slate-400">Size:</span>
              <span className="text-slate-300 ml-2">{companyContext.size}</span>
            </div>
            <div>
              <span className="text-sm text-slate-400">Stage:</span>
              <span className="text-slate-300 ml-2">{companyContext.stage}</span>
            </div>
            {companyContext.description && (
              <div>
                <span className="text-sm text-slate-400">Description:</span>
                <p className="text-slate-300 text-sm mt-1">{companyContext.description}</p>
              </div>
            )}
            {companyContext.challenges.length > 0 && (
              <div>
                <span className="text-sm text-slate-400">Challenges:</span>
                <ul className="text-slate-300 text-sm mt-1 space-y-1">
                  {companyContext.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {companyContext.goals.length > 0 && (
              <div>
                <span className="text-sm text-slate-400">Goals:</span>
                <ul className="text-slate-300 text-sm mt-1 space-y-1">
                  {companyContext.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-500">•</span>
                      {goal}
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

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AI Agentic Boardroom Setup
            </h1>
            <p className="text-slate-300">
              Configure your executive team and discussion topics
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { key: 'agents', label: 'Board Members', icon: Users },
                { key: 'topics', label: 'Topics', icon: Target },
                { key: 'context', label: 'Company Context', icon: Building },
                { key: 'review', label: 'Review', icon: FileText }
              ].map((step, index) => {
                const isActive = currentStep === step.key;
                const isCompleted = ['agents', 'topics', 'context', 'review'].indexOf(currentStep) > index;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.key}>
                    <div className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : isCompleted
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-slate-800/50 text-slate-400'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < 3 && (
                      <ArrowRight className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-slate-600'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-800/30 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
            {currentStep === 'agents' && renderAgentSelection()}
            {currentStep === 'topics' && renderTopicSetup()}
            {currentStep === 'context' && renderContextSetup()}
            {currentStep === 'review' && renderReview()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
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
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${currentStep === 'agents'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
                }
              `}
            >
              Previous
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Step {['agents', 'topics', 'context', 'review'].indexOf(currentStep) + 1} of 4
              </p>
            </div>

            {currentStep === 'review' ? (
              <button
                onClick={startSession}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                Start Boardroom Session
                <ArrowRight className="w-4 h-4" />
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
                  px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                  ${canProceed()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;