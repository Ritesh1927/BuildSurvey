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
  { id: 'quotations', title: 'Step 6: Invoices', icon: '7' },
  { id: 'risks', title: 'Step 7: Risk Assessment', icon: '8' },
  { id: 'site-visits', title: 'Step 8: Site Visits', icon: '9' },
  { id: 'attendance', title: 'Attendance', icon: '10' },
  { id: 'admin', title: 'Roles & Permissions', icon: '11' },
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
        <Badge variant="info" className="w-fit">12 sections · Deep Guide</Badge>
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
                      This app manages the <strong className="text-foreground">entire life of a construction project</strong> — from the moment someone shows interest, through the survey and costing, to ongoing site supervision after work begins.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">The Business Flow (Memorize This):</p>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      {['LEAD', 'CLIENT', 'PROJECT', 'SURVEY', 'BOQ', 'INVOICE', 'SITE VISITS'].map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant="info">{s}</Badge>
                          {i < 6 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">In Simple Words:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li><strong className="text-foreground">Someone calls you</strong> → That&apos;s a <strong className="text-foreground">Lead</strong></li>
                      <li><strong className="text-foreground">You mark the lead Won</strong> → It converts to a <strong className="text-foreground">Client</strong> in the same step</li>
                      <li><strong className="text-foreground">You create a Project</strong> for that client</li>
                      <li><strong className="text-foreground">Engineer or Surveyor visits the site</strong> → That&apos;s a <strong className="text-foreground">Survey</strong></li>
                      <li><strong className="text-foreground">You calculate costs</strong> → That&apos;s a <strong className="text-foreground">BOQ</strong></li>
                      <li><strong className="text-foreground">You send them a price</strong> → That&apos;s an <strong className="text-foreground">Invoice</strong>, built straight from the BOQ</li>
                      <li><strong className="text-foreground">Work begins</strong> → the assigned Engineer logs recurring <strong className="text-foreground">Site Visits</strong> until the project is complete</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Everyone also marks their own <strong className="text-foreground">Attendance</strong> daily — that runs in parallel to all of the above, it isn&apos;t part of the project flow itself.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Who Uses What?</h3>
                    <p className="mb-2 text-xs text-muted-foreground">
                      These 7 roles ship by default, each with a sensible starting set of permissions. An Admin can edit any of them, or create entirely new custom roles — see <strong className="text-foreground">Roles & Permissions</strong> below.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        { role: 'Manager', modules: 'Leads, Clients, Projects, Surveys, Site Visits, BOQ, Invoices' },
                        { role: 'Engineer', modules: 'Projects they lead, Surveys, Site Visits, BOQ (view), Attendance' },
                        { role: 'Surveyor', modules: 'Assigned Surveys, Risk Assessments, Attendance' },
                        { role: 'Accountant', modules: 'BOQ, Invoices, payment status' },
                        { role: 'Client', modules: 'Read-only view of their own projects, surveys and invoices' },
                        { role: 'Admin / Super Admin', modules: 'Everything, plus Employees and Roles & Permissions' },
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

                  <StepCard step={1} title="Contact Information">
                    <FieldTable rows={[
                      ['Full Name', 'Contact person name', 'Rajesh Mehta', 'Who you will talk to'],
                      ['Email Address', 'Their email', 'rajesh@sunrisebuilders.com', 'For sending invoices'],
                      ['Phone Number', 'Mobile (min 10 digits)', '9876543210', 'Calls and follow-up'],
                      ['Company', 'Company name', 'Sunrise Builders Pvt. Ltd.', 'Identifies organization'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Lead Details">
                    <FieldTable rows={[
                      ['Lead Source', 'How did they find you?', 'Referral', 'Which channel works — options: Website, Referral, LinkedIn, Cold Call, Exhibition / Trade Show, Partner, Social Media, Other'],
                      ['Status', 'Only shown if you have permission to backfill status', 'New', 'Everyone else\'s leads start at New automatically'],
                      ['Priority', 'How urgent?', 'High', 'Low / Medium / High / Critical'],
                      ['Estimated Value (INR)', 'Expected deal value', '500000', 'Revenue forecasting'],
                      ['Notes', 'Extra info', 'Needs survey in 2 weeks', 'Context for the team'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Assignment">
                    <FieldTable rows={[
                      ['Assign To', 'A Manager to own this lead', 'Priya Sharma', 'Only Managers can be assigned — leave blank to keep it in the general pool'],
                    ]} />
                  </StepCard>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Lead Status Pipeline</h3>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'].map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant={s === 'WON' ? 'success' : 'info'}>{s}</Badge>
                          {i < 5 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                      <span className="ml-2 text-muted-foreground">(or LOST, at any point)</span>
                    </div>
                    <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm">
                      <p className="font-medium text-foreground">Won = Converted, in one step.</p>
                      <p className="mt-1 text-muted-foreground">
                        Open the lead, click Edit, and set <strong className="text-foreground">Status</strong> to <strong className="text-foreground">Won</strong>. A box appears asking for whatever a client record needs that a lead never captured —
                        <strong className="text-foreground"> City</strong> and <strong className="text-foreground">State</strong> are required, while Client Type, Website, Address, PIN Code, GST Number and PAN Number are optional. Name, company, email and phone carry over automatically.
                        Hit <strong className="text-foreground">Save &amp; Convert</strong> and the lead becomes a Client immediately — there is no separate &quot;Convert&quot; step or dialog anymore.
                      </p>
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
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 2: Clients</h2>
                    <p className="text-sm text-muted-foreground">A <strong className="text-foreground">Client</strong> is a confirmed customer — reached either by converting a Won lead, or added directly for repeat/existing business.</p>
                  </div>

                  <FieldTable rows={[
                    ['Company Name', 'Legal company name (required)', 'Sunrise Builders Pvt. Ltd.', 'Used on invoices'],
                    ['Contact Person', 'Primary contact (required)', 'Rajesh Mehta', 'Main point of contact'],
                    ['Email Address', 'Business email (required)', 'rajesh@sunrisebuilders.com', 'Official communication'],
                    ['Phone Number', 'Business phone (required)', '9876543210', 'Communication'],
                    ['City / State', 'Required', 'Mumbai / Maharashtra', 'Location and regulations'],
                    ['Client Type', 'Optional', 'Real Estate Developer', 'Categorize clients'],
                    ['GST Number', 'Optional — 15 characters', '27AABCS1234F1Z5', 'Needed for GST-compliant invoicing'],
                    ['PAN Number', 'Optional — 10 characters', 'AABCS1234F', 'Taxation'],
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

                  <StepCard step={1} title="Basic Info">
                    <FieldTable rows={[
                      ['Project Name', 'Descriptive name', 'Sunrise Enclave - Structural Survey', 'Unique identifier'],
                      ['Project Code', 'Auto-generated, cannot be edited', 'PRJ-2026-042', 'Permanent reference number'],
                      ['Description', 'What is this project?', 'Complete structural survey for 3 tower project', 'Context for everyone'],
                      ['Project Type', 'Kind of project', 'Residential', 'Categorization'],
                      ['Client', 'Which client?', 'Sunrise Builders Pvt. Ltd.', 'Links project to client'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Location">
                    <FieldTable rows={[
                      ['Site Address / City / State', 'Where the site is', 'Powai, Mumbai, Maharashtra', 'Field team needs to reach'],
                      ['Latitude / Longitude', 'Exact GPS coordinates', '19.0760, 72.8777', 'Used to verify on-site check-ins later'],
                      ['Total Area (sq.ft)', 'Site area', '50000', 'For estimation'],
                      ['Number of Floors', 'Building floors', '20', 'Scope estimation'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Financial">
                    <FieldTable rows={[
                      ['Project Budget (INR)', 'Total budget', '5000000', 'Budget tracking'],
                      ['Start Date / End Date', 'Timeline', '2026-07-15 to 2026-12-31', 'Also defines the Site Visits window later'],
                    ]} />
                  </StepCard>

                  <StepCard step={4} title="Assignment">
                    <FieldTable rows={[
                      ['Project Manager', 'Optional — filtered to Managers', 'Priya Sharma', 'Can be assigned later'],
                      ['Lead Engineer', 'Optional — filtered to Engineers', 'Raj Mehta', 'Required before Site Visits can start'],
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
                      A <strong className="text-foreground">Survey</strong> is a one-time, structured on-site inspection — different from the recurring Site Visits that happen later once work is underway.
                    </p>
                  </div>

                  <StepCard step={1} title="Project & Type">
                    <FieldTable rows={[
                      ['Project', 'Which project?', 'Sunrise Enclave', 'Links survey to project'],
                      ['Survey Type', 'Why doing this?', 'Initial', 'Initial / Detailed / Follow-up / Final / As-Built'],
                      ['Survey Title / Description', 'What will you check?', 'Foundation Inspection - Phase 1', 'Identifies this survey'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Schedule & Assignment">
                    <FieldTable rows={[
                      ['Scheduled Date', 'Cannot be in the past', '2026-07-16', 'Scheduling'],
                      ['Assign Surveyor / Engineer', 'Who does it?', 'Raj Mehta', 'Picked from Engineers and Surveyors'],
                    ]} />
                  </StepCard>

                  <StepCard step={3} title="Site Details">
                    <FieldTable rows={[
                      ['Weather Condition', 'Free text', 'Clear Sky', 'Shown on the survey overview'],
                      ['Site Condition', 'Free text', 'Accessible', 'Shown on the survey overview'],
                      ['Access Details', 'Notes for the field team', 'Gate code 4521, ask for site guard', 'Practical access info'],
                    ]} />
                  </StepCard>

                  <StepCard step={4} title="Checklist">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Every new survey starts pre-loaded with <strong className="text-foreground">9 default items under &quot;Quality Check&quot;</strong> (all checked by default) — add more items under <strong className="text-foreground">Structural, Electrical, Plumbing, Safety</strong> or <strong className="text-foreground">Environmental</strong> as needed.</p>
                      <p>Only the items you leave checked are saved with the survey.</p>
                    </div>
                  </StepCard>

                  <StepCard step={5} title="Review & Submit">
                    <div className="text-sm text-muted-foreground">
                      <p>Review everything from Steps 1–4, then create the survey — it starts in <strong className="text-foreground">Assigned</strong> status.</p>
                    </div>
                  </StepCard>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">On the Survey Detail Page</h3>
                    <p className="text-sm text-muted-foreground mb-2">Tabs: Overview, Site Visit, Measurements, Materials, Risks, Media &amp; Attachments.</p>
                    <div className="space-y-2 text-sm">
                      <div className="rounded-lg border border-border p-3">
                        <p className="font-medium text-foreground">Check-in</p>
                        <p className="text-muted-foreground">Requires a photo and your GPS location. If you&apos;re off-site it&apos;s flagged with a badge (not blocked) — you can resubmit once you&apos;re actually there.</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="font-medium text-foreground">Check-out</p>
                        <p className="text-muted-foreground">Also needs a photo + GPS. Add any <strong className="text-foreground">Measurements</strong> and <strong className="text-foreground">Material Requirements</strong> you recorded before submitting. Blocked until check-in is confirmed on-site.</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="font-medium text-foreground">Checklist window</p>
                        <p className="text-muted-foreground">The assigned surveyor can only tick items while checked in on-site (between check-in and check-out). Admins/Managers can edit it anytime as an override.</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Only photos are functional in Media &amp; Attachments today — videos, voice notes and sketches aren&apos;t wired up yet.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Survey Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((s) => (
                        <Badge key={s} variant={s === 'APPROVED' ? 'success' : s === 'REJECTED' ? 'destructive' : 'info'}>{s}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Only a Super Admin, Admin or Manager can approve or reject a submitted survey.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* BOQ */}
            {activeSection === 'boq' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 5: Build the BOQ</h2>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">BOQ = Bill of Quantities.</strong> A detailed list of every item you&apos;ll charge for, with quantities and rates — the basis for the invoice that follows.
                    </p>
                  </div>

                  <FieldTable rows={[
                    ['Description', 'What is this item?', 'Earthwork excavation in trenches', 'What you charge for'],
                    ['Category', 'Type of work', 'Earthwork', 'Grouping and totals'],
                    ['Unit', 'Measurement unit', 'Cum', 'Cum, Sqm, Rmt, Nos, Set or Mtr'],
                    ['Qty', 'How much?', '450', 'From survey measurements'],
                    ['Rate (₹)', 'Price per unit', '350', 'Your rate — Amount = Qty × Rate'],
                  ]} />

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Earthwork', 'Concrete Work', 'Masonry', 'Reinforcement & Steel', 'Formwork & Shuttering', 'Flooring & Tiling', 'Plastering', 'Waterproofing', 'Painting & Finishing', 'Doors & Windows', 'Electrical Work', 'Plumbing & Sanitary', 'HVAC', 'Roofing', 'Miscellaneous'].map((c) => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="text-muted-foreground">
                      GST is pulled from <strong className="text-foreground">Settings → General → Default GST Rate</strong> to show the Grand Total on this page. Once the BOQ for a project is ready, use the project&apos;s <strong className="text-foreground">Generate Invoice</strong> action to turn it straight into an invoice — no retyping.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QUOTATIONS */}
            {activeSection === 'quotations' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 6: Send an Invoice</h2>
                    <p className="text-sm text-muted-foreground">An <strong className="text-foreground">Invoice</strong> is a formal price document sent to the client, built from a project&apos;s real BOQ items.</p>
                  </div>

                  <StepCard step={1} title="Project & Details">
                    <FieldTable rows={[
                      ['Select Project', 'Which project?', 'Sunrise Enclave', 'Pulls that project\'s BOQ items'],
                      ['Invoice Title', 'Descriptive title', 'Site Survey Invoice', 'Identifies this invoice'],
                      ['Description', 'What work?', 'Structural survey with GPS mapping', 'Scope clarity'],
                    ]} />
                  </StepCard>

                  <StepCard step={2} title="Line Items">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Loaded automatically from the project&apos;s BOQ — edit quantities/rates, remove items, or add new blank rows here without changing the BOQ itself.</p>
                    </div>
                  </StepCard>

                  <StepCard step={3} title="Tax & Terms">
                    <FieldTable rows={[
                      ['GST %', 'Which rate?', '18%', '5 / 12 / 18 / 28'],
                      ['Discount %', 'Any discount?', '5%', 'Applied to the subtotal before GST'],
                      ['Terms & Conditions', 'Pre-filled, editable', '8-point default terms', 'Validity, payment schedule, jurisdiction'],
                    ]} />
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      <p>Subtotal ₹1,40,000 → Discount (5%) −₹7,000 → After Discount ₹1,33,000 → GST is applied on the discounted amount (18%) +₹23,940 → <strong className="text-foreground">Grand Total ₹1,56,940</strong></p>
                    </div>
                  </StepCard>

                  <StepCard step={4} title="Review & Send">
                    <div className="text-sm text-muted-foreground">
                      <p>Preview the full invoice, then <strong className="text-foreground">Save as Draft</strong> or <strong className="text-foreground">Send Invoice</strong>.</p>
                    </div>
                  </StepCard>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Invoice Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'].map((s) => (
                        <Badge key={s} variant="info">{s}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Payment status (Pending / Partial / Paid / Overdue / Cancelled) tracks collection separately, once accepted — only a Super Admin or Accountant can change it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RISK ASSESSMENT */}
            {activeSection === 'risks' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 7: Log a Risk</h2>
                    <p className="text-sm text-muted-foreground">
                      Risk Assessments are logged from the Risks page itself, via a <strong className="text-foreground">New Risk Assessment</strong> button — every risk must be tied to a specific survey.
                    </p>
                  </div>
                  <FieldTable rows={[
                    ['Title', 'Risk name', 'Foundation settlement risk', 'Quick identifier'],
                    ['Description', 'Details', 'Soil test shows loose soil at B-2', 'Full explanation'],
                    ['Risk Level', 'How serious?', 'High', 'Critical / High / Medium / Low'],
                    ['Survey', 'Which survey found this?', 'Foundation Inspection - Phase 1', 'Required — links the risk to site evidence'],
                    ['Mitigation Plan', 'How to fix it (optional)', 'Increase depth, more soil tests', 'Action plan'],
                  ]} />
                  <p className="text-sm text-muted-foreground">
                    The Risks page also shows a reference 5×5 Risk Matrix (Likelihood × Impact) and a filterable Risk Register of everything logged so far. Measurements and Material Requirements are captured separately, on a survey&apos;s own Check-out step.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SITE VISITS */}
            {activeSection === 'site-visits' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Step 8: Site Visits</h2>
                    <p className="text-sm text-muted-foreground">
                      Once a project has an approved survey, a <strong className="text-foreground">Lead Engineer</strong> and a <strong className="text-foreground">start/end date</strong>, it becomes eligible for recurring <strong className="text-foreground">Site Visits</strong> — ongoing supervision for the length of the project, separate from the one-time Survey.
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
                    <p className="font-medium text-foreground">Stricter than Survey check-in:</p>
                    <p className="text-muted-foreground mt-1">
                      Both check-in and check-out require a photo and GPS, and are <strong className="text-foreground">hard-blocked if you&apos;re off-site</strong> — there&apos;s no flag-and-continue option like Surveys have. One visit per engineer per project per day.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">The Site Visits list shows every eligible project with its client, engineer, visit window, and today&apos;s status: <strong className="text-foreground">Visited</strong>, <strong className="text-foreground">In Progress</strong>, <strong className="text-foreground">Pending</strong>, <strong className="text-foreground">Holiday</strong>, or <strong className="text-foreground">Outside Window</strong>. Click a project to open its visit calendar.</p>
                    <p className="text-muted-foreground">Instead of a checklist, checkout asks for a short <strong className="text-foreground">work summary</strong> — a quick note on what was done that visit.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ATTENDANCE */}
            {activeSection === 'attendance' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">Attendance</h2>
                    <p className="text-sm text-muted-foreground">Runs in parallel to everything else — every internal employee marks their own attendance daily.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">My Attendance</p>
                      <p className="text-muted-foreground mt-1">Take a photo and confirm GPS — you must be within 100m of the office (set in Settings → General). One record per day.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">Team Attendance</p>
                      <p className="text-muted-foreground mt-1">Visible to Super Admin/Admin/Manager only — date picker, search, Present/Not Marked stats, and a per-employee monthly calendar.</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Already checked in to a Survey or Site Visit today? Attendance is marked automatically as a <strong className="text-foreground">Field Visit</strong> — no separate office photo needed.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ADMIN / ROLES & PERMISSIONS */}
            {activeSection === 'admin' && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Roles & Permissions</h2>
                  <p className="text-sm text-muted-foreground">
                    Every employee has a <strong className="text-foreground">Role</strong> — a named bundle of permissions that decides which sections they can see, and whether they can view, create, edit or delete in each one.
                  </p>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">The 7 Built-in Roles</h3>
                    <div className="grid gap-2">
                      {[
                        { role: 'Super Admin', access: 'Everything, always — including every permission added in the future. Can\'t be edited or deleted, so the system can never lock everyone out.' },
                        { role: 'Admin', access: 'Nearly everything except managing roles/permissions' },
                        { role: 'Manager', access: 'Leads, Clients, Projects, Surveys, Site Visits, BOQ, Invoices' },
                        { role: 'Engineer', access: 'Projects they lead, Surveys, Site Visits, view-only BOQ' },
                        { role: 'Surveyor', access: 'Assigned surveys, risk assessments' },
                        { role: 'Client', access: 'Read-only view of their own projects, surveys and invoices' },
                        { role: 'Accountant', access: 'BOQ, Invoices, payment status' },
                      ].map((r) => (
                        <div key={r.role} className="flex items-center justify-between gap-4 rounded-lg border border-border p-2">
                          <span className="text-sm font-medium text-foreground shrink-0">{r.role}</span>
                          <span className="text-xs text-muted-foreground text-right">{r.access}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Creating a Custom Role</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Super Admins can go to <strong className="text-foreground">Roles & Permissions</strong> in the sidebar and click <strong className="text-foreground">Add Role</strong>. Give it a name, then check off exactly which permissions it should have — grouped by section (Leads, Clients, Projects, Surveys, Site Visits, Risks, BOQ, Invoices, Attendance, Employees, Settings), with a &quot;select all&quot; per group.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      That role then shows up as a normal option on the Employees → Add/Edit Employee form, exactly like a built-in one. You can also come back and edit any role&apos;s permissions later — except Super Admin.
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Role and permission changes take effect the <strong className="text-foreground">next time the employee logs in</strong> — not instantly if they&apos;re already signed in.
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Secondary Role</h3>
                    <p className="text-sm text-muted-foreground">
                      A separate, narrower setting on the Employee form: an Engineer can additionally be flagged as a Surveyor (or vice versa) for staff who genuinely do both jobs. This is unrelated to custom roles — it only ever grants Engineer or Surveyor capability on top of someone&apos;s primary role.
                    </p>
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
                      { step: '1. LEAD', desc: 'Someone calls/emails about your services', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400' },
                      { step: '2. CLIENT', desc: 'Mark the lead Won — it converts to a client in the same step', color: 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/40 dark:border-violet-800 dark:text-violet-400' },
                      { step: '3. PROJECT', desc: 'Create project, assign a Manager and Lead Engineer, set budget & timeline', color: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400' },
                      { step: '4. SURVEY', desc: 'Engineer or Surveyor visits site — 5-step inspection wizard, checklist, check-in/out with photo + GPS', color: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400' },
                      { step: '5. BOQ', desc: 'Calculate costs item-by-item with quantities & rates', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-400' },
                      { step: '6. INVOICE', desc: 'Generate an invoice straight from the BOQ, add GST & terms, send to client', color: 'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/40 dark:border-pink-800 dark:text-pink-400' },
                      { step: '7. SITE VISITS', desc: 'Once work starts, the Lead Engineer logs recurring on-site visits until the project is done', color: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/40 dark:border-orange-800 dark:text-orange-400' },
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
                      <p>• <strong className="text-foreground">Survey & Field</strong> → Surveys, Survey Check-ins, Site Visits</p>
                      <p>• <strong className="text-foreground">Risk & Finance</strong> → Risk Assessment, BOQ, Invoices</p>
                      <p>• <strong className="text-foreground">Workforce</strong> → Attendance, Employees</p>
                      <p>• <strong className="text-foreground">Administration</strong> → Settings, Roles & Permissions</p>
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
