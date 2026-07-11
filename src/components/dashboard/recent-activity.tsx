'use client'

import Link from 'next/link'
import { ActivityTimeline, type ActivityItem } from './activity-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const recentActivities: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'project_completed',
    title: 'Survey Completed',
    description: 'Foundation survey for Phoenix Tower completed with all checkpoints passed.',
    user: { firstName: 'Raj', lastName: 'Mehta' },
    timestamp: '2026-07-11T09:30:00',
  },
  {
    id: 'act-002',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'Received ₹4,50,000 from Greenfield Estates for Phase 2 survey.',
    user: { firstName: 'Priya', lastName: 'Sharma' },
    timestamp: '2026-07-11T08:15:00',
  },
  {
    id: 'act-003',
    type: 'member_added',
    title: 'Team Member Added',
    description: 'Amit Kumar joined as Site Engineer for Metro Residency project.',
    user: { firstName: 'Saurabh', lastName: 'Verma' },
    timestamp: '2026-07-10T17:45:00',
  },
  {
    id: 'act-004',
    type: 'file_uploaded',
    title: 'Documents Uploaded',
    description: '5 new site photos and 2 measurement reports uploaded to Cloudview Apartments.',
    user: { firstName: 'Neha', lastName: 'Gupta' },
    timestamp: '2026-07-10T15:20:00',
  },
  {
    id: 'act-005',
    type: 'alert',
    title: 'Schedule Conflict Detected',
    description: 'Two surveys scheduled for 15th July at the same location. Please review.',
    user: { firstName: 'System', lastName: '' },
    timestamp: '2026-07-10T14:00:00',
  },
  {
    id: 'act-006',
    type: 'proposal_sent',
    title: 'Proposal Sent',
    description: 'Detailed survey proposal sent to Urban Spaces Pvt. Ltd. for review.',
    user: { firstName: 'Priya', lastName: 'Sharma' },
    timestamp: '2026-07-10T11:30:00',
  },
  {
    id: 'act-007',
    type: 'lead_created',
    title: 'New Lead Received',
    description: 'New inquiry from Heritage Builders for a heritage restoration survey.',
    user: { firstName: 'Saurabh', lastName: 'Verma' },
    timestamp: '2026-07-10T10:00:00',
  },
  {
    id: 'act-008',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Soil testing report for Hillside Villas has been reviewed and approved.',
    user: { firstName: 'Raj', lastName: 'Mehta' },
    timestamp: '2026-07-09T18:00:00',
  },
  {
    id: 'act-009',
    type: 'survey_scheduled',
    title: 'Survey Scheduled',
    description: 'Pre-construction survey for Sunrise Enclave scheduled for July 16.',
    user: { firstName: 'Neha', lastName: 'Gupta' },
    timestamp: '2026-07-09T14:30:00',
  },
  {
    id: 'act-010',
    type: 'comment',
    title: 'New Comment',
    description: 'Raj commented on the structural survey findings for Metro Residency.',
    user: { firstName: 'Raj', lastName: 'Mehta' },
    timestamp: '2026-07-09T10:15:00',
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analytics">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ActivityTimeline activities={recentActivities} />
      </CardContent>
    </Card>
  )
}
