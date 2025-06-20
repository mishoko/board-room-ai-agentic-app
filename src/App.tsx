import React, { useState } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import BoardroomTable from './components/BoardroomTable';
import Timeline from './components/Timeline';
import SummaryPanel from './components/SummaryPanel';
import { TrendingUp, DollarSign, Settings, Target } from 'lucide-react';

function App() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Sample topics data
  const topics = [
    {
      id: '1',
      title: 'Q4 Growth Strategy Implementation',
      status: 'open' as const,
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      title: 'AI Infrastructure Scaling Discussion',
      status: 'open' as const,
      timestamp: '5 minutes ago'
    },
    {
      id: '3',
      title: 'Budget Allocation for Cloud Resources',
      status: 'closed' as const,
      timestamp: '12 minutes ago'
    },
    {
      id: '4',
      title: 'Security Protocols for New AI Systems',
      status: 'closed' as const,
      timestamp: '18 minutes ago'
    }
  ];

  // Sample summaries data
  const summaries = {
    '1': {
      id: '1',
      title: 'Q4 Growth Strategy Implementation',
      content: 'The board discussed aggressive expansion plans for Q4, focusing on leveraging our AI capabilities to capture new market segments. Key emphasis was placed on maintaining quality while scaling operations efficiently.',
      keyPoints: [
        'Target 25% efficiency increase through AI automation',
        'Strategic partnerships to accelerate market penetration',
        'Focus on customer retention while acquiring new clients',
        'Quarterly review checkpoints established'
      ],
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />
    },
    '2': {
      id: '2',
      title: 'AI Infrastructure Scaling Discussion',
      content: 'Technical leadership outlined the roadmap for scaling our machine learning infrastructure. The discussion covered both immediate needs and long-term architectural decisions to support growing data processing demands.',
      keyPoints: [
        'Current beta testing shows 40% performance improvement',
        'Infrastructure needs assessment for next 12 months',
        'Cloud migration strategy and timeline finalized',
        'Security and compliance requirements integrated'
      ],
      icon: <Settings className="w-5 h-5 text-purple-400" />
    },
    '3': {
      id: '3',
      title: 'Budget Allocation for Cloud Resources',
      content: 'Financial team presented comprehensive analysis of cloud computing costs and projected ROI. Board approved increased budget allocation for infrastructure scaling while maintaining strict cost controls.',
      keyPoints: [
        'ROI break-even projected for Q2 next year',
        'Monthly cost monitoring system implemented',
        'Automated scaling policies to optimize spending',
        '30% cost reduction in operational expenses expected'
      ],
      icon: <DollarSign className="w-5 h-5 text-purple-400" />
    },
    '4': {
      id: '4',
      title: 'Security Protocols for New AI Systems',
      content: 'Comprehensive review of security measures for AI system deployment. Board emphasized the critical importance of data protection and regulatory compliance in all AI initiatives.',
      keyPoints: [
        'Multi-layer security architecture approved',
        'Regular security audits scheduled quarterly',
        'Employee training programs for AI security best practices',
        'Compliance with international data protection regulations'
      ],
      icon: <Target className="w-5 h-5 text-purple-400" />
    }
  };

  const handleUserMessage = (message: string) => {
    console.log('User message:', message);
    // TODO: Implement agentic processing of user input
    // This will later integrate with the conversation flow
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Agentic Boardroom
          </h1>
          <p className="text-slate-300">
            Real-time executive discussions powered by intelligent agents
          </p>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Boardroom Table */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <BoardroomTable onUserMessage={handleUserMessage} />
            </div>
          </div>

          {/* Bottom Section: Timeline and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <Timeline
                topics={topics}
                onTopicClick={setSelectedTopic}
                selectedTopic={selectedTopic}
              />
            </div>

            {/* Summary Panel */}
            <div>
              <SummaryPanel
                selectedTopicId={selectedTopic}
                summaries={summaries}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;