'use client'

import { useState } from 'react'
import { BookOpen, Search, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const sections = [
  { id: 'overview', title: 'Welcome & Overview', icon: '👋' },
  { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
  { id: 'dashboard', title: 'Dashboard', icon: '📊' },
  { id: 'crm', title: 'CRM — Leads & Clients', icon: '🤝' },
  { id: 'projects', title: 'Projects', icon: '📁' },
  { id: 'surveys', title: 'Survey & Field', icon: '📋' },
  { id: 'finance', title: 'Finance Module', icon: '💰' },
  { id: 'media', title: 'Media & Documents', icon: '📸' },
  { id: 'risk', title: 'Risk & Materials', icon: '⚠️' },
  { id: 'workflow', title: 'Workflow & Signatures', icon: '🔄' },
  { id: 'communication', title: 'Communication', icon: '💬' },
  { id: 'reports', title: 'Reports & Analytics', icon: '📈' },
  { id: 'admin', title: 'Administration', icon: '⚙️' },
  { id: 'ai', title: 'AI Features', icon: '🤖' },
  { id: 'glossary', title: 'Glossary', icon: '📖' },
]

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Manual</h1>
            <p className="text-sm text-muted-foreground">BuildSurvey Pro v1.0 — Complete guide</p>
          </div>
        </div>
        <Badge variant="info" className="w-fit">959 lines · 17 sections</Badge>
      </div>

      <div className="flex gap-6">
        {/* Left: Table of Contents */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Section Links */}
            <nav className="space-y-0.5">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    activeSection === section.id
                      ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <span className="text-base">{section.icon}</span>
                  <span className="truncate">{section.title}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile TOC */}
          <div className="mb-6 lg:hidden">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.icon} {s.title}</option>
              ))}
            </select>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {activeSection === 'overview' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Welcome & Overview</h2>
                    <p className="text-muted-foreground">
                      BuildSurvey Pro is an all-in-one construction site survey and project management platform designed for the Indian construction industry.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { title: 'CRM', desc: 'Track leads, convert to clients' },
                        { title: 'Projects', desc: 'Manage budgets, timelines, teams' },
                        { title: 'Site Surveys', desc: '7-step wizard with checklists, GPS, media' },
                        { title: 'BOQ & Finance', desc: 'Bill of Quantities, quotations with GST' },
                        { title: 'Media', desc: 'Photos, videos, voice notes, sketches' },
                        { title: 'Risk Assessment', desc: 'Identify and mitigate project risks' },
                        { title: 'Workflows', desc: 'Visual approval chains' },
                        { title: 'Reports', desc: 'PDF generation with customizable sections' },
                        { title: 'AI Features', desc: 'OCR scanning, risk prediction' },
                        { title: 'Offline Support', desc: 'Work without internet, sync later' },
                      ].map((f) => (
                        <div key={f.title} className="flex items-start gap-2 rounded-lg border border-border p-3">
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{f.title}</p>
                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'getting-started' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Getting Started</h2>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Login</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Open the app in your browser</li>
                      <li>Enter your <strong className="text-foreground">Email Address</strong> and <strong className="text-foreground">Password</strong></li>
                      <li>Check <strong className="text-foreground">Remember Me</strong> to stay logged in</li>
                      <li>Click <strong className="text-foreground">Sign In</strong></li>
                    </ol>
                    <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                      <p className="font-medium text-foreground">Demo Login:</p>
                      <p className="text-muted-foreground">Email: <code className="bg-background px-1 rounded">admin@buildsurvey.com</code></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Theme Toggle</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the <strong className="text-foreground">moon/sun icon</strong> in the top header (between Search and Bell) to switch between Light and Dark mode. Your preference is saved automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'dashboard' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
                  <p className="text-muted-foreground">Your home screen showing a real-time overview of your business.</p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">KPI Cards</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-2 text-left font-medium text-foreground">Card</th>
                            <th className="pb-2 text-left font-medium text-foreground">What It Shows</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Active Projects</td><td>Projects currently in progress</td></tr>
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Pending Surveys</td><td>Surveys scheduled but not completed</td></tr>
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Revenue This Month</td><td>Total revenue (₹ Lakhs)</td></tr>
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">BOQ Pending</td><td>Pending Bill of Quantities value</td></tr>
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Approvals Pending</td><td>Items waiting for approval</td></tr>
                          <tr><td className="py-2 font-medium text-foreground">Engineers Online</td><td>Active engineers out of total</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">New Survey</Badge>
                      <Badge variant="info">New Project</Badge>
                      <Badge variant="outline">Create Quotation</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'crm' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">CRM — Leads & Clients</h2>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Creating a Lead (3 Steps)</h3>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 1: Contact Information</p>
                        <p className="text-xs text-muted-foreground mt-1">Full Name, Email, Phone (min 10 digits), Company, Website</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 2: Lead Details</p>
                        <p className="text-xs text-muted-foreground mt-1">Source (Website/Referral/LinkedIn/Cold Call/etc.), Status, Priority, Estimated Value (INR), Notes</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 3: Assignment</p>
                        <p className="text-xs text-muted-foreground mt-1">Assign To (team member), Next Follow-up Date</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Lead Status Workflow</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'].map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant="info">{s}</Badge>
                          {i < 5 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Client Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Real Estate Developer', 'Construction Company', 'Government Body', 'Infrastructure Developer', 'Industrial Client', 'Institutional Client', 'Individual Client'].map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'projects' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Projects</h2>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Creating a Project (4 Steps)</h3>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 1: Basic Info</p>
                        <p className="text-xs text-muted-foreground mt-1">Project Name, Code (auto: PRJ-YYYY-NNN), Description, Type (Residential/Commercial/Infrastructure/etc.), Client</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 2: Location</p>
                        <p className="text-xs text-muted-foreground mt-1">Address, City, State (30 Indian states), GPS coordinates, Area, Floors</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 3: Financial</p>
                        <p className="text-xs text-muted-foreground mt-1">Budget (INR), Estimated Cost, Start Date, End Date</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">Step 4: Assignment</p>
                        <p className="text-xs text-muted-foreground mt-1">Project Manager, Team Members (multi-select), Notes</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Project Statuses</h3>
                    <div className="flex flex-wrap gap-2">
                      {['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map((s) => (
                        <Badge key={s} variant="info">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'surveys' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Survey & Field Module</h2>
                  <p className="text-muted-foreground">The core module — a 7-step guided survey wizard.</p>

                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Project Selection', fields: 'Project, Survey Type (Initial/Detailed/Follow-up/Final/As-Built), Title, Description' },
                      { step: 2, title: 'Schedule & Assignment', fields: 'Scheduled Date, Duration, Assign Engineer, Priority (Low/Medium/High/Critical)' },
                      { step: 3, title: 'Site Information', fields: 'GPS Location, Weather, Site Condition, Building Type, Construction Stage, Floors, Road Width, Boundary, Parking' },
                      { step: 4, title: 'Infrastructure', fields: 'Electricity (type/load), Water (source), Drainage (type), Fire Safety (extinguishers/sprinklers/alarm), Structure Rating (1-5 stars)' },
                      { step: 5, title: 'Checklist', fields: 'Structural (5 items), Electrical (4 items), Plumbing (3 items), Safety (3 items), Environmental (3 items) — add custom items' },
                      { step: 6, title: 'Media & Docs', fields: 'Photos (JPEG/PNG/WebP), Videos (MP4/AVI), Voice Notes (recorder), Documents (PDF/DOC/XLS)' },
                      { step: 7, title: 'Review & Submit', fields: 'Summary review, Digital Signature, Save Draft or Submit' },
                    ].map((s) => (
                      <div key={s.step} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                          {s.step}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.fields}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'finance' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Finance Module</h2>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">BOQ — Bill of Quantities</h3>
                    <p className="text-sm text-muted-foreground mb-3">Itemized list of construction work with quantities and rates.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-2 text-left font-medium text-foreground">Field</th>
                            <th className="pb-2 text-left font-medium text-foreground">Options</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Category</td><td>Earthwork, Concrete, Masonry, Finishing, Plumbing, Electrical, HVAC</td></tr>
                          <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Unit</td><td>Cum, Sqm, Rmt, Nos, Set, Mtr, Bags, Tonnes</td></tr>
                          <tr><td className="py-2 font-medium text-foreground">GST</td><td>18% auto-applied on grand total</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Quotations (4 Steps)</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Step 1:</strong> Project, Title, Description</p>
                      <p><strong className="text-foreground">Step 2:</strong> Line Items (Description, Unit, Qty, Rate → Amount auto-calc)</p>
                      <p><strong className="text-foreground">Step 3:</strong> GST (5%/12%/18%/28%), Discount %, Terms & Conditions</p>
                      <p><strong className="text-foreground">Step 4:</strong> Review preview, Save Draft or Send</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'media' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Media & Documents</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-left font-medium text-foreground">Type</th>
                          <th className="pb-2 text-left font-medium text-foreground">Formats</th>
                          <th className="pb-2 text-left font-medium text-foreground">Max Size</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Photos</td><td>JPEG, JPG, PNG, WebP, HEIC, HEIF</td><td>50 MB</td></tr>
                        <tr className="border-b border-border/50"><td className="py-2 font-medium text-foreground">Videos</td><td>MP4, QuickTime, AVI, WebM, Matroska</td><td>50 MB</td></tr>
                        <tr><td className="py-2 font-medium text-foreground">Documents</td><td>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV</td><td>50 MB</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'risk' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Risk Assessment & Materials</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Risk Levels</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">Low</Badge>
                      <Badge variant="warning">Medium</Badge>
                      <Badge className="bg-orange-100 text-orange-800">High</Badge>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Risk Fields</h3>
                    <p className="text-sm text-muted-foreground">Title, Description, Severity Level, Mitigation Plan, Linked Survey, Identified By</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'workflow' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Workflow & Digital Signatures</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Workflow Step Types</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { type: 'Approval', desc: 'Requires someone to approve', color: 'bg-blue-100 text-blue-700' },
                        { type: 'Review', desc: 'Examine and provide feedback', color: 'bg-violet-100 text-violet-700' },
                        { type: 'Notification', desc: 'Send notification to stakeholders', color: 'bg-amber-100 text-amber-700' },
                        { type: 'Condition', desc: 'Conditional branch', color: 'bg-emerald-100 text-emerald-700' },
                        { type: 'Parallel', desc: 'Execute simultaneously', color: 'bg-pink-100 text-pink-700' },
                      ].map((s) => (
                        <div key={s.type} className="flex items-center gap-2 rounded-lg border border-border p-3">
                          <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', s.color)}>{s.type}</span>
                          <span className="text-xs text-muted-foreground">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Digital Signatures</h3>
                    <p className="text-sm text-muted-foreground">Draw with mouse/finger, type in signature font, or upload an image.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'communication' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Communication</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Notification Types</h3>
                    <div className="flex gap-2">
                      <Badge variant="info">INFO</Badge>
                      <Badge variant="success">SUCCESS</Badge>
                      <Badge variant="warning">WARNING</Badge>
                      <Badge variant="destructive">ERROR</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Email and WhatsApp integration for client and team communication.</p>
                </CardContent>
              </Card>
            )}

            {activeSection === 'reports' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Reports & Analytics</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Report Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Survey Report', 'Project Report', 'BOQ Report', 'Financial Report', 'Daily Report'].map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Report Sections</h3>
                    <p className="text-sm text-muted-foreground">Header, Project Details, GPS Location, Measurements, Checklist, Photos, Risks, Remarks, Signatures — all customizable.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'admin' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Administration</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">User Roles</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { role: 'Super Admin', access: 'Full system access' },
                        { role: 'Admin', access: 'Most features, no system settings' },
                        { role: 'Manager', access: 'Projects, surveys, team management' },
                        { role: 'Engineer', access: 'Assigned projects and surveys' },
                        { role: 'Surveyor', access: 'Survey execution, checklists, media' },
                        { role: 'Client', access: 'View-only their projects' },
                        { role: 'Accountant', access: 'Finance, BOQ, quotations' },
                      ].map((r) => (
                        <div key={r.role} className="flex items-center justify-between rounded-lg border border-border p-2">
                          <span className="text-sm font-medium text-foreground">{r.role}</span>
                          <span className="text-xs text-muted-foreground">{r.access}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'ai' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">AI Features</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'OCR Scanner', desc: 'Extract text from construction documents' },
                      { title: 'Image Analysis', desc: 'AI analysis of site photos' },
                      { title: 'Risk Prediction', desc: 'Predict risks from historical data' },
                      { title: 'Smart Scheduling', desc: 'AI-optimized survey scheduling' },
                      { title: 'Cost Prediction', desc: 'Estimate costs from parameters' },
                      { title: 'Quality Assessment', desc: 'Evaluate construction quality' },
                    ].map((f) => (
                      <div key={f.title} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">{f.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'glossary' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Glossary</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-left font-medium text-foreground">Term</th>
                          <th className="pb-2 text-left font-medium text-foreground">Definition</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {[
                          ['BOQ', 'Bill of Quantities — itemized construction work list'],
                          ['GST', 'Goods and Services Tax (5%/12%/18%/28%)'],
                          ['PAN', 'Permanent Account Number — 10-char Indian tax ID'],
                          ['GSTIN', 'GST Identification Number — 15-char taxpayer number'],
                          ['GPS', 'Global Positioning System — location tracking'],
                          ['OCR', 'Optical Character Recognition — image to text'],
                          ['INR', 'Indian Rupee (₹)'],
                          ['Cum', 'Cubic Meter — volume measurement'],
                          ['Sqm', 'Square Meter — area measurement'],
                          ['Rmt', 'Running Meter — linear measurement'],
                          ['RCC', 'Reinforced Cement Concrete'],
                          ['PCC', 'Plain Cement Concrete'],
                          ['MEP', 'Mechanical, Electrical & Plumbing'],
                        ].map(([term, def]) => (
                          <tr key={term} className="border-b border-border/50">
                            <td className="py-2 font-medium text-foreground">{term}</td>
                            <td>{def}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
