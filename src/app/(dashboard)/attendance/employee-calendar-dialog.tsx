"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CalendarDay {
  date: string
  status: "present" | "absent" | "holiday" | "future" | "before-join"
  markedAt: string | null
  distanceMeters: number | null
  holidayName: string | null
}

interface CalendarData {
  userId: string
  employeeName: string
  month: string
  days: CalendarDay[]
  summary: { present: number; absent: number; holidays: number; total: number }
}

interface EmployeeCalendarDialogProps {
  userId: string | null
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })
}

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(year, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

const CELL_CLASS: Record<CalendarDay["status"], string> = {
  present: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  absent: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
  holiday: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",
  future: "border-transparent text-muted-foreground/30",
  "before-join": "border-transparent text-muted-foreground/20",
}

export function EmployeeCalendarDialog({ userId, employeeName, open, onOpenChange }: EmployeeCalendarDialogProps) {
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCalendar = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance?scope=calendar&userId=${userId}&month=${month}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoading(false)
    }
  }, [userId, month])

  useEffect(() => {
    if (open && userId) fetchCalendar()
  }, [open, userId, fetchCalendar])

  // Reset to the current month each time a different employee is opened.
  useEffect(() => {
    if (open) setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, open])

  const leadingBlanks = data ? new Date(`${data.days[0].date}T00:00:00.000Z`).getUTCDay() : 0
  const attendanceRate = data && data.summary.present + data.summary.absent > 0
    ? Math.round((data.summary.present / (data.summary.present + data.summary.absent)) * 100)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{employeeName}</DialogTitle>
          <DialogDescription>Monthly attendance calendar</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{monthLabel(month)}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" />{data.summary.present} Present</span>
              <span className="flex items-center gap-1 text-red-700 dark:text-red-400"><XCircle className="h-3 w-3" />{data.summary.absent} Absent</span>
              <span>{data.summary.holidays} Holiday{data.summary.holidays === 1 ? "" : "s"}</span>
              {attendanceRate !== null && <span className="font-medium text-foreground">{attendanceRate}% attendance</span>}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
              ))}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {data.days.map((day) => (
                <div
                  key={day.date}
                  title={day.holidayName || undefined}
                  className={cn("aspect-square rounded-md border flex flex-col items-center justify-center gap-0.5 text-xs", CELL_CLASS[day.status])}
                >
                  <span className="font-medium">{Number(day.date.slice(8, 10))}</span>
                  {day.status === "present" && <CheckCircle2 className="h-3 w-3" />}
                  {day.status === "absent" && <XCircle className="h-3 w-3" />}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t pt-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />Present</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/30 border border-red-500/50" />Absent</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-slate-500/30 border border-slate-500/50" />Holiday</span>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Could not load this employee&apos;s calendar</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
