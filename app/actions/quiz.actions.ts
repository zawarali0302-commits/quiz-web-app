"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { addQuiz, getQuizById, removeQuiz, upsertTeacher, addSubmission, getSubmissionByStudentAndQuiz, toggleQuizOpen, editQuiz } from "@/prisma/quiz.service"

type QuestionInput = {
  question: string
  options: string[]
  correctIndex: number
}

export const createQuiz = async (data: FormData) => {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  // ✅ Ensure teacher exists in DB — create if first time
  const user = await currentUser()
  await upsertTeacher({
    id: userId,
    name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Teacher",
    email: user?.emailAddresses[0]?.emailAddress ?? "",
  })

  const title = (data.get("title") as string)?.trim()
  const rawQuestions = data.get("questions") as string
  const rawTimeLimit = data.get("timeLimit") as string
  const timeLimit = rawTimeLimit ? parseInt(rawTimeLimit) : null

  if (!title) throw new Error("Quiz title is required.")
  if (!rawQuestions) throw new Error("Questions are required.")

  let questions: QuestionInput[]
  try {
    questions = JSON.parse(rawQuestions)
  } catch {
    throw new Error("Invalid questions format.")
  }

  if (!Array.isArray(questions) || questions.length === 0)
    throw new Error("At least one question is required.")

  for (const [i, q] of questions.entries()) {
    if (!q.question?.trim())
      throw new Error(`Question ${i + 1} text is missing.`)
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error(`Question ${i + 1} must have at least 2 options.`)
    if (q.options.some((o: string) => !o?.trim()))
      throw new Error(`Question ${i + 1} has an empty option.`)
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
      throw new Error(`Question ${i + 1} has an invalid correct answer.`)
  }

  await addQuiz(title, userId, questions, timeLimit)

  revalidatePath("/teacher/dashboard")
  redirect("/teacher/dashboard")
}

export const deleteQuiz = async (quizId: string) => {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  const quiz = await getQuizById(quizId)
  if (!quiz) throw new Error("Quiz not found.")
  if (quiz.teacherId !== userId) throw new Error("Unauthorized.")

  await removeQuiz(quizId)

  revalidatePath("/teacher/dashboard")
}

export const updateQuiz = async (quizId: string, data: FormData) => {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  const quiz = await getQuizById(quizId)
  if (!quiz) throw new Error("Quiz not found.")
  if (quiz.teacherId !== userId) throw new Error("Unauthorized.")

  const title = (data.get("title") as string)?.trim()
  const rawQuestions = data.get("questions") as string
  const rawTimeLimit = data.get("timeLimit") as string
  const timeLimit = rawTimeLimit ? parseInt(rawTimeLimit) : null

  if (!title) throw new Error("Quiz title is required.")
  if (!rawQuestions) throw new Error("Questions are required.")

  let questions: { question: string; options: string[]; correctIndex: number }[]
  try {
    questions = JSON.parse(rawQuestions)
  } catch {
    throw new Error("Invalid questions format.")
  }

  if (!Array.isArray(questions) || questions.length === 0)
    throw new Error("At least one question is required.")

  for (const [i, q] of questions.entries()) {
    if (!q.question?.trim())
      throw new Error(`Question ${i + 1} text is missing.`)
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error(`Question ${i + 1} must have at least 2 options.`)
    if (q.options.some((o: string) => !o?.trim()))
      throw new Error(`Question ${i + 1} has an empty option.`)
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length)
      throw new Error(`Question ${i + 1} has an invalid correct answer.`)
  }

  await editQuiz(quizId, { title, timeLimit, questions })

  revalidatePath("/teacher/dashboard")
  revalidatePath(`/teacher/quiz/${quizId}`)
  redirect("/teacher/dashboard")
}

export const toggleQuiz = async (quizId: string, isOpen: boolean) => {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  const quiz = await getQuizById(quizId)
  if (!quiz) throw new Error("Quiz not found.")
  if (quiz.teacherId !== userId) throw new Error("Unauthorized.")

  await toggleQuizOpen(quizId, isOpen)
  revalidatePath("/teacher/dashboard")
}

export const submitQuiz = async (data: FormData) => {
  const quizId = data.get("quizId") as string
  const student = (data.get("student") as string)?.trim()
  const studentId = (data.get("studentId") as string)?.trim()
  const rawAnswers = data.get("answers") as string

  if (!quizId) throw new Error("Quiz ID is required.")
  if (!student) throw new Error("Student name is required.")
  if (!studentId) throw new Error("Student ID is required.")
  if (!rawAnswers) throw new Error("Answers are required.")

  // Check for duplicate submission
  const existing = await getSubmissionByStudentAndQuiz(quizId, studentId)
  if (existing) throw new Error("You have already attempted this quiz.")

  let answers: (number | null)[]
  try {
    answers = JSON.parse(rawAnswers)
  } catch {
    throw new Error("Invalid answers format.")
  }

  const quiz = await getQuizById(quizId)
  if (!quiz) throw new Error("Quiz not found.")
  if (!quiz.isOpen) throw new Error("This quiz is closed and no longer accepting submissions.")

  if (answers.length !== quiz.questions.length)
    throw new Error("Answer count does not match question count.")

  const score = quiz.questions.reduce((total, question, index) => {
    const answer = answers[index]
    return answer !== null && answer === question.correctIndex ? total + 1 : total
  }, 0)

  await addSubmission(quizId, student, studentId, score, (answers as (number | null)[]).map((a) => a ?? -1))

  const correctAnswers = quiz.questions.map((q) => q.correctIndex)
  const questions = quiz.questions.map((q) => ({ question: q.question, options: q.options }))

  revalidatePath(`/teacher/quiz/${quizId}/results`)
  redirect(
    `/quiz/${quizId}/complete?score=${score}&total=${quiz.questions.length}&student=${encodeURIComponent(student)}&answers=${encodeURIComponent(JSON.stringify(answers))}&correct=${encodeURIComponent(JSON.stringify(correctAnswers))}&questions=${encodeURIComponent(JSON.stringify(questions))}`
  )
}