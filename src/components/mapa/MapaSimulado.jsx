import { useEffect, useRef, useState } from 'react';
import { CASA, GRADE_X, GRADE_Y, LOCAIS, PADARIA, ROTA, VISAO } from '../../config/simulacao';

// Faz o marcador deslizar suavemente entre duas posições recebidas
function usePosicaoSuave(alvo, ms = 900) {
  const [pos, setPos] = useState(alvo);
  const atual = useRef(alvo);
  useEffect(() => {
    const de = { ...atual.current };
    const t0 = performance.now();
    let quadro;
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const p = { x: de.x + (alvo.x - de.x) * k, y: de.y + (alvo.y - de.y) * k };
      atual.current = p;
      setPos(p);
      if (k < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo.x, alvo.y, ms]);
  return pos;
}

const pontos = (lista) => lista.map(([x, y]) => `${x},${y}`).join(' ');

export default function MapaSimulado({ dona, trilha = [], descricao }) {
  const pos = usePosicaoSuave({ x: dona?.x ?? CASA.x, y: dona?.y ?? CASA.y });
  const fora = (dona?.desvio || 0) > 0.5;
  const corMarcador = fora ? '#B45309' : '#1D5C63';

  return (
    <figure className="mapa">
      <span className="mapa__selo">MAPA FICTÍCIO · localização simulada</span>
      <svg
        viewBox={`0 0 ${VISAO.largura} ${VISAO.altura}`}
        role="img"
        aria-label={descricao || 'Mapa fictício do bairro com a posição simulada da Dona Marta'}
        className="mapa__svg"
      >
        <rect width={VISAO.largura} height={VISAO.altura} fill="#EFE6D6" />
        {LOCAIS.map((l) => (
          <rect key={l.id} x={l.x} y={l.y} width="15" height="15" fill={l.cor} />
        ))}

        {/* ruas: contorno e depois o asfalto claro */}
        {[...GRADE_Y.map((y) => ({ h: y })), ...GRADE_X.map((x) => ({ v: x }))].map((r) =>
          r.h !== undefined ? (
            <line key={`h${r.h}`} x1="0" x2={VISAO.largura} y1={r.h} y2={r.h} stroke="#D8CBB5" strokeWidth="4.4" />
          ) : (
            <line key={`v${r.v}`} y1="0" y2={VISAO.altura} x1={r.v} x2={r.v} stroke="#D8CBB5" strokeWidth="4.4" />
          ),
        )}
        {[...GRADE_Y.map((y) => ({ h: y })), ...GRADE_X.map((x) => ({ v: x }))].map((r) =>
          r.h !== undefined ? (
            <line key={`h2${r.h}`} x1="0" x2={VISAO.largura} y1={r.h} y2={r.h} stroke="#FFFFFF" strokeWidth="3.2" />
          ) : (
            <line key={`v2${r.v}`} y1="0" y2={VISAO.altura} x1={r.v} x2={r.v} stroke="#FFFFFF" strokeWidth="3.2" />
          ),
        )}

        {LOCAIS.map((l) => (
          <text key={`t${l.id}`} x={l.x + 7.5} y={l.y + 8.6} textAnchor="middle" className="mapa__local">
            {l.nome}
          </text>
        ))}

        {/* caminho recomendado */}
        <polyline points={pontos(ROTA)} fill="none" stroke="#1D5C63" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {trilha.length > 1 && (
          <polyline points={pontos(trilha)} fill="none" stroke="#C2410C" strokeWidth="1.1" strokeDasharray="2 1.4" strokeLinecap="round" strokeLinejoin="round" />
        )}

        <text x="40" y="68.4" textAnchor="middle" className="mapa__rua">Rua das Flores</text>
        <text x="72.4" y="58" className="mapa__rua">Rua da Praça</text>
        <text x="85" y="38.4" textAnchor="middle" className="mapa__rua">Avenida Central</text>

        {/* casa e padaria */}
        <g>
          <circle cx={CASA.x} cy={CASA.y} r="3" fill="#35507A" stroke="#fff" strokeWidth="1" />
          <text x={CASA.x} y={CASA.y - 4.6} textAnchor="middle" className="mapa__marca">Casa</text>
        </g>
        <g>
          <circle cx={PADARIA.x} cy={PADARIA.y} r="3" fill="#9A4A27" stroke="#fff" strokeWidth="1" />
          <text x={PADARIA.x - 1} y={PADARIA.y - 4.6} textAnchor="middle" className="mapa__marca">Padaria</text>
        </g>

        {/* Dona Marta (posição simulada) */}
        <g transform={`translate(${pos.x} ${pos.y})`}>
          <circle r="4" fill={corMarcador} opacity="0.3">
            <animate attributeName="r" values="4;9" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle r="4.2" fill={corMarcador} stroke="#fff" strokeWidth="1.2" />
          <text y="1.7" textAnchor="middle" className="mapa__inicial">M</text>
        </g>
      </svg>
      <figcaption className="mapa__legenda">
        <span><i className="leg leg--rota" /> Caminho recomendado</span>
        <span><i className="leg leg--trilha" /> Percurso feito</span>
        <span><i className="leg leg--dona" /> Dona Marta (simulada)</span>
      </figcaption>
    </figure>
  );
}
