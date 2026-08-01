'use client'

import Link from 'next/link'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md p-4">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {APP_NAME} doesn&apos;t send password reset emails — an Admin or Super Admin on your
          team can reset your password for you from the Employees section.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Reach out to your administrator with your account email and ask them to reset it.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </div>
    </div>
  )
}
