"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, GraduationCap, Hash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [quizCode, setQuizCode] = useState("")
  const router = useRouter()

  const handleStartQuiz = () => {
    if (!quizCode.trim()) return
    router.push(`/quiz/${quizCode}`)
  }

  return (
    <main className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Top amber bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(196,155,71,0.07)_0%,transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
        </div>

        <Card className="bg-[#22263380] border border-white/[0.1] shadow-2xl shadow-black/30">

          <CardHeader className="space-y-1 pb-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
              Student Portal
            </p>
            <CardTitle className="text-2xl font-bold text-slate-50 tracking-tight">
              Join a Quiz
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Enter your quiz code to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Quiz code input + button */}
            <div className="space-y-3">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Enter quiz code"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
                  className="pl-9 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50 transition-colors"
                />
              </div>

              <Button
                onClick={handleStartQuiz}
                disabled={!quizCode.trim()}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-white/[0.08]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-600">or</span>
              <Separator className="flex-1 bg-white/[0.08]" />
            </div>

            {/* Teacher login */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 text-center">
                Are you a teacher?
              </p>
              <Button
                variant="outline"
                asChild
                className="w-full h-11 border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:border-white/30 hover:bg-white/[0.07] transition-all"
              >
                <Link href="/teacher/login">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Teacher Login
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Feature badges */}
        <div className="mt-6 space-y-3">
          <p className="text-center text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-600">Platform Features</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "LaTeX Math", detail: "x² √ ∫ π", highlight: true },
              { label: "Quiz Timer", detail: "Auto-submit" },
              { label: "Instant Results", detail: "Per-question" },
            ].map(({ label, detail, highlight }) => (
              <div
                key={label}
                className={`flex flex-col items-center text-center px-3 py-4 rounded-xl border transition-colors ${
                  highlight
                    ? "bg-amber-500/8 border-amber-500/20"
                    : "bg-white/[0.03] border-white/[0.07]"
                }`}
              >
                <p className={`text-xs font-semibold ${highlight ? "text-amber-400" : "text-slate-300"}`}>
                  {label}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}