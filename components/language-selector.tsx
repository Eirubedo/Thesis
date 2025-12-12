"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  console.log("[v0] Current language:", language)

  const languages = [
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    { code: "id" as const, name: "Bahasa Indonesia", flag: "🇮🇩" },
  ]

  const handleLanguageChange = (langCode: "en" | "id") => {
    console.log("[v0] Switching language to:", langCode)
    setLanguage(langCode)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-3 flex items-center space-x-2 hover:bg-yellow-50 border border-sky-200"
        >
          <Globe className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-medium text-gray-700">
            {languages.find((lang) => lang.code === language)?.flag}
          </span>
          <span className="hidden sm:inline text-sm">{language === "en" ? "EN" : "ID"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 border-b">{t("language.select")}</div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </div>
            {language === lang.code && <Check className="w-4 h-4 text-sky-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
