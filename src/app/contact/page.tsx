'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HardHat,
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
  { icon: MapPin, title: 'Digital Site Surveys', desc: 'GPS-verified inspections by our field team' },
  { icon: BarChart3, title: 'Transparent Tracking', desc: 'Stay updated on your project status' },
  { icon: FileText, title: 'Detailed Quotations', desc: 'Clear, itemized cost estimates' },
  { icon: MessageSquare, title: 'Direct Communication', desc: "Our team reaches out once they've reviewed your request" },
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (error) setError('')
  }

  const validate = () => {
    if (!form.name.trim()) { setError('Name is required'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return false }
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) { setError('Please enter a valid phone number'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim() || undefined,
          message: form.message.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Thank you!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've received your request. Our team will review it and reach out to you shortly.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/login">Back to Home</Link>
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
          Tell us about<br />your project.
        </h2>
        <p className="text-blue-100 mb-8 max-w-md">
          Share a few details and our team will get in touch to discuss a site survey and quotation.
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
            <h2 className="text-xl font-semibold text-foreground">Get a Quote</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us what you need — we'll get back to you shortly.
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
                <Label>Phone Number *</Label>
                <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Optional" value={form.company} onChange={(e) => update('company', e.target.value)} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>What do you need help with?</Label>
                <Textarea placeholder="Tell us about your project or service requirement..." rows={3} value={form.message} onChange={(e) => update('message', e.target.value)} disabled={isLoading} />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already a customer?{' '}
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
