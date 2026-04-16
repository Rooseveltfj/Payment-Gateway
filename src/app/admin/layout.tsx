export const dynamic = "force-dynamic";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  ShieldAlert,
  Search,
  LogOut,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redundant check (middleware should handle this, but for safety)
  const user = session?.user as { role?: string; name?: string } | undefined;
  if (!session || user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const menuItems = [
    { label: "Visão Geral", icon: LayoutDashboard, href: "/admin" },
    { label: "Gestão de Usuários", icon: Users, href: "/admin/usuarios" },
    { label: "Gestão de Saques", icon: DollarSign, href: "/admin/saques" },
    { label: "Produtos Globais", icon: Package, href: "/admin/produtos" },
    { label: "Configurações", icon: Settings, href: "/admin/configuracoes" },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/40 border-r border-slate-800/50 backdrop-blur-xl flex flex-col hidden lg:flex">
        <div className="p-8">
           <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                 <ShieldAlert className="text-white h-6 w-6" />
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">Admin</h1>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Black Gate</span>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-slate-800/50 transition-all text-slate-400 hover:text-white group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
           <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest italic">Voltar ao Player</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-40">
           <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl w-96">
              <Search className="h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Busca global administrativa..." 
                className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-600 w-full"
              />
           </div>

           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                 <span className="text-xs font-black text-white italic uppercase">{session?.user?.name}</span>
                 <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Proprietário</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 p-0.5">
                 <div className="h-full w-full rounded-[10px] bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-xs font-black">
                    {session?.user?.name?.charAt(0)}
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
