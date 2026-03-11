"use client"

import "katex/dist/katex.min.css"
// @ts-ignore: react-katex does not provide TypeScript declarations
import { InlineMath } from "react-katex"
export default function MathText({ text, className }: { text: string; className?: string }) {
  if (!text.includes("$")) return <span className={className}>{text}</span>

  const parts = text.split(/\$(.+?)\$/g)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 0
          ? <span key={i}>{part}</span>
          : (
            <InlineMath
              key={i}
              math={part}
              renderError={() => <span className="text-red-400 text-xs">[invalid math]</span>}
            />
          )
      )}
    </span>
  )
}