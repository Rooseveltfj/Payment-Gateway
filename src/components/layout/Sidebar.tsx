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
  LogOut,
  User,
  Shield,
  Trophy,
} from "lucide-react";

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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
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
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
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

import { useSession } from "next-auth/react";

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
  const user = session?.user as { role?: string; name?: string; email?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col"
      style={{
        background: "#111113",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-text-primary">Black Gate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <NavGroup key={item.label} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-border/50 pt-4 px-3">
               <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-3">Painel Admin</span>
            </div>
            {ADMIN_ITEMS.map((item) => (
              <NavGroup key={item.label} item={item} />
            ))}
          </>
        )}

        {/* Support */}
        <button
          onClick={() => window.open("https://wa.me/", "_blank")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-all duration-200 cursor-pointer mt-1"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span>Fale com o suporte</span>
        </button>
      </nav>

      {/* User footer */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30">
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-text-primary">{user?.name || "Usuário"}</p>
          <p className="truncate text-[10px] text-text-secondary uppercase tracking-tighter">{user?.role || "Player"}</p>
        </div>
        <button
          className="text-text-secondary hover:text-error transition-colors duration-200 cursor-pointer"
          title="Sair"
          onClick={() => window.location.href = "/api/auth/signout"}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
