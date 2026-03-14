import prisma from "@/lib/prisma"

export const getTeachers = async () => {
  const teachers = await prisma.teacher.findMany()
  return teachers
}

export const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  })
  return teacher
}

export const addTeacher = async (data: { name: string; email: string }) => {
  const teacher = await prisma.teacher.create({
    data,
  })
  return teacher
}

export const editTeacher = async (id: string, data: { name: string; email: string }) => {
  const teacher = await prisma.teacher.update({
    where: { id },
    data,
  })
  return teacher
}

export const removeTeacher = async (id: string) => {
  const quizzes = await prisma.quiz.findMany({ where: { teacherId: id } })
  for (const quiz of quizzes) {
    await prisma.submission.deleteMany({ where: { quizId: quiz.id } })
    await prisma.question.deleteMany({ where: { quizId: quiz.id } })
  }
  await prisma.quiz.deleteMany({ where: { teacherId: id } })
  await prisma.teacher.delete({ where: { id } })
}