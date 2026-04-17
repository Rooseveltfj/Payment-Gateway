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
} from "lucide-react";
import { useSession } from "next-auth/react";
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
  { label: "Vitrine", href: "/dashboard/vitrine", icon: Store },
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
      { label: "API Keys", href: "/dashboard/integracoes", icon: Plug },
      { label: "Webhooks", href: "/dashboard/integracoes/webhooks", icon: MessageCircle },
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
          "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition-all duration-200 cursor-pointer",
          isActive
            ? "bg-primary text-white font-medium"
            : "text-text-secondary hover:bg-hover hover:text-text-primary"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition-all duration-200 cursor-pointer",
          isChildActive
            ? "text-primary"
            : "text-text-secondary hover:bg-hover hover:text-text-primary"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ml-3 mt-1 space-y-0.5 border-l border-border pl-4">
          {item.children.map((child) => {
            const isActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <child.icon className="h-3.5 w-3.5 shrink-0" />
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
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col transition-all duration-300 transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "#111113",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo & Close Button (Mobile Only) */}
        <div className="flex h-20 items-center justify-between px-6 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}>
              <NavGroup item={item} />
            </div>
          ))}

          {isAdmin && (
            <>
              <div className="my-6 border-t border-white/5 pt-6 px-3">
                 <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-3 opacity-50">Painel Admin</span>
              </div>
              {ADMIN_ITEMS.map((item) => (
                <div key={item.label} onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}>
                   <NavGroup item={item} />
                </div>
              ))}
            </>
          )}

          {/* Support */}
          <button
            onClick={() => window.open("https://wa.me/", "_blank")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-all duration-200 cursor-pointer mt-4"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Fale com o suporte</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
