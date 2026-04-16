"use client";

import { FormConfig, CustomField, FieldType } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Props {
  config: FormConfig;
  onChange: (data: Partial<FormConfig>) => void;
}

const OPTIONAL_FIELDS: [keyof FormConfig["optionalFields"], string][] = [
  ["cpf", "CPF"],
  ["phone", "Telefone / WhatsApp"],
  ["birthDate", "Data de Nascimento"],
  ["address", "Endereço Completo"],
  ["zipCode", "CEP"],
  ["company", "Empresa"],
];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção" },
  { value: "checkbox", label: "Checkbox" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

export function FormFieldsTab({ config, onChange }: Props) {
  const updOptional = (key: keyof FormConfig["optionalFields"], val: boolean) => {
    onChange({ optionalFields: { ...config.optionalFields, [key]: val } });
  };

  const addCustomField = () => {
    const f: CustomField = {
      id: Date.now().toString(),
      label: "Novo Campo",
      placeholder: "",
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
    <div className="space-y-1">
      <SectionLabel>Campos Padrão (Sempre Presentes)</SectionLabel>
      <div className="space-y-2">
        {[["Nome Completo", true], ["E-mail", true]].map(([label]) => (
          <div key={label as string} className="flex items-center justify-between px-3 py-2 bg-background/50 border border-border/30 rounded-lg">
            <span className="text-xs text-text-primary font-medium">{label as string}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Obrigatório</span>
          </div>
        ))}
      </div>

      <SectionLabel>Campos Opcionais</SectionLabel>
      <div className="space-y-2">
        {OPTIONAL_FIELDS.map(([key, label]) => (
          <div key={key} className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border transition-colors",
            config.optionalFields[key] ? "border-primary/30 bg-primary/5" : "border-border bg-card"
          )}>
            <span className="text-xs text-text-primary">{label}</span>
            <Switch
              checked={config.optionalFields[key]}
              onCheckedChange={v => updOptional(key, v)}
            />
          </div>
        ))}
      </div>

      <SectionLabel>Campos Personalizados</SectionLabel>
      <div className="space-y-2">
        {config.customFields.map(field => (
          <div key={field.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-text-secondary/30 shrink-0 cursor-grab" />
              <Input
                value={field.label}
                onChange={e => updateCustomField(field.id, { label: e.target.value })}
                className="text-xs h-7 flex-1"
                placeholder="Label do campo"
              />
              <button onClick={() => deleteCustomField(field.id)} className="text-error hover:text-error/80 shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-secondary mb-1 block">Tipo</label>
                <select
                  className="w-full text-xs h-7 rounded border border-border bg-background px-1.5 text-text-primary"
                  value={field.type}
                  onChange={e => updateCustomField(field.id, { type: e.target.value as FieldType })}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="text-[10px] text-text-secondary">Obrigatório</label>
                <Switch
                  checked={field.required}
                  onCheckedChange={v => updateCustomField(field.id, { required: v })}
                />
              </div>
            </div>
            <Input
              value={field.placeholder}
              onChange={e => updateCustomField(field.id, { placeholder: e.target.value })}
              className="text-xs h-7"
              placeholder="Placeholder (ex: Digite seu nome)"
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addCustomField} className="w-full text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Campo Personalizado
        </Button>
      </div>
    </div>
  );
}
