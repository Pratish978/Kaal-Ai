"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface ReflectionQuestion {
  id: number
  question: string
  options: string[]
}

interface UseReflectionQuestionsReturn {
  questions: ReflectionQuestion[]
  loading: boolean
  error: string | null
  submitReflection: (answers: Record<number, string>) => Promise<any>
}

/* ---------- FALLBACK QUESTIONS ---------- */

const fallbackQuestions: ReflectionQuestion[] = [
  {
    id: 1,
    question: "How would you describe your mood lately?",
    options: ["Generally positive", "Neutral", "Often low", "Very low"],
  },
  {
    id: 2,
    question: "How well have you been sleeping?",
    options: ["Very well", "Fairly well", "Poorly", "Hardly at all"],
  },
  {
    id: 3,
    question: "How often do you feel stressed?",
    options: ["Rarely", "Sometimes", "Often", "Almost always"],
  },
  {
    id: 4,
    question: "How has your energy felt lately?",
    options: ["Energised", "Balanced", "Exhausted", "Very drained"],
  },
  {
    id: 5,
    question: "How connected do you feel to others?",
    options: ["Very connected", "Somewhat", "Often isolated", "Very isolated"],
  },
]

export function useReflectionQuestions(): UseReflectionQuestionsReturn {

  const { user } = useAuth()

  const [questions, setQuestions] = useState<ReflectionQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ---------------- FETCH QUESTIONS ---------------- */

  useEffect(() => {

    const fetchQuestions = async () => {

      try {

        setLoading(true)
        setError(null)

        const response = await fetch("/api/self-reflection", {
          headers: {
            "x-user-name": user?.name || "",
            "x-user-email": user?.email || "",
          }
        })

        if (!response.ok) {
          throw new Error("Backend failed")
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setQuestions(data)
        } else {
          throw new Error("Invalid response")
        }

      } catch (err) {

        console.warn("[Reflection] Using fallback questions")

        setError("Backend unavailable")
        setQuestions(fallbackQuestions)

      } finally {

        setLoading(false)

      }

    }

    fetchQuestions()

  }, [user])

  /* ---------------- SUBMIT REFLECTION ---------------- */

  const submitReflection = async (answers: Record<number, string>) => {

    try {

      const response = await fetch("/api/self-reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({ answers })
      })

      if (!response.ok) {
        throw new Error("Submission failed")
      }

      return await response.json()

    } catch (err) {

      console.error("[Reflection Submit Error]", err)

      return {
        status: "stored-locally",
        answers
      }

    }

  }

  return {
    questions,
    loading,
    error,
    submitReflection
  }

}