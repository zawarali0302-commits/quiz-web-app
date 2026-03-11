import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#1a1d26] text-slate-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 bg-white/[0.06]" />
            <Skeleton className="h-10 w-64 bg-white/[0.06]" />
            <Skeleton className="h-3 w-44 bg-white/[0.04]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 bg-white/[0.06] rounded-md" />
            <Skeleton className="h-10 w-32 bg-white/[0.06] rounded-md" />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-[#22263380] border border-white/[0.07]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-3 w-24 bg-white/[0.06]" />
                <Skeleton className="h-7 w-7 rounded-md bg-white/[0.06]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16 bg-white/[0.06] mb-2" />
                <Skeleton className="h-3 w-28 bg-white/[0.04]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Table Card ── */}
        <Card className="bg-[#22263380] border border-white/[0.07] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 bg-white/[0.06]" />
              <Skeleton className="h-3 w-48 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-white/[0.06]" />
          </CardHeader>

          <Separator className="bg-white/[0.06]" />

          <CardContent className="p-0">
            {/* Table header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.06]">
              <Skeleton className="h-3 w-32 bg-white/[0.05]" />
              <Skeleton className="h-3 w-20 bg-white/[0.05]" />
              <Skeleton className="h-3 w-20 bg-white/[0.05]" />
              <Skeleton className="h-3 w-24 bg-white/[0.05] ml-auto" />
            </div>

            {/* Table rows */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0">
                <Skeleton className="h-4 w-40 bg-white/[0.06]" />
                <Skeleton className="h-6 w-14 rounded-full bg-white/[0.05]" />
                <Skeleton className="h-6 w-14 rounded-full bg-white/[0.05]" />
                <div className="flex items-center gap-2 ml-auto">
                  <Skeleton className="h-8 w-20 rounded-md bg-white/[0.05]" />
                  <Skeleton className="h-8 w-20 rounded-md bg-white/[0.05]" />
                  <Skeleton className="h-8 w-24 rounded-md bg-white/[0.05]" />
                  <Skeleton className="h-8 w-8 rounded-md bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}