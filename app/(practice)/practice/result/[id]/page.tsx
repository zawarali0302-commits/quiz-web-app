import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, RotateCcw, Home, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMockTestResultById } from "@/prisma/exam.service"

export default async function MockTestResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMockTestResultById(id)
  if (!result) notFound()

  const pct = Math.round((result.score / result.totalQ) * 100)
  const mins = Math.floor(result.timeTaken / 60)
  const secs = result.timeTaken % 60

  const greeting =
    pct >= 90 ? "Outstanding!" :
    pct >= 75 ? "Great work!" :
    pct >= 60 ? "Good effort!" :
    pct >= 40 ? "Keep practicing!" :
    "Don't give up!"

  // Flatten all questions from all sections
  const allQuestions = result.exam.sections.flatMap((s) => s.questions)

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-violet-400 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Score card */}
        <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-violet-400" />
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-violet-400" />
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-violet-400">
                Test Complete
              </p>
            </div>
            <h1 className="text-5xl font-bold text-slate-50">{greeting}</h1>
            <p className="text-slate-400">{result.studentName}</p>

            <div className="flex items-center justify-center gap-8 pt-2">
              <div className="text-center">
                <p className="text-4xl font-bold text-violet-400">{pct}%</p>
                <p className="text-xs text-slate-500 mt-1">Score</p>
              </div>
              <div className="w-px h-12 bg-white/[0.08]" />
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-50">{result.score}/{result.totalQ}</p>
                <p className="text-xs text-slate-500 mt-1">Correct</p>
              </div>
              <div className="w-px h-12 bg-white/[0.08]" />
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-50">{mins}:{secs.toString().padStart(2, "0")}</p>
                <p className="text-xs text-slate-500 mt-1">Time taken</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button asChild variant="outline"
                className="border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:bg-white/[0.07]"
              >
                <Link href="/practice">
                  <Home className="w-4 h-4 mr-1.5" />
                  All Exams
                </Link>
              </Button>
              <Button asChild className="bg-violet-500 hover:bg-violet-600 text-white font-semibold">
                <Link href={`/practice/${result.exam.name.toLowerCase()}`}>
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Try Again
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer review */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
            Answer Review
          </p>

          {allQuestions.map((q, i) => {
            const given = result.answers[i]
            const correct = q.correctIndex
            const isCorrect = given === correct
            const isUnanswered = given === -1

            return (
              <Card key={q.id}
                className={`bg-[#22263380] border transition-colors ${
                  isCorrect ? "border-emerald-500/20" : "border-red-500/15"
                }`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCorrect
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        <span className="text-slate-500 mr-2">Q{i + 1}.</span>
                        {q.question}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt, oi) => (
                          <span key={oi} className={`text-xs px-2.5 py-1 rounded-lg border ${
                            oi === correct
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : oi === given && !isCorrect
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-white/[0.03] border-white/[0.08] text-slate-500"
                          }`}>
                            {["A","B","C","D"][oi]}. {opt}
                          </span>
                        ))}
                      </div>

                      {isUnanswered && (
                        <p className="text-xs text-slate-500 italic">Not answered</p>
                      )}

                      {q.explanation && (
                        <div className="px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/15">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-400 mb-1">
                            Explanation
                          </p>
                          <p className="text-xs text-slate-300">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </div>
  )
}