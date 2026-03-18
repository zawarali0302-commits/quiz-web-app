"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  examId: string
  examName: string
  sectionId?: string
  sectionName?: string
  fullExam?: boolean
}

function getOrCreateStudentId(): string {
  let id = localStorage.getItem("practice_student_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("practice_student_id", id)
  }
  return id
}

export default function StartTestButton({ examId, examName, sectionId, sectionName, fullExam }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStart = () => {
    if (!name.trim()) return
    setLoading(true)
    const studentId = getOrCreateStudentId()
    const params = new URLSearchParams({
      name: name.trim(),
      studentId,
      examId,
      ...(sectionId ? { sectionId } : {}),
      ...(fullExam ? { fullExam: "true" } : {}),
    })
    router.push(`/practice/test?${params.toString()}`)
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-violet-500 hover:bg-violet-600 text-white font-semibold"
      >
        {fullExam ? "Start Full Test" : "Start"}
        <ChevronRight className="w-3.5 h-3.5 ml-1" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#22263380] border border-white/[0.1] backdrop-blur-sm text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {fullExam ? `Full ${examName} Test` : `${examName} — ${sectionName}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your name to begin. Your result will be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                Your Name
              </Label>
              <Input
                placeholder="e.g. Ali Hassan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-violet-500/40"
              />
            </div>
            <Button
              onClick={handleStart}
              disabled={!name.trim() || loading}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold h-11"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting…</>
                : "Begin Test"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}