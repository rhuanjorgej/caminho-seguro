import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { interpretarComando, ouvir, suporteReconhecimento } from '../../services/voz';

// Botão "Falar um comando". Entende: ir à padaria, onde estou, preciso de ajuda, minha família.
export default function BotaoVoz({ aoComando, aoFalar }) {
  const [ouvindo, setOuvindo] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const parar = useRef(null);
  const suporte = suporteReconhecimento();

  useEffect(() => () => parar.current?.(), []);

  const iniciar = () => {
    if (ouvindo) {
      parar.current?.();
      return;
    }
    if (!suporte) {
      setMensagem('Este navegador não entende voz. Use os botões grandes.');
      return;
    }
    setMensagem('');
    setOuvindo(true);
    parar.current = ouvir({
      aoResultado: (frases) => {
        const comando = interpretarComando(frases);
        if (comando) {
          setMensagem(`Entendi: "${frases[0]}"`);
          aoComando(comando);
        } else {
          const t = 'Não entendi. Tente dizer: ir à padaria.';
          setMensagem(t);
          aoFalar?.(t);
        }
      },
      aoFim: () => setOuvindo(false),
      aoErro: (erro) => {
        if (erro === 'not-allowed' || erro === 'service-not-allowed') setMensagem('Permita o microfone no navegador para usar a voz.');
        else if (erro === 'no-speech') setMensagem('Não ouvi nada. Toque e tente de novo.');
        else if (erro !== 'aborted') setMensagem('Não consegui ouvir agora. Use os botões grandes.');
      },
    });
  };

  return (
    <section className="voz" aria-label="Comando por voz">
      <button type="button" className={`voz__botao ${ouvindo ? 'voz__botao--ouvindo' : ''}`} onClick={iniciar} aria-pressed={ouvindo}>
        {suporte ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
        <span>{ouvindo ? 'Estou ouvindo...' : 'Falar um comando'}</span>
      </button>
      <p className="voz__dica" aria-live="polite">
        {mensagem || 'Você pode dizer: "Ir à padaria", "Onde estou?", "Preciso de ajuda" ou "Minha família".'}
      </p>
    </section>
  );
}
