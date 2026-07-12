'use client'

import { useState } from 'react'
import { BookOpen, Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sections = [
  { id: 'overview', title: 'The Big Picture', icon: '1' },
  { id: 'leads', title: 'Step 1: Leads', icon: '2' },
  { id: 'clients', title: 'Step 2: Clients', icon: '3' },
  { id: 'projects', title: 'Step 3: Projects', icon: '4' },
  { id: 'surveys', title: 'Step 4: Surveys', icon: '5' },
  { id: 'boq', title: 'Step 5: BOQ', icon: '6' },
  { id: 'quotations', title: 'Step 6: Quotations', icon: '7' },
  { id: 'risk-materials', title: 'Step 7: Risk & Materials', icon: '8' },
  { id: 'media', title: 'Step 8: Media & Docs', icon: '9' },
  { id: 'workflow', title: 'Step 9: Workflow', icon: '10' },
  { id: 'reports', title: 'Step 10: Reports', icon: '11' },
  { id: 'comm', title: 'Communication', icon: '12' },
  { id: 'admin', title: 'Administration', icon: '13' },
  { id: 'ai', title: 'AI Features', icon: '14' },
  { id: 'flow', title: 'Flow Diagram', icon: '→' },
]

function FieldTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 text-left font-medium text-foreground">Field</th>
            <th className="pb-2 text-left font-medium text-foreground">What to Enter</th>
            <th className="pb-2 text-left font-medium text-foreground">Example</th>
            <th className="pb-2 text-left font-medium text-foreground">Why It Matters</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map(([field, what, example, why]) => (
            <tr key={field} className="border-b border-border/50">
              <td className="py-2 font-medium text-foreground">{field}</td>
              <td>{what}</td>
              <td><code className="bg-muted px-1 rounded text-xs">{example}</code></td>
              <td>{why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StepCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
        {step}
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  )
}

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
            <p className="text-sm text-muted-foreground">Read this once — you will know how to run your entire business</p>
          </div>
        </div>
        <Badge variant="info" className="w-fit">15 sections · Deep Guide</Badge>
      </div>

      <div className="flex gap-6">
        {/* Left: TOC */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-2">
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
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {section.icon}
                  </span>
                  <span className="truncate">{section.title}</span>
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
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* ============ CONTENT ============ */}
          <div className="space-y-8">

            {/* OVERVIEW */}
            {activeSection === 'overview' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">The Big Picture</h2>
                    <p className="text-muted-foreground">
                      This app manages the <strong className="text-foreground">entire life of a construction project</strong> — from the moment someone shows interest to project completion.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">The Business Flow (Memorize This):</p>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      {['LEAD', 'CLIENT', 'PROJECT', 'SURVEY', 'BOQ', 'QUOTATION', 'WORK', 'REPORT'].map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant="info">{s}</Badge>
                          {i < 7 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">In Simple Words:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li><strong className="text-foreground">Someone calls you</strong> → That&apos;s a <strong className="text-foreground">Lead</strong></li>
                      <li><strong className="text-foreground">You sign them up</strong> → That becomes a <strong className="text-foreground">Client</strong></li>
                      <li><strong className="text-foreground">You create a Project</strong> → That&apos;s a <strong className="text-foreground">Project</strong></li>
                      <li><strong className="text-foreground">Engineer visits the site</strong> → That&apos;s a <strong className="text-foreground">Survey</strong></li>
                      <li><strong className="text-foreground">You calculate costs</strong> → That&apos;s a <strong className="text-foreground">BOQ</strong></li>
                      <li><strong className="text-foreground">You send them a price</strong> → That&apos;s a <strong className="text-foreground">Quotation</strong></li>
                      <li><strong className="text-foreground">Work happens</strong> → Track risks, materials, documents</li>
                      <li><strong className="text-foreground">Reports & sign-offs</strong> → Project complete</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Who Uses What?</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { role: 'Sales/BD Team', modules: 'Leads, Clients, Quotations' },
                        { role: 'Project Manager', modules: 'Projects, Surveys, Workflows, Reports' },
                        { role: 'Site Engineer', modules: 'Surveys (field), Measurements, Photos, GPS' },
                        { role: 'Surveyor', modules: 'Survey execution, Checklists, Media capture' },
                        { role: 'Accountant', modules: 'BOQ, Quotations, Cost Estimation' },
                        { role: 'Admin', modules: 'Users, Roles, Settings, Masters' },
                      ].map((r) => (
                        <div key={r.role} className="flex items-center justify-between rounded-lg border border-border p-2">
                          <span className="text-sm font-medium text-foreground">{r.role}</span>
                          <span className="text-xs text-muted-foreground">{r.modules}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* LEADS */}
            {activeSection === 'leads' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 1: Get a Lead</h2>
                    <p className="text-sm text-muted-foreground">
                      A <strong className="text-foreground">Lead</strong> is anyone interested in hiring you.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
                    <p className="font-medium text-foreground">Real Example:</p>
                    <p className="text-muted-foreground mt-1">&quot;Rajesh Mehta from Sunrise Builders calls: We are starting a new project in Powai. Can you send a quote?&quot;</p>
                    <p className="mt-1 font-medium text-blue-600 dark:text-blue-400">That phone call = ONE LEAD</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">When to Create a Lead?</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Someone calls or emails asking about services</li>
                      <li>You get a business card at an event</li>
                      <li>Someone fills the &quot;Contact Us&quot; form on your website</li>
                      <li>An existing client refers someone</li>
                    </ul>
                  </div>

                  <StepCard step={1} title="Contact Information">
                    <FieldTable rows={[
                      ['Full Name', 'Contact person name', 'Rajesh Mehta', 'Who you will talk to'],
                      ['Email', 'Their email', 'rajesh@sunrisebuilders.com', 'For sending quotations'],
                      ['Phone', 'Mobile (min 10 digits)', '9876543210', 'Calls and WhatsApp'],
                      ['Company', 'Company name', 'Sunrise Builders Pvt. Ltd.', 'Identifies organization'],
                      ['Website', 'Company website', 'https://sunrisebuilders.com', 'Research the company'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Lead Details">
                    <FieldTable rows={[
                      ['Lead Source', 'How did they find you?', 'Referral', 'Which marketing channel works'],
                      ['Status', 'Current deal stage', 'NEW / CONTACTED / QUALIFIED', 'Tracks sales pipeline'],
                      ['Priority', 'How urgent?', 'HIGH', 'Focus on important deals'],
                      ['Estimated Value', 'Expected deal value in ₹', '500000', 'Revenue forecasting'],
                      ['Notes', 'Extra info', 'Needs survey in 2 weeks', 'Context for team'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Assignment & Follow-up">
                    <FieldTable rows={[
                      ['Assign To', 'Team member handling this', 'Priya Sharma', 'Someone must own this lead'],
                      ['Next Follow-up Date', 'When to contact next', '2026-07-15', 'No lead forgotten'],
                    ]} />
                  </StepCard>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Lead Status Workflow</h3>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'].map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant={s === 'WON' ? 'success' : 'info'}>{s}</Badge>
                          {i < 5 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">WON?</strong> → Click &quot;Convert to Client&quot; on the lead detail page</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CLIENTS */}
            {activeSection === 'clients' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 2: Convert Lead to Client</h2>
                    <p className="text-sm text-muted-foreground">A <strong className="text-foreground">Client</strong> is a confirmed customer with a business relationship.</p>
                  </div>

                  <FieldTable rows={[
                    ['Company Name', 'Legal company name', 'Sunrise Builders Pvt. Ltd.', 'Used on invoices, contracts'],
                    ['Client Type', 'What kind of company', 'Real Estate Developer', 'Categorize clients'],
                    ['Contact Person', 'Primary contact', 'Rajesh Mehta', 'Main point of contact'],
                    ['Email', 'Business email', 'rajesh@sunrisebuilders.com', 'Official communication'],
                    ['Phone', 'Business phone', '9876543210', 'Communication'],
                    ['GST Number', '15-char GSTIN', '27AABCS1234F1Z5', 'CRITICAL for invoicing'],
                    ['PAN Number', '10-char PAN', 'AABCS1234F', 'CRITICAL for taxation'],
                    ['State', 'Indian state', 'Maharashtra', 'State regulations'],
                  ]} />

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Client Types</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { type: 'Real Estate Developer', example: 'DLF, Godrej Properties' },
                        { type: 'Construction Company', example: 'L&T, Shapoorji Pallonji' },
                        { type: 'Government Body', example: 'Mumbai BMC, NHAI' },
                        { type: 'Infrastructure Developer', example: 'IRCON, GMR Infrastructure' },
                        { type: 'Industrial Client', example: 'Tata Steel, Adani Group' },
                        { type: 'Institutional Client', example: 'IIT Bombay, AIIMS' },
                        { type: 'Individual Client', example: 'Mr. Sharma building his house' },
                      ].map((c) => (
                        <div key={c.type} className="rounded-lg border border-border p-2">
                          <p className="text-sm font-medium text-foreground">{c.type}</p>
                          <p className="text-xs text-muted-foreground">{c.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PROJECTS */}
            {activeSection === 'projects' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 3: Create a Project</h2>
                    <p className="text-sm text-muted-foreground">A <strong className="text-foreground">Project</strong> is the actual work you do for a client.</p>
                  </div>

                  <StepCard step={1} title="Basic Information">
                    <FieldTable rows={[
                      ['Project Name', 'Descriptive name', 'Sunrise Enclave - Structural Survey', 'Unique identifier'],
                      ['Description', 'What is this project?', 'Complete structural survey for 3 tower project', 'Context for everyone'],
                      ['Project Type', 'Kind of project', 'Residential Tower', 'Categorization'],
                      ['Client', 'Which client?', 'Sunrise Builders Pvt. Ltd.', 'Links project to client'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Location">
                    <FieldTable rows={[
                      ['Site Address', 'Full site address', 'Plot No. 15, Powai Lake Road', 'Field team needs to reach'],
                      ['City', 'City name', 'Mumbai', 'Location tracking'],
                      ['State', 'Indian state', 'Maharashtra', 'State regulations'],
                      ['GPS Coordinates', 'Lat/Long', '19.0760, 72.8777', 'Exact site on map'],
                      ['Total Area', 'Site area in sq.ft', '50000', 'For estimation'],
                      ['Floors', 'Building floors', '20', 'Scope estimation'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Financial">
                    <FieldTable rows={[
                      ['Project Budget', 'Total budget in ₹', '5000000', 'Budget tracking'],
                      ['Estimated Cost', 'Expected cost in ₹', '4500000', 'Profit margin calc'],
                      ['Start Date', 'Work begins', '2026-07-15', 'Timeline tracking'],
                      ['End Date', 'Work ends', '2026-12-31', 'Deadline management'],
                    ]} />
                  </StepCard>

                  <StepCard step={4} title="Assignment">
                    <FieldTable rows={[
                      ['Project Manager', 'Who manages?', 'Priya Sharma', 'Accountability'],
                      ['Team Members', 'Who works on it?', 'Raj Mehta, Neha Gupta', 'Resource allocation'],
                    ]} />
                  </StepCard>

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

            {/* SURVEYS */}
            {activeSection === 'surveys' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 4: Do a Site Survey</h2>
                    <p className="text-sm text-muted-foreground">
                      A <strong className="text-foreground">Survey</strong> is a detailed on-site inspection. <strong className="text-foreground text-red-600 dark:text-red-400">This is the CORE of your business.</strong>
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
                    <p className="font-medium text-foreground">When to Survey:</p>
                    <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                      <li>Before construction — understand site conditions</li>
                      <li>During construction — check quality</li>
                      <li>Before handover — verify everything is done right</li>
                      <li>When problems arise — investigate issues</li>
                    </ul>
                  </div>

                  <StepCard step={1} title="Project Selection">
                    <FieldTable rows={[
                      ['Project', 'Which project?', 'Sunrise Enclave', 'Links survey to project'],
                      ['Survey Type', 'Why doing this?', 'Initial Survey', 'Defines scope'],
                      ['Survey Title', 'Descriptive title', 'Foundation Inspection - Phase 1', 'Identifies this survey'],
                      ['Description', 'What will you check?', 'Foundation depth, soil, rebar', 'Clarity for engineer'],
                    ]} />
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium text-foreground mb-1">Survey Types:</p>
                      <div className="space-y-1 text-muted-foreground">
                        <p><Badge variant="info" className="mr-1">Initial</Badge> First visit — baseline data collection</p>
                        <p><Badge variant="info" className="mr-1">Detailed</Badge> Deep inspection of specific area</p>
                        <p><Badge variant="info" className="mr-1">Follow-up</Badge> Revisit to check progress</p>
                        <p><Badge variant="info" className="mr-1">Final</Badge> Pre-handover comprehensive check</p>
                        <p><Badge variant="info" className="mr-1">As-Built</Badge> Document actual built conditions</p>
                      </div>
                    </div>
                  </StepCard>

                  <StepCard step={2} title="Schedule & Assignment">
                    <FieldTable rows={[
                      ['Scheduled Date', 'When?', '2026-07-16', 'Scheduling'],
                      ['Duration', 'How long?', '4 hours', 'Time allocation'],
                      ['Assign Engineer', 'Who does it?', 'Raj Mehta', 'Responsibility'],
                      ['Priority', 'How urgent?', 'HIGH', 'Priority handling'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Site Information">
                    <FieldTable rows={[
                      ['GPS Location', 'Get or enter', 'Lat 19.0760, Long 72.8777', 'Exact site location'],
                      ['Weather', 'Current weather', 'Clear Sky', 'Affects survey quality'],
                      ['Site Condition', 'Accessibility', 'Accessible', 'Team access planning'],
                      ['Building Type', 'Kind of building', 'Residential', 'What you check'],
                      ['Construction Stage', 'Building stage', 'Foundation', 'Relevant inspections'],
                    ]} />
                  </StepCard>

                  <StepCard step={4} title="Infrastructure">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong className="text-foreground">Electricity:</strong> Available? → Connection Type (3-Phase/1-Phase/HT) → Load (kVA)</p>
                      <p><strong className="text-foreground">Water:</strong> Available? → Source (Municipal/Borewell/Tanker)</p>
                      <p><strong className="text-foreground">Drainage:</strong> Connected? → Type (Storm/Sewage/Both)</p>
                      <p><strong className="text-foreground">Fire Safety:</strong> Available? → Extinguishers, Sprinklers, Alarm type</p>
                      <p><strong className="text-foreground">Structure Rating:</strong> ⭐ to ⭐⭐⭐⭐⭐ (1=Poor to 5=Excellent)</p>
                    </div>
                  </StepCard>

                  <StepCard step={5} title="Checklist">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Check off items as you inspect them. Add notes for issues.</p>
                      <p><strong className="text-foreground">Categories:</strong> Structural (5 items), Electrical (4), Plumbing (3), Safety (3), Environmental (3)</p>
                      <p><strong className="text-foreground">Add custom items:</strong> Click &quot;Add Item&quot; for anything not in the default list</p>
                    </div>
                  </StepCard>

                  <StepCard step={6} title="Media & Documentation">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border"><th className="pb-2 text-left font-medium text-foreground">Type</th><th className="pb-2 text-left font-medium text-foreground">Formats</th><th className="pb-2 text-left font-medium text-foreground">Max</th></tr></thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border/50"><td className="font-medium text-foreground">Photos</td><td>JPEG, PNG, WebP</td><td>50 MB</td></tr>
                          <tr className="border-b border-border/50"><td className="font-medium text-foreground">Videos</td><td>MP4, AVI, WebM</td><td>50 MB</td></tr>
                          <tr className="border-b border-border/50"><td className="font-medium text-foreground">Voice Notes</td><td>Built-in recorder</td><td>—</td></tr>
                          <tr><td className="font-medium text-foreground">Documents</td><td>PDF, DOC, XLS</td><td>50 MB</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </StepCard>

                  <StepCard step={7} title="Review & Submit">
                    <div className="text-sm text-muted-foreground">
                      <p>1. Review all info from Steps 1–6</p>
                      <p>2. Draw your <strong className="text-foreground">Digital Signature</strong></p>
                      <p>3. Choose: <strong className="text-foreground">Save Draft</strong> (edit later) or <strong className="text-foreground">Create &amp; Submit</strong> (send for approval)</p>
                    </div>
                  </StepCard>
                </CardContent>
              </Card>
            )}

            {/* BOQ */}
            {activeSection === 'boq' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 5: Create BOQ</h2>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">BOQ = Bill of Quantities.</strong> A detailed list of ALL construction items with quantities and rates. Think of it as a <strong className="text-foreground">grocery bill for construction</strong>.
                    </p>
                  </div>

                  <FieldTable rows={[
                    ['Description', 'What is this item?', 'Earthwork excavation in trenches', 'What you charge for'],
                    ['Category', 'Type of work', 'Earthwork', 'Grouping and subtotals'],
                    ['Unit', 'Measurement unit', 'Cum (cubic meter)', 'Standard unit'],
                    ['Quantity', 'How much?', '450', 'From survey measurements'],
                    ['Rate (INR)', 'Price per unit', '350', 'Your rate'],
                    ['Amount', 'Auto-calc', '₹1,57,500', 'Qty × Rate'],
                  ]} />

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Units Explained</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { unit: 'Cum', full: 'Cubic Meter', use: 'Concrete, earthwork' },
                        { unit: 'Sqm', full: 'Square Meter', use: 'Plastering, painting' },
                        { unit: 'Rmt', full: 'Running Meter', use: 'Pipes, cables' },
                        { unit: 'Nos', full: 'Numbers', use: 'Doors, windows' },
                        { unit: 'Set', full: 'Set', use: 'Elevator, complete assembly' },
                        { unit: 'Bags', full: 'Bags', use: 'Cement' },
                        { unit: 'Tonnes', full: 'Tonnes', use: 'Steel, heavy materials' },
                      ].map((u) => (
                        <div key={u.unit} className="rounded-lg border border-border p-2">
                          <p className="text-sm font-medium text-foreground">{u.unit} = {u.full}</p>
                          <p className="text-xs text-muted-foreground">Use for: {u.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QUOTATIONS */}
            {activeSection === 'quotations' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 6: Send Quotation</h2>
                    <p className="text-sm text-muted-foreground">A <strong className="text-foreground">Quotation</strong> is a formal price document sent to the client.</p>
                  </div>

                  <StepCard step={1} title="Project & Details">
                    <FieldTable rows={[
                      ['Select Project', 'Which project?', 'Sunrise Enclave', 'Links to project'],
                      ['Title', 'Descriptive title', 'Site Survey Quotation', 'Identifies this quote'],
                      ['Description', 'What work?', 'Structural survey with GPS mapping', 'Scope clarity'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Line Items">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Add each work item separately:</p>
                      <p>1. Initial Site Survey — Set × 1 × ₹75,000 = ₹75,000</p>
                      <p>2. Soil Testing — Nos × 5 × ₹8,000 = ₹40,000</p>
                      <p>3. Structural Report — Set × 1 × ₹25,000 = ₹25,000</p>
                      <p className="font-medium text-foreground">Subtotal = ₹1,40,000</p>
                    </div>
                  </StepCard>

                  <StepCard step={3} title="Tax & Terms">
                    <FieldTable rows={[
                      ['GST %', 'Which rate?', '18%', 'Government tax'],
                      ['Discount %', 'Any discount?', '5%', 'Client relationship'],
                      ['Terms', 'Legal terms', 'Pre-filled 8 terms', 'Protection'],
                    ]} />
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <p>Subtotal: ₹1,40,000 → Discount (5%): -₹7,000 → After Discount: ₹1,33,000 → GST (18%): ₹23,940 → <strong className="text-foreground">Grand Total: ₹1,56,940</strong></p>
                    </div>
                  </StepCard>

                  <StepCard step={4} title="Review & Send">
                    <div className="text-sm text-muted-foreground">
                      <p>Preview the quotation with company header. Check all amounts. Then <strong className="text-foreground">Send Quotation</strong> (emails to client) or <strong className="text-foreground">Save as Draft</strong>.</p>
                    </div>
                  </StepCard>
                </CardContent>
              </Card>
            )}

            {/* RISK & MATERIALS */}
            {activeSection === 'risk-materials' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 7: Track Risks & Materials</h2>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Risk Assessment</h3>
                    <FieldTable rows={[
                      ['Title', 'Risk name', 'Foundation settlement risk', 'Quick identifier'],
                      ['Description', 'Details', 'Soil test shows loose soil at B-2', 'Full explanation'],
                      ['Severity', 'How serious?', 'High', 'Priority for action'],
                      ['Mitigation', 'How to fix?', 'Increase depth, more soil tests', 'Action plan'],
                    ]} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Materials</h3>
                    <FieldTable rows={[
                      ['Material Name', 'What material?', 'Portland Cement OPC 43', 'Identification'],
                      ['Specification', 'Technical specs', 'IS 269-1989', 'Quality standard'],
                      ['Quantity', 'How much?', '500 Bags', 'Procurement'],
                      ['Estimated Cost', 'Expected cost', '₹2,50,000', 'Budget planning'],
                    ]} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MEDIA */}
            {activeSection === 'media' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 8: Media & Documents</h2>
                    <p className="text-sm text-muted-foreground">Central hub for all photos, videos, voice notes, and documents across projects.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border"><th className="pb-2 text-left font-medium text-foreground">Sub-page</th><th className="pb-2 text-left font-medium text-foreground">Purpose</th></tr></thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50"><td className="font-medium text-foreground">Photos</td><td>Site photos gallery</td></tr>
                        <tr className="border-b border-border/50"><td className="font-medium text-foreground">Videos</td><td>Recorded walkthroughs</td></tr>
                        <tr className="border-b border-border/50"><td className="font-medium text-foreground">Voice Notes</td><td>Audio observations</td></tr>
                        <tr className="border-b border-border/50"><td className="font-medium text-foreground">Sketches</td><td>Hand-drawn diagrams</td></tr>
                        <tr><td className="font-medium text-foreground">Drawings</td><td>Technical drawings</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* WORKFLOW */}
            {activeSection === 'workflow' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 9: Workflow & Approvals</h2>
                    <p className="text-sm text-muted-foreground">A <strong className="text-foreground">Workflow</strong> is an approval chain: Engineer submits → Manager reviews → Client approves → Done</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { type: 'Approval', desc: 'Someone must approve to proceed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
                      { type: 'Review', desc: 'Examine and give feedback', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
                      { type: 'Notification', desc: 'Send alert to stakeholders', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
                      { type: 'Condition', desc: 'Different path based on criteria', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
                      { type: 'Parallel', desc: 'Multiple people review at once', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' },
                    ].map((s) => (
                      <div key={s.type} className="flex items-center gap-2 rounded-lg border border-border p-3">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', s.color)}>{s.type}</span>
                        <span className="text-xs text-muted-foreground">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* REPORTS */}
            {activeSection === 'reports' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 10: Reports & Signatures</h2>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Report Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Survey Report', 'Project Report', 'BOQ Report', 'Financial Report', 'Daily Report'].map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Customizable Sections</h3>
                    <div className="grid gap-1 sm:grid-cols-2 text-sm text-muted-foreground">
                      <p>✓ Report Header</p><p>✓ Project Details</p>
                      <p>✓ GPS Location</p><p>✓ Measurements Table</p>
                      <p>✓ Checklist Summary</p><p>✓ Photo Documentation</p>
                      <p>✓ Risk Assessment</p><p>✓ Remarks & Notes</p>
                      <p>✓ Digital Signatures</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* COMMUNICATION */}
            {activeSection === 'comm' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Communication Hub</h2>
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

            {/* ADMIN */}
            {activeSection === 'admin' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Administration</h2>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">User Roles</h3>
                    <div className="grid gap-2">
                      {[
                        { role: 'Super Admin', access: 'Full system access, including settings' },
                        { role: 'Admin', access: 'Most features, no system settings' },
                        { role: 'Manager', access: 'Projects, surveys, team management' },
                        { role: 'Engineer', access: 'Assigned projects and surveys only' },
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

            {/* AI */}
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

            {/* FLOW DIAGRAM */}
            {activeSection === 'flow' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Complete Business Process Flow</h2>

                  {/* Visual Flow */}
                  <div className="space-y-4">
                    {[
                      { step: '1. LEAD', desc: 'Someone calls/email about your services', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400' },
                      { step: '2. CLIENT', desc: 'Convert lead, fill GST/PAN, sign contract', color: 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/40 dark:border-violet-800 dark:text-violet-400' },
                      { step: '3. PROJECT', desc: 'Create project, assign team, set budget & timeline', color: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400' },
                      { step: '4. SURVEY', desc: 'Engineer visits site — 7-step inspection wizard', color: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400' },
                      { step: '5. BOQ', desc: 'Calculate costs item-by-item with quantities & rates', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400' },
                      { step: '6. QUOTATION', desc: 'Create & send formal price document to client', color: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/40 dark:border-pink-800 dark:text-pink-400' },
                      { step: '7. WORK', desc: 'Track risks, materials, media, documents', color: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/40 dark:border-orange-800 dark:text-orange-400' },
                      { step: '8. REPORT & SIGN', desc: 'Generate PDF, digital signature, client sign-off', color: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-400' },
                    ].map((s, i) => (
                      <div key={s.step} className="flex items-center gap-3">
                        <div className={cn('w-48 shrink-0 rounded-lg border p-3 text-center text-sm font-bold', s.color)}>
                          {s.step}
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-medium text-foreground mb-2">Modules at a Glance:</p>
                    <div className="grid gap-1 sm:grid-cols-2 text-muted-foreground">
                      <p>• <strong className="text-foreground">CRM</strong> → Leads, Clients</p>
                      <p>• <strong className="text-foreground">Projects</strong> → Budget, Timeline</p>
                      <p>• <strong className="text-foreground">Surveys</strong> → 7-step wizard</p>
                      <p>• <strong className="text-foreground">Finance</strong> → BOQ, Quotations</p>
                      <p>• <strong className="text-foreground">Media</strong> → Photos, Videos, Voice</p>
                      <p>• <strong className="text-foreground">Risk</strong> → Assessment & Mitigation</p>
                      <p>• <strong className="text-foreground">Workflow</strong> → Approval chains</p>
                      <p>• <strong className="text-foreground">Reports</strong> → PDF + Signatures</p>
                      <p>• <strong className="text-foreground">Communication</strong> → Email, WhatsApp</p>
                      <p>• <strong className="text-foreground">AI</strong> → OCR, Predictions</p>
                    </div>
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
