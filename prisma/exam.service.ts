import prisma from "@/lib/prisma"

// ── Exams ──────────────────────────────────────────────────

export const getExams = async () => {
  return await prisma.exam.findMany({
    include: {
      sections: {
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export const getExamByName = async (name: string) => {
  return await prisma.exam.findUnique({
    where: { name },
    include: {
      sections: {
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  })
}

export const getExamById = async (examId: string) => {
  return await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      sections: {
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  })
}

export const createExam = async (name: string) => {
  return await prisma.exam.create({ data: { name } })
}

export const removeExam = async (examId: string) => {
  const sections = await prisma.section.findMany({ where: { examId } })
  for (const section of sections) {
    await prisma.bankQuestion.deleteMany({ where: { sectionId: section.id } })
  }
  await prisma.section.deleteMany({ where: { examId } })
  await prisma.mockTestResult.deleteMany({ where: { examId } })
  await prisma.exam.delete({ where: { id: examId } })
}

// ── Sections ───────────────────────────────────────────────

export const createSection = async (examId: string, name: string, timeLimit: number) => {
  return await prisma.section.create({ data: { examId, name, timeLimit } })
}

export const getSectionById = async (sectionId: string) => {
  return await prisma.section.findUnique({
    where: { id: sectionId },
    include: { questions: true, exam: true },
  })
}

export const removeSection = async (sectionId: string) => {
  await prisma.bankQuestion.deleteMany({ where: { sectionId } })
  await prisma.section.delete({ where: { id: sectionId } })
}

// ── Bank Questions ─────────────────────────────────────────

export const addBankQuestions = async (
  sectionId: string,
  questions: { question: string; options: string[]; correctIndex: number; explanation?: string }[]
) => {
  return await prisma.bankQuestion.createMany({
    data: questions.map((q) => ({ ...q, sectionId })),
  })
}

export const deleteBankQuestion = async (questionId: string) => {
  return await prisma.bankQuestion.delete({ where: { id: questionId } })
}

export const clearSectionQuestions = async (sectionId: string) => {
  return await prisma.bankQuestion.deleteMany({ where: { sectionId } })
}

// ── Mock Test Results ──────────────────────────────────────

export const saveMockTestResult = async (data: {
  examId: string
  sectionId?: string
  studentName: string
  studentId: string
  answers: number[]
  score: number
  totalQ: number
  timeTaken: number
}) => {
  return await prisma.mockTestResult.create({ data })
}

export const getMockTestResultById = async (id: string) => {
  return await prisma.mockTestResult.findUnique({
    where: { id },
    include: {
      exam: {
        include: {
          sections: {
            include: { questions: true },
          },
        },
      },
    },
  })
}

export const getMockTestResultsByStudent = async (studentId: string) => {
  return await prisma.mockTestResult.findMany({
    where: { studentId },
    include: { exam: true },
    orderBy: { createdAt: "desc" },
  })
}

export const getPlatformStats = async () => {
  const [teacherCount, quizCount, submissionCount, examCount, mockTestCount] = await Promise.all([
    prisma.teacher.count(),
    prisma.quiz.count(),
    prisma.submission.count(),
    prisma.exam.count(),
    prisma.mockTestResult.count(),
  ])
  return { teacherCount, quizCount, submissionCount, examCount, mockTestCount }
}