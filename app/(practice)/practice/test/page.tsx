import { notFound, redirect } from "next/navigation"
import { getSectionById, getExamById } from "@/prisma/exam.service"
import MockTestPage from "./mock-test-page"

export default async function MockTestServerPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string; sectionId?: string; name?: string; studentId?: string; fullExam?: string }>
}) {
  const { examId, sectionId, name, studentId, fullExam } = await searchParams

  if (!examId || !name || !studentId) redirect("/practice")

  let questions: any[] = []
  let timeLimit = 0
  let testTitle = ""

  if (fullExam === "true") {
    // Full exam — combine all sections
    const exam = await getExamById(examId)
    if (!exam) notFound()
    for (const section of exam.sections) {
      const s = await getSectionById(section.id)
      if (s) { questions.push(...s.questions); timeLimit += s.timeLimit * 60 }
    }
    testTitle = `${exam.name} — Full Test`
  } else if (sectionId) {
    // Single section
    const section = await getSectionById(sectionId)
    if (!section) notFound()
    questions = section.questions
    timeLimit = section.timeLimit * 60
    testTitle = `${section.exam.name} — ${section.name}`
  } else {
    redirect("/practice")
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1d26] flex items-center justify-center">
        <p className="text-slate-400">No questions available for this section yet.</p>
      </div>
    )
  }

  // Strip correctIndex from client
  const clientQuestions = questions.map(({ id, question, options, explanation }) => ({
    id, question, options, explanation,
  }))

  return (
    <MockTestPage
      questions={clientQuestions as any}
      examId={examId}
      sectionId={sectionId}
      timeLimit={timeLimit}
      studentName={name}
      studentId={studentId}
      testTitle={testTitle}
    />
  )
}