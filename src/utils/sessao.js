export function listarAlertas(obj) {
  return Object.entries(obj || {})
    .map(([id, a]) => ({ id, ...a }))
    .sort((a, b) => (a.criado || 0) - (b.criado || 0));
}

export function listarMembros(obj, agora = Date.now()) {
  return Object.entries(obj || {})
    .map(([id, m]) => ({ id, ...m, online: agora - (m.visto || 0) < 45000 }))
    .sort((a, b) => (a.entrou || 0) - (b.entrou || 0));
}

export const ehUrgente = (a) => a.tipo === 'ajuda';
export const precisaAtendimento = (a) => a.tipo === 'ajuda' || a.tipo === 'desvio';

export const TITULOS = {
  ajuda: 'Pedido de ajuda',
  desvio: 'Saiu do caminho (simulado)',
  onde: 'Consultou "Onde estou?"',
  saida: 'Saiu de casa',
  chegada: 'Chegou na padaria',
};

export const PARENTESCOS = ['Filha', 'Filho', 'Neta', 'Neto', 'Irmã', 'Irmão', 'Cuidador(a)', 'Vizinho(a)'];

export const FAMILIARES_FICTICIOS = [
  { nome: 'Helena', parentesco: 'Filha' },
  { nome: 'Carlos', parentesco: 'Filho' },
  { nome: 'Beatriz', parentesco: 'Neta' },
];

const CORES = ['#1D5C63', '#35507A', '#9A4A27', '#6B4E8C', '#2F6B3D', '#8A5A00'];
export function corDoNome(nome = '') {
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 997;
  return CORES[h % CORES.length];
}
