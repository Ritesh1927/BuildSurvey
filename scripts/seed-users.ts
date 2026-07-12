import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  const users = [
    { email: 'admin@buildsurvey.in', password: 'Admin@123', firstName: 'Saurabh', lastName: 'Patil', phone: '+919876543210', role: 'ADMIN' as const },
    { email: 'priya.sharma@buildsurvey.in', password: 'Manager@123', firstName: 'Priya', lastName: 'Sharma', phone: '+919876543211', role: 'MANAGER' as const },
    { email: 'raj.mehta@buildsurvey.in', password: 'Engineer@123', firstName: 'Raj', lastName: 'Mehta', phone: '+919876543212', role: 'ENGINEER' as const },
    { email: 'neha.gupta@buildsurvey.in', password: 'Surveyor@123', firstName: 'Neha', lastName: 'Gupta', phone: '+919876543213', role: 'SURVEYOR' as const },
  ]

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    const hashedPassword = await bcrypt.hash(u.password, 12)
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { password: hashedPassword, isActive: true } })
      console.log(`Updated: ${u.email}`)
    } else {
      await prisma.user.create({ data: { email: u.email, password: hashedPassword, firstName: u.firstName, lastName: u.lastName, phone: u.phone, role: u.role, isActive: true } })
      console.log(`Created: ${u.email}`)
    }
  }

  console.log('\nAdmin: admin@buildsurvey.in / Admin@123')
  await prisma.$disconnect()
}

main().catch(console.error)
