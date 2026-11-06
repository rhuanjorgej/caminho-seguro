import { Loader } from 'lucide-react';
import Botao from './Botao';

export default function Carregando({ demorando, modo, aoSair }) {
  return (
    <main className="carregando" aria-live="polite">
      <Loader className="carregando__icone" aria-hidden="true" />
      <h1>Conectando à demonstração...</h1>
      {demorando && (
        <>
          <p>
            Está demorando mais que o normal. Confira a internet
            {modo === 'firebase' ? ' e a configuração do Firebase (arquivo .env ou variáveis da Vercel).' : '.'}
          </p>
          <Botao variante="suave" onClick={aoSair}>Voltar ao início</Botao>
        </>
      )}
    </main>
  );
}
