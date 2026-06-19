import type { Metadata } from "next"
import DashboardShell from "@/components/navigation/DashboardShell"

export const metadata: Metadata = {
  title: "MyFans Dashboard",
  description: "Dashboard shell for MyFans with responsive sidebar and top navigation.",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardShell>{children}</DashboardShell>
}
