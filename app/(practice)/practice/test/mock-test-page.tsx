"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { submitMockTest } from "@/app/actions/exam.actions"

type Question = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string | null
}

type Props = {
  questions: Question[]
  examId: string
  sectionId?: string
  timeLimit: number // seconds
  studentName: string
  studentId: string
  testTitle: string
}

export default function MockTestPage({
  questions,
  examId,
  sectionId,
  timeLimit,
  studentName,
  studentId,
  testTitle,
}: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [submitting, setSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    const timeTaken = timeLimit - timeLeft
    const finalAnswers = answers.map((a) => a ?? -1)
    const score = questions.reduce((total, q, i) => {
      return finalAnswers[i] === q.correctIndex ? total + 1 : total
    }, 0)
    try {
      await submitMockTest({
        examId,
        sectionId,
        studentName,
        studentId,
        answers: finalAnswers,
        score,
        totalQ: questions.length,
        timeTaken,
      })
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) return
      setSubmitting(false)
    }
  }, [submitting, answers, questions, examId, sectionId, studentName, studentId, timeLimit, timeLeft])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(true); return }
    if (timeLeft === 300) setShowWarning(true)
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, handleSubmit])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  const answered = answers.filter((a) => a !== null).length
  const q = questions[current]
  const isRed = timeLeft <= 60
  const isAmber = timeLeft <= 300 && timeLeft > 60

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-violet-400 to-transparent" />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#1a1d26]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-300">{testTitle}</span>
            <Badge variant="outline" className="border-white/[0.1] text-slate-400 text-xs">
              {answered}/{questions.length} answered
            </Badge>
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-lg tabular-nums ${
            isRed ? "text-red-400" : isAmber ? "text-amber-400" : "text-slate-200"
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.05]">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Warning banner */}
      {showWarning && timeLeft > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-2 justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <p className="text-xs text-amber-400 font-medium">5 minutes remaining</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Question */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold shrink-0">
              {current + 1}
            </div>
            <p className="text-lg text-slate-100 leading-relaxed pt-0.5">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 ml-12">
            {q.options.map((option, i) => {
              const selected = answers[current] === i
              return (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers]
                    next[current] = i
                    setAnswers(next)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? "bg-violet-500/15 border-violet-500/50 text-slate-100"
                      : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  {selected
                    ? <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                  }
                  <span className="text-sm">{option}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:bg-white/[0.07] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-6 h-6 rounded-md text-[10px] font-semibold transition-all ${
                  i === current
                    ? "bg-violet-500 text-white"
                    : answers[i] !== null
                    ? "bg-violet-500/20 text-violet-400"
                    : "bg-white/[0.06] text-slate-500 hover:bg-white/[0.1]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Submitting…</>
                : "Submit Test"
              }
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}