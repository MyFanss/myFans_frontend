"use client"

import { Bell, Menu, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme/ThemeToggle"
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher"
import { useTranslation } from "@/lib/i18n"

interface TopNavProps {
  onOpenSidebar: () => void
}

export default function TopNav({ onOpenSidebar }: TopNavProps) {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-10 border-b border-sidebar-border bg-background/95 backdrop-blur md:pl-72">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenSidebar}
            aria-label={t("nav.open")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              MF
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">MyFans</p>
              <p className="text-xs text-muted-foreground">{t("topnav.appShell")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("topnav.new")}
          </Button>
          <ThemeToggle />
          <LocaleSwitcher />
          <Button variant="ghost" size="icon" aria-label={t("topnav.notifications")}>
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("topnav.account")}>
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
