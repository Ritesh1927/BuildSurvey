import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Phase 1 of the dynamic RBAC migration: seeds the fixed Permission
// catalog, seeds the 7 existing UserRole enum values as isSystem Role
// rows with the exact permission set that reproduces their CURRENT
// access (derived directly from every requireRole()/inline role check
// in src/app/api as of this migration - see the per-permission comments
// below for which file(s) each one replaces), and backfills every
// existing User's roleId/secondaryRoleId from their role/secondaryRole
// enum columns. Purely additive - nothing reads roleId/permissions yet,
// so this is safe to run against the live database at any time and to
// re-run (idempotent upserts throughout).

const SYSTEM_ROLES = [
  { key: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full access to everything, always.' },
  { key: 'ADMIN', name: 'Admin', description: 'Back-office access to nearly everything except role management.' },
  { key: 'MANAGER', name: 'Manager', description: 'Runs CRM, projects, and field operations day-to-day.' },
  { key: 'ENGINEER', name: 'Engineer', description: 'Leads projects, runs site visits, works surveys and risks.' },
  { key: 'SURVEYOR', name: 'Surveyor', description: 'Runs surveys and risk assessments in the field.' },
  { key: 'CLIENT', name: 'Client', description: 'Read-only, scoped to their own company’s projects.' },
  { key: 'ACCOUNTANT', name: 'Accountant', description: 'Handles BOQ, invoices, and payment approvals.' },
] as const

const BACK_OFFICE = ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
const ADMIN_ONLY = ['SUPER_ADMIN', 'ADMIN']

interface PermissionDef {
  key: string
  resource: string
  action: string
  label: string
  category: string
  roles: string[]
}

// Every entry below traces to a specific requireRole()/inline role
// check found by auditing src/app/api on the day this migration was
// written. `:own` / `:all` suffixes replace three previously
// inconsistent scoping idioms (SCOPED_ROLES.includes(), hasRole(),
// bare role===) with one - a role gets :all (unscoped), :own (scoped
// to whatever "own" means for that resource - leadUserId, engineerId,
// identifiedById, or clientId, decided in the route itself), or
// neither (no access).
const PERMISSIONS: PermissionDef[] = [
  // --- CRM ---
  { key: 'leads:read', resource: 'leads', action: 'read', label: 'View leads', category: 'CRM', roles: BACK_OFFICE },
  { key: 'leads:write', resource: 'leads', action: 'write', label: 'Create & edit leads', category: 'CRM', roles: BACK_OFFICE },
  { key: 'leads:delete', resource: 'leads', action: 'delete', label: 'Delete leads', category: 'CRM', roles: ADMIN_ONLY },
  { key: 'leads:convert', resource: 'leads', action: 'convert', label: 'Convert leads to clients', category: 'CRM', roles: BACK_OFFICE },
  { key: 'leads:set_initial_status', resource: 'leads', action: 'set_initial_status', label: 'Set a lead’s status on creation (instead of always starting at New)', category: 'CRM', roles: ADMIN_ONLY },

  { key: 'clients:read:all', resource: 'clients', action: 'read:all', label: 'View all clients', category: 'CRM', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT'] },
  { key: 'clients:read:own', resource: 'clients', action: 'read:own', label: 'View own client record', category: 'CRM', roles: ['CLIENT'] },
  { key: 'clients:create', resource: 'clients', action: 'create', label: 'Add clients', category: 'CRM', roles: ADMIN_ONLY },
  { key: 'clients:write', resource: 'clients', action: 'write', label: 'Edit clients', category: 'CRM', roles: BACK_OFFICE },
  { key: 'clients:delete', resource: 'clients', action: 'delete', label: 'Delete clients', category: 'CRM', roles: ['SUPER_ADMIN'] },

  // --- Projects & Field Ops ---
  { key: 'projects:read:all', resource: 'projects', action: 'read:all', label: 'View all projects', category: 'Projects', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'projects:read:own', resource: 'projects', action: 'read:own', label: 'View own projects', category: 'Projects', roles: ['ENGINEER', 'SURVEYOR', 'CLIENT'] },
  { key: 'projects:create', resource: 'projects', action: 'create', label: 'Create projects', category: 'Projects', roles: BACK_OFFICE },
  { key: 'projects:write:all', resource: 'projects', action: 'write:all', label: 'Edit any project (all fields)', category: 'Projects', roles: BACK_OFFICE },
  { key: 'projects:write:own', resource: 'projects', action: 'write:own', label: 'Edit own led project (limited fields)', category: 'Projects', roles: ['ENGINEER'] },
  { key: 'projects:delete', resource: 'projects', action: 'delete', label: 'Delete projects', category: 'Projects', roles: ADMIN_ONLY },

  { key: 'site_visits:read:all', resource: 'site_visits', action: 'read:all', label: 'View all site visits', category: 'Projects', roles: BACK_OFFICE },
  { key: 'site_visits:read:own', resource: 'site_visits', action: 'read:own', label: 'View own site visits', category: 'Projects', roles: ['ENGINEER'] },
  { key: 'site_visits:checkin', resource: 'site_visits', action: 'checkin', label: 'Check in to a site visit', category: 'Projects', roles: ['ENGINEER'] },
  { key: 'site_visits:checkout', resource: 'site_visits', action: 'checkout', label: 'Check out of a site visit', category: 'Projects', roles: ['ENGINEER'] },

  { key: 'risks:read:all', resource: 'risks', action: 'read:all', label: 'View all risk assessments', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'risks:read:own', resource: 'risks', action: 'read:own', label: 'View own identified risks', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'risks:create', resource: 'risks', action: 'create', label: 'Log risk assessments', category: 'Field Ops', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] },
  { key: 'risks:write:all', resource: 'risks', action: 'write:all', label: 'Edit any risk assessment', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'risks:write:own', resource: 'risks', action: 'write:own', label: 'Edit own identified risks', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'risks:delete', resource: 'risks', action: 'delete', label: 'Delete risk assessments', category: 'Field Ops', roles: ADMIN_ONLY },
  { key: 'risks:assign', resource: 'risks', action: 'assign', label: 'Assign a risk to someone else', category: 'Field Ops', roles: BACK_OFFICE },

  { key: 'surveys:read:all', resource: 'surveys', action: 'read:all', label: 'View all surveys', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'surveys:read:own', resource: 'surveys', action: 'read:own', label: 'View own surveys', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR', 'CLIENT'] },
  { key: 'surveys:create', resource: 'surveys', action: 'create', label: 'Create surveys', category: 'Field Ops', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR'] },
  { key: 'surveys:write:all', resource: 'surveys', action: 'write:all', label: 'Edit any survey', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'surveys:write:own', resource: 'surveys', action: 'write:own', label: 'Edit own assigned surveys', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'surveys:delete', resource: 'surveys', action: 'delete', label: 'Delete surveys', category: 'Field Ops', roles: ADMIN_ONLY },
  { key: 'surveys:assign', resource: 'surveys', action: 'assign', label: 'Assign a survey to an engineer/surveyor', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'surveys:approve', resource: 'surveys', action: 'approve', label: 'Approve or reject a submitted survey', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'surveys:checkin', resource: 'surveys', action: 'checkin', label: 'Check in to a survey', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'surveys:checkout', resource: 'surveys', action: 'checkout', label: 'Check out of a survey', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'surveys:checklist_write:own', resource: 'surveys', action: 'checklist_write:own', label: 'Fill in own survey checklist (within the checked-in window)', category: 'Field Ops', roles: ['ENGINEER', 'SURVEYOR'] },
  { key: 'surveys:checklist_override', resource: 'surveys', action: 'checklist_override', label: 'Edit any survey checklist outside the checked-in window', category: 'Field Ops', roles: BACK_OFFICE },
  { key: 'survey_checkins:read', resource: 'survey_checkins', action: 'read', label: 'View survey GPS check-in log', category: 'Field Ops', roles: BACK_OFFICE },

  // --- Financial ---
  { key: 'boq:read:all', resource: 'boq', action: 'read:all', label: 'View all BOQ items', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'boq:read:own', resource: 'boq', action: 'read:own', label: 'View BOQ items on own projects', category: 'Financial', roles: ['ENGINEER', 'SURVEYOR', 'CLIENT'] },
  { key: 'boq:create', resource: 'boq', action: 'create', label: 'Add BOQ items', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'boq:write', resource: 'boq', action: 'write', label: 'Edit BOQ items', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT'] },
  { key: 'boq:delete', resource: 'boq', action: 'delete', label: 'Delete BOQ items', category: 'Financial', roles: ADMIN_ONLY },

  { key: 'quotations:read:all', resource: 'quotations', action: 'read:all', label: 'View all invoices', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'quotations:read:own', resource: 'quotations', action: 'read:own', label: 'View invoices on own projects', category: 'Financial', roles: ['ENGINEER', 'CLIENT'] },
  { key: 'quotations:create', resource: 'quotations', action: 'create', label: 'Create invoices', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'quotations:write', resource: 'quotations', action: 'write', label: 'Edit invoices', category: 'Financial', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { key: 'quotations:delete', resource: 'quotations', action: 'delete', label: 'Delete invoices', category: 'Financial', roles: ADMIN_ONLY },
  { key: 'quotations:approve_payment', resource: 'quotations', action: 'approve_payment', label: 'Change an invoice’s payment status', category: 'Financial', roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },

  // --- Workforce ---
  { key: 'attendance:mark', resource: 'attendance', action: 'mark', label: 'Mark own attendance', category: 'Workforce', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ENGINEER', 'SURVEYOR', 'ACCOUNTANT'] },
  { key: 'attendance:read_team', resource: 'attendance', action: 'read_team', label: 'View team attendance', category: 'Workforce', roles: BACK_OFFICE },
  { key: 'users:read', resource: 'users', action: 'read', label: 'View employees', category: 'Workforce', roles: BACK_OFFICE },
  { key: 'users:create', resource: 'users', action: 'create', label: 'Add employees', category: 'Workforce', roles: ADMIN_ONLY },
  { key: 'users:write', resource: 'users', action: 'write', label: 'Edit employees', category: 'Workforce', roles: ADMIN_ONLY },
  { key: 'users:delete', resource: 'users', action: 'delete', label: 'Delete employees', category: 'Workforce', roles: ADMIN_ONLY },

  // --- Administration ---
  { key: 'settings:read', resource: 'settings', action: 'read', label: 'View organization settings', category: 'Administration', roles: BACK_OFFICE },
  { key: 'settings:write', resource: 'settings', action: 'write', label: 'Edit organization settings', category: 'Administration', roles: ADMIN_ONLY },
  { key: 'holidays:read', resource: 'holidays', action: 'read', label: 'View holiday calendar', category: 'Administration', roles: BACK_OFFICE },
  { key: 'holidays:write', resource: 'holidays', action: 'write', label: 'Edit holiday calendar', category: 'Administration', roles: ADMIN_ONLY },
  // Not granted to any role above - only ever assigned to SUPER_ADMIN via
  // the isSuperAdmin(all-permissions) rule below. Deliberately never
  // exposed as an editable checkbox in the Roles & Permissions panel,
  // since granting it is a privilege-escalation path.
  { key: 'roles:manage', resource: 'roles', action: 'manage', label: 'Manage roles & permissions', category: 'Administration', roles: [] },
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL not found'); process.exit(1) }
  console.log('Connecting to Neon...')
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  console.log(`\nSeeding ${PERMISSIONS.length} permissions...`)
  const permissionIdByKey = new Map<string, string>()
  for (const p of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { key: p.key },
      update: { resource: p.resource, action: p.action, label: p.label, category: p.category },
      create: { key: p.key, resource: p.resource, action: p.action, label: p.label, category: p.category },
    })
    permissionIdByKey.set(p.key, row.id)
  }

  console.log(`\nSeeding ${SYSTEM_ROLES.length} system roles...`)
  const roleIdByKey = new Map<string, string>()
  for (const r of SYSTEM_ROLES) {
    const row = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, isSystem: true },
      create: { key: r.key, name: r.name, description: r.description, isSystem: true },
    })
    roleIdByKey.set(r.key, row.id)
  }

  console.log('\nAssigning permissions to roles...')
  for (const roleKey of roleIdByKey.keys()) {
    const roleId = roleIdByKey.get(roleKey)!
    // Super Admin implicitly holds every permission, including any added
    // to the catalog in the future - matches the existing canManageRole
    // invariant that Super Admin can always do everything.
    const grantedKeys = roleKey === 'SUPER_ADMIN'
      ? PERMISSIONS.map((p) => p.key)
      : PERMISSIONS.filter((p) => p.roles.includes(roleKey)).map((p) => p.key)

    for (const key of grantedKeys) {
      const permissionId = permissionIdByKey.get(key)!
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      })
    }
    console.log(`  ${roleKey}: ${grantedKeys.length} permissions`)
  }

  console.log('\nBackfilling User.roleId / secondaryRoleId from legacy role/secondaryRole...')
  const users = await prisma.user.findMany({ select: { id: true, role: true, secondaryRole: true, roleId: true, secondaryRoleId: true } })
  let updated = 0
  for (const u of users) {
    const roleId = roleIdByKey.get(u.role)
    const secondaryRoleId = u.secondaryRole ? roleIdByKey.get(u.secondaryRole) ?? null : null
    if (!roleId) {
      console.warn(`  Skipping user ${u.id} - no matching Role for legacy role "${u.role}"`)
      continue
    }
    if (u.roleId === roleId && u.secondaryRoleId === secondaryRoleId) continue
    await prisma.user.update({ where: { id: u.id }, data: { roleId, secondaryRoleId } })
    updated++
  }
  console.log(`  Updated ${updated} of ${users.length} users`)

  console.log('\nDone.')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
