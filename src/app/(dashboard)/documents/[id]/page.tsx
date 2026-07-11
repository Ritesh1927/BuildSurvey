"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  FileText,
  FileSpreadsheet,
  File,
  Image,
  Calendar,
  User,
  FolderOpen,
  Clock,
  History,
  Link2,
  Eye,
  Pencil,
} from "lucide-react"

import { cn, formatDate, formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { ScrollArea } from "@/components/ui/scroll-area"

const documentData = {
  id: "DOC-001",
  name: "Architectural Drawing - Floor Plan A3.pdf",
  type: "PDF",
  category: "Drawings",
  size: "15.2 MB",
  uploadedBy: "Amit Deshmukh",
  uploadedByInitials: "AD",
  date: "2026-07-10",
  version: "3.1",
  project: "Worli Sky Residences Tower A",
  projectId: "PRJ-001",
  description: "Architectural floor plan for Worli Sky Residences Tower A, Level 1-42. Includes all unit layouts, common areas, lift lobbies, and fire escape routes.",
  tags: ["architectural", "floor-plan", "level-1-42", "structural"],
}

const versionHistory = [
  { version: "3.1", date: "2026-07-10", time: "14:30", uploadedBy: "Amit Deshmukh", change: "Updated fire escape route on floors 35-42", size: "15.2 MB" },
  { version: "3.0", date: "2026-06-28", time: "10:15", uploadedBy: "Amit Deshmukh", change: "Revised unit layouts for premium floors", size: "14.8 MB" },
  { version: "2.5", date: "2026-06-15", time: "16:45", uploadedBy: "Priya Nair", change: "Added MEP coordination overlays", size: "13.9 MB" },
  { version: "2.0", date: "2026-05-20", time: "09:00", uploadedBy: "Amit Deshmukh", change: "Major revision - structural changes", size: "12.5 MB" },
  { version: "1.5", date: "2026-04-10", time: "11:30", uploadedBy: "Vikram Desai", change: "Updated common area dimensions", size: "11.8 MB" },
  { version: "1.0", date: "2026-03-01", time: "08:00", uploadedBy: "Amit Deshmukh", change: "Initial upload", size: "10.2 MB" },
]

const activityLog = [
  { action: "Downloaded", user: "Raj Mehta", date: "2026-07-10T16:45:00", details: "Downloaded for survey reference" },
  { action: "Viewed", user: "Neha Gupta", date: "2026-07-10T14:22:00", details: "Viewed online" },
  { action: "Uploaded", user: "Amit Deshmukh", date: "2026-07-10T14:30:00", details: "Version 3.1 uploaded" },
  { action: "Shared", user: "Amit Deshmukh", date: "2026-07-10T14:35:00", details: "Shared with Saurabh Patil" },
  { action: "Commented", user: "Priya Nair", date: "2026-07-09T11:00:00", details: "Added review comments" },
  { action: "Downloaded", user: "Sanjay Kulkarni", date: "2026-07-08T09:30:00", details: "Downloaded for site reference" },
  { action: "Viewed", user: "Vikram Desai", date: "2026-07-07T15:10:00", details: "Viewed online" },
  { action: "Downloaded", user: "Meera Rao", date: "2026-07-05T10:20:00", details: "Downloaded for quality check" },
]

const relatedDocuments = [
  { id: "DOC-002", name: "Structural Layout - Foundation.pdf", type: "PDF", date: "2026-07-09" },
  { id: "DOC-003", name: "MEP Coordination Drawing.pdf", type: "PDF", date: "2026-07-08" },
  { id: "DOC-005", name: "Elevation Drawing - North Face.pdf", type: "PDF", date: "2026-07-03" },
  { id: "DOC-021", name: "BoQ - Worli Sky Residences.xlsx", type: "Excel", date: "2026-07-03" },
]

const fileTypeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-red-500" />,
  Excel: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  DWG: <File className="h-5 w-5 text-blue-500" />,
  Image: <Image className="h-5 w-5 text-violet-500" />,
}

export default function DocumentDetailPage() {
  const doc = documentData

  return (
    <div className="space-y-6">
      <PageHeader
        title={doc.name}
        description={`${doc.project} - ${doc.category}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Documents", href: "/documents" },
          { label: doc.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Document Preview */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-[4/3] rounded-lg border-2 border-dashed bg-muted/30 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  {fileTypeIcons[doc.type] || <File className="h-16 w-16 mx-auto opacity-30" />}
                  <p className="mt-4 text-lg font-medium">Document Preview</p>
                  <p className="mt-1 text-sm">{doc.name}</p>
                  <p className="mt-1 text-xs">PDF viewer will be rendered here</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Eye className="mr-2 h-4 w-4" />
                    Open Full View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Related Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedDocuments.map((related) => (
                  <Link
                    key={related.id}
                    href={`/documents/${related.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                        {fileTypeIcons[related.type]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{related.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(related.date)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">File Name</span>
                  <span className="font-medium text-right max-w-[180px] truncate">{doc.name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{doc.type}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{doc.size}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono font-medium">v{doc.version}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Project</span>
                  <Link href={`/projects/${doc.projectId}`} className="font-medium text-primary hover:underline">
                    {doc.project}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px]">
                <div className="space-y-4">
                  {versionHistory.map((v, i) => (
                    <div key={v.version} className="relative">
                      {i < versionHistory.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                          i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          v{v.version}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{v.change}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{v.uploadedBy}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{v.date} at {v.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Size: {v.size}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {activityLog.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <div>
                        <p>
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">{activity.action.toLowerCase()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
