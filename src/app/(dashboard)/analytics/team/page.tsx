"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Users,
  ClipboardList,
  Star,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"

const teamMembers = [
  {
    id: "TM-001",
    name: "Raj Mehta",
    initials: "RM",
    role: "Sr. Surveyor",
    department: "Survey Team A",
    surveysDone: 28,
    averageRating: 4.9,
    onTimePercent: 96,
    reportsGenerated: 15,
    activeProjects: 4,
    attendance: 98,
    hoursWorked: 192,
    efficiency: 94,
  },
  {
    id: "TM-002",
    name: "Neha Gupta",
    initials: "NG",
    role: "Surveyor",
    department: "Survey Team A",
    surveysDone: 24,
    averageRating: 4.8,
    onTimePercent: 92,
    reportsGenerated: 12,
    activeProjects: 3,
    attendance: 95,
    hoursWorked: 186,
    efficiency: 91,
  },
  {
    id: "TM-003",
    name: "Amit Kumar",
    initials: "AK",
    role: "Jr. Surveyor",
    department: "Survey Team B",
    surveysDone: 22,
    averageRating: 4.7,
    onTimePercent: 88,
    reportsGenerated: 10,
    activeProjects: 3,
    attendance: 93,
    hoursWorked: 180,
    efficiency: 88,
  },
  {
    id: "TM-004",
    name: "Priya Nair",
    initials: "PN",
    role: "Sr. Engineer",
    department: "Engineering Team",
    surveysDone: 20,
    averageRating: 4.6,
    onTimePercent: 94,
    reportsGenerated: 18,
    activeProjects: 5,
    attendance: 97,
    hoursWorked: 195,
    efficiency: 93,
  },
  {
    id: "TM-005",
    name: "Vikram Desai",
    initials: "VD",
    role: "Project Engineer",
    department: "Engineering Team",
    surveysDone: 18,
    averageRating: 4.5,
    onTimePercent: 90,
    reportsGenerated: 8,
    activeProjects: 2,
    attendance: 91,
    hoursWorked: 176,
    efficiency: 87,
  },
  {
    id: "TM-006",
    name: "Sanjay Kulkarni",
    initials: "SK",
    role: "Surveyor",
    department: "Survey Team B",
    surveysDone: 16,
    averageRating: 4.4,
    onTimePercent: 86,
    reportsGenerated: 9,
    activeProjects: 2,
    attendance: 89,
    hoursWorked: 170,
    efficiency: 85,
  },
  {
    id: "TM-007",
    name: "Deepak Nair",
    initials: "DN",
    role: "Jr. Engineer",
    department: "Engineering Team",
    surveysDone: 14,
    averageRating: 4.3,
    onTimePercent: 85,
    reportsGenerated: 6,
    activeProjects: 2,
    attendance: 90,
    hoursWorked: 168,
    efficiency: 83,
  },
  {
    id: "TM-008",
    name: "Meera Rao",
    initials: "MR",
    role: "Quality Inspector",
    department: "Quality Team",
    surveysDone: 12,
    averageRating: 4.2,
    onTimePercent: 82,
    reportsGenerated: 14,
    activeProjects: 3,
    attendance: 88,
    hoursWorked: 164,
    efficiency: 80,
  },
]

const workloadData = [
  { name: "Raj Mehta", current: 4, max: 6 },
  { name: "Neha Gupta", current: 3, max: 5 },
  { name: "Amit Kumar", current: 3, max: 5 },
  { name: "Priya Nair", current: 5, max: 6 },
  { name: "Vikram Desai", current: 2, max: 4 },
  { name: "Sanjay Kulkarni", current: 2, max: 4 },
  { name: "Deepak Nair", current: 2, max: 4 },
  { name: "Meera Rao", current: 3, max: 5 },
]

const attendanceData = [
  { month: "Jan", present: 22, absent: 1, leave: 1 },
  { month: "Feb", present: 20, absent: 0, leave: 2 },
  { month: "Mar", present: 21, absent: 1, leave: 0 },
  { month: "Apr", present: 22, absent: 0, leave: 1 },
  { month: "May", present: 21, absent: 1, leave: 1 },
  { month: "Jun", present: 20, absent: 0, leave: 2 },
  { month: "Jul", present: 18, absent: 0, leave: 0 },
]

const radarData = [
  { skill: "Surveying", raj: 95, neha: 90, amit: 85 },
  { skill: "Documentation", raj: 88, neha: 92, amit: 80 },
  { skill: "Time Mgmt", raj: 96, neha: 88, amit: 82 },
  { skill: "Quality", raj: 94, neha: 91, amit: 87 },
  { skill: "Teamwork", raj: 90, neha: 85, amit: 88 },
  { skill: "Reporting", raj: 92, neha: 86, amit: 78 },
]

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
}

export default function TeamAnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(
      (m) =>
        searchQuery === "" ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Analytics"
        description="Performance metrics, workload distribution, and attendance tracking"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analytics", href: "/analytics" },
          { label: "Team" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Team Performance Metrics</CardTitle>
            <SearchInput
              placeholder="Search team members..."
              className="w-[250px]"
              onSearch={setSearchQuery}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Engineer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Surveys Done</TableHead>
                <TableHead className="text-center">Avg Rating</TableHead>
                <TableHead className="text-center">On-time %</TableHead>
                <TableHead className="text-center">Reports Generated</TableHead>
                <TableHead className="text-center">Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{member.surveysDone}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{member.averageRating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "font-medium",
                      member.onTimePercent >= 90 ? "text-emerald-600" : member.onTimePercent >= 80 ? "text-amber-600" : "text-red-600"
                    )}>
                      {member.onTimePercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">{member.reportsGenerated}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={member.efficiency} className="h-1.5 w-16" />
                      <span className="text-xs font-medium">{member.efficiency}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Individual Performance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.slice(0, 4).map((member) => (
          <Card key={member.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-sm text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Surveys</span>
                  <span className="font-medium">{member.surveysDone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{member.averageRating}/5.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">On-time</span>
                  <span className="font-medium">{member.onTimePercent}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hours</span>
                  <span className="font-medium">{member.hoursWorked}h</span>
                </div>
                <Progress value={member.efficiency} className="h-1.5" showValue />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical" barSize={14}>
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
                  <Bar dataKey="current" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Active Projects" />
                  <Bar dataKey="max" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="Max Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} barGap={4}>
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
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" stackId="a" />
                  <Bar dataKey="leave" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Leave" stackId="a" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Skill Comparison - Top 3 Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Raj Mehta" dataKey="raj" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Neha Gupta" dataKey="neha" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="Amit Kumar" dataKey="amit" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                <Tooltip contentStyle={chartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
