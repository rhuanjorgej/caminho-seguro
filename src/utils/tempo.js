export const hora = (ts, comSegundos = true) =>
  new Date(ts).toLocaleTimeString('pt-BR', comSegundos ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' });

export function haQuanto(ts, agora = Date.now()) {
  const s = Math.max(0, Math.round((agora - ts) / 1000));
  if (s < 5) return 'agora mesmo';
  if (s < 60) return `há ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  return `há ${Math.floor(m / 60)} h`;
}

export function saudacao(data = new Date()) {
  const h = data.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const dataExtenso = (data = new Date()) =>
  data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
