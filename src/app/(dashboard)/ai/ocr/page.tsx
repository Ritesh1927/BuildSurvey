"use client"

import { useState } from "react"
import {
  FileScan,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  FileText,
  Image as ImageIcon,
  Copy,
  RefreshCw,
  Search,
  Filter,
  Edit3,
  Save,
  Link2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OcrResult {
  id: string
  documentName: string
  documentType: string
  status: "completed" | "processing" | "failed" | "pending"
  confidence: number
  processedDate: string
  extractedFields: number
  fileType: string
  fileSize: string
}

interface ExtractedData {
  fieldName: string
  value: string
  confidence: number
}

const ocrResults: OcrResult[] = [
  {
    id: "1",
    documentName: "INV-2026-0847_Cement_Invoice.pdf",
    documentType: "Invoice",
    status: "completed",
    confidence: 96.5,
    processedDate: "2026-07-11T08:30:00Z",
    extractedFields: 14,
    fileType: "pdf",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    documentName: "QUO-2026-0234_Steel_Quotation.pdf",
    documentType: "Quotation",
    status: "completed",
    confidence: 94.2,
    processedDate: "2026-07-10T16:45:00Z",
    extractedFields: 18,
    fileType: "pdf",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    documentName: "Drawing_Structural_Floor_Plan.png",
    documentType: "Drawing",
    status: "completed",
    confidence: 87.3,
    processedDate: "2026-07-10T14:20:00Z",
    extractedFields: 8,
    fileType: "image",
    fileSize: "5.6 MB",
  },
  {
    id: "4",
    documentName: "CTR-2026-0089_Client_Contract.pdf",
    documentType: "Contract",
    status: "completed",
    confidence: 98.1,
    processedDate: "2026-07-09T11:00:00Z",
    extractedFields: 22,
    fileType: "pdf",
    fileSize: "3.2 MB",
  },
  {
    id: "5",
    documentName: "BOQ-2026-0045_Material_BOQ.xlsx",
    documentType: "Bill of Quantities",
    status: "completed",
    confidence: 91.8,
    processedDate: "2026-07-09T09:30:00Z",
    extractedFields: 32,
    fileType: "spreadsheet",
    fileSize: "890 KB",
  },
  {
    id: "6",
    documentName: "Site_Photo_2026-07-08_Morning.jpg",
    documentType: "Photo",
    status: "completed",
    confidence: 82.5,
    processedDate: "2026-07-08T07:15:00Z",
    extractedFields: 5,
    fileType: "image",
    fileSize: "4.1 MB",
  },
  {
    id: "7",
    documentName: "Payment_Receipt_PR-2026-156.pdf",
    documentType: "Payment Receipt",
    status: "completed",
    confidence: 97.3,
    processedDate: "2026-07-08T15:00:00Z",
    extractedFields: 12,
    fileType: "pdf",
    fileSize: "1.2 MB",
  },
  {
    id: "8",
    documentName: "MTR-2026-0321_Cube_Test_Report.pdf",
    documentType: "Material Test Report",
    status: "completed",
    confidence: 93.6,
    processedDate: "2026-07-07T13:45:00Z",
    extractedFields: 16,
    fileType: "pdf",
    fileSize: "1.5 MB",
  },
  {
    id: "9",
    documentName: "Meeting_Minutes_2026-07-07.pdf",
    documentType: "Meeting Minutes",
    status: "failed",
    confidence: 0,
    processedDate: "2026-07-07T10:00:00Z",
    extractedFields: 0,
    fileType: "pdf",
    fileSize: "2.8 MB",
  },
  {
    id: "10",
    documentName: "Safety_Checklist_July_2026.png",
    documentType: "Safety Checklist",
    status: "processing",
    confidence: 0,
    processedDate: "2026-07-11T09:00:00Z",
    extractedFields: 0,
    fileType: "image",
    fileSize: "3.3 MB",
  },
]

const mockExtractedData: ExtractedData[] = [
  { fieldName: "Invoice Number", value: "INV-2026-0847", confidence: 99.2 },
  { fieldName: "Invoice Date", value: "08 Jul 2026", confidence: 98.5 },
  { fieldName: "Supplier Name", value: "UltraTech Cement Ltd.", confidence: 97.8 },
  { fieldName: "Supplier GSTIN", value: "27AABCU9999N1Z5", confidence: 96.1 },
  { fieldName: "Item Description", value: "OPC 53 Grade Cement", confidence: 95.4 },
  { fieldName: "Quantity", value: "500 Bags", confidence: 94.8 },
  { fieldName: "Unit Price", value: "₹385.00", confidence: 93.2 },
  { fieldName: "Total Amount", value: "₹19,25,000.00", confidence: 97.6 },
  { fieldName: "CGST (9%)", value: "₹1,73,250.00", confidence: 96.8 },
  { fieldName: "SGST (9%)", value: "₹1,73,250.00", confidence: 96.8 },
  { fieldName: "Grand Total", value: "₹22,71,500.00", confidence: 98.1 },
  { fieldName: "Delivery Address", value: "Site: Sunrise Enclave, Andheri East", confidence: 91.3 },
  { fieldName: "Payment Terms", value: "Net 30 Days", confidence: 89.7 },
  { fieldName: "PO Number", value: "PO-2026-0456", confidence: 94.5 },
]

export default function OcrPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedResult, setSelectedResult] = useState<OcrResult | null>(null)
  const [showExtractedData, setShowExtractedData] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [extractedData, setExtractedData] = useState<ExtractedData[]>(mockExtractedData)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const filteredResults = ocrResults.filter((result) => {
    const matchesSearch =
      result.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.documentType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || result.documentType.toLowerCase().includes(typeFilter.toLowerCase())
    return matchesSearch && matchesType
  })

  const handleUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setIsProcessing(true)
          setTimeout(() => setIsProcessing(false), 3000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleViewData = (result: OcrResult) => {
    setSelectedResult(result)
    setShowExtractedData(true)
  }

  const handleSaveEdit = (index: number, value: string) => {
    setExtractedData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item))
    )
    setEditingIndex(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document OCR"
        description="Extract structured data from scanned documents using AI-powered OCR"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "AI Module", href: "/ai" },
          { label: "OCR" },
        ]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload images or PDFs for OCR processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                  isUploading
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onClick={!isUploading ? handleUpload : undefined}
              >
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </div>
                ) : isProcessing ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <Sparkles className="h-5 w-5 text-primary absolute -right-1 -bottom-1 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">Processing with AI...</p>
                    <p className="text-xs text-muted-foreground">
                      Extracting text and structured data
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Drag & drop files here, or click to select
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supports JPG, PNG, PDF (Max 20MB)
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Supported Document Types</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["Invoice", "Quotation", "Contract", "Drawing", "BOQ", "Report", "Receipt", "Photo"].map(
                    (type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <h4 className="text-sm font-medium mb-2">OCR Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ensure documents are clear and well-lit</li>
                  <li>• Scan at 300 DPI or higher for best results</li>
                  <li>• Avoid skewed or rotated images</li>
                  <li>• PDF files yield better accuracy than images</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Processing Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OCR History</CardTitle>
                <CardDescription>Recently processed documents</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] h-8">
                    <Filter className="mr-1 h-3 w-3" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="quotation">Quotation</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="drawing">Drawing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                              {result.fileType === "pdf" ? (
                                <FileText className="h-4 w-4 text-red-500" />
                              ) : result.fileType === "image" ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <FileText className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">
                                {result.documentName}
                              </p>
                              <p className="text-xs text-muted-foreground">{result.fileSize}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {result.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs",
                              result.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : result.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : result.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {result.status === "completed" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {result.status === "processing" && (
                              <Clock className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            {result.status === "failed" && (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.status === "completed" ? (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={result.confidence}
                                className="w-16 h-1.5"
                              />
                              <span className="text-sm font-medium">
                                {result.confidence}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(result.processedDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {result.status === "completed" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewData(result)}
                                  title="View Extracted Data"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Link to System"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extracted Data Modal */}
      <Modal
        open={showExtractedData}
        onOpenChange={setShowExtractedData}
        title={`Extracted Data — ${selectedResult?.documentName || ""}`}
        description={`Document type: ${selectedResult?.documentType} | Confidence: ${selectedResult?.confidence}%`}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setShowExtractedData(false)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save to System
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Review and edit the extracted data below. Click on any value to correct OCR errors.
            </p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Extracted Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedData.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-sm">
                      {field.fieldName}
                    </TableCell>
                    <TableCell>
                      {editingIndex === index ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              handleSaveEdit(index, e.target.value)
                            }
                            className="h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingIndex(null)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm">{field.value}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            field.confidence >= 95
                              ? "bg-emerald-500"
                              : field.confidence >= 85
                                ? "bg-amber-500"
                                : "bg-red-500"
                          )}
                        />
                        <span className="text-sm">{field.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingIndex(index)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Save Target */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Save to Module</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select where to save this data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boq">Bill of Quantities (BOQ)</SelectItem>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="client">Client Record</SelectItem>
                <SelectItem value="invoice">Invoice Registry</SelectItem>
                <SelectItem value="project">Project Documents</SelectItem>
                <SelectItem value="materials">Material Register</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
