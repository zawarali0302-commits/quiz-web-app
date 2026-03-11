"use client"

import { useState } from "react"
import { toggleQuiz } from "@/app/actions/quiz.actions"
import { Loader2 } from "lucide-react"

export default function QuizToggleButton({ quizId, isOpen }: { quizId: string; isOpen: boolean }) {
  const [open, setOpen] = useState(isOpen)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const next = !open
      setOpen(next) // optimistic update
      await toggleQuiz(quizId, next)
    } catch {
      setOpen(open) // revert on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none disabled:opacity-60 ${
        open ? "bg-emerald-500" : "bg-white/[0.12]"
      }`}
      title={open ? "Click to close quiz" : "Click to open quiz"}
    >
      {loading ? (
        <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white" />
      ) : (
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform ${
            open ? "translate-x-[18px]" : "translate-x-[2px]"
          }`}
        />
      )}
    </button>
  )
}