import { useEffect, useMemo, useRef, useState } from 'react';
import { BellOff, FlaskConical, History, MapPin, Users } from 'lucide-react';
import { useSessao } from '../../hooks/useSessao';
import { useAgora, useAvisos, useNovosAlertas, useTrilha, useWakeLock } from '../../hooks/utilitarios';
import { BannerDemo, ListaAvisos, SeloConexao } from '../../components/ui/Pecas';
import Carregando from '../../components/ui/Carregando';
import Botao from '../../components/ui/Botao';
import { codigoValido, formatarCodigo } from '../../services/sync/estado';
import { iniciarAlarme, liberarSom, pararAlarme, somLiberado } from '../../services/alarme';
import { donaInicial } from '../../config/simulacao';
import { listarAlertas, listarMembros, precisaAtendimento } from '../../utils/sessao';
import { idDoAparelho, ler, gravar, remover } from '../../utils/armazenamento';
import { EntrarCodigo, EntrarFamilia } from './Entrar';
import AlertaTelaCheia from './AlertaTelaCheia';
import { AbaAgora, AbaDemo, AbaFamilia, AbaHistorico } from './Abas';

const DONA_PADRAO = donaInicial();

export default function Familia({ codigoInicial, aoSair }) {
  const [codigo, setCodigo] = useState(codigoInicial || '');
  const valido = codigoValido(codigo);
  const sessao = useSessao(valido ? codigo : null);
  const [eu, setEu] = useState(() => {
    const salvo = ler('membro');
    return salvo && salvo.codigo === codigoInicial ? salvo : null;
  });

  const trocarCodigo = () => {
    setCodigo('');
    setEu(null);
    remover('membro');
  };

  if (!valido) return <><BannerDemo /><EntrarCodigo aoContinuar={setCodigo} aoVoltar={aoSair} /></>;
  if (!sessao.carregado) {
    return <><BannerDemo /><Carregando demorando={sessao.demorando} modo={sessao.modo} aoSair={aoSair} /></>;
  }
  if (!sessao.existe) {
    return (
      <>
        <BannerDemo />
        <main className="entrar">
          <h1>Código não encontrado</h1>
          <p className="texto-suave">Não achei a demonstração {formatarCodigo(codigo)}. Confira o código no tablet e tente de novo.</p>
          {sessao.modo === 'local' && (
            <p className="faixa faixa--info">Modo local: o painel só enxerga demonstrações abertas neste mesmo navegador. Para vários aparelhos, configure o Firebase.</p>
          )}
          <Botao tamanho="grande" onClick={trocarCodigo}>Digitar outro código</Botao>
        </main>
      </>
    );
  }
  if (!eu) {
    return (
      <>
        <BannerDemo />
        <EntrarFamilia
          codigo={codigo}
          aoTrocarCodigo={trocarCodigo}
          aoEntrar={async (dados) => {
            await liberarSom(); // precisa acontecer dentro do toque
            const novo = { id: idDoAparelho(), codigo, ...dados };
            gravar('membro', novo);
            gravar('ultima', { papel: 'familia', codigo });
            setEu(novo);
          }}
        />
      </>
    );
  }
  return <PainelFamilia sessao={sessao} codigo={codigo} eu={eu} aoSair={aoSair} />;
}

function PainelFamilia({ sessao, codigo, eu, aoSair }) {
  const { estado, conexao, modo, carregado, registrarMembro, batimento, atualizarAlerta, reiniciar, enviarComando } = sessao;
  const agora = useAgora(1000);
  useWakeLock();
  const { avisos, mostrar } = useAvisos();
  const [aba, setAba] = useState('agora');
  const [somOk, setSomOk] = useState(somLiberado());
  const [silenciadoId, setSilenciadoId] = useState(null);
  const [dispensadoId, setDispensadoId] = useState(null);

  const alertas = useMemo(() => listarAlertas(estado.alertas), [estado.alertas]);
  const alertasRef = useRef(alertas);
  alertasRef.current = alertas;
  const membros = useMemo(() => listarMembros(estado.membros, agora), [estado.membros, agora]);
  const dona = estado.dona || DONA_PADRAO;
  const trilha = useTrilha(estado.dona, estado.reinicio);

  const pendentes = alertas.filter((a) => precisaAtendimento(a) && a.status === 'aberto');
  const confirmados = alertas.filter((a) => precisaAtendimento(a) && a.status === 'confirmado');
  // o mais grave primeiro: pedido de ajuda vence "saiu do caminho"
  const principal = [...pendentes].sort((a, b) => (a.tipo === 'ajuda' ? 1 : 0) - (b.tipo === 'ajuda' ? 1 : 0)).pop();

  // presença: avisa que este celular está aqui
  useEffect(() => {
    registrarMembro(eu.id, eu);
    const id = setInterval(() => batimento(eu.id), 15000);
    return () => clearInterval(id);
  }, [eu.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // libera o som no primeiro toque depois de recarregar a página
  useEffect(() => {
    if (somOk) return undefined;
    const liberar = () => liberarSom().then((ok) => ok && setSomOk(true));
    document.addEventListener('pointerdown', liberar, { once: true });
    return () => document.removeEventListener('pointerdown', liberar);
  }, [somOk]);

  // som + título piscando enquanto houver pedido sem atendimento
  useEffect(() => {
    if (!principal) {
      pararAlarme();
      return undefined;
    }
    if (silenciadoId !== principal.id) iniciarAlarme(principal.tipo === 'ajuda' ? 'urgente' : 'atencao');
    else pararAlarme();
    return () => pararAlarme();
  }, [principal?.id, principal?.tipo, silenciadoId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!principal) return undefined;
    let alterna = false;
    const id = setInterval(() => {
      document.title = alterna ? 'Caminho Seguro' : 'ALERTA: Dona Marta';
      alterna = !alterna;
    }, 900);
    return () => {
      clearInterval(id);
      document.title = 'Caminho Seguro';
    };
  }, [principal?.id]);

  // avisos discretos para eventos que não são urgentes
  useNovosAlertas(alertas, carregado, (a) => {
    if (!precisaAtendimento(a)) mostrar(a.tipo === 'onde' ? `Dona Marta consultou "Onde estou?" (${a.texto})` : a.texto, 'info');
  });

  const confirmar = (alerta) => {
    const atual = alertasRef.current.find((a) => a.id === alerta.id);
    if (!atual || atual.status !== 'aberto') return; // outra pessoa já confirmou
    atualizarAlerta(alerta.id, {
      status: 'confirmado',
      confirmadoPor: { id: eu.id, nome: eu.nome, parentesco: eu.parentesco },
      confirmadoEm: Date.now(),
    });
  };
  const encerrar = (alerta) => atualizarAlerta(alerta.id, { status: 'resolvido', resolvidoEm: Date.now() });

  const testarSom = async () => {
    await liberarSom();
    setSomOk(true);
    if (principal) return;
    iniciarAlarme('urgente');
    setTimeout(() => !alertasRef.current.some((a) => precisaAtendimento(a) && a.status === 'aberto') && pararAlarme(), 2500);
  };

  const podeDesviar = ['andando', 'parada'].includes(dona.modo);
  const abas = [
    { id: 'agora', rotulo: 'Agora', icone: MapPin, marca: pendentes.length },
    { id: 'historico', rotulo: 'Histórico', icone: History },
    { id: 'familia', rotulo: 'Família', icone: Users },
    { id: 'demo', rotulo: 'Demo', icone: FlaskConical },
  ];

  return (
    <div className="familia">
      <BannerDemo />
      <header className="familia__topo">
        <div>
          <h1>Caminho Seguro</h1>
          <small>Família · sessão {formatarCodigo(codigo)}</small>
        </div>
        <SeloConexao conexao={conexao} modo={modo} />
      </header>

      {!somOk && (
        <button type="button" className="faixa faixa--atencao faixa--botao" onClick={() => testarSom()}>
          <BellOff aria-hidden="true" /> Som desligado neste celular. Toque aqui para ativar os alertas sonoros.
        </button>
      )}
      <ListaAvisos avisos={avisos} />

      <main className="familia__conteudo">
        {aba === 'agora' && (
          <AbaAgora dona={dona} trilha={trilha} pendentes={pendentes} confirmados={confirmados} agora={agora} aoConfirmar={confirmar} aoEncerrar={encerrar} />
        )}
        {aba === 'historico' && <AbaHistorico alertas={alertas} agora={agora} />}
        {aba === 'familia' && <AbaFamilia membros={membros} euId={eu.id} codigo={codigo} />}
        {aba === 'demo' && (
          <AbaDemo
            dona={dona}
            podeDesviar={podeDesviar}
            aoReiniciar={reiniciar}
            aoDesviar={() => enviarComando('desvio', eu.nome)}
            aoTestarSom={testarSom}
            aoSair={aoSair}
          />
        )}
      </main>

      <nav className="abas" aria-label="Seções do painel">
        {abas.map(({ id, rotulo, icone: Icone, marca }) => (
          <button key={id} type="button" className={`aba ${aba === id ? 'aba--ativa' : ''}`} onClick={() => setAba(id)} aria-current={aba === id ? 'page' : undefined}>
            <Icone aria-hidden="true" />
            <span>{rotulo}</span>
            {marca > 0 && <b className="aba__marca">{marca}</b>}
          </button>
        ))}
      </nav>

      {principal && dispensadoId !== principal.id && (
        <AlertaTelaCheia
          alerta={principal}
          silenciado={silenciadoId === principal.id}
          aoConfirmar={confirmar}
          aoSilenciar={() => setSilenciadoId(principal.id)}
          aoVerPainel={() => {
            setDispensadoId(principal.id);
            setAba('agora');
          }}
        />
      )}
    </div>
  );
}
