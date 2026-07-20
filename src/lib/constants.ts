import type { UserRole } from '@/generated/prisma/enums'

export const APP_NAME = 'BuildSurvey Pro'
export const APP_VERSION = '1.0.0'

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

export const SIDEBAR_NAV_ITEMS: readonly {
  group: string
  items: readonly {
    label: string
    href: string
    icon: string
    roles?: readonly UserRole[]
  }[]
}[] = [
  {
    group: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    group: 'CRM',
    items: [
      { label: 'Leads', href: '/leads', icon: 'Users', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER'] },
      { label: 'Clients', href: '/clients', icon: 'Building2', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT'] },
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
      { label: 'Surveys', href: '/surveys', icon: 'ClipboardList', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'CLIENT'] },
      { label: 'Site Visits', href: '/surveys/gps', icon: 'MapPin', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    group: 'Risk & Finance',
    items: [
      { label: 'Risk Assessment', href: '/risks', icon: 'ShieldAlert', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] },
      { label: 'BOQ', href: '/boq', icon: 'Calculator' },
      { label: 'Quotations', href: '/quotations', icon: 'FileText', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT', 'CLIENT'] },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: 'Users', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { label: 'Settings', href: '/settings', icon: 'Settings', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
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
