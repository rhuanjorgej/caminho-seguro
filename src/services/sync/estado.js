// Funções compartilhadas pelos dois "modos" de sincronização (Firebase e local).

// Sem I, L, O, 0 e 1 para ninguém confundir ao digitar o código.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function gerarCodigo() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
}

export function normalizarCodigo(texto = '') {
  return String(texto).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export const codigoValido = (c) => /^[A-Z0-9]{6}$/.test(c || '');

export function formatarCodigo(codigo = '') {
  return codigo.length > 3 ? `${codigo.slice(0, 3)}-${codigo.slice(3)}` : codigo;
}

// Aplica um conjunto de alterações no estilo do Firebase:
// { "alertas/abc/status": "confirmado", "comando": null }  (null apaga)
export function aplicarAtualizacoes(estado, atualizacoes) {
  const novo = JSON.parse(JSON.stringify(estado || {}));
  for (const [caminho, valor] of Object.entries(atualizacoes)) {
    const partes = caminho.split('/');
    let alvo = novo;
    for (let i = 0; i < partes.length - 1; i += 1) {
      const p = partes[i];
      if (typeof alvo[p] !== 'object' || alvo[p] === null) alvo[p] = {};
      alvo = alvo[p];
    }
    const ultima = partes[partes.length - 1];
    if (valor === null || valor === undefined) delete alvo[ultima];
    else alvo[ultima] = JSON.parse(JSON.stringify(valor));
  }
  return novo;
}

export function novaChaveLocal() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
