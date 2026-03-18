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
import prisma from "@/lib/prisma"

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

// ── Import full exam from file ────────────────────────────

export const importExamAction = async (
  rows: { exam: string; section: string; timeLimit: number; question: string; options: string[]; correctIndex: number; explanation?: string }[]
) => {
  await requireAdmin()

  // Group by exam → section
  const examMap = new Map<string, Map<string, { timeLimit: number; questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[] }>>()

  for (const row of rows) {
    if (!examMap.has(row.exam)) examMap.set(row.exam, new Map())
    const sectionMap = examMap.get(row.exam)!
    if (!sectionMap.has(row.section)) {
      sectionMap.set(row.section, { timeLimit: row.timeLimit, questions: [] })
    }
    sectionMap.get(row.section)!.questions.push({
      question: row.question,
      options: row.options,
      correctIndex: row.correctIndex,
      explanation: row.explanation,
    })
  }

  for (const [examName, sectionMap] of examMap) {
    // Get or create exam
    let exam = await prisma.exam.findUnique({ where: { name: examName } })
    if (!exam) exam = await createExam(examName)

    for (const [sectionName, { timeLimit, questions }] of sectionMap) {
      // Get or create section
      let section = await prisma.section.findUnique({
        where: { examId_name: { examId: exam.id, name: sectionName } },
      })
      if (!section) section = await createSection(exam.id, sectionName, timeLimit)

      // Merge — just add questions
      await addBankQuestions(section.id, questions)
    }
  }

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
  // Calculate score server-side using actual correctIndex values
  let score = 0
  if (data.sectionId) {
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      include: { questions: true },
    })
    if (section) {
      score = section.questions.reduce((total, q, i) => {
        return data.answers[i] === q.correctIndex ? total + 1 : total
      }, 0)
    }
  } else {
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      include: { sections: { include: { questions: true } } },
    })
    if (exam) {
      const allQuestions = exam.sections.flatMap((s) => s.questions)
      score = allQuestions.reduce((total, q, i) => {
        return data.answers[i] === q.correctIndex ? total + 1 : total
      }, 0)
    }
  }

  const result = await saveMockTestResult({ ...data, score })
  redirect(`/practice/result/${result.id}`)
}