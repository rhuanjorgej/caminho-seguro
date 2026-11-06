export default function Botao({ variante = 'primario', tamanho = 'medio', icone: Icone, children, className = '', ...resto }) {
  return (
    <button type="button" className={`botao botao--${variante} botao--${tamanho} ${className}`} {...resto}>
      {Icone && <Icone aria-hidden="true" className="botao__icone" />}
      <span>{children}</span>
    </button>
  );
}
