"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteQuiz } from "@/app/actions/quiz.actions"

export default function DeleteQuizButton({ quizId, quizTitle }: { quizId: string; quizTitle: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    await deleteQuiz(quizId)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-[#1e2230] border border-white/[0.1] shadow-2xl shadow-black/40">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-50 font-semibold">
            Delete Quiz
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 text-sm">
            Are you sure you want to delete{" "}
            <span className="text-slate-200 font-medium">"{quizTitle}"</span>?
            This will permanently remove the quiz and all its submissions.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-transparent border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 hover:border-white/20 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 transition-all shadow-none"
          >
            {isLoading
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Deleting…</>
              : <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete Quiz</>
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}