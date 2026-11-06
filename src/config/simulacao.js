// Tudo aqui é FICTÍCIO: o bairro, as ruas, a padaria e a caminhada.
// Nenhum GPS e nenhum rastreamento real são usados.

export const VISAO = { largura: 110, altura: 95 };
export const GRADE_X = [10, 25, 40, 55, 70, 85, 100];
export const GRADE_Y = [10, 25, 40, 55, 70, 85];

export const RUAS_H = {
  10: 'Rua dos Pinheiros',
  25: 'Rua das Acácias',
  40: 'Avenida Central',
  55: 'Rua da Escola',
  70: 'Rua das Flores',
  85: 'Rua do Mercado',
};
export const RUAS_V = {
  10: 'Rua do Lago',
  25: 'Rua das Palmeiras',
  40: 'Rua dos Ipês',
  55: 'Rua do Sol',
  70: 'Rua da Praça',
  85: 'Rua do Cedro',
  100: 'Rua do Forno',
};

export const CASA = { x: 10, y: 70, nome: 'Casa da Dona Marta' };
export const PADARIA = { x: 100, y: 40, nome: 'Padaria Estrela' };

// Quarteirões com nome (x, y = canto superior esquerdo; cada um mede 15 x 15)
export const LOCAIS = [
  { id: 'praca', nome: 'Praça', perto: 'da Praça', x: 55, y: 55, cor: '#D6E7CC' },
  { id: 'escola', nome: 'Escola', perto: 'da Escola', x: 25, y: 40, cor: '#E8DCC4' },
  { id: 'mercado', nome: 'Mercado', perto: 'do Mercado', x: 40, y: 70, cor: '#E8DCC4' },
  { id: 'farmacia', nome: 'Farmácia', perto: 'da Farmácia', x: 85, y: 55, cor: '#E8DCC4' },
  { id: 'igreja', nome: 'Igreja', perto: 'da Igreja', x: 10, y: 25, cor: '#E8DCC4' },
];

// Caminho recomendado: casa -> Rua das Flores -> Rua da Praça -> Avenida Central -> padaria
export const ROTA = [
  [10, 70],
  [70, 70],
  [70, 40],
  [100, 40],
];

const segmentos = [];
let acumulado = 0;
for (let i = 1; i < ROTA.length; i += 1) {
  const [x0, y0] = ROTA[i - 1];
  const [x1, y1] = ROTA[i];
  const comp = Math.hypot(x1 - x0, y1 - y0);
  segmentos.push({ x0, y0, x1, y1, comp, inicio: acumulado, fim: acumulado + comp, dx: (x1 - x0) / comp, dy: (y1 - y0) / comp });
  acumulado += comp;
}
export const TOTAL = acumulado; // 120 unidades
export const VELOCIDADE = 2; // unidades por segundo (a demonstração dura cerca de 1 minuto)
export const UNIDADES_POR_MINUTO = 20; // só para falar "a cerca de X minutos"

export const TRECHOS = [
  {
    rua: 'Rua das Flores',
    agora: 'Siga em frente pela Rua das Flores',
    depois: 'Depois, vire à esquerda na Rua da Praça',
    seta: 'esquerda',
  },
  {
    rua: 'Rua da Praça',
    agora: 'Siga em frente pela Rua da Praça',
    depois: 'Depois, vire à direita na Avenida Central',
    seta: 'direita',
  },
  {
    rua: 'Avenida Central',
    agora: 'Siga em frente pela Avenida Central',
    depois: `A ${PADARIA.nome} fica no fim desta rua`,
    seta: 'destino',
  },
];

export function indiceDoTrecho(d) {
  const i = segmentos.findIndex((s) => d <= s.fim);
  return i === -1 ? segmentos.length - 1 : i;
}
export const trechoAtual = (d) => TRECHOS[indiceDoTrecho(d)];

export function pontoNaRota(d) {
  const dd = Math.max(0, Math.min(TOTAL, d));
  const s = segmentos[indiceDoTrecho(dd)];
  const t = dd - s.inicio;
  return { x: s.x0 + s.dx * t, y: s.y0 + s.dy * t, dx: s.dx, dy: s.dy };
}

export const donaInicial = () => ({
  x: CASA.x,
  y: CASA.y,
  d: 0,
  desvio: 0,
  dirX: 0,
  dirY: 0,
  maxDesvio: 0,
  modo: 'casa',
  atualizado: Date.now(),
});

export function comPosicao(dona) {
  const p = pontoNaRota(dona.d || 0);
  const desvio = dona.desvio || 0;
  return {
    ...dona,
    x: round(p.x + (dona.dirX || 0) * desvio),
    y: round(p.y + (dona.dirY || 0) * desvio),
    atualizado: Date.now(),
  };
}
const round = (n) => Math.round(n * 100) / 100;

