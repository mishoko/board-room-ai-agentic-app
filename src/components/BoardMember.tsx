import React, { useState, useEffect, useRef } from "react"

type Position = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface BoardMemberProps {
  name: string;
  position: Position;
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
  }, [isActive, message, isHovering, hasMultipleParts, messageParts.length])

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
    setIsHovering(true);
    if (onBubbleHover) onBubbleHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (onBubbleHover) onBubbleHover(false);
  };

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
    default: "white_circle_360x360.png.png",
  }

  const getAgentImage = (role: string, position: Position): string => {
    const roleLower = role.toLowerCase()
    
    // If this is the middle position, use the white circle
    if (position === 'middle-left' || position === 'middle-right') {
      return '/assets/white_circle_360x360.png'
    }
    
    // Otherwise, use the mapped image or a default
    const imageName = roleToImageMap[roleLower] || 'download.jpeg';
    return `/assets/${imageName}`
  };

  return (
    <div className={getPositionClasses()}>
      {/* Board Member Avatar */}
      <div className={`relative ${isActive ? "animate-pulse" : ""}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
          <img 
            src={getAgentImage(name, position)} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a colored background with initial if image fails to load
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
                initial.textContent = name[0].toUpperCase()
                fallback.appendChild(initial)
                parent.appendChild(fallback)
              }
            }}
          />
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
