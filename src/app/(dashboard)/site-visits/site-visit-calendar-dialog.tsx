"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react"

import { cn, formatDate, formatDateTime } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PhotoViewDialog } from "@/components/shared/photo-view-dialog"

type DayStatus = "not-eligible" | "holiday" | "future" | "visited" | "in-progress" | "expired" | "pending" | "missed"

interface CalendarDay {
  date: string
  status: DayStatus
  checkedInAt: string | null
  checkedOutAt: string | null
  checkInPhotoUrl: string | null
  checkOutPhotoUrl: string | null
  workSummary: string | null
  holidayName: string | null
}

interface CalendarData {
  projectId: string
  projectName: string
  projectCode: string
  engineerName: string
  windowStart: string
  windowEnd: string
  month: string
  days: CalendarDay[]
  summary: { visited: number; missed: number; expired: number; holidays: number; total: number }
}

interface SiteVisitCalendarDialogProps {
  projectId: string | null
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const CLICKABLE: DayStatus[] = ["visited", "in-progress", "expired"]

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })
}

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(year, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

// Every eligible date (within the project's start-end window) gets a darker
// base tint regardless of status, so the working window stands out from the
// rest of the month at a glance - status colors layer on top of that.
const CELL_CLASS: Record<DayStatus, string> = {
  visited: "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  "in-progress": "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400",
  expired: "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400",
  missed: "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400",
  pending: "bg-slate-500/15 border-slate-500/40 text-foreground",
  future: "bg-slate-500/15 border-slate-500/40 text-muted-foreground",
  holiday: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",
  "not-eligible": "border-transparent text-muted-foreground/40",
}

export function SiteVisitCalendarDialog({ projectId, projectName, open, onOpenChange }: SiteVisitCalendarDialogProps) {
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewDay, setViewDay] = useState<CalendarDay | null>(null)

  const fetchCalendar = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/site-visits/calendar?month=${month}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      // keep whatever was already loaded
    } finally {
      setLoading(false)
    }
  }, [projectId, month])

  useEffect(() => {
    if (open && projectId) fetchCalendar()
  }, [open, projectId, fetchCalendar])

  useEffect(() => {
    if (open) setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, open])

  const leadingBlanks = data ? new Date(`${data.days[0].date}T00:00:00.000Z`).getUTCDay() : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{data?.projectName ?? projectName}</DialogTitle>
          <DialogDescription>
            {data ? `${data.engineerName} · site visits from ${formatDate(data.windowStart)} to ${formatDate(data.windowEnd)}` : "Monthly site-visit calendar"}
          </DialogDescription>
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
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" />{data.summary.visited} Visited</span>
              <span className="flex items-center gap-1 text-red-700 dark:text-red-400"><XCircle className="h-3 w-3" />{data.summary.missed} Missed</span>
              {data.summary.expired > 0 && (
                <span className="flex items-center gap-1 text-red-700 dark:text-red-400"><AlertTriangle className="h-3 w-3" />{data.summary.expired} No Checkout</span>
              )}
              <span>{data.summary.holidays} Holiday{data.summary.holidays === 1 ? "" : "s"}</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
              ))}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {data.days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  disabled={!CLICKABLE.includes(day.status)}
                  onClick={() => setViewDay(day)}
                  title={day.holidayName || undefined}
                  className={cn(
                    "aspect-square rounded-md border flex flex-col items-center justify-center gap-0.5 text-xs",
                    CLICKABLE.includes(day.status) && "cursor-pointer hover:opacity-75",
                    CELL_CLASS[day.status]
                  )}
                >
                  <span className="font-medium">{Number(day.date.slice(8, 10))}</span>
                  {day.status === "visited" && <CheckCircle2 className="h-3 w-3" />}
                  {day.status === "missed" && <XCircle className="h-3 w-3" />}
                  {day.status === "expired" && <AlertTriangle className="h-3 w-3" />}
                  {day.status === "in-progress" && <Clock className="h-3 w-3" />}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t pt-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />Visited</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/30 border border-red-500/50" />Missed / No Checkout</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/30 border border-amber-500/50" />In Progress</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-slate-500/20 border border-slate-500/40" />Holiday / Not Yet Due</span>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Could not load this project&apos;s calendar</p>
        )}
      </DialogContent>

      <PhotoViewDialog
        photoUrl={viewDay?.checkInPhotoUrl ?? null}
        title={viewDay ? formatDate(viewDay.date) : ""}
        subtitle={
          viewDay
            ? [
                viewDay.checkedInAt ? `In: ${formatDateTime(viewDay.checkedInAt)}` : null,
                viewDay.checkedOutAt ? `Out: ${formatDateTime(viewDay.checkedOutAt)}` : viewDay.status === "expired" ? "No checkout (expired at midnight)" : null,
                viewDay.workSummary,
              ].filter(Boolean).join(" · ")
            : undefined
        }
        open={!!viewDay}
        onOpenChange={(open) => { if (!open) setViewDay(null) }}
      />
    </Dialog>
  )
}
