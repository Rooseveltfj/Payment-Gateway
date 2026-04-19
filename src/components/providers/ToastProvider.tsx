"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      theme="dark"
      richColors
      expand
      closeButton
      toastOptions={{
        style: {
          background: '#0d1117',
          border: '1px solid rgba(191, 0, 255, 0.2)',
          color: '#f0f4f8',
        },
      }}
    />
  );
}
