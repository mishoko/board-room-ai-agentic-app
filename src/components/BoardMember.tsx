import React, { useState, useEffect, useRef } from "react"
import { User } from "lucide-react"

interface BoardMemberProps {
  name: string
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  message: string
  isActive: boolean
  onBubbleHover?: (isHovering: boolean) => void
}

const BoardMember: React.FC<BoardMemberProps> = ({
  name,
  position,
  message,
  isActive,
  onBubbleHover,
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const [currentMessagePart, setCurrentMessagePart] = useState(1)
  const cyclingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentPartRef = useRef(1)

  // Split long messages into parts (roughly 250 characters per part)
  const splitMessage = (text: string): string[] => {
    if (text.length <= 250) return [text]

    const words = text.split(" ")
    const parts: string[] = []
    let currentPart = ""

    for (const word of words) {
      if ((currentPart + " " + word).length > 250 && currentPart.length > 0) {
        parts.push(currentPart.trim())
        currentPart = word
      } else {
        currentPart += (currentPart ? " " : "") + word
      }
    }

    if (currentPart) {
      parts.push(currentPart.trim())
    }

    return parts
  }

  const messageParts = splitMessage(message)
  const hasMultipleParts = messageParts.length > 1

  // Handle message part cycling
  useEffect(() => {
    // Clear any existing timer
    if (cyclingTimerRef.current) {
      clearTimeout(cyclingTimerRef.current)
      cyclingTimerRef.current = null
    }

    if (!isActive || !message || isHovering || !hasMultipleParts) {
      setCurrentMessagePart(1)
      currentPartRef.current = 1
      return
    }

    // Reset to first part when message changes
    setCurrentMessagePart(1)
    currentPartRef.current = 1

    const cycleToNextPart = () => {
      if (currentPartRef.current < messageParts.length) {
        currentPartRef.current++
        setCurrentMessagePart(currentPartRef.current)
        cyclingTimerRef.current = setTimeout(cycleToNextPart, 3000)
      }
      // After showing all parts, do nothing - comment will stay visible until agent stops speaking
    }

    // Start cycling after 3 seconds
    cyclingTimerRef.current = setTimeout(cycleToNextPart, 3000)

    return () => {
      if (cyclingTimerRef.current) {
        clearTimeout(cyclingTimerRef.current)
        cyclingTimerRef.current = null
      }
    }
  }, [isActive, message, isHovering, hasMultipleParts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyclingTimerRef.current) {
        clearTimeout(cyclingTimerRef.current)
        cyclingTimerRef.current = null
      }
    }
  }, [])

  const handleMouseEnter = () => {
    setIsHovering(true)
    onBubbleHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    onBubbleHover?.(false)
  }

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "absolute top-4 left-4"
      case "top-center":
        return "absolute top-4 left-1/2 transform -translate-x-1/2"
      case "top-right":
        return "absolute top-4 right-4"
      case "middle-left":
        return "absolute top-1/2 left-4 transform -translate-y-1/2"
      case "middle-right":
        return "absolute top-1/2 right-4 transform -translate-y-1/2"
      case "bottom-left":
        return "absolute bottom-4 left-4"
      case "bottom-center":
        return "absolute bottom-4 left-1/2 transform -translate-x-1/2"
      case "bottom-right":
        return "absolute bottom-4 right-4"
      default:
        return ""
    }
  }

  const getBubblePosition = () => {
    switch (position) {
      case "top-left":
        return "absolute top-20 left-0 w-80 max-w-[calc(100vw-2rem)]"
      case "top-center":
        return "absolute top-20 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)]"
      case "top-right":
        return "absolute top-20 right-0 w-80 max-w-[calc(100vw-2rem)]"
      case "middle-left":
        return "absolute top-1/2 left-20 transform -translate-y-1/2 w-80 max-w-[calc(100vw-2rem)]"
      case "middle-right":
        return "absolute top-1/2 right-20 transform -translate-y-1/2 w-80 max-w-[calc(100vw-2rem)]"
      case "bottom-left":
        return "absolute -top-32 left-0 w-80 max-w-[calc(100vw-2rem)]"
      case "bottom-center":
        return "absolute -top-32 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)]"
      case "bottom-right":
        return "absolute -top-32 right-0 w-80 max-w-[calc(100vw-2rem)]"
      default:
        return ""
    }
  }

  const getBubblePointer = () => {
    switch (position) {
      case "top-left":
        return "absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm"
      case "top-center":
        return "absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"
      case "top-right":
        return "absolute -top-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-sm"
      case "middle-left":
        return "absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"
      case "middle-right":
        return "absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"
      case "bottom-left":
        return "absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm"
      case "bottom-center":
        return "absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm"
      case "bottom-right":
        return "absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 shadow-sm"
      default:
        return "absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-sm"
    }
  }

  const getCurrentMessage = () => {
    if (isHovering) {
      return message
    }

    if (hasMultipleParts) {
      return messageParts[currentMessagePart - 1] || messageParts[0]
    }

    return message
  }

  return (
    <div className={getPositionClasses()}>
      {/* Board Member Avatar */}
      <div className={`relative ${isActive ? "animate-pulse" : ""}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
          {name}
        </div>
      </div>

      {/* Speech Bubble with Multi-part Support */}
      {isActive && message && (
        <div className={getBubblePosition()}>
          <div
            className={`bg-white rounded-lg shadow-xl p-4 relative animate-fadeIn cursor-pointer transition-all duration-200 z-[9999] ${
              isHovering ? "ring-2 ring-blue-400 shadow-2xl scale-105" : ""
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "absolute",
              zIndex: 9998,
              transform: isHovering
                ? "scale(1.05) translateZ(0)"
                : "translateZ(0)",
              maxHeight: isHovering ? "250px" : "none",
              overflowY: isHovering ? "auto" : "visible",
              willChange: "transform, z-index, max-height",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="text-sm text-gray-800 leading-relaxed">
              {getCurrentMessage()}
            </div>

            {/* Multi-part indicator */}
            {hasMultipleParts && !isHovering && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <div className="flex space-x-1">
                  {messageParts.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index + 1 === currentMessagePart
                          ? "bg-blue-400"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {currentMessagePart}/{messageParts.length}
                </span>
              </div>
            )}

            {/* Hover indicator for full message */}
            {hasMultipleParts && !isHovering && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Dynamic bubble pointer based on position */}
            <div className={getBubblePointer()}></div>

            {/* Hover indicator */}
            {isHovering && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardMember
