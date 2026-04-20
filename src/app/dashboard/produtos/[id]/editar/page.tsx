"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BasicInfoStep } from "@/components/products/steps/BasicInfoStep";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Redirect to the full builder immediately
    router.replace(`/dashboard/produtos/${params.id}/checkout`);
  }, [params.id, router]);

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0 || !formData.slug) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Falha ao atualizar produto");

      toast.success("Produto atualizado com sucesso! ✓");
      router.push("/dashboard/produtos");
    } catch (error) {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/dashboard/produtos" 
            className="flex items-center gap-2 text-[11px] font-bold text-text-secondary hover:text-accent uppercase tracking-widest transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar para lista
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Editar Produto</h1>
          <p className="text-sm text-text-secondary">Atualize as informações básicas do seu checkout.</p>
        </div>

        <Button
          onClick={handleSave}
          isLoading={saving}
          className="h-11 px-8 font-bold gap-2"
        >
          <Save className="w-4 h-4" /> Salvar Alterações
        </Button>
      </div>

      <Card className="p-10 bg-[#0f0f1a] border-white/[0.05] rounded-[24px] shadow-2xl relative overflow-hidden">
        <BasicInfoStep 
          data={formData} 
          updateData={(d) => setFormData((prev: any) => ({ ...prev, ...d }))} 
        />
        
        <div className="mt-12 pt-8 border-t border-white/[0.05] flex justify-end">
           <Button
            onClick={handleSave}
            isLoading={saving}
            variant="primary"
            className="h-12 px-12 font-bold gap-2 text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Save className="w-4 h-4" /> Salvar Alterações
          </Button>
        </div>
      </Card>
    </div>
  );
}
