import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTeachers } from "@/prisma/teacher.service"
import { getPlatformStats, getExams } from "@/prisma/exam.service"
import { Shield, Users, BookOpen, FileText, FlaskConical, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import AdminTabs from "@/components/admin-tabs"

export default async function AdminDashboard() {
  const user = await currentUser()
  if (!user) redirect("/auth/login")

  const role = (user.publicMetadata as { role?: string })?.role
  if (role !== "admin") redirect("/teacher/dashboard")

  const [stats, teachers, exams] = await Promise.all([
    getPlatformStats(),
    getTeachers(),
    getExams(),
  ])

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/15 border border-red-500/25">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-red-400">
              Admin Portal
            </p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">Platform Overview</h1>
          <p className="text-sm text-slate-500">
            Welcome, {user.firstName ?? user.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Teachers", value: stats.teacherCount, icon: Users },
            { label: "Quizzes", value: stats.quizCount, icon: BookOpen },
            { label: "Submissions", value: stats.submissionCount, icon: FileText },
            { label: "Exams", value: stats.examCount, icon: FlaskConical },
            { label: "Mock Tests", value: stats.mockTestCount, icon: ClipboardList },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="bg-[#22263380] border border-white/[0.1]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between p-4">
                <CardDescription className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                  {label}
                </CardDescription>
                <div className="p-1.5 rounded-md bg-red-500/10">
                  <Icon className="w-3 h-3 text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-2xl font-bold text-slate-50">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs — client component */}
        <AdminTabs teachers={teachers} exams={exams} />

      </div>
    </div>
  )
}