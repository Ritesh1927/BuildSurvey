// @ts-nocheck
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@buildsurvey.com' },
    update: {},
    create: {
      email: 'admin@buildsurvey.com',
      password: '$2b$10$hashedpassword', // In production, hash with bcrypt
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('Admin user created:', adminUser.email)

  // 2. Create Manager User
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@buildsurvey.com' },
    update: {},
    create: {
      email: 'manager@buildsurvey.com',
      password: '$2b$10$hashedpassword',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91 98765 43211',
      role: 'MANAGER',
      isActive: true,
    },
  })
  console.log('Manager user created:', managerUser.email)

  // 3. Create Engineer Users
  const engineers = [
    { email: 'priya.sharma@buildsurvey.com', firstName: 'Priya', lastName: 'Sharma', phone: '+91 98765 43212' },
    { email: 'amit.patel@buildsurvey.com', firstName: 'Amit', lastName: 'Patel', phone: '+91 98765 43213' },
    { email: 'sneha.reddy@buildsurvey.com', firstName: 'Sneha', lastName: 'Reddy', phone: '+91 98765 43214' },
    { email: 'vikram.singh@buildsurvey.com', firstName: 'Vikram', lastName: 'Singh', phone: '+91 98765 43215' },
  ]

  for (const eng of engineers) {
    await prisma.user.upsert({
      where: { email: eng.email },
      update: {},
      create: {
        ...eng,
        password: '$2b$10$hashedpassword',
        role: 'ENGINEER',
        isActive: true,
      },
    })
  }
  console.log('Engineer users created')

  // 4. Create Surveyor Users
  const surveyors = [
    { email: 'rahul.verma@buildsurvey.com', firstName: 'Rahul', lastName: 'Verma', phone: '+91 98765 43216' },
    { email: 'anjali.nair@buildsurvey.com', firstName: 'Anjali', lastName: 'Nair', phone: '+91 98765 43217' },
  ]

  for (const sur of surveyors) {
    await prisma.user.upsert({
      where: { email: sur.email },
      update: {},
      create: {
        ...sur,
        password: '$2b$10$hashedpassword',
        role: 'SURVEYOR',
        isActive: true,
      },
    })
  }
  console.log('Surveyor users created')

  // 5. Create Clients
  const clients = [
    {
      companyName: 'Tata Realty & Infrastructure Ltd',
      contactPerson: 'Suresh Mehta',
      email: 'suresh@tatar Realty.com',
      phone: '+91 22 6665 8000',
      address: 'Bombay House, 24 Homi Mody Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      gstNumber: '27AABCT1234F1Z5',
      panNumber: 'AABCT1234F',
    },
    {
      companyName: 'DLF Limited',
      contactPerson: 'Mohit Gupta',
      email: 'mohit@dlf.in',
      phone: '+91 124 456 7890',
      address: 'DLF Centre, 14th Floor',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122002',
      country: 'India',
      gstNumber: '06AABCD5678G1Z8',
      panNumber: 'AABCD5678G',
    },
    {
      companyName: 'Larsen & Toubro Ltd',
      contactPerson: 'Anil Kapoor',
      email: 'anil@ltindia.com',
      phone: '+91 22 6752 5678',
      address: 'L&T House, N.M. Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      gstNumber: '27AABCL9012H1Z3',
      panNumber: 'AABCL9012H',
    },
    {
      companyName: 'Godrej Properties Ltd',
      contactPerson: 'Pirojsha Godrej',
      email: 'pirojsha@godrejproperty.com',
      phone: '+91 22 6188 8000',
      address: 'Godrej BKC, Plot C-68',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400051',
      country: 'India',
      gstNumber: '27AABCG3456I1Z1',
      panNumber: 'AABCG3456I',
    },
    {
      companyName: 'Oberoi Realty Ltd',
      contactPerson: 'Vikas Oberoi',
      email: 'vikas@oberoirealty.com',
      phone: '+91 22 6699 9999',
      address: 'Oberoi Realty, 701 Devcor Tower',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400053',
      country: 'India',
      gstNumber: '27AABCO7890J1Z6',
      panNumber: 'AABCO7890J',
    },
    {
      companyName: 'Brigade Enterprises Ltd',
      contactPerson: 'M R Kamath',
      email: 'mrkamath@brigade.in',
      phone: '+91 80 4040 5050',
      address: 'Brigade Gateway, 26/1 Dr Rajkumar Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560055',
      country: 'India',
      gstNumber: '29AABCB2345K1Z4',
      panNumber: 'AABCB2345K',
    },
  ]

  const createdClients = []
  for (const client of clients) {
    const c = await prisma.client.create({ data: client })
    createdClients.push(c)
  }
  console.log(`${createdClients.length} clients created`)

  // 6. Create Projects
  const projects = [
    {
      name: 'Tata Primus Luxury Residences',
      code: 'PRJ-2024-001',
      description: 'Premium residential project with 200+ apartments in Powai, Mumbai',
      type: 'RESIDENTIAL',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-31'),
      budget: 450000000,
      actualCost: 180000000,
      address: 'Powai Lake Road, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.1197,
      longitude: 72.9063,
      area: 250000,
      floors: 32,
      clientId: createdClients[0].id,
      managerId: managerUser.id,
      leadUserId: adminUser.id,
    },
    {
      name: 'DLF Cyber City Phase 4',
      code: 'PRJ-2024-002',
      description: 'Commercial office complex with Grade-A office spaces',
      type: 'COMMERCIAL',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-06-30'),
      budget: 800000000,
      actualCost: 320000000,
      address: 'Cyber City, DLF Phase 4',
      city: 'Gurugram',
      state: 'Haryana',
      latitude: 28.4949,
      longitude: 77.0883,
      area: 500000,
      floors: 24,
      clientId: createdClients[1].id,
      managerId: managerUser.id,
    },
    {
      name: 'L&T Tech Center',
      code: 'PRJ-2024-003',
      description: 'Technology park with R&D facilities and data center',
      type: 'INDUSTRIAL',
      status: 'PLANNING',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2026-03-31'),
      budget: 600000000,
      actualCost: 45000000,
      address: 'Navi Mumbai, Airoli',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      latitude: 19.1584,
      longitude: 72.9958,
      area: 350000,
      floors: 12,
      clientId: createdClients[2].id,
      managerId: managerUser.id,
    },
    {
      name: 'Godrej Platinum Interiors',
      code: 'PRJ-2024-004',
      description: 'Premium interior fit-out for residential tower common areas',
      type: 'INTERIOR',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-12-31'),
      budget: 75000000,
      actualCost: 35000000,
      address: 'Vikhroli West, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.1744,
      longitude: 72.9234,
      area: 80000,
      floors: 1,
      clientId: createdClients[3].id,
      managerId: managerUser.id,
    },
    {
      name: 'Oberoi Sky City MEP',
      code: 'PRJ-2024-005',
      description: 'MEP services for mixed-use development',
      type: 'MEP',
      status: 'ON_HOLD',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-06-30'),
      budget: 120000000,
      actualCost: 28000000,
      address: 'Borivali East, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.2813,
      longitude: 72.8568,
      area: 180000,
      floors: 40,
      clientId: createdClients[4].id,
      managerId: managerUser.id,
    },
    {
      name: 'Brigade Orchid Renovation',
      code: 'PRJ-2024-006',
      description: 'Complete renovation of clubhouse and amenities',
      type: 'RENOVATION',
      status: 'COMPLETED',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      budget: 35000000,
      actualCost: 32000000,
      address: 'Orchid Layout, North Bangalore',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 13.0827,
      longitude: 77.5877,
      area: 25000,
      floors: 3,
      clientId: createdClients[5].id,
      managerId: managerUser.id,
    },
  ]

  const createdProjects = []
  for (const project of projects) {
    const p = await prisma.project.create({ data: project })
    createdProjects.push(p)
  }
  console.log(`${createdProjects.length} projects created`)

  // 7. Create Surveys
  const surveys = [
    {
      title: 'Initial Site Survey - Tata Primus',
      description: 'Comprehensive site survey for foundation assessment',
      type: 'INITIAL',
      status: 'APPROVED',
      scheduledDate: new Date('2024-02-01'),
      completedDate: new Date('2024-02-03'),
      gpsLatitude: 19.1197,
      gpsLongitude: 72.9063,
      weatherCondition: 'Clear, 28°C',
      siteCondition: 'Accessible, level ground',
      accessDetails: 'Main gate from Powai Lake Road',
      projectId: createdProjects[0].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'priya.sharma@buildsurvey.com' } }))!.id,
    },
    {
      title: 'Structural Assessment - DLF Cyber City',
      description: 'Structural integrity assessment for existing structures',
      type: 'DETAILED',
      status: 'IN_PROGRESS',
      scheduledDate: new Date('2024-04-15'),
      gpsLatitude: 28.4949,
      gpsLongitude: 77.0883,
      weatherCondition: 'Partly cloudy, 35°C',
      siteCondition: 'Active construction zone',
      accessDetails: 'Security pass required from site office',
      projectId: createdProjects[1].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'amit.patel@buildsurvey.com' } }))!.id,
    },
    {
      title: 'MEP Survey - Oberoi Sky City',
      description: 'MEP installation survey for residential floors',
      type: 'FOLLOW_UP',
      status: 'ASSIGNED',
      scheduledDate: new Date('2024-05-01'),
      projectId: createdProjects[4].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'sneha.reddy@buildsurvey.com' } }))!.id,
    },
    {
      title: 'Interior Measurement - Godrej Platinum',
      description: 'Detailed measurements for interior fit-out BOQ',
      type: 'DETAILED',
      status: 'SUBMITTED',
      scheduledDate: new Date('2024-04-20'),
      completedDate: new Date('2024-04-22'),
      gpsLatitude: 19.1744,
      gpsLongitude: 72.9234,
      weatherCondition: 'Clear, 30°C',
      siteCondition: 'Indoor, ready for fit-out',
      projectId: createdProjects[3].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'vikram.singh@buildsurvey.com' } }))!.id,
    },
    {
      title: 'Renovation As-Built - Brigade Orchid',
      description: 'As-built survey for completed renovation',
      type: 'AS_BUILT',
      status: 'APPROVED',
      scheduledDate: new Date('2024-06-15'),
      completedDate: new Date('2024-06-18'),
      gpsLatitude: 13.0827,
      gpsLongitude: 77.5877,
      weatherCondition: 'Rainy, 24°C',
      siteCondition: 'Completed, handover stage',
      projectId: createdProjects[5].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'priya.sharma@buildsurvey.com' } }))!.id,
    },
    {
      title: 'Final Survey - L&T Tech Center',
      description: 'Pre-construction final site survey',
      type: 'FINAL',
      status: 'DRAFT',
      scheduledDate: new Date('2024-07-01'),
      projectId: createdProjects[2].id,
      engineerId: (await prisma.user.findUnique({ where: { email: 'amit.patel@buildsurvey.com' } }))!.id,
    },
  ]

  const createdSurveys = []
  for (const survey of surveys) {
    const s = await prisma.survey.create({ data: survey })
    createdSurveys.push(s)
  }
  console.log(`${createdSurveys.length} surveys created`)

  // 8. Create Leads
  const leads = [
    { name: 'Arjun Mehta', email: 'arjun@shapoorji.com', phone: '+91 98765 43301', company: 'Shapoorji Pallonji', source: 'Referral', status: 'QUALIFIED', priority: 'HIGH', estimatedValue: 50000000, assignedToId: managerUser.id },
    { name: 'Deepa Iyer', email: 'deepa@ashokleyland.in', phone: '+91 98765 43302', company: 'Ashok Leyland Realty', source: 'Website', status: 'NEW', priority: 'MEDIUM', estimatedValue: 30000000 },
    { name: 'Karthik Menon', email: 'karthik@kalyan.in', phone: '+91 98765 43303', company: 'Kalyan Developers', source: 'Cold Call', status: 'CONTACTED', priority: 'LOW', estimatedValue: 20000000, assignedToId: managerUser.id },
    { name: 'Nisha Agarwal', email: 'nisha@prestige.in', phone: '+91 98765 43304', company: 'Prestige Group', source: 'Email Campaign', status: 'PROPOSAL', priority: 'HIGH', estimatedValue: 80000000, assignedToId: managerUser.id },
    { name: 'Ravi Krishnan', email: 'ravi@sobha.com', phone: '+91 98765 43305', company: 'Sobha Ltd', source: 'Trade Show', status: 'NEGOTIATION', priority: 'MEDIUM', estimatedValue: 45000000, assignedToId: managerUser.id },
  ]

  for (const lead of leads) {
    await prisma.lead.create({ data: lead })
  }
  console.log(`${leads.length} leads created`)

  // 9. Create BOQ Items for Project 1
  const boqItems = [
    { serialNumber: 1, description: 'Earthwork Excavation', category: 'Earthwork', unit: 'Cum', quantity: 12500, unitRate: 350, amount: 4375000, projectId: createdProjects[0].id },
    { serialNumber: 2, description: 'PCC Foundation (1:4:8)', category: 'Concrete', unit: 'Cum', quantity: 3200, unitRate: 4500, amount: 14400000, projectId: createdProjects[0].id },
    { serialNumber: 3, description: 'RCC Foundation (M30)', category: 'Concrete', unit: 'Cum', quantity: 5600, unitRate: 6500, amount: 36400000, projectId: createdProjects[0].id },
    { serialNumber: 4, description: 'Brick Masonry (9")', category: 'Masonry', unit: 'Cum', quantity: 8500, unitRate: 5200, amount: 44200000, projectId: createdProjects[0].id },
    { serialNumber: 5, description: 'Plastering (12mm)', category: 'Finishing', unit: 'Sqm', quantity: 45000, unitRate: 180, amount: 8100000, projectId: createdProjects[0].id },
    { serialNumber: 6, description: 'Painting (Internal)', category: 'Finishing', unit: 'Sqm', quantity: 38000, unitRate: 120, amount: 4560000, projectId: createdProjects[0].id },
    { serialNumber: 7, description: 'CPVC Plumbing', category: 'Plumbing', unit: 'Rmt', quantity: 12000, unitRate: 450, amount: 5400000, projectId: createdProjects[0].id },
    { serialNumber: 8, description: 'Electrical Wiring', category: 'Electrical', unit: 'Rmt', quantity: 25000, unitRate: 280, amount: 7000000, projectId: createdProjects[0].id },
    { serialNumber: 9, description: 'AC Ducting', category: 'HVAC', unit: 'Sqm', quantity: 8000, unitRate: 850, amount: 6800000, projectId: createdProjects[0].id },
    { serialNumber: 10, description: 'Floor Tiles (Vitrified)', category: 'Finishing', unit: 'Sqm', quantity: 32000, unitRate: 650, amount: 20800000, projectId: createdProjects[0].id },
  ]

  for (const item of boqItems) {
    await prisma.bOQItem.create({ data: item })
  }
  console.log(`${boqItems.length} BOQ items created`)

  // 10. Create Quotations
  const quotation1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QUO-2024-001',
      title: 'Survey & BOQ - Tata Primus Residences',
      totalAmount: 2500000,
      taxAmount: 450000,
      discountAmount: 125000,
      grandTotal: 2825000,
      validUntil: new Date('2024-12-31'),
      terms: 'Payment: 50% advance, 50% on completion. Valid for 30 days.',
      status: 'PAID',
      projectId: createdProjects[0].id,
      items: {
        create: [
          { description: 'Initial Site Survey', unit: 'LS', quantity: 1, unitRate: 500000, amount: 500000 },
          { description: 'Detailed Measurement Survey', unit: 'LS', quantity: 1, unitRate: 750000, amount: 750000 },
          { description: 'BOQ Preparation', unit: 'LS', quantity: 1, unitRate: 600000, amount: 600000 },
          { description: 'Photo Documentation', unit: 'LS', quantity: 1, unitRate: 150000, amount: 150000 },
          { description: 'Risk Assessment Report', unit: 'LS', quantity: 1, unitRate: 250000, amount: 250000 },
          { description: 'Project Monitoring (6 months)', unit: 'Month', quantity: 6, unitRate: 41667, amount: 250000 },
        ],
      },
    },
  })
  console.log('Quotation created:', quotation1.quotationNumber)

  // 11. Create Settings
  const settings = [
    { key: 'app_name', value: 'BuildSurvey Pro', group: 'general', description: 'Application name' },
    { key: 'app_version', value: '1.0.0', group: 'general', description: 'Application version' },
    { key: 'company_name', value: 'BuildSurvey Pro Pvt Ltd', group: 'company', description: 'Company name' },
    { key: 'company_address', value: '42, Business Park, Andheri East', group: 'company', description: 'Company address' },
    { key: 'company_phone', value: '+91 22 4567 8900', group: 'company', description: 'Company phone' },
    { key: 'company_email', value: 'info@buildsurvey.com', group: 'company', description: 'Company email' },
    { key: 'company_gst', value: '27AABCB1234N1Z5', group: 'company', description: 'GST Number' },
    { key: 'company_pan', value: 'AABCB1234N', group: 'company', description: 'PAN Number' },
    { key: 'currency', value: 'INR', group: 'general', description: 'Default currency' },
    { key: 'timezone', value: 'Asia/Kolkata', group: 'general', description: 'Default timezone' },
    { key: 'date_format', value: 'DD/MM/YYYY', group: 'general', description: 'Date format' },
    { key: 'items_per_page', value: '25', group: 'general', description: 'Items per page' },
    { key: 'primary_color', value: '#2563eb', group: 'appearance', description: 'Primary theme color' },
    { key: 'sidebar_theme', value: 'dark', group: 'appearance', description: 'Sidebar color theme' },
    { key: 'password_min_length', value: '8', group: 'security', description: 'Minimum password length' },
    { key: 'session_timeout', value: '60', group: 'security', description: 'Session timeout in minutes' },
    { key: 'smtp_host', value: 'smtp.gmail.com', group: 'email', description: 'SMTP host' },
    { key: 'smtp_port', value: '587', group: 'email', description: 'SMTP port' },
    { key: 'max_file_size', value: '52428800', group: 'storage', description: 'Max file upload size in bytes (50MB)' },
    { key: 'auto_backup', value: 'true', group: 'backup', description: 'Enable automatic backups' },
    { key: 'backup_frequency', value: 'daily', group: 'backup', description: 'Backup frequency' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log(`${settings.length} settings created`)

  // 12. Create Master Categories
  const categories = [
    { name: 'Material Types', code: 'MAT', description: 'Construction material types' },
    { name: 'Measurement Units', code: 'UNIT', description: 'Units of measurement' },
    { name: 'Survey Categories', code: 'SURVEY_CAT', description: 'Survey classification categories' },
    { name: 'Project Types', code: 'PROJ_TYPE', description: 'Types of projects' },
    { name: 'Risk Categories', code: 'RISK', description: 'Risk classification' },
    { name: 'Document Types', code: 'DOC', description: 'Document classification' },
    { name: 'Lead Sources', code: 'LEAD_SRC', description: 'Source of leads' },
    { name: 'Payment Terms', code: 'PAY_TERM', description: 'Payment terms' },
    { name: 'Tax Codes', code: 'TAX', description: 'Tax code classification' },
    { name: 'Cities', code: 'CITY', description: 'City master' },
  ]

  for (const cat of categories) {
    const existing = await prisma.masterCategory.findFirst({ where: { code: cat.code } })
    if (!existing) {
      await prisma.masterCategory.create({ data: cat })
    }
  }
  console.log(`${categories.length} master categories created`)

  // 13. Create Master Items for Measurement Units
  const unitCategory = await prisma.masterCategory.findFirst({ where: { code: 'UNIT' } })
  if (unitCategory) {
    const units = [
      { name: 'Square Feet', code: 'SQFT', unit: 'Sq Ft' },
      { name: 'Square Meter', code: 'SQM', unit: 'Sqm' },
      { name: 'Cubic Feet', code: 'CUFT', unit: 'Cu Ft' },
      { name: 'Cubic Meter', code: 'CUM', unit: 'Cum' },
      { name: 'Running Meter', code: 'RMT', unit: 'Rmt' },
      { name: 'Numbers', code: 'NOS', unit: 'Nos' },
      { name: 'Kilogram', code: 'KG', unit: 'Kg' },
      { name: 'Quintal', code: 'QTL', unit: 'Qtl' },
      { name: 'Ton', code: 'TON', unit: 'Ton' },
      { name: 'Liter', code: 'LTR', unit: 'Ltr' },
      { name: 'Each', code: 'EA', unit: 'Ea' },
      { name: 'Lot', code: 'LS', unit: 'LS' },
    ]

    for (const unit of units) {
      const existing = await prisma.masterItem.findFirst({ where: { code: unit.code } })
      if (!existing) {
        await prisma.masterItem.create({ data: { ...unit, categoryId: unitCategory.id } })
      }
    }
    console.log(`${units.length} measurement units created`)
  }

  // 14. Create Audit Logs
  const auditActions = [
    { userId: adminUser.id, action: 'CREATED', entityType: 'User', entityId: adminUser.id, ipAddress: '127.0.0.1' },
    { userId: adminUser.id, action: 'CREATED', entityType: 'Project', entityId: createdProjects[0].id, ipAddress: '127.0.0.1' },
    { userId: managerUser.id, action: 'ASSIGNED', entityType: 'Survey', entityId: createdSurveys[0].id, ipAddress: '192.168.1.100' },
    { userId: adminUser.id, action: 'APPROVED', entityType: 'Quotation', entityId: quotation1.id, ipAddress: '127.0.0.1' },
  ]

  for (const log of auditActions) {
    await prisma.auditLog.create({ data: log })
  }
  console.log(`${auditActions.length} audit logs created`)

  console.log('\nSeeding completed successfully!')
  console.log('================================')
  console.log('Login credentials:')
  console.log('Admin:   admin@buildsurvey.com')
  console.log('Manager: manager@buildsurvey.com')
  console.log('Engineer: priya.sharma@buildsurvey.com')
  console.log('================================')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