// Começa um desvio: a Dona Marta sai do caminho em uma rua transversal.
export function iniciarDesvio(dona) {
  // pontos de saída: esquinas que não são curvas do caminho
  const candidatos = [15, 30, 45, 75, 105];
  const d = candidatos.reduce((a, b) => (Math.abs(b - dona.d) < Math.abs(a - dona.d) ? b : a));
  const p = pontoNaRota(d);
  const opcoes = [
    { x: -p.dy || 0, y: p.dx || 0 },
    { x: p.dy || 0, y: -p.dx || 0 },
  ].map((o) => ({ ...o, espaco: espaco(p, o) }));
  const melhor = opcoes[0].espaco >= opcoes[1].espaco ? opcoes[0] : opcoes[1];
  return comPosicao({
    ...dona,
    d,
    desvio: 0,
    dirX: melhor.x,
    dirY: melhor.y,
    maxDesvio: Math.min(30, melhor.espaco),
    modo: 'desviando',
  });
}
function espaco(p, o) {
  if (o.x > 0) return 100 - p.x;
  if (o.x < 0) return p.x - 10;
  if (o.y > 0) return 85 - p.y;
  return p.y - 10;
}

// Avança um passo (1 segundo) da simulação
export function passo(dona) {
  const novo = { ...dona };
  if (dona.modo === 'andando') {
    novo.d = Math.min(TOTAL, (dona.d || 0) + VELOCIDADE);
    if (novo.d >= TOTAL) novo.modo = 'chegou';
  } else if (dona.modo === 'desviando') {
    novo.desvio = Math.min(dona.maxDesvio || 0, (dona.desvio || 0) + VELOCIDADE);
    if (novo.desvio >= (dona.maxDesvio || 0)) novo.modo = 'perdida';
  } else if (dona.modo === 'voltando') {
    novo.desvio = Math.max(0, (dona.desvio || 0) - VELOCIDADE * 1.5);
    if (novo.desvio <= 0) novo.modo = 'andando';
  }
  return comPosicao(novo);
}

const achar = (tabela, valor) => {
  const chave = Object.keys(tabela).find((k) => Math.abs(Number(k) - valor) < 1.5);
  return chave ? tabela[chave] : null;
};

function localMaisProximo(x, y) {
  let melhor = null;
  for (const l of LOCAIS) {
    const dist = Math.hypot(x - (l.x + 7.5), y - (l.y + 7.5));
    if (dist < 16 && (!melhor || dist < melhor.dist)) melhor = { ...l, dist };
  }
  return melhor;
}

// Texto simples e calmo para "Onde estou?" e para o histórico
export function descreverLocal(dona) {
  const { x = 10, y = 70, d = 0, desvio = 0, modo } = dona || {};
  if (modo === 'casa') return { curto: 'em casa', texto: 'Você está em casa.' };
  if (modo === 'chegou') {
    return { curto: `na ${PADARIA.nome}`, texto: `Você chegou na ${PADARIA.nome}. Pode ficar tranquila.` };
  }
  const h = achar(RUAS_H, y);
  const v = achar(RUAS_V, x);
  let onde;
  let curto;
  if (h && v) {
    onde = `na esquina da ${h} com a ${v}`;
    curto = `${h} com ${v}`;
  } else if (h || v) {
    onde = `na ${h || v}`;
    curto = h || v;
  } else {
    onde = 'em uma rua do bairro';
    curto = 'bairro';
  }
  const perto = localMaisProximo(x, y);
  const min = Math.max(1, Math.round((d + desvio) / UNIDADES_POR_MINUTO));
  const texto = `Você está ${onde}${perto ? `, perto ${perto.perto}` : ''}. Sua casa fica a cerca de ${min} ${min === 1 ? 'minuto' : 'minutos'} daqui.`;
  return { curto: `${curto}${perto ? `, perto ${perto.perto}` : ''}`, texto };
}

export const STATUS_DONA = {
  casa: { texto: 'Em casa', tom: 'neutro' },
  andando: { texto: 'Caminhando até a padaria', tom: 'ok' },
  parada: { texto: 'Parou no caminho', tom: 'neutro' },
  desviando: { texto: 'Saiu do caminho (simulado)', tom: 'atencao' },
  perdida: { texto: 'Parada fora do caminho (simulado)', tom: 'atencao' },
  voltando: { texto: 'Voltando ao caminho', tom: 'atencao' },
  chegou: { texto: 'Chegou na padaria', tom: 'ok' },
};
