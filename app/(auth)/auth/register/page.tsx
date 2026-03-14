import { SignUp } from "@clerk/nextjs"
import { GraduationCap } from "lucide-react"

const page = () => {
  return (
     <div className="min-h-screen bg-[#1a1d26] flex">

      {/* Top amber bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent z-10" />

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14">

        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d26] via-[#1e2130] to-[#161820]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_80%,rgba(196,155,71,0.1)_0%,transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-amber-500/8 blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-300 tracking-wide">EduQuiz</span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <div className="w-10 h-[2px] bg-amber-500/70" />
          <blockquote className="text-2xl font-semibold text-slate-100 leading-snug tracking-tight">
            "Education is not the filling of a pail, but the lighting of a fire."
          </blockquote>
          <p className="text-sm text-slate-500">— W.B. Yeats</p>
        </div>

        {/* Dot grid */}
        <div className="relative z-10">
          <div
            className="w-40 h-24 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          />
        </div>
      </div>

      {/* ── Right panel — Clerk SignUp ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6 p-6 relative bg-[#1c1f2b]">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="p-1.5 rounded-md bg-amber-500/15 border border-amber-500/25">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-300">EduQuiz</span>
        </div>

        <div className="w-full flex flex-col items-center gap-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-400">
            Educator Portal
          </p>
          <p className="text-slate-500 text-sm">Create your teacher account</p>
        </div>

        <SignUp
          signInUrl="/auth/login"
          appearance={{
            variables: {
              colorPrimary: "#f59e0b",
              colorBackground: "#1e2230",
              colorInputBackground: "rgba(255,255,255,0.06)",
              colorInputText: "#f1f5f9",
              colorText: "#f1f5f9",
              colorTextSecondary: "#94a3b8",
              colorNeutral: "#94a3b8",
              borderRadius: "0.5rem",
              fontFamily: "inherit",
            },
            elements: {
              card: { backgroundColor: "#1e2230", boxShadow: "0 25px 50px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" },
              headerTitle: { display: "none" },
              headerSubtitle: { display: "none" },
              socialButtonsBlockButton: { border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)", color: "#cbd5e1" },
              dividerLine: { backgroundColor: "rgba(255,255,255,0.08)" },
              dividerText: { color: "#475569", fontSize: "11px" },
              formFieldLabel: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" },
              formFieldInput: { backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", height: "44px" },
              formButtonPrimary: { backgroundColor: "#f59e0b", color: "#0f172a", fontWeight: "600" },
              footerActionLink: { color: "#fbbf24" },
              footerActionText: { color: "#cbd5e1" },
              footer: { color: "#cbd5e1" },
              footerPages: { color: "#cbd5e1" },
              identityPreviewText: { color: "#cbd5e1" },
              identityPreviewEditButton: { color: "#fbbf24" },
            },
          }}
        />

      </div>
    </div>
  )
}

export default page
