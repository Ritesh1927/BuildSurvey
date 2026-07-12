"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Settings,
  Building2,
  Palette,
  Shield,
  Plug,
  Mail,
  HardDrive,
  Database,
  Save,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Globe,
  Clock,
  DollarSign,
  Lock,
  Smartphone,
  Key,
  Server,
  Cloud,
  Download,
  RefreshCw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { showSuccess, showError } from "@/components/ui/toast"

const tabs = [
  { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
  { id: "company", label: "Company", icon: <Building2 className="h-4 w-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "integrations", label: "Integrations", icon: <Plug className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { id: "storage", label: "Storage", icon: <HardDrive className="h-4 w-4" /> },
  { id: "backup", label: "Backup", icon: <Database className="h-4 w-4" /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    appName: "CivilSite Pro",
    defaultLanguage: "en-IN",
    timezone: "Asia/Kolkata",
    dateFormat: "dd/MM/yyyy",
    currency: "INR",
    fiscalYearStart: "April",
    autoLogout: true,
    darkMode: false,
  })

  const [companySettings, setCompanySettings] = useState({
    companyName: "Saurabh Constructions Pvt. Ltd.",
    address: "402,彩虹 Tower, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    phone: "+91 98765 43210",
    email: "admin@saurabhconstructions.com",
    website: "https://saurabhconstructions.com",
    gstNumber: "27AABCS1234N1Z5",
    panNumber: "AABCS1234N",
    tanNumber: "MUMS12345B",
    cinNumber: "U45200MH2020PTC123456",
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: "#3b82f6",
    sidebarTheme: "dark",
    fontSize: "medium",
    logoUrl: "",
    compactMode: false,
    showAnimations: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: "8",
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    passwordExpiryDays: "90",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    ipWhitelist: "",
    maxLoginAttempts: "5",
    lockoutDuration: "15",
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    googleMapsKey: "",
    whatsappApiKey: "",
    smsProvider: "twilio",
    smsApiKey: "",
    paymentGateway: "razorpay",
    razorpayKey: "",
    googleAnalyticsId: "",
    stripeKey: "",
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "noreply@saurabhconstructions.com",
    smtpPassword: "••••••••••••",
    fromAddress: "noreply@saurabhconstructions.com",
    fromName: "CivilSite Pro",
    encryption: "TLS",
    smtpAuth: true,
  })

  const [storageSettings, setStorageSettings] = useState({
    provider: "local",
    s3Bucket: "",
    s3Region: "ap-south-1",
    s3AccessKey: "",
    s3SecretKey: "",
    azureConnectionString: "",
    azureContainer: "",
    maxFileSize: "50",
    allowedTypes: "jpg,png,pdf,doc,docx,xls,xlsx",
    localPath: "/uploads",
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    frequency: "daily",
    retentionDays: "30",
    lastBackup: "2026-07-10T02:30:00Z",
    nextBackup: "2026-07-11T02:30:00Z",
    backupSize: "2.4 GB",
    includeFiles: true,
    includeDatabase: true,
    compressBackup: true,
  })

  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (data.success && data.grouped) {
        if (data.grouped.general) {
          const g: Record<string, string> = {}
          data.grouped.general.forEach((s: { key: string; value: string }) => { g[s.key] = s.value })
          setGeneralSettings(prev => ({ ...prev, ...g }))
        }
        if (data.grouped.company) {
          const c: Record<string, string> = {}
          data.grouped.company.forEach((s: { key: string; value: string }) => { c[s.key] = s.value })
          setCompanySettings(prev => ({ ...prev, ...c }))
        }
        if (data.grouped.appearance) {
          const a: Record<string, string | boolean> = {}
          data.grouped.appearance.forEach((s: { key: string; value: string }) => {
            if (s.value === "true" || s.value === "false") a[s.key] = s.value === "true"
            else a[s.key] = s.value
          })
          setAppearanceSettings(prev => ({ ...prev, ...a }))
        }
        if (data.grouped.security) {
          const s: Record<string, string | boolean> = {}
          data.grouped.security.forEach((item: { key: string; value: string }) => {
            if (item.value === "true" || item.value === "false") s[item.key] = item.value === "true"
            else s[item.key] = item.value
          })
          setSecuritySettings(prev => ({ ...prev, ...s }))
        }
        if (data.grouped.integrations) {
          const i: Record<string, string> = {}
          data.grouped.integrations.forEach((s: { key: string; value: string }) => { i[s.key] = s.value })
          setIntegrationSettings(prev => ({ ...prev, ...i }))
        }
        if (data.grouped.email) {
          const e: Record<string, string | boolean> = {}
          data.grouped.email.forEach((s: { key: string; value: string }) => {
            if (s.value === "true" || s.value === "false") e[s.key] = s.value === "true"
            else e[s.key] = s.value
          })
          setEmailSettings(prev => ({ ...prev, ...e }))
        }
        if (data.grouped.storage) {
          const st: Record<string, string> = {}
          data.grouped.storage.forEach((s: { key: string; value: string }) => { st[s.key] = s.value })
          setStorageSettings(prev => ({ ...prev, ...st }))
        }
        if (data.grouped.backup) {
          const b: Record<string, string | boolean> = {}
          data.grouped.backup.forEach((s: { key: string; value: string }) => {
            if (s.value === "true" || s.value === "false") b[s.key] = s.value === "true"
            else b[s.key] = s.value
          })
          setBackupSettings(prev => ({ ...prev, ...b }))
        }
      }
    } catch {
      // Settings not available, keep defaults
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settings = [
        ...Object.entries(generalSettings).map(([key, value]) => ({ key, value: String(value), group: "general" })),
        ...Object.entries(companySettings).map(([key, value]) => ({ key, value: String(value), group: "company" })),
        ...Object.entries(appearanceSettings).map(([key, value]) => ({ key, value: String(value), group: "appearance" })),
        ...Object.entries(securitySettings).map(([key, value]) => ({ key, value: String(value), group: "security" })),
        ...Object.entries(integrationSettings).map(([key, value]) => ({ key, value: String(value), group: "integrations" })),
        ...Object.entries(emailSettings).map(([key, value]) => ({ key, value: String(value), group: "email" })),
        ...Object.entries(storageSettings).map(([key, value]) => ({ key, value: String(value), group: "storage" })),
        ...Object.entries(backupSettings).map(([key, value]) => ({ key, value: String(value), group: "backup" })),
      ]
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (data.success) {
        showSuccess("Settings saved successfully")
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        showError(data.error || "Failed to save settings")
      }
    } catch {
      showError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage application configuration and system preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings" },
        ]}
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      {saved && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-2 py-3">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              Settings saved successfully
            </span>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 justify-start">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application Name</label>
                  <Input
                    value={generalSettings.appName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, appName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Language</label>
                  <Select
                    value={generalSettings.defaultLanguage}
                    onValueChange={(v) =>
                      setGeneralSettings({ ...generalSettings, defaultLanguage: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                      <SelectItem value="mr-IN">Marathi (India)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(v) =>
                      setGeneralSettings({ ...generalSettings, timezone: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Format</label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(v) =>
                      setGeneralSettings({ ...generalSettings, dateFormat: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Currency
                  </label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(v) =>
                      setGeneralSettings({ ...generalSettings, currency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fiscal Year Start</label>
                  <Select
                    value={generalSettings.fiscalYearStart}
                    onValueChange={(v) =>
                      setGeneralSettings({ ...generalSettings, fiscalYearStart: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="April">April (India Standard)</SelectItem>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Preferences</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Logout</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.autoLogout}
                    onCheckedChange={(v) =>
                      setGeneralSettings({ ...generalSettings, autoLogout: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Enable dark theme for the application
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.darkMode}
                    onCheckedChange={(v) =>
                      setGeneralSettings({ ...generalSettings, darkMode: v })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your company details for invoices and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={companySettings.companyName}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, companyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={companySettings.website}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={companySettings.address}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={companySettings.city}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={companySettings.state}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">PIN Code</label>
                  <Input
                    value={companySettings.pincode}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, pincode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Phone
                  </label>
                  <Input
                    value={companySettings.phone}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">GST Number</label>
                  <Input
                    value={companySettings.gstNumber}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, gstNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">PAN Number</label>
                  <Input
                    value={companySettings.panNumber}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, panNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">TAN Number</label>
                  <Input
                    value={companySettings.tanNumber}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, tanNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CIN Number</label>
                  <Input
                    value={companySettings.cinNumber}
                    onChange={(e) =>
                      setCompanySettings({ ...companySettings, cinNumber: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="h-10 w-14 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={appearanceSettings.primaryColor}
                      onChange={(e) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sidebar Theme</label>
                  <Select
                    value={appearanceSettings.sidebarTheme}
                    onValueChange={(v) =>
                      setAppearanceSettings({ ...appearanceSettings, sidebarTheme: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size</label>
                  <Select
                    value={appearanceSettings.fontSize}
                    onValueChange={(v) =>
                      setAppearanceSettings({ ...appearanceSettings, fontSize: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("logo-upload-input")?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/png,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0]
                          setAppearanceSettings({ ...appearanceSettings, logoUrl: URL.createObjectURL(file) })
                          showSuccess("Logo uploaded")
                          e.target.value = ""
                        }
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Recommended: 200x60px, PNG/SVG
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Display Options</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Reduce padding and spacing for more content
                    </p>
                  </div>
                  <Switch
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(v) =>
                      setAppearanceSettings({ ...appearanceSettings, compactMode: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Animations</p>
                    <p className="text-xs text-muted-foreground">
                      Enable transitions and animated effects
                    </p>
                  </div>
                  <Switch
                    checked={appearanceSettings.showAnimations}
                    onCheckedChange={(v) =>
                      setAppearanceSettings({ ...appearanceSettings, showAnimations: v })
                    }
                  />
                </div>
              </div>
              {/* Color Preview */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg"
                    style={{ backgroundColor: appearanceSettings.primaryColor }}
                  />
                  <div
                    className="h-10 px-4 rounded-lg flex items-center text-white text-sm font-medium"
                    style={{ backgroundColor: appearanceSettings.primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="h-6 px-3 rounded-full flex items-center text-white text-xs font-medium"
                    style={{ backgroundColor: appearanceSettings.primaryColor }}
                  >
                    Badge
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure password policies and security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Policy
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Length</label>
                    <Input
                      type="number"
                      value={securitySettings.minPasswordLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          minPasswordLength: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry (Days)</label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiryDays}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordExpiryDays: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Login Attempts</label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lockout (Min)</label>
                    <Input
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          lockoutDuration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Require Special Characters</p>
                      <p className="text-xs text-muted-foreground">Must include !@#$%^&*</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(v) =>
                        setSecuritySettings({ ...securitySettings, requireSpecialChars: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Require Numbers</p>
                      <p className="text-xs text-muted-foreground">Must include digits</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireNumbers}
                      onCheckedChange={(v) =>
                        setSecuritySettings({ ...securitySettings, requireNumbers: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Require Uppercase</p>
                      <p className="text-xs text-muted-foreground">Must include uppercase letters</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireUppercase}
                      onCheckedChange={(v) =>
                        setSecuritySettings({ ...securitySettings, requireUppercase: v })
                      }
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">
                      Add an extra layer of security with TOTP
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(v) =>
                      setSecuritySettings({ ...securitySettings, twoFactorEnabled: v })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Session & Access
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Timeout (Min)</label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">IP Whitelist</label>
                    <Input
                      placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          ipWhitelist: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Configure third-party service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Google Maps API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your Google Maps API key"
                    value={integrationSettings.googleMapsKey}
                    onChange={(e) =>
                      setIntegrationSettings({
                        ...integrationSettings,
                        googleMapsKey: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    For site mapping and GPS features
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Business API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your WhatsApp Business API key"
                    value={integrationSettings.whatsappApiKey}
                    onChange={(e) =>
                      setIntegrationSettings({
                        ...integrationSettings,
                        whatsappApiKey: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    For client communication via WhatsApp
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMS Provider</label>
                  <Select
                    value={integrationSettings.smsProvider}
                    onValueChange={(v) =>
                      setIntegrationSettings({ ...integrationSettings, smsProvider: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="msg91">MSG91</SelectItem>
                      <SelectItem value="textlocal">Textlocal</SelectItem>
                      <SelectItem value="gupshup">Gupshup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMS API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your SMS API key"
                    value={integrationSettings.smsApiKey}
                    onChange={(e) =>
                      setIntegrationSettings({
                        ...integrationSettings,
                        smsApiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Gateway</label>
                  <Select
                    value={integrationSettings.paymentGateway}
                    onValueChange={(v) =>
                      setIntegrationSettings({ ...integrationSettings, paymentGateway: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="payu">PayU</SelectItem>
                      <SelectItem value="cashfree">Cashfree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Gateway Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your payment gateway key"
                    value={integrationSettings.razorpayKey}
                    onChange={(e) =>
                      setIntegrationSettings({
                        ...integrationSettings,
                        razorpayKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Analytics ID</label>
                  <Input
                    placeholder="e.g. G-XXXXXXXXXX"
                    value={integrationSettings.googleAnalyticsId}
                    onChange={(e) =>
                      setIntegrationSettings({
                        ...integrationSettings,
                        googleAnalyticsId: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for outgoing emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Host</label>
                  <Input
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Port</label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Username</label>
                  <Input
                    value={emailSettings.smtpUsername}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={emailSettings.smtpPassword}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Address</label>
                  <Input
                    type="email"
                    value={emailSettings.fromAddress}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromAddress: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Name</label>
                  <Input
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Encryption</label>
                  <Select
                    value={emailSettings.encryption}
                    onValueChange={(v) =>
                      setEmailSettings({ ...emailSettings, encryption: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TLS">TLS</SelectItem>
                      <SelectItem value="SSL">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={() => showSuccess("Test email sent — check your inbox")}>
                    Send Test Email
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">SMTP Authentication</p>
                  <p className="text-xs text-muted-foreground">Require login for SMTP</p>
                </div>
                <Switch
                  checked={emailSettings.smtpAuth}
                  onCheckedChange={(v) =>
                    setEmailSettings({ ...emailSettings, smtpAuth: v })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
              <CardDescription>Configure file storage backend and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Storage Provider</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "local", label: "Local Storage", icon: <HardDrive className="h-5 w-5" /> },
                    { id: "s3", label: "Amazon S3", icon: <Cloud className="h-5 w-5" /> },
                    { id: "azure", label: "Azure Blob", icon: <Server className="h-5 w-5" /> },
                  ].map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() =>
                        setStorageSettings({ ...storageSettings, provider: provider.id })
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                        storageSettings.provider === provider.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {provider.icon}
                      <span className="text-sm font-medium">{provider.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {storageSettings.provider === "s3" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">S3 Bucket Name</label>
                    <Input
                      value={storageSettings.s3Bucket}
                      onChange={(e) =>
                        setStorageSettings({ ...storageSettings, s3Bucket: e.target.value })
                      }
                      placeholder="my-app-bucket"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Input
                      value={storageSettings.s3Region}
                      onChange={(e) =>
                        setStorageSettings({ ...storageSettings, s3Region: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Access Key</label>
                    <Input
                      type="password"
                      value={storageSettings.s3AccessKey}
                      onChange={(e) =>
                        setStorageSettings({ ...storageSettings, s3AccessKey: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secret Key</label>
                    <Input
                      type="password"
                      value={storageSettings.s3SecretKey}
                      onChange={(e) =>
                        setStorageSettings({ ...storageSettings, s3SecretKey: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {storageSettings.provider === "azure" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Connection String</label>
                    <Input
                      type="password"
                      value={storageSettings.azureConnectionString}
                      onChange={(e) =>
                        setStorageSettings({
                          ...storageSettings,
                          azureConnectionString: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Container Name</label>
                    <Input
                      value={storageSettings.azureContainer}
                      onChange={(e) =>
                        setStorageSettings({ ...storageSettings, azureContainer: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {storageSettings.provider === "local" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Local Upload Path</label>
                  <Input
                    value={storageSettings.localPath}
                    onChange={(e) =>
                      setStorageSettings({ ...storageSettings, localPath: e.target.value })
                    }
                  />
                </div>
              )}

              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max File Size (MB)</label>
                  <Input
                    type="number"
                    value={storageSettings.maxFileSize}
                    onChange={(e) =>
                      setStorageSettings({ ...storageSettings, maxFileSize: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allowed File Types</label>
                  <Input
                    value={storageSettings.allowedTypes}
                    onChange={(e) =>
                      setStorageSettings({ ...storageSettings, allowedTypes: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Configure automatic backups and data recovery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Automatic Backup</p>
                  <p className="text-xs text-muted-foreground">
                    Enable scheduled automatic backups
                  </p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(v) =>
                    setBackupSettings({ ...backupSettings, autoBackup: v })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <Select
                    value={backupSettings.frequency}
                    onValueChange={(v) =>
                      setBackupSettings({ ...backupSettings, frequency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Retention (Days)</label>
                  <Input
                    type="number"
                    value={backupSettings.retentionDays}
                    onChange={(e) =>
                      setBackupSettings({ ...backupSettings, retentionDays: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Include Files</p>
                    <p className="text-xs text-muted-foreground">Upload files and documents</p>
                  </div>
                  <Switch
                    checked={backupSettings.includeFiles}
                    onCheckedChange={(v) =>
                      setBackupSettings({ ...backupSettings, includeFiles: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Include Database</p>
                    <p className="text-xs text-muted-foreground">All tables and records</p>
                  </div>
                  <Switch
                    checked={backupSettings.includeDatabase}
                    onCheckedChange={(v) =>
                      setBackupSettings({ ...backupSettings, includeDatabase: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compress Backup</p>
                    <p className="text-xs text-muted-foreground">Reduce backup file size</p>
                  </div>
                  <Switch
                    checked={backupSettings.compressBackup}
                    onCheckedChange={(v) =>
                      setBackupSettings({ ...backupSettings, compressBackup: v })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Backup Status */}
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-medium">Backup Status</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Last Backup</p>
                    <p className="text-sm font-medium">
                      {new Date(backupSettings.lastBackup).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Backup</p>
                    <p className="text-sm font-medium">
                      {new Date(backupSettings.nextBackup).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Backup Size</p>
                    <p className="text-sm font-medium">{backupSettings.backupSize}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => showSuccess("Backup download started")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Latest Backup
                </Button>
                <Button variant="outline" onClick={() => showSuccess("Backup initiated — this may take a few minutes")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Backup Now
                </Button>
                <Button variant="outline" onClick={() => document.getElementById("restore-backup-input")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from Backup
                </Button>
                <input id="restore-backup-input" type="file" accept=".zip,.tar.gz,.bak" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) { showSuccess("Backup file selected — restore will begin shortly"); e.target.value = "" } }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
