"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Plus, Trash2, ChevronLeft, BookOpen, CheckCircle2, Circle, Loader2, Timer, Upload, FileSpreadsheet, AlertCircle, X } from "lucide-react"
import { createQuiz } from "@/app/actions/quiz.actions"
import MathText from "@/components/math-text"
import LatexCheatsheet from "@/components/latex-cheats-sheet"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type Question = {
  id: string
  question: string
  options: string[]
  correctIndex: number | null
}

function createQuestion(): Question {
  return { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correctIndex: null }
}

function parseCSV(text: string): Question[] {
  const lines = text.trim().split("\n").filter(Boolean)
  if (lines.length < 2) throw new Error("File must have a header row and at least one question.")

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
  const qIdx = header.indexOf("question")
  const aIdx = header.indexOf("option_a")
  const bIdx = header.indexOf("option_b")
  const cIdx = header.indexOf("option_c")
  const dIdx = header.indexOf("option_d")
  const correctIdx = header.indexOf("correct")

  if ([qIdx, aIdx, bIdx, correctIdx].includes(-1))
    throw new Error("Missing required columns: question, option_a, option_b, correct")

  return lines.slice(1).map((line, i) => {
    // Handle quoted commas
    const cols: string[] = []
    let current = ""
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === "," && !inQuotes) { cols.push(current.trim()); current = "" }
      else { current += char }
    }
    cols.push(current.trim())

    const question = cols[qIdx]?.replace(/"/g, "") || ""
    const options = [
      cols[aIdx]?.replace(/"/g, "") || "",
      cols[bIdx]?.replace(/"/g, "") || "",
      cIdx !== -1 ? cols[cIdx]?.replace(/"/g, "") || "" : "",
      dIdx !== -1 ? cols[dIdx]?.replace(/"/g, "") || "" : "",
    ].filter(Boolean)

    const correctLetter = (cols[correctIdx] || "").replace(/"/g, "").trim().toUpperCase()
    const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter)

    if (!question) throw new Error(`Row ${i + 2}: question is empty`)
    if (options.length < 2) throw new Error(`Row ${i + 2}: need at least option_a and option_b`)
    if (correctIndex === -1) throw new Error(`Row ${i + 2}: correct must be A, B, C, or D`)
    if (correctIndex >= options.length) throw new Error(`Row ${i + 2}: correct answer references a missing option`)

    return { id: crypto.randomUUID(), question, options, correctIndex }
  })
}

async function parseExcel(file: File): Promise<Question[]> {
  const XLSX = await import("xlsx")
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_csv(sheet)
  return parseCSV(rows)
}

export default function CreateQuizPage() {
  const [tab, setTab] = useState<"build" | "import">("build")
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [timeLimit, setTimeLimit] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([createQuestion()])

  // Import state
  const [importError, setImportError] = useState<string | null>(null)
  const [importedQuestions, setImportedQuestions] = useState<Question[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Build tab helpers ──
  function updateQuestionText(id: string, text: string) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, question: text } : q)))
  }
  function updateOption(id: string, index: number, text: string) {
    setQuestions((qs) =>
      qs.map((q) => q.id === id ? { ...q, options: q.options.map((o, i) => (i === index ? text : o)) } : q)
    )
  }
  function setCorrectIndex(id: string, index: number) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, correctIndex: index } : q)))
  }
  function addOption(id: string) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, options: [...q.options, ""] } : q)))
  }
  function removeOption(id: string, index: number) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q
        const newOptions = q.options.filter((_, i) => i !== index)
        const newCorrect = q.correctIndex === index ? null : q.correctIndex !== null && q.correctIndex > index ? q.correctIndex - 1 : q.correctIndex
        return { ...q, options: newOptions, correctIndex: newCorrect }
      })
    )
  }
  function addQuestion() { setQuestions((qs) => [...qs, createQuestion()]) }
  function removeQuestion(id: string) {
    if (questions.length === 1) return
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  // ── Import tab helpers ──
  async function handleFile(file: File) {
    setImportError(null)
    setImportedQuestions(null)
    try {
      let parsed: Question[]
      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        parsed = parseCSV(text)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        parsed = await parseExcel(file)
      } else {
        throw new Error("Please upload a .csv, .xlsx, or .xls file")
      }
      setImportedQuestions(parsed)
    } catch (err: any) {
      setImportError(err.message)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clearImport() {
    setImportedQuestions(null)
    setImportError(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  // ── Submit ──
  const activeQuestions = tab === "import" && importedQuestions ? importedQuestions : questions
  const isQuestionComplete = (q: Question) =>
    q.question.trim() && q.correctIndex !== null && q.options.length >= 2 && q.options.every((o) => o.trim())
  const completedCount = activeQuestions.filter(isQuestionComplete).length
  const canPublish = title.trim() && activeQuestions.length > 0 && completedCount === activeQuestions.length

  async function handleSubmit() {
    if (!canPublish) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      if (timeLimit) formData.append("timeLimit", timeLimit)
      formData.append(
        "questions",
        JSON.stringify(activeQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex as number,
        })))
      )
      await createQuiz(formData)
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) return
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(196,155,71,0.05)_0%,transparent_60%)]" />

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" asChild
              className="text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] -ml-2 mb-2 h-8 text-xs"
            >
              <Link href="/teacher/dashboard">
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">Educator Portal</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">Create Quiz</h1>
          </div>
          <div className="flex flex-col items-end gap-1 mt-10">
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-semibold text-[11px] tracking-wide">
              {completedCount}/{activeQuestions.length} ready
            </Badge>
            <p className="text-[11px] text-slate-600">questions complete</p>
          </div>
        </div>

        {/* Quiz Details */}
        <Card className="bg-[#22263380] border border-white/[0.1]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-500/15">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-200">Quiz Details</CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-white/[0.08]" />
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Quiz Title</Label>
              <Input
                placeholder="e.g. Chapter 5 — The Water Cycle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                Time Limit <span className="text-slate-600 normal-case tracking-normal font-normal">— optional, in minutes</span>
              </Label>
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="number" min={1} max={180} placeholder="e.g. 30"
                  value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}
                  className="pl-9 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit">
          <button
            onClick={() => setTab("build")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              tab === "build"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Build Manually
          </button>
          <button
            onClick={() => setTab("import")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              tab === "import"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Import File
          </button>
        </div>

        {/* ── BUILD TAB ── */}
        {tab === "build" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">Questions</p>
              <LatexCheatsheet />
            </div>
            <div className="space-y-4">
              {questions.map((q, qIndex) => {
                const complete = isQuestionComplete(q)
                return (
                  <Card key={q.id} className={`bg-[#22263380] border transition-colors ${complete ? "border-amber-500/20" : "border-white/[0.1]"}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${complete ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.06] text-slate-500"}`}>
                            {qIndex + 1}
                          </div>
                          <CardTitle className="text-sm font-semibold text-slate-300">Question {qIndex + 1}</CardTitle>
                          {complete && (
                            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">Ready</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}
                          disabled={questions.length === 1}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <Separator className="bg-white/[0.08]" />
                    <CardContent className="pt-5 space-y-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Question</Label>
                        <Input
                          placeholder="e.g. Solve $x^2 - 4 = 0$ or plain text"
                          value={q.question}
                          onChange={(e) => updateQuestionText(q.id, e.target.value)}
                          className="bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 h-11 focus-visible:ring-amber-500/40 focus-visible:border-amber-500/50"
                        />
                        {q.question.includes("$") && (
                          <div className="px-3 py-2 rounded-md bg-amber-500/5 border border-amber-500/15 text-sm text-slate-300">
                            <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-semibold mr-2">Preview:</span>
                            <MathText text={q.question} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                          Options <span className="text-slate-600 normal-case tracking-normal font-normal">— click circle to mark correct</span>
                        </Label>
                        <div className="space-y-2">
                          {q.options.map((option, oIndex) => {
                            const isCorrect = q.correctIndex === oIndex
                            return (
                              <div key={oIndex} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => setCorrectIndex(q.id, oIndex)} className="shrink-0">
                                    {isCorrect
                                      ? <CheckCircle2 className="w-5 h-5 text-amber-400" />
                                      : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                                    }
                                  </button>
                                  <Input
                                    placeholder={`Option ${oIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                                    className={`flex-1 h-10 text-sm placeholder:text-slate-500 ${
                                      isCorrect
                                        ? "bg-amber-500/10 border-amber-500/30 text-slate-100 focus-visible:ring-amber-500/40"
                                        : "bg-white/[0.06] border-white/[0.12] text-slate-100 focus-visible:ring-amber-500/40"
                                    }`}
                                  />
                                  <Button variant="ghost" size="sm" onClick={() => removeOption(q.id, oIndex)}
                                    disabled={q.options.length <= 2}
                                    className="h-8 w-8 p-0 shrink-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                {option.includes("$") && (
                                  <div className="ml-7 px-2 py-1.5 rounded-md bg-amber-500/5 border border-amber-500/15 text-xs text-slate-300">
                                    <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-semibold mr-1.5">Preview:</span>
                                    <MathText text={option} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {q.options.length < 6 && (
                          <Button variant="ghost" size="sm" onClick={() => addOption(q.id)}
                            className="h-8 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] mt-1"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />Add Option
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <Button variant="outline" onClick={addQuestion}
              className="w-full h-11 border-dashed border-white/[0.15] bg-transparent text-slate-400 hover:text-slate-200 hover:border-amber-500/30 hover:bg-amber-500/5"
            >
              <Plus className="w-4 h-4 mr-2" />Add Question
            </Button>
          </>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === "import" && (
          <div className="space-y-4">

            {/* Format hint */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <FileSpreadsheet className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-400">Expected format</p>
                <p className="text-xs text-slate-400">
                  Columns: <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">question</code>,{" "}
                  <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_a</code>,{" "}
                  <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_b</code>,{" "}
                  <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_c</code>{" "}(optional),{" "}
                  <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_d</code>{" "}(optional),{" "}
                  <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">correct</code>{" "}(A/B/C/D)
                </p>
              </div>
            </div>

            {/* Drop zone */}
            {!importedQuestions && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-amber-500/60 bg-amber-500/8"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                <div className="p-3 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Drop your file here or click to browse</p>
                  <p className="text-xs text-slate-500 mt-0.5">.csv, .xlsx, .xls supported</p>
                </div>
              </div>
            )}

            {/* Error */}
            {importError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300">{importError}</p>
              </div>
            )}

            {/* Preview */}
            {importedQuestions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-slate-200">
                      {importedQuestions.length} questions imported
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearImport}
                    className="h-7 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />Clear
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {importedQuestions.map((q, i) => (
                    <div key={q.id} className="px-4 py-3 rounded-lg bg-[#22263380] border border-white/[0.08]">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                          {i + 1}
                        </span>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <p className="text-sm text-slate-200 font-medium">{q.question}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {q.options.map((opt, oi) => (
                              <span key={oi} className={`text-xs px-2 py-0.5 rounded-md border ${
                                oi === q.correctIndex
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : "bg-white/[0.04] border-white/[0.08] text-slate-400"
                              }`}>
                                {["A","B","C","D"][oi]}. {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator className="bg-white/[0.08]" />

        {/* Submit */}
        <div className="flex items-center justify-between pb-8">
          <p className="text-xs text-slate-600">
            {canPublish
              ? "✓ All questions are ready"
              : `${activeQuestions.length - completedCount} question${activeQuestions.length - completedCount !== 1 ? "s" : ""} still incomplete`
            }
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canPublish}
            className="h-11 px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
              : <><CheckCircle2 className="w-4 h-4 mr-2" />Publish Quiz</>
            }
          </Button>
        </div>

      </div>
    </div>
  )
}