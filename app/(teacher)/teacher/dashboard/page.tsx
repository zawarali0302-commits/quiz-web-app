import Link from "next/link"
import { Plus, ExternalLink, BarChart3, BookOpen, Users, FileQuestion } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getQuizzesByTeacher } from "@/prisma/quiz.service"
import DeleteQuizButton from "@/components/delete-quiz-button"
import SignOutButton from "@/components/sign-out-button"
import CopyCodeButton from "@/components/copy-code-button"
import QuizToggleButton from "@/components/quiz-toggle-button"

export default async function TeacherDashboard() {
  const user = await currentUser()
  if (!user) redirect("/auth/login")

  const quizzes = await getQuizzesByTeacher(user.id)
  const totalQuestions = quizzes.reduce((a, q) => a + q.questions.length, 0)
  const totalSubmissions = quizzes.reduce((a, q) => a + q.submissions.length, 0)

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">

      {/* Top bar accent */}
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
              Educator Portal
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-sm text-slate-500">{user.emailAddresses[0]?.emailAddress}</p>
          </div>
          <div className="flex items-center gap-3">
            <SignOutButton />
            <Button
              asChild
              className="bg-amber-500 hover:bg-amber-600 text-white hover:text-white font-semibold transition-colors"
            >
              <Link href="/teacher/quiz/create">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Quizzes", value: quizzes.length, sub: "Active assessments", icon: BookOpen },
            { label: "Total Questions", value: totalQuestions, sub: "Across all quizzes", icon: FileQuestion },
            { label: "Submissions", value: totalSubmissions, sub: "Student responses", icon: Users },
          ].map(({ label, value, sub, icon: Icon }) => (
            <Card
              key={label}
              className="bg-[#22263380] border border-white/[0.1] hover:border-amber-500/25 transition-colors"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardDescription className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">
                  {label}
                </CardDescription>
                <div className="p-1.5 rounded-md bg-amber-500/15">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-50 leading-none mb-1">{value}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quiz Table Card */}
        <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">My Quizzes</CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-0.5">
                Manage and review all your assessments
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold text-[11px] tracking-wide"
            >
              {quizzes.length} total
            </Badge>
          </CardHeader>

          <Separator className="bg-white/[0.08]" />

          <CardContent className="p-0">
            {quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  <BookOpen className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No quizzes yet</p>
                <p className="text-slate-600 text-xs">Create your first quiz to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08] hover:bg-transparent">
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400 pl-6">
                      Quiz Title
                    </TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">
                      Questions
                    </TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">
                      Submissions
                    </TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="text-[10.5px] font-semibold tracking-widest uppercase text-slate-400 text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow
                      key={quiz.id}
                      className="border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <span className="font-semibold text-slate-100 text-sm">{quiz.title}</span>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/[0.08] text-slate-300 border-white/[0.1] border font-medium gap-1.5 text-xs"
                        >
                          <FileQuestion className="w-3 h-3" />
                          {quiz.questions.length}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className="bg-white/[0.08] text-slate-300 border-white/[0.1] border font-medium gap-1.5 text-xs"
                        >
                          <Users className="w-3 h-3" />
                          {quiz.submissions.length}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <QuizToggleButton quizId={quiz.id} isOpen={quiz.isOpen} />
                          <span className={`text-xs font-medium ${quiz.isOpen ? "text-emerald-400" : "text-slate-500"}`}>
                            {quiz.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <CopyCodeButton quizId={quiz.id} />
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-xs border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:border-white/30 hover:bg-white/[0.07]"
                          >
                            <Link href={`/teacher/quiz/${quiz.id}`}>
                              <ExternalLink className="w-3 h-3 mr-1.5" />
                              Open
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            asChild
                            className="h-8 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/35 hover:bg-amber-500/25 hover:text-amber-300 hover:border-amber-500/55 shadow-none"
                          >
                            <Link href={`/teacher/quiz/${quiz.id}/results`}>
                              <BarChart3 className="w-3 h-3 mr-1.5" />
                              Results
                            </Link>
                          </Button>
                          <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}