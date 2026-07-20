'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  MapPin,
  RefreshCw,
  Camera,
  LogIn,
  LogOut,
  Ruler,
  Package,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { formatDate } from '@/lib/utils'

interface SiteVisitPhoto {
  caption: string
  url: string
  latitude: number | null
  longitude: number | null
  takenAt: string | null
}

interface GeoCheck {
  onSite: boolean | null
  distanceMeters: number | null
}

interface SiteVisit {
  surveyId: string
  surveyTitle: string
  status: string
  projectId: string
  projectName: string
  engineerName: string
  checkedInAt: string
  checkedOutAt: string | null
  checkInPhoto: SiteVisitPhoto | null
  checkOutPhoto: SiteVisitPhoto | null
  checkIn: GeoCheck
  checkOut: GeoCheck
  measurementCount: number
  materialCount: number
}

function SiteBadge({ check }: { check: GeoCheck }) {
  if (check.onSite === null) {
    return (
      <Badge variant="secondary" className="text-[9px] gap-1">
        <HelpCircle className="h-3 w-3" />Unknown
      </Badge>
    )
  }
  return check.onSite ? (
    <Badge variant="success" className="text-[9px] gap-1">
      <CheckCircle2 className="h-3 w-3" />On Site
    </Badge>
  ) : (
    <Badge variant="destructive" className="text-[9px] gap-1">
      <XCircle className="h-3 w-3" />Off Site ({check.distanceMeters}m away)
    </Badge>
  )
}

export default function SiteVisitsPage() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/site-visits')
      const data = await res.json()
      if (data.success) setSiteVisits(data.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const inProgress = siteVisits.filter((v) => !v.checkedOutAt).length
  const completed = siteVisits.filter((v) => v.checkedOutAt).length
  const offSiteFlags = siteVisits.filter(
    (v) => v.checkIn.onSite === false || v.checkOut.onSite === false
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Visits"
        description="Check-in/check-out log for field surveys, verified against each project's site coordinates"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Site Visits' }]}
        actions={
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<MapPin className="h-6 w-6" />} label="Total Visits" value={siteVisits.length} color="info" />
        <StatCard icon={<LogIn className="h-6 w-6" />} label="On-Site Now" value={inProgress} color="success" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label="Completed" value={completed} color="info" />
        <StatCard icon={<XCircle className="h-6 w-6" />} label="Off-Site Flags" value={offSiteFlags} color="warning" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />Recent Site Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading...</p>
          ) : siteVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No site visits yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Surveyors check in from the survey detail page once assigned
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteVisits.map((visit) => (
                <Link
                  key={visit.surveyId}
                  href={`/surveys/${visit.surveyId}`}
                  className="block rounded-lg border p-3 space-y-2 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{visit.surveyTitle}</p>
                    <Badge variant={visit.checkedOutAt ? 'success' : 'info'} className="text-[10px] shrink-0 ml-2">
                      {visit.checkedOutAt ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{visit.engineerName} · {visit.projectName}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><LogIn className="h-3 w-3" />Check-In</div>
                      {visit.checkInPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={visit.checkInPhoto.url} alt="Check-in" className="w-full aspect-square rounded-md border object-cover" />
                      ) : (
                        <div className="w-full aspect-square rounded-md border bg-muted flex items-center justify-center"><Camera className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                      <p className="text-[10px] text-muted-foreground">{formatDate(visit.checkedInAt)}</p>
                      <SiteBadge check={visit.checkIn} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><LogOut className="h-3 w-3" />Check-Out</div>
                      {visit.checkOutPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={visit.checkOutPhoto.url} alt="Check-out" className="w-full aspect-square rounded-md border object-cover" />
                      ) : (
                        <div className="w-full aspect-square rounded-md border border-dashed flex items-center justify-center"><span className="text-[10px] text-muted-foreground">Pending</span></div>
                      )}
                      {visit.checkedOutAt && <p className="text-[10px] text-muted-foreground">{formatDate(visit.checkedOutAt)}</p>}
                      {visit.checkedOutAt && <SiteBadge check={visit.checkOut} />}
                    </div>
                  </div>

                  {visit.checkedOutAt && (
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{visit.measurementCount} measurements</span>
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{visit.materialCount} materials</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
