"use client"

import { useState } from "react"
import { KeyRound } from "lucide-react"

import { showSuccess, showError } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ResetPasswordDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ResetPasswordDialog({ userId, userName, open, onOpenChange, onSuccess }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const close = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match')
      return
    }
    setResetting(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        showError(data.error || 'Failed to reset password')
        return
      }
      showSuccess('Password reset successfully')
      close(false)
      onSuccess?.()
    } catch {
      showError('Network error while resetting password')
    } finally {
      setResetting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>Set a new password for {userName}. They will need to use this to sign in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reset-new-password">New Password</Label>
            <Input id="reset-new-password" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
            <Input id="reset-confirm-password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)} disabled={resetting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={resetting || !newPassword || !confirmPassword}>
            <KeyRound className="mr-2 h-4 w-4" />{resetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
