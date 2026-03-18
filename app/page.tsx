"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight, GraduationCap, BookOpen, Timer, BarChart3,
  CheckCircle2, Zap, Shield, ChevronRight, Hash, FileSpreadsheet
} from "lucide-react"

export default function HomePage() {
  const [quizCode, setQuizCode] = useState("")
  const router = useRouter()

  const handleStartQuiz = () => {
    if (!quizCode.trim()) return
    router.push(`/quiz/${quizCode.trim()}`)
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 overflow-x-hidden">

      {/* Top amber bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400 to-violet-500" />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      {/* ── NAV ── */}
      <nav className="relative z-40 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">EduQuiz</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/practice"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5"
          >
            Practice
          </Link>
          <Link href="/auth/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-slate-200 hover:bg-white/[0.1] transition-all"
          >
            Teacher Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-16 pb-32 px-6">

        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/8 text-amber-400 text-xs font-semibold tracking-wide">
            <Zap className="w-3 h-3" />
            Now with SAT Mock Tests
          </div>

          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-50 leading-[0.95]">
            The smarter way<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
              to learn & test.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create quizzes, run mock exams, and track student performance —
            all in one platform built for modern educators and students.
          </p>

          {/* Quiz code input */}
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
                placeholder="Enter quiz code"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all text-sm"
              />
            </div>
            <button
              onClick={handleStartQuiz}
              className="h-12 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all hover:-translate-y-px active:translate-y-0 flex items-center gap-2"
            >
              Join
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600">Have a quiz code from your teacher? Enter it above.</p>
        </div>
      </section>

      {/* ── TWO PATHS ── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Student card */}
          <Link href="/practice" className="group">
            <div className="relative h-full p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-transparent hover:border-violet-500/40 hover:from-violet-500/12 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <div className="p-3 rounded-xl bg-violet-500/15 border border-violet-500/20 w-fit">
                  <BookOpen className="w-6 h-6 text-violet-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-violet-400">For Students</p>
                  <h2 className="text-2xl font-bold text-slate-50">Practice & Prepare</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Take full-length SAT mock tests under real exam conditions. Review every answer with detailed explanations.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["SAT Mock Tests", "Timed Sessions", "Answer Review"].map((tag) => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-violet-400 group-hover:gap-2.5 transition-all">
                  Start Practicing
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Teacher card */}
          <Link href="/auth/login" className="group">
            <div className="relative h-full p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-transparent hover:border-amber-500/40 hover:from-amber-500/12 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/20 w-fit">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">For Teachers</p>
                  <h2 className="text-2xl font-bold text-slate-50">Create & Manage</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Build quizzes in minutes, share with students, and get instant analytics on performance and results.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Quiz Builder", "LaTeX Support", "Live Results"].map((tag) => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/8 text-amber-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="px-6 pb-24 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto pt-20 space-y-12">

          <div className="text-center space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">Everything you need</p>
            <h2 className="text-3xl font-bold text-slate-50 tracking-tight">Built for the classroom</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Timer, title: "Timed Quizzes", desc: "Set time limits per quiz. Students see a live countdown and auto-submit when time's up.", color: "amber" },
              { icon: FileSpreadsheet, title: "Import from Excel", desc: "Upload questions from a spreadsheet instead of typing them one by one.", color: "amber" },
              { icon: BarChart3, title: "Rich Analytics", desc: "See per-question accuracy, submission counts, and student performance at a glance.", color: "amber" },
              { icon: CheckCircle2, title: "LaTeX Math Support", desc: "Write equations like $x^2 + y^2$ and they render beautifully in questions and options.", color: "violet" },
              { icon: Shield, title: "Anti-Cheat", desc: "Tab-switch detection warns students and auto-submits after repeated violations.", color: "violet" },
              { icon: Zap, title: "Instant Results", desc: "Students see their score and full answer review the moment they submit.", color: "violet" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`p-5 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${
                color === "amber" ? "border-white/[0.07] hover:border-amber-500/15" : "border-white/[0.07] hover:border-violet-500/15"
              }`}>
                <div className={`p-2 rounded-lg w-fit mb-4 ${
                  color === "amber" ? "bg-amber-500/10" : "bg-violet-500/10"
                }`}>
                  <Icon className={`w-4 h-4 ${color === "amber" ? "text-amber-400" : "text-violet-400"}`} />
                </div>
                <h3 className="font-semibold text-slate-100 text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-10 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent text-center space-y-5 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">Get started today</p>
            <h2 className="text-3xl font-bold text-slate-50 tracking-tight">
              Ready to transform your classroom?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Join teachers already using EduQuiz to create engaging assessments and help students prepare for exams.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/auth/register"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all hover:-translate-y-px"
              >
                Create Free Account
              </Link>
              <Link href="/practice"
                className="px-6 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-sm transition-all"
              >
                Try Practice Tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-bold text-slate-400">EduQuiz</span>
          </div>
          <p className="text-xs text-slate-600">Built for educators and students.</p>
          <div className="flex items-center gap-4">
            <Link href="/practice" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Practice</Link>
            <Link href="/auth/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Teacher Login</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}