"use client"

import { useState } from "react"
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Plus,
  Search,
  Paperclip,
  Trash2,
  Reply,
  Forward,
  Star,
  Clock,
  CheckCircle,
  ChevronDown,
  Eye,
  MoreVertical,
  Filter,
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  Download,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Email {
  id: string
  from: string
  fromEmail: string
  to: string
  subject: string
  preview: string
  body: string
  date: string
  read: boolean
  starred: boolean
  hasAttachments: boolean
  attachments: string[]
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
}

const inboxEmails: Email[] = [
  {
    id: "1",
    from: "Priya Nair",
    fromEmail: "priya.nair@saurabhconstructions.com",
    to: "admin@saurabhconstructions.com",
    subject: "Re: Phoenix Tower - Foundation Survey Report",
    preview: "Hi, I've reviewed the foundation survey report and found some discrepancies in the soil test results...",
    body: "Hi,\n\nI've reviewed the foundation survey report and found some discrepancies in the soil test results from the eastern corner. The bearing capacity values seem lower than expected.\n\nCan we schedule a re-test before proceeding with the foundation work?\n\nRegards,\nPriya",
    date: "2026-07-11T09:30:00Z",
    read: false,
    starred: true,
    hasAttachments: true,
    attachments: ["survey_report_phoenix.pdf", "soil_test_data.xlsx"],
  },
  {
    id: "2",
    from: "Raj Mehta",
    fromEmail: "raj.mehta@saurabhconstructions.com",
    to: "admin@saurabhconstructions.com",
    subject: "Metro Residency - Weekly Progress Update",
    preview: "Weekly progress report for Metro Residency project. Construction has reached 3rd floor slab...",
    body: "Weekly progress report for Metro Residency project.\n\nConstruction has reached 3rd floor slab level. Following activities completed:\n1. 2nd floor slab casting - completed\n2. 3rd floor column reinforcement - 80% done\n3. External plastering - started on lower floors\n\nNext week plan:\n- 3rd floor slab casting\n- Continue plastering\n- Start MEP rough-in on lower floors\n\n Regards,\nRaj",
    date: "2026-07-11T08:15:00Z",
    read: false,
    starred: false,
    hasAttachments: true,
    attachments: ["weekly_report_metro.pdf"],
  },
  {
    id: "3",
    from: "Neha Gupta",
    fromEmail: "neha.gupta@saurabhconstructions.com",
    to: "admin@saurabhconstructions.com",
    subject: "Urgent: Material Delivery Delay - Sunrise Enclave",
    preview: "The cement supply from UltraTech has been delayed by 3 days due to transport issues...",
    body: "Hi,\n\nThe cement supply from UltraTech has been delayed by 3 days due to transport issues. This will impact our scheduled slab casting for Sunrise Enclave.\n\nPlease advise on alternative arrangements or schedule adjustments.\n\nRegards,\nNeha",
    date: "2026-07-10T17:45:00Z",
    read: true,
    starred: false,
    hasAttachments: false,
    attachments: [],
  },
  {
    id: "4",
    from: "Vikram Desai",
    fromEmail: "vikram.desai@saurabhconstructions.com",
    to: "admin@saurabhconstructions.com",
    subject: "Greenfield Estates - Client Meeting Minutes",
    preview: "Please find attached the minutes from today's client meeting at Greenfield Estates...",
    body: "Hi,\n\nPlease find attached the minutes from today's client meeting at Greenfield Estates.\n\nKey points discussed:\n1. Phase 2 timeline - client wants 2 month acceleration\n2. Landscaping design changes approved\n3. Additional parking structure request\n4. Final inspection scheduled for August 15\n\nPlease review and share your inputs.\n\nRegards,\nVikram",
    date: "2026-07-10T14:20:00Z",
    read: true,
    starred: true,
    hasAttachments: true,
    attachments: ["meeting_minutes_greenfield.pdf"],
  },
  {
    id: "5",
    from: "Accounts Dept",
    fromEmail: "accounts@saurabhconstructions.com",
    to: "admin@saurabhconstructions.com",
    subject: "Payment Received - Invoice INV-2026-0834",
    preview: "Payment of ₹8,50,000 received from Pacific Holdings Pvt. Ltd. for Invoice INV-2026-0834...",
    body: "Hi,\n\nPayment of ₹8,50,000 received from Pacific Holdings Pvt. Ltd. for Invoice INV-2026-0834.\n\nPayment details:\n- Invoice: INV-2026-0834\n- Amount: ₹8,50,000\n- Payment mode: NEFT\n- Reference: NEFT-2026-071001234\n- Date: 10 Jul 2026\n\nPlease update the records.\n\nRegards,\nAccounts Team",
    date: "2026-07-10T11:00:00Z",
    read: true,
    starred: false,
    hasAttachments: false,
    attachments: [],
  },
]

