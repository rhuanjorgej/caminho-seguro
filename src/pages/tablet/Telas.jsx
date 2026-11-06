import { ArrowUp, CheckCircle2, Croissant, CornerUpLeft, CornerUpRight, Flag, HandHelping, House, MapPin, Pause, Phone, Play, RotateCcw, TriangleAlert, Users } from 'lucide-react';
import Botao from '../../components/ui/Botao';
import BotaoGrande from '../../components/ui/BotaoGrande';
import { Avatar, CodigoSessao } from '../../components/ui/Pecas';
import MapaSimulado from '../../components/mapa/MapaSimulado';
import BotaoVoz from './BotaoVoz';
import { PADARIA, TOTAL, UNIDADES_POR_MINUTO, descreverLocal, trechoAtual } from '../../config/simulacao';
import { FAMILIARES_FICTICIOS } from '../../utils/sessao';

export const MENSAGEM_CONFIRMADO = 'Sua família foi avisada. Aguarde, alguém está vindo ajudar.';

/* ---------- Pareamento: aparece uma vez, para conectar os celulares ---------- */
export function Pareamento({ codigo, membros, aoComecar }) {
  return (
    <main className="tela tela--pareamento">
      <h1>Demonstração criada</h1>
      <p className="tela__apoio">
        Abra o painel da família nos celulares: aponte a câmera para o QR code ou digite o código em "Painel da família".
      </p>
      <CodigoSessao codigo={codigo} grande />
      <section className="cartao" aria-live="polite">
        <h2>Celulares conectados: {membros.length}</h2>
        {membros.length === 0 ? (
          <p className="texto-suave">Ninguém entrou ainda. Você pode começar mesmo assim e conectar depois.</p>
        ) : (
          <ul className="lista-pessoas">
            {membros.map((m) => (
              <li key={m.id}>
                <Avatar nome={m.nome} />
                <span><strong>{m.nome}</strong> <small>{m.parentesco}</small></span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Botao tamanho="grande" icone={Play} onClick={aoComecar}>Começar: tela da Dona Marta</Botao>
    </main>
  );
}

/* ---------- Início ---------- */
export function TelaInicio({ aoCaminhar, aoOnde, aoAjuda, aoFamilia, aoComandoVoz, aoFalar, textoCaminhar }) {
  return (
    <main className="tela tela--inicio">
      <div className="tablet__grade">
        <BotaoGrande cor="primaria" icone={Croissant} titulo={textoCaminhar} subtitulo="Eu mostro o caminho" onClick={aoCaminhar} />
        <BotaoGrande cor="indigo" icone={MapPin} titulo="Onde estou?" subtitulo="Eu digo onde você está" onClick={aoOnde} />
        <BotaoGrande cor="perigo" icone={HandHelping} titulo="Preciso de ajuda" subtitulo="Aviso a sua família agora" onClick={aoAjuda} />
        <BotaoGrande cor="terracota" icone={Users} titulo="Minha família" subtitulo="Ver quem está por perto" onClick={aoFamilia} />
      </div>
      <BotaoVoz aoComando={aoComandoVoz} aoFalar={aoFalar} />
    </main>
  );
}

/* ---------- Caminhada ---------- */
const SETAS = { frente: ArrowUp, esquerda: CornerUpLeft, direita: CornerUpRight, destino: MapPin };

export function TelaCaminhada({ dona, alertaDesvio, aoParar, aoContinuar, aoVoltarAoCaminho, aoAjuda, aoInicio, aoTerminar }) {
  const modo = dona.modo;
  const trecho = trechoAtual(dona.d || 0);
  const Seta = SETAS[trecho.seta] || ArrowUp;
  const faltam = Math.max(1, Math.ceil((TOTAL - (dona.d || 0)) / UNIDADES_POR_MINUTO));
  const pct = Math.round(((dona.d || 0) / TOTAL) * 100);
  const fora = modo === 'desviando' || modo === 'perdida';
  const confirmado = alertaDesvio?.status === 'confirmado';

  return (
    <main className="tela tela--caminhada">
      {confirmado && (
        <div className="faixa faixa--ok g-faixa" role="status">
          <CheckCircle2 aria-hidden="true" />
          <span>
            <strong>{MENSAGEM_CONFIRMADO}</strong>
            {alertaDesvio.confirmadoPor?.nome && <small> {alertaDesvio.confirmadoPor.nome} ({alertaDesvio.confirmadoPor.parentesco}) confirmou.</small>}
          </span>
        </div>
      )}

      {modo === 'chegou' ? (
        <section className="cartao-guia cartao-guia--ok g-guia" aria-live="polite">
          <Flag aria-hidden="true" />
          <div>
            <h1>Você chegou na {PADARIA.nome}</h1>
            <p>Muito bem. Quando quiser voltar, toque em "Terminar passeio".</p>
          </div>
        </section>
      ) : fora ? (
        <section className="cartao-guia cartao-guia--atencao g-guia" aria-live="assertive">
          <TriangleAlert aria-hidden="true" />
          <div>
            <h1>Vamos parar um instante</h1>
            <p>Parece que saímos do caminho. Respire fundo, está tudo bem. Toque em "Voltar ao caminho".</p>
          </div>
        </section>
      ) : modo === 'voltando' ? (
        <section className="cartao-guia cartao-guia--atencao g-guia" aria-live="polite">
          <RotateCcw aria-hidden="true" />
          <div>
            <h1>Voltando ao caminho</h1>
            <p>Siga junto com o ponto verde no mapa.</p>
          </div>
        </section>
      ) : (
        <section className="cartao-guia g-guia" aria-live="polite">
          <Seta aria-hidden="true" />
          <div>
            <h1>{modo === 'parada' ? 'Você parou' : trecho.agora}</h1>
            <p>{modo === 'parada' ? 'Quando quiser seguir, toque em "Continuar".' : trecho.depois}</p>
          </div>
        </section>
      )}

      {modo !== 'chegou' && (
        <div className="progresso g-prog" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progresso do caminho">
          <div className="progresso__barra" style={{ width: `${pct}%` }} />
          <span>Faltam cerca de {faltam} {faltam === 1 ? 'minuto' : 'minutos'}</span>
        </div>
      )}

      <div className="g-mapa">
        <MapaSimulado dona={dona} descricao={`Mapa fictício. ${descreverLocal(dona).texto}`} />
      </div>

      <div className="rodape-acoes g-acoes">
        <Botao variante="suave" tamanho="grande" icone={House} onClick={aoInicio}>Início</Botao>
        {modo === 'chegou' ? (
          <Botao tamanho="grande" icone={Flag} onClick={aoTerminar}>Terminar passeio</Botao>
        ) : fora ? (
          <Botao tamanho="grande" icone={RotateCcw} onClick={aoVoltarAoCaminho}>Voltar ao caminho</Botao>
        ) : modo === 'parada' ? (
          <Botao tamanho="grande" icone={Play} onClick={aoContinuar}>Continuar</Botao>
        ) : (
          <Botao variante="suave" tamanho="grande" icone={Pause} onClick={aoParar}>Parar</Botao>
        )}
        <Botao variante="perigo" tamanho="grande" icone={HandHelping} onClick={aoAjuda}>Preciso de ajuda</Botao>
      </div>
    </main>
  );
}

/* ---------- Onde estou? ---------- */
export function TelaOnde({ dona, aoVoltar, aoAjuda }) {
  const { texto } = descreverLocal(dona);
  return (
    <main className="tela tela--onde">
      <section className="cartao-guia cartao-guia--indigo g-guia" aria-live="polite">
        <MapPin aria-hidden="true" />
        <div>
          <h1>Onde estou?</h1>
          <p className="texto-grande">{texto}</p>
        </div>
      </section>
      <div className="g-mapa">
        <MapaSimulado dona={dona} descricao={`Mapa fictício. ${texto}`} />
      </div>
      <div className="rodape-acoes g-acoes">
        <Botao variante="suave" tamanho="grande" icone={House} onClick={aoVoltar}>Voltar</Botao>
        <Botao variante="perigo" tamanho="grande" icone={HandHelping} onClick={aoAjuda}>Preciso de ajuda</Botao>
      </div>
    </main>
  );
}

/* ---------- Minha família ---------- */
export function TelaFamilia({ membros, aoVoltar, aoLigar }) {
  const exemplo = membros.length === 0;
  const lista = exemplo ? FAMILIARES_FICTICIOS.map((f, i) => ({ id: `ex${i}`, ...f })) : membros;
  return (
    <main className="tela tela--familia">
      <h1 className="tela__titulo">Minha família</h1>
      {exemplo && (
        <p className="faixa faixa--info" role="note">
          Ninguém da família está conectado agora. Estes são contatos de exemplo (fictícios).
        </p>
      )}
      <ul className="cartoes-familia">
        {lista.map((m) => (
          <li key={m.id} className="cartao cartao--familia">
            <Avatar nome={m.nome} tamanho={72} />
            <div className="cartao--familia__nome">
              <strong>{m.nome}</strong>
              <span>{m.parentesco}</span>
              {!exemplo && <small>{m.online ? 'Conectado agora' : 'Fora do ar'}</small>}
            </div>
            <Botao tamanho="grande" icone={Phone} onClick={() => aoLigar(m)}>Ligar</Botao>
          </li>
        ))}
      </ul>
      <div className="rodape-acoes">
        <Botao variante="suave" tamanho="grande" icone={House} onClick={aoVoltar}>Voltar</Botao>
      </div>
    </main>
  );
}

/* ---------- Pedido de ajuda (tela cheia) ---------- */
export function TelaAjuda({ alerta, totalConectados, aoCancelar }) {
  const confirmado = alerta.status === 'confirmado';
  return (
    <div className={`ajuda-cheia ${confirmado ? 'ajuda-cheia--ok' : ''}`} role="alert" aria-live="assertive">
      <div className="ajuda-cheia__conteudo">
        {confirmado ? <CheckCircle2 className="ajuda-cheia__icone" aria-hidden="true" /> : <HandHelping className="ajuda-cheia__icone ajuda-cheia__icone--pulsa" aria-hidden="true" />}
        {confirmado ? (
          <>
            <h1>{MENSAGEM_CONFIRMADO}</h1>
            {alerta.confirmadoPor?.nome && (
              <p className="ajuda-cheia__quem">{alerta.confirmadoPor.nome} ({alerta.confirmadoPor.parentesco}) confirmou o atendimento.</p>
            )}
            <p>Fique onde está, em um lugar seguro.</p>
          </>
        ) : (
          <>
            <h1>Pedido enviado</h1>
            <p className="ajuda-cheia__quem">Estamos avisando a sua família...</p>
            <p>
              {totalConectados > 0
                ? `${totalConectados} ${totalConectados === 1 ? 'pessoa da família está conectada' : 'pessoas da família estão conectadas'}. Fique onde está.`
                : 'Nenhum celular da família está conectado na demonstração agora.'}
            </p>
          </>
        )}
        <Botao variante="claro" tamanho="grande" onClick={aoCancelar}>Estou bem. Cancelar pedido</Botao>
      </div>
    </div>
  );
}
