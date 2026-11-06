// Botão grande da tela da Dona Marta: ícone + título + frase curta
export default function BotaoGrande({ cor = 'primaria', icone: Icone, titulo, subtitulo, ...resto }) {
  return (
    <button type="button" className={`botao-grande botao-grande--${cor}`} {...resto}>
      <Icone aria-hidden="true" className="botao-grande__icone" />
      <span className="botao-grande__texto">
        <strong>{titulo}</strong>
        {subtitulo && <small>{subtitulo}</small>}
      </span>
    </button>
  );
}
