"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, Settings2, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings2 },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-sidebar-border px-6 py-5">
            <div>
              <p className="text-lg font-semibold text-sidebar-primary">MyFans</p>
              <p className="text-sm text-sidebar-accent-foreground">Creator workspace</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4" aria-label="Dashboard links">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4 text-sm text-sidebar-accent-foreground">
            <p className="font-medium">MyFans Shell</p>
            <p className="mt-2 text-xs leading-5">
              Use the sidebar to navigate between feature screens. Mobile users can open and close the menu with the top nav button.
            </p>
          </div>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  )
}
