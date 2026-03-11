"use client"

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
  const { signOut } = useClerk()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ redirectUrl: "/teacher/login" })}
      className="h-9 px-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs"
    >
      <LogOut className="w-3.5 h-3.5 mr-1.5" />
      Sign Out
    </Button>
  )
}