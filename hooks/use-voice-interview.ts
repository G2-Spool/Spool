"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { API_SERVICES } from "@/lib/api-config"

interface InterestDetected {
  name: string
  timestamp: number
}

interface TranscriptEntry {
  speaker: "user" | "assistant"
  text: string
  timestamp: number
}

export function useVoiceInterview(apiBaseUrl?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [interests, setInterests] = useState<InterestDetected[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const websocketRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  const baseUrl = apiBaseUrl || API_SERVICES.INTERVIEW

  const startSession = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) throw new Error("Failed to start interview session")

      const data = await response.json()
      setSessionId(data.session_id)
      
      // Connect WebSocket
      const ws = new WebSocket(`${baseUrl.replace("http", "ws")}/ws/interview/${data.session_id}`)
      
      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          const message = JSON.parse(event.data)
          
          switch (message.type) {
            case "greeting":
              // Initial greeting from the agent
              break
            
            case "user_transcript":
              setTranscript((prev) => [
                ...prev,
                {
                  speaker: "user",
                  text: message.text,
                  timestamp: Date.now(),
                },
              ])
              break
            
            case "assistant_transcript":
              setTranscript((prev) => [
                ...prev,
                {
                  speaker: "assistant",
                  text: message.text,
                  timestamp: Date.now(),
                },
              ])
              break
            
            case "interest_detected":
              setInterests((prev) => [
                ...prev,
                {
                  name: message.interest,
                  timestamp: Date.now(),
                },
              ])
              break
            
            case "error":
              setError(message.message)
              break
          }
        } else if (event.data instanceof Blob) {
          // Handle audio response from assistant
          const audioBlob = event.data
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          await audio.play()
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setError("Connection error occurred")
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsRecording(false)
      }

      websocketRef.current = ws
      return data.session_id
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session")
      throw err
    }
  }, [baseUrl])

  const startRecording = useCallback(async () => {
    if (!websocketRef.current || !isConnected) {
      setError("Not connected to interview service")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1)
      
      processorRef.current.onaudioprocess = (e) => {
        if (!isRecording) return
        
        const inputData = e.inputBuffer.getChannelData(0)
        const pcmData = new Int16Array(inputData.length)
        
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }
        
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(pcmData.buffer)
        }
      }

      source.connect(processorRef.current)
      processorRef.current.connect(audioContextRef.current.destination)
      
      setIsRecording(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start recording")
      throw err
    }
  }, [isConnected, isRecording])

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsRecording(false)
  }, [])

  const endSession = useCallback(async () => {
    if (!sessionId) return

    try {
      stopRecording()

      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: "end_interview" }))
        websocketRef.current.close()
      }

      await fetch(`${baseUrl}/api/interview/${sessionId}/end`, {
        method: "POST",
      })

      setSessionId(null)
      setIsConnected(false)
      setInterests([])
      setTranscript([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session")
      throw err
    }
  }, [sessionId, stopRecording, baseUrl])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.close()
      }
      stopRecording()
    }
  }, [stopRecording])

  return {
    // State
    isConnected,
    isRecording,
    sessionId,
    interests,
    transcript,
    error,
    
    // Actions
    startSession,
    startRecording,
    stopRecording,
    endSession,
  }
} 