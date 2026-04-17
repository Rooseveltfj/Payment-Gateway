import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#030507] selection:bg-primary/30">
        <Sidebar />
        
        <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
          <Topbar />
          
          <main className="flex-1 w-full pt-28 md:pt-32 px-4 md:px-8 pb-12">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
