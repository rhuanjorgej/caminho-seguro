import { BellRing, CheckCircle2, Flag, FlaskConical, Footprints, MapPin, TriangleAlert, RotateCcw, Route, Volume2, LogOut, Clock } from 'lucide-react';
import { useState } from 'react';
import Botao from '../../components/ui/Botao';
import { Avatar, CodigoSessao, Selo } from '../../components/ui/Pecas';
import MapaSimulado from '../../components/mapa/MapaSimulado';
import { STATUS_DONA, descreverLocal } from '../../config/simulacao';
import { TITULOS, precisaAtendimento } from '../../utils/sessao';
import { haQuanto, hora } from '../../utils/tempo';

const ICONES = { ajuda: BellRing, desvio: TriangleAlert, onde: MapPin, saida: Footprints, chegada: Flag };

/* ---------- Cartão de um alerta que precisa de atendimento ---------- */
function CartaoAlerta({ alerta, agora, aoConfirmar, aoEncerrar }) {
  const Icone = ICONES[alerta.tipo] || BellRing;
  const urgente = alerta.tipo === 'ajuda';
  const aberto = alerta.status === 'aberto';
  return (
    <article className={`cartao-alerta ${urgente ? 'cartao-alerta--urgente' : 'cartao-alerta--atencao'} ${aberto ? '' : 'cartao-alerta--ok'}`}>
      <header>
        <Icone aria-hidden="true" />
        <div>
          <h2>{TITULOS[alerta.tipo]}</h2>
          <small>{hora(alerta.criado)} · {haQuanto(alerta.criado, agora)}</small>
        </div>
      </header>
      <p>{alerta.texto}</p>
      {aberto ? (
        <Botao tamanho="grande" icone={CheckCircle2} onClick={() => aoConfirmar(alerta)}>Confirmar atendimento</Botao>
      ) : (
        <>
          <p className="cartao-alerta__quem">
            <CheckCircle2 aria-hidden="true" /> Atendimento confirmado por <strong>{alerta.confirmadoPor?.nome}</strong> às {hora(alerta.confirmadoEm)}
          </p>
          <Botao variante="suave" onClick={() => aoEncerrar(alerta)}>Encerrar ocorrência</Botao>
        </>
      )}
    </article>
  );
}

/* ---------- Aba "Agora" ---------- */
export function AbaAgora({ dona, trilha, pendentes, confirmados, agora, aoConfirmar, aoEncerrar }) {
  const status = STATUS_DONA[dona.modo] || STATUS_DONA.casa;
  const { curto } = descreverLocal(dona);
  return (
    <div className="agora">
      {[...pendentes, ...confirmados].map((a) => (
        <CartaoAlerta key={a.id} alerta={a} agora={agora} aoConfirmar={aoConfirmar} aoEncerrar={aoEncerrar} />
      ))}
      <section className="cartao status-dona">
        <Avatar nome="Marta" tamanho={56} />
        <div>
          <h2>Dona Marta</h2>
          <Selo tom={status.tom}>{status.texto}</Selo>
          <p className="texto-suave">Local simulado: {curto}</p>
          {dona.atualizado && <small className="texto-suave">Atualizado {haQuanto(dona.atualizado, agora)}</small>}
        </div>
      </section>
      <MapaSimulado dona={dona} trilha={trilha} />
    </div>
  );
}

