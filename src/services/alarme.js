// Som de alerta gerado no próprio navegador (nenhum arquivo de áudio externo).
// Usamos elementos <audio>: no iPhone eles tocam mesmo com o botão de silêncio ligado
// e só precisam de UM toque do usuário para serem liberados.

const TAXA = 22050;

function paraWav(amostras) {
  const buffer = new ArrayBuffer(44 + amostras.length * 2);
  const v = new DataView(buffer);
  const escrever = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  escrever(0, 'RIFF');
  v.setUint32(4, 36 + amostras.length * 2, true);
  escrever(8, 'WAVE');
  escrever(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, TAXA, true);
  v.setUint32(28, TAXA * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  escrever(36, 'data');
  v.setUint32(40, amostras.length * 2, true);
  amostras.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true));
  return new Blob([buffer], { type: 'audio/wav' });
}

// Sirene urgente: alterna dois tons (1,6 s)
function gerarSirene() {
  const n = Math.floor(TAXA * 1.6);
  const dados = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / TAXA;
    const f = Math.floor(t / 0.4) % 2 === 0 ? 880 : 660;
    const tb = t % 0.4;
    const env = Math.max(0, Math.min(1, tb / 0.02, (0.4 - tb) / 0.03));
    dados[i] = 0.7 * env * Math.sin(2 * Math.PI * f * t);
  }
  return dados;
}

// Atenção: dois bipes suaves (2 s)
function gerarAtencao() {
  const n = Math.floor(TAXA * 2);
  const dados = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / TAXA;
    const tb = t % 0.5;
    if (tb < 0.28 && t < 1) {
      const env = Math.max(0, Math.min(1, tb / 0.02, (0.28 - tb) / 0.04));
      dados[i] = 0.6 * env * Math.sin(2 * Math.PI * 740 * t);
    }
  }
  return dados;
}

let sons = null;
function obterSons() {
  if (!sons) {
    const criar = (amostras) => {
      const audio = new Audio(URL.createObjectURL(paraWav(amostras)));
      audio.loop = true;
      audio.preload = 'auto';
      return audio;
    };
    sons = { urgente: criar(gerarSirene()), atencao: criar(gerarAtencao()) };
  }
  return sons;
}

let liberado = false;
export const somLiberado = () => liberado;

// Chamar DENTRO de um toque/clique do usuário.
export async function liberarSom() {
  let ok = true;
  for (const audio of Object.values(obterSons())) {
    try {
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {
      ok = false;
    } finally {
      audio.muted = false;
    }
  }
  if (ok) liberado = true;
  return ok;
}

let atual = null;
let vibrador = null;

export function iniciarAlarme(nivel = 'urgente') {
  pararAlarme();
  const audio = obterSons()[nivel] || obterSons().urgente;
  atual = audio;
  audio.currentTime = 0;
  audio.play().catch(() => {});
  if (navigator.vibrate) {
    const vibrar = () => navigator.vibrate(nivel === 'urgente' ? [400, 200, 400] : [250]);
    vibrar();
    vibrador = setInterval(vibrar, 1600);
  }
}

export function pararAlarme() {
  if (atual) {
    atual.pause();
    atual.currentTime = 0;
    atual = null;
  }
  if (vibrador) {
    clearInterval(vibrador);
    vibrador = null;
    navigator.vibrate?.(0);
  }
}
