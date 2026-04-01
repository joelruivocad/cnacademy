import { auth, db } from './firebase.js';
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const JOEL_EMAIL = 'joel.ruivo@cadastra.com';

// Busca o perfil do usuario logado direto no Firestore
async function getPerfilByEmail(email) {
  try {
    const snap = await getDocs(collection(db, 'usuarios'));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const user = docs.find(u => u.email === email && u.ativo !== false);
    return user || null;
  } catch (e) {
    console.error('Erro ao buscar perfil:', e);
    return null;
  }
}

onAuthStateChanged(auth, async (user) => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Paginas publicas — nao precisa de login
  if (!user) {
    if (
      page !== 'login.html' &&
      page !== 'index.html' &&
      page !== ''
    ) {
      window.location.href = 'login.html';
    }
    return;
  }

  // Busca o perfil no Firestore
  const perfil = await getPerfilByEmail(user.email);

  // Se nao encontrar no banco — desloga
  if (!perfil) {
    console.warn('Perfil nao encontrado no Firestore para:', user.email);
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  // Define o tipo baseado no email ou no campo tipo do Firestore
  const ehJoel = user.email === JOEL_EMAIL || perfil.tipo === 'joel';
  const redirect = ehJoel ? 'dashboard.html' : 'analista.html';

  // Redireciona se estiver na pagina errada
  if (page === 'login.html') {
    window.location.href = redirect;
    return;
  }

  if (page === 'dashboard.html' && !ehJoel) {
    window.location.href = 'analista.html';
    return;
  }

  if (page === 'analista.html' && ehJoel) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Salva na sessao para uso em outras paginas
  window.currentUser   = user;
  window.currentPerfil = { tipo: ehJoel ? 'joel' : 'analista', redirect };
});

// Logout global
window.doLogout = async () => {
  await signOut(auth);
  window.location.href = 'login.html';
};
