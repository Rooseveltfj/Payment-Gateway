"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Search, MapPin, User, Calendar, Phone } from "lucide-react";
import { maskCPF, validateCPF } from "@/lib/cpf";
import { maskCEP, fetchAddressByCEP } from "@/lib/viacep";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PersonalDataStep({ data, updateData }: { data: any; updateData: (d: any) => void }) {
  const [cpfError, setCpfError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCPF(e.target.value);
    updateData({ cpf: val });
    
    if (val.length === 14) {
      if (!validateCPF(val)) setCpfError("CPF Inválido");
      else setCpfError("");
    } else {
      setCpfError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ phone: maskPhone(e.target.value) });
  };

  const handleSearchCEP = async () => {
    const val = data.zipCode.replace(/\D/g, "");
    if (val.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setCepLoading(true);
    try {
      const res = await fetchAddressByCEP(val);
      if (res && !res.erro) {
        updateData({
          street: res.logradouro,
          neighborhood: res.bairro,
          city: res.localidade,
          state: res.uf
        });
        toast.success("Endereço preenchido!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Seção 1: Dados Pessoais */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
          <User className="w-4 h-4 text-[#8b5cf6]" />
          <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">Dados Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Nome Completo *</label>
            <Input 
              placeholder="Como consta no documento" 
              value={data.fullName}
              className="h-11"
              onChange={e => updateData({ fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">CPF *</label>
            <Input 
              placeholder="000.000.000-00" 
              value={data.cpf}
              className={cn("h-11", cpfError && "border-red-500")}
              onChange={handleCpfChange}
            />
            {cpfError && <p className="text-[10px] text-red-500 font-bold ml-1">{cpfError}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Data de Nascimento *</label>
            <div className="relative">
              <Input 
                type="date"
                value={data.birthDate}
                className="h-11 block w-full appearance-none"
                onChange={e => updateData({ birthDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Telefone / Celular</label>
            <Input 
              placeholder="(00) 00000-0000" 
              value={data.phone}
              className="h-11"
              onChange={handlePhoneChange}
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Endereço */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
          <MapPin className="w-4 h-4 text-[#8b5cf6]" />
          <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">Endereço Residencial</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">CEP *</label>
            <div className="flex gap-2">
              <Input 
                placeholder="00000-000" 
                value={data.zipCode}
                className="h-11 flex-1"
                onChange={e => updateData({ zipCode: maskCEP(e.target.value) })}
              />
              <button
                type="button"
                onClick={handleSearchCEP}
                disabled={cepLoading}
                className="h-11 px-4 rounded-xl bg-[#8b5cf61a] border border-[#8b5cf633] text-[#8b5cf6] hover:bg-[#8b5cf633] transition-all flex items-center gap-2 group disabled:opacity-50"
              >
                <Search className={cn("w-4 h-4", cepLoading && "animate-spin")} />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Buscar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div className="space-y-2 col-span-1">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Rua / Logradouro</label>
               <Input 
                 placeholder="Ex: Av. Paulista" 
                 value={data.street}
                 className="h-11"
                 onChange={e => updateData({ street: e.target.value })}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Nº</label>
               <Input 
                 placeholder="123" 
                 value={data.number}
                 className="h-11"
                 onChange={e => updateData({ number: e.target.value })}
               />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Bairro</label>
               <Input 
                 placeholder="Ex: Centro" 
                 value={data.neighborhood}
                 className="h-11"
                 onChange={e => updateData({ neighborhood: e.target.value })}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Complemento</label>
               <Input 
                 placeholder="Apto 102" 
                 value={data.complement || ""}
                 className="h-11"
                 onChange={e => updateData({ complement: e.target.value })}
               />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_80px] gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">Cidade</label>
              <Input 
                placeholder="São Paulo" 
                value={data.city}
                className="h-11"
                onChange={e => updateData({ city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] ml-1">UF</label>
              <Input 
                placeholder="SP" 
                maxLength={2}
                value={data.state}
                className="h-11 text-center"
                onChange={e => updateData({ state: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
