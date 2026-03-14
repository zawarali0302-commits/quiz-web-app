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
import { deleteTeacherAction } from "@/app/actions/teacher.actions"

export default function DeleteTeacherButton({
  teacherId,
  teacherName,
}: {
  teacherId: string
  teacherName: string
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteTeacherAction(teacherId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 bg-transparent"
        >
          <Trash2 className="w-3 h-3 mr-1.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#22263380] border border-white/[0.1] backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-100">Delete Teacher</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This will permanently delete <span className="text-slate-200 font-medium">{teacherName}</span> and
            all their quizzes, questions, and student submissions. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:bg-white/[0.07]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Delete Teacher
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}