import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#09090b] selection:bg-primary/30">
        <Sidebar />
        
        <div className="flex flex-col min-h-screen pl-60">
          {/* The Topbar is now global to all dashboard routes */}
          <Topbar />
          
          {/* pt-32 (128px) ensures content starts 32px below the Topbar even with KYC banner (96px) */}
          <main className="flex-1 w-full pt-32 px-8 pb-12">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
