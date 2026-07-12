"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  AlertTriangle,
  Download,
  Loader2,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { showSuccess, showError } from "@/components/ui/toast"

const riskLevels = ["Critical", "High", "Medium", "Low"] as const
type RiskLevel = (typeof riskLevels)[number]

const levelColors: Record<RiskLevel, string> = {
  Critical: "bg-red-100 text-red-800 border-red-300",
  High: "bg-orange-100 text-orange-800 border-orange-300",
  Medium: "bg-amber-100 text-amber-800 border-amber-300",
  Low: "bg-emerald-100 text-emerald-800 border-emerald-300",
}

const apiLevelMap: Record<string, RiskLevel> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

interface Risk {
  id: string
  title: string
  description: string
  level: string
  mitigation: string | null
  surveyId: string
  surveyTitle: string
  identifiedBy: string
  date: string
}

interface Survey {
  id: string
  title: string
  projectName: string
}

export default function RisksPage() {
  const [levelFilter, setLevelFilter] = useState("all")
  const [risks, setRisks] = useState<Risk[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formLevel, setFormLevel] = useState("")
  const [formMitigation, setFormMitigation] = useState("")
  const [formSurveyId, setFormSurveyId] = useState("")

  const fetchSurveys = useCallback(async () => {
    try {
      const res = await fetch("/api/surveys?limit=100")
      const data = await res.json()
      if (data.success) setSurveys(data.data)
    } catch {
      showError("Failed to load surveys")
    }
  }, [])

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: "500" })
      if (levelFilter !== "all") params.set("level", levelFilter.toUpperCase())
      const res = await fetch(`/api/risks?${params}`)
      const data = await res.json()
      if (data.success) {
        setRisks(data.data.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          level: r.level,
          mitigation: r.mitigation,
          surveyId: r.surveyId,
          surveyTitle: r.survey?.title || "",
          identifiedBy: r.identifiedBy ? `${r.identifiedBy.firstName} ${r.identifiedBy.lastName}` : "",
          date: r.createdAt,
        })))
      }
    } catch {
      showError("Failed to load risks")
    } finally {
      setLoading(false)
    }
  }, [levelFilter])

  useEffect(() => { fetchSurveys() }, [fetchSurveys])
  useEffect(() => { fetchRisks() }, [fetchRisks])

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    risks.forEach((r) => {
      const display = apiLevelMap[r.level] || r.level
      if (display in counts) counts[display]++
    })
    return counts
  }, [risks])

  const resetForm = () => {
    setFormTitle("")
    setFormDescription("")
    setFormLevel("")
    setFormMitigation("")
    setFormSurveyId("")
  }

  const handleAddRisk = async () => {
    if (!formTitle || !formDescription || !formSurveyId || !formLevel) {
      showError("Title, description, survey, and level are required")
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          surveyId: formSurveyId,
          level: formLevel.toUpperCase(),
          mitigation: formMitigation || undefined,
          identifiedById: "",
        }),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess("Risk created successfully")
        setShowAddModal(false)
        resetForm()
        fetchRisks()
      } else {
        showError(data.error || "Failed to create risk")
      }
    } catch {
      showError("Failed to create risk")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRisk = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/risks/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        showSuccess("Risk deleted")
        fetchRisks()
      } else {
        showError(data.error || "Failed to delete risk")
      }
    } catch {
      showError("Failed to delete risk")
    } finally {
      setDeletingId(null)
    }
  }

  const matrixColors: Record<string, string> = {
    "5x5": "bg-red-600 text-white",
    "5x4": "bg-red-500 text-white",
    "5x3": "bg-orange-500 text-white",
    "4x5": "bg-red-500 text-white",
    "4x4": "bg-orange-500 text-white",
    "4x3": "bg-amber-500 text-white",
    "3x5": "bg-orange-500 text-white",
    "3x4": "bg-amber-500 text-white",
    "3x3": "bg-amber-400 text-gray-900",
    "2x5": "bg-amber-500 text-white",
    "2x4": "bg-amber-400 text-gray-900",
    "2x3": "bg-yellow-300 text-gray-900",
    "1x5": "bg-amber-400 text-gray-900",
    "1x4": "bg-yellow-300 text-gray-900",
    "1x3": "bg-emerald-400 text-gray-900",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Assessment"
        description="Identify, assess and mitigate project risks"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Risks" },
        ]}
        actions={
          <Button onClick={() => { resetForm(); setShowAddModal(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            New Risk
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Risks"
          value={risks.length}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="default"
        />
        <StatCard
          label="Critical"
          value={levelCounts.Critical}
          icon={<ShieldAlert className="h-6 w-6" />}
          color="danger"
        />
        <StatCard
          label="High"
          value={levelCounts.High}
          icon={<Shield className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          label="Medium"
          value={levelCounts.Medium}
          icon={<ShieldCheck className="h-6 w-6" />}
          color="info"
        />
        <StatCard
          label="Low"
          value={levelCounts.Low}
          icon={<ShieldCheck className="h-6 w-6" />}
          color="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Risk Matrix (5x5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <span className="w-16" />
                <span className="flex-1 text-center">Impact →</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 text-[10px] text-muted-foreground text-right pr-1">↑ Likelihood</span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
                    {i}
                  </span>
                ))}
              </div>
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <div key={likelihood} className="flex items-center gap-1">
                  <span className="w-16 text-[10px] text-muted-foreground text-right pr-1">{likelihood}</span>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const score = likelihood * impact
                    let level = "Low"
                    if (score >= 20) level = "Critical"
                    else if (score >= 12) level = "High"
                    else if (score >= 6) level = "Medium"
                    return (
                      <div
                        key={`${likelihood}-${impact}`}
                        className={cn(
                          "flex-1 aspect-square rounded flex items-center justify-center text-[10px] font-bold cursor-default",
                          matrixColors[`${likelihood}x${impact}`]
                        )}
                        title={`Likelihood: ${likelihood}, Impact: ${impact}, Risk: ${level}`}
                      >
                        {score}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div className="flex items-center gap-3 mt-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600" /> Critical</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Risk Register</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {riskLevels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Survey</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mitigation</TableHead>
                    <TableHead>Identified By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => {
                    const displayLevel = (apiLevelMap[risk.level] || risk.level) as RiskLevel
                    return (
                      <TableRow key={risk.id}>
                        <TableCell>
                          <div className="font-medium">{risk.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{risk.id}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{risk.surveyTitle}</TableCell>
                        <TableCell>
                          <Badge className={cn("border", levelColors[displayLevel] || levelColors.Medium)}>
                            {displayLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px] text-sm text-muted-foreground truncate">
                          {risk.description}
                        </TableCell>
                        <TableCell className="max-w-[250px] text-sm text-muted-foreground truncate">
                          {risk.mitigation || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{risk.identifiedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {risk.date ? new Date(risk.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRisk(risk.id)}
                            disabled={deletingId === risk.id}
                          >
                            {deletingId === risk.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
            {!loading && risks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No risks found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add a new risk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="New Risk Assessment"
        description="Create a new risk entry in the risk register"
        maxWidth="lg"
        onCancel={() => setShowAddModal(false)}
        onConfirm={handleAddRisk}
        confirmLabel={submitting ? "Creating..." : "Create Risk"}
        loading={submitting}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="Risk title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              placeholder="Detailed description of the risk"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Level *</Label>
              <Select value={formLevel} onValueChange={setFormLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Survey *</Label>
              <Select value={formSurveyId} onValueChange={setFormSurveyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select survey" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}{s.projectName ? ` (${s.projectName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mitigation Plan</Label>
            <Textarea
              placeholder="Mitigation measures and action plan"
              rows={3}
              value={formMitigation}
              onChange={(e) => setFormMitigation(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
