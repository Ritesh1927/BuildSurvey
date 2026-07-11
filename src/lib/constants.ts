export const APP_NAME = 'BuildSurvey Pro'
export const APP_VERSION = '1.0.0'

export const ROLES = [
  { value: 'ADMIN', label: 'Administrator', color: 'bg-violet-100 text-violet-800' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', color: 'bg-blue-100 text-blue-800' },
  { value: 'SITE_ENGINEER', label: 'Site Engineer', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'SURVEYOR', label: 'Surveyor', color: 'bg-teal-100 text-teal-800' },
  { value: 'ARCHITECT', label: 'Architect', color: 'bg-amber-100 text-amber-800' },
  { value: 'CLIENT', label: 'Client', color: 'bg-gray-100 text-gray-800' },
  { value: 'VENDOR', label: 'Vendor', color: 'bg-orange-100 text-orange-800' },
  { value: 'ACCOUNTANT', label: 'Accountant', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'VIEWER', label: 'Viewer', color: 'bg-slate-100 text-slate-800' },
] as const

export const PROJECT_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'PLANNING', label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-violet-100 text-violet-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-slate-100 text-slate-800' },
] as const

export const SURVEY_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-violet-100 text-violet-800' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-violet-100 text-violet-800' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-amber-100 text-amber-800' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
  { value: 'WON', label: 'Won', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
  { value: 'DISQUALIFIED', label: 'Disqualified', color: 'bg-gray-100 text-gray-800' },
] as const

export const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
] as const

export const SIDEBAR_NAV_ITEMS = [
  {
    group: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    group: 'CRM',
    items: [
      { label: 'Leads', href: '/leads', icon: 'Users' },
      { label: 'Clients', href: '/clients', icon: 'Building2' },
    ],
  },
  {
    group: 'Projects',
    items: [
      { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
    ],
  },
  {
    group: 'Survey & Field',
    items: [
      { label: 'Surveys', href: '/surveys', icon: 'ClipboardList' },
      { label: 'Assignments', href: '/surveys/assignments', icon: 'UserCheck' },
      { label: 'Checklists', href: '/surveys/checklist', icon: 'ListChecks' },
      { label: 'GPS Tracking', href: '/surveys/gps', icon: 'MapPin' },
      { label: 'Measurements', href: '/measurements', icon: 'Ruler' },
    ],
  },
  {
    group: 'Media',
    items: [
      { label: 'Media Hub', href: '/media', icon: 'Image' },
      { label: 'Documents', href: '/documents', icon: 'File' },
    ],
  },
  {
    group: 'Risk & Materials',
    items: [
      { label: 'Risk Assessment', href: '/risks', icon: 'ShieldAlert' },
      { label: 'Materials', href: '/materials', icon: 'Package' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'BOQ', href: '/boq', icon: 'Calculator' },
      { label: 'Cost Estimation', href: '/estimation', icon: 'TrendingUp' },
      { label: 'Quotations', href: '/quotations', icon: 'FileText' },
    ],
  },
  {
    group: 'Workflow',
    items: [
      { label: 'Workflows', href: '/workflows', icon: 'GitBranch' },
      { label: 'Digital Signatures', href: '/signatures', icon: 'PenTool' },
    ],
  },
  {
    group: 'Communication',
    items: [
      { label: 'Notifications', href: '/notifications', icon: 'Bell' },
      { label: 'Email', href: '/email', icon: 'Mail' },
      { label: 'WhatsApp', href: '/whatsapp', icon: 'MessageSquare' },
    ],
  },
  {
    group: 'Reports & Analytics',
    items: [
      { label: 'Reports', href: '/reports', icon: 'FileBarChart' },
      { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: 'Users' },
      { label: 'Roles', href: '/roles', icon: 'Lock' },
      { label: 'Masters', href: '/masters', icon: 'Database' },
      { label: 'Audit Log', href: '/audit', icon: 'ScrollText' },
      { label: 'API Manager', href: '/api-manager', icon: 'Globe' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
  {
    group: 'AI & Automation',
    items: [
      { label: 'AI Hub', href: '/ai', icon: 'Bot' },
      { label: 'OCR Scanner', href: '/ai/ocr', icon: 'ScanLine' },
    ],
  },
  {
    group: 'Help & Manual',
    items: [
      { label: 'User Manual', href: '/help', icon: 'BookOpen' },
    ],
  },
] as const

export const ITEMS_PER_PAGE = 25
export const MAX_FILE_SIZE = 50 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
] as const

export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
] as const

export const DATE_FORMAT = 'dd MMM yyyy'
export const DATETIME_FORMAT = 'dd MMM yyyy, hh:mm a'
