import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Users, Trophy, BarChart3, TrendingUp, FileQuestion, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { getQuizById } from "@/prisma/quiz.service"
import MathText from "@/components/math-text"

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  const { id } = await params
  const quiz = await getQuizById(id)
  if (!quiz) notFound()
  if (quiz.teacherId !== userId) redirect("/teacher/dashboard")

  const submissions = quiz.submissions
  const totalQuestions = quiz.questions.length

  // ── Stats ──
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((a, s) => a + s.score, 0) / submissions.length)
    : 0
  const highScore = submissions.length ? Math.max(...submissions.map((s) => s.score)) : 0
  const passCount = submissions.filter((s) => s.score >= Math.ceil(totalQuestions / 2)).length
  const passRate = submissions.length ? Math.round((passCount / submissions.length) * 100) : 0

  // ── Per-question analytics ──
  const questionStats = quiz.questions.map((q, qIndex) => {
    const total = submissions.length
    const correct = submissions.filter((s) => (s.answers as number[])?.[qIndex] === q.correctIndex).length
    const unanswered = submissions.filter((s) => (s.answers as number[])?.[qIndex] === -1).length
    const correctRate = total > 0 ? Math.round((correct / total) * 100) : 0
    return { ...q, correct, unanswered, total, correctRate }
  })

  function getScoreBadge(score: number) {
    const pct = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0
    if (pct >= 80) return { label: "Excellent", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }
    if (pct >= 60) return { label: "Good", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" }
    return { label: "Needs Work", className: "bg-red-500/10 text-red-400 border-red-500/30" }
  }

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

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
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">Quiz Results</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">{quiz.title}</h1>
          </div>
          <div className="mt-10">
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold text-[11px] tracking-wide">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Submissions", value: submissions.length, icon: Users, sub: "Total responses" },
            { label: "Avg Score", value: `${avgScore}/${totalQuestions}`, icon: BarChart3, sub: "Per student" },
            { label: "High Score", value: `${highScore}/${totalQuestions}`, icon: Trophy, sub: "Best result" },
            { label: "Pass Rate", value: `${passRate}%`, icon: TrendingUp, sub: "≥ 50% correct" },
          ].map(({ label, value, icon: Icon, sub }) => (
            <Card key={label} className="bg-[#22263380] border border-white/[0.1] hover:border-amber-500/25 transition-colors">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">{label}</CardDescription>
                <div className="p-1.5 rounded-md bg-amber-500/15">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-50 leading-none mb-1">{value}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Per-Question Analytics ── */}
        {submissions.length > 0 && (
          <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/15">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-100">Question Breakdown</CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-0.5">
                    How students performed on each question
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-white/[0.08]" />

            <CardContent className="pt-5 space-y-5">
              {questionStats.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 mt-0.5 w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-slate-400">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium leading-snug"><MathText text={q.question} /></p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Correct answer: <span className="text-slate-300"><MathText text={q.options[q.correctIndex]} /></span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {q.correctRate >= 70
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : q.correctRate >= 40
                        ? <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                      }
                      <span className={`text-sm font-bold font-mono ${
                        q.correctRate >= 70 ? "text-emerald-400" : q.correctRate >= 40 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {q.correctRate}%
                      </span>
                    </div>
                  </div>
                  <div className="ml-9 space-y-1">
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          q.correctRate >= 70 ? "bg-emerald-500" : q.correctRate >= 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${q.correctRate}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {q.correct} of {q.total} student{q.total !== 1 ? "s" : ""} answered correctly
                      {q.unanswered > 0 && <span className="text-slate-700"> · {q.unanswered} unanswered</span>}
                    </p>
                  </div>
                  {index < questionStats.length - 1 && <Separator className="bg-white/[0.05] mt-2" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Submissions Table ── */}
        <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">Student Submissions</CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-0.5">All responses for this quiz</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <FileQuestion className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">{totalQuestions} questions</span>
            </div>
          </CardHeader>

          <Separator className="bg-white/[0.08]" />

          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No submissions yet</p>
                <p className="text-slate-600 text-xs">Share the quiz code with your students to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400 pl-6">Student</TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">Score</TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">Percentage</TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">Grade</TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400 text-right pr-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...submissions].sort((a, b) => b.score - a.score).map((submission) => {
                    const pct = totalQuestions > 0 ? Math.round((submission.score / totalQuestions) * 100) : 0
                    const badge = getScoreBadge(submission.score)
                    return (
                      <TableRow key={submission.id} className="border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                        <TableCell className="pl-6 py-4">
                          <p className="font-semibold text-slate-100 text-sm">{submission.student}</p>
                          <p className="text-xs text-slate-500">{submission.studentId}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-semibold text-slate-200 text-sm font-mono">
                            {submission.score}<span className="text-slate-500 font-sans font-normal">/{totalQuestions}</span>
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs font-mono">{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className={`text-[10px] font-semibold border ${badge.className}`}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 pr-6 text-right">
                          <span className="text-slate-500 text-xs">
                            {new Date(submission.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}