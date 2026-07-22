'use client'

import { type ReactNode, createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Toaster } from 'sonner'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem('bsp-theme') as Theme | null
    if (stored && ['light', 'dark', 'system'].includes(stored)) return stored
  } catch {
    /* noop */
  }
  // Default to light regardless of OS/browser preference — a visitor's
  // first impression shouldn't depend on their system dark-mode setting.
  // Once they explicitly pick a theme, that choice persists via localStorage.
  return 'light'
}

function getInitialResolved(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getInitialResolved(getInitialTheme()))
  const initialMountRef = useRef(true)

  const resolveTheme = useCallback((t: Theme) => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return t
  }, [])

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t)
      const resolved = resolveTheme(t)
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      try {
        localStorage.setItem('bsp-theme', t)
      } catch {
        /* noop */
      }
    },
    [resolveTheme],
  )

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false
      const resolved = resolveTheme(theme)
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      return
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        const resolved = resolveTheme('system')
        setResolvedTheme(resolved)
        document.documentElement.classList.toggle('dark', resolved === 'dark')
      }
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme, resolveTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: 'font-sans text-sm',
          }}
        />
      </ThemeProvider>
    </NextAuthSessionProvider>
  )
}