/* ---------- Aba "Histórico" ---------- */
export function AbaHistorico({ alertas, agora }) {
  const lista = [...alertas].reverse();
  if (lista.length === 0) {
    return (
      <section className="vazio">
        <Clock aria-hidden="true" />
        <h2>Nenhum alerta ainda</h2>
        <p className="texto-suave">Quando a Dona Marta pedir ajuda, consultar onde está ou sair do caminho, o registro aparece aqui.</p>
      </section>
    );
  }
  const situacao = (a) => {
    if (a.status === 'aberto') return <Selo tom="perigo">Aguardando atendimento</Selo>;
    if (a.status === 'confirmado') return <Selo tom="atencao">Confirmado por {a.confirmadoPor?.nome}</Selo>;
    if (a.status === 'resolvido') return <Selo tom="ok">Encerrado{a.confirmadoPor ? ` (${a.confirmadoPor.nome})` : ''}</Selo>;
    if (a.status === 'cancelado') return <Selo tom="neutro">Cancelado pela Dona Marta</Selo>;
    return <Selo tom="neutro">Informativo</Selo>;
  };
  return (
    <ol className="historico">
      {lista.map((a) => {
        const Icone = ICONES[a.tipo] || BellRing;
        return (
          <li key={a.id} className={`historico__item historico__item--${precisaAtendimento(a) ? 'alerta' : 'info'}`}>
            <Icone aria-hidden="true" />
            <div>
              <strong>{TITULOS[a.tipo] || a.tipo}</strong>
              <p>{a.texto}</p>
              <small>{hora(a.criado)} · {haQuanto(a.criado, agora)}</small>
              <div>{situacao(a)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Aba "Família" ---------- */
export function AbaFamilia({ membros, euId, codigo }) {
  return (
    <div className="familia-aba">
      <section className="cartao">
        <h2>Familiares conectados</h2>
        <ul className="lista-pessoas">
          {membros.map((m) => (
            <li key={m.id}>
              <Avatar nome={m.nome} />
              <span>
                <strong>{m.nome}</strong> {m.id === euId && <Selo tom="neutro">você</Selo>}
                <small>{m.parentesco}</small>
              </span>
              <Selo tom={m.online ? 'ok' : 'neutro'}>{m.online ? 'Conectado' : 'Fora do ar'}</Selo>
            </li>
          ))}
        </ul>
      </section>
      <section className="cartao">
        <h2>Convidar outro celular</h2>
        <CodigoSessao codigo={codigo} />
      </section>
    </div>
  );
}

/* ---------- Aba "Demo" ---------- */
export function AbaDemo({ dona, podeDesviar, aoReiniciar, aoDesviar, aoTestarSom, aoSair }) {
  const [confirmando, setConfirmando] = useState(false);
  return (
    <div className="familia-aba">
      <section className="cartao cartao--demo">
        <h2><FlaskConical aria-hidden="true" /> O que é simulado</h2>
        <ul className="lista-simples">
          <li>A Dona Marta, os familiares de exemplo e a Padaria Estrela são fictícios.</li>
          <li>O mapa é desenhado, não é um mapa real.</li>
          <li>A posição é calculada pelo tablet. Nenhum GPS e nenhum rastreamento real são usados.</li>
          <li>O pedido de ajuda, a notificação, o som e a confirmação funcionam de verdade entre os aparelhos conectados.</li>
        </ul>
      </section>
      <section className="cartao">
        <h2>Controles da demonstração</h2>
        <div className="lista-acoes">
          <Botao variante="suave" icone={Route} onClick={aoDesviar} disabled={!podeDesviar}>Simular saída do caminho</Botao>
          {!podeDesviar && <small className="texto-suave">Disponível enquanto a Dona Marta caminha ({STATUS_DONA[dona.modo]?.texto}).</small>}
          <Botao variante="suave" icone={Volume2} onClick={aoTestarSom}>Testar o som deste celular</Botao>
          <Botao
            variante={confirmando ? 'perigo' : 'suave'}
            icone={RotateCcw}
            onClick={() => {
              if (!confirmando) {
                setConfirmando(true);
                setTimeout(() => setConfirmando(false), 4000);
              } else {
                setConfirmando(false);
                aoReiniciar();
              }
            }}
          >
            {confirmando ? 'Toque de novo para confirmar' : 'Reiniciar demonstração'}
          </Botao>
          <Botao variante="fantasma" icone={LogOut} onClick={aoSair}>Sair da demonstração</Botao>
        </div>
      </section>
    </div>
  );
}
