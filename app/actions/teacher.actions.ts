"use server"

import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { removeTeacher } from "@/prisma/teacher.service"

const requireAdmin = async () => {
  const user = await currentUser()
  if (!user) redirect("/teacher/login")
  const role = (user.publicMetadata as { role?: string })?.role
  if (role !== "admin") redirect("/teacher/dashboard")
}

export const deleteTeacherAction = async (teacherId: string) => {
  await requireAdmin()
  await removeTeacher(teacherId)
  revalidatePath("/admin/dashboard")
}