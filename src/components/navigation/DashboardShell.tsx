"use client"

import { useCallback, useState } from "react"
import Sidebar from "@/components/navigation/Sidebar"
import TopNav from "@/components/navigation/TopNav"

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOpen = useCallback(() => setSidebarOpen(true), [])
  const handleClose = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={handleClose} />
      <div className="md:ml-72">
        <TopNav onOpenSidebar={handleOpen} />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
