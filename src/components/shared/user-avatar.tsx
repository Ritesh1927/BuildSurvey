"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  image?: string | null
  size?: "sm" | "md" | "lg"
  showOnline?: boolean
  showName?: boolean
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
}

const onlineDotSize = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
]

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function UserAvatar({
  name,
  image,
  size = "md",
  showOnline = false,
  showName = false,
  className,
}: UserAvatarProps) {
  const colorClass = getColorFromName(name)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className={cn(
              "rounded-full object-cover",
              sizeClasses[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full font-semibold",
              sizeClasses[size],
              colorClass
            )}
          >
            {getInitials(name)}
          </div>
        )}
        {showOnline && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-background bg-emerald-500",
              onlineDotSize[size]
            )}
          />
        )}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">{name}</span>
        </div>
      )}
    </div>
  )
}
