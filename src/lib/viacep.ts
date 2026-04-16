export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
}
