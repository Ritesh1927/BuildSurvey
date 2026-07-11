'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Loader2,
  CheckCircle,
  Calendar,
  FolderKanban,
  ClipboardList,
  IndianRupee,
  Clock,
  MapPin,
  BarChart3,
  Camera,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateSurveyReport, downloadPdf, type SurveyReportData } from '@/lib/pdf-generator'

const reportTypes = [
  { value: 'survey', label: 'Survey Report', icon: <ClipboardList className="h-4 w-4" /> },
  { value: 'project', label: 'Project Report', icon: <FolderKanban className="h-4 w-4" /> },
  { value: 'boq', label: 'BOQ Report', icon: <FileText className="h-4 w-4" /> },
  { value: 'financial', label: 'Financial Report', icon: <IndianRupee className="h-4 w-4" /> },
  { value: 'daily', label: 'Daily Report', icon: <Calendar className="h-4 w-4" /> },
]

const projects = [
  { value: 'PRJ-001', label: 'Phoenix Tower — Structural Survey' },
  { value: 'PRJ-002', label: 'Greenfield Estates — Phase 2' },
  { value: 'PRJ-003', label: 'Cloudview Apartments — Interior' },
  { value: 'PRJ-004', label: 'Metro Residency — Foundation' },
  { value: 'PRJ-005', label: 'Sunrise Enclave — Pre-Construction' },
  { value: 'PRJ-006', label: 'Hillside Villas — Soil Testing' },
]

