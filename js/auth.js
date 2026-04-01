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

async function getPerfilByEmail(email) {
  try {
    const snap = await getDocs(collection(db, 'usuarios'));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Debug — mostra todos os usuarios encontrados no Firestore
    console.log('Usuarios no Firestore:', docs.map(u => ({
      email: u.email,
      tipo:  u.tipo,
      ativo: u.ativo
    })));
    console.log('Buscando por email:', email);

    const found = docs.find(u =>
      u.email === email &&
      u.ativo !== false &&
      u.ativo !== 'false'
    );

    console.log('Perfil encontrado:', found || 'NENHUM');
    return found || null;

  } catch (e) {
    console.error('Erro ao buscar perfil no Firestore:', e);
    return null;
  }
}

onAuthStateChanged(auth, async (user) => {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  console.log('Auth state changed — pagina:', page, '| user:', user?.email || 'nenhum');

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

  const perfil = await getPerfilByEmail(user.email);

  if (!perfil) {
    console.warn('Perfil nao encontrado — deslogando:', user.email);
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  const ehJoel   = user.email === JOEL_EMAIL || perfil.tipo === 'joel';
  const redirect = ehJoel ? 'dashboard.html' : 'analista.html';

  console.log('Perfil tipo:', perfil.tipo, '| ehJoel:', ehJoel, '| redirect:', redirect);

  if (page === 'login.html') {
    console.log('Redirecionando para:', redirect);
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

  window.currentUser   = user;
  window.currentPerfil = {
    tipo: ehJoel ? 'joel' : 'analista',
    redirect
  };
});

window.doLogout = async () => {
  await signOut(auth);
  window.location.href = 'login.html';
};
