"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  ArrowLeftRight,
  RefreshCw,
  DollarSign,
  ArrowDownToLine,
  Users,
  ShoppingCart,
  Package,
  Link2,
  Settings,
  FileText,
  Plug,
  Globe,
  Award,
  Gift,
  MessageCircle,
  ChevronDown,
  User,
  Shield,
  Trophy,
  X,
  LogOut,
  ShoppingBag,
  Search,
  Megaphone,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useDashboard } from "@/lib/dashboard-context";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Marketplace",
    icon: ShoppingBag,
    children: [
      { label: "Encontrar Produtos", href: "/dashboard/marketplace", icon: Search },
      { label: "Minhas Afiliações", href: "/dashboard/marketplace/minhas-afiliacoes", icon: Link2 },
      { label: "Meus Anúncios", href: "/dashboard/marketplace/meus-anuncios", icon: Megaphone },
    ],
  },
  {
    label: "Vendas",
    icon: ArrowLeftRight,
    children: [
      { label: "Transações", href: "/dashboard/vendas/transacoes", icon: ArrowLeftRight },
      { label: "Assinaturas", href: "/dashboard/vendas/assinaturas", icon: RefreshCw },
    ],
  },
  {
    label: "Financeiro",
    icon: DollarSign,
    children: [
      { label: "Visão Geral", href: "/dashboard/financeiro", icon: LayoutDashboard },
      { label: "Extrato", href: "/dashboard/financeiro/extrato", icon: FileText },
    ],
  },
  {
    label: "Clientes",
    icon: Users,
    children: [
      { label: "Meus clientes", href: "/dashboard/clientes", icon: Users },
      { label: "Carrinhos abandonados", href: "/dashboard/clientes/carrinhos", icon: ShoppingCart },
    ],
  },
  {
    label: "Produtos",
    icon: Package,
    children: [
      { label: "Meus produtos", href: "/dashboard/produtos", icon: Package },
      { label: "Minhas afiliações", href: "/dashboard/produtos/afiliacoes", icon: Link2 },
    ],
  },
  {
    label: "Configurações",
    icon: Settings,
    children: [
      { label: "Perfil", href: "/dashboard/configuracoes/perfil", icon: User },
      { label: "Meus documentos (KYC)", href: "/dashboard/configuracoes/kyc", icon: Shield },
    ],
  },
  {
    label: "Integrações",
    icon: Plug,
    children: [
      { label: "Developer", href: "/dashboard/integracoes", icon: Plug },
    ],
  },
  { label: "Domínios", href: "/dashboard/dominios", icon: Globe },
  {
    label: "Plaquinhas de meta",
    icon: Award,
    children: [
      { label: "Minhas conquistas", href: "/dashboard/metas", icon: Award },
      { label: "Ranking global", href: "/dashboard/metas/ranking", icon: Trophy },
    ],
  },
  { label: "Indique e ganhe", href: "/dashboard/indicacao", icon: Gift },
];

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isChildActive = item.children?.some((c) => pathname === c.href);
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!item.children) {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center gap-3 px-3 py-3 text-sm transition-all duration-200 cursor-pointer mx-2 border-l-2",
          isActive
            ? "bg-[#8b5cf61f] text-[#a78bfa] font-bold rounded-xl border-[#8b5cf6]"
            : "text-[#64748b] border-transparent hover:bg-white/[0.04] hover:text-[#f1f5f9] rounded-xl"
        )}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#a78bfa]" : "text-[#64748b]")} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-3 text-sm transition-all duration-200 cursor-pointer mx-2 rounded-xl group",
          isChildActive
            ? "text-[#a78bfa] font-bold"
            : "text-[#64748b] hover:bg-white/[0.04] hover:text-[#f1f5f9]"
        )}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", isChildActive ? "text-[#a78bfa]" : "text-[#64748b] group-hover:text-[#f1f5f9]")} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200 opacity-50", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ml-5 mt-1 space-y-1 border-l border-white/[0.06] pl-6 transition-all animate-in slide-in-from-left-2 duration-300">
          {item.children.map((child) => {
            const isActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-2.5 py-1.5 text-[13px] transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-[#a78bfa] font-bold"
                    : "text-[#64748b] hover:text-[#f1f5f9]"
                )}
              >
                <child.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-[#a78bfa]" : "text-[#64748b]")} />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ADMIN_ITEMS: NavItem[] = [
  {
    label: "Administração",
    icon: Shield,
    children: [
      { label: "Aprovar Saques", href: "/admin/saques", icon: ArrowDownToLine },
      { label: "Gestão KYC", href: "/admin/kyc", icon: Shield },
    ],
  },
];

export function Sidebar() {
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  const user = session?.user as { role?: string; name?: string; email?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col transition-all duration-400 transform lg:translate-x-0 border-r border-white/[0.05]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "#07070f",
        }}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6 shrink-0 border-b border-white/[0.05]">
          <Link href="/dashboard" className="flex items-center">
            <Image 
              src="/assets/logo-png.png" 
              alt="PulsePay Logo" 
              width={160} 
              height={44} 
              className="w-auto h-10 object-contain"
            />
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        {/* Nav Container */}
        <nav className="flex-1 overflow-y-auto pt-6 pb-4 space-y-4 scrollbar-thin">
          <div className="px-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}>
                <NavGroup item={item} />
              </div>
            ))}

            {isAdmin && (
              <>
                <div className="h-px bg-white/[0.04] my-6 mx-4" />
                <div className="px-5 mb-2">
                   <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em] opacity-50">Gestão Admin</span>
                </div>
                {ADMIN_ITEMS.map((item) => (
                  <div key={item.label} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}>
                    <NavGroup item={item} />
                  </div>
                ))}
              </>
            )}

            <button
              onClick={() => window.open("https://wa.me/", "_blank")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#64748b] hover:bg-white/[0.04] hover:text-[#f1f5f9] transition-all duration-200 cursor-pointer mx-2 mt-4"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>Suporte PulsePay</span>
            </button>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/[0.05] bg-black/20">
           <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                 <div className="h-9 w-9 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white text-[13px] font-bold shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#f1f5f9] truncate max-w-[120px]">{user?.name || "Usuário"}</span>
                    <span className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">{user?.role || "Player"}</span>
                 </div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2.5 rounded-xl text-[#64748b] hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Sair"
              >
                 <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>
    </>
  );
}
