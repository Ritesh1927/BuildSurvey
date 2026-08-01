"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface PhotoViewDialogProps {
  photoUrl: string | null
  title: string
  subtitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PhotoViewDialog({ photoUrl, title, subtitle, open, onOpenChange }: PhotoViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={title} className="w-full rounded-lg border object-cover" />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No photo available</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
