"use client"

import { useState, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Calculator,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const mockEstimationItems = [
  { id: "EST-001", category: "Foundation", description: "Piling work - 600mm dia bored piles", estimatedAmount: 18500000, actualAmount: 17900000, notes: "Actual lesser due to revised pile depth" },
  { id: "EST-002", category: "Foundation", description: "Pile cap and grade beam construction", estimatedAmount: 9200000, actualAmount: 9450000, notes: "Minor overrun due to additional reinforcement" },
  { id: "EST-003", category: "Structure", description: "RCC frame structure (columns, beams, slabs)", estimatedAmount: 45000000, actualAmount: 43800000, notes: "Optimized concrete mix reduced cost" },
  { id: "EST-004", category: "Structure", description: "Shear walls and core walls", estimatedAmount: 12000000, actualAmount: 12600000, notes: "Additional formwork complexity at lower floors" },
  { id: "EST-005", category: "Structure", description: "Staircase and lift shaft construction", estimatedAmount: 5500000, actualAmount: 5350000, notes: "" },
  { id: "EST-006", category: "Finishing", description: "Brick masonry and plastering", estimatedAmount: 14200000, actualAmount: 13500000, notes: "Reduced plaster thickness as per site direction" },
  { id: "EST-007", category: "Finishing", description: "Flooring - vitrified tiles and marble", estimatedAmount: 18000000, actualAmount: 19200000, notes: "Marble grade upgraded per client request" },
  { id: "EST-008", category: "Finishing", description: "Painting - internal and external", estimatedAmount: 6800000, actualAmount: 6500000, notes: "" },
  { id: "EST-009", category: "Finishing", description: "Doors, windows and hardware", estimatedAmount: 8500000, actualAmount: 8200000, notes: "Bulk procurement discount applied" },
  { id: "EST-010", category: "MEP", description: "Electrical wiring and distribution", estimatedAmount: 7800000, actualAmount: 7650000, notes: "" },
  { id: "EST-011", category: "MEP", description: "Plumbing and sanitary works", estimatedAmount: 5200000, actualAmount: 5400000, notes: "Additional bathroom fittings per design change" },
  { id: "EST-012", category: "MEP", description: "HVAC system installation", estimatedAmount: 11500000, actualAmount: 11200000, notes: "Split system preferred over central for Tower A" },
  { id: "EST-013", category: "MEP", description: "Fire fighting and safety systems", estimatedAmount: 4500000, actualAmount: 4350000, notes: "" },
  { id: "EST-014", category: "External Works", description: "Landscaping and garden areas", estimatedAmount: 3200000, actualAmount: 3000000, notes: "Phased execution reduced upfront cost" },
  { id: "EST-015", category: "External Works", description: "Compound wall, gates and paving", estimatedAmount: 2800000, actualAmount: 2850000, notes: "" },
  { id: "EST-016", category: "Contingency", description: "Project contingency (5%)", estimatedAmount: 5850000, actualAmount: 2100000, notes: "Only 36% contingency utilized" },
]

const categories = [...new Set(mockEstimationItems.map((i) => i.category))]

export default function EstimationPage() {
  const [selectedProject, setSelectedProject] = useState("PRJ-001")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return mockEstimationItems
    return mockEstimationItems.filter((i) => i.category === categoryFilter)
  }, [categoryFilter])

  const totalEstimated = mockEstimationItems.reduce((s, i) => s + i.estimatedAmount, 0)
  const totalActual = mockEstimationItems.reduce((s, i) => s + i.actualAmount, 0)
  const netVariance = totalEstimated - totalActual

  const categorySummary = useMemo(() => {
    const summary: { name: string; estimated: number; actual: number; variance: number; variancePercent: number }[] = []
    categories.forEach((cat) => {
      const catItems = mockEstimationItems.filter((i) => i.category === cat)
      const est = catItems.reduce((s, i) => s + i.estimatedAmount, 0)
      const act = catItems.reduce((s, i) => s + i.actualAmount, 0)
      const v = est - act
      summary.push({
        name: cat,
        estimated: est,
        actual: act,
        variance: v,
        variancePercent: est > 0 ? parseFloat(((v / est) * 100).toFixed(1)) : 0,
      })
    })
    return summary
  }, [])

  const chartData = categorySummary.map((c) => ({
    name: c.name,
    Estimated: c.estimated / 100000,
    Actual: c.actual / 100000,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Estimation"
        description="Track estimated vs actual costs across project categories"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Estimation" },
        ]}
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Estimated"
          value={formatCurrency(totalEstimated)}
          icon={<Calculator className="h-6 w-6" />}
          color="info"
        />
        <StatCard
          label="Total Actual"
          value={formatCurrency(totalActual)}
          icon={<Calculator className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          label="Net Variance"
          value={`${netVariance >= 0 ? "+" : ""}${formatCurrency(netVariance)}`}
          icon={netVariance >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          color={netVariance >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Budget Utilization"
          value={`${((totalActual / totalEstimated) * 100).toFixed(1)}%`}
          icon={<Calculator className="h-6 w-6" />}
          color="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Estimated vs Actual by Category</CardTitle>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRJ-001">Worli Sky Residences Tower A</SelectItem>
                  <SelectItem value="PRJ-002">BKC Commercial Hub Phase 1</SelectItem>
                  <SelectItem value="PRJ-004">Prestige Lake Ridge Villas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip formatter={(value) => `₹${(Number(value) * 100000).toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="Estimated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Category Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorySummary.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Est: {formatCurrency(cat.estimated)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={cat.variance >= 0 ? "success" : "destructive"}>
                      {cat.variance >= 0 ? "+" : ""}{cat.variancePercent}%
                    </Badge>
                    <div className={cn("text-xs mt-1 font-medium", cat.variance >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {cat.variance >= 0 ? "+" : ""}{formatCurrency(cat.variance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Detailed Estimation Breakdown</CardTitle>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Estimated (₹)</TableHead>
                <TableHead className="text-right">Actual (₹)</TableHead>
                <TableHead className="text-right">Variance (₹)</TableHead>
                <TableHead className="text-right">Variance %</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const variance = item.estimatedAmount - item.actualAmount
                const variancePercent = ((variance / item.estimatedAmount) * 100).toFixed(1)
                const isOver = variance < 0
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.estimatedAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.actualAmount)}</TableCell>
                    <TableCell className={cn("text-right font-medium", isOver ? "text-red-600" : "text-emerald-600")}>
                      {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={isOver ? "destructive" : "success"}>
                        {variance >= 0 ? "+" : ""}{variancePercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.notes || "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell colSpan={2}>Grand Total</TableCell>
                <TableCell className="text-right">{formatCurrency(totalEstimated)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalActual)}</TableCell>
                <TableCell className={cn("text-right", netVariance < 0 ? "text-red-600" : "text-emerald-600")}>
                  {netVariance >= 0 ? "+" : ""}{formatCurrency(netVariance)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={netVariance >= 0 ? "success" : "destructive"}>
                    {netVariance >= 0 ? "+" : ""}{((netVariance / totalEstimated) * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
