# BuildSurvey Pro — User Manual

> **Version 1.0** | Construction Site Survey & Project Management Platform

---

## Table of Contents

1. [Welcome & Overview](#1-welcome--overview)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [CRM Module — Leads & Clients](#4-crm-module--leads--clients)
5. [Projects Module](#5-projects-module)
6. [Survey & Field Module](#6-survey--field-module)
7. [Finance Module — BOQ, Estimation & Quotations](#7-finance-module--boq-estimation--quotations)
8. [Media & Documents](#8-media--documents)
9. [Risk Assessment & Materials](#9-risk-assessment--materials)
10. [Workflow & Digital Signatures](#10-workflow--digital-signatures)
11. [Communication — Notifications, Email & WhatsApp](#11-communication--notifications-email--whatsapp)
12. [Reports & Analytics](#12-reports--analytics)
13. [Administration](#13-administration)
14. [AI Features](#14-ai-features)
15. [Offline & Mobile](#15-offline--mobile)
16. [Glossary](#16-glossary)
17. [Appendix — Complete Reference Tables](#17-appendix--complete-reference-tables)

---

## 1. Welcome & Overview

### What is BuildSurvey Pro?

BuildSurvey Pro is an all-in-one construction site survey and project management platform designed for the Indian construction industry. It helps civil engineering companies manage the entire lifecycle — from lead generation to project completion.

### Key Features

| Feature | Description |
|---------|-------------|
| **CRM** | Track leads, convert them to clients, manage contacts |
| **Project Management** | Create projects, assign teams, track budgets and timelines |
| **Site Surveys** | 7-step guided survey wizard with checklists, GPS, media capture |
| **BOQ & Finance** | Bill of Quantities, cost estimation, quotations with GST |
| **Media Management** | Photos, videos, voice notes, sketches, technical drawings |
| **Risk Assessment** | Identify, rate, and mitigate project risks |
| **Workflows** | Visual workflow builder with approval chains |
| **Digital Signatures** | Draw, type, or upload signatures for approvals |
| **Reports** | Generate PDF reports with customizable sections |
| **AI Features** | OCR scanning, image analysis, risk prediction |
| **Offline Support** | Work offline, sync when connected |
| **Dark Mode** | Eye-friendly dark theme toggle |

### Supported Devices

- **Desktop** — Full experience (Chrome, Firefox, Edge, Safari)
- **Tablet** — Responsive layout with collapsible sidebar
- **Mobile** — Optimized mobile navigation with slide-out menu
- **PWA** — Installable as an app on mobile devices

---

## 2. Getting Started

### 2.1 Login

1. Open the app in your browser
2. Enter your **Email Address** and **Password**
3. Check **Remember Me** to stay logged in
4. Click **Sign In**

> **Demo Login:**
> - Email: `admin@buildsurvey.com`
> - Password: any password (demo mode)

### 2.2 Register / Request Access

- **Request Access**: Fill in your name, email, company, phone, and a message. An admin will review and create your account.
- **Register**: If you have a registration link, fill in all fields including password (min 8 characters) and accept terms.

### 2.3 Theme Toggle

- Click the **moon/sun icon** in the top header (between Search and Bell icon) to switch between Light and Dark mode
- Your preference is saved automatically

---

## 3. Dashboard

The dashboard is your home screen (`/`) showing a real-time overview of your business.

### KPI Cards (Top Row)

| Card | What It Shows |
|------|---------------|
| **Active Projects** | Number of projects currently in progress |
| **Pending Surveys** | Surveys that are scheduled but not yet completed |
| **Revenue This Month** | Total revenue collected this month (in ₹ Lakhs) |
| **BOQ Pending** | Total value of pending Bill of Quantities items |
| **Approvals Pending** | Number of items waiting for your approval |
| **Engineers Online** | Currently active engineers out of total |

### Charts

- **Survey Trend** — Line chart showing completed vs scheduled surveys over 12 months
- **Project Status Distribution** — Pie chart of projects by status (In Progress, Planning, Completed, On Hold, Cancelled)
- **Monthly Revenue** — Bar chart comparing revenue vs expenses

### Quick Actions

- **New Survey** — Opens the 7-step survey creation wizard
- **New Project** — Opens the 4-step project creation wizard
- **Create Quotation** — Opens the quotation builder

### Other Widgets

- **Today's Schedule** — Upcoming surveys with time, surveyor, and priority
- **Recent Activities** — Latest actions across the platform
- **Project Progress** — Top projects with progress bars and budget usage
- **Quick Stats** — Documents uploaded, photos captured, voice notes, sketches
- **Notification Center** — Latest notifications with urgency indicators
- **Site Locations Map** — Map view of all active project sites

---

## 4. CRM Module — Leads & Clients

### 4.1 Leads (`/leads`)

A **Lead** is a potential customer who has shown interest in your services. Leads go through a sales pipeline before becoming clients.

#### Creating a Lead (3-Step Wizard)

**Step 1: Contact Information**

| Field | Required | Description |
|-------|----------|-------------|
| **Full Name** | Yes | Name of the contact person |
| **Email Address** | Yes | Valid email address |
| **Phone Number** | Yes | Minimum 10 digits |
| **Company** | Yes | Company or organization name |
| **Website** | No | Company website (full URL) |

**Step 2: Lead Details**

| Field | Required | Options |
|-------|----------|---------|
| **Lead Source** | Yes | Website, Referral, LinkedIn, Cold Call, Exhibition/Trade Show, Partner, Social Media, Other |
| **Status** | No | NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, NEGOTIATION |
| **Priority** | No | LOW, MEDIUM, HIGH, CRITICAL |
| **Estimated Value (INR)** | No | Expected deal value in Rupees |
| **Notes** | No | Any additional information |

**Step 3: Assignment & Follow-up**

| Field | Required | Description |
|-------|----------|-------------|
| **Assign To** | No | Select a team member to handle this lead |
| **Next Follow-up Date** | No | When to follow up next |

#### Lead Status Workflow

```
NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → NEGOTIATION → WON
                                                          → LOST
```

| Status | Meaning |
|--------|---------|
| **NEW** | Fresh lead, not yet contacted |
| **CONTACTED** | First contact made |
| **QUALIFIED** | Lead meets your criteria, worth pursuing |
| **PROPOSAL_SENT** | Quotation/proposal sent to lead |
| **NEGOTIATION** | In discussion about terms/pricing |
| **WON** | Lead converted to client |
| **LOST** | Lead did not convert |

#### Converting a Lead to Client

1. Open the lead detail page
2. Click the **Convert to Client** button
3. The lead data is automatically transferred to a new client record

---

### 4.2 Clients (`/clients`)

A **Client** is a confirmed customer with whom you have (or will have) a business relationship.

#### Creating a Client

| Field | Required | Validation | Description |
|-------|----------|------------|-------------|
| **Company Name** | Yes | — | Legal company name |
| **Client Type** | Yes | — | See options below |
| **Contact Person** | Yes | — | Primary contact name |
| **Website** | No | — | Company website |
| **Email Address** | Yes | Valid email | Primary email |
| **Phone Number** | Yes | Min 10 digits | Primary phone |
| **Street Address** | No | — | Office/site address |
| **City** | Yes | — | City name |
| **State** | Yes | — | Indian state (dropdown with all 30 states + UTs) |
| **PIN Code** | No | — | 6-digit postal code |
| **Country** | No | — | Default: India |
| **GST Number** | No | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` | 15-character GSTIN (auto-uppercased) |
| **PAN Number** | No | `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` | 10-character PAN (auto-uppercased) |
| **Notes** | No | — | Additional notes |

#### Client Type Options

| Type | When to Use |
|------|-------------|
| **Real Estate Developer** | Companies building residential/commercial properties |
| **Construction Company** | General construction firms |
| **Government Body** | Municipal corporations, PWD, housing boards |
| **Infrastructure Developer** | Road, bridge, metro, airport projects |
| **Industrial Client** | Factory, warehouse, plant construction |
| **Institutional Client** | Schools, hospitals, government offices |
| **Individual Client** | Individual house owners |

---

## 5. Projects Module

### 5.1 Creating a Project (4-Step Wizard)

#### Step 1: Basic Information

| Field | Required | Description |
|-------|----------|-------------|
| **Project Name** | Yes | Descriptive name (e.g., "Worli Sky Residences Tower A") |
| **Project Code** | Auto | Auto-generated: `PRJ-YYYY-NNN` |
| **Description** | No | Brief project description |
| **Project Type** | Yes | Residential Tower, Commercial Complex, Infrastructure, Industrial, Highway, Bridge, Institutional, Mixed Use |
| **Client** | Yes | Select from existing clients (14+ pre-loaded Indian companies) |

#### Step 2: Location

| Field | Required | Description |
|-------|----------|-------------|
| **Site Address** | No | Full address |
| **City** | Yes | City name |
| **State** | Yes | Indian state (dropdown) |
| **Country** | No | Default: India |
| **Latitude** | No | GPS latitude coordinate |
| **Longitude** | No | GPS longitude coordinate |
| **Total Area (sq.ft)** | No | Site area |
| **Number of Floors** | No | Building floors |

#### Step 3: Financial

| Field | Required | Description |
|-------|----------|-------------|
| **Project Budget (INR)** | Yes | Total allocated budget |
| **Estimated Cost (INR)** | No | Expected actual cost |
| **Start Date** | Yes | Project kickoff date |
| **End Date** | Yes | Expected completion date |

#### Step 4: Assignment

| Field | Required | Description |
|-------|----------|-------------|
| **Project Manager** | Yes | Select from managers |
| **Team Members** | No | Select multiple engineers/surveyors |
| **Project Notes** | No | Internal notes |

### 5.2 Project Statuses

| Status | Meaning |
|--------|---------|
| **PLANNING** | Project is being set up |
| **IN_PROGRESS** | Active, work ongoing |
| **ON_HOLD** | Temporarily paused |
| **COMPLETED** | Finished |
| **CANCELLED** | Project cancelled |

---

## 6. Survey & Field Module

This is the **core module** of BuildSurvey Pro. A survey is a detailed site inspection with checklists, measurements, photos, and risk assessments.

### 6.1 Survey List (`/surveys`)

- View all surveys in a table with search and filters
- **Filters**: Status, Type, Project, Engineer, Date Range
- **Bulk Actions**: Select multiple surveys for batch operations
- **KPI Stats**: Total, In Progress, Completed, Pending counts

### 6.2 Creating a Survey — 7-Step Wizard (`/surveys/new`)

---

#### Step 1: Project Selection

| Field | Required | Options |
|-------|----------|---------|
| **Project** | Yes | Select the project this survey belongs to |
| **Survey Type** | Yes | See below |
| **Survey Title** | Yes | Descriptive title (e.g., "Foundation Inspection - Phase 1") |
| **Description** | No | Detailed scope and objectives |

**Survey Types:**

| Type | When to Use |
|------|-------------|
| **Initial Survey** | First visit to a new site — baseline data collection |
| **Detailed Survey** | In-depth inspection of specific areas or systems |
| **Follow-up Survey** | Revisit to check progress or rectification |
| **Final Survey** | Pre-handover comprehensive inspection |
| **As-Built Survey** | Documenting actual built conditions vs drawings |

---

#### Step 2: Schedule & Assignment

| Field | Required | Options |
|-------|----------|---------|
| **Scheduled Date** | Yes | Calendar date picker |
| **Estimated Duration** | No | e.g., "4 hours", "2 days" |
| **Assign Engineer** | Yes | Select from available engineers with specialties |
| **Priority** | No | Low, Medium, High, Critical |

**Priority Levels:**

| Level | When to Use |
|-------|-------------|
| **Low** | Routine inspection, no urgency |
| **Medium** | Standard survey, moderate importance |
| **High** | Important inspection, time-sensitive |
| **Critical** | Urgent — safety concern or deadline pressure |

---

#### Step 3: Site Information

| Field | Required | Description |
|-------|----------|-------------|
| **GPS Location** | No | Click "Get Location" for auto-detection, or enter manually |
| **Latitude** | No | e.g., 19.0760 (Mumbai) |
| **Longitude** | No | e.g., 72.8777 (Mumbai) |
| **Weather Condition** | No | Clear Sky, Cloudy, Rainy, Stormy, Foggy |
| **Site Condition** | No | Accessible, Partially Accessible, Restricted |
| **Access Details** | No | Gate codes, parking info, restricted areas |
| **Building Type** | No | Residential, Commercial, Industrial, Infrastructure |
| **Construction Stage** | No | Foundation, Structure, Finishing, Completed |
| **Number of Floors** | No | Total floors |
| **Road Width (m)** | No | Access road width in meters |
| **Boundary Type** | No | Compound Wall, Fence, Natural Barrier, None |
| **Parking** | No | Toggle: Available / Not Available |

---

#### Step 4: Infrastructure

This step captures the available utilities and safety systems at the site.

**Electricity:**

| Field | When Visible | Options |
|-------|-------------|---------|
| **Electricity Available** | Always | Toggle On/Off |
| **Connection Type** | If On | 3-Phase, 1-Phase, HT Connection |
| **Load (kVA)** | If On | Numeric value |

**Water:**

| Field | When Visible | Options |
|-------|-------------|---------|
| **Water Available** | Always | Toggle On/Off |
| **Water Source** | If On | Municipal Supply, Borewell, Water Tanker |

**Drainage:**

| Field | When Visible | Options |
|-------|-------------|---------|
| **Drainage Connected** | Always | Toggle On/Off |
| **Drainage Type** | If On | Storm Water, Sewage, Both |

**Fire Safety:**

| Field | When Visible | Options |
|-------|-------------|---------|
| **Fire Safety Available** | Always | Toggle On/Off |
| **Extinguishers (Qty)** | If On | Number of fire extinguishers |
| **Sprinklers (Qty)** | If On | Number of sprinkler heads |
| **Alarm System** | If On | Manual, Automatic, Both |

**Structure Condition:**

| Field | Description |
|-------|-------------|
| **Condition Rating** | Star rating from 1 to 5 (1=Poor, 2=Fair, 3=Good, 4=Very Good, 5=Excellent) |

---

#### Step 5: Checklist

The checklist ensures you inspect every critical item during the survey.

**Default Checklist Categories & Items:**

| Category | Items |
|----------|-------|
| **Structural** | Foundation condition assessment, Column and beam inspection, Load-bearing wall evaluation, Slab thickness verification, Rebar placement verification |
| **Electrical** | Main distribution panel inspection, Wiring and conduit assessment, Grounding system verification, Lighting fixture evaluation |
| **Plumbing** | Water supply line inspection, Drainage system assessment, Fire sprinkler system check |
| **Safety** | Fire exit accessibility check, Emergency lighting verification, PPE availability check |
| **Environmental** | Air quality assessment, Noise level measurement, Dust control measures |

**How to Use:**
1. Check off each item as you inspect it
2. Add **Notes** for any item that needs special attention
3. Click **Add Item** to add custom checklist items to any category
4. Select a **Category** and type the **Item description** for new items

---

#### Step 6: Media & Documentation

Upload or capture media directly during the survey.

| Media Type | Allowed Formats | Max Size |
|-----------|----------------|----------|
| **Photos** | JPEG, JPG, PNG, WebP, HEIC, HEIF | 50 MB each |
| **Videos** | MP4, QuickTime, AVI, WebM, Matroska | 50 MB each |
| **Voice Notes** | Audio recording (built-in recorder) | — |
| **Documents** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV | 50 MB each |

**How to Upload:**
- **Click to Upload**: Click the upload area and select files from your device
- **Drag & Drop**: Drag files directly into the upload zone
- **Camera**: On mobile, tap to open camera for live capture
- **Voice Recorder**: Click the microphone icon to start recording, click again to stop

---

#### Step 7: Review & Submit

1. **Review** all information from Steps 1–6
2. Click **Edit** on any section to make changes
3. **Digital Signature**: Click the signature pad to draw your signature
4. Choose an action:
   - **Save Draft** — Save without submitting (you can edit later)
   - **Create & Submit** — Submit for review and approval

---

### 6.3 Survey Detail Page (`/surveys/[id]`)

After creation, the survey detail page has **9 tabs**:

| Tab | Content |
|-----|---------|
| **Overview** | Summary of all survey information |
| **Checklist** | All checklist items with completion status |
| **Photos** | Photo gallery with grid/list views |
| **Videos** | Video gallery with player |
| **Voice Notes** | Audio recordings with waveform |
| **Sketches** | Hand-drawn sketches and diagrams |
| **Measurements** | Length, width, height, area, volume data |
| **Risks** | Identified risks with severity levels |
| **Materials** | Material requirements and specifications |

### 6.4 Adding Measurements

| Field | Description |
|-------|-------------|
| **Category** | Foundation, Column, Slab, Beam, Wall, etc. |
| **Description** | What was measured |
| **Length** | In meters |
| **Width** | In meters |
| **Height** | In meters |
| **Unit** | m, cm, mm, ft, etc. |
| **Notes** | Additional observations |

### 6.5 Adding Risks

| Field | Description |
|-------|-------------|
| **Risk Title** | Short description of the risk |
| **Description** | Detailed explanation |
| **Severity** | Low, Medium, High |
| **Mitigation** | How to address/prevent this risk |

### 6.6 Other Survey Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Assignments** | `/surveys/assignments` | Kanban board view of survey assignments (To Do, In Progress, Done) |
| **Checklists** | `/surveys/checklist` | Manage survey checklists templates |
| **GPS Tracking** | `/surveys/gps` | View GPS tracking data for field engineers |

---

## 7. Finance Module — BOQ, Estimation & Quotations

### 7.1 BOQ — Bill of Quantities (`/boq`)

A BOQ lists all construction items with quantities and rates for cost calculation.

#### BOQ Item Fields

| Field | Description |
|-------|-------------|
| **S.No** | Auto-incrementing serial number |
| **Description** | Item description (e.g., "Earthwork excavation in foundation trenches") |
| **Category** | Earthwork, Concrete, Masonry, Finishing, Plumbing, Electrical, HVAC |
| **Unit** | Cum (cubic meter), Sqm (square meter), Rmt (running meter), Nos (numbers), Set, Mtr (meter), Bags, Tonnes |
| **Quantity** | Numeric quantity |
| **Rate (INR)** | Price per unit in Rupees |
| **Amount (INR)** | Auto-calculated: Quantity × Rate |

**Features:**
- Items are grouped by **collapsible category sections**
- Each category shows a **subtotal**
- **Grand Total** includes 18% GST
- **Export** to Excel, PDF, or Print

### 7.2 Cost Estimation (`/estimation`)

Track estimated vs actual costs for budget control.

| Field | Description |
|-------|-------------|
| **Category** | Cost category (materials, labor, equipment, etc.) |
| **Description** | What the cost is for |
| **Estimated Amount** | Budgeted amount |
| **Actual Amount** | Real spent amount |
| **Variance** | Auto-calculated difference |

### 7.3 Quotations (`/quotations`)

Create professional quotations for clients.

#### Creating a Quotation (4-Step Wizard)

**Step 1: Project & Details**

| Field | Required | Description |
|-------|----------|-------------|
| **Select Project** | Yes | Link to a project |
| **Quotation Title** | Yes | e.g., "Site Survey Quotation - Phase 1" |
| **Description** | No | Scope of work |

**Step 2: Line Items**

| Field | Description |
|-------|-------------|
| **Description** | Item/service description |
| **Unit** | Nos, Cum, Sqm, Rmt, Set, Mtr, Bags, Tonnes |
| **Quantity** | Number of units |
| **Rate (INR)** | Price per unit |
| **Amount (INR)** | Auto-calculated |

**Step 3: Tax & Terms**

| Field | Options |
|-------|---------|
| **GST %** | 5%, 12%, 18%, 28% |
| **Discount %** | 0–100 |
| **Terms & Conditions** | Pre-filled with 8 standard terms (editable) |

**Step 4: Review & Submit**
- Full quotation preview with company header
- Line items table with subtotals
- Discount, GST, and Grand Total
- Terms & Conditions
- **Save as Draft** or **Send Quotation**

---

## 8. Media & Documents

### 8.1 Media Hub (`/media`)

Central hub for all media across surveys and projects.

| Sub-page | URL | Content |
|----------|-----|---------|
| **Media Hub** | `/media` | Overview of all media |
| **Photos** | `/media/photos` | Photo gallery with grid/list views |
| **Videos** | `/media/videos` | Video gallery |
| **Voice Notes** | `/media/voice-notes` | Audio recordings |
| **Sketches** | `/media/sketches` | Hand-drawn diagrams |
| **Drawings** | `/media/drawings` | Technical drawings |

### 8.2 Documents (`/documents`)

Manage project documents: contracts, reports, drawings, specifications.

| Field | Description |
|-------|-------------|
| **Title** | Document name |
| **Description** | What the document contains |
| **Type** | DRAWING, SPECIFICATION, CONTRACT, INVOICE, REPORT, CORRESPONDENCE, OTHER |
| **File** | Upload PDF, DOC, XLS, etc. (max 50 MB) |

---

## 9. Risk Assessment & Materials

### 9.1 Risk Assessment (`/risks`)

Identify and manage project risks.

| Field | Description |
|-------|-------------|
| **Title** | Risk name |
| **Description** | Detailed explanation |
| **Level** | Low, Medium, High, Critical |
| **Mitigation** | Action plan to address the risk |
| **Survey** | Link to originating survey |
| **Identified By** | Team member who identified it |

### 9.2 Materials (`/materials`)

Track material requirements and inventory.

| Field | Description |
|-------|-------------|
| **Material Name** | e.g., "Portland Cement OPC 43 Grade" |
| **Specification** | Technical specifications |
| **Quantity** | Required amount |
| **Unit** | kg, bags, tons, cum, etc. |
| **Estimated Cost** | Expected cost in INR |
| **Supplier** | Vendor/supplier name |
| **Notes** | Additional details |

---

## 10. Workflow & Digital Signatures

### 10.1 Workflows (`/workflows`)

Workflows define approval chains and automated processes.

#### Workflow Step Types

| Type | Icon | Description |
|------|------|-------------|
| **Approval** | ✅ | Requires someone to approve before proceeding |
| **Review** | 👁 | Review step — examine and provide feedback |
| **Notification** | 🔔 | Send notification to stakeholders |
| **Condition** | 🔀 | Conditional branch — different paths based on criteria |
| **Parallel** | ⑂ | Execute multiple steps simultaneously |

#### Workflow Step Statuses

| Status | Meaning |
|--------|---------|
| **Pending** | Waiting to start |
| **Active** | Currently in progress |
| **Completed** | Finished successfully |
| **Rejected** | Rejected — may need rework |

#### Workflow Templates (`/workflows/templates`)

Pre-built workflows for common processes:
- **Survey Approval** — Engineer → Supervisor → Client sign-off
- **BOQ Review** — Prepare → Review → Approve
- **Change Order** — Request → Evaluate → Approve → Implement

#### Workflow Engine (`/workflows/engine`)

Visual drag-and-drop workflow builder:
1. Add steps from the palette (Approval, Review, Notification, Condition, Parallel)
2. Connect steps with arrows
3. Configure each step (assignee, deadline, conditions)
4. Save and activate

### 10.2 Approvals (`/workflows/approvals`)

View and manage all pending approvals across the platform.

### 10.3 Digital Signatures (`/signatures`)

Sign documents digitally for official approvals.

**Signature Types:**
- **Drawn** — Draw with mouse or finger on touch screen
- **Typed** — Type your name in signature font
- **Uploaded** — Upload an image of your signature

---

## 11. Communication — Notifications, Email & WhatsApp

### 11.1 Notifications (`/notifications`)

In-app notification center.

| Type | Icon | Meaning |
|------|------|---------|
| **INFO** | ℹ️ | General information |
| **SUCCESS** | ✅ | Completed action |
| **WARNING** | ⚠️ | Needs attention |
| **ERROR** | ❌ | Something went wrong |

**Preferences** (`/notifications/preferences`): Control which notifications you receive and how (in-app, email, push).

### 11.2 Email (`/email`)

Integrated email communication. Send and track emails to clients and team members.

### 11.3 WhatsApp (`/whatsapp`)

Send WhatsApp messages for quick field communication.

---

## 12. Reports & Analytics

### 12.1 Reports (`/reports`)

#### Generating a Report (`/reports/generate`)

**Step 1: Select Report Type**

| Type | Description |
|------|-------------|
| **Survey Report** | Detailed survey findings and documentation |
| **Project Report** | Project status, progress, and metrics |
| **BOQ Report** | Bill of quantities with cost breakdown |
| **Financial Report** | Revenue, expenses, and budget analysis |
| **Daily Report** | Day-wise activity summary |

**Step 2: Select Sections**

| Section | Content |
|---------|---------|
| **Report Header** | Company name, logo, report title |
| **Project Details** | Project name, client, dates, budget |
| **GPS Location** | Site coordinates and map |
| **Measurements Table** | All recorded measurements |
| **Checklist Summary** | Checklist completion status |
| **Photo Documentation** | Key photos with captions |
| **Risk Assessment** | Identified risks and mitigations |
| **Remarks & Notes** | Surveyor observations |
| **Digital Signatures** | Approval signatures |

**Step 3: Preview & Download**
- Preview the report
- Download as **PDF**
- **Print** directly

### 12.2 Analytics (`/analytics`)

| Dashboard | Content |
|-----------|---------|
| **General** | Overall business metrics and trends |
| **Team** (`/analytics/team`) | Individual engineer/surveyor performance |
| **Financial** (`/analytics/financial`) | Revenue trends, cost analysis, budget utilization |

---

## 13. Administration

### 13.1 Users (`/users`)

#### Creating a User

| Field | Required | Options |
|-------|----------|---------|
| **First Name** | Yes | — |
| **Last Name** | Yes | — |
| **Email Address** | Yes | — |
| **Phone Number** | Yes | — |
| **Employee ID** | Yes | Format: EMP-XXX |
| **Department** | Yes | Administration, Engineering, Project Management, Survey, Finance, External, Human Resources, IT & Infrastructure |
| **Designation** | Yes | e.g., "Senior Civil Engineer" |
| **Date of Joining** | Yes | — |
| **Role** | Yes | See roles below |
| **Initial Password** | Yes | Min 8 characters |
| **Account Status** | No | Active / Disabled |
| **Profile Photo** | No | JPG, PNG, GIF (max 2 MB) |

#### User Roles

| Role | Access Level |
|------|-------------|
| **Super Admin** | Full system access, including settings and user management |
| **Admin** | Most features, cannot manage system settings |
| **Manager** | Projects, surveys, team management, reports |
| **Engineer** | Assigned projects and surveys, field data entry |
| **Surveyor** | Survey execution, checklists, media capture |
| **Client** | View-only access to their projects and reports |
| **Accountant** | Finance module, BOQ, quotations, payments |

### 13.2 Roles & Permissions (`/roles`)

Customize role permissions using the permission matrix. Toggle permissions for each module (View, Create, Edit, Delete).

### 13.3 Masters (`/masters`)

Manage master data — the dropdown options used across the platform.

| Feature | Description |
|---------|-------------|
| **Categories** | Create/edit item categories (e.g., material types, project types) |
| **Items** | Create/edit items within categories |
| **Units** | Measurement units (Cum, Sqm, Nos, etc.) |

### 13.4 Audit Log (`/audit`)

View a complete history of all actions in the system:
- Who performed the action
- What was changed (old vs new values)
- When it happened
- IP address

### 13.5 API Manager (`/api-manager`)

Manage API keys for external integrations. Create, revoke, and set permissions for API access.

### 13.6 Settings (`/settings`)

| Tab | Key Settings |
|-----|-------------|
| **General** | App name, language (English), timezone (Asia/Kolkata), date format (dd/MM/yyyy), currency (INR), fiscal year start (April), auto-logout, dark mode |
| **Company** | Company name, logo, address, contact info |
| **Appearance** | Theme colors, sidebar style |
| **Security** | Password policy, 2FA, session timeout |
| **Integrations** | Third-party service connections |
| **Email** | SMTP configuration |
| **Storage** | File storage settings |
| **Backup** | Database backup and restore |

---

## 14. AI Features

### 14.1 AI Hub (`/ai`)

Central dashboard for AI-powered features:

| Feature | Description |
|---------|-------------|
| **OCR Scanner** | Extract text from construction documents |
| **Image Analysis** | AI-powered analysis of site photos |
| **Risk Prediction** | Predict project risks from historical data |
| **Smart Scheduling** | AI-optimized survey scheduling |
| **Cost Prediction** | Estimate costs based on project parameters |
| **Quality Assessment** | Evaluate construction quality from images |

### 14.2 OCR Scanner (`/ai/ocr`)

1. Upload a document or take a photo
2. AI extracts text automatically
3. Review and copy the extracted text
4. Save to project documents

---

## 15. Offline & Mobile

### 15.1 Offline Support (`/offline`)

- Work without internet connection
- Data is stored locally on your device
- **Sync** automatically reconnects and uploads when back online
- View sync status: synced, pending, or failed items

### 15.2 Mobile Layout

- **Bottom navigation** for quick access on phones
- **Slide-out sidebar** via hamburger menu
- **Touch-optimized** buttons and form fields
- **Camera integration** for live photo capture

---

## 16. Glossary

| Term | Definition |
|------|-----------|
| **BOQ** | Bill of Quantities — itemized list of construction work with quantities and rates |
| **GST** | Goods and Services Tax — Indian indirect tax (5%, 12%, 18%, 28%) |
| **PAN** | Permanent Account Number — 10-character Indian tax ID |
| **GSTIN** | GST Identification Number — 15-character unique taxpayer number |
| **GPS** | Global Positioning System — satellite-based location tracking |
| **OCR** | Optical Character Recognition — converting images to text |
| **PWA** | Progressive Web App — installable web application |
| **INR** | Indian Rupee (₹) |
| **Cum** | Cubic Meter — volume measurement |
| **Sqm** | Square Meter — area measurement |
| **Rmt** | Running Meter — linear measurement |
| **kVA** | Kilovolt-Ampere — electrical load measurement |
| **HT** | High Tension — high voltage power supply |
| **PCM** | Pre-Cast Concrete |
| **RCC** | Reinforced Cement Concrete |
| **PCC** | Plain Cement Concrete |
| **MEP** | Mechanical, Electrical & Plumbing |
| **PW** | Public Works |
| **L&T** | Larsen & Toubro (major Indian construction company) |
| **NHAI** | National Highways Authority of India |

---

## 17. Appendix — Complete Reference Tables

### A. Indian States & Union Territories

Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal, Delhi, Chandigarh, Puducherry

### B. Project Types

Residential Tower, Commercial Complex, Infrastructure, Industrial, Highway, Bridge, Institutional, Mixed Use

### C. Survey Types

Initial Survey, Detailed Survey, Follow-up Survey, Final Survey, As-Built Survey

### D. Survey Statuses

DRAFT → ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED → REJECTED

### E. Lead Sources

Website, Referral, LinkedIn, Cold Call, Exhibition/Trade Show, Partner, Social Media, Other

### F. File Upload Limits

| Type | Formats | Max Size |
|------|---------|----------|
| Images | JPEG, JPG, PNG, WebP, HEIC, HEIF | 50 MB |
| Videos | MP4, QuickTime, AVI, WebM, Matroska | 50 MB |
| Documents | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV | 50 MB |
| Profile Photos | JPG, PNG, GIF | 2 MB |

### G. GST Rates

| Rate | Common Usage |
|------|-------------|
| 5% | Essential construction materials |
| 12% | Cement, building materials |
| 18% | Most services, software, equipment |
| 28% | Luxury items |

### H. Measurement Units

| Unit | Full Form | Used For |
|------|-----------|----------|
| Cum | Cubic Meter | Concrete, earthwork volume |
| Sqm | Square Meter | Area measurement |
| Rmt | Running Meter | Pipes, cables, walls |
| Nos | Numbers | Countable items |
| Set | Set | Complete assemblies |
| Mtr | Meter | Length measurement |
| Bags | Bags | Cement, materials |
| Tonnes | Tonnes | Heavy materials |

### I. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search |

---

*This manual is for BuildSurvey Pro v1.0. For support, contact your system administrator.*
