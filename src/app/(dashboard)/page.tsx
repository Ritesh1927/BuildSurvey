'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
} from 'recharts'
import {
  FolderKanban,
  ClipboardList,
  IndianRupee,
  Users,
  FileText,
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Camera,
  Mic,
  Pencil,
  Bell,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Upload,
  UserPlus,
  DollarSign,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

const stats = [
  {
    label: 'Active Projects',
    value: 12,
    change: 8,
    trend: 'up' as const,
    color: 'info' as const,
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: 'Pending Surveys',
    value: 8,
    change: -3,
    trend: 'down' as const,
    color: 'warning' as const,
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Revenue This Month',
    value: '₹45.2L',
    change: 12,
    trend: 'up' as const,
    color: 'success' as const,
    icon: <IndianRupee className="h-5 w-5" />,
  },
  {
    label: 'BOQ Pending',
    value: '₹1.2Cr',
    change: 5,
    trend: 'up' as const,
    color: 'default' as const,
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Approvals Pending',
    value: 14,
    change: -6,
    trend: 'down' as const,
    color: 'danger' as const,
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    label: 'Engineers Online',
    value: '6/10',
    change: 0,
    trend: 'up' as const,
    color: 'info' as const,
    icon: <Users className="h-5 w-5" />,
  },
]

const surveyTrendData = [
  { month: 'Aug', completed: 18, scheduled: 22 },
  { month: 'Sep', completed: 22, scheduled: 25 },
  { month: 'Oct', completed: 15, scheduled: 20 },
  { month: 'Nov', completed: 28, scheduled: 30 },
  { month: 'Dec', completed: 20, scheduled: 18 },
  { month: 'Jan', completed: 25, scheduled: 28 },
  { month: 'Feb', completed: 30, scheduled: 32 },
  { month: 'Mar', completed: 22, scheduled: 26 },
  { month: 'Apr', completed: 35, scheduled: 38 },
  { month: 'May', completed: 28, scheduled: 30 },
  { month: 'Jun', completed: 32, scheduled: 35 },
  { month: 'Jul', completed: 18, scheduled: 24 },
]

const projectStatusData = [
  { name: 'In Progress', value: 10, color: '#10b981' },
  { name: 'Planning', value: 5, color: '#3b82f6' },
  { name: 'Completed', value: 6, color: '#8b5cf6' },
  { name: 'On Hold', value: 2, color: '#f59e0b' },
  { name: 'Cancelled', value: 1, color: '#ef4444' },
]

const monthlyRevenueData = [
  { month: 'Jan', revenue: 32.5, expenses: 18.2 },
  { month: 'Feb', revenue: 38.8, expenses: 22.1 },
  { month: 'Mar', revenue: 28.2, expenses: 16.8 },
  { month: 'Apr', revenue: 42.3, expenses: 24.5 },
  { month: 'May', revenue: 48.1, expenses: 28.3 },
  { month: 'Jun', revenue: 41.6, expenses: 23.2 },
  { month: 'Jul', revenue: 45.2, expenses: 25.8 },
]

const engineerPerformanceData = [
  { name: 'Raj Mehta', surveys: 42, avatar: 'RM' },
  { name: 'Neha Gupta', surveys: 38, avatar: 'NG' },
  { name: 'Amit Kumar', surveys: 35, avatar: 'AK' },
  { name: 'Priya Sharma', surveys: 32, avatar: 'PS' },
  { name: 'Vikram Singh', surveys: 28, avatar: 'VS' },
]

const upcomingSurveys = [
  {
    id: 'SRV-042',
    title: 'Pre-Construction Survey',
    project: 'Sunrise Enclave',
    date: '2026-07-16',
    time: '09:00 AM',
    surveyor: 'Raj Mehta',
    type: 'Topographical',
    priority: 'high',
  },
  {
    id: 'SRV-043',
    title: 'Foundation Inspection',
    project: 'Metro Residency',
    date: '2026-07-16',
    time: '02:00 PM',
    surveyor: 'Neha Gupta',
    type: 'Structural',
    priority: 'medium',
  },
  {
    id: 'SRV-044',
    title: 'Progress Documentation',
    project: 'Phoenix Tower',
    date: '2026-07-17',
    time: '10:00 AM',
    surveyor: 'Amit Kumar',
    type: 'Photographic',
    priority: 'low',
  },
  {
    id: 'SRV-045',
    title: 'Material Quality Check',
    project: 'Greenfield Estates',
    date: '2026-07-17',
    time: '11:30 AM',
    surveyor: 'Raj Mehta',
    type: 'Quality Control',
    priority: 'critical',
  },
  {
    id: 'SRV-046',
    title: 'Final Handover Survey',
    project: 'Cloudview Apartments',
    date: '2026-07-18',
    time: '09:00 AM',
    surveyor: 'Neha Gupta',
    type: 'Comprehensive',
    priority: 'high',
  },
]

const recentActivities = [
  {
    id: 'act-001',
    type: 'survey_completed',
    title: 'Survey Completed',
    description: 'Foundation survey for Phoenix Tower completed with all checkpoints passed.',
    user: { firstName: 'Raj', lastName: 'Mehta' },
    timestamp: '2026-07-11T09:30:00',
  },
  {
    id: 'act-002',
    type: 'payment_received',
    title: 'BOQ Approved',
    description: 'BOQ for Greenfield Estates Phase 2 approved by client. Amount: ₹18,50,000.',
    user: { firstName: 'Priya', lastName: 'Sharma' },
    timestamp: '2026-07-11T08:15:00',
  },
  {
    id: 'act-003',
    type: 'report_submitted',
    title: 'Report Submitted',
    description: 'Structural assessment report for Metro Residency submitted for review.',
    user: { firstName: 'Neha', lastName: 'Gupta' },
    timestamp: '2026-07-10T17:45:00',
  },
  {
    id: 'act-004',
    type: 'file_uploaded',
    title: 'Documents Uploaded',
    description: '5 new site photos and 2 measurement reports uploaded to Cloudview Apartments.',
    user: { firstName: 'Neha', lastName: 'Gupta' },
    timestamp: '2026-07-10T15:20:00',
  },
  {
    id: 'act-005',
    type: 'alert',
    title: 'Schedule Conflict Detected',
    description: 'Two surveys scheduled for 15th July at the same location. Please review.',
    user: { firstName: 'System', lastName: '' },
    timestamp: '2026-07-10T14:00:00',
  },
  {
    id: 'act-006',
    type: 'proposal_sent',
    title: 'Quotation Sent',
    description: 'Detailed survey quotation sent to Urban Spaces Pvt. Ltd. for review.',
    user: { firstName: 'Priya', lastName: 'Sharma' },
    timestamp: '2026-07-10T11:30:00',
  },
  {
    id: 'act-007',
    type: 'lead_created',
    title: 'New Lead Received',
    description: 'New inquiry from Heritage Builders for a heritage restoration survey.',
    user: { firstName: 'Saurabh', lastName: 'Verma' },
    timestamp: '2026-07-10T10:00:00',
  },
  {
    id: 'act-008',
    type: 'task_completed',
    title: 'Checklist Approved',
    description: 'Soil testing checklist for Hillside Villas has been reviewed and approved.',
    user: { firstName: 'Raj', lastName: 'Mehta' },
    timestamp: '2026-07-09T18:00:00',
  },
]

const topProjects = [
  {
    id: 'PRJ-2026-001',
    name: 'Phoenix Tower',
    code: 'PT-2026',
    client: 'Meridian Constructions',
    progress: 78,
    daysRemaining: 12,
    budgetUsed: 72,
    status: 'In Progress',
  },
  {
    id: 'PRJ-2026-004',
    name: 'Greenfield Estates',
    code: 'GE-2026',
    client: 'Greenfield Developers',
    progress: 45,
    daysRemaining: 28,
    budgetUsed: 38,
    status: 'In Progress',
  },
  {
    id: 'PRJ-2026-007',
    name: 'Cloudview Apartments',
    code: 'CA-2026',
    client: 'Skyline Builders',
    progress: 92,
    daysRemaining: 4,
    budgetUsed: 88,
    status: 'In Progress',
  },
  {
    id: 'PRJ-2026-002',
    name: 'Metro Residency',
    code: 'MR-2026',
    client: 'Metro Housing Ltd.',
    progress: 30,
    daysRemaining: 45,
    budgetUsed: 25,
    status: 'Planning',
  },
]

const notifications = [
  {
    id: 'n1',
    title: 'Urgent: BOQ approval pending',
    message: 'BOQ for Sunrise Enclave requires immediate approval',
    time: '5 min ago',
    type: 'urgent',
  },
  {
    id: 'n2',
    title: 'New survey assigned',
    message: 'Foundation inspection assigned to you for Metro Residency',
    time: '15 min ago',
    type: 'info',
  },
  {
    id: 'n3',
    title: 'Report ready for review',
    message: 'Structural assessment report for Phoenix Tower is ready',
    time: '1 hour ago',
    type: 'success',
  },
  {
    id: 'n4',
    title: 'Payment received',
    message: '₹4,50,000 received from Greenfield Developers',
    time: '2 hours ago',
    type: 'success',
  },
  {
    id: 'n5',
    title: 'Document uploaded',
    message: 'Site photos uploaded by Neha Gupta for Cloudview Apartments',
    time: '3 hours ago',
    type: 'info',
  },
]

const quickStats = [
  { label: 'Documents Uploaded', value: 24, icon: <Upload className="h-4 w-4" /> },
  { label: 'Photos Captured', value: 156, icon: <Camera className="h-4 w-4" /> },
  { label: 'Voice Notes', value: 12, icon: <Mic className="h-4 w-4" /> },
  { label: 'Sketches', value: 8, icon: <Pencil className="h-4 w-4" /> },
]

const activityIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  survey_completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  payment_received: { icon: DollarSign, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  report_submitted: { icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  file_uploaded: { icon: Upload, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
  alert: { icon: AlertTriangle, color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  proposal_sent: { icon: Send, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400' },
  lead_created: { icon: UserPlus, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  task_completed: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800',
  high: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800',
  medium: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800',
  low: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
}

const priorityDot: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
  }, [])

  const greeting = useMemo(() => {
    if (!currentTime) return 'Good morning'
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [currentTime])

  const today = (currentTime ?? new Date()).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, Rajesh Kumar
          </h1>
          <p className="text-muted-foreground">{today} — Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/surveys/new">
              <ClipboardList className="mr-1 h-4 w-4" />
              New Survey
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/projects/new">
              <FolderKanban className="mr-1 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/quotations/new">
              <FileText className="mr-1 h-4 w-4" />
              Create Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Section - 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Survey Trend Line Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Survey Trend</CardTitle>
              <Badge variant="info" className="text-[10px]">12 Months</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={surveyTrendData}>
                    <defs>
                      <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="scheduledGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#completedGrad)"
                      name="Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#3b82f6' }}
                      name="Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="scheduled"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#10b981' }}
                      name="Scheduled"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Project Status Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Project Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Monthly Revenue Bar Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+12%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: unknown) => [`₹${value}L`, '']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="square"
                      iconSize={10}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#cbd5e1"
                      radius={[4, 4, 0, 0]}
                      name="Expenses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Engineer Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Engineer Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineerPerformanceData.map((engineer) => (
                  <div key={engineer.name} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-semibold">
                        {engineer.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{engineer.name}</span>
                        <span className="text-sm font-semibold text-blue-600">{engineer.surveys}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                          style={{ width: `${(engineer.surveys / 42) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - 3 Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calendar">
                <CalendarDays className="mr-1 h-3 w-3" />
                View Calendar
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', priorityDot[survey.priority])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{survey.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{survey.project}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{survey.time}</span>
                      </div>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{survey.surveyor}</span>
                    </div>
                  </div>
                  <Badge className={cn('shrink-0 text-[10px] border', priorityStyles[survey.priority])}>
                    {survey.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/analytics">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const config = activityIconMap[activity.type] || activityIconMap.survey_completed
                const Icon = config.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', config.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none mb-0.5">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="bg-muted text-[8px] font-medium">
                            {getInitials(activity.user.firstName, activity.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">
                          {activity.user.firstName} {activity.user.lastName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Progress Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Project Progress</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProjects.map((project) => (
                <div key={project.id} className="rounded-lg border p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{project.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{project.code}</Badge>
                        <span className="text-[10px] text-muted-foreground truncate">{project.client}</span>
                      </div>
                    </div>
                    <Badge className={cn('text-[10px] shrink-0', project.status === 'In Progress' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400')}>
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          project.progress >= 80 ? 'bg-emerald-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{project.daysRemaining} days left</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>Budget: {project.budgetUsed}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Widgets Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Center */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Notification Center</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">
                <Bell className="mr-1 h-3 w-3" />
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                    notif.type === 'urgent' && 'border-l-2 border-l-red-500'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    notif.type === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                  )}>
                    {notif.type === 'urgent' ? <AlertTriangle className="h-3 w-3" /> : notif.type === 'success' ? <CheckCircle className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none mb-0.5">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map View Placeholder */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Site Locations Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[320px] bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-50 dark:from-blue-950/50 dark:via-blue-900/30 dark:to-emerald-950/50 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <div className="relative z-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-3">
                  <MapPin className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-foreground">Site Locations Map</p>
                <p className="text-xs text-muted-foreground mt-1">12 active project sites</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-muted-foreground">Planned</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-[10px] text-muted-foreground">Completed</span>
                  </div>
                </div>
              </div>
              {/* Simulated map markers */}
              <div className="absolute top-[20%] left-[30%] h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
              <div className="absolute top-[40%] left-[60%] h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
              <div className="absolute top-[60%] left-[25%] h-3 w-3 rounded-full bg-amber-500 border-2 border-white shadow-md" />
              <div className="absolute top-[35%] left-[75%] h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
              <div className="absolute top-[70%] left-[55%] h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
