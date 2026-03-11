import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { getQuizById } from "@/prisma/quiz.service"
import QuizDetailPage from "./quiz-detail-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect("/teacher/login")

  const { id } = await params
  const quiz = await getQuizById(id)
  if (!quiz) notFound()
  if (quiz.teacherId !== userId) redirect("/teacher/dashboard")

  return <QuizDetailPage quiz={quiz} />
}