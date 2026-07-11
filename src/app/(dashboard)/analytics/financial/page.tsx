"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"

const revenueByMonthData = [
  { month: "Jan", revenue: 1850000, lastYear: 1520000 },
  { month: "Feb", revenue: 2230000, lastYear: 1780000 },
  { month: "Mar", revenue: 1980000, lastYear: 1650000 },
  { month: "Apr", revenue: 2560000, lastYear: 1920000 },
  { month: "May", revenue: 2810000, lastYear: 2150000 },
  { month: "Jun", revenue: 2470000, lastYear: 1890000 },
  { month: "Jul", revenue: 3020000, lastYear: 2320000 },
  { month: "Aug", revenue: 2740000, lastYear: 2080000 },
  { month: "Sep", revenue: 3250000, lastYear: 2450000 },
  { month: "Oct", revenue: 2980000, lastYear: 2280000 },
  { month: "Nov", revenue: 3510000, lastYear: 2680000 },
  { month: "Dec", revenue: 3190000, lastYear: 2420000 },
]

const expenseBreakdownData = [
  { name: "Manpower", value: 4200000, color: "#3b82f6" },
  { name: "Equipment", value: 2800000, color: "#10b981" },
  { name: "Materials", value: 1950000, color: "#f59e0b" },
  { name: "Travel", value: 850000, color: "#8b5cf6" },
  { name: "Software & Tools", value: 620000, color: "#ec4899" },
  { name: "Overheads", value: 480000, color: "#6b7280" },
]

const profitMarginData = [
  { month: "Jan", revenue: 18.5, cost: 13.2, profit: 5.3, margin: 28.6 },
  { month: "Feb", revenue: 22.3, cost: 15.1, profit: 7.2, margin: 32.3 },
  { month: "Mar", revenue: 19.8, cost: 14.5, profit: 5.3, margin: 26.8 },
  { month: "Apr", revenue: 25.6, cost: 16.8, profit: 8.8, margin: 34.4 },
  { month: "May", revenue: 28.1, cost: 18.2, profit: 9.9, margin: 35.2 },
  { month: "Jun", revenue: 24.7, cost: 16.5, profit: 8.2, margin: 33.2 },
  { month: "Jul", revenue: 30.2, cost: 19.8, profit: 10.4, margin: 34.4 },
]

const invoiceStatusData = [
  { name: "Paid", value: 68, color: "#10b981" },
  { name: "Pending", value: 18, color: "#f59e0b" },
  { name: "Overdue", value: 9, color: "#ef4444" },
  { name: "Draft", value: 5, color: "#94a3b8" },
]

const cashFlowData = [
  { month: "Jan", inflow: 2200000, outflow: 1650000 },
  { month: "Feb", inflow: 2650000, outflow: 1920000 },
  { month: "Mar", inflow: 2380000, outflow: 1780000 },
  { month: "Apr", inflow: 3100000, outflow: 2150000 },
  { month: "May", inflow: 3420000, outflow: 2380000 },
  { month: "Jun", inflow: 2950000, outflow: 2080000 },
  { month: "Jul", inflow: 3680000, outflow: 2520000 },
]

const outstandingPayments = [
  { id: "INV-2026-042", client: "L&T Realty", project: "Worli Sky Residences", amount: 450000, dueDate: "2026-07-15", daysOverdue: 0, status: "Pending" },
  { id: "INV-2026-038", client: "NHAI", project: "Delhi-Meerut Expressway", amount: 1250000, dueDate: "2026-07-10", daysOverdue: 1, status: "Overdue" },
  { id: "INV-2026-035", client: "Prestige Estates", project: "Prestige Lake Ridge", amount: 320000, dueDate: "2026-07-20", daysOverdue: 0, status: "Pending" },
  { id: "INV-2026-031", client: "MMRC", project: "Mumbai Metro Line 4", amount: 875000, dueDate: "2026-06-30", daysOverdue: 11, status: "Overdue" },
  { id: "INV-2026-028", client: "Godrej Properties", project: "Godrej Platinum Towers", amount: 280000, dueDate: "2026-07-25", daysOverdue: 0, status: "Pending" },
  { id: "INV-2026-024", client: "DLF Limited", project: "DLF Cyber City Phase 2", amount: 540000, dueDate: "2026-06-15", daysOverdue: 26, status: "Overdue" },
  { id: "INV-2026-020", client: "Adani Realty", project: "Ahmedabad Airport Expansion", amount: 980000, dueDate: "2026-07-05", daysOverdue: 6, status: "Overdue" },
  { id: "INV-2026-018", client: "Brigade Enterprises", project: "Brigade Gateway Tower", amount: 210000, dueDate: "2026-08-01", daysOverdue: 0, status: "Draft" },
]

const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
}

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Paid: "success",
  Pending: "warning",
  Overdue: "destructive",
  Draft: "secondary",
}

export default function FinancialAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Analytics"
        description="Revenue, expenses, profit margins, and payment tracking"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analytics", href: "/analytics" },
          { label: "Financial" },
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
              Export Report
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Revenue"
          value="₹2.84Cr"
          change={18}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Total Expenses"
          value="₹1.89Cr"
          change={12}
          trend="up"
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Profit Margin"
          value="33.4%"
          change={3.2}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Outstanding"
          value="₹49L"
          change={-8}
          trend="down"
          color="danger"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonthData} barGap={4}>
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
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="square" iconSize={10} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="This Year" />
                  <Bar dataKey="lastYear" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Last Year" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [formatCurrency(Number(value)), ""]}
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
        {/* Profit Margin Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profit Margin Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitMarginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value, name) => [
                      name === "Margin" ? `${value}%` : `₹${value}L`,
                      name,
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="Revenue" opacity={0.8} />
                  <Bar yAxisId="left" dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Cost" opacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Margin" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} Invoices`, ""]}
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

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
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
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="#10b981"
                  fill="#d1fae5"
                  strokeWidth={2}
                  name="Cash Inflow"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#ef4444"
                  fill="#fee2e2"
                  strokeWidth={2}
                  name="Cash Outflow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Outstanding Payments</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="text-xs">3 Overdue</Badge>
              <Badge variant="warning" className="text-xs">3 Pending</Badge>
              <Badge variant="secondary" className="text-xs">1 Draft</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                  <TableCell className="font-medium text-sm">{payment.client}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.project}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(payment.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {payment.daysOverdue > 0 ? (
                      <span className="text-sm font-medium text-red-600">{payment.daysOverdue}d</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColors[payment.status]} className="text-[10px]">
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
