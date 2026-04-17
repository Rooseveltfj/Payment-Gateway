"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      theme="dark"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#0a0b11",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          borderRadius: "16px",
        },
        className: "font-sans",
      }}
    />
  );
}
