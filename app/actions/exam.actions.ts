"use server"

import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  createExam,
  removeExam,
  createSection,
  removeSection,
  addBankQuestions,
  clearSectionQuestions,
  saveMockTestResult,
} from "@/prisma/exam.service"

// ── Admin helpers ──────────────────────────────────────────

const requireAdmin = async () => {
  const user = await currentUser()
  if (!user) redirect("/auth/login")
  const role = (user.publicMetadata as { role?: string })?.role
  if (role !== "admin") redirect("/teacher/dashboard")
}

// ── Exam actions ───────────────────────────────────────────

export const createExamAction = async (name: string) => {
  await requireAdmin()
  await createExam(name)
  revalidatePath("/admin/dashboard")
}

export const deleteExamAction = async (examId: string) => {
  await requireAdmin()
  await removeExam(examId)
  revalidatePath("/admin/dashboard")
}

// ── Section actions ────────────────────────────────────────

export const createSectionAction = async (examId: string, name: string, timeLimit: number) => {
  await requireAdmin()
  await createSection(examId, name, timeLimit)
  revalidatePath("/admin/dashboard")
}

export const deleteSectionAction = async (sectionId: string) => {
  await requireAdmin()
  await removeSection(sectionId)
  revalidatePath("/admin/dashboard")
}

// ── Question bank actions ──────────────────────────────────

export const importQuestionsAction = async (
  sectionId: string,
  questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[]
) => {
  await requireAdmin()
  await clearSectionQuestions(sectionId)
  await addBankQuestions(sectionId, questions)
  revalidatePath("/admin/dashboard")
}

// ── Student mock test submission ───────────────────────────

export const submitMockTest = async (data: {
  examId: string
  sectionId?: string
  studentName: string
  studentId: string
  answers: number[]
  score: number
  totalQ: number
  timeTaken: number
}) => {
  const result = await saveMockTestResult(data)
  redirect(`/practice/result/${result.id}`)
}