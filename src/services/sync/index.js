import { criarClienteFirebase, firebaseConfigurado } from './firebase';
import { criarClienteLocal } from './local';

export const modoSincronizacao = firebaseConfigurado() ? 'firebase' : 'local';

export function criarCliente(codigo) {
  return modoSincronizacao === 'firebase' ? criarClienteFirebase(codigo) : criarClienteLocal(codigo);
}
