'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  HardHat,
  Eye,
  EyeOff,
  MapPin,
  BarChart3,
  FileText,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { APP_NAME } from '@/lib/constants'

const features = [
  { icon: MapPin, title: 'Digital Surveys', desc: 'GPS-enabled site inspections' },
  { icon: BarChart3, title: 'Project Tracking', desc: 'Real-time dashboards' },
  { icon: FileText, title: 'BOQ & Quotations', desc: 'Automated cost estimation' },
  { icon: MessageSquare, title: 'Team Communication', desc: 'In-app messaging & notifications' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'request' | 'register'>('request')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
    message: '',
    terms: false,
  })

  const validate = () => {
    if (!form.name.trim()) { setError('Name is required'); return false }
    if (!form.email.trim()) { setError('Email is required'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Invalid email format'); return false }
    if (!form.company.trim()) { setError('Company is required'); return false }

    if (mode === 'register') {
      if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters'); return false }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false }
    }

    if (mode === 'request' && !form.terms) { setError('Please accept the terms'); return false }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          company: form.company.trim(),
          phone: form.phone.trim() || undefined,
          password: mode === 'register' ? form.password : undefined,
          message: mode === 'request' ? form.message.trim() : undefined,
          mode,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }

      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const update = (field: string, value: string | boolean) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (error) setError('')
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">
              {mode === 'request' ? 'Request Submitted!' : 'Account Created!'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'request'
                ? 'Your access request has been submitted. Our team will review it and get back to you within 24-48 hours.'
                : 'Your account has been created. Please wait for admin activation before you can sign in.'}
            </p>
            <Button className="mt-6" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Left: Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-gradient-to-br from-primary via-primary to-slate-900 p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <HardHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{APP_NAME}</h1>
            <p className="text-sm text-blue-100">Survey & Project Platform</p>
          </div>
        </div>
        <h2 className="text-3xl font-bold leading-tight mb-4">
          Build smarter.<br />Build better.
        </h2>
        <p className="text-blue-100 mb-8 max-w-md">
          Manage construction surveys, projects, BOQ, quotations, and team collaboration — all in one platform.
        </p>
        <div className="space-y-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-blue-100">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <HardHat className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-3 text-xl font-bold text-foreground">{APP_NAME}</h1>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-foreground">Get Started</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how you want to access the platform
            </p>

            {/* Mode Tabs */}
            <div className="mt-4 flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => { setMode('request'); setError('') }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'request'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Request Access
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError('') }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {mode === 'request'
                ? 'Submit a request — our team will create your account within 24-48 hours.'
                : 'Create your own account — admin will activate it before you can sign in.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Rajesh Mehta" value={form.name} onChange={(e) => update('name', e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" placeholder="rajesh@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input placeholder="Sunrise Builders Pvt. Ltd." value={form.company} onChange={(e) => update('company', e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} disabled={isLoading} />
              </div>

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} disabled={isLoading} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password *</Label>
                    <div className="relative">
                      <Input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} disabled={isLoading} className="pr-10" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {mode === 'request' && (
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Tell us about your company and what you need..." rows={3} value={form.message} onChange={(e) => update('message', e.target.value)} disabled={isLoading} />
                </div>
              )}

              {mode === 'request' && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border" />
                  <span className="text-muted-foreground">I agree to the Terms of Service and Privacy Policy</span>
                </label>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {mode === 'request' ? 'Submitting...' : 'Creating Account...'}
                  </>
                ) : mode === 'request' ? (
                  'Submit Request'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
