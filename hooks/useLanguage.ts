"use client"

import { useLanguage as useLanguageContext } from "@/contexts/language-context"

export default function useLanguage() {
  return useLanguageContext()
}
