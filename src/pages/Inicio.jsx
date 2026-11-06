import { Info, Play, Route, ShieldCheck, Smartphone, Tablet as IconeTablet, UsersRound } from 'lucide-react';
import { BannerDemo } from '../components/ui/Pecas';
import Botao from '../components/ui/Botao';
import { formatarCodigo } from '../services/sync/estado';

export function Logo({ tamanho = 56 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true" className="logo">
      <rect width="64" height="64" rx="14" fill="#1D5C63" />
      <path d="M32 9 50 16v13c0 11-7.5 20-18 25C21.5 49 14 40 14 29V16z" fill="#FBF7F0" />
      <path d="M22 41c6-2 6-8 10-9s7 1 10-5" fill="none" stroke="#1D5C63" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="26" r="3.5" fill="#B4532A" />
    </svg>
  );
}

export default function Inicio({ modo, ultima, aoTablet, aoFamilia, aoContinuar }) {
  return (
    <>
      <BannerDemo />
      <main className="inicio">
        <header className="inicio__topo">
          <Logo />
          <div>
            <h1>Caminho Seguro</h1>
            <p>Um caminho conhecido, com a família por perto.</p>
          </div>
        </header>

        {ultima && (
          <section className="cartao cartao--continuar">
            <div>
              <strong>Demonstração {formatarCodigo(ultima.codigo)} em andamento</strong>
              <p className="texto-suave">Neste aparelho você estava como {ultima.papel === 'tablet' ? 'tablet da Dona Marta' : 'painel da família'}.</p>
            </div>
            <Botao icone={Play} onClick={aoContinuar}>Continuar</Botao>
          </section>
        )}

        <div className="inicio__escolhas">
          <article className="escolha">
            <IconeTablet aria-hidden="true" />
            <h2>Tablet da Dona Marta</h2>
            <p>Abra no tablet. Cria uma nova demonstração e mostra o código e o QR code para conectar os celulares.</p>
            <Botao tamanho="grande" icone={Route} onClick={aoTablet}>Iniciar demonstração</Botao>
          </article>
          <article className="escolha">
            <Smartphone aria-hidden="true" />
            <h2>Painel da família</h2>
            <p>Abra no celular. Digite o código do tablet para ver a localização simulada e receber os alertas.</p>
            <Botao tamanho="grande" variante="suave" icone={UsersRound} onClick={aoFamilia}>Entrar com código</Botao>
          </article>
        </div>

        <section className="cartao cartao--nota">
          <h2><ShieldCheck aria-hidden="true" /> Sobre esta demonstração</h2>
          <ul className="lista-simples">
            <li>Dona Marta, a família, o bairro e a padaria são fictícios.</li>
            <li>A localização é simulada. Não usa GPS nem rastreia ninguém.</li>
            <li>Os pedidos de ajuda e as confirmações são reais entre os aparelhos conectados à mesma demonstração.</li>
          </ul>
          {modo === 'local' && (
            <p className="faixa faixa--atencao">
              <Info aria-hidden="true" /> Firebase ainda não configurado: a sincronização funciona só entre abas deste mesmo navegador. Para tablet e celulares diferentes, siga o passo a passo do README.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
