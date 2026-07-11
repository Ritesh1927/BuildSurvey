'use client'

import { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  HardDrive,
  ArrowUpDown,
  FileText,
  Camera,
  Ruler,
  ToggleLeft,
  ToggleRight,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatDateTime } from '@/lib/utils'

interface SyncItem {
  id: string
  entityType: string
  action: string
  timestamp: string
  status: 'pending' | 'synced' | 'failed'
}

const mockSyncQueue: SyncItem[] = [
  { id: 'SYN-001', entityType: 'Survey', action: 'Create', timestamp: '2026-07-11T09:30:00', status: 'pending' },
  { id: 'SYN-002', entityType: 'Photo', action: 'Upload', timestamp: '2026-07-11T09:25:00', status: 'pending' },
  { id: 'SYN-003', entityType: 'Measurement', action: 'Update', timestamp: '2026-07-11T09:20:00', status: 'pending' },
  { id: 'SYN-004', entityType: 'Survey', action: 'Update', timestamp: '2026-07-11T08:45:00', status: 'synced' },
  { id: 'SYN-005', entityType: 'Photo', action: 'Upload', timestamp: '2026-07-11T08:30:00', status: 'synced' },
  { id: 'SYN-006', entityType: 'Measurement', action: 'Create', timestamp: '2026-07-11T08:15:00', status: 'synced' },
  { id: 'SYN-007', entityType: 'Survey', action: 'Delete', timestamp: '2026-07-11T07:50:00', status: 'failed' },
  { id: 'SYN-008', entityType: 'Photo', action: 'Upload', timestamp: '2026-07-11T07:30:00', status: 'synced' },
  { id: 'SYN-009', entityType: 'Measurement', action: 'Create', timestamp: '2026-07-11T07:00:00', status: 'synced' },
  { id: 'SYN-010', entityType: 'Survey', action: 'Create', timestamp: '2026-07-10T18:00:00', status: 'synced' },
]

const entityIcons: Record<string, React.ReactNode> = {
  Survey: <FileText className="h-4 w-4" />,
  Photo: <Camera className="h-4 w-4" />,
  Measurement: <Ruler className="h-4 w-4" />,
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  synced: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  failed: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [syncQueue, setSyncQueue] = useState(mockSyncQueue)
  const [lastSyncTime] = useState('2026-07-11T09:25:00')
  const [isSyncing, setIsSyncing] = useState(false)
  const [storageUsage] = useState({ used: 45.2, total: 500, percent: 9 })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const pendingCount = syncQueue.filter((i) => i.status === 'pending').length
  const syncedCount = syncQueue.filter((i) => i.status === 'synced').length
  const failedCount = syncQueue.filter((i) => i.status === 'failed').length

  const handleSyncNow = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setSyncQueue((prev) =>
        prev.map((item) =>
          item.status === 'pending' ? { ...item, status: 'synced' as const } : item
        )
      )
      setIsSyncing(false)
    }, 2000)
  }

  const clearSynced = () => {
    setSyncQueue((prev) => prev.filter((item) => item.status !== 'synced'))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Offline Sync
          </h1>
          <p className="text-muted-foreground">
            Manage offline data and synchronization status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSynced}
            disabled={syncedCount === 0}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Clear Synced
          </Button>
          <Button
            size="sm"
            onClick={handleSyncNow}
            disabled={!isOnline || isSyncing || pendingCount === 0}
          >
            {isSyncing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-4 w-4" />
            )}
            Sync Now
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Connection</p>
                <p className={cn('text-2xl font-bold', isOnline ? 'text-emerald-600' : 'text-red-600')}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                {isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'Connected to server' : 'Working offline'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Sync</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <ArrowUpDown className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0 ? 'Items waiting to sync' : 'All items synced'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                <p className="text-sm font-bold">
                  {new Date(lastSyncTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                {new Date(lastSyncTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className={cn('text-2xl font-bold', failedCount > 0 ? 'text-red-600' : '')}>{failedCount}</p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', failedCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600')}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                {failedCount > 0 ? 'Items need attention' : 'No failures'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Sync Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Sync Queue</CardTitle>
              <CardDescription>Items pending synchronization</CardDescription>
            </div>
            <Badge variant="outline">{syncQueue.length} items</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncQueue.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No items in sync queue
                      </TableCell>
                    </TableRow>
                  ) : (
                    syncQueue.map((item) => {
                      const statConf = statusConfig[item.status]
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {entityIcons[item.entityType] || <FileText className="h-4 w-4" />}
                              <span className="text-sm font-medium">{item.entityType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{item.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(item.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', statConf.bgColor, statConf.color)}>
                              {statConf.icon}
                              {item.status}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Auto Sync Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Auto Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {autoSync ? (
                    <Cloud className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <CloudOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{autoSync ? 'Enabled' : 'Disabled'}</p>
                    <p className="text-xs text-muted-foreground">Sync when online</p>
                  </div>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={storageUsage.percent} showValue />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{storageUsage.used} MB used</span>
                <span>{storageUsage.total} MB total</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Surveys</span>
                  <span className="font-medium">12.4 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium">28.1 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Measurements</span>
                  <span className="font-medium">4.7 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={clearSynced}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Synced Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Export Offline Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Offline Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
