import Link from "next/link"
import { getExams } from "@/prisma/exam.service"
import { BookOpen, ChevronRight, GraduationCap, FlaskConical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function PracticePage() {
  const exams = await getExams()

  const examIcons: Record<string, any> = {
    SAT: GraduationCap,
    MDCAT: FlaskConical,
    ECAT: BookOpen,
  }

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-violet-400 to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(139,92,246,0.06)_0%,transparent_60%)]" />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-violet-400">
            Exam Preparation
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-50">
            Practice Tests
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Simulate real exam conditions with timed mock tests. Choose an exam to get started.
          </p>
        </div>

        {/* Exam Cards */}
        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No exams available yet</p>
            <p className="text-slate-600 text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const Icon = examIcons[exam.name] ?? BookOpen
              const totalSections = exam.sections.length
              return (
                <Link key={exam.id} href={`/practice/${exam.name.toLowerCase()}`}>
                  <Card className="group bg-[#22263380] border border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="p-2.5 rounded-lg bg-violet-500/15 border border-violet-500/20 w-fit">
                            <Icon className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-50">{exam.name}</h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {totalSections} section{totalSections !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {exam.sections.map((s) => (
                              <Badge
                                key={s.id}
                                variant="outline"
                                className="border-white/[0.1] text-slate-400 text-[11px]"
                              >
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}