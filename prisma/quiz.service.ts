import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"


export const getPlatformStats = async () => {
  const [teacherCount, quizCount, submissionCount] = await Promise.all([
    prisma.teacher.count(),
    prisma.quiz.count(),
    prisma.submission.count(),
  ])
  return { teacherCount, quizCount, submissionCount }
}

type QuestionInput = {
  question: string
  options: string[]
  correctIndex: number
}

export const getQuizzesByTeacher = async (teacherId: string) => {
  return await prisma.quiz.findMany({
    where: { teacherId },
    include: {
      questions: true,
      submissions: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export const getQuizById = async (quizId: string) => {
  return await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      submissions: true,
    },
  })
}

export const addQuiz = async (
  title: string,
  teacherId: string,
  questions: QuestionInput[],
  timeLimit: number | null
) => {
  return await prisma.quiz.create({
    data: {
      title,
      teacherId,
      timeLimit,
      questions: {
        create: questions,
      },
    },
    include: {
      questions: true,
      submissions: true,
    },
  })
}

export const removeQuiz = async (quizId: string) => {
  await prisma.submission.deleteMany({ where: { quizId } })
  await prisma.question.deleteMany({ where: { quizId } })
  await prisma.quiz.delete({ where: { id: quizId } })
}

export const upsertTeacher = async ({ id, name, email }: { id: string; name: string; email: string }) => {
  await prisma.teacher.upsert({
    where: { id },
    update: {},
    create: { id, name, email },
  })
}

type UpdateQuizInput = {
  title: string
  timeLimit: number | null
  questions: {
    id?: string
    question: string
    options: string[]
    correctIndex: number
  }[]
}

export const editQuiz = async (quizId: string, data: UpdateQuizInput) => {
  await prisma.question.deleteMany({ where: { quizId } })

  return await prisma.quiz.update({
    where: { id: quizId },
    data: {
      title: data.title,
      timeLimit: data.timeLimit,
      questions: {
        create: data.questions.map(({ question, options, correctIndex }) => ({
          question,
          options,
          correctIndex,
        })),
      },
    },
    include: {
      questions: true,
      submissions: true,
    },
  })
}

export const addSubmission = async (quizId: string, student: string, studentId: string, score: number, answers: number[]) => {
  return await prisma.submission.create({
    data: { quizId, student, studentId, score, answers },
  })
}

export const getSubmissionByStudentAndQuiz = async (quizId: string, studentId: string) => {
  return await prisma.submission.findUnique({
    where: { quizId_studentId: { quizId, studentId } },
  })
}

export const toggleQuizOpen = async (quizId: string, isOpen: boolean) => {
  return await prisma.quiz.update({
    where: { id: quizId },
    data: { isOpen },
  })
}
