export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <Sidebar />
      {children}
    </div>
  );
}
