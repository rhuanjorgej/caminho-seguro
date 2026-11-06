import { useState } from 'react';
import { ArrowLeft, LogIn, Search } from 'lucide-react';
import Botao from '../../components/ui/Botao';
import { Avatar } from '../../components/ui/Pecas';
import { codigoValido, formatarCodigo, normalizarCodigo } from '../../services/sync/estado';
import { FAMILIARES_FICTICIOS, PARENTESCOS } from '../../utils/sessao';

// Passo 1: digitar o código mostrado no tablet
export function EntrarCodigo({ aoContinuar, aoVoltar }) {
  const [valor, setValor] = useState('');
  const codigo = normalizarCodigo(valor);
  const enviar = (e) => {
    e.preventDefault();
    if (codigoValido(codigo)) aoContinuar(codigo);
  };
  return (
    <main className="entrar">
      <button type="button" className="voltar" onClick={aoVoltar}><ArrowLeft aria-hidden="true" /> Voltar</button>
      <h1>Painel da família</h1>
      <p className="texto-suave">Digite o código que aparece no tablet da Dona Marta, ou aponte a câmera para o QR code dele.</p>
      <form onSubmit={enviar} className="formulario">
        <label htmlFor="codigo">Código da demonstração</label>
        <input
          id="codigo"
          className="campo campo--codigo"
          value={formatarCodigo(codigo)}
          onChange={(e) => setValor(e.target.value)}
          placeholder="ABC-123"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoFocus
        />
        <Botao type="submit" tamanho="grande" icone={Search} disabled={!codigoValido(codigo)}>Procurar demonstração</Botao>
      </form>
    </main>
  );
}

// Passo 2: dizer quem é (nomes de exemplo para a apresentação)
export function EntrarFamilia({ codigo, aoEntrar, aoTrocarCodigo }) {
  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('Filha');
  const pronto = nome.trim().length >= 2;

  const enviar = (e) => {
    e.preventDefault();
    if (pronto) aoEntrar({ nome: nome.trim(), parentesco });
  };

  return (
    <main className="entrar">
      <button type="button" className="voltar" onClick={aoTrocarCodigo}><ArrowLeft aria-hidden="true" /> Trocar código</button>
      <h1>Quem é você?</h1>
      <p className="texto-suave">Demonstração {formatarCodigo(codigo)}. Seu nome aparece para a Dona Marta e para os outros familiares.</p>

      <div className="atalhos" role="group" aria-label="Nomes fictícios de exemplo">
        <span className="texto-suave">Nomes fictícios para a apresentação:</span>
        <div className="atalhos__lista">
          {FAMILIARES_FICTICIOS.map((f) => (
            <button
              key={f.nome}
              type="button"
              className={`atalho ${nome === f.nome ? 'atalho--ativo' : ''}`}
              onClick={() => {
                setNome(f.nome);
                setParentesco(f.parentesco);
              }}
            >
              <Avatar nome={f.nome} tamanho={32} />
              {f.nome} ({f.parentesco})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={enviar} className="formulario">
        <label htmlFor="nome">Seu nome</label>
        <input id="nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Helena" autoComplete="off" maxLength={24} />
        <label htmlFor="parentesco">Quem você é para a Dona Marta</label>
        <select id="parentesco" className="campo" value={parentesco} onChange={(e) => setParentesco(e.target.value)}>
          {PARENTESCOS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <Botao type="submit" tamanho="grande" icone={LogIn} disabled={!pronto}>Entrar no painel</Botao>
        <small className="texto-suave">Ao entrar, este aparelho será liberado para tocar o som dos alertas.</small>
      </form>
    </main>
  );
}
