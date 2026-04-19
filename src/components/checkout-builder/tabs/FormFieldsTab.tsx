"use client";

import { FormConfig, CustomField, FieldType } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical, Lock, ShieldCheck, ClipboardList } from "lucide-react";

interface Props {
  config: FormConfig;
  onChange: (data: Partial<FormConfig>) => void;
}

const OPTIONAL_FIELDS: { key: keyof FormConfig["optionalFields"]; label: string }[] = [
  { key: "cpf", label: "CPF/CNPJ" },
  { key: "phone", label: "Telefone / WhatsApp" },
  { key: "birthDate", label: "Data de Nascimento" },
  { key: "address", label: "Endereço Completo" },
  { key: "zipCode", label: "CEP" },
  { key: "company", label: "Nome da Empresa" },
];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "checkbox", label: "Checkbox" },
];

function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      {Icon && <Icon className="h-4 w-4 text-purple-400" />}
      <p className="text-[14px] font-bold text-white tracking-tight">{children}</p>
    </div>
  );
}

export function FormFieldsTab({ config, onChange }: Props) {
  const updOptional = (key: keyof FormConfig["optionalFields"], val: boolean) => {
    onChange({ optionalFields: { ...config.optionalFields, [key]: val } });
  };

  const addCustomField = () => {
    const f: CustomField = {
      id: Date.now().toString(),
      label: "Novo Campo",
      placeholder: "Digite aqui...",
      type: "text",
      required: false,
      order: config.customFields.length,
    };
    onChange({ customFields: [...config.customFields, f] });
  };

  const updateCustomField = (id: string, data: Partial<CustomField>) => {
    onChange({ customFields: config.customFields.map(f => f.id === id ? { ...f, ...data } : f) });
  };

  const deleteCustomField = (id: string) => {
    onChange({ customFields: config.customFields.filter(f => f.id !== id) });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Campos Padrão ─── */}
      <SectionLabel icon={Lock}>Campos Obrigatórios</SectionLabel>
      <div className="space-y-2">
        {["Nome Completo", "E-mail"].map(label => (
          <div key={label} className="flex items-center justify-between px-4 py-3 bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl group">
            <div className="flex items-center gap-3">
               <ShieldCheck className="h-4 w-4 text-purple-400/50" />
               <span className="text-[13px] text-[#f1f5f9] font-bold">{label}</span>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">Fixo</span>
          </div>
        ))}
        <p className="text-[11px] text-[#475569] px-1 italic">Estes campos são fundamentais para o processamento do pagamento.</p>
      </div>

      {/* ─── Campos Opcionais ─── */}
      <SectionLabel icon={ClipboardList}>Dados Adicionais</SectionLabel>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONAL_FIELDS.map(field => (
          <div 
            key={field.key} 
            className={cn(
              "flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200",
              config.optionalFields[field.key] 
                ? "border-purple-500/30 bg-purple-500/5" 
                : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
            )}
          >
            <span className={cn(
               "text-[13px] font-bold transition-colors",
               config.optionalFields[field.key] ? "text-white" : "text-[#64748b]"
            )}>{field.label}</span>
            <Switch
              checked={config.optionalFields[field.key]}
              onCheckedChange={v => updOptional(field.key, v)}
            />
          </div>
        ))}
      </div>

      {/* ─── Campos Personalizados ─── */}
      <div className="space-y-4">
        <SectionLabel icon={Plus}>Campos Personalizados</SectionLabel>
        <div className="space-y-3">
          {config.customFields.map((field, idx) => (
            <div key={field.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4 relative group">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-[#475569]" />
                 </div>
                 <Input
                    value={field.label}
                    onChange={e => updateCustomField(field.id, { label: e.target.value })}
                    className="h-9 bg-transparent border-none p-0 focus-visible:ring-0 text-[14px] font-bold text-white"
                    placeholder="Título do campo"
                 />
                 <button 
                   onClick={() => deleteCustomField(field.id)}
                   className="p-2 text-[#475569] hover:text-red-400 transition-colors"
                 >
                    <Trash2 className="h-4 w-4" />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-[#475569] uppercase ml-1">Tipo do Campo</label>
                   <select
                      className="w-full h-9 bg-black/40 border border-white/5 rounded-xl px-3 text-[12px] text-white outline-none focus:border-purple-500/50"
                      value={field.type}
                      onChange={e => updateCustomField(field.id, { type: e.target.value as FieldType })}
                   >
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                   </select>
                 </div>
                 <div className="flex flex-col justify-end gap-2 pb-1 pr-2 items-end">
                    <label className="text-[10px] font-bold text-[#475569] uppercase">Obrigatório?</label>
                    <Switch
                      checked={field.required}
                      onCheckedChange={v => updateCustomField(field.id, { required: v })}
                    />
                 </div>
              </div>

              <Input
                value={field.placeholder}
                onChange={e => updateCustomField(field.id, { placeholder: e.target.value })}
                className="h-10 bg-black/20 border-white/5 text-[12px] rounded-xl"
                placeholder="Texto explicativo interno (placeholder)"
              />
            </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full h-11 border-dashed border-white/10 bg-transparent text-[#64748b] hover:border-purple-500/30 hover:text-purple-400 transition-all rounded-xl gap-2"
            onClick={addCustomField}
          >
            <Plus className="h-4 w-4" /> Adicionar campo customizado
          </Button>
        </div>
      </div>

    </div>
  );
}