const sectionOptions = [
  { id: 'header', label: 'Report Header', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 'project', label: 'Project Details', icon: <FolderKanban className="h-3.5 w-3.5" /> },
  { id: 'location', label: 'GPS Location', icon: <MapPin className="h-3.5 w-3.5" /> },
  { id: 'measurements', label: 'Measurements Table', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'checklist', label: 'Checklist Summary', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  { id: 'photos', label: 'Photo Documentation', icon: <Camera className="h-3.5 w-3.5" /> },
  { id: 'risks', label: 'Risk Assessment', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { id: 'remarks', label: 'Remarks & Notes', icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'signatures', label: 'Digital Signatures', icon: <CheckCircle className="h-3.5 w-3.5" /> },
]

const sampleData: SurveyReportData = {
  projectName: 'Phoenix Tower — Structural Survey',
  projectCode: 'PT-2026',
  clientName: 'Meridian Constructions Pvt. Ltd.',
  clientAddress: '45, Park Street, Kolkata - 700016',
  surveyDate: '11 July 2026',
  surveyType: 'Structural Assessment',
  surveyId: 'SRV-2026-000142',
  location: {
    latitude: 22.5726,
    longitude: 88.3639,
    address: '123, EM Bypass, Sector V, Kolkata, West Bengal 700091',
  },
  measurements: [
    { item: 'Foundation Width', value: '3.5', unit: 'meters', remarks: 'As per design' },
    { item: 'Column Height (Ground Floor)', value: '3.2', unit: 'meters', remarks: '' },
    { item: 'Slab Thickness', value: '150', unit: 'mm', remarks: 'Nominal' },
    { item: 'Beam Depth', value: '450', unit: 'mm', remarks: '' },
    { item: 'Rebar Diameter (Main)', value: '20', unit: 'mm', remarks: 'Fe500D' },
    { item: 'Rebar Diameter (Stirrups)', value: '8', unit: 'mm', remarks: '' },
    { item: 'Concrete Cover', value: '40', unit: 'mm', remarks: 'Foundation' },
    { item: 'Setback Distance', value: '6.0', unit: 'meters', remarks: 'Front' },
  ],
  checklist: [
    { item: 'Foundation dimensions verified', status: 'pass', notes: 'Matches drawing' },
    { item: 'Rebar spacing checked', status: 'pass', notes: '200mm c/c' },
    { item: 'Concrete grade confirmed', status: 'pass', notes: 'M25' },
    { item: 'Plumbness of columns', status: 'pass', notes: '' },
    { item: 'Setback compliance', status: 'pass', notes: '6m front' },
    { item: 'Soil bearing capacity', status: 'pass', notes: '180 kN/m²' },
    { item: 'Water table level', status: 'na', notes: 'Not applicable' },
    { item: 'Seismic zone compliance', status: 'pass', notes: 'Zone IV' },
    { item: 'Fire safety provisions', status: 'fail', notes: 'Pending' },
    { item: 'Parking area verification', status: 'pass', notes: '42 spaces' },
  ],
  photos: [
    { title: 'Front Elevation', description: 'Main entrance view' },
    { title: 'Foundation Works', description: 'Basement level' },
    { title: 'Column Layout', description: 'Grid pattern' },
    { title: 'Rebar Detail', description: 'Connection detail' },
    { title: 'Site Overview', description: 'Aerial view' },
    { title: 'Material Storage', description: 'Cement bags' },
  ],
  risks: [
    {
      severity: 'high',
      description: 'Fire safety provisions not yet installed as per NBC 2016',
      mitigation: 'Install fire extinguishers and sprinkler system before occupancy',
    },
    {
      severity: 'medium',
      description: 'Minor cracks observed on east wall plaster',
      mitigation: 'Monitor for 30 days, apply structural repair if widening',
    },
    {
      severity: 'low',
      description: 'Landscaping pending in setback area',
      mitigation: 'Complete before final handover',
    },
  ],
  remarks:
    'The structural survey of Phoenix Tower indicates that the construction is progressing well with most parameters within acceptable limits. The fire safety compliance issue needs immediate attention. The foundation and superstructure are found to be in good condition with proper reinforcement as per approved drawings.',
  preparedBy: 'Raj Mehta, Site Engineer',
  approvedBy: 'Rajesh Kumar, Project Manager',
}

export default function GenerateReportPage() {
  const [reportType, setReportType] = useState('survey')
  const [project, setProject] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState('pdf')
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sectionOptions.map((s) => s.id)
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setIsGenerated(false)

    try {
      const pdfBytes = await generateSurveyReport(sampleData)
      downloadPdf(pdfBytes, `BuildSurvey_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
      setIsGenerated(true)
    } catch (error) {
      console.error('PDF generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Generate Report</h1>
        <p className="text-muted-foreground">Configure and generate professional survey reports.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                      reportType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      reportType === type.value ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project & Date Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Project</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections to Include */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Sections to Include</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedSections(
                      selectedSections.length === sectionOptions.length
                        ? []
                        : sectionOptions.map((s) => s.id)
                    )
                  }
                >
                  {selectedSections.length === sectionOptions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {sectionOptions.map((section) => (
                  <label
                    key={section.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedSections.includes(section.id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className={selectedSections.includes(section.id) ? 'text-blue-600' : 'text-gray-400'}>
                        {section.icon}
                      </span>
                      <span className="text-sm">{section.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !project}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : isGenerated ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Report Generated
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            {!project && (
              <p className="text-sm text-muted-foreground">Please select a project first</p>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview mockup */}
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="rounded bg-blue-900 p-3 text-center">
                    <p className="text-sm font-bold text-white">BuildSurvey Pro</p>
                    <p className="text-[10px] text-blue-200">Construction Site Survey Platform</p>
                  </div>

                  {/* Title */}
                  <div className="border-b pb-2">
                    <p className="text-sm font-bold text-gray-800">
                      {reportTypes.find((t) => t.value === reportType)?.label || 'Survey Report'}
                    </p>
                    <p className="text-[10px] text-gray-500">Report ID: SRV-2026-000142</p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-2">
                    {selectedSections.includes('project') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">PROJECT DETAILS</p>
                        <p className="text-[9px] text-gray-600">Client: Meridian Constructions</p>
                      </div>
                    )}
                    {selectedSections.includes('location') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">GPS LOCATION</p>
                        <p className="text-[9px] text-gray-600">22.5726° N, 88.3639° E</p>
                      </div>
                    )}
                    {selectedSections.includes('measurements') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">MEASUREMENTS</p>
                        <div className="mt-1 space-y-0.5">
                          <div className="flex justify-between text-[8px] text-gray-600">
                            <span>Foundation Width</span>
                            <span className="font-semibold">3.5 m</span>
                          </div>
                          <div className="flex justify-between text-[8px] text-gray-600">
                            <span>Column Height</span>
                            <span className="font-semibold">3.2 m</span>
                          </div>
                          <div className="flex justify-between text-[8px] text-gray-600">
                            <span>Slab Thickness</span>
                            <span className="font-semibold">150 mm</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSections.includes('checklist') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">CHECKLIST</p>
                        <div className="mt-1 space-y-0.5">
                          <div className="flex items-center gap-1 text-[8px]">
                            <span className="text-green-600">✓</span>
                            <span className="text-gray-600">Foundation verified</span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px]">
                            <span className="text-green-600">✓</span>
                            <span className="text-gray-600">Rebar spacing OK</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSections.includes('risks') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">RISK ASSESSMENT</p>
                        <div className="mt-1 space-y-0.5">
                          <div className="flex items-center gap-1 text-[8px]">
                            <span className="text-red-500 font-bold">HIGH</span>
                            <span className="text-gray-600">Fire safety pending</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSections.includes('signatures') && (
                      <div className="rounded border p-2">
                        <p className="text-[10px] font-semibold text-blue-800">SIGNATURES</p>
                        <div className="mt-1 flex justify-between">
                          <div>
                            <div className="h-4 border-b border-dashed border-gray-300 w-16" />
                            <p className="text-[7px] text-gray-500 mt-0.5">Prepared By</p>
                          </div>
                          <div>
                            <div className="h-4 border-b border-dashed border-gray-300 w-16" />
                            <p className="text-[7px] text-gray-500 mt-0.5">Approved By</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-2 text-center">
                    <p className="text-[8px] text-gray-400">Page 1 of 4</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-800">Selected Sections</p>
                <p className="text-xs text-blue-600">
                  {selectedSections.length} of {sectionOptions.length} sections included
                </p>
              </div>

              {isGenerated && (
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-800">Report Ready</p>
                  <p className="text-xs text-emerald-600">
                    PDF has been generated and download started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
