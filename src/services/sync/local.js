import { aplicarAtualizacoes, novaChaveLocal } from './estado';

// Modo local: sincroniza apenas entre abas do MESMO navegador.
// Serve para testar sem Firebase. Para vários aparelhos, use o Firebase.
export function criarClienteLocal(codigo) {
  const chave = `caminho-seguro:sessao:${codigo}`;
  const ouvintes = new Set();

  const ler = () => {
    try {
      return JSON.parse(localStorage.getItem(chave)) || {};
    } catch {
      return {};
    }
  };
  const avisar = () => {
    const estado = ler();
    ouvintes.forEach((f) => f(estado));
  };

  return {
    modo: 'local',
    assinar(aoEstado, aoConexao) {
      ouvintes.add(aoEstado);
      const aoMudar = (e) => {
        if (e.key === chave) avisar();
      };
      window.addEventListener('storage', aoMudar);
      aoConexao('online');
      const t = setTimeout(() => aoEstado(ler()), 0);
      return () => {
        clearTimeout(t);
        ouvintes.delete(aoEstado);
        window.removeEventListener('storage', aoMudar);
      };
    },
    atualizar(atualizacoes) {
      const novo = aplicarAtualizacoes(ler(), atualizacoes);
      try {
        localStorage.setItem(chave, JSON.stringify(novo));
      } catch {
        /* navegador sem armazenamento */
      }
      avisar();
      return Promise.resolve();
    },
    novaChave: novaChaveLocal,
  };
}
