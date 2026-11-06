import { BellRing, CheckCircle2, TriangleAlert, VolumeX } from 'lucide-react';
import Botao from '../../components/ui/Botao';
import { hora } from '../../utils/tempo';

// Tela de alerta que ocupa o celular inteiro até alguém confirmar o atendimento
export default function AlertaTelaCheia({ alerta, silenciado, aoConfirmar, aoSilenciar, aoVerPainel }) {
  const urgente = alerta.tipo === 'ajuda';
  const Icone = urgente ? BellRing : TriangleAlert;
  return (
    <div className={`alerta-cheio ${urgente ? 'alerta-cheio--urgente' : 'alerta-cheio--atencao'}`} role="alertdialog" aria-modal="true" aria-label="Alerta da Dona Marta">
      <span className="alerta-cheio__simulacao">SIMULAÇÃO</span>
      <Icone className="alerta-cheio__icone" aria-hidden="true" />
      <h1>{urgente ? 'Dona Marta pediu ajuda' : 'Dona Marta saiu do caminho'}</h1>
      <p className="alerta-cheio__local">{alerta.texto}</p>
      <p className="alerta-cheio__hora">Às {hora(alerta.criado)}</p>
      <div className="alerta-cheio__acoes">
        <Botao tamanho="grande" variante="claro" icone={CheckCircle2} onClick={() => aoConfirmar(alerta)}>
          Confirmar atendimento
        </Botao>
        <Botao variante="contorno-claro" icone={VolumeX} onClick={aoSilenciar} disabled={silenciado}>
          {silenciado ? 'Som silenciado' : 'Silenciar som'}
        </Botao>
        <Botao variante="contorno-claro" onClick={aoVerPainel}>Ver no painel</Botao>
      </div>
    </div>
  );
}
