"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, BookOpen, CheckCircle2, Circle, Trash2, Plus, Loader2, FileQuestion, Users, Calendar, Timer } from "lucide-react"

import { updateQuiz } from "@/app/actions/quiz.actions"
import MathText from "@/components/math-text"
import LatexCheatsheet from "@/components/latex-cheats-sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────

type Question = {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

type Quiz = {
  id: string
  title: string
  timeLimit: number | null
  createdAt: Date
  questions: Question[]
  submissions: { id: string }[]
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuizDetailPage({ quiz }: { quiz: Quiz }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(quiz.title)
  const [timeLimit, setTimeLimit] = useState<string>(quiz.timeLimit?.toString() ?? "")
  const [questions, setQuestions] = useState<Question[]>(quiz.questions)

  // ── Question helpers ──────────────────────────────────────────────────────

  function updateQuestionText(id: string, text: string) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, question: text } : q)))
  }

  function updateOption(id: string, index: number, text: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, options: q.options.map((o, i) => (i === index ? text : o)) }
          : q
      )
    )
  }

  function setCorrectIndex(id: string, index: number) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, correctIndex: index } : q)))
  }

  function addOption(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, options: [...q.options, ""] } : q))
    )
  }

  function removeOption(id: string, index: number) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q
        const newOptions = q.options.filter((_, i) => i !== index)
        const newCorrect =
          q.correctIndex === index ? 0
          : q.correctIndex > index ? q.correctIndex - 1
          : q.correctIndex
        return { ...q, options: newOptions, correctIndex: newCorrect }
      })
    )
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correctIndex: 0 },
    ])
  }

  function removeQuestion(id: string) {
    if (questions.length === 1) return
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim()) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      if (timeLimit) formData.append("timeLimit", timeLimit)
      formData.append(
        "questions",
        JSON.stringify(
          questions.map(({ question, options, correctIndex }) => ({
            question,
            options,
            correctIndex,
          }))
        )
      )
      await updateQuiz(quiz.id, formData)
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) return
      console.error(err)
      setIsLoading(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isQuestionComplete = (q: Question) =>
    q.question.trim() && q.options.length >= 2 && q.options.every((o) => o.trim())

  const completedCount = questions.filter(isQuestionComplete).length
  const canSave = title.trim() && completedCount === questions.length

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">

      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" asChild
              className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] -ml-2 mb-2 h-8 text-xs"
            >
              <Link href="/teacher/dashboard">
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
              Quiz Details
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">{quiz.title}</h1>
          </div>

          <div className="flex flex-col items-end gap-2 mt-10">
            <Badge variant="outline"
              className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold text-[11px] tracking-wide"
            >
              {completedCount}/{questions.length} ready
            </Badge>
            <p className="text-[11px] text-slate-600">questions complete</p>
          </div>
        </div>

        {/* ── Meta stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Questions", value: quiz.questions.length, icon: FileQuestion },
            { label: "Submissions", value: quiz.submissions.length, icon: Users },
            {
              label: "Created",
              value: new Date(quiz.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              icon: Calendar,
            },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="bg-[#22263380] border border-white/[0.1]">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-amber-500/15 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-200">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Quiz Title ── */}
        <Card className="bg-[#22263380] border border-white/[0.1]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-500/15">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-200">Quiz Details</CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-white/[0.08]" />
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                Quiz Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                Time Limit{" "}
                <span className="text-slate-600 normal-case tracking-normal font-normal">— optional, in minutes</span>
              </Label>
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number"
                  min={1}
                  max={180}
                  placeholder="e.g. 30"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="pl-9 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Questions ── */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">Questions</p>
          <LatexCheatsheet />
        </div>
        <div className="space-y-4">
          {questions.map((q, qIndex) => {
            const complete = isQuestionComplete(q)
            return (
              <Card key={q.id}
                className={`bg-[#22263380] border transition-colors ${complete ? "border-amber-500/20" : "border-white/[0.1]"}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                        complete ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.06] text-slate-500"
                      }`}>
                        {qIndex + 1}
                      </div>
                      <CardTitle className="text-sm font-semibold text-slate-300">
                        Question {qIndex + 1}
                      </CardTitle>
                      {complete && (
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                          Ready
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm"
                      onClick={() => removeQuestion(q.id)}
                      disabled={questions.length === 1}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <Separator className="bg-white/[0.08]" />

                <CardContent className="pt-5 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                      Question
                    </Label>
                    <Input
                      placeholder="e.g. Solve $x^2 - 4 = 0$ or plain text question"
                      value={q.question}
                      onChange={(e) => updateQuestionText(q.id, e.target.value)}
                      className="bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
                    />
                    {q.question.includes("$") && (
                      <div className="px-3 py-2 rounded-md bg-amber-500/5 border border-amber-500/15 text-sm text-slate-300">
                        <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-semibold mr-2">Preview:</span>
                        <MathText text={q.question} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                      Options{" "}
                      <span className="text-slate-600 normal-case tracking-normal font-normal">
                        — click circle to mark correct answer
                      </span>
                    </Label>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => {
                        const isCorrect = q.correctIndex === oIndex
                        return (
                          <div key={oIndex} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setCorrectIndex(q.id, oIndex)}
                                className="shrink-0 transition-colors"
                              >
                                {isCorrect
                                  ? <CheckCircle2 className="w-5 h-5 text-amber-400" />
                                  : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                                }
                              </button>
                              <Input
                                placeholder={`Option ${oIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                className={`flex-1 h-10 text-sm placeholder:text-slate-500 transition-colors ${
                                  isCorrect
                                    ? "bg-amber-500/10 border-amber-500/30 text-slate-100 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                                    : "bg-white/[0.06] border-white/[0.12] text-slate-100 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                                }`}
                              />
                              <Button variant="ghost" size="sm"
                                onClick={() => removeOption(q.id, oIndex)}
                                disabled={q.options.length <= 2}
                                className="h-8 w-8 p-0 shrink-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            {option.includes("$") && (
                              <div className="ml-7 px-2 py-1.5 rounded-md bg-amber-500/5 border border-amber-500/15 text-xs text-slate-300">
                                <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-semibold mr-1.5">Preview:</span>
                                <MathText text={option} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {q.options.length < 6 && (
                      <Button variant="ghost" size="sm" onClick={() => addOption(q.id)}
                        className="h-8 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] mt-1"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ── Add Question ── */}
        <Button variant="outline" onClick={addQuestion}
          className="w-full h-11 border-dashed border-white/[0.15] bg-transparent text-slate-400 hover:text-slate-200 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>

        <Separator className="bg-white/[0.08]" />

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pb-8">
          <p className="text-xs text-slate-600">
            {canSave
              ? "✓ All questions are ready"
              : `${questions.length - completedCount} question${questions.length - completedCount !== 1 ? "s" : ""} still incomplete`}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild
              className="h-11 px-6 border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:border-white/30 hover:bg-white/[0.07]"
            >
              <Link href="/teacher/dashboard">Cancel</Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !canSave}
              className="h-11 px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Changes</>
              }
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}