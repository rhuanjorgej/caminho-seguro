const P = 'caminho-seguro:';

export function ler(chave, padrao = null) {
  try {
    const bruto = localStorage.getItem(P + chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch {
    return padrao;
  }
}
export function gravar(chave, valor) {
  try {
    localStorage.setItem(P + chave, JSON.stringify(valor));
  } catch {
    /* ignorar */
  }
}
export function remover(chave) {
  try {
    localStorage.removeItem(P + chave);
  } catch {
    /* ignorar */
  }
}

export function idDoAparelho() {
  let id = ler('aparelho');
  if (!id) {
    id = `ap${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    gravar('aparelho', id);
  }
  return id;
}
