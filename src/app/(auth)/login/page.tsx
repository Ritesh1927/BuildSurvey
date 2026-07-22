'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, HardHat, MapPin, BarChart3, FileText, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_NAME } from '@/lib/constants'

const features = [
  { icon: MapPin, title: 'Digital Surveys', desc: 'GPS-enabled site inspections with real-time tracking' },
  { icon: BarChart3, title: 'Project Tracking', desc: 'Live dashboards, budgets, and progress monitoring' },
  { icon: FileText, title: 'BOQ & Quotations', desc: 'Automated cost estimation and bill of quantities' },
  { icon: MessageSquare, title: 'Team Collaboration', desc: 'In-app messaging, tasks, and notifications' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Branding (hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-600 p-10 xl:p-14 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{APP_NAME}</h1>
              <p className="text-sm text-blue-100">Survey & Project Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Build smarter.<br />Build better.
          </h2>
          <p className="text-blue-100 mb-12 max-w-md text-lg">
            Manage construction surveys, projects, BOQ, quotations, and team collaboration — all in one platform.
          </p>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
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

        <div className="relative z-10 text-sm text-blue-200">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo (visible only on lg以下) */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
              <HardHat className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">Survey & Project Platform</p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Request Access
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Looking for our services?{' '}
              <Link href="/contact" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Get a Quote
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
