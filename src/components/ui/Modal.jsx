import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ titulo, aoFechar, children, rodape }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar?.();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  return (
    <div className="modal__fundo" onClick={aoFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__topo">
          <h2>{titulo}</h2>
          {aoFechar && (
            <button type="button" className="modal__fechar" onClick={aoFechar} aria-label="Fechar">
              <X aria-hidden="true" />
            </button>
          )}
        </header>
        <div className="modal__corpo">{children}</div>
        {rodape && <footer className="modal__rodape">{rodape}</footer>}
      </div>
    </div>
  );
}
