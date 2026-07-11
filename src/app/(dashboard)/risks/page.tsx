"use client"

import { useState, useMemo } from "react"
import {
  AlertTriangle,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const riskLevels = ["Critical", "High", "Medium", "Low"] as const
type RiskLevel = (typeof riskLevels)[number]

const levelColors: Record<RiskLevel, string> = {
  Critical: "bg-red-100 text-red-800 border-red-300",
  High: "bg-orange-100 text-orange-800 border-orange-300",
  Medium: "bg-amber-100 text-amber-800 border-amber-300",
  Low: "bg-emerald-100 text-emerald-800 border-emerald-300",
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

const mockRisks = [
  {
    id: "RSK-001",
    title: "Structural Crack in Foundation Wall",
    survey: "SRY-2024-003",
    project: "Worli Sky Residences Tower A",
    level: "Critical" as RiskLevel,
    description: "Horizontal crack observed in foundation retaining wall, 3mm width on 12th floor basement. Possible settlement issue requiring immediate structural engineer review.",
    mitigation: "Deploy structural engineer for detailed inspection. Install crack monitors. Restrict load on affected area. Prepare contingency for underpinning.",
    identifiedBy: "Rajesh Kumar",
    date: "2024-11-15",
    status: "Open",
  },
  {
    id: "RSK-002",
    title: "Exposed Electrical Wiring in Service Corridor",
    survey: "SRY-2024-001",
    project: "BKC Commercial Hub Phase 1",
    level: "Critical" as RiskLevel,
    description: "Live electrical cables found without proper conduit protection in B2 level service corridor. Risk of electrocution for site workers.",
    mitigation: "Isolate affected circuits immediately. Install temporary conduit protection. Schedule permanent rewiring within 48 hours. Post warning signage.",
    identifiedBy: "Amit Deshmukh",
    date: "2024-11-10",
    status: "In Progress",
  },
  {
    id: "RSK-003",
    title: "Water Leakage from Overhead Tank",
    survey: "SRY-2024-005",
    project: "Prestige Lake Ridge Villas",
    level: "High" as RiskLevel,
    description: "Continuous water seepage detected from rooftop overhead tank through expansion joint. Affecting 3 floors below. Damage to electrical panels observed.",
    mitigation: "Apply emergency waterproof sealant. Drain overhead tank for repair. Install temporary drainage. Schedule permanent waterproofing repair.",
    identifiedBy: "Neha Kulkarni",
    date: "2024-11-12",
    status: "Open",
  },
  {
    id: "RSK-004",
    title: "Soil Settlement near Excavation Zone",
    survey: "SRY-2024-008",
    project: "Delhi-Meerut Expressway Section 3",
    level: "High" as RiskLevel,
    description: "Uneven soil settlement observed near main excavation zone. Differential settlement of 15mm detected over 50m stretch. Risk to adjacent structures.",
    mitigation: "Install settlement monitoring points. Reduce excavation depth temporarily. Engage geotechnical consultant. Prepare soil improvement plan.",
    identifiedBy: "Ravi Shankar",
    date: "2024-11-08",
    status: "In Progress",
  },
  {
    id: "RSK-005",
    title: "Non-Compliance with Fire Safety Norms",
    survey: "SRY-2024-002",
    project: "Godrej Platinum Towers",
    level: "Critical" as RiskLevel,
    description: "Fire escape stairwell width found non-compliant with NBC 2016 requirements. Emergency evacuation route compromised for 32-floor tower.",
    mitigation: "Halt interior finishing on affected floors. Engage fire safety consultant. Submit revised drawings to fire department. Plan structural modification.",
    identifiedBy: "Sanjay Kulkarni",
    date: "2024-11-18",
    status: "Open",
  },
  {
    id: "RSK-006",
    title: "Contaminated Soil near Boundary Wall",
    survey: "SRY-2024-007",
    project: "Adani Ahmedabad Airport Expansion",
    level: "Medium" as RiskLevel,
    description: "Soil samples show elevated hydrocarbon levels near north boundary wall. Possible contamination from adjacent industrial zone. Environmental clearance at risk.",
    mitigation: "Conduct detailed environmental assessment. Install soil vapor barriers. Notify Gujarat Pollution Control Board. Prepare remediation plan.",
    identifiedBy: "Vikram Desai",
    date: "2024-11-05",
    status: "In Progress",
  },
  {
    id: "RSK-007",
    title: "Inadequate Scaffolding Safety",
    survey: "SRY-2024-010",
    project: "Oberoi Three Sixty West",
    level: "High" as RiskLevel,
    description: "Scaffolding at east facade missing toe boards and guardrails at multiple levels. Fall hazard for workers at heights above 15m.",
    mitigation: "Immediate scaffolding audit by safety officer. Install missing guardrails and toe boards. Conduct worker safety briefing. Daily inspection protocol.",
    identifiedBy: "Meera Rao",
    date: "2024-11-14",
    status: "Open",
  },
  {
    id: "RSK-008",
    title: "Storm Water Drainage Blockage",
    survey: "SRY-2024-006",
    project: "Brigade Gateway Commercial Tower",
    level: "Medium" as RiskLevel,
    description: "Primary storm water drainage line blocked by construction debris. Risk of waterlogging during monsoon season affecting basement levels.",
    mitigation: "Clear drainage line immediately. Install debris screens. Schedule periodic drainage maintenance. Prepare pump standby for emergency.",
    identifiedBy: "Arjun Reddy",
    date: "2024-11-01",
    status: "Resolved",
  },
  {
    id: "RSK-009",
    title: "Noise Pollution Exceeding Limits",
    survey: "SRY-2024-009",
    project: "Mumbai Metro Line 4 Extension",
    level: "Low" as RiskLevel,
    description: "Construction noise levels recorded at 82 dB during night shifts, exceeding CPCB limit of 75 dB for residential zones. Complaints from nearby residents.",
    mitigation: "Install noise barriers at site perimeter. Restrict heavy equipment operations during night. Use silencers on generators. Schedule noisy activities day-time.",
    identifiedBy: "Deepak Nair",
    date: "2024-11-20",
    status: "Open",
  },
  {
    id: "RSK-010",
    title: "Material Storage Fire Risk",
    survey: "SRY-2024-011",
    project: "Ircon Bridge Reconstruction - Bihar",
    level: "Medium" as RiskLevel,
    description: "Chemical storage area for waterproofing compounds lacks proper ventilation and fire extinguishers. Flammable materials stored near welding zone.",
    mitigation: "Relocate chemical storage to designated area. Install fire extinguishers. Create buffer zone between chemical storage and hot work areas. Train workers.",
    identifiedBy: "Suresh Patil",
    date: "2024-11-22",
    status: "Open",
  },
  {
    id: "RSK-011",
    title: "Crane Operator Certification Expired",
    survey: "SRY-2024-012",
    project: "DLF Cyber City Phase 2",
    level: "High" as RiskLevel,
    description: "Tower crane operator working with expired certification. Last renewal was 8 months ago. Safety compliance violation under Factories Act.",
    mitigation: "Immediately suspend crane operations. Arrange emergency certification renewal. Deploy backup certified operator. Audit all equipment operator certifications.",
    identifiedBy: "Karan Bhatt",
    date: "2024-11-25",
    status: "In Progress",
  },
  {
    id: "RSK-012",
    title: "Underground Utility Conflict",
    survey: "SRY-2024-013",
    project: "Chennai-Salem Expressway",
    level: "Low" as RiskLevel,
    description: "Uncharted water pipeline discovered during pile foundation work. Pipeline may belong to local municipality. Potential delay to foundation work.",
    mitigation: "Suspend excavation in affected zone. Contact BWSSB for pipeline mapping. Coordinate with utility department for relocation. Update site utility drawings.",
    identifiedBy: "Manish Gupta",
    date: "2024-11-28",
    status: "Open",
  },
  {
    id: "RSK-013",
    title: "Structural Deflection in Transfer Beam",
    survey: "SRY-2024-014",
    project: "Tata Housing Primanti Floors",
    level: "Critical" as RiskLevel,
    description: "Transfer beam at 5th floor showing deflection of 18mm exceeding permissible limit of 12mm. Load redistribution required before proceeding with upper floors.",
    mitigation: "Halt construction above transfer level. Engage structural designer for beam strengthening. Install additional propping. Conduct load test after remediation.",
    identifiedBy: "Ashok Verma",
    date: "2024-11-30",
    status: "Open",
  },
  {
    id: "RSK-014",
    title: "Dust Control Measures Insufficient",
    survey: "SRY-2024-015",
    project: "HCC Selinium Tower B",
    level: "Low" as RiskLevel,
    description: "PM10 levels at site boundary measured at 380 μg/m³, exceeding 300 μg/m³ limit. Dust suppression measures inadequate during earthwork operations.",
    mitigation: "Increase water sprinkling frequency to every 30 minutes. Install additional mist cannons. Cover exposed soil with tarpaulins. Enforce vehicle speed limits.",
    identifiedBy: "Rakesh Sachdev",
    date: "2024-12-01",
    status: "Open",
  },
]

const projectList = [...new Set(mockRisks.map((r) => r.project))].sort()
const surveyList = [...new Set(mockRisks.map((r) => r.survey))].sort()

export default function RisksPage() {
  const [levelFilter, setLevelFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [surveyFilter, setSurveyFilter] = useState("all")

  const filteredRisks = useMemo(() => {
    return mockRisks.filter((risk) => {
      const matchesLevel = levelFilter === "all" || risk.level === levelFilter
      const matchesProject = projectFilter === "all" || risk.project === projectFilter
      const matchesSurvey = surveyFilter === "all" || risk.survey === surveyFilter
      return matchesLevel && matchesProject && matchesSurvey
    })
  }, [levelFilter, projectFilter, surveyFilter])

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    mockRisks.forEach((r) => { counts[r.level]++ })
    return counts
  }, [])

  const matrixData: { likelihood: number; impact: number; count: number; level: string }[] = []
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      const score = l * i
      let level = "Low"
      if (score >= 20) level = "Critical"
      else if (score >= 12) level = "High"
      else if (score >= 6) level = "Medium"
      matrixData.push({ likelihood: l, impact: i, count: 0, level })
    }
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Risk
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Risks"
          value={mockRisks.length}
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
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectList.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Surveys" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surveys</SelectItem>
                    {surveyList.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
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
                {filteredRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{risk.id}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{risk.survey}</TableCell>
                    <TableCell>
                      <Badge className={cn("border", levelColors[risk.level])}>
                        {risk.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] text-sm text-muted-foreground truncate">
                      {risk.description}
                    </TableCell>
                    <TableCell className="max-w-[250px] text-sm text-muted-foreground truncate">
                      {risk.mitigation}
                    </TableCell>
                    <TableCell className="text-sm">{risk.identifiedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(risk.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Risk
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRisks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No risks found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
