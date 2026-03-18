"use client"

import { useState, useRef } from "react"
import { Users, BookOpen, Plus, Trash2, Upload, FileSpreadsheet, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, X, Clock, FileQuestion } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import DeleteTeacherButton from "@/components/delete-teacher-button"
import {
  createExamAction, deleteExamAction,
  createSectionAction, deleteSectionAction,
  importQuestionsAction,
  importExamAction,
} from "@/app/actions/exam.actions"

type Teacher = { id: string; name: string; email: string }
type Section = { id: string; name: string; timeLimit: number; _count?: { questions: number } }
type Exam = { id: string; name: string; sections: Section[] }

function parseCSV(text: string) {
  const lines = text.trim().split("\n").filter(Boolean)
  if (lines.length < 2) throw new Error("File must have a header row and at least one question.")
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
  const qIdx = header.indexOf("question")
  const aIdx = header.indexOf("option_a")
  const bIdx = header.indexOf("option_b")
  const cIdx = header.indexOf("option_c")
  const dIdx = header.indexOf("option_d")
  const correctIdx = header.indexOf("correct")
  const expIdx = header.indexOf("explanation")
  if ([qIdx, aIdx, bIdx, correctIdx].includes(-1))
    throw new Error("Missing required columns: question, option_a, option_b, correct")
  return lines.slice(1).map((line, i) => {
    const cols: string[] = []
    let current = ""; let inQuotes = false
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
    const explanation = expIdx !== -1 ? cols[expIdx]?.replace(/"/g, "") || undefined : undefined
    if (!question) throw new Error(`Row ${i + 2}: question is empty`)
    if (options.length < 2) throw new Error(`Row ${i + 2}: need at least option_a and option_b`)
    if (correctIndex === -1) throw new Error(`Row ${i + 2}: correct must be A, B, C, or D`)
    return { question, options, correctIndex, explanation }
  })
}

async function parseExcel(file: File) {
  const XLSX = await import("xlsx")
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  // Combine all sheets
  const allRows: string[] = []
  workbook.SheetNames.forEach((sheetName, idx) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
    const lines = csv.trim().split("\n").filter(Boolean)
    if (idx === 0) allRows.push(...lines)
    else allRows.push(...lines.slice(1))
  })
  return parseCSV(allRows.join("\n"))
}

function parseExamFile(text: string) {
  const lines = text.trim().split("\n").filter(Boolean)
  if (lines.length < 2) throw new Error("File must have a header row and at least one row.")
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))

  const examIdx = header.indexOf("exam")
  const sectionIdx = header.indexOf("section")
  const timeLimitIdx = header.indexOf("time_limit")
  const qIdx = header.indexOf("question")
  const aIdx = header.indexOf("option_a")
  const bIdx = header.indexOf("option_b")
  const cIdx = header.indexOf("option_c")
  const dIdx = header.indexOf("option_d")
  const correctIdx = header.indexOf("correct")
  const expIdx = header.indexOf("explanation")

  if ([examIdx, sectionIdx, timeLimitIdx, qIdx, aIdx, bIdx, correctIdx].includes(-1))
    throw new Error("Missing required columns: exam, section, time_limit, question, option_a, option_b, correct")

  return lines.slice(1).map((line, i) => {
    const cols: string[] = []
    let current = ""; let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if (char === "," && !inQuotes) { cols.push(current.trim()); current = "" }
      else { current += char }
    }
    cols.push(current.trim())

    const clean = (idx: number) => cols[idx]?.replace(/"/g, "").trim() || ""
    const exam = clean(examIdx).toUpperCase()
    const section = clean(sectionIdx)
    const timeLimit = parseInt(clean(timeLimitIdx)) || 45
    const question = clean(qIdx)
    const options = [clean(aIdx), clean(bIdx), cIdx !== -1 ? clean(cIdx) : "", dIdx !== -1 ? clean(dIdx) : ""].filter(Boolean)
    const correctLetter = clean(correctIdx).toUpperCase()
    const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter)
    const explanation = expIdx !== -1 ? clean(expIdx) || undefined : undefined

    if (!exam) throw new Error(`Row ${i + 2}: exam is empty`)
    if (!section) throw new Error(`Row ${i + 2}: section is empty`)
    if (!question) throw new Error(`Row ${i + 2}: question is empty`)
    if (options.length < 2) throw new Error(`Row ${i + 2}: need at least option_a and option_b`)
    if (correctIndex === -1) throw new Error(`Row ${i + 2}: correct must be A, B, C, or D`)

    return { exam, section, timeLimit, question, options, correctIndex, explanation }
  })
}

