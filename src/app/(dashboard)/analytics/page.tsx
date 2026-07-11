"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IndianRupee,
  FolderKanban,
  ClipboardList,
  Star,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Users,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { cn, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"

const kpis = [
  {
    label: "Total Revenue (FY26-27)",
    value: "₹2.84Cr",
    change: 18,
    trend: "up" as const,
    color: "success" as const,
    icon: <IndianRupee className="h-5 w-5" />,
  },
  {
    label: "Projects Completed",
    value: 3,
    change: 50,
    trend: "up" as const,
    color: "info" as const,
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: "Surveys Done",
    value: 142,
    change: 12,
    trend: "up" as const,
    color: "success" as const,
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: "Client Satisfaction",
    value: "4.8/5.0",
    change: 5,
    trend: "up" as const,
    color: "default" as const,
    icon: <Star className="h-5 w-5" />,
  },
]

const revenueTrendData = [
  { month: "Jan", revenue: 18.5, target: 16.0 },
  { month: "Feb", revenue: 22.3, target: 18.0 },
  { month: "Mar", revenue: 19.8, target: 17.0 },
  { month: "Apr", revenue: 25.6, target: 20.0 },
  { month: "May", revenue: 28.1, target: 22.0 },
  { month: "Jun", revenue: 24.7, target: 21.0 },
  { month: "Jul", revenue: 30.2, target: 23.0 },
  { month: "Aug", revenue: 27.4, target: 22.0 },
  { month: "Sep", revenue: 32.5, target: 25.0 },
  { month: "Oct", revenue: 29.8, target: 24.0 },
  { month: "Nov", revenue: 35.1, target: 27.0 },
  { month: "Dec", revenue: 31.9, target: 26.0 },
]

const projectsByTypeData = [
  { name: "Residential Tower", value: 8, color: "#3b82f6" },
  { name: "Commercial Complex", value: 4, color: "#10b981" },
  { name: "Infrastructure", value: 3, color: "#8b5cf6" },
  { name: "Highway", value: 2, color: "#f59e0b" },
  { name: "Bridge", value: 1, color: "#ef4444" },
]

const surveyCompletionData = [
  { month: "Jan", completed: 12, planned: 15 },
  { month: "Feb", completed: 18, planned: 16 },
  { month: "Mar", completed: 14, planned: 14 },
  { month: "Apr", completed: 20, planned: 18 },
  { month: "May", completed: 22, planned: 20 },
  { month: "Jun", completed: 19, planned: 19 },
  { month: "Jul", completed: 16, planned: 15 },
]

const teamPerformanceData = [
  { name: "Raj Mehta", surveys: 28, rating: 4.9, onTime: 96 },
  { name: "Neha Gupta", surveys: 24, rating: 4.8, onTime: 92 },
  { name: "Amit Kumar", surveys: 22, rating: 4.7, onTime: 88 },
  { name: "Priya Nair", surveys: 20, rating: 4.6, onTime: 94 },
  { name: "Vikram Desai", surveys: 18, rating: 4.5, onTime: 90 },
  { name: "Sanjay Kulkarni", surveys: 16, rating: 4.4, onTime: 86 },
  { name: "Deepak Nair", surveys: 14, rating: 4.3, onTime: 85 },
  { name: "Meera Rao", surveys: 12, rating: 4.2, onTime: 82 },
]

const riskDistributionData = [
  { name: "Low Risk", value: 45, color: "#10b981" },
  { name: "Medium Risk", value: 30, color: "#f59e0b" },
  { name: "High Risk", value: 15, color: "#ef4444" },
  { name: "Critical", value: 10, color: "#dc2626" },
]

const costVsBudgetData = [
  { month: "Jan", budget: 42.5, actual: 38.2 },
  { month: "Feb", budget: 45.0, actual: 41.8 },
  { month: "Mar", budget: 43.5, actual: 40.1 },
  { month: "Apr", budget: 48.0, actual: 44.5 },
  { month: "May", budget: 52.0, actual: 48.3 },
  { month: "Jun", budget: 50.0, actual: 47.6 },
  { month: "Jul", budget: 55.0, actual: 51.2 },
  { month: "Aug", budget: 53.0, actual: 49.8 },
  { month: "Sep", budget: 58.0, actual: 55.4 },
  { month: "Oct", budget: 56.0, actual: 53.1 },
  { month: "Nov", budget: 60.0, actual: 57.8 },
  { month: "Dec", budget: 62.0, actual: 59.2 },
]

const projects = [
  "All Projects",
  "Worli Sky Residences Tower A",
  "BKC Commercial Hub Phase 1",
  "Delhi-Meerut Expressway Section 3",
  "Mumbai Metro Line 4 Extension",
]

const teams = [
  "All Teams",
  "Survey Team A",
  "Survey Team B",
  "Engineering Team",
  "Quality Team",
]

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ from: "2026-01-01", to: "2026-12-31" })
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [teamFilter, setTeamFilter] = useState("All Teams")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights into business performance and operations"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <DatePicker
              defaultValue={dateRange.from}
              className="w-[150px]"
            />
            <span className="text-muted-foreground">to</span>
            <DatePicker
              defaultValue={dateRange.to}
              className="w-[150px]"
            />
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`₹${value}L`, ""]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projects by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Projects by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectsByTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} Projects`, ""]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Survey Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Survey Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyCompletionData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="square" iconSize={10} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Planned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="square" iconSize={10} />
                  <Bar dataKey="surveys" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Surveys Done" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} Items`, ""]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost vs Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Cost vs Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costVsBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`₹${value}L`, ""]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  <Area
                    type="monotone"
                    dataKey="budget"
                    stroke="#94a3b8"
                    fill="#f1f5f9"
                    strokeWidth={2}
                    name="Budget"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    fill="#dbeafe"
                    strokeWidth={2}
                    name="Actual Cost"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/analytics/team">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Team Analytics</h3>
                <p className="text-sm text-muted-foreground">Individual performance and workload</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/financial">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Financial Analytics</h3>
                <p className="text-sm text-muted-foreground">Revenue, expenses, and cash flow</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Report Generation</h3>
                <p className="text-sm text-muted-foreground">Generate custom analytics reports</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
