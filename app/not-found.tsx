import Link from "next/link"
import { GraduationCap, SearchX, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(196,155,71,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm text-center space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
        </div>

        {/* Card */}
        <div className="bg-[#22263380] border border-white/[0.1] rounded-xl p-8 space-y-5 shadow-2xl shadow-black/30">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">404 — Not Found</p>
            <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Page not found</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              The page or quiz you're looking for doesn't exist or may have been removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <Button asChild className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-all hover:-translate-y-px">
              <Link href="/">
                Go to Home
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full h-10 text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1] text-sm transition-all">
              <Link href="/teacher/login">Teacher Login</Link>
            </Button>
          </div>
        </div>

        {/* Hint for students */}
        <p className="text-xs text-slate-600">
          Trying to take a quiz? Double-check the code with your teacher.
        </p>

      </div>
    </div>
  )
}

