"use client"

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

import { cn } from "@/lib/utils"

function toast(props: Parameters<typeof sonnerToast>[0]) {
  return sonnerToast(props)
}

function showSuccess(message: string, options?: { title?: string }) {
  return sonnerToast.success(options?.title || "Success", {
    description: message,
  })
}

function showError(message: string, options?: { title?: string }) {
  return sonnerToast.error(options?.title || "Error", {
    description: message,
  })
}

function showWarning(message: string, options?: { title?: string }) {
  return sonnerToast.warning(options?.title || "Warning", {
    description: message,
  })
}

function showInfo(message: string, options?: { title?: string }) {
  return sonnerToast.info(options?.title || "Info", {
    description: message,
  })
}

interface ToastProps {
  className?: string
}

function ToastProvider({ className }: ToastProps) {
  return (
    <SonnerToaster
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  )
}

export { ToastProvider, toast, showSuccess, showError, showWarning, showInfo }
