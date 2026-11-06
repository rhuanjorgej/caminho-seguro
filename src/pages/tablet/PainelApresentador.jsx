import { useEffect, useState } from 'react';
import { LogOut, Mic, RotateCcw, Route } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Botao from '../../components/ui/Botao';
import { CodigoSessao } from '../../components/ui/Pecas';
import { suporteReconhecimento } from '../../services/voz';

// Painel de quem apresenta a demonstração (fica atrás do botão "Apresentação")
export default function PainelApresentador({ codigo, totalConectados, podeDesviar, aoReiniciar, aoDesviar, aoComandoTexto, aoSair, aoFechar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    if (!confirmando) return undefined;
    const t = setTimeout(() => setConfirmando(false), 4000);
    return () => clearTimeout(t);
  }, [confirmando]);

  const reiniciar = () => {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    setConfirmando(false);
    aoReiniciar();
    aoFechar();
  };

  const enviarTexto = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    aoComandoTexto(texto);
    setTexto('');
    aoFechar();
  };

  return (
    <Modal titulo="Painel da apresentação" aoFechar={aoFechar}>
      <p className="texto-suave">Estes controles são para quem apresenta. Tudo na demonstração é simulado.</p>
      <CodigoSessao codigo={codigo} />
      <p><strong>Celulares conectados:</strong> {totalConectados}</p>

      <div className="lista-acoes">
        <Botao variante={confirmando ? 'perigo' : 'suave'} icone={RotateCcw} onClick={reiniciar}>
          {confirmando ? 'Toque de novo para confirmar' : 'Reiniciar demonstração'}
        </Botao>
        <Botao variante="suave" icone={Route} onClick={() => { aoDesviar(); aoFechar(); }} disabled={!podeDesviar}>
          Simular saída do caminho
        </Botao>
        {!podeDesviar && <small className="texto-suave">Disponível enquanto a Dona Marta estiver caminhando.</small>}
      </div>

      <form className="campo-comando" onSubmit={enviarTexto}>
        <label htmlFor="comando-texto">
          <Mic aria-hidden="true" /> Simular comando de voz (por texto)
        </label>
        <div className="campo-comando__linha">
          <input id="comando-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder='Ex.: "ir à padaria"' />
          <Botao type="submit" variante="suave">Enviar</Botao>
        </div>
        <small className="texto-suave">
          {suporteReconhecimento() ? 'Útil se o microfone da sala não funcionar.' : 'Este navegador não reconhece voz, então use este campo.'}
        </small>
      </form>

      <Botao variante="fantasma" icone={LogOut} onClick={aoSair}>Encerrar e sair</Botao>
    </Modal>
  );
}
