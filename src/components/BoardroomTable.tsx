import React, { useState, useEffect, useRef } from "react"
import BoardMember from "./BoardMember"
import { User, Pause, Play, MessageSquare, Send } from "lucide-react"
import { BoardAgentBase } from "../agents/BoardAgentBase"
import { Topic, Message, TopicState } from "../types"
import { TopicStateManager } from "../agents/TopicStateManager"

interface BoardroomTableProps {
  onUserMessage?: (message: string) => void
  onTopicStateChange?: (topicId: string, state: TopicState) => void
  agents?: BoardAgentBase[]
  currentTopic?: Topic
  stateManager?: TopicStateManager
}

const BoardroomTable: React.FC<BoardroomTableProps> = ({
  onUserMessage,
  onTopicStateChange,
  agents = [],
  currentTopic,
  stateManager,
}) => {
  const [activeMembers, setActiveMembers] = useState<string[]>([])
  const [isPaused, setIsPaused] = useState(false) // Manual pause button
  const [isInterrupting, setIsInterrupting] = useState(false) // User is typing a comment
  const [isWaitingForAgentSync, setIsWaitingForAgentSync] = useState(false) // Waiting for agents to process user input
  const [userMessage, setUserMessage] = useState("")
  const [currentMessages, setCurrentMessages] = useState<{
    [key: string]: string
  }>({})
  const [topicState, setTopicState] = useState<TopicState | null>(null)
  const [messageDurations, setMessageDurations] = useState<{
    [key: string]: number
  }>({})
  const [isInterrupted, setIsInterrupted] = useState(false)
  const [conversationContext, setConversationContext] = useState<Message[]>([])
  const [activeTimeouts, setActiveTimeouts] = useState<{
    [key: string]: NodeJS.Timeout
  }>({})
  const [isHoveringBubble, setIsHoveringBubble] = useState(false)
  const [pausedByHover, setPausedByHover] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [isGeneratingFirstMessage, setIsGeneratingFirstMessage] =
    useState(false)

  // Prevent multiple intervals for the same topic
  const activeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate dynamic conversation settings based on topic duration and number of agents
  const getConversationSettings = (
    topicDuration: number,
    numAgents: number
  ) => {
    // Smart target message calculation: duration * agents * 0.7 (not everyone speaks every time)
    // Cap at reasonable maximums to prevent endless conversations
    const baseTargetMessages = Math.floor(topicDuration * numAgents * 0.7)
    const maxMessages =
      topicDuration <= 5
        ? 15
        : topicDuration <= 10
        ? 25
        : topicDuration <= 15
        ? 35
        : 50
    const targetMessages = Math.min(baseTargetMessages, maxMessages)

    // Base settings for different duration ranges
    if (topicDuration <= 5) {
      // Very short meetings (1-5 minutes): Quick, focused exchanges
      return {
        targetMessages: Math.max(6, targetMessages), // Minimum 6 messages for meaningful discussion
        conversationInterval: 3000, // 3 seconds between messages (faster)
        messageReadingMultiplier: 1.5, // Faster reading for urgency
        responseComplexity: "concise", // Shorter, more direct responses
      }
    } else if (topicDuration <= 10) {
      // Short meetings (6-10 minutes): Moderate discussion
      return {
        targetMessages: Math.max(8, targetMessages), // Minimum 8 messages
        conversationInterval: 2800, // 2.8 seconds between messages
        messageReadingMultiplier: 1.8,
        responseComplexity: "moderate",
      }
    } else if (topicDuration <= 20) {
      // Medium meetings (11-20 minutes): Rich discussion
      return {
        targetMessages: Math.max(12, targetMessages), // Minimum 12 messages
        conversationInterval: 2500, // 2.5 seconds between messages
        messageReadingMultiplier: 2.0,
        responseComplexity: "detailed",
      }
    } else {
      // Long meetings (20+ minutes): Deep, thorough analysis
      return {
        targetMessages: Math.max(15, targetMessages), // Minimum 15 messages
        conversationInterval: 2200, // 2.2 seconds between messages
        messageReadingMultiplier: 2.5, // Longer reading time for complex content
        responseComplexity: "comprehensive",
      }
    }
  }

  // Enhanced calculation for message display duration based on text complexity AND topic duration
  const calculateMessageDuration = (
    message: string,
    topicDuration: number = 15
  ): number => {
    if (!message || message.trim().length === 0) return 4000

    const settings = getConversationSettings(topicDuration)
    const baseTime = 4000 // 4 seconds minimum
    const wordsPerMinute = 120 // Reading speed
    const words = message.trim().split(/\s+/).length

    // Calculate reading time in milliseconds
    const readingTime = (words / wordsPerMinute) * 60 * 1000

    // Add extra time for complex sentences and punctuation
    const sentences = message
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length
    const complexityBonus = sentences * 600 // 600ms per sentence

    // Add time for commas and semicolons (pause points)
    const pausePoints = (message.match(/[,;]/g) || []).length
    const pauseBonus = pausePoints * 300 // 300ms per pause point

    // Add bonus for longer words (technical/business terms)
    const longWords = message
      .split(/\s+/)
      .filter((word) => word.length > 8).length
    const technicalBonus = longWords * 150 // 150ms per complex word

    // Apply duration multiplier based on topic duration
    const totalDuration =
      (readingTime + complexityBonus + pauseBonus + technicalBonus) *
      settings.messageReadingMultiplier

    // Ensure minimum time, maximum based on topic duration
    const maxDuration =
      topicDuration <= 5 ? 15000 : topicDuration <= 10 ? 20000 : 30000
    const duration = Math.max(baseTime, Math.min(totalDuration, maxDuration))

    console.log(`📊 Message duration for ${topicDuration}min topic: "${message.substring(
      0,
      30
    )}...":
      📝 Words: ${words} | Sentences: ${sentences} | Complexity: ${
      settings.responseComplexity
    }
      ⏱️ Base reading: ${(readingTime / 1000).toFixed(1)}s | Multiplier: ${
      settings.messageReadingMultiplier
    }x
      ✅ Final duration: ${(duration / 1000).toFixed(1)}s`)

    return duration
  }

  // Handle bubble hover events
  const handleBubbleHover = (isHovering: boolean) => {
    setIsHoveringBubble(isHovering)

    if (isHovering) {
      // Pause all active timeouts when hovering
      setPausedByHover(true)
      Object.values(activeTimeouts).forEach((timeout) => clearTimeout(timeout))
      console.log("🖱️ Bubble hovered - pausing conversation timers")
    } else {
      // Resume timeouts when not hovering (unless manually paused, interrupting, or waiting for agent sync)
      setPausedByHover(false)
      if (!isPaused && !isInterrupting && !isWaitingForAgentSync) {
        console.log("🖱️ Bubble unhovered - resuming conversation timers")
        // Restart timers for active messages
        Object.entries(currentMessages).forEach(([agentRole, message]) => {
          if (message && activeMembers.includes(agentRole)) {
            const duration = calculateMessageDuration(
              message,
              currentTopic?.estimatedDuration
            )
            const timeoutId = setTimeout(() => {
              console.log(
                `⏰ Clearing message for ${agentRole} after hover resume`
              )
              setActiveMembers((prev) =>
                prev.filter((member) => member !== agentRole)
              )
              setCurrentMessages((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setMessageDurations((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setActiveTimeouts((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
            }, duration)

            setActiveTimeouts((prev) => ({
              ...prev,
              [agentRole]: timeoutId,
            }))
          }
        })
      }
    }
  }

  // Get position for agents distributed around the table (supports up to 8 positions)
  const getAgentPosition = (
    index: number,
    total: number
  ):
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right" => {
    if (total === 1) return "top-center"
    if (total === 2) return index === 0 ? "top-left" : "top-right"
    if (total === 3) {
      const positions: ("top-left" | "top-center" | "top-right")[] = [
        "top-left",
        "top-center",
        "top-right",
      ]
      return positions[index]
    }
    if (total === 4) {
      const positions: (
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
      )[] = ["top-left", "top-right", "bottom-left", "bottom-right"]
      return positions[index]
    }
    if (total === 5) {
      const positions: (
        | "top-left"
        | "top-center"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
      )[] = [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]
      return positions[index]
    }
    if (total === 6) {
      const positions: (
        | "top-left"
        | "top-center"
        | "top-right"
        | "bottom-left"
        | "bottom-center"
        | "bottom-right"
      )[] = [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ]
      return positions[index]
    }
    if (total === 7) {
      const positions: (
        | "top-left"
        | "top-center"
        | "top-right"
        | "middle-left"
        | "middle-right"
        | "bottom-left"
        | "bottom-right"
      )[] = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-right",
      ]
      return positions[index]
    }
    // For 8+ agents, use all positions
    const positions: (
      | "top-left"
      | "top-center"
      | "top-right"
      | "middle-left"
      | "middle-right"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right"
    )[] = [
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "middle-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ]
    return positions[index % 8]
  }

  // Clear all active timeouts when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      Object.values(activeTimeouts).forEach((timeout) => clearTimeout(timeout))
    }
  }, [activeTimeouts])

  // Initialize topic in state manager when topic changes
  useEffect(() => {
    if (currentTopic && stateManager) {
      // Clear any existing timeouts when topic changes
      Object.values(activeTimeouts).forEach((timeout) => clearTimeout(timeout))
      setActiveTimeouts({})

      let state = stateManager.getTopicState(currentTopic.id)
      if (!state) {
        stateManager.initializeTopic(currentTopic)
        state = stateManager.getTopicState(currentTopic.id)
      }

      if (state && state.status === "pending") {
        stateManager.startTopic(currentTopic.id)
        state = stateManager.getTopicState(currentTopic.id)
      }

      setTopicState(state)
      setCurrentMessages({})
      setActiveMembers([])
      setMessageDurations({})
      setIsInterrupted(false)
      setConversationContext([])
      setConversationStarted(false) // Reset conversation started flag

      if (state && onTopicStateChange) {
        stateManager.onTopicComplete(
          currentTopic.id,
          (topicId, completedState) => {
            setTopicState(completedState)
            onTopicStateChange(topicId, completedState)
          }
        )
      }
    }
  }, [currentTopic?.id, stateManager, onTopicStateChange])

  // IMMEDIATE conversation starter - triggers first message right away
  useEffect(() => {
    if (
      !conversationStarted &&
      currentTopic &&
      stateManager &&
      agents.length > 0 &&
      !isPaused &&
      !isInterrupting &&
      !isWaitingForAgentSync
    ) {
      const currentState = stateManager.getTopicState(currentTopic.id)
      if (currentState && currentState.status === "active") {
        console.log(
          "🚀 Starting conversation immediately for topic:",
          currentTopic.title
        )
        setConversationStarted(true)

        // Start first message immediately (Task 2: No delay, start instantly)
        const startConversationImmediately = async () => {
          if (
            isPaused ||
            isInterrupting ||
            isWaitingForAgentSync ||
            pausedByHover ||
            isHoveringBubble
          )
            return

          const availableAgents = agents.filter(
            (agent) => agent.getAgent().isActive
          )
          if (availableAgents.length === 0) return

          // Pick a random agent to start the conversation
          const randomAgent =
            availableAgents[Math.floor(Math.random() * availableAgents.length)]

          try {
            // Show loading indicator while generating first message
            setIsGeneratingFirstMessage(true)
            console.log(
              `🤖 ${randomAgent.getAgent().role} is preparing to speak...`
            )

            const response = await randomAgent.generateResponse("", {
              recentMessages: [],
              topic: currentTopic,
              userInput: undefined,
            })

            setIsGeneratingFirstMessage(false)

            const duration = calculateMessageDuration(
              response,
              currentTopic.estimatedDuration
            )
            const agentRole = randomAgent.getAgent().role

            console.log(
              `🚀 ${agentRole} opening conversation instantly: "${response.substring(
                0,
                60
              )}..."`
            )

            setActiveMembers([agentRole])
            setCurrentMessages({ [agentRole]: response })
            setMessageDurations({ [agentRole]: duration })

            const message: Message = {
              id: `msg-${Date.now()}-${agentRole}`, // Add agent role to prevent duplicates
              agentId: randomAgent.getAgent().id,
              text: response,
              timestamp: new Date(),
              topicId: currentTopic.id,
            }

            stateManager.addMessage(currentTopic.id, message)
            const updatedState = stateManager.getTopicState(currentTopic.id)
            setTopicState(updatedState)
            randomAgent.addToHistory(message)

            // Set timeout to clear the message
            const timeoutId = setTimeout(() => {
              console.log(`⏰ Clearing opening message for ${agentRole}`)
              setActiveMembers((prev) =>
                prev.filter((member) => member !== agentRole)
              )
              setCurrentMessages((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setMessageDurations((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setActiveTimeouts((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
            }, duration)

            setActiveTimeouts({ [agentRole]: timeoutId })
          } catch (error) {
            console.error("Error generating opening response:", error)
            setIsGeneratingFirstMessage(false)
          }
        }

        // Start immediately without any delay
        startConversationImmediately()
      }
    }
  }, [
    conversationStarted,
    currentTopic,
    stateManager,
    agents,
    isPaused,
    isInterrupting,
  ])

  // Enhanced conversation system with dynamic frequency based on topic duration
  useEffect(() => {
    // Clear any existing interval first to prevent cascading
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current)
      activeIntervalRef.current = null
    }

    // Don't start new conversations if paused, interrupting, hovering, waiting for agent sync, or no agents
    if (
      isPaused ||
      isInterrupting ||
      isWaitingForAgentSync ||
      pausedByHover ||
      isHoveringBubble ||
      agents.length === 0 ||
      !currentTopic ||
      !stateManager ||
      !conversationStarted
    ) {
      return
    }

    const currentState = stateManager.getTopicState(currentTopic.id)
    if (!currentState || currentState.status === "completed") {
      return
    }

    // Get dynamic conversation settings based on topic duration and number of agents
    const activeAgentCount = agents.filter(
      (agent) => agent.getAgent().isActive
    ).length
    const conversationSettings = getConversationSettings(
      currentTopic.estimatedDuration,
      activeAgentCount
    )

    console.log(
      `🎯 Topic "${currentTopic.title}" (${currentTopic.estimatedDuration}min, ${activeAgentCount} agents) - Settings:`,
      {
        targetMessages: conversationSettings.targetMessages,
        interval: conversationSettings.conversationInterval,
        complexity: conversationSettings.responseComplexity,
      }
    )

    // Check for recent user input to adjust timing
    const allMessages = stateManager.getTopicMessages(currentTopic.id)
    const hasRecentUserInput = allMessages
      .slice(-3)
      .some((msg) => msg.agentId === "user")
    const dynamicInterval = hasRecentUserInput
      ? Math.min(1500, conversationSettings.conversationInterval / 2)
      : conversationSettings.conversationInterval

    const interval = setInterval(async () => {
      // Check if we should still proceed (not paused by hover, manual pause, or waiting for agent sync)
      if (
        isPaused ||
        isInterrupting ||
        isWaitingForAgentSync ||
        pausedByHover ||
        isHoveringBubble
      )
        return

      const latestState = stateManager.getTopicState(currentTopic.id)
      if (!latestState || latestState.status === "completed") {
        setActiveMembers([])
        return
      }

      // Check if we've reached the target message count for this duration (Task 2 & 3: Prevent freezing and smart completion)
      if (latestState.messageCount >= conversationSettings.targetMessages) {
        console.log(
          `📊 Conversation completed! Reached target message count (${conversationSettings.targetMessages}) for ${currentTopic.estimatedDuration}min topic with ${activeAgentCount} agents`
        )

        // Mark topic as completed to prevent further messages (Task 2: Fix freezing)
        stateManager.updateTopicStatus(currentTopic.id, "completed")
        setActiveMembers([])
        setCurrentMessages({})
        setMessageDurations({})

        // Clear any active timeouts
        Object.values(activeTimeouts).forEach((timeout) =>
          clearTimeout(timeout)
        )
        setActiveTimeouts({})

        console.log(`✅ Topic "${currentTopic.title}" marked as completed`)
        return
      }

      const allMessages = stateManager.getTopicMessages(currentTopic.id)
      setConversationContext(allMessages)

      const availableAgents = agents.filter(
        (agent) => agent.getAgent().isActive
      )
      if (availableAgents.length === 0) return

      const randomAgent =
        availableAgents[Math.floor(Math.random() * availableAgents.length)]
      const recentMessages = allMessages.slice(-5)

      // Check if there's recent user input (within last 3 messages) for higher response probability
      const hasRecentUserInput = allMessages
        .slice(-3)
        .some((msg) => msg.agentId === "user")

      // Adjust response probability based on topic duration and current progress
      const progressRatio =
        latestState.messageCount / conversationSettings.targetMessages
      const baseResponseChance = currentTopic.estimatedDuration <= 5 ? 0.9 : 0.7 // Higher chance for short meetings

      // Increase response chance significantly if there's recent user input
      const userInputBoost = hasRecentUserInput ? 0.8 : 0
      const adjustedResponseChance = Math.min(
        0.95,
        baseResponseChance * (1 - progressRatio * 0.3) + userInputBoost
      ) // Cap at 95%

      const shouldRespond =
        randomAgent.shouldRespond(recentMessages, currentTopic) &&
        Math.random() < adjustedResponseChance

      if (shouldRespond) {
        try {
          // Prevent duplicate messages by checking if agent is already speaking
          if (activeMembers.includes(randomAgent.getAgent().role)) {
            console.log(
              `⚠️ ${
                randomAgent.getAgent().role
              } is already speaking, skipping...`
            )
            return
          }

          // Always check for recent user messages (more robust than relying on isInterrupted flag)
          const userMessages = allMessages.filter(
            (msg) => msg.agentId === "user"
          )
          const latestUserMessage =
            userMessages.length > 0
              ? userMessages[userMessages.length - 1]?.text
              : undefined

          // Check if there's a recent user message (within last 5 messages)
          const recentUserInput = allMessages
            .slice(-5)
            .find((msg) => msg.agentId === "user")?.text

          const response = await randomAgent.generateResponse("", {
            recentMessages: allMessages,
            topic: currentTopic,
            userInput: recentUserInput || latestUserMessage,
          })

          // Check for duplicate responses to prevent same message appearing multiple times
          const lastMessage = allMessages[allMessages.length - 1]
          if (
            lastMessage &&
            lastMessage.text === response &&
            lastMessage.agentId === randomAgent.getAgent().id
          ) {
            console.log(
              `⚠️ Duplicate response detected for ${
                randomAgent.getAgent().role
              }, skipping...`
            )
            return
          }

          // Calculate duration with topic-aware timing
          const duration = calculateMessageDuration(
            response,
            currentTopic.estimatedDuration
          )
          const agentRole = randomAgent.getAgent().role

          console.log(
            `🎯 ${agentRole} speaking (${
              currentTopic.estimatedDuration
            }min topic) for ${(duration / 1000).toFixed(
              1
            )}s: "${response.substring(0, 60)}..."`
          )

          // Clear any existing timeout for this agent
          if (activeTimeouts[agentRole]) {
            clearTimeout(activeTimeouts[agentRole])
          }

          setActiveMembers([agentRole])
          setCurrentMessages((prev) => ({
            ...prev,
            [agentRole]: response,
          }))

          setMessageDurations((prev) => ({
            ...prev,
            [agentRole]: duration,
          }))

          const message: Message = {
            id: `msg-${Date.now()}-${agentRole}-${Math.random()
              .toString(36)
              .substr(2, 9)}`, // Unique ID to prevent duplicates
            agentId: randomAgent.getAgent().id,
            text: response,
            timestamp: new Date(),
            topicId: currentTopic.id,
          }

          stateManager.addMessage(currentTopic.id, message)
          const updatedState = stateManager.getTopicState(currentTopic.id)
          setTopicState(updatedState)
          randomAgent.addToHistory(message)

          // Set timeout to clear the message with proper duration (only if not paused/hovering/waiting for agent sync)
          if (
            !isPaused &&
            !isInterrupting &&
            !isWaitingForAgentSync &&
            !pausedByHover &&
            !isHoveringBubble
          ) {
            const timeoutId = setTimeout(() => {
              console.log(
                `⏰ Clearing message for ${agentRole} after ${(
                  duration / 1000
                ).toFixed(1)}s`
              )
              setActiveMembers((prev) =>
                prev.filter((member) => member !== agentRole)
              )
              setCurrentMessages((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setMessageDurations((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setActiveTimeouts((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
            }, duration)

            // Store the timeout ID
            setActiveTimeouts((prev) => ({
              ...prev,
              [agentRole]: timeoutId,
            }))
          }
        } catch (error) {
          console.error("Error generating agent response:", error)
        }
      }
    }, dynamicInterval) // Use dynamic interval based on user input

    // Store the interval reference to prevent cascading
    activeIntervalRef.current = interval

    return () => {
      clearInterval(interval)
      if (activeIntervalRef.current === interval) {
        activeIntervalRef.current = null
      }
    }
  }, [
    isPaused,
    isInterrupting,
    isWaitingForAgentSync,
    pausedByHover,
    isHoveringBubble,
    currentTopic?.id, // Only depend on topic ID, not the entire object
    conversationStarted,
  ])

  const handlePauseToggle = () => {
    const newPausedState = !isPaused
    setIsPaused(newPausedState)

    if (newPausedState) {
      // When pausing, clear all timeouts but keep messages visible
      Object.values(activeTimeouts).forEach((timeout) => clearTimeout(timeout))
      setActiveTimeouts({})
      console.log("⏸️ Conversation paused - messages will remain visible")
    } else {
      // When resuming, restart timers for active messages (if not hovering or waiting for agent sync)
      if (!isHoveringBubble && !pausedByHover && !isWaitingForAgentSync) {
        console.log("▶️ Conversation resumed - restarting message timers")
        Object.entries(currentMessages).forEach(([agentRole, message]) => {
          if (message && activeMembers.includes(agentRole)) {
            const duration = calculateMessageDuration(
              message,
              currentTopic?.estimatedDuration
            )
            const timeoutId = setTimeout(() => {
              console.log(`⏰ Clearing message for ${agentRole} after resume`)
              setActiveMembers((prev) =>
                prev.filter((member) => member !== agentRole)
              )
              setCurrentMessages((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setMessageDurations((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
              setActiveTimeouts((prev) => {
                const updated = { ...prev }
                delete updated[agentRole]
                return updated
              })
            }, duration)

            setActiveTimeouts((prev) => ({
              ...prev,
              [agentRole]: timeoutId,
            }))
          }
        })
      }
    }
  }

  const handleInterrupt = () => {
    console.log(
      "🛑 User clicked comment button - immediately pausing conversation"
    )
    setIsInterrupting(true)
    setIsPaused(true)
    setActiveMembers([])
    // Clear all active timeouts when interrupting
    Object.values(activeTimeouts).forEach((timeout) => clearTimeout(timeout))
    setActiveTimeouts({})
    // Clear current messages to immediately stop any ongoing speech
    setCurrentMessages({})
    setMessageDurations({})
  }

  const handleSendMessage = () => {
    if (userMessage.trim() && currentTopic && stateManager) {
      const userMessageText = userMessage // Capture the message before clearing

      // Immediately update UI to be non-blocking
      setUserMessage("")
      setIsInterrupting(false)
      // Don't resume conversation immediately - wait for processing to complete

      // Process the message asynchronously without blocking UI
      const processUserMessage = async () => {
        try {
          console.log("🔄 Processing user message and synchronizing agents...")
          setIsWaitingForAgentSync(true)

          const userMsg: Message = {
            id: `msg-user-${Date.now()}`,
            agentId: "user",
            text: userMessageText,
            timestamp: new Date(),
            topicId: currentTopic.id,
          }

          stateManager.addMessage(currentTopic.id, userMsg)
          const updatedState = stateManager.getTopicState(currentTopic.id)
          setTopicState(updatedState)

          setIsInterrupted(true)

          // Clear agent response pools to force fresh context-aware responses
          agents.forEach((agent) => {
            if (agent.setTopicResponses) {
              agent.setTopicResponses([])
            }
          })

          // Update agent conversation histories with all messages including the new user message
          const allMessages = stateManager.getTopicMessages(currentTopic.id)
          agents.forEach((agent) => {
            allMessages.forEach((msg) => {
              if (
                !agent
                  .getConversationHistory()
                  .find((histMsg) => histMsg.id === msg.id)
              ) {
                agent.addToHistory(msg)
              }
            })
          })

          if (onUserMessage) {
            onUserMessage(userMessageText)
          }

          console.log(
            "✅ User interrupted conversation. Agents will now respond contextually to:",
            userMessageText
          )

          // Verify all agents have received the user message before resuming
          const verifyAgentSynchronization = () => {
            const allAgentsHaveUserMessage = agents.every((agent) => {
              const agentHistory = agent.getConversationHistory()
              return agentHistory.some((msg) => msg.id === userMsg.id)
            })

            if (allAgentsHaveUserMessage) {
              console.log(
                "🔄 All agents synchronized with user input. Resuming conversation..."
              )
              setIsWaitingForAgentSync(false)
              setIsPaused(false)
              return true
            }
            return false
          }

          // Try immediate verification first
          if (!verifyAgentSynchronization()) {
            // If not all agents are synchronized, wait and retry
            console.log("⏳ Waiting for agent synchronization...")
            let attempts = 0
            const maxAttempts = 10

            const syncInterval = setInterval(() => {
              attempts++
              if (verifyAgentSynchronization() || attempts >= maxAttempts) {
                clearInterval(syncInterval)
                if (attempts >= maxAttempts) {
                  console.warn(
                    "⚠️ Agent synchronization timeout, resuming anyway..."
                  )
                  setIsWaitingForAgentSync(false)
                  setIsPaused(false)
                }
              }
            }, 100) // Check every 100ms
          }
        } catch (error) {
          console.error("❌ Error processing user message:", error)
          // Resume conversation even if there's an error
          setIsWaitingForAgentSync(false)
          setIsPaused(false)
        }
      }

      // Process asynchronously without blocking UI
      processUserMessage()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCancelInterrupt = () => {
    setUserMessage("")
    setIsInterrupting(false)
    setIsPaused(false)
  }

  const isTopicCompleted = topicState?.status === "completed"

  return (
    <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
      {/* Enhanced Status Indicators */}
      {(isPaused ||
        isInterrupting ||
        isWaitingForAgentSync ||
        isHoveringBubble ||
        isGeneratingFirstMessage) && (
        <div className="absolute top-4 right-4 z-20">
          <div
            className={`
            px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2
            ${
              isGeneratingFirstMessage
                ? "bg-blue-500/30 text-blue-200"
                : isWaitingForAgentSync
                ? "bg-orange-500/30 text-orange-200"
                : isHoveringBubble
                ? "bg-purple-500/30 text-purple-200"
                : isPaused && !isInterrupting
                ? "bg-amber-500/30 text-amber-200"
                : "bg-blue-500/30 text-blue-200"
            }
          `}
          >
            {isGeneratingFirstMessage ? (
              <>
                <div className="w-3 h-3 border border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                Meeting is starting...
              </>
            ) : isWaitingForAgentSync ? (
              <>
                <div className="w-3 h-3 border border-orange-300 border-t-transparent rounded-full animate-spin"></div>
                Synchronizing agents with your input...
              </>
            ) : isHoveringBubble ? (
              "Hover off to continue with the conversation"
            ) : isInterrupting ? (
              "Waiting for your input..."
            ) : (
              "Conversation paused - messages visible"
            )}
          </div>
        </div>
      )}

      {/* Interrupt Status Indicator */}
      {isInterrupted && !isInterrupting && (
        <div className="absolute top-16 right-4 z-20">
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200">
            Discussion adapted to your input
          </div>
        </div>
      )}

      {/* Current Topic Indicator with Progress and Duration Info */}
      {currentTopic && topicState && (
        <div className="absolute top-4 left-4 z-20">
          <div className="space-y-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isTopicCompleted
                  ? "bg-green-500/30 text-green-200"
                  : topicState.status === "active" ||
                    isGeneratingFirstMessage ||
                    isWaitingForAgentSync ||
                    topicState.status === "pending"
                  ? "bg-purple-500/30 text-purple-200"
                  : "bg-slate-500/30 text-slate-300"
              }`}
            >
              Topic: {currentTopic.title}{" "}
              {isTopicCompleted ? "(Completed)" : ""}
            </div>
            {/* {!isTopicCompleted && (
              <div className="bg-slate-800/50 rounded-full px-3 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 transition-all duration-1000"
                      style={{ width: `${topicState.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">
                    {topicState.messageCount} msgs •{" "}
                    {topicState.completionPercentage}% •{" "}
                    {currentTopic.estimatedDuration}min
                  </span>
                </div>
              </div>
            )} */}
            {isTopicCompleted && (
              <div className="bg-green-500/20 rounded-full px-3 py-1">
                <span className="text-xs text-green-300">
                  Completed in {topicState.actualDuration}min •{" "}
                  {topicState.messageCount} messages
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Poker Table Surface */}
      <div className="relative h-96 bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-full border-8 border-amber-700/50 shadow-inner">
        <div className="absolute inset-4 bg-gradient-to-br from-green-700/20 to-green-800/20 rounded-full"></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-600/50">
            <img 
              src="/assets/black_circle_360x360.png" 
              alt="Table Center" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Board Members with Enhanced Hover Controls */}
        {agents.map((agent, index) => {
          const agentData = agent.getAgent()
          return (
            <BoardMember
              key={agentData.id}
              name={agentData.role}
              position={getAgentPosition(index, agents.length)}
              message={currentMessages[agentData.role] || ""}
              isActive={
                activeMembers.includes(agentData.role) && !isTopicCompleted
              }
              onBubbleHover={handleBubbleHover}
            />
          )
        })}

        {/* Enhanced Control Panel - Task 3: Moved closer to border */}
        <div className="absolute bottom-1 right-1 flex items-center gap-2 z-20">
          <button
            onClick={handlePauseToggle}
            disabled={isInterrupting || isTopicCompleted}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isPaused
                  ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              }
              ${
                isInterrupting || isTopicCompleted
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {isPaused ? "Resume" : "Pause"}
          </button>

          <button
            onClick={handleInterrupt}
            disabled={isInterrupting || isTopicCompleted}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30
              ${
                isInterrupting || isTopicCompleted
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }
            `}
          >
            <MessageSquare className="w-4 h-4" />
            Comment
          </button>
        </div>
      </div>

      {/* User Position (Bottom Center) */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs px-3 py-1 rounded-full">
          You
        </div>
      </div>

      {/* User Input Modal */}
      {isInterrupting && (
        <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-[10000]">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-600 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Add Your Comment
              </h3>
            </div>

            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300">
                Your input will change the direction of the discussion. The
                agents will consider your comment and adapt their responses
                accordingly.
              </p>
            </div>

            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts with the board..."
              className="w-full h-24 bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              autoFocus
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={handleCancelInterrupt}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${
                    userMessage.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                <Send className="w-4 h-4" />
                Send & Redirect Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardroomTable
