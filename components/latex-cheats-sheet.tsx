"use client"

import { useState } from "react"
import { HelpCircle, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import MathText from "@/components/math-text"

const CHEATSHEET = [
  {
    category: "Basics",
    items: [
      { latex: "$x^2$", description: "Superscript / power" },
      { latex: "$x_1$", description: "Subscript" },
      { latex: "$x^2 + y^2$", description: "Combined" },
    ],
  },
  {
    category: "Fractions & Roots",
    items: [
      { latex: "$\\frac{1}{2}$", description: "Fraction" },
      { latex: "$\\sqrt{x}$", description: "Square root" },
      { latex: "$\\sqrt[3]{x}$", description: "Cube root" },
    ],
  },
  {
    category: "Greek Letters",
    items: [
      { latex: "$\\pi$", description: "Pi" },
      { latex: "$\\alpha, \\beta, \\gamma$", description: "Alpha, Beta, Gamma" },
      { latex: "$\\theta$", description: "Theta" },
    ],
  },
  {
    category: "Operators",
    items: [
      { latex: "$\\times$", description: "Multiply" },
      { latex: "$\\div$", description: "Divide" },
      { latex: "$\\pm$", description: "Plus or minus" },
      { latex: "$\\leq, \\geq$", description: "Less/greater or equal" },
      { latex: "$\\neq$", description: "Not equal" },
    ],
  },
  {
    category: "Calculus",
    items: [
      { latex: "$\\int x\\,dx$", description: "Integral" },
      { latex: "$\\sum_{i=1}^{n} i$", description: "Summation" },
      { latex: "$\\lim_{x \\to 0}$", description: "Limit" },
    ],
  },
  {
    category: "Examples",
    items: [
      { latex: "$a^2 + b^2 = c^2$", description: "Pythagorean theorem" },
      { latex: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", description: "Quadratic formula" },
      { latex: "$E = mc^2$", description: "Mass-energy equivalence" },
    ],
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
      title="Copy LaTeX"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function LatexCheatsheet() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 px-2 text-xs text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 gap-1.5 transition-all"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        LaTeX help
      </Button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg max-h-[80vh] bg-[#1e2130] border border-white/[0.12] rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-amber-400">Reference</p>
                <h2 className="text-base font-bold text-slate-50 mt-0.5">LaTeX Cheatsheet</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tip */}
            <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10 shrink-0">
              <p className="text-xs text-amber-400/80">
                Wrap math in <code className="bg-amber-500/15 px-1 py-0.5 rounded text-amber-300 font-mono">$...$</code> — e.g.{" "}
                <code className="bg-amber-500/15 px-1 py-0.5 rounded text-amber-300 font-mono">Solve $x^2 = 4$</code>.
                Plain text outside <code className="bg-amber-500/15 px-1 py-0.5 rounded text-amber-300 font-mono">$</code> renders normally.
              </p>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {CHEATSHEET.map((section, sIndex) => (
                <div key={section.category}>
                  <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-2">
                    {section.category}
                  </p>
                  <div className="space-y-1.5">
                    {section.items.map((item) => (
                      <div
                        key={item.latex}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.05] transition-colors group"
                      >
                        {/* Rendered preview */}
                        <div className="w-40 shrink-0 text-sm text-slate-200">
                          <MathText text={item.latex} />
                        </div>

                        {/* Description */}
                        <p className="flex-1 text-xs text-slate-500">{item.description}</p>

                        {/* Raw LaTeX + copy */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <code className="text-[10px] text-slate-500 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">
                            {item.latex}
                          </code>
                          <CopyButton text={item.latex} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {sIndex < CHEATSHEET.length - 1 && <Separator className="bg-white/[0.05] mt-4" />}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}