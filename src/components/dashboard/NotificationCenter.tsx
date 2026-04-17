"use client";

import { Bell, Check, Clock, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  createdAt: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/dashboard/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch("/api/dashboard/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle className="h-4 w-4 text-success" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "ERROR": return <XCircle className="h-4 w-4 text-error" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markAllAsRead();
        }}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-card transition-all duration-300 group cursor-pointer",
          open ? "bg-hover text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-hover"
        )}
      >
        <Bell className={cn("h-4 w-4 transition-transform", open && "scale-110")} />
        
        {unreadCount > 0 && (
          <>
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#09090b] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[120%] w-80 sm:w-96 rounded-2xl bg-[#0a0b11] border border-white/5 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden backdrop-blur-3xl">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Notificações</h3>
              <p className="text-[10px] text-white/40 mt-0.5">Alertas e atualizações em tempo real</p>
            </div>
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
            >
              Marcar tudo como lido
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto no-scrollbar py-2">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "px-4 py-3 flex gap-4 transition-all hover:bg-white/5 relative group",
                    !n.read && "bg-primary/5 shadow-[inset_2px_0_0_0_#9b49e6]"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
                    n.type === "SUCCESS" ? "bg-success/10" : "bg-white/5"
                  )}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] font-bold text-white leading-tight">{n.title}</p>
                    <p className="text-[10px] text-white/50 leading-relaxed pr-4 line-clamp-2">{n.content}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/30 pt-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary absolute right-4 top-4" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 px-8 text-center space-y-2">
                <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Bell className="h-6 w-6 text-white/20" />
                </div>
                <p className="text-sm font-bold text-white/60">Tudo limpo!</p>
                <p className="text-[11px] text-white/30">Nenhuma notificação por enquanto.</p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-white/5 mt-1">
            <button 
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all"
            >
              Fechar painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
