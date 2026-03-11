"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, Loader2, User, Hash, XCircle, Timer, AlertTriangle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { submitQuiz } from "@/app/actions/quiz.actions"
import MathText from "@/components/math-text"

// ── Types ─────────────────────────────────────────────────────────────────────

type Question = {
  id: string
  question: string
  options: string[]
}

type Quiz = {
  id: string
  title: string
  timeLimit: number | null
  questions: Question[]
}

// ── Steps ─────────────────────────────────────────────────────────────────────

type Step = "info" | "quiz" | "submitting" | "duplicate"

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuizPage({ quiz }: { quiz: Quiz }) {
  const router = useRouter()

  const [step, setStep] = useState<Step>("info")
  const [studentName, setStudentName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  )
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  )

  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const MAX_VIOLATIONS = 3

  // ── Tab switch detection ───────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "quiz") return

    function handleViolation() {
      setViolations((prev) => {
        const next = prev + 1
        if (next >= MAX_VIOLATIONS) {
          handleSubmit()
        } else {
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 4000)
        }
        return next
      })
    }

    function handleVisibility() {
      if (document.hidden) handleViolation()
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleViolation)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleViolation)
    }
  }, [step])

  useEffect(() => {
    if (step !== "quiz" || timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null))
    }, 1000)
    return () => clearInterval(interval)
  }, [step, timeLeft])

  const currentQuestion = quiz.questions[currentIndex]
  const isLast = currentIndex === quiz.questions.length - 1
  const isFirst = currentIndex === 0
  const currentAnswer = answers[currentIndex]
  const answeredCount = answers.filter((a) => a !== null).length

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleStartQuiz() {
    if (!studentName.trim() || !studentId.trim()) return
    setStep("quiz")
  }

  function selectAnswer(index: number) {
    setAnswers((prev) => prev.map((a, i) => (i === currentIndex ? index : a)))
  }

  function goNext() {
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  function goPrev() {
    if (!isFirst) setCurrentIndex((i) => i - 1)
  }

  async function handleSubmit() {
    setStep("submitting")
    try {
      const formData = new FormData()
      formData.append("quizId", quiz.id)
      formData.append("student", studentName.trim())
      formData.append("studentId", studentId.trim())
      formData.append("answers", JSON.stringify(answers))
      await submitQuiz(formData)
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) return
      if (err?.message === "You have already attempted this quiz.") {
        setStep("duplicate")
        return
      }
      console.error(err)
      setStep("quiz")
    }
  }

  // ── Info Screen ───────────────────────────────────────────────────────────

  if (step === "info") {
    return (
      <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(196,155,71,0.06)_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-sm space-y-6">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
          </div>

          <Card className="bg-[#22263380] border border-white/[0.1] shadow-2xl shadow-black/30">
            <CardHeader className="space-y-1 pb-5">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
                Student Portal
              </p>
              <CardTitle className="text-xl font-bold text-slate-50 tracking-tight leading-snug">
                {quiz.title}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {quiz.questions.length} questions — enter your details to begin
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="e.g. John Smith"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="pl-9 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                  Student ID
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="e.g. STU-2024-001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
                    className="pl-9 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <Button
                onClick={handleStartQuiz}
                disabled={!studentName.trim() || !studentId.trim()}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── Duplicate Screen ──────────────────────────────────────────────────────

  if (step === "duplicate") {
    return (
      <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
        <div className="relative z-10 w-full max-w-sm">
          <Card className="bg-[#22263380] border border-red-500/20 shadow-2xl shadow-black/30">
            <CardHeader className="text-center pb-4 space-y-3">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-red-400">
                  Already Attempted
                </p>
                <CardTitle className="text-xl font-bold text-slate-50 tracking-tight mt-1">
                  Quiz already submitted
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-1">
                  Student ID <span className="text-slate-200 font-medium">{studentId}</span> has already attempted this quiz. Each student can only submit once.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-all">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── Submitting Screen ─────────────────────────────────────────────────────

  if (step === "submitting") {
    return (
      <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-300 font-medium">Submitting your answers…</p>
        </div>
      </div>
    )
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1d26] flex flex-col p-6">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-6 py-10">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
              {quiz.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{studentName} · {studentId}</p>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold transition-colors ${
                timeLeft <= 60
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : timeLeft <= 180
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-white/[0.05] border-white/[0.1] text-slate-300"
              }`}>
                <Timer className="w-3.5 h-3.5" />
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            )}
            {violations > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-[11px] font-semibold text-red-400">{violations}/{MAX_VIOLATIONS} strikes</span>
              </div>
            )}
            <Badge
              variant="outline"
              className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold text-[11px] tracking-wide"
            >
              {answeredCount}/{quiz.questions.length} answered
            </Badge>
          </div>
        </div>

        {/* ── Tab switch warning banner ── */}
        {showWarning && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="flex-1">
              <span className="font-semibold">Tab switch detected.</span>{" "}
              {MAX_VIOLATIONS - violations} warning{MAX_VIOLATIONS - violations !== 1 ? "s" : ""} remaining before auto-submit.
            </p>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* ── Question Card ── */}
        <Card className="bg-[#22263380] border border-white/[0.1]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {currentIndex + 1}
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                  Question {currentIndex + 1} of {quiz.questions.length}
                </p>
                <CardTitle className="text-base font-semibold text-slate-100 mt-1 leading-snug">
                  <MathText text={currentQuestion.question} />
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {currentQuestion.options.map((option, oIndex) => {
              const isSelected = currentAnswer === oIndex
              return (
                <button
                  key={oIndex}
                  type="button"
                  onClick={() => selectAnswer(oIndex)}
                  className={`w-full text-left px-4 py-3.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-slate-100"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? "border-amber-400 bg-amber-400" : "border-slate-600"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                  </div>
                  <MathText text={option} />
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={isFirst}
            className="h-10 px-5 border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:border-white/30 hover:bg-white/[0.07] disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {quiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all ${
                  i === currentIndex
                    ? "w-4 h-2 bg-amber-400"
                    : answers[i] !== null
                    ? "w-2 h-2 bg-amber-500/40"
                    : "w-2 h-2 bg-white/[0.12]"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < quiz.questions.length}
              className="h-10 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="h-10 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}