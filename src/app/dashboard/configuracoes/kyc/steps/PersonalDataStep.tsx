"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { maskCPF, validateCPF } from "@/lib/cpf";
import { maskCEP, fetchAddressByCEP } from "@/lib/viacep";

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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCEP(e.target.value);
    updateData({ zipCode: val });

    if (val.length === 9) {
      setCepLoading(true);
      const res = await fetchAddressByCEP(val);
      setCepLoading(false);
      
      if (res && !res.erro) {
        updateData({
          street: res.logradouro,
          neighborhood: res.bairro,
          city: res.localidade,
          state: res.uf
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
      <div className="col-span-1 md:col-span-2 space-y-4 mb-4">
        <h3 className="text-lg font-bold text-text-primary border-b border-border/50 pb-2">Informações Pessoais</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo *</label>
        <Input 
          placeholder="Como consta no documento" 
          value={data.fullName}
          onChange={e => updateData({ fullName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">CPF *</label>
        <Input 
          placeholder="000.000.000-00" 
          value={data.cpf}
          onChange={handleCpfChange}
          className={cpfError ? "border-error focus-visible:ring-error" : ""}
        />
        {cpfError && <p className="text-xs text-error mt-1">{cpfError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Data de Nascimento *</label>
        <Input 
          type="date"
          value={data.birthDate}
          onChange={e => updateData({ birthDate: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Telefone / Celular</label>
        <Input 
          placeholder="(00) 90000-0000" 
          value={data.phone}
          onChange={e => updateData({ phone: e.target.value })}
        />
      </div>

      <div className="col-span-1 md:col-span-2 space-y-4 mt-6 mb-4">
        <h3 className="text-lg font-bold text-text-primary border-b border-border/50 pb-2">Endereço de Correspondência</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">CEP *</label>
        <div className="relative">
          <Input 
            placeholder="00000-000" 
            value={data.zipCode}
            onChange={handleCepChange}
          />
          {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary animate-pulse">Buscando...</span>}
        </div>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
           <label className="block text-sm font-medium text-text-secondary mb-1">Logradouro / Rua</label>
           <Input 
             placeholder="Rua Exemplo" 
             value={data.street}
             onChange={e => updateData({ street: e.target.value })}
           />
        </div>
        <div className="sm:col-span-1">
           <label className="block text-sm font-medium text-text-secondary mb-1">Número</label>
           <Input 
             placeholder="123" 
             value={data.number}
             onChange={e => updateData({ number: e.target.value })}
           />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Bairro</label>
        <Input 
          placeholder="Centro" 
          value={data.neighborhood}
          onChange={e => updateData({ neighborhood: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1">Cidade</label>
          <Input 
            placeholder="São Paulo" 
            value={data.city}
            onChange={e => updateData({ city: e.target.value })}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-text-secondary mb-1">UF</label>
          <Input 
            placeholder="SP" 
            maxLength={2}
            value={data.state}
            onChange={e => updateData({ state: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
    </div>
  );
}
