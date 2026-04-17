"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "default";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  variant = "danger"
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant={variant === "danger" ? "danger" : "default"} 
            onClick={onConfirm} 
            isLoading={isLoading}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
