"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, Info, ChevronDown, Settings, LogOut } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "./language-selector"

const navigationItems = [
  { name: "nav.assessment", href: "/assessment" },
  { name: "nav.monitoring", href: "/monitoring" },
  { name: "nav.education", href: "/self-help" },
  { name: "nav.reports", href: "/reports" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-3">
              <img src="/images/asked-logo.png" alt="ASKED Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-red-600">ASKED</span>
            </Link>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden md:flex items-center space-x-2">
            {user &&
              navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 w-24 ${
                        isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-red-50"
                      }
                      `}
                    >
                      <span className="text-sm">{t(item.name)}</span>
                    </Button>
                  </Link>
                )
              })}

            {/* Language Selector - Prominently displayed */}
            <LanguageSelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-36 h-10 flex items-center justify-center space-x-2 text-sm font-medium hover:bg-red-50"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate max-w-16 text-xs">{user.name}</span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {t("nav.appSettings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      {t("nav.about")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="w-32 h-10 bg-red-500 hover:bg-red-600 text-white text-xs">
                  {t("login.signIn")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Selector */}
            <LanguageSelector />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-red-50">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Language selector at top of mobile menu */}
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{t("language.select")}</span>
                      <LanguageSelector />
                    </div>
                  </div>

                  {user &&
                    navigationItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`
                              w-full h-12 flex items-center justify-start space-x-3 text-sm font-medium
                              ${
                                isActive
                                  ? "bg-red-100 text-red-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-red-50"
                              }
                            `}
                          >
                            <span className="text-sm">{t(item.name)}</span>
                          </Button>
                        </Link>
                      )
                    })}

                  <div className="border-t pt-4 mt-6">
                    {user ? (
                      <div className="space-y-2">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full h-12 justify-start space-x-3 hover:bg-red-50">
                            <User className="w-5 h-5 flex-shrink-0" />
                            <span>{t("nav.profile")}</span>
                          </Button>
                        </Link>
                        <Link href="/settings" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full h-12 justify-start space-x-3 hover:bg-red-50">
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            <span>{t("nav.appSettings")}</span>
                          </Button>
                        </Link>
                        <Link href="/about" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full h-12 justify-start space-x-3 hover:bg-red-50">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <span>{t("nav.about")}</span>
                          </Button>
                        </Link>
                        <Button
                          onClick={() => {
                            logout()
                            setIsOpen(false)
                          }}
                          variant="outline"
                          className="w-full h-12 justify-start space-x-3 bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5 flex-shrink-0" />
                          <span>{t("nav.logout")}</span>
                        </Button>
                      </div>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full h-12 bg-red-500 hover:bg-red-600 text-white">
                          {t("login.signIn")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
