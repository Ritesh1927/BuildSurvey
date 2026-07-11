"use client"

import { useState } from "react"
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Wifi,
  WifiOff,
  Paperclip,
  Smile,
  User,
  FileText,
  Phone,
  MoreVertical,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  LayoutTemplate,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ChatMessage {
  id: string
  sender: string
  senderNumber: string
  message: string
  timestamp: string
  status: "sent" | "delivered" | "read" | "failed"
  direction: "incoming" | "outgoing"
}

interface QuickMessage {
  id: string
  name: string
  message: string
  category: string
}

interface MessageLog {
  id: string
  recipient: string
  recipientName: string
  template: string
  message: string
  status: "sent" | "delivered" | "read" | "failed"
  sentAt: string
  deliveredAt?: string
}

const chatMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "Raj Mehta",
    senderNumber: "+91 98765 43210",
    message: "Good morning! Just reached the Phoenix Tower site. Starting foundation survey now.",
    timestamp: "2026-07-11T08:00:00Z",
    status: "read",
    direction: "incoming",
  },
  {
    id: "2",
    sender: "You",
    senderNumber: "+91 98765 43210",
    message: "Great! Please ensure you capture GPS coordinates for all grid points. Stay safe!",
    timestamp: "2026-07-11T08:05:00Z",
    status: "read",
    direction: "outgoing",
  },
  {
    id: "3",
    sender: "Raj Mehta",
    senderNumber: "+91 98765 43210",
    message: "Will do. Also, the client representative is here and wants to know if we can do an additional soil test in the eastern corner.",
    timestamp: "2026-07-11T08:15:00Z",
    status: "read",
    direction: "incoming",
  },
  {
    id: "4",
    sender: "You",
    senderNumber: "+91 98765 43210",
    message: "Sure, go ahead with the additional test. I'll update the BOQ accordingly. Please share photos once done.",
    timestamp: "2026-07-11T08:20:00Z",
    status: "delivered",
    direction: "outgoing",
  },
  {
    id: "5",
    sender: "Neha Gupta",
    senderNumber: "+91 87654 32109",
    message: "Hi, the cement delivery for Sunrise Enclave has been delayed. Transport issue from the depot.",
    timestamp: "2026-07-11T09:00:00Z",
    status: "read",
    direction: "incoming",
  },
  {
    id: "6",
    sender: "You",
    senderNumber: "+91 87654 32109",
    message: "Thanks for the update. Please check with Alternative Cement Suppliers - they might have stock. Let me know the revised ETA.",
    timestamp: "2026-07-11T09:10:00Z",
    status: "sent",
    direction: "outgoing",
  },
]

const quickMessages: QuickMessage[] = [
  {
    id: "1",
    name: "Daily Update Request",
    message: "Hi {{name}}, please share today's progress update for {{project}}.",
    category: "Progress",
  },
  {
    id: "2",
    name: "Meeting Reminder",
    message: "Reminder: Team meeting scheduled for {{date}} at {{time}}. Please confirm attendance.",
    category: "Meetings",
  },
  {
    id: "3",
    name: "Payment Due",
    message: "Dear {{name}}, this is a reminder that Invoice {{invoice_no}} for ₹{{amount}} is due on {{date}}.",
    category: "Finance",
  },
  {
    id: "4",
    name: "Site Visit Scheduled",
    message: "Hi {{name}}, site visit for {{project}} is scheduled on {{date}}. Please ensure all documents are ready.",
    category: "Site Visit",
  },
  {
    id: "5",
    name: "Document Shared",
    message: "Hi {{name}}, please find attached the {{document_type}} for {{project}}. Kindly review and acknowledge.",
    category: "Documents",
  },
  {
    id: "6",
    name: "Safety Alert",
    message: "URGENT: Safety advisory for all site personnel. {{message}}. Please follow all safety protocols.",
    category: "Safety",
  },
]

const messageLogs: MessageLog[] = [
  {
    id: "1",
    recipient: "+91 98765 43210",
    recipientName: "Raj Mehta",
    template: "Daily Update Request",
    message: "Hi Raj, please share today's progress update for Phoenix Tower.",
    status: "delivered",
    sentAt: "2026-07-11T08:00:00Z",
    deliveredAt: "2026-07-11T08:00:02Z",
  },
  {
    id: "2",
    recipient: "+91 87654 32109",
    recipientName: "Neha Gupta",
    template: "Payment Due",
    message: "Dear Neha, this is a reminder that Invoice INV-2026-0812 for ₹4,25,000 is due on 15 Jul 2026.",
    status: "read",
    sentAt: "2026-07-10T10:00:00Z",
    deliveredAt: "2026-07-10T10:00:03Z",
  },
  {
    id: "3",
    recipient: "+91 76543 21098",
    recipientName: "Vikram Desai",
    template: "Site Visit Scheduled",
    message: "Hi Vikram, site visit for Greenfield Estates is scheduled on 12 Jul 2026.",
    status: "delivered",
    sentAt: "2026-07-09T16:30:00Z",
    deliveredAt: "2026-07-09T16:30:01Z",
  },
  {
    id: "4",
    recipient: "+91 65432 10987",
    recipientName: "Amit Kumar",
    template: "Safety Alert",
    message: "URGENT: Safety advisory for all site personnel. Heavy rain expected tomorrow. Ensure proper drainage.",
    status: "read",
    sentAt: "2026-07-09T09:00:00Z",
    deliveredAt: "2026-07-09T09:00:02Z",
  },
  {
    id: "5",
    recipient: "+91 98765 43210",
    recipientName: "Raj Mehta",
    template: "Document Shared",
    message: "Hi Raj, please find attached the BOQ for Metro Residency Phase 2.",
    status: "failed",
    sentAt: "2026-07-08T14:00:00Z",
  },
]

