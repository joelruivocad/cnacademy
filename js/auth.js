import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const PERFIS = {
  'joel.ruivo@cadastra.com':      { tipo:'joel',     redirect:'dashboard.html' },
  'anna.salvati@cadastra.com':    { tipo:'analista', redirect:'analista.html'  },
  'nataly.rodrigues@cadastra.com':{ tipo:'analista', redirect:'analista.html'  },
  'lais.flores@cadastra.com':     { tipo:'analista', redirect:'analista.html'  },
};

export { auth, signInWithEmailAndPassword };

onAuthStateChanged(auth, async (user) => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if(!user){
    if(page !== 'login.html' && page !== 'index.html' && page !== ''){
      window.location.href = 'login.html';
    }
    return;
  }

  const perfil = PERFIS[user.email];
  if(!perfil){ await signOut(auth); window.location.href='login.html'; return; }

  if(page === 'login.html'){
    window.location.href = perfil.redirect;
    return;
  }
  if(page === 'dashboard.html' && perfil.tipo !== 'joel'){
    window.location.href = 'analista.html';
    return;
  }
  if(page === 'analista.html' && perfil.tipo === 'joel'){
    window.location.href = 'dashboard.html';
    return;
  }

  window.currentUser   = user;
  window.currentPerfil = perfil;
});

window.doLogout = async () => {
  await signOut(auth);
  window.location.href = 'login.html';
};
