import { notFound } from "next/navigation"
import Link from "next/link"
import { getExams } from "@/prisma/exam.service"
import { ChevronLeft, Clock, BookOpen, ChevronRight, FileQuestion } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import StartTestButton from "@/components/start-test-button"

export default async function ExamPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam: examSlug } = await params
  const examName = examSlug.toUpperCase()

  const exams = await getExams()
  const exam = exams.find((e) => e.name.toUpperCase() === examName)
  if (!exam) notFound()

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-violet-400 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Back */}
        <Button variant="ghost" size="sm" asChild
          className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] -ml-2 h-8 text-xs"
        >
          <Link href="/practice">
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            All Exams
          </Link>
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-violet-400">
            Mock Test
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">{exam.name}</h1>
          <p className="text-slate-400 text-sm">
            Choose a section to practice or take the full exam.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
            Sections
          </p>

          {exam.sections.map((section) => (
            <Card key={section.id} className="bg-[#22263380] border border-white/[0.08] hover:border-violet-500/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-violet-500/15">
                        <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <h3 className="font-semibold text-slate-100">{section.name}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {section.timeLimit} min
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FileQuestion className="w-3 h-3" />
                        {(section as any)._count?.questions ?? 0} questions
                      </span>
                    </div>
                  </div>
                  <StartTestButton
                    examId={exam.id}
                    sectionId={section.id}
                    sectionName={section.name}
                    examName={exam.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full exam option */}
        {exam.sections.length > 1 && (
          <>
            <Separator className="bg-white/[0.08]" />
            <Card className="bg-violet-500/5 border border-violet-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-100">Full {exam.name} Mock Test</h3>
                    <p className="text-xs text-slate-400">
                      All sections · {exam.sections.reduce((a, s) => a + s.timeLimit, 0)} min total
                    </p>
                  </div>
                  <StartTestButton
                    examId={exam.id}
                    examName={exam.name}
                    fullExam
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  )
}