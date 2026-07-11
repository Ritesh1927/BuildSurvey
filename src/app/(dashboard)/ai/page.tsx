'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  DollarSign,
  AlertTriangle,
  FileScan,
  ImageIcon,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Activity,
  Clock,
  CheckCircle,
  ArrowRight,
  Settings,
  TrendingUp,
  Zap,
  Eye,
  MessageSquare,
  Camera,
  Mic,
  PenTool,
  BarChart3,
  Shield,
  Wrench,
  Cpu,
  Database,
  Key,
  Sliders,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type FeatureStatus = 'active' | 'beta' | 'coming-soon'

interface AiFeature {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: FeatureStatus
  usageCount: number
  href: string
  color: string
  bgColor: string
}

const statusConfig: Record<FeatureStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-800' },
  beta: { label: 'Beta', color: 'bg-amber-100 text-amber-800' },
  'coming-soon': { label: 'Coming Soon', color: 'bg-gray-100 text-gray-600' },
}

const aiFeatures: AiFeature[] = [
  {
    id: 'photo-classification',
    name: 'Photo Classification',
    description: 'Auto-tag and classify construction site photos by area, stage, and quality.',
    icon: <Camera className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/photo-classification',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Detect and identify construction materials, equipment, and defects in images.',
    icon: <Eye className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/object-detection',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'crack-detection',
    name: 'Crack Detection',
    description: 'AI-powered structural crack detection and severity assessment from photos.',
    icon: <AlertTriangle className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/crack-detection',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'voice-to-text',
    name: 'Voice to Text',
    description: 'Transcribe field notes and voice memos into structured survey data.',
    icon: <Mic className="h-6 w-6" />,
    status: 'beta',
    usageCount: 342,
    href: '/ai/voice-to-text',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
  {
    id: 'document-ocr',
    name: 'Document OCR',
    description: 'Extract structured data from scanned documents, invoices, and receipts.',
    icon: <FileScan className="h-6 w-6" />,
    status: 'active',
    usageCount: 2156,
    href: '/ai/ocr',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    id: 'drawing-ocr',
    name: 'Drawing OCR',
    description: 'Extract dimensions, annotations, and metadata from architectural drawings.',
    icon: <PenTool className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/drawing-ocr',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    id: 'auto-boq',
    name: 'Auto BOQ Suggestion',
    description: 'Generate Bill of Quantities suggestions based on survey data and drawings.',
    icon: <FileText className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/auto-boq',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    id: 'material-prediction',
    name: 'Material Prediction',
    description: 'Predict material requirements and optimize procurement based on project scope.',
    icon: <Layers className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/material-prediction',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    id: 'risk-prediction',
    name: 'Risk Prediction',
    description: 'Identify potential project risks from historical data and recommend mitigations.',
    icon: <Shield className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/risk-prediction',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'cost-prediction',
    name: 'Cost Prediction',
    description: 'AI-powered cost estimation using historical data, materials, and market trends.',
    icon: <DollarSign className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/cost-prediction',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    id: 'survey-summary',
    name: 'Survey Summary',
    description: 'Auto-generate comprehensive survey summaries with key findings and recommendations.',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'beta',
    usageCount: 189,
    href: '/ai/survey-summary',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'chatbot',
    name: 'Chatbot',
    description: 'AI assistant for querying project data, generating reports, and answering queries.',
    icon: <MessageSquare className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/chatbot',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
  {
    id: 'recommendation',
    name: 'Recommendation Engine',
    description: 'Smart recommendations for process optimization and best practices.',
    icon: <Sparkles className="h-6 w-6" />,
    status: 'coming-soon',
    usageCount: 0,
    href: '/ai/recommendations',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
]

const recentActivity = [
  { id: '1', type: 'OCR', action: 'Processed invoice INV-2026-0847', user: 'System', time: '2 minutes ago', status: 'success' },
  { id: '2', type: 'Voice to Text', action: 'Transcribed field notes for SRV-042', user: 'Amit Kumar', time: '15 minutes ago', status: 'success' },
  { id: '3', type: 'Survey Summary', action: 'Generated summary for Greenfield Estates', user: 'System', time: '1 hour ago', status: 'success' },
  { id: '4', type: 'OCR', action: 'Failed to process damaged document DOC-1024', user: 'System', time: '2 hours ago', status: 'error' },
  { id: '5', type: 'Voice to Text', action: 'Transcribed meeting notes for project review', user: 'Priya Sharma', time: '3 hours ago', status: 'success' },
  { id: '6', type: 'OCR', action: 'Extracted data from BOQ-2026-019', user: 'System', time: '4 hours ago', status: 'success' },
  { id: '7', type: 'Survey Summary', action: 'Generated weekly progress report', user: 'System', time: '5 hours ago', status: 'success' },
]

const activityStatusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, color: 'text-emerald-600' },
  warning: { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: 'text-amber-600' },
  error: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, color: 'text-red-600' },
}

const pipelineStages = [
  { name: 'Data Ingestion', icon: <Database className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
  { name: 'Preprocessing', icon: <Wrench className="h-5 w-5" />, color: 'bg-violet-100 text-violet-600' },
  { name: 'AI Models', icon: <Brain className="h-5 w-5" />, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Post Processing', icon: <Sliders className="h-5 w-5" />, color: 'bg-amber-100 text-amber-600' },
  { name: 'Output & API', icon: <Cpu className="h-5 w-5" />, color: 'bg-pink-100 text-pink-600' },
]

export default function AiPage() {
  const [activeTab, setActiveTab] = useState('features')

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Hub"
        description="Leverage artificial intelligence for smarter construction site management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'AI Module' },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai/settings">
              <Settings className="mr-2 h-4 w-4" />
              AI Settings
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="AI Operations Today"
          value={142}
          change={18}
          trend="up"
          color="info"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Active Features"
          value={2}
          change={0}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Accuracy Rate"
          value="94.2%"
          change={3}
          trend="up"
          color="success"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Time Saved (hrs)"
          value={28.5}
          change={12}
          trend="up"
          color="info"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aiFeatures.map((feature) => {
              const status = statusConfig[feature.status]
              return (
                <Card
                  key={feature.id}
                  className={cn(
                    'transition-all hover:shadow-md group h-full',
                    feature.status !== 'coming-soon' && 'cursor-pointer hover:border-primary/30'
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          feature.bgColor,
                          feature.color
                        )}
                      >
                        {feature.icon}
                      </div>
                      <Badge className={cn('text-[10px]', status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {feature.usageCount > 0
                          ? `${feature.usageCount.toLocaleString()} uses`
                          : 'No usage yet'}
                      </span>
                      {feature.status !== 'coming-soon' ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link href={feature.href}>
                            Configure
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Activity Log</CardTitle>
                <CardDescription>Recent AI operations and their status</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => {
                      const statConf = activityStatusConfig[activity.status]
                      return (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{activity.action}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {activity.user}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {activity.time}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {statConf.icon}
                              <span className={cn('text-sm capitalize', statConf.color)}>
                                {activity.status}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Pipeline Architecture</CardTitle>
              <CardDescription>End-to-end AI processing pipeline for construction data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-8">
                {/* Pipeline Flow */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {pipelineStages.map((stage, index) => (
                    <div key={stage.name} className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn('flex h-16 w-16 items-center justify-center rounded-xl', stage.color)}>
                          {stage.icon}
                        </div>
                        <span className="text-xs font-medium text-center max-w-[100px]">{stage.name}</span>
                      </div>
                      {index < pipelineStages.length - 1 && (
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Model Categories */}
                <div className="w-full grid gap-4 sm:grid-cols-3">
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-2">
                        <Eye className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold">Computer Vision</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Photo Classification, Object Detection, Crack Detection, Drawing OCR
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mb-2">
                        <FileScan className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold">Document Processing</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Document OCR, Auto BOQ, Voice to Text, Survey Summary
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold">Predictive Analytics</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cost Prediction, Risk Prediction, Material Prediction, Recommendations
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OCR API Key</Label>
                  <Input type="password" value="sk-ocr-••••••••••••••••" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Voice Processing API Key</Label>
                  <Input type="password" value="sk-voice-••••••••••••••" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>AI Model Endpoint</Label>
                  <Input value="https://api.construction-ai.com/v2" readOnly />
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-4 w-4" />
                  Update Keys
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-muted-foreground" />
                  Model Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Model</Label>
                  <Select defaultValue="gpt-4o">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                      <SelectItem value="claude-3.5">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Select defaultValue="0.85">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.7">70% - More results, lower accuracy</SelectItem>
                      <SelectItem value="0.8">80% - Balanced</SelectItem>
                      <SelectItem value="0.85">85% - Recommended</SelectItem>
                      <SelectItem value="0.9">90% - High accuracy</SelectItem>
                      <SelectItem value="0.95">95% - Very strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Concurrent Requests</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5 (Recommended)</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