const sentEmails: Email[] = [
  {
    id: "s1",
    from: "You",
    fromEmail: "admin@saurabhconstructions.com",
    to: "priya.nair@saurabhconstructions.com",
    subject: "Phoenix Tower - Updated Survey Schedule",
    preview: "Hi Priya, Updated the survey schedule for Phoenix Tower. Please check the revised dates...",
    body: "Hi Priya,\n\nUpdated the survey schedule for Phoenix Tower. Please check the revised dates and confirm your availability.\n\nRegards,\nAdmin",
    date: "2026-07-11T07:00:00Z",
    read: true,
    starred: false,
    hasAttachments: true,
    attachments: ["survey_schedule_phoenix.xlsx"],
  },
  {
    id: "s2",
    from: "You",
    fromEmail: "admin@saurabhconstructions.com",
    to: "team@saurabhconstructions.com",
    subject: "Monthly Team Meeting - July 2026",
    preview: "Dear Team, Monthly meeting scheduled for July 15 at 10 AM. Agenda includes Q2 review...",
    body: "Dear Team,\n\nMonthly meeting scheduled for July 15 at 10 AM.\n\nAgenda:\n1. Q2 Performance Review\n2. New Project Updates\n3. Resource Planning\n4. Safety Protocols Review\n5. AOB\n\nPlease confirm your attendance.\n\nRegards,\nAdmin",
    date: "2026-07-09T10:00:00Z",
    read: true,
    starred: false,
    hasAttachments: false,
    attachments: [],
  },
  {
    id: "s3",
    from: "You",
    fromEmail: "admin@saurabhconstructions.com",
    to: "client@pacificgroup.com",
    subject: "Quotation - Pacific Holdings Phase 3",
    preview: "Dear Sir/Madam, Please find attached our quotation for the Phase 3 construction project...",
    body: "Dear Sir/Madam,\n\nPlease find attached our quotation for the Phase 3 construction project as per your requirements.\n\nQuotation No: QUO-2026-0289\nAmount: ₹4,25,00,000\nValid Till: 31 Jul 2026\n\nWe look forward to your positive response.\n\nRegards,\nSaurabh Constructions",
    date: "2026-07-08T16:30:00Z",
    read: true,
    starred: true,
    hasAttachments: true,
    attachments: ["QUO-2026-0289.pdf", "BOQ_Pacific_Phase3.xlsx"],
  },
]

const emailTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to CivilSite Pro - {{company_name}}",
    body: "Dear {{client_name}},\n\nWelcome to CivilSite Pro! We're excited to have you on board.\n\nYour account has been created successfully. You can now access your project dashboard at {{login_url}}.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nCivilSite Pro Team",
    category: "Onboarding",
  },
  {
    id: "2",
    name: "Survey Complete",
    subject: "Survey Completed - {{project_name}}",
    body: "Dear {{client_name}},\n\nWe are pleased to inform you that the {{survey_type}} survey for {{project_name}} has been completed.\n\nKey findings:\n- Total areas surveyed: {{area_count}}\n- Issues identified: {{issue_count}}\n- Overall status: {{status}}\n\nThe detailed report is attached for your review.\n\nBest regards,\n{{surveyor_name}}\nCivilSite Pro",
    category: "Project",
  },
  {
    id: "3",
    name: "Quotation Sent",
    subject: "Quotation - {{project_name}} - {{quotation_number}}",
    body: "Dear {{client_name}},\n\nThank you for your interest in our services. Please find attached our quotation for {{project_name}}.\n\nQuotation Number: {{quotation_number}}\nTotal Amount: {{amount}}\nValid Until: {{valid_date}}\n\nWe look forward to working with you.\n\nBest regards,\nSaurabh Constructions",
    category: "Sales",
  },
  {
    id: "4",
    name: "Payment Reminder",
    subject: "Payment Reminder - Invoice {{invoice_number}}",
    body: "Dear {{client_name}},\n\nThis is a gentle reminder that Invoice {{invoice_number}} for ₹{{amount}} is due on {{due_date}}.\n\nInvoice Details:\n- Invoice Number: {{invoice_number}}\n- Amount: ₹{{amount}}\n- Due Date: {{due_date}}\n- Days Overdue: {{days_overdue}}\n\nPlease process the payment at your earliest convenience.\n\nBest regards,\nAccounts Department\nCivilSite Pro",
    category: "Finance",
  },
]

const emailLogs = [
  { id: "1", to: "priya.nair@saurabhconstructions.com", subject: "Re: Phoenix Tower - Foundation Survey Report", status: "delivered", date: "2026-07-11T09:30:00Z", type: "inbox" },
  { id: "2", to: "raj.mehta@saurabhconstructions.com", subject: "Metro Residency - Weekly Progress Update", status: "delivered", date: "2026-07-11T08:15:00Z", type: "inbox" },
  { id: "3", to: "priya.nair@saurabhconstructions.com", subject: "Phoenix Tower - Updated Survey Schedule", status: "delivered", date: "2026-07-11T07:00:00Z", type: "sent" },
  { id: "4", to: "team@saurabhconstructions.com", subject: "Monthly Team Meeting - July 2026", status: "delivered", date: "2026-07-09T10:00:00Z", type: "sent" },
  { id: "5", to: "client@pacificgroup.com", subject: "Quotation - Pacific Holdings Phase 3", status: "delivered", date: "2026-07-08T16:30:00Z", type: "sent" },
]

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState("compose")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Management"
        description="Compose, manage, and track emails and templates"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Email" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Inbox className="mr-1 h-3 w-3" />
              2 unread
            </Badge>
            <Button size="sm" onClick={() => setActiveTab("compose")}>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            <Badge className="ml-1 text-[10px] px-1.5">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Create and send a new email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Enter email subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <div className="flex items-center gap-1 border rounded-t-md p-1 bg-muted">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Write your email here..."
                  className="min-h-[300px] rounded-t-none"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach Files
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inboxEmails.map((email) => (
                      <TableRow
                        key={email.id}
                        className={cn(
                          "cursor-pointer",
                          !email.read && "bg-blue-50/50"
                        )}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <TableCell>
                          <Star
                            className={cn(
                              "h-4 w-4",
                              email.starred
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={cn("text-sm", !email.read && "font-semibold")}>
                              {email.from}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {email.fromEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-sm", !email.read && "font-semibold")}>
                          {email.subject}
                          {email.hasAttachments && (
                            <Paperclip className="ml-1 inline h-3 w-3 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {email.preview}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          {!email.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Email Detail */}
          {selectedEmail && (
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{selectedEmail.subject}</CardTitle>
                  <CardDescription>
                    From: {selectedEmail.from} &lt;{selectedEmail.fromEmail}&gt;
                    <br />
                    Date: {new Date(selectedEmail.date).toLocaleString("en-IN")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Forward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {selectedEmail.body}
                  </pre>
                </div>
                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Separator />
                    <p className="text-sm font-medium">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-md border p-2"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="text-sm">{email.to}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {email.subject}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {email.preview}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(email.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Delivered
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid gap-4 sm:grid-cols-2">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Subject: {template.subject}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                    {template.body.substring(0, 150)}...
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>Track all email delivery status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">{log.to}</TableCell>
                        <TableCell className="text-sm">{log.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
