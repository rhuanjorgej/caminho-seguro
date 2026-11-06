import { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { useSessao } from '../../hooks/useSessao';
import { useAgora, usePreferencia, useWakeLock } from '../../hooks/utilitarios';
import { BannerDemo, SeloConexao } from '../../components/ui/Pecas';
import Carregando from '../../components/ui/Carregando';
import Modal from '../../components/ui/Modal';
import Botao from '../../components/ui/Botao';
import { MENSAGEM_CONFIRMADO, Pareamento, TelaAjuda, TelaCaminhada, TelaFamilia, TelaInicio, TelaOnde } from './Telas';
import PainelApresentador from './PainelApresentador';
import { comPosicao, descreverLocal, donaInicial, indiceDoTrecho, iniciarDesvio, passo, trechoAtual } from '../../config/simulacao';
import { calarVoz, falar, interpretarComando } from '../../services/voz';
import { listarAlertas, listarMembros } from '../../utils/sessao';
import { saudacao, dataExtenso, hora } from '../../utils/tempo';
import { ler, gravar } from '../../utils/armazenamento';

const DONA_PADRAO = donaInicial();
const EM_MOVIMENTO = ['andando', 'desviando', 'voltando'];

export default function Tablet({ codigo, aoSair }) {
  const sessao = useSessao(codigo);
  const { estado, carregado, existe, conexao, modo, demorando, atualizar, criarSessao, criarAlerta, atualizarAlerta, reiniciar } = sessao;
  const agora = useAgora(1000);
  useWakeLock();

  const [tela, setTela] = useState(() => (ler('tablet-iniciado') === codigo ? 'inicio' : 'pareamento'));
  const [painelAberto, setPainelAberto] = useState(false);
  const [contagem, setContagem] = useState(null);
  const [ligacao, setLigacao] = useState(null);
  const [vozAtiva, setVozAtiva] = usePreferencia('voz', true);

  const dona = estado.dona || DONA_PADRAO;
  const donaRef = useRef(dona);
  donaRef.current = dona;

  const alertas = useMemo(() => listarAlertas(estado.alertas), [estado.alertas]);
  const ativo = (tipo) => [...alertas].reverse().find((a) => a.tipo === tipo && (a.status === 'aberto' || a.status === 'confirmado'));
  const alertaAjuda = ativo('ajuda');
  const alertaDesvio = ativo('desvio');
  const alertaAjudaRef = useRef(alertaAjuda);
  alertaAjudaRef.current = alertaAjuda;
  const membros = useMemo(() => listarMembros(estado.membros, agora), [estado.membros, agora]);
  const conectados = membros.filter((m) => m.online);

  const falarSe = (texto) => {
    if (vozAtiva) falar(texto);
  };
  const falarRef = useRef(falarSe);
  falarRef.current = falarSe;

  // Cria a sessão se ela ainda não existir (primeira vez ou dados apagados)
  useEffect(() => {
    if (carregado && !existe) criarSessao();
  }, [carregado, existe]); // eslint-disable-line react-hooks/exhaustive-deps

  // Anda um passo por segundo (só o tablet faz a simulação)
  useEffect(() => {
    if (!EM_MOVIMENTO.includes(dona.modo)) return undefined;
    const id = setInterval(() => {
      const antes = donaRef.current;
      const depois = passo(antes);
      atualizar({ dona: depois });
      if (depois.modo === 'chegou' && antes.modo !== 'chegou') {
        criarAlerta({ tipo: 'chegada', status: 'info', texto: 'Dona Marta chegou na padaria (simulado)', x: depois.x, y: depois.y });
        falarRef.current('Você chegou na padaria.');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [dona.modo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instrução falada a cada novo trecho e quando sai do caminho
  const ultimoTrecho = useRef(-1);
  useEffect(() => {
    if (dona.modo !== 'andando') {
      ultimoTrecho.current = -1;
      return;
    }
    const i = indiceDoTrecho(dona.d || 0);
    if (i !== ultimoTrecho.current) {
      ultimoTrecho.current = i;
      falarRef.current(trechoAtual(dona.d || 0).agora);
    }
  }, [dona.modo, dona.d]);
  useEffect(() => {
    if (dona.modo === 'perdida') falarRef.current('Vamos parar um instante. Respire fundo. Toque em voltar ao caminho.');
  }, [dona.modo]);

  // Se sair do caminho enquanto está em outra tela, leva de volta ao guia
  useEffect(() => {
    if ((dona.modo === 'desviando' || dona.modo === 'perdida') && ['inicio', 'onde', 'familia'].includes(tela)) setTela('caminhada');
  }, [dona.modo, tela]);

  // Quando a família confirma, o tablet fala a mensagem
  const faladoRef = useRef('');
  useEffect(() => {
    const chave = alertaAjuda ? `${alertaAjuda.id}:${alertaAjuda.status}` : '';
    if (alertaAjuda?.status === 'confirmado' && faladoRef.current !== chave) falarRef.current(MENSAGEM_CONFIRMADO);
    faladoRef.current = chave;
  }, [alertaAjuda?.id, alertaAjuda?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reinício da demonstração (feito aqui ou em outro aparelho)
  const reinicioRef = useRef(null);
  useEffect(() => {
    if (!estado.reinicio) return;
    if (reinicioRef.current !== null && reinicioRef.current !== estado.reinicio) {
      setTela('inicio');
      setContagem(null);
      setLigacao(null);
      calarVoz();
    }
    reinicioRef.current = estado.reinicio;
  }, [estado.reinicio]);

  // Comandos enviados por outro aparelho (ex.: "Simular desvio" pelo celular)
  const comandoRef = useRef(undefined);
  useEffect(() => {
    if (!carregado) return;
    const em = estado.comando?.em || 0;
    if (comandoRef.current === undefined) {
      comandoRef.current = em;
      return;
    }
    if (em && em !== comandoRef.current) {
      comandoRef.current = em;
      if (estado.comando.tipo === 'desvio') simularDesvio();
    }
  }, [carregado, estado.comando?.em]); // eslint-disable-line react-hooks/exhaustive-deps

  // Contagem regressiva de segurança para ajuda pedida por voz
  useEffect(() => {
    if (contagem === null) return undefined;
    if (contagem <= 0) {
      setContagem(null);
      pedirAjuda();
      return undefined;
    }
    const t = setTimeout(() => setContagem((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [contagem]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- ações ---------- */
  const texto = () => descreverLocal(donaRef.current);

  const iniciarCaminhada = () => {
    const d = donaRef.current;
    let novo;
    if (d.modo === 'casa' || d.modo === 'chegou') {
      novo = comPosicao({ ...donaInicial(), modo: 'andando' });
      criarAlerta({ tipo: 'saida', status: 'info', texto: 'Dona Marta saiu de casa para a padaria (simulado)', x: novo.x, y: novo.y });
    } else if ((d.desvio || 0) > 0) {
      novo = { ...d, modo: 'voltando' };
    } else {
      novo = { ...d, modo: 'andando' };
    }
    atualizar({ dona: novo });
    setTela('caminhada');
  };

  const parar = () => {
    const d = donaRef.current;
    atualizar({ 'dona/modo': (d.desvio || 0) > 0 ? 'perdida' : 'parada' });
  };
  const continuar = () => atualizar({ 'dona/modo': 'andando' });
  const voltarAoCaminho = () => atualizar({ 'dona/modo': 'voltando' });
  const terminarPasseio = () => {
    atualizar({ dona: donaInicial() });
    setTela('inicio');
  };

  function simularDesvio() {
    const d = donaRef.current;
    if (!['andando', 'parada'].includes(d.modo)) return;
    const novo = iniciarDesvio(d);
    atualizar({ dona: novo });
    criarAlerta({ tipo: 'desvio', status: 'aberto', nivel: 'atencao', texto: `Saiu do caminho perto de ${descreverLocal(novo).curto} (simulado)`, x: novo.x, y: novo.y });
  }

  function pedirAjuda() {
    if (alertaAjudaRef.current) return;
    const d = donaRef.current;
    criarAlerta({ tipo: 'ajuda', status: 'aberto', nivel: 'urgente', texto: descreverLocal(d).curto, x: d.x, y: d.y });
    falarRef.current('Pedido enviado. Estamos avisando a sua família.');
  }

  const cancelarAjuda = () => {
    if (alertaAjuda) atualizarAlerta(alertaAjuda.id, { status: 'cancelado', canceladoEm: Date.now() });
    falarSe('Tudo bem. Pedido cancelado.');
  };

  const abrirOnde = () => {
    const { texto: t, curto } = texto();
    criarAlerta({ tipo: 'onde', status: 'info', texto: curto, x: donaRef.current.x, y: donaRef.current.y });
    setTela('onde');
    falarSe(t);
  };

  const abrirFamilia = () => {
    setTela('familia');
    falarSe('Esta é a sua família.');
  };

  const executarComando = (cmd) => {
    if (cmd === 'caminhar') iniciarCaminhada();
    else if (cmd === 'onde') abrirOnde();
    else if (cmd === 'familia') abrirFamilia();
    else if (cmd === 'ajuda') {
      if (!alertaAjudaRef.current) {
        setContagem(5);
        falarSe('Entendi que você precisa de ajuda. Vou avisar sua família em cinco segundos.');
      }
    }
  };

  const comandoPorTexto = (frase) => {
    const cmd = interpretarComando(frase);
    if (cmd) executarComando(cmd);
  };

  const comecar = () => {
    gravar('tablet-iniciado', codigo);
    setTela('inicio');
    falarSe('Olá, Dona Marta.'); // também libera a fala no navegador
  };

  /* ---------- tela ---------- */
  if (!carregado || !existe) {
    return (
      <div className="tablet">
        <BannerDemo />
        <Carregando demorando={demorando} modo={modo} aoSair={aoSair} />
      </div>
    );
  }

  const relogio = new Date(agora);
  const inicial = dona.modo === 'casa' || dona.modo === 'chegou';
  const podeDesviar = ['andando', 'parada'].includes(dona.modo);

  return (
    <div className="tablet">
      <BannerDemo />
      <header className="tablet__topo">
        <div>
          <p className="tablet__saudacao">{saudacao(relogio)}, Dona Marta</p>
          <p className="tablet__data">{dataExtenso(relogio)} · <span className="relogio">{hora(agora, false)}</span></p>
        </div>
        <div className="tablet__ferramentas">
          <SeloConexao conexao={conexao} modo={modo} />
          <span className="selo selo--neutro">Família conectada: {conectados.length}</span>
          <button
            type="button"
            className="botao-icone"
            onClick={() => {
              if (vozAtiva) calarVoz();
              setVozAtiva(!vozAtiva);
            }}
            aria-pressed={vozAtiva}
            aria-label={vozAtiva ? 'Desligar a voz do tablet' : 'Ligar a voz do tablet'}
            title={vozAtiva ? 'Voz ligada' : 'Voz desligada'}
          >
            {vozAtiva ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
          <button type="button" className="botao-icone botao-icone--texto" onClick={() => setPainelAberto(true)} aria-label="Abrir painel da apresentação">
            <Settings aria-hidden="true" />
            <span>Apresentação</span>
          </button>
        </div>
      </header>

      {tela === 'pareamento' && <Pareamento codigo={codigo} membros={membros} aoComecar={comecar} />}
      {tela === 'inicio' && (
        <TelaInicio
          textoCaminhar={inicial ? 'Ir à padaria' : 'Continuar a caminhada'}
          aoCaminhar={iniciarCaminhada}
          aoOnde={abrirOnde}
          aoAjuda={pedirAjuda}
          aoFamilia={abrirFamilia}
          aoComandoVoz={executarComando}
          aoFalar={falarSe}
        />
      )}
      {tela === 'caminhada' && (
        <TelaCaminhada
          dona={dona}
          alertaDesvio={alertaDesvio}
          aoParar={parar}
          aoContinuar={continuar}
          aoVoltarAoCaminho={voltarAoCaminho}
          aoAjuda={pedirAjuda}
          aoInicio={() => setTela('inicio')}
          aoTerminar={terminarPasseio}
        />
      )}
      {tela === 'onde' && <TelaOnde dona={dona} aoVoltar={() => setTela('inicio')} aoAjuda={pedirAjuda} />}
      {tela === 'familia' && <TelaFamilia membros={conectados} aoVoltar={() => setTela('inicio')} aoLigar={setLigacao} />}

      {alertaAjuda && <TelaAjuda alerta={alertaAjuda} totalConectados={conectados.length} aoCancelar={cancelarAjuda} />}

      {contagem !== null && (
        <Modal
          titulo="Avisar a família?"
          rodape={
            <>
              <Botao tamanho="grande" variante="perigo" onClick={() => { setContagem(null); pedirAjuda(); }}>Avisar agora</Botao>
              <Botao tamanho="grande" variante="suave" onClick={() => setContagem(null)}>Cancelar</Botao>
            </>
          }
        >
          <p className="texto-grande">Entendi que você precisa de ajuda. Vou avisar a sua família em {contagem} {contagem === 1 ? 'segundo' : 'segundos'}.</p>
        </Modal>
      )}

      {ligacao && (
        <Modal titulo={`Ligar para ${ligacao.nome}`} aoFechar={() => setLigacao(null)} rodape={<Botao tamanho="grande" onClick={() => setLigacao(null)}>Entendi</Botao>}>
          <p className="texto-grande">Simulação: em um aparelho real, o telefone ligaria agora para {ligacao.nome} ({ligacao.parentesco}).</p>
        </Modal>
      )}

      {painelAberto && (
        <PainelApresentador
          codigo={codigo}
          totalConectados={conectados.length}
          podeDesviar={podeDesviar}
          aoReiniciar={reiniciar}
          aoDesviar={simularDesvio}
          aoComandoTexto={comandoPorTexto}
          aoSair={aoSair}
          aoFechar={() => setPainelAberto(false)}
        />
      )}
    </div>
  );
}
