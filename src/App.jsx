import { useState } from 'react';
import Inicio from './pages/Inicio';
import Tablet from './pages/tablet/Tablet';
import Familia from './pages/familia/Familia';
import { modoSincronizacao } from './services/sync';
import { gerarCodigo, normalizarCodigo, codigoValido } from './services/sync/estado';
import { gravar, ler, remover } from './utils/armazenamento';

function rotaInicial() {
  const convite = normalizarCodigo(new URLSearchParams(window.location.search).get('sessao') || '');
  if (codigoValido(convite)) return { papel: 'familia', codigo: convite };
  return { papel: null, codigo: null };
}

export default function App() {
  const [rota, setRota] = useState(rotaInicial);
  const ultima = ler('ultima');

  const irParaInicio = () => {
    remover('ultima');
    remover('membro');
    remover('tablet-iniciado');
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setRota({ papel: null, codigo: null });
  };

  const iniciarTablet = () => {
    const codigo = gerarCodigo();
    gravar('ultima', { papel: 'tablet', codigo });
    setRota({ papel: 'tablet', codigo });
  };

  if (rota.papel === 'tablet') return <Tablet key={rota.codigo} codigo={rota.codigo} aoSair={irParaInicio} />;
  if (rota.papel === 'familia') return <Familia key={rota.codigo || 'novo'} codigoInicial={rota.codigo} aoSair={irParaInicio} />;

  return (
    <Inicio
      modo={modoSincronizacao}
      ultima={ultima}
      aoTablet={iniciarTablet}
      aoFamilia={() => setRota({ papel: 'familia', codigo: null })}
      aoContinuar={() => setRota({ papel: ultima.papel, codigo: ultima.codigo })}
    />
  );
}
