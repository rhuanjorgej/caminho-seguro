import { useEffect, useMemo, useState } from 'react';
import { criarCliente, modoSincronizacao } from '../services/sync';
import { donaInicial } from '../config/simulacao';

// Liga o aparelho a uma sessão de demonstração (pelo código) e entrega
// o estado em tempo real mais as ações para alterá-lo.
export function useSessao(codigo) {
  const [estado, setEstado] = useState(null);
  const [conexao, setConexao] = useState('conectando');
  const [demorando, setDemorando] = useState(false);

  const cliente = useMemo(() => (codigo ? criarCliente(codigo) : null), [codigo]);

  useEffect(() => {
    if (!cliente) return undefined;
    setEstado(null);
    setConexao('conectando');
    setDemorando(false);
    const parar = cliente.assinar(setEstado, setConexao);
    const t = setTimeout(() => setDemorando(true), 8000);
    return () => {
      clearTimeout(t);
      parar();
    };
  }, [cliente]);

  const acoes = useMemo(() => {
    if (!cliente) return {};
    return {
      atualizar: (u) => cliente.atualizar(u),
      criarSessao: () => cliente.atualizar({ criada: Date.now(), reinicio: Date.now(), dona: donaInicial() }),
      registrarMembro: (id, { nome, parentesco }) =>
        cliente.atualizar({ [`membros/${id}`]: { nome, parentesco, entrou: Date.now(), visto: Date.now() } }),
      batimento: (id) => cliente.atualizar({ [`membros/${id}/visto`]: Date.now() }),
      criarAlerta: (dados) => {
        const id = cliente.novaChave();
        cliente.atualizar({ [`alertas/${id}`]: { criado: Date.now(), ...dados } });
        return id;
      },
      atualizarAlerta: (id, mudancas) =>
        cliente.atualizar(Object.fromEntries(Object.entries(mudancas).map(([k, v]) => [`alertas/${id}/${k}`, v]))),
      reiniciar: () =>
        cliente.atualizar({ alertas: null, comando: null, dona: donaInicial(), reinicio: Date.now() }),
      enviarComando: (tipo, de) => cliente.atualizar({ comando: { tipo, de, em: Date.now() } }),
    };
  }, [cliente]);

  return {
    estado: estado || {},
    carregado: estado !== null,
    existe: Boolean(estado && estado.criada),
    conexao,
    demorando: demorando && estado === null,
    modo: modoSincronizacao,
    ...acoes,
  };
}
