import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, FlaskConical, Wifi, WifiOff, Loader } from 'lucide-react';
import { formatarCodigo } from '../../services/sync/estado';
import { corDoNome } from '../../utils/sessao';

// Faixa fixa que deixa claro: tudo aqui é simulação
export function BannerDemo() {
  return (
    <div className="banner-demo" role="note">
      <FlaskConical aria-hidden="true" />
      <span>
        <strong>DEMONSTRAÇÃO</strong> · pessoas, mapa e localização são fictícios · nenhum GPS é usado
      </span>
    </div>
  );
}

export function SeloConexao({ conexao, modo }) {
  const online = conexao === 'online';
  const Icone = online ? Wifi : conexao === 'conectando' ? Loader : WifiOff;
  const texto = online
    ? modo === 'firebase'
      ? 'Conectado'
      : 'Modo local'
    : conexao === 'conectando'
      ? 'Conectando...'
      : 'Sem conexão';
  return (
    <span className={`selo-conexao selo-conexao--${online ? (modo === 'local' ? 'local' : 'ok') : 'ruim'}`} title={modo === 'local' ? 'Sincroniza só entre abas deste navegador' : 'Sincronização em tempo real'}>
      <Icone aria-hidden="true" />
      {texto}
    </span>
  );
}

export function Selo({ tom = 'neutro', children }) {
  return <span className={`selo selo--${tom}`}>{children}</span>;
}

export function Avatar({ nome, tamanho = 44 }) {
  return (
    <span className="avatar" style={{ background: corDoNome(nome), width: tamanho, height: tamanho, fontSize: tamanho * 0.45 }} aria-hidden="true">
      {(nome || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function linkDaSessao(codigo) {
  return `${window.location.origin}/?sessao=${codigo}`;
}

export function CodigoSessao({ codigo, comQr = true, grande = false }) {
  const [copiado, setCopiado] = useState(false);
  const link = linkDaSessao(codigo);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement('textarea');
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return (
    <div className={`codigo ${grande ? 'codigo--grande' : ''}`}>
      <div className="codigo__texto">
        <span className="codigo__rotulo">Código da demonstração</span>
        <strong className="codigo__valor" aria-label={`Código ${codigo.split('').join(' ')}`}>
          {formatarCodigo(codigo)}
        </strong>
        <button type="button" className="botao botao--suave botao--pequeno" onClick={copiar}>
          {copiado ? <Check aria-hidden="true" className="botao__icone" /> : <Copy aria-hidden="true" className="botao__icone" />}
          <span>{copiado ? 'Link copiado' : 'Copiar link de acesso'}</span>
        </button>
      </div>
      {comQr && (
        <div className="codigo__qr">
          <QRCodeSVG value={link} size={grande ? 168 : 120} bgColor="#FFFFFF" fgColor="#134247" level="M" marginSize={1} />
          <span>Aponte a câmera do celular</span>
        </div>
      )}
    </div>
  );
}

export function ListaAvisos({ avisos }) {
  return (
    <div className="avisos" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className={`aviso aviso--${a.tom}`}>
          {a.texto}
        </div>
      ))}
    </div>
  );
}
