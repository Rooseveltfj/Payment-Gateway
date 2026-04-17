"use client";

import React, { createContext, useContext, useState } from "react";
import type { Period } from "@/components/layout/Topbar";

interface DashboardContextType {
  period: Period;
  setPeriod: (period: Period) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>("week");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardContext.Provider value={{ period, setPeriod, sidebarOpen, setSidebarOpen }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
