import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/*
        Main content area.
        On mobile: pad the bottom so the last card/button is never hidden
        behind the fixed BottomNav (3.5rem bar + iOS safe-area inset).
        On md+: BottomNav is hidden, so no padding needed there.
      */}
      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
