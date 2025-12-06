'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ur'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'resumematch_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Language
        if (saved && ['en', 'es', 'fr', 'de', 'ur'].includes(saved)) {
            setLanguageState(saved)
        }
        setMounted(true)
    }, [])

    // Save language to localStorage and update HTML dir attribute
    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem(STORAGE_KEY, lang)

        // Update HTML direction for RTL languages
        if (typeof document !== 'undefined') {
            document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
            document.documentElement.lang = lang
        }
    }

    // Update dir on language change
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
            document.documentElement.lang = language
        }
    }, [language])

    // Translation function
    const t = (key: string): string => {
        // Import translations dynamically
        const translations = require('@/lib/translations').translations
        const keys = key.split('.')
        let value: any = translations[language]

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k]
            } else {
                return key // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key
    }

    const dir = language === 'ur' ? 'rtl' : 'ltr'

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}