const statusConfig = {
  sent: { icon: <CheckCircle className="h-3 w-3 text-gray-400" />, color: "text-gray-500" },
  delivered: { icon: <CheckCircle className="h-3 w-3 text-blue-500" />, color: "text-blue-500" },
  read: { icon: <CheckCircle className="h-3 w-3 text-blue-500" />, color: "text-blue-500" },
  failed: { icon: <AlertTriangle className="h-3 w-3 text-red-500" />, color: "text-red-500" },
}

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [isConnected] = useState(true)
  const [messageText, setMessageText] = useState("")
  const [recipientNumber, setRecipientNumber] = useState("")
  const [selectedLayoutTemplate, setSelectedLayoutTemplate] = useState("")
  const [templateVariables, setLayoutTemplateVariables] = useState<Record<string, string>>({})

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Integration"
        description="Communicate with clients and team members via WhatsApp"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "WhatsApp" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-emerald-500" />
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">Connected</Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <Badge className="bg-red-100 text-red-800 text-xs">Disconnected</Badge>
                </>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              API Config
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="quick-messages" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Quick Messages
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Message
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Contacts Sidebar */}
            <Card className="lg:col-span-1">
              <CardContent className="p-0">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search contacts..." className="pl-8 h-8" />
                  </div>
                </div>
                <div className="divide-y">
                  {[
                    { name: "Raj Mehta", phone: "+91 98765 43210", lastMsg: "Will do. Also, the client...", time: "8:15 AM", unread: 1 },
                    { name: "Neha Gupta", phone: "+91 87654 32109", lastMsg: "Hi, the cement delivery...", time: "9:00 AM", unread: 1 },
                    { name: "Vikram Desai", phone: "+91 76543 21098", lastMsg: "Meeting minutes attached", time: "Yesterday", unread: 0 },
                    { name: "Amit Kumar", phone: "+91 65432 10987", lastMsg: "Site photos uploaded", time: "Yesterday", unread: 0 },
                    { name: "Priya Nair", phone: "+91 54321 09876", lastMsg: "Report reviewed", time: "Jul 9", unread: 0 },
                  ].map((contact, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                        i === 0 && "bg-muted/30"
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {contact.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          <span className="text-xs text-muted-foreground">{contact.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">{contact.lastMsg}</p>
                          {contact.unread > 0 && (
                            <Badge className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                              {contact.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    RM
                  </div>
                  <div>
                    <p className="font-semibold">Raj Mehta</p>
                    <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/20">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.direction === "outgoing" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-xl px-4 py-2",
                          msg.direction === "outgoing"
                            ? "bg-primary text-primary-foreground"
                            : "bg-white border shadow-sm"
                        )}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 mt-1",
                            msg.direction === "outgoing"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span className="text-[10px]">
                            {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.direction === "outgoing" && (
                            <CheckCircle
                              className={cn(
                                "h-3 w-3",
                                msg.status === "read"
                                  ? "text-blue-200"
                                  : msg.status === "delivered"
                                    ? "text-primary-foreground/50"
                                    : "text-primary-foreground/30"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Messages Tab */}
        <TabsContent value="quick-messages">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickMessages.map((qm) => (
              <Card key={qm.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {qm.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold">{qm.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {qm.message}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    <Send className="mr-2 h-3 w-3" />
                    Use LayoutTemplate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Send Message Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send WhatsApp Message</CardTitle>
              <CardDescription>Send a message to any WhatsApp number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Number</label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={recipientNumber}
                    onChange={(e) => setRecipientNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Use LayoutTemplate (Optional)</label>
                  <Select value={selectedLayoutTemplate} onValueChange={setSelectedLayoutTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {quickMessages.map((qm) => (
                        <SelectItem key={qm.id} value={qm.id}>
                          {qm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedLayoutTemplate && (
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-medium">LayoutTemplate Variables</h4>
                  <p className="text-xs text-muted-foreground">
                    Fill in the template variables below
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {quickMessages
                      .find((qm) => qm.id === selectedLayoutTemplate)
                      ?.message.match(/\{\{(\w+)\}\}/g)
                      ?.map((variable) => {
                        const varName = variable.replace(/[{}]/g, "")
                        return (
                          <div key={varName} className="space-y-1">
                            <label className="text-xs font-medium capitalize">
                              {varName.replace(/_/g, " ")}
                            </label>
                            <Input
                              placeholder={`Enter ${varName.replace(/_/g, " ")}`}
                              value={templateVariables[varName] || ""}
                              onChange={(e) =>
                                setLayoutTemplateVariables((prev) => ({
                                  ...prev,
                                  [varName]: e.target.value,
                                }))
                              }
                              className="h-8"
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your WhatsApp message here..."
                  className="min-h-[150px]"
                  value={
                    selectedLayoutTemplate
                      ? quickMessages
                          .find((qm) => qm.id === selectedLayoutTemplate)
                          ?.message.replace(/\{\{(\w+)\}\}/g, (_, key) =>
                            templateVariables[key] || `{{${key}}}`
                          ) || messageText
                      : messageText
                  }
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {messageText.length} characters
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach
                  </Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Message History</CardTitle>
                <CardDescription>All sent WhatsApp messages and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>LayoutTemplate</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messageLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.recipientName}</p>
                            <p className="text-xs text-muted-foreground">{log.recipient}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.template}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {statusConfig[log.status as keyof typeof statusConfig].icon}
                            <span className={cn(
                              "text-xs capitalize",
                              statusConfig[log.status as keyof typeof statusConfig].color
                            )}>
                              {log.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Copy className="h-4 w-4" />
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
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>WhatsApp Business API settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Endpoint</label>
                  <Input
                    value="https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number ID</label>
                  <Input type="password" value="1234567890123456" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Token</label>
                  <Input type="password" value="EAAxZCZA...truncated" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Business Account ID</label>
                  <Input type="password" value="9876543210987654" />
                </div>
                <Button variant="outline" className="w-full">
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Current connection and usage status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Status</span>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <Wifi className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages Sent Today</span>
                  <span className="text-sm font-medium">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages Delivered</span>
                  <span className="text-sm font-medium">138</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Rate</span>
                  <span className="text-sm font-medium text-emerald-600">97.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed Messages</span>
                  <span className="text-sm font-medium text-red-600">4</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Quota Used</span>
                  <span className="text-sm font-medium">3,247 / 10,000</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>32.5%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "32.5%" }}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-Reply</span>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically reply to incoming messages during off-hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
