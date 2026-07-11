export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'SITE_ENGINEER' | 'SURVEYOR' | 'ARCHITECT' | 'CLIENT' | 'VENDOR' | 'ACCOUNTANT' | 'VIEWER'

export type ProjectStatus = 'DRAFT' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'

export type SurveyStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'DISQUALIFIED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED'

export type DocumentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  avatar?: string | null
  phone?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  address?: string | null
  gstNumber?: string | null
  PAN?: string | null
  contactPerson?: string | null
  createdAt: string
}

export interface Project {
  id: string
  name: string
  code: string
  description?: string | null
  status: ProjectStatus
  priority: Priority
  clientId: string
  client?: Client
  projectManagerId?: string | null
  projectManager?: User
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  spent?: number | null
  location?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Survey {
  id: string
  projectId: string
  project?: Project
  title: string
  description?: string | null
  status: SurveyStatus
  scheduledDate?: string | null
  completedDate?: string | null
  surveyorId?: string | null
  surveyor?: User
  findings?: string | null
  recommendations?: string | null
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  source?: string | null
  status: LeadStatus
  priority: Priority
  assignedToId?: string | null
  assignedTo?: User
  estimatedValue?: number | null
  notes?: string | null
  nextFollowUp?: string | null
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  project?: Project
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  assignedToId?: string | null
  assignedTo?: User
  dueDate?: string | null
  completedAt?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  projectId: string
  project?: Project
  clientId: string
  client?: Client
  amount: number
  taxAmount: number
  totalAmount: number
  status: PaymentStatus
  issueDate: string
  dueDate: string
  paidDate?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  projectId: string
  project?: Project
  category: string
  description: string
  amount: number
  date: string
  vendorId?: string | null
  vendor?: Client
  receiptUrl?: string | null
  createdBy: User
  createdAt: string
}

export interface Document {
  id: string
  projectId?: string | null
  project?: Project
  name: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  folder?: string | null
  tags?: string[]
  status: DocumentStatus
  uploadedBy: User
  createdAt: string
  updatedAt: string
}

export interface SitePhoto {
  id: string
  projectId: string
  project?: Project
  surveyId?: string | null
  url: string
  thumbnailUrl?: string | null
  caption?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  takenAt: string
  takenBy: User
  createdAt: string
}

export interface Measurement {
  id: string
  projectId: string
  project?: Project
  surveyId?: string | null
  name: string
  category: string
  value: number
  unit: string
  notes?: string | null
  recordedBy: User
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  projectId?: string | null
  subject?: string | null
  content: string
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  isRead: boolean
  link?: string | null
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
  error?: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: string | number | boolean | string[] | undefined
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalClients: number
  totalRevenue: number
  pendingPayments: number
  totalSurveys: number
  completedSurveys: number
  pendingTasks: number
  overdueTasks: number
  recentActivities: Activity[]
  projectStatusDistribution: StatusCount[]
  monthlyRevenue: MonthlyRevenue[]
}

export interface Activity {
  id: string
  type: string
  description: string
  userId: string
  user?: User
  projectId?: string | null
  createdAt: string
}

export interface StatusCount {
  status: string
  count: number
}

export interface MonthlyRevenue {
  month: string
  amount: number
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface ModalState {
  isOpen: boolean
  type: string | null
  data: Record<string, unknown> | null
}

export interface UserFormData {
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  password?: string
}

export interface ProjectFormData {
  name: string
  code: string
  description?: string
  clientId: string
  projectManagerId?: string
  status: ProjectStatus
  priority: Priority
  startDate?: string
  endDate?: string
  budget?: number
  location?: string
  address?: string
  latitude?: number
  longitude?: number
}

export interface SurveyFormData {
  projectId: string
  title: string
  description?: string
  status: SurveyStatus
  scheduledDate?: string
  surveyorId?: string
  findings?: string
  recommendations?: string
}

export interface LeadFormData {
  name: string
  email?: string
  phone?: string
  company?: string
  source?: string
  status: LeadStatus
  priority: Priority
  assignedToId?: string
  estimatedValue?: number
  notes?: string
  nextFollowUp?: string
}

export interface TaskFormData {
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assignedToId?: string
  dueDate?: string
  estimatedHours?: number
}

export interface InvoiceFormData {
  projectId: string
  clientId: string
  amount: number
  taxAmount: number
  issueDate: string
  dueDate: string
  notes?: string
}

export interface MessageFormData {
  receiverId: string
  projectId?: string
  subject?: string
  content: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SearchFilters {
  search?: string
  status?: string
  priority?: string
  assignedTo?: string
  projectId?: string
  clientId?: string
  dateFrom?: string
  dateTo?: string
}