// ── Section row with import ──
function SectionRow({ section, examId }: { section: Section; examId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setImportError(null)
    setImportSuccess(null)
    setImporting(true)
    try {
      let questions
      if (file.name.endsWith(".csv")) {
        questions = parseCSV(await file.text())
      } else {
        questions = await parseExcel(file)
      }
      await importQuestionsAction(section.id, questions)
      setImportSuccess(`${questions.length} questions imported successfully`)
      if (fileRef.current) fileRef.current.value = ""
    } catch (err: any) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteSectionAction(section.id)
  }

  return (
    <div className="border border-white/[0.07] rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-violet-500/10">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">{section.name}</span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />{section.timeLimit}m
          </span>
          <Badge variant="outline" className="border-white/[0.1] text-slate-400 text-[10px]">
            <FileQuestion className="w-2.5 h-2.5 mr-1" />
            {section._count?.questions ?? 0} questions
          </Badge>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#22263380] border border-white/[0.1] backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100">Delete Section</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This will delete <span className="text-slate-200 font-medium">{section.name}</span> and all its questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/[0.15] bg-transparent text-slate-300 hover:bg-white/[0.07]">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-3 bg-white/[0.01] border-t border-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Import Questions
          </p>

          <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">
              Columns: <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">question</code>,{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_a</code>,{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_b</code>,{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_c</code>,{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_d</code>,{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">correct</code> (A/B/C/D),{" "}
              <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">explanation</code> (optional)
            </p>
          </div>

          {importError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{importError}</p>
            </div>
          )}

          {importSuccess && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-300">{importSuccess}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold h-8 text-xs"
            >
              {importing
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Importing…</>
                : <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload File</>
              }
            </Button>
            <p className="text-[11px] text-slate-600">.csv, .xlsx, .xls — replaces existing questions</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Exam card ──
function ExamCard({ exam }: { exam: Exam }) {
  const [addingSection, setAddingSection] = useState(false)
  const [sectionName, setSectionName] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleAddSection() {
    if (!sectionName.trim() || !timeLimit) return
    setSaving(true)
    await createSectionAction(exam.id, sectionName.trim(), parseInt(timeLimit))
    setSectionName(""); setTimeLimit(""); setAddingSection(false); setSaving(false)
  }

  async function handleDeleteExam() {
    setDeleting(true)
    await deleteExamAction(exam.id)
  }

  return (
    <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-violet-500/15">
            <BookOpen className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100">{exam.name}</CardTitle>
            <CardDescription className="text-slate-500 text-xs mt-0.5">
              {exam.sections.length} section{exam.sections.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm" variant="outline"
            onClick={() => setAddingSection((v) => !v)}
            className="h-8 text-xs border-white/[0.15] bg-transparent text-slate-300 hover:text-slate-100 hover:bg-white/[0.07]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Section
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#22263380] border border-white/[0.1] backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-100">Delete Exam</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This will delete <span className="text-slate-200 font-medium">{exam.name}</span> and all its sections, questions, and mock test results.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/[0.15] bg-transparent text-slate-300 hover:bg-white/[0.07]">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteExam} className="bg-red-500 hover:bg-red-600 text-white font-semibold">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Exam"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <Separator className="bg-white/[0.08]" />

      <CardContent className="p-4 space-y-3">

        {/* Add section form */}
        {addingSection && (
          <div className="flex items-end gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Section Name</Label>
              <Input
                placeholder="e.g. Math"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="h-9 text-sm bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500/40"
              />
            </div>
            <div className="w-28 space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Time (min)</Label>
              <Input
                type="number" min={1} placeholder="e.g. 45"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="h-9 text-sm bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500/40"
              />
            </div>
            <Button size="sm" onClick={handleAddSection} disabled={saving || !sectionName.trim() || !timeLimit}
              className="h-9 bg-violet-500 hover:bg-violet-600 text-white font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingSection(false)}
              className="h-9 w-9 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Sections list */}
        {exam.sections.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No sections yet — add one above.</p>
        ) : (
          <div className="space-y-2">
            {exam.sections.map((section) => (
              <SectionRow key={section.id} section={section} examId={exam.id} />
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  )
}

// ── Import Exam Button ──
function ImportExamButton() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null); setSuccess(null); setImporting(true)
    try {
      let text: string
      if (file.name.endsWith(".csv")) {
        text = await file.text()
      } else {
        const XLSX = await import("xlsx")
        const buffer = await file.arrayBuffer()
        const wb = XLSX.read(buffer, { type: "array" })
        // Combine all sheets into one CSV
        const allRows: string[] = []
        wb.SheetNames.forEach((sheetName, idx) => {
          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName])
          const lines = csv.trim().split("\n").filter(Boolean)
          if (idx === 0) {
            allRows.push(...lines) // include header from first sheet
          } else {
            allRows.push(...lines.slice(1)) // skip header from subsequent sheets
          }
        })
        text = allRows.join("\n")
      }
      const rows = parseExamFile(text)
      await importExamAction(rows)
      const examCount = new Set(rows.map(r => r.exam)).size
      const qCount = rows.length
      setSuccess(`Imported ${qCount} questions across ${examCount} exam(s)`)
      if (fileRef.current) fileRef.current.value = ""
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-slate-200">Import Exam from File</p>
          <p className="text-xs text-slate-500">Upload a spreadsheet to create exams, sections and questions at once</p>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={importing}
          className="bg-violet-500 hover:bg-violet-600 text-white font-semibold h-8 text-xs shrink-0 ml-4"
        >
          {importing
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Importing…</>
            : <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload File</>
          }
        </Button>
      </div>

      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
        <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400">
          Columns: <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">exam</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">section</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">time_limit</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">question</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_a</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_b</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_c</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">option_d</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">correct</code>,{" "}
          <code className="text-amber-300/80 bg-amber-500/10 px-1 rounded">explanation</code>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-300">{success}</p>
        </div>
      )}
    </div>
  )
}

// ── Main tabs ──
export default function AdminTabs({ teachers, exams }: { teachers: Teacher[]; exams: Exam[] }) {
  const [tab, setTab] = useState<"teachers" | "bank">("teachers")
  const [examName, setExamName] = useState("")
  const [creatingExam, setCreatingExam] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)

  async function handleCreateExam() {
    if (!examName.trim()) return
    setCreatingExam(true)
    await createExamAction(examName.trim().toUpperCase())
    setExamName(""); setShowExamForm(false); setCreatingExam(false)
  }

  return (
    <div className="space-y-6">

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] w-fit">
        <button
          onClick={() => setTab("teachers")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            tab === "teachers" ? "bg-red-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Teachers
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            tab === "bank" ? "bg-violet-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Question Bank
        </button>
      </div>

      {/* ── TEACHERS TAB ── */}
      {tab === "teachers" && (
        <Card className="bg-[#22263380] border border-white/[0.1] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">All Teachers</CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-0.5">
                All registered educators on the platform
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
              {teachers.length} total
            </Badge>
          </CardHeader>
          <Separator className="bg-white/[0.08]" />
          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No teachers yet</p>
                <p className="text-slate-600 text-xs">Teachers will appear here once they sign up.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.08]">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="border-white/[0.06]">
                      <TableCell className="pl-6 py-4 font-semibold text-slate-100">{teacher.name}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{teacher.email}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <DeleteTeacherButton teacherId={teacher.id} teacherName={teacher.name} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── QUESTION BANK TAB ── */}
      {tab === "bank" && (
        <div className="space-y-4">
          <ImportExamButton />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Question Bank</p>
              <p className="text-xs text-slate-500 mt-0.5">Manage exams, sections and upload questions</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowExamForm((v) => !v)}
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Exam
            </Button>
          </div>

          {/* Create exam form */}
          {showExamForm && (
            <div className="flex items-end gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exam Name</Label>
                <Input
                  placeholder="e.g. SAT, MDCAT, GRE"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateExam()}
                  className="h-10 bg-white/[0.06] border-white/[0.12] text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500/40"
                />
              </div>
              <Button onClick={handleCreateExam} disabled={creatingExam || !examName.trim()}
                className="h-10 bg-violet-500 hover:bg-violet-600 text-white font-semibold"
              >
                {creatingExam ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => setShowExamForm(false)}
                className="h-10 w-10 p-0 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="p-4 rounded-full bg-white/[0.05] border border-white/[0.08]">
                <BookOpen className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No exams yet</p>
              <p className="text-slate-600 text-xs">Create your first exam above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}