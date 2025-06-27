import React, { useState } from "react"
import {
  Users,
  Building2,
  Target,
  Clock,
  ArrowRight,
  Settings,
  TestTube,
  Wifi,
  Play,
} from "lucide-react"
import AnimatedBackground from "../components/AnimatedBackground"
import LLMTestPanel from "../components/LLMTestPanel"
import { Agent, Topic, CompanyContext, BoardroomSession } from "../types"
import { LLMService } from "../services/LLMService"

interface SetupPageProps {
  onSessionStart: (session: BoardroomSession) => void
}

const SetupPage: React.FC<SetupPageProps> = ({ onSessionStart }) => {
  const [currentStep, setCurrentStep] = useState<
    "company" | "agents" | "topics" | "start"
  >("company")
  const [showLLMTest, setShowLLMTest] = useState(false)
  const [companyContext, setCompanyContext] = useState<CompanyContext>({
    name: "",
    industry: "",
    size: "",
    stage: "",
    description: "",
    challenges: [],
    goals: [],
  })
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Available executive roles
  const availableAgents: Omit<Agent, "id" | "isActive">[] = [
    {
      role: "CEO",
      name: "Chief Executive Officer",
      persona:
        "Visionary leader focused on strategic direction and stakeholder value",
      experience:
        "15+ years in executive leadership across multiple industries",
      expertise: [
        "Strategic Planning",
        "Leadership",
        "Stakeholder Management",
        "Vision Setting",
        "Corporate Governance",
      ],
    },
    {
      role: "CTO",
      name: "Chief Technology Officer",
      persona:
        "Technical innovator balancing cutting-edge solutions with practical implementation",
      experience:
        "12+ years in technology leadership and software architecture",
      expertise: [
        "Technology Strategy",
        "Software Architecture",
        "Engineering Management",
        "Innovation",
        "Digital Transformation",
      ],
    },
    {
      role: "CFO",
      name: "Chief Financial Officer",
      persona:
        "Financial strategist ensuring sustainable growth and fiscal responsibility",
      experience: "10+ years in financial management and corporate finance",
      expertise: [
        "Financial Planning",
        "Risk Management",
        "Investment Strategy",
        "Corporate Finance",
        "Budgeting",
      ],
    },
    {
      role: "CMO",
      name: "Chief Marketing Officer",
      persona:
        "Brand champion driving customer acquisition and market positioning",
      experience: "8+ years in marketing leadership and brand management",
      expertise: [
        "Brand Strategy",
        "Digital Marketing",
        "Customer Acquisition",
        "Market Research",
        "Growth Marketing",
      ],
    },
    {
      role: "CHRO",
      name: "Chief Human Resources Officer",
      persona:
        "People-first leader building organizational culture and talent strategy",
      experience: "10+ years in human resources and organizational development",
      expertise: [
        "Talent Management",
        "Organizational Culture",
        "Employee Development",
        "Compensation Strategy",
        "Change Management",
      ],
    },
    {
      role: "COO",
      name: "Chief Operating Officer",
      persona:
        "Operations expert ensuring efficient execution and scalable processes",
      experience: "12+ years in operations management and process optimization",
      expertise: [
        "Operations Management",
        "Process Optimization",
        "Supply Chain",
        "Quality Management",
        "Scaling Operations",
      ],
    },
    {
      role: "CPO",
      name: "Chief Product Officer",
      persona:
        "Product visionary driving user-centric innovation and market fit",
      experience: "8+ years in product management and user experience design",
      expertise: [
        "Product Strategy",
        "User Experience",
        "Product Development",
        "Market Research",
        "Innovation Management",
      ],
    },
    {
      role: "CVCO",
      name: "Chief Coding Officer",
      persona:
        "Engineering excellence advocate ensuring code quality and developer productivity",
      experience:
        "10+ years in software engineering and development team leadership",
      expertise: [
        "Code Quality",
        "Engineering Practices",
        "Developer Experience",
        "Technical Mentorship",
        "Software Architecture",
      ],
    },
    {
      role: "CRO",
      name: "Chief Revenue Officer",
      persona:
        "Revenue growth specialist optimizing sales processes and customer success",
      experience: "9+ years in sales leadership and revenue operations",
      expertise: [
        "Sales Strategy",
        "Revenue Operations",
        "Customer Success",
        "Sales Process",
        "Growth Strategy",
      ],
    },
    {
      role: "CISO",
      name: "Chief Information Security Officer",
      persona: "Security expert balancing protection with business enablement",
      experience: "11+ years in cybersecurity and risk management",
      expertise: [
        "Cybersecurity",
        "Risk Management",
        "Compliance",
        "Security Architecture",
        "Incident Response",
      ],
    },
    {
      role: "CLO",
      name: "Chief Legal Officer",
      persona:
        "Legal strategist ensuring compliance while enabling business growth",
      experience: "12+ years in corporate law and regulatory compliance",
      expertise: [
        "Corporate Law",
        "Regulatory Compliance",
        "Contract Management",
        "Intellectual Property",
        "Risk Mitigation",
      ],
    },
    {
      role: "CDO",
      name: "Chief Data Officer",
      persona:
        "Data strategist transforming information into competitive advantage",
      experience: "8+ years in data science and analytics leadership",
      expertise: [
        "Data Strategy",
        "Analytics",
        "Data Governance",
        "Business Intelligence",
        "Data Science",
      ],
    },
    {
      role: "CSO",
      name: "Chief Strategy Officer",
      persona:
        "Strategic planner focusing on long-term competitive positioning",
      experience: "10+ years in strategic planning and business development",
      expertise: [
        "Strategic Planning",
        "Competitive Analysis",
        "Business Development",
        "Market Strategy",
        "Corporate Strategy",
      ],
    },
    {
      role: "CHCO",
      name: "Chief Happiness & Culture Officer",
      persona:
        "Culture champion fostering employee wellbeing and organizational happiness",
      experience:
        "7+ years in organizational psychology and culture development",
      expertise: [
        "Employee Wellbeing",
        "Culture Development",
        "Organizational Psychology",
        "Employee Engagement",
        "Workplace Happiness",
      ],
    },
    {
      role: "CAIO",
      name: "Chief AI Officer",
      persona:
        "AI strategist driving responsible artificial intelligence adoption",
      experience: "6+ years in AI/ML leadership and ethical AI development",
      expertise: [
        "AI Strategy",
        "Machine Learning",
        "Ethical AI",
        "AI Governance",
        "Automation Strategy",
      ],
    },
    {
      role: "CGRO",
      name: "Chief Growth & Revenue Officer",
      persona:
        "Growth specialist combining marketing and sales for revenue optimization",
      experience: "9+ years in growth marketing and revenue strategy",
      expertise: [
        "Growth Strategy",
        "Revenue Optimization",
        "Customer Acquisition",
        "Market Expansion",
        "Performance Marketing",
      ],
    },
  ]

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "E-commerce",
    "Manufacturing",
    "Education",
    "Real Estate",
    "Media",
    "Transportation",
    "Energy",
  ]

  const companySizes = [
    "Startup (1-10)",
    "Small (11-50)",
    "Medium (51-200)",
    "Large (201-1000)",
    "Enterprise (1000+)",
  ]
  const companyStages = [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
    "IPO",
    "Public",
    "Mature",
  ]

  const handleAgentToggle = (agentTemplate: Omit<Agent, "id" | "isActive">) => {
    const agentId = `agent-${agentTemplate.role.toLowerCase()}`
    const isSelected = selectedAgents.some(
      (agent) => agent.id === agentId
    )

    if (isSelected) {
      setSelectedAgents(selectedAgents.filter((agent) => agent.id !== agentId))
    } else {
      setSelectedAgents([
        ...selectedAgents,
        {
          ...agentTemplate,
          id: agentId,
          isActive: true,
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(agentTemplate.name)}&background=random`,
        },
      ])
    }
  }

  // Map of role to image UUIDs - each role gets a unique image
  const roleToImageMap: Record<string, string> = {
    // Core C-Suite
    ceo: "25ebac30-7f4d-458c-8d43-9bc479d35e46.jpeg",
    cto: "d4001534-4838-47bb-8ba5-7873536b698e.jpeg",
    cfo: "53e003aa-7f62-42d6-9fc5-2e79330a2c74.jpeg",
    cmo: "5cabf84f-5bcf-4938-bce6-47a0a163ecd4.jpeg",
    chro: "e4e4edd0-7b34-4c7d-b14f-bb06fbb0b7db.jpeg",
    coo: "6ff7564e-4f93-46c0-beaf-1b8ba1374ee6.jpeg",
    cpo: "b15d095b-5175-49ff-ba73-b4d754218b3f.jpeg",

    // Extended Leadership Team
    cdo: "1d0dd718-2aee-412c-a510-99a621959fb8.jpeg",
    cso: "90e31299-41fd-4c46-937f-e59d7be08475.jpeg",
    cio: "7d98a3a2-e0a8-4801-8a19-a5b8fcbc8a52.jpeg",
    ciso: "8c430fff-8394-4e6d-8bd5-8fc6a7d9278a.jpeg",
    clo: "206f3fb7-cd4c-42ac-ab9c-b7984b4b54f4.jpeg",
    cro: "21638b99-ac58-4083-8b12-24f876828552.jpeg",
    cvco: "301ce5cb-3196-4a53-87b3-24c74ae5565a.jpeg",
    chco: "3911e255-4977-49d2-bcc8-86c9c8615444.jpeg",
    caio: "52231ed9-57aa-4bbf-bc5f-a237f4f52f5c.jpeg",
    cgro: "eae0d68c-a4a6-409c-810f-0e6ca1e32f51.jpeg",

    // Fallback for any unmapped roles
    default: "white_circle_360x360.png",
  }

  // Get agent image based on role
  const getAgentImage = (role: string): string => {
    const roleLower = role.toLowerCase();
    const imageName = roleToImageMap[roleLower] || 'download.jpeg';
    return `/assets/${imageName}`;
  }

  const addTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      estimatedDuration: 15,
    }
    setTopics([...topics, newTopic])
  }

  const updateTopic = (index: number, field: keyof Topic, value: any) => {
    const updatedTopics = [...topics]
    updatedTopics[index] = { ...updatedTopics[index], [field]: value }
    setTopics(updatedTopics)
  }

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  const handleStartSession = async () => {
    if (selectedAgents.length === 0 || topics.length === 0) return

    setIsGenerating(true)

    try {
      // Skip pre-generation since we use real-time LLM responses
      // This dramatically improves startup time from 30+ seconds to instant
      console.log(
        "🚀 Starting boardroom session with real-time AI generation..."
      )

      const session: BoardroomSession = {
        id: `session-${Date.now()}`,
        agents: selectedAgents,
        topics: topics,
        companyContext,
        timelines: [],
        status: "setup",
        createdAt: new Date(),
        agentResponses: new Map(), // Empty - we'll generate responses in real-time
      }

      onSessionStart(session)
    } catch (error) {
      console.error("Error starting session:", error)
      // Still start the session
      const session: BoardroomSession = {
        id: `session-${Date.now()}`,
        agents: selectedAgents,
        topics: topics,
        companyContext,
        timelines: [],
        status: "setup",
        createdAt: new Date(),
        agentResponses: new Map(),
      }

      onSessionStart(session)
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case "company":
        return (
          companyContext.name &&
          companyContext.industry &&
          companyContext.size &&
          companyContext.stage
        )
      case "agents":
        return selectedAgents.length > 0
      case "topics":
        return (
          topics.length > 0 &&
          topics.every((topic) => topic.title && topic.description)
        )
      case "start":
        return (
          selectedAgents.length > 0 &&
          topics.length > 0 &&
          topics.every((topic) => topic.title && topic.description)
        )
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "company":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Company Context
              </h2>
              <p className="text-slate-300">
                Tell us about your company to personalize the boardroom
                experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyContext.name}
                  onChange={(e) =>
                    setCompanyContext({
                      ...companyContext,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Industry
                </label>
                <select
                  value={companyContext.industry}
                  onChange={(e) =>
                    setCompanyContext({
                      ...companyContext,
                      industry: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Size
                </label>
                <select
                  value={companyContext.size}
                  onChange={(e) =>
                    setCompanyContext({
                      ...companyContext,
                      size: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Stage
                </label>
                <select
                  value={companyContext.stage}
                  onChange={(e) =>
                    setCompanyContext({
                      ...companyContext,
                      stage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select stage</option>
                  {companyStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Description
              </label>
              <textarea
                value={companyContext.description}
                onChange={(e) =>
                  setCompanyContext({
                    ...companyContext,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Brief description of your company and what it does"
              />
            </div>
          </div>
        )

      case "agents":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Executives
              </h2>
              <p className="text-slate-300">
                Choose the C-level executives for your boardroom discussion
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Selected: {selectedAgents.length} executives
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAgents.map((agent) => {
                const agentId = `agent-${agent.role.toLowerCase()}`
                const isSelected = selectedAgents.some(
                  (selected) => selected.id === agentId
                )

                return (
                  <div
                    key={agent.role}
                    onClick={() => handleAgentToggle(agent)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/20 text-white"
                          : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{agent.role}</h3>
                        <p className="text-sm text-slate-300">{agent.name}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                          <img 
                            src={getAgentImage(agent.role)}
                            alt={agent.role}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.onerror = null
                              target.src = ''
                              target.className = 'hidden'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = document.createElement('div')
                                fallback.className = 'w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'
                                const initial = document.createElement('span')
                                initial.className = 'text-white font-bold'
                                initial.textContent = agent.role[0].toUpperCase()
                                fallback.appendChild(initial)
                                parent.appendChild(fallback)
                              }
                            }}
                          />
                        </div>
                        <div 
                          className={`ml-3 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                            isSelected
                              ? "bg-purple-500 border-purple-500"
                              : "border-slate-400"
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{agent.name}</p>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {agent.persona}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "topics":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Discussion Topics
              </h2>
              <p className="text-slate-300">
                Define the topics your executives will discuss
              </p>
            </div>

            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Topic Title
                      </label>
                      <input
                        type="text"
                        value={topic.title}
                        onChange={(e) =>
                          updateTopic(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g., Q4 Budget Planning"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={topic.priority}
                          onChange={(e) =>
                            updateTopic(
                              index,
                              "priority",
                              e.target.value as "high" | "medium" | "low"
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duration (min)
                        </label>
                        <input
                          type="number"
                          value={topic.estimatedDuration}
                          onChange={(e) =>
                            updateTopic(
                              index,
                              "estimatedDuration",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          min="1"
                          max="60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={topic.description}
                      onChange={(e) =>
                        updateTopic(index, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="Describe what will be discussed in this topic"
                    />
                  </div>

                  <button
                    onClick={() => removeTopic(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove Topic
                  </button>
                </div>
              ))}

              <button
                onClick={addTopic}
                className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors"
              >
                + Add Topic
              </button>
            </div>

            {/* Start Session Button in Topics Step */}
            <div className="text-center pt-6 border-t border-slate-600">
              {canProceed() ? (
                <button
                  onClick={handleStartSession}
                  disabled={isGenerating}
                  className={`
                    flex items-center gap-3 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 mx-auto
                    ${
                      isGenerating
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Boardroom Session
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    disabled
                    className="flex items-center gap-3 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 mx-auto bg-slate-600 text-slate-400 cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Start Boardroom Session
                  </button>
                  <p className="text-sm text-amber-400 flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 text-xs font-bold">
                      !
                    </span>
                    Please ensure all topics have both title and description
                    filled in
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case "start":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to Start
              </h2>
              <p className="text-slate-300">
                Your boardroom session is configured and ready to begin
              </p>
            </div>

            {/* Session Summary */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">
                Session Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Company
                  </h4>
                  <p className="text-white font-medium">
                    {companyContext.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {companyContext.industry} • {companyContext.stage}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Executives ({selectedAgents.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgents.map((agent) => (
                      <span
                        key={agent.id}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                      >
                        {agent.role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Topics ({topics.length})
                  </h4>
                  <div className="space-y-2">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between bg-slate-600/30 rounded p-2"
                      >
                        <span className="text-white text-sm">
                          {topic.title}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {topic.estimatedDuration}min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartSession}
                disabled={isGenerating}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 mx-auto
                  ${
                    isGenerating
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Boardroom Session
                  </>
                )}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const steps = [
    { id: "company", label: "Company", icon: Building2 },
    { id: "agents", label: "Executives", icon: Users },
    { id: "topics", label: "Topics", icon: Target },
  ]

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Agentic Boardroom Setup
            </h1>
            <p className="text-xl text-slate-300">
              Configure your executive team and discussion topics
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted =
                  steps.findIndex((s) => s.id === currentStep) > index

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
                        ${
                          isActive
                            ? "bg-purple-600 text-white"
                            : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                        }
                      `}
                      onClick={() => setCurrentStep(step.id as any)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(
                  (s) => s.id === currentStep
                )
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as any)
                }
              }}
              disabled={currentStep === "company"}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${
                  currentStep === "company"
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }
              `}
            >
              Previous
            </button>

            {currentStep === "start" ? (
              // <button
              //   onClick={handleStartSession}
              //   disabled={!canProceed() || isGenerating}
              //   className={`
              //     flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              //     ${
              //       canProceed() && !isGenerating
              //         ? "bg-purple-600 text-white hover:bg-purple-700"
              //         : "bg-slate-600 text-slate-400 cursor-not-allowed"
              //     }
              //   `}
              // >
              //   {isGenerating ? (
              //     <>
              //       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              //       Starting Session...
              //     </>
              //   ) : (
              //     <>
              //       Start Boardroom Session
              //       <ArrowRight className="w-4 h-4" />
              //     </>
              //   )}
              // </button>
              <> </>
            ) : (
              <>
                {currentStep !== "topics" && (
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => {
                        const currentIndex = steps.findIndex(
                          (s) => s.id === currentStep
                        )
                        if (currentIndex < steps.length - 1) {
                          setCurrentStep(steps[currentIndex + 1].id as any)
                        }
                      }}
                      disabled={!canProceed()}
                      className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                      ${
                        canProceed()
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-slate-600 text-slate-400 cursor-not-allowed"
                      }
                    `}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {!canProceed() && (
                      <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 text-xs font-bold">
                          !
                        </span>
                        {currentStep === "company" &&
                          "Please fill in all required company fields"}
                        {currentStep === "agents" &&
                          "Please select at least one agent"}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* LLM Test Add-on Button (similar to version badge) */}
      <button
        onClick={() => setShowLLMTest(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 shadow-lg bg-slate-800/80 text-slate-300 border border-slate-600/50 hover:bg-slate-700/80 backdrop-blur-sm"
        title="Test LLM Connection"
      >
        <Wifi className="w-3 h-3" />
        <span>Test LLM</span>
      </button>

      {/* LLM Test Modal */}
      {showLLMTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                LLM Connection Test
              </h2>
              <button
                onClick={() => setShowLLMTest(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <LLMTestPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SetupPage
