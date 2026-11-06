// Voz: o tablet fala (síntese) e entende comandos simples (reconhecimento).
// O reconhecimento depende do navegador (Chrome funciona bem; Safari é limitado).

export const suporteFala = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function escolherVoz() {
  const vozes = window.speechSynthesis.getVoices();
  const pt = (v) => v.lang?.toLowerCase().replace('_', '-');
  return vozes.find((v) => pt(v) === 'pt-br') || vozes.find((v) => pt(v)?.startsWith('pt')) || null;
}

export function falar(texto) {
  if (!suporteFala() || !texto) return;
  try {
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 0.9;
    const voz = escolherVoz();
    if (voz) fala.voice = voz;
    window.speechSynthesis.speak(fala);
  } catch {
    /* sem voz neste navegador */
  }
}

export function calarVoz() {
  if (suporteFala()) window.speechSynthesis.cancel();
}

const Reconhecimento = () =>
  typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const suporteReconhecimento = () => Boolean(Reconhecimento());

// Retorna uma função para parar de ouvir.
export function ouvir({ aoResultado, aoFim, aoErro }) {
  const Classe = Reconhecimento();
  if (!Classe) {
    aoErro?.('nao-suportado');
    aoFim?.();
    return () => {};
  }
  const r = new Classe();
  r.lang = 'pt-BR';
  r.interimResults = false;
  r.continuous = false;
  r.maxAlternatives = 3;
  r.onresult = (e) => aoResultado(Array.from(e.results[0]).map((a) => a.transcript));
  r.onerror = (e) => aoErro?.(e.error);
  r.onend = () => aoFim?.();
  try {
    r.start();
  } catch {
    aoErro?.('erro-ao-iniciar');
    aoFim?.();
  }
  return () => {
    try {
      r.stop();
    } catch {
      /* já parou */
    }
  };
}

const limpar = (t) =>
  String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Retorna: 'ajuda' | 'onde' | 'caminhar' | 'familia' | null
export function interpretarComando(frases) {
  const lista = Array.isArray(frases) ? frases : [frases];
  for (const frase of lista) {
    const t = limpar(frase);
    if (/(ajuda|socorro|me ajud|estou perdida|me perdi)/.test(t)) return 'ajuda';
    if (/onde\s+(eu\s+)?(estou|to)\b|onde fica|qual (e )?o (meu )?lugar/.test(t)) return 'onde';
    if (/(padaria|pao|caminho|ir para|caminhar|passear)/.test(t)) return 'caminhar';
    if (/(familia|filha|filho|neta|neto|ligar|telefone)/.test(t)) return 'familia';
  }
  return null;
}
