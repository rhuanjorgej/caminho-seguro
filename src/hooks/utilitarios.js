import { useCallback, useEffect, useRef, useState } from 'react';
import { ler, gravar } from '../utils/armazenamento';

// Relógio que "bate" a cada intervalo (para horas relativas e presença)
export function useAgora(intervalo = 1000) {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), intervalo);
    return () => clearInterval(id);
  }, [intervalo]);
  return agora;
}

// Mantém a tela acesa (quando o navegador permite)
export function useWakeLock() {
  useEffect(() => {
    let trava = null;
    const pedir = async () => {
      try {
        if ('wakeLock' in navigator) trava = await navigator.wakeLock.request('screen');
      } catch {
        /* sem permissão */
      }
    };
    pedir();
    const aoVoltar = () => document.visibilityState === 'visible' && pedir();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      trava?.release?.().catch(() => {});
    };
  }, []);
}

// Valor guardado no aparelho
export function usePreferencia(chave, padrao) {
  const [valor, setValor] = useState(() => ler(chave, padrao));
  const mudar = useCallback(
    (novo) => {
      setValor(novo);
      gravar(chave, novo);
    },
    [chave],
  );
  return [valor, mudar];
}

// Avisos rápidos na tela
export function useAvisos() {
  const [avisos, setAvisos] = useState([]);
  const mostrar = useCallback((texto, tom = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setAvisos((a) => [...a.slice(-2), { id, texto, tom }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 6000);
  }, []);
  return { avisos, mostrar };
}

// Guarda o rastro de posições recebidas (só para desenhar no mapa)
export function useTrilha(dona, reinicio) {
  const [trilha, setTrilha] = useState([]);
  const ultimoReinicio = useRef(reinicio);
  useEffect(() => {
    if (ultimoReinicio.current !== reinicio) {
      ultimoReinicio.current = reinicio;
      setTrilha([]);
    }
  }, [reinicio]);
  useEffect(() => {
    if (!dona || dona.modo === 'casa') {
      setTrilha([]);
      return;
    }
    setTrilha((t) => {
      const ult = t[t.length - 1];
      if (ult && ult[0] === dona.x && ult[1] === dona.y) return t;
      return [...t.slice(-120), [dona.x, dona.y]];
    });
  }, [dona?.x, dona?.y, dona?.modo]);
  return trilha;
}

// Chama "aoNovo" para cada alerta que aparece depois do primeiro carregamento
export function useNovosAlertas(alertas, carregado, aoNovo) {
  const vistos = useRef(null);
  const callback = useRef(aoNovo);
  callback.current = aoNovo;
  useEffect(() => {
    if (!carregado) return;
    if (vistos.current === null) {
      vistos.current = new Set(alertas.map((a) => a.id));
      return;
    }
    for (const a of alertas) {
      if (!vistos.current.has(a.id)) {
        vistos.current.add(a.id);
        callback.current(a);
      }
    }
  }, [alertas, carregado]);
}
