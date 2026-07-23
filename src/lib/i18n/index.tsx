"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import en from "./locales/en.json"
import es from "./locales/es.json"

export type Locale = "en" | "es"

type Dictionary = Record<string, string>

const dictionaries: Record<Locale, Dictionary> = { en, es }

const STORAGE_KEY = "locale"

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && stored in dictionaries) setLocaleState(stored)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (key: string): string =>
      dictionaries[locale][key] ?? dictionaries["en"][key] ?? key,
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useTranslation must be used inside I18nProvider")
  return ctx
}
