"use client"

import { useCallback, useRef } from "react"
import { Bell, Menu, Search, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme/ThemeToggle"
import LocaleSwitcher from "@/components/i18n/LocaleSwitcher"
import { useTranslation } from "@/lib/i18n"
import CommandPalette, {
  type CommandPaletteHandle,
} from "@/components/navigation/CommandPalette"

interface TopNavProps {
  onOpenSidebar: () => void
}

export default function TopNav({ onOpenSidebar }: TopNavProps) {
  const { t } = useTranslation()
  const paletteRef = useRef<CommandPaletteHandle>(null)

  const handleSearchClick = useCallback(() => {
    paletteRef.current?.open()
  }, [])

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
          {/* Search / Command Palette trigger */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex items-center gap-2 text-muted-foreground"
            onClick={handleSearchClick}
            aria-label="Open search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleSearchClick}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>

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

      <CommandPalette ref={paletteRef} />
    </header>
  )
}
