"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CopyCodeButton({ quizId }: { quizId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(quizId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-8 text-xs border transition-all ${
        copied
          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
          : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
      }`}
    >
      {copied ? (
        <><Check className="w-3 h-3 mr-1.5" />Copied!</>
      ) : (
        <><Copy className="w-3 h-3 mr-1.5" />Copy Code</>
      )}
    </Button>
  )
}