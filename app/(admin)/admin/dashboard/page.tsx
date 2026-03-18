import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTeachers } from "@/prisma/teacher.service"
import { getPlatformStats } from "@/prisma/exam.service"
import { Shield, Users, BookOpen, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import DeleteTeacherButton from "@/components/delete-teacher-button"

export default async function AdminDashboard() {
  const user = await currentUser()
  if (!user) redirect("/auth/login")

  const role = (user.publicMetadata as { role?: string })?.role
  if (role !== "admin") redirect("/teacher/dashboard")

  const [stats, teachers] = await Promise.all([
    getPlatformStats(),
    getTeachers(),
  ])

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">

      {/* Top bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-red-400 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-500/15 border border-red-500/25">
                <Shield className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-red-400">
                Admin Portal
              </p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">
              Platform Overview
            </h1>
            <p className="text-sm text-slate-500">
              Welcome, {user.firstName ?? user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Teachers", value: stats.teacherCount, sub: "Registered educators", icon: Users },
            { label: "Total Quizzes", value: stats.quizCount, sub: "Created assessments", icon: BookOpen },
            { label: "Total Submissions", value: stats.submissionCount, sub: "Student responses", icon: FileText },
          ].map(({ label, value, sub, icon: Icon }) => (
            <Card key={label} className="bg-[#22263380] border border-white/[0.1]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardDescription className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">
                  {label}
                </CardDescription>
                <div className="p-1.5 rounded-md bg-red-500/10">
                  <Icon className="w-3.5 h-3.5 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-50">{value}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teachers Table */}
        <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">
                All Teachers
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-0.5">
                All registered educators on the platform
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
              {teachers.length} total
            </Badge>
          </CardHeader>

          <Separator className="bg-white/[0.08]" />

          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No teachers yet</p>
                <p className="text-slate-600 text-xs">Teachers will appear here once they sign up.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08]">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="border-white/[0.06]">
                      <TableCell className="pl-6 py-4 font-semibold text-slate-100">
                        {teacher.name}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DeleteTeacherButton
                          teacherId={teacher.id}
                          teacherName={teacher.name}
                        />
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