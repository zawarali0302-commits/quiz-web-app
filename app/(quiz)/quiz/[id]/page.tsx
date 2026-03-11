import { notFound } from "next/navigation"
import { getQuizById } from "@/prisma/quiz.service"
import { GraduationCap, Lock } from "lucide-react"
import QuizPage from "./quiz-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await getQuizById(id)
  if (!quiz) notFound()

  // Quiz is closed — show a friendly message instead of the quiz
  if (!quiz.isOpen) {
    return (
      <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center p-6">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
        <div className="relative z-10 w-full max-w-sm text-center space-y-5">
          <div className="flex items-center justify-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
          </div>
          <div className="bg-[#22263380] border border-white/[0.1] rounded-xl p-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.1]">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-50">{quiz.title}</h2>
              <p className="text-sm text-slate-400 mt-2">
                This quiz is currently closed. Please contact your teacher for access.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Strip correctIndex before sending to client — students shouldn't see answers
  const safeQuiz = {
    id: quiz.id,
    title: quiz.title,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions.map(({ id, question, options }) => ({
      id,
      question,
      options,
    })),
  }

  return <QuizPage quiz={safeQuiz} />
}