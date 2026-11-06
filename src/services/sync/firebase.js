import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, update, push } from 'firebase/database';

const env = import.meta.env;

export const firebaseConfigurado = () =>
  Boolean(env.VITE_FIREBASE_DATABASE_URL && env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);

let banco = null;
function obterBanco() {
  if (!banco) {
    const app =
      getApps()[0] ||
      initializeApp({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: env.VITE_FIREBASE_DATABASE_URL,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        appId: env.VITE_FIREBASE_APP_ID,
      });
    banco = getDatabase(app);
  }
  return banco;
}

// Cliente com a mesma "forma" do cliente local (ver local.js)
export function criarClienteFirebase(codigo) {
  const db = obterBanco();
  const raiz = ref(db, `sessoes/${codigo}`);
  return {
    modo: 'firebase',
    assinar(aoEstado, aoConexao) {
      const parar1 = onValue(
        raiz,
        (snap) => aoEstado(snap.val() || {}),
        () => aoConexao('erro'),
      );
      const parar2 = onValue(ref(db, '.info/connected'), (snap) => aoConexao(snap.val() ? 'online' : 'offline'));
      return () => {
        parar1();
        parar2();
      };
    },
    atualizar(atualizacoes) {
      // JSON remove campos "undefined", que o Firebase não aceita
      return update(raiz, JSON.parse(JSON.stringify(atualizacoes)));
    },
    novaChave() {
      return push(ref(db, `sessoes/${codigo}/alertas`)).key;
    },
  };
}
