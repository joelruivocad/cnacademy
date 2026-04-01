import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Perfis por email
const PERFIS = {
  'joel.ruivo@cadastra.com':     { tipo:'joel',     redirect:'dashboard.html' },
  'anna.salvati@cadastra.com':   { tipo:'analista', redirect:'analista.html'  },
  'nataly.rodrigues@cadastra.com':{ tipo:'analista', redirect:'analista.html' },
  'lais.flores@cadastra.com':    { tipo:'analista', redirect:'analista.html'  },
};

window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.auth = auth;

onAuthStateChanged(auth, async (user) => {
  const page = window.location.pathname.split('/').pop();
  if (!user) {
    if (page !== 'login.html' && page !== 'index.html' && page !== '') {
      window.location.href = 'login.html';
    }
    return;
  }
  const perfil = PERFIS[user.email];
  if (!perfil) { await signOut(auth); window.location.href = 'login.html'; return; }

  // Redireciona se estiver na pagina errada
  if (page === 'login.html') {
    window.location.href = perfil.redirect;
    return;
  }
  if (page === 'dashboard.html' && perfil.tipo !== 'joel') {
    window.location.href = 'analista.html';
    return;
  }

  // Salva sessao
  window.currentUser  = user;
  window.currentPerfil = perfil;
});

window.doLogout = async () => {
  await signOut(auth);
  window.location.href = 'login.html';
};
