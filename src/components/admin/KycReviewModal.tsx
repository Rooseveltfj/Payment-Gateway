import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { CheckCircle2, XCircle, Search } from "lucide-react";

interface KycDocument {
  type: string;
  fileUrl: string;
}

interface KycUser {
  id: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  kycDocuments: KycDocument[];
}

export function KycReviewModal({ user, onClose, onRefresh }: { user: KycUser, onClose: () => void, onRefresh: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const docs = user.kycDocuments || [];
  const front = docs.find(d => d.type === "IDENTITY_FRONT")?.fileUrl;
  const back = docs.find(d => d.type === "IDENTITY_BACK")?.fileUrl;
  const selfie = docs.find(d => d.type === "SELFIE")?.fileUrl;
  const residency = docs.find(d => d.type === "PROOF_OF_ADDRESS")?.fileUrl;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/kyc/${user.id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error("Erro ao aprovar");
      onRefresh();
      onClose();
    } catch (e) {
      alert("Houve um erro ao aprovar o KYC.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return alert("Insira o motivo da rejeição");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/kyc/${user.id}/reject`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }) 
      });
      if (!res.ok) throw new Error("Erro ao rejeitar");
      onRefresh();
      onClose();
    } catch (e) {
      alert("Houve um erro ao rejeitar o KYC.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Análise KYC: ${user.name}`} isOpen={true} onClose={onClose}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto pr-2">
        {/* Gallery */}
        <div className="space-y-4">
           <h4 className="text-sm font-semibold text-text-primary border-b border-border pb-2">Documentos Anexados</h4>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <span className="text-xs text-text-secondary">Identidade Frente</span>
                 <a href={front} target="_blank" rel="noreferrer" className="block relative h-32 rounded-lg border border-border overflow-hidden group">
                    <img src={front} alt="Frente do Documento" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Search className="text-white h-6 w-6" />
                    </div>
                 </a>
              </div>
              <div className="space-y-1">
                 <span className="text-xs text-text-secondary">Identidade Verso</span>
                 <a href={back} target="_blank" rel="noreferrer" className="block relative h-32 rounded-lg border border-border overflow-hidden group">
                    <img src={back} alt="Verso do Documento" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                 </a>
              </div>
              <div className="space-y-1">
                 <span className="text-xs text-text-secondary">Selfie Biométrica</span>
                 <a href={selfie} target="_blank" rel="noreferrer" className="block relative h-32 rounded-lg border border-border overflow-hidden group">
                    <img src={selfie} alt="Selfie do Usuário" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                 </a>
              </div>
              <div className="space-y-1">
                 <span className="text-xs text-text-secondary">Residência</span>
                 <a href={residency} target="_blank" rel="noreferrer" className="block relative h-32 rounded-lg border border-border overflow-hidden group">
                    <img src={residency} alt="Comprovante de Residência" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                 </a>
              </div>
           </div>
        </div>

        {/* User Info & Controls */}
        <div className="space-y-6">
           <div>
              <h4 className="text-sm font-semibold text-text-primary border-b border-border pb-2 mb-3">Dados Cadastrais</h4>
              <ul className="text-sm text-text-secondary space-y-2 font-mono">
                <li><strong className="text-text-primary font-sans block text-xs">CPF:</strong> {user.document}</li>
                <li><strong className="text-text-primary font-sans block text-xs mt-2">Telefone:</strong> {user.phone}</li>
                <li><strong className="text-text-primary font-sans block text-xs mt-2">Email:</strong> {user.email}</li>
              </ul>
           </div>

           {!rejecting ? (
             <div className="flex flex-col gap-3 pt-6 border-t border-border">
               <Button onClick={handleApprove} disabled={submitting} className="w-full bg-success hover:bg-success/90 text-white font-bold h-12">
                 <CheckCircle2 className="h-5 w-5 mr-2" /> Aprovar Conta
               </Button>
               <Button variant="outline" onClick={() => setRejecting(true)} disabled={submitting} className="w-full text-error border-error/50 hover:bg-error/10 h-10">
                 <XCircle className="h-4 w-4 mr-2" /> Recusar Anexos
               </Button>
             </div>
           ) : (
             <div className="p-4 bg-error/10 border border-error/20 rounded-xl space-y-3 animate-in fade-in zoom-in-95">
                <label className="text-sm font-semibold text-error">Motivo da Rejeição (Email ao usuário)</label>
                <textarea 
                  className="w-full text-sm bg-background border border-error/50 rounded-lg p-2 focus:ring-error text-text-primary" 
                  rows={4} 
                  placeholder="Ex: Documento ilegível / Selfie muito escura"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2">
                   <Button variant="outline" className="flex-1" onClick={() => setRejecting(false)}>Cancelar</Button>
                   <Button variant="default" className="flex-1 bg-error hover:bg-error/90" onClick={handleReject} disabled={submitting}>Rejeitar KYC</Button>
                </div>
             </div>
           )}
        </div>
      </div>
    </Modal>
  );
}
