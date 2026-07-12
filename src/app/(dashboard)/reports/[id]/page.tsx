"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Calendar,
  User,
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  Camera,
  Ruler,
  MapPin,
} from "lucide-react"

import { cn, formatDate } from "@/lib/utils"
import { showSuccess } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"

export default function ReportDetailPage() {
  const [isPrintMode, setIsPrintMode] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Topographical Survey Report"
        description="Worli Sky Residences Tower A"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reports", href: "/reports" },
          { label: "RPT-2026-001" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => { showSuccess("PDF download started"); window.print() }}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        }
      />

      {/* Report Meta */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="font-medium text-foreground">Project:</span>
              <span>Worli Sky Residences Tower A</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-foreground">Date:</span>
              <span>10 July 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">Prepared By:</span>
              <span>Raj Mehta, Sr. Surveyor</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Survey Report</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-8">
        {/* 1. Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              1. Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              A comprehensive topographical survey was conducted at the Worli Sky Residences Tower A site
              (Project ID: PRJ-2024-001) on 8th and 9th July 2026. The survey covered the entire building
              footprint of 285,000 sq. ft. across 42 floors, including the podium level and basement areas.
            </p>
            <p>
              The primary objective was to establish accurate control points, verify existing structural
              alignments, and document site conditions prior to the commencement of Phase 2 construction
              activities. The survey was performed using a Leica TS16 total station and validated with
              GPS/GNSS observations.
            </p>
            <p>
              Key findings include minor deviations in the north-east corner column grid (within 3mm tolerance),
              settlement of approximately 12mm in the south-east foundation area, and confirmation that all
              structural elements are within the acceptable tolerance limits as per IS:456-2000 standards.
            </p>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900">Key Highlights</h4>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>&bull; Total survey area covered: 285,000 sq. ft. across 42 floors</li>
                <li>&bull; Control points established: 48 (GPS-validated)</li>
                <li>&bull; Maximum deviation recorded: 2.8mm (within tolerance)</li>
                <li>&bull; Foundation settlement: 12mm (monitored over 6 months)</li>
                <li>&bull; Overall site condition: Satisfactory</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 2. Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-emerald-600" />
              2. Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="text-sm font-medium">L&T Realty</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Project Location</p>
                <p className="text-sm font-medium">Worli, Mumbai, Maharashtra</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Project Type</p>
                <p className="text-sm font-medium">Residential Tower - 42 Floors</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Built-up Area</p>
                <p className="text-sm font-medium">285,000 sq. ft.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Project Manager</p>
                <p className="text-sm font-medium">Amit Deshmukh</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current Progress</p>
                <p className="text-sm font-medium">65%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-medium">₹12,50,00,000</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">15 January 2024</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Expected Completion</p>
                <p className="text-sm font-medium">30 June 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Survey Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-violet-600" />
              3. Survey Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">3.1 Control Network</h4>
              <p className="text-muted-foreground leading-relaxed">
                A total of 48 control points were established across the site using a combination of
                permanent benchmarks (12 points) and temporary survey markers (36 points). The network
                was tied to the Mumbai Municipal Corporation survey datum (MMCD-2015) with a positional
                accuracy of ±2mm in horizontal and ±3mm in vertical measurements.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3.2 Structural Alignment Verification</h4>
              <p className="text-muted-foreground leading-relaxed">
                Column grid alignment was verified across all 42 floors. The maximum deviation observed
                was 2.8mm at grid line D-7 on the 38th floor, which is within the acceptable tolerance
                of ±5mm as per IS:456-2000. The column plumbness was found to be satisfactory with
                an average deviation of 1.2mm.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3.3 Settlement Monitoring</h4>
              <p className="text-muted-foreground leading-relaxed">
                Settlement markers were monitored at 16 locations around the building perimeter. The
                maximum settlement of 12mm was recorded at the south-east corner (marker SE-03), which
                has been consistently monitored since March 2026. The rate of settlement has decreased
                from 3mm/month to 1.5mm/month, indicating stabilization.
              </p>
            </div>
            <div className="mt-4 rounded-lg border p-4">
              <h4 className="font-semibold">Deviation Summary Table</h4>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Measured</th>
                    <th className="pb-2 font-medium">Tolerance</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">Grid D-7, Floor 38</td>
                    <td>Horizontal</td>
                    <td>2.8mm</td>
                    <td>±5mm</td>
                    <td><Badge variant="success" className="text-[10px]">Pass</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Grid A-3, Floor 25</td>
                    <td>Vertical</td>
                    <td>1.9mm</td>
                    <td>±5mm</td>
                    <td><Badge variant="success" className="text-[10px]">Pass</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Grid F-1, Floor 42</td>
                    <td>Plumbness</td>
                    <td>3.1mm</td>
                    <td>±5mm</td>
                    <td><Badge variant="success" className="text-[10px]">Pass</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2">Foundation SE-03</td>
                    <td>Settlement</td>
                    <td>12mm</td>
                    <td>±25mm</td>
                    <td><Badge variant="success" className="text-[10px]">Pass</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 4. Measurements Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ruler className="h-5 w-5 text-amber-600" />
              4. Measurements Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">48</p>
                <p className="text-xs text-muted-foreground">Control Points</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">1,680</p>
                <p className="text-xs text-muted-foreground">Column Locations</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-violet-600">42</p>
                <p className="text-xs text-muted-foreground">Floors Surveyed</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">16</p>
                <p className="text-xs text-muted-foreground">Settlement Markers</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              All measurements were taken using calibrated instruments with traceable certification.
              The Leica TS16 total station (accuracy: 1&quot;, distance: 1mm+1.5ppm) was used for
              angular and distance measurements. The Leica GS18 T GPS receiver (horizontal: 8mm,
              vertical: 15mm) was used for control network validation.
            </p>
          </CardContent>
        </Card>

        {/* 5. Photo Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-rose-600" />
              5. Photo Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square rounded-lg border bg-muted/30 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="mx-auto h-8 w-8 opacity-50" />
                    <p className="mt-1 text-xs">Site Photo {i}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">
              A total of 87 photographs were captured during the survey documenting site conditions,
              structural elements, settlement markers, and control points. All photos are geo-tagged
              with GPS coordinates and timestamp.
            </p>
          </CardContent>
        </Card>

        {/* 6. Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              6. Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <h4 className="font-semibold text-amber-900">Foundation Settlement - South East Corner</h4>
                  <p className="mt-1 text-amber-800">
                    The 12mm settlement at marker SE-03 requires continued monitoring. While currently within
                    tolerance, the trend should be observed for the next 3 months. If settlement exceeds
                    15mm, additional structural assessment will be required.
                  </p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800">Medium Risk</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Structural Alignment - Within Tolerance</h4>
                  <p className="mt-1 text-green-800">
                    All column grid deviations are within the ±5mm tolerance as per IS:456-2000.
                    No structural concerns identified.
                  </p>
                  <Badge variant="success" className="mt-2">Low Risk</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Control Network - Stable</h4>
                  <p className="mt-1 text-green-800">
                    All 48 control points show stable readings with no signs of displacement or disturbance.
                    Network accuracy verified within specified limits.
                  </p>
                  <Badge variant="success" className="mt-2">Low Risk</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              7. Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Continue Settlement Monitoring:</span>{" "}
                Maintain monthly monitoring of settlement markers SE-01 through SE-04 for the next
                6 months. Increase frequency to bi-weekly if any marker shows acceleration.
              </li>
              <li>
                <span className="font-medium text-foreground">Update Control Network:</span>{" "}
                Re-establish control points on the upper floors (35-42) as construction progresses.
                New points should be established on each new floor within 7 days of completion.
              </li>
              <li>
                <span className="font-medium text-foreground">Documentation:</span>{" "}
                Update the as-built drawings to reflect the latest survey data. Ensure all
                deviations are documented and shared with the structural engineering team.
              </li>
              <li>
                <span className="font-medium text-foreground">Pre-Construction Survey (Phase 2):</span>{" "}
                Schedule the pre-construction survey for the remaining floors (43-55) at least
                2 weeks before the start of Phase 2 construction.
              </li>
              <li>
                <span className="font-medium text-foreground">Coordination:</span>{" "}
                Share this report with the structural consultant (Mumbai Structural Associates)
                for their review and sign-off within 5 working days.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Prepared by: Raj Mehta, Sr. Surveyor</p>
              <p>Date: 10 July 2026</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">Reviewed by: Saurabh Patil, Project Director</p>
              <p>Signature: ____________________</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
