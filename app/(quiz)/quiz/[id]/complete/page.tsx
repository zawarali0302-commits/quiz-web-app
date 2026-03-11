import Link from "next/link"
import { notFound } from "next/navigation"
import { Trophy, GraduationCap, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import MathText from "@/components/math-text"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    score: string
    total: string
    student: string
    answers?: string
    correct?: string
    questions?: string
  }>
}

export default async function CompletePage({ params, searchParams }: Props) {
  await params
  const { score, total, student, answers, correct, questions } = await searchParams

  if (!score || !total || !student) notFound()

  const scoreNum = parseInt(score)
  const totalNum = parseInt(total)
  const pct = Math.round((scoreNum / totalNum) * 100)

  const grade =
    pct >= 80 ? { label: "Excellent", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" } :
    pct >= 60 ? { label: "Good", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" } :
    pct >= 40 ? { label: "Keep Practising", color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" } :
                { label: "Needs Work", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" }

  const greeting =
    pct >= 80 ? "Excellent work" :
    pct >= 60 ? "Good effort" :
    pct >= 40 ? "Keep practising" :
                "Don't give up"

  const decodedStudent = decodeURIComponent(student)

  // Parse review data
  type QuestionData = { question: string; options: string[] }
  const studentAnswers: number[] = answers ? JSON.parse(decodeURIComponent(answers)) : []
  const correctAnswers: number[] = correct ? JSON.parse(decodeURIComponent(correct)) : []
  const questionList: QuestionData[] = questions ? JSON.parse(decodeURIComponent(questions)) : []
  const hasReview = questionList.length > 0 && studentAnswers.length > 0 && correctAnswers.length > 0

  return (
    <div className="min-h-screen bg-[#1a1d26] pb-16">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(196,155,71,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-12 space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
        </div>

        {/* ── Score Card ── */}
        <Card className="bg-[#22263380] border border-white/[0.1] shadow-2xl shadow-black/30">
          <CardHeader className="text-center pb-4 space-y-3">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full border ${grade.bg} ${grade.border}`}>
                <Trophy className={`w-8 h-8 ${grade.color}`} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">Quiz Complete</p>
              <CardTitle className="text-2xl font-bold text-slate-50 tracking-tight mt-1">
                {greeting}, {decodedStudent}!
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-1">Here's how you did</CardDescription>
            </div>
          </CardHeader>

          <Separator className="bg-white/[0.08]" />

          <CardContent className="pt-6 space-y-5">
            {/* Score display */}
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1">Score</p>
                <p className="text-4xl font-bold text-slate-50">
                  {scoreNum}<span className="text-xl text-slate-500 font-normal">/{totalNum}</span>
                </p>
              </div>
              <Separator orientation="vertical" className="h-12 bg-white/[0.08]" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1">Percentage</p>
                <p className={`text-4xl font-bold ${grade.color}`}>{pct}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Grade badge + breakdown */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{scoreNum} correct</span>
              </div>
              <Badge variant="outline" className={`font-semibold text-[11px] border ${grade.bg} ${grade.color} ${grade.border}`}>
                {grade.label}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>{totalNum - scoreNum} wrong</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Answer Review ── */}
        {hasReview && (
          <Card className="bg-[#22263380] border border-white/[0.1]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-100">Answer Review</CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    See which questions you got right and wrong
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-white/[0.08]" />

            <CardContent className="pt-5 space-y-5">
              {questionList.map((q, index) => {
                const studentAnswer = studentAnswers[index]
                const correctAnswer = correctAnswers[index]
                const isCorrect = studentAnswer === correctAnswer

                return (
                  <div key={index} className="space-y-3">
                    {/* Question header */}
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 mt-0.5 p-1 rounded-full ${isCorrect ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                        {isCorrect
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <p className="text-sm font-medium text-slate-200 leading-snug"><MathText text={q.question} /></p>
                    </div>

                    {/* Options */}
                    <div className="ml-7 space-y-1.5">
                      {q.options.map((option, optIndex) => {
                        const isStudentChoice = optIndex === studentAnswer
                        const isCorrectOption = optIndex === correctAnswer

                        let optStyle = "bg-white/[0.03] border-white/[0.08] text-slate-500"
                        if (isCorrectOption) optStyle = "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                        else if (isStudentChoice && !isCorrect) optStyle = "bg-red-500/10 border-red-500/25 text-red-300"

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors ${optStyle}`}
                          >
                            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                              isCorrectOption ? "border-emerald-500/40 text-emerald-400" :
                              isStudentChoice && !isCorrect ? "border-red-500/40 text-red-400" :
                              "border-white/[0.1] text-slate-600"
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1"><MathText text={option} /></span>
                            {isCorrectOption && (
                              <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">CORRECT</span>
                            )}
                            {isStudentChoice && !isCorrect && (
                              <span className="text-[10px] font-semibold text-red-400 tracking-wide">YOUR ANSWER</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {index < questionList.length - 1 && <Separator className="bg-white/[0.05]" />}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Back to home */}
        <Button asChild className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 hover:-translate-y-px transition-all">
          <Link href="/">
            Back to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>

      </div>
    </div>
  )
}