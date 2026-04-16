"use client";

import { SocialProofConfig, Review, PopupInterval } from "@/types/checkout-config";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Star, Sparkles } from "lucide-react";

interface Props {
  config: SocialProofConfig;
  onChange: (data: Partial<SocialProofConfig>) => void;
}

const BR_NAMES = ["Ana Paula", "Carlos Silva", "Fernanda Lima", "João Souza", "Mariana Costa", "Pedro Alves", "Juliana Rocha", "Rafael Mendes", "Camila Ferreira", "Lucas Oliveira"];
const BR_CITIES = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Porto Alegre, RS", "Curitiba, PR", "Fortaleza, CE", "Salvador, BA", "Recife, PE", "Manaus, AM", "Goiânia, GO"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 mt-5 first:mt-0">{children}</p>;
}

function SectionCard({ title, enabled, onToggle, children }: {
  title: string; enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-xl border transition-colors", enabled ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
      <div className="flex items-center justify-between p-3">
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-3">{children}</div>}
    </div>
  );
}

export function SocialProofTab({ config, onChange }: Props) {
  const updPopup = (d: Partial<typeof config.popup>) => onChange({ popup: { ...config.popup, ...d } });
  const updReviews = (d: Partial<typeof config.reviews>) => onChange({ reviews: { ...config.reviews, ...d } });
  const updBuyerCount = (d: Partial<typeof config.buyerCount>) => onChange({ buyerCount: { ...config.buyerCount, ...d } });

  const addReview = () => {
    const r: Review = {
      id: Date.now().toString(),
      name: "Nome do Cliente",
      photoUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      stars: 5,
      text: "Excelente produto, valeu cada centavo!",
    };
    updReviews({ items: [...config.reviews.items, r] });
  };

  const generateReviews = () => {
    const generated: Review[] = Array.from({ length: 6 }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      name: `${BR_NAMES[Math.floor(Math.random() * BR_NAMES.length)]} (${BR_CITIES[Math.floor(Math.random() * BR_CITIES.length)]})`,
      photoUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
      stars: (Math.random() > 0.2 ? 5 : 4) as Review["stars"],
      text: [
        "Melhor investimento que fiz! Recomendo para todos.",
        "Superou minhas expectativas. Conteúdo incrível!",
        "Produto excelente, suporte muito atencioso.",
        "Valeu cada centavo. Já estou vendo resultados!",
        "Comprei sem expectativas e me surpreendi positivamente.",
        "O melhor do mercado, sem dúvidas. Nota 10!",
      ][i % 6],
    }));
    updReviews({ items: [...config.reviews.items, ...generated] });
  };

  const updateReview = (id: string, data: Partial<Review>) => {
    updReviews({ items: config.reviews.items.map(r => r.id === id ? { ...r, ...data } : r) });
  };

  const deleteReview = (id: string) => {
    updReviews({ items: config.reviews.items.filter(r => r.id !== id) });
  };

  const avgStars = config.reviews.items.length > 0
    ? (config.reviews.items.reduce((s, r) => s + r.stars, 0) / config.reviews.items.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-3">
      <SectionLabel>🔔 Notificações de Compra</SectionLabel>
      <SectionCard title="Popups de Compra (Social Proof)" enabled={config.popup.enabled} onToggle={v => updPopup({ enabled: v })}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Intervalo</label>
            <select
              className="w-full text-xs h-8 rounded border border-border bg-background px-2 text-text-primary"
              value={config.popup.interval}
              onChange={e => updPopup({ interval: Number(e.target.value) as PopupInterval })}
            >
              {([5, 10, 15, 30] as PopupInterval[]).map(v => (
                <option key={v} value={v}>{v} segundos</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Nº de compradores</label>
            <Input type="number" value={config.popup.purchaseCount}
              onChange={e => updPopup({ purchaseCount: Number(e.target.value) })} className="text-xs h-8" />
          </div>
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1 block">Texto (ex: compraram nas últimas 24h)</label>
          <Input value={config.popup.purchaseCountText}
            onChange={e => updPopup({ purchaseCountText: e.target.value })} className="text-xs h-8" />
        </div>
      </SectionCard>

      <SectionLabel>⭐ Avaliações de Clientes</SectionLabel>
      <SectionCard title="Exibir Avaliações" enabled={config.reviews.enabled} onToggle={v => updReviews({ enabled: v })}>
        {config.reviews.items.length > 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-warning/10 border border-warning/20 rounded-lg">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="text-sm font-bold text-warning">{avgStars}</span>
            <span className="text-xs text-text-secondary">média de {config.reviews.items.length} avaliações</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => updReviews({ display: "carousel" })}
            className={cn("py-1.5 text-xs rounded border transition-all",
              config.reviews.display === "carousel" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-text-secondary"
            )}
          >Carrossel</button>
          <button
            onClick={() => updReviews({ display: "list" })}
            className={cn("py-1.5 text-xs rounded border transition-all",
              config.reviews.display === "list" ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-text-secondary"
            )}
          >Lista</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={addReview} className="text-xs">
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
          <Button variant="outline" size="sm" onClick={generateReviews} className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" /> Gerar (IA)
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {config.reviews.items.map(r => (
            <div key={r.id} className="bg-background border border-border/50 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <Input value={r.name} onChange={e => updateReview(r.id, { name: e.target.value })}
                  className="text-xs h-7 flex-1 mr-2" placeholder="Nome" />
                <button onClick={() => deleteReview(r.id)} className="text-error hover:text-error/80 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => updateReview(r.id, { stars: n as Review["stars"] })}>
                    <Star className={cn("h-4 w-4 transition-colors", n <= r.stars ? "fill-warning text-warning" : "text-border")} />
                  </button>
                ))}
              </div>
              <textarea rows={2}
                className="w-full text-xs rounded border border-border/50 bg-background/50 px-2 py-1 text-text-primary focus:outline-none resize-none"
                value={r.text}
                onChange={e => updateReview(r.id, { text: e.target.value })}
                placeholder="Texto da avaliação..."
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionLabel>👥 Contador de Compradores</SectionLabel>
      <SectionCard title="Exibir Contador" enabled={config.buyerCount.enabled} onToggle={v => updBuyerCount({ enabled: v })}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Número</label>
            <Input type="number" value={config.buyerCount.count}
              onChange={e => updBuyerCount({ count: Number(e.target.value) })} className="text-xs h-8" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Termo</label>
            <Input value={config.buyerCount.label}
              onChange={e => updBuyerCount({ label: e.target.value })} className="text-xs h-8" placeholder="alunos" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
