import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getUsuarios, getPDI } from './crud.js';

window.addEventListener('load', async () => {

  // Ajusta o botao de voltar conforme o perfil do usuario logado
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
      if (user.email === 'joel.ruivo@cadastra.com') {
        btnVoltar.href        = 'dashboard.html';
        btnVoltar.textContent = '← Voltar ao Dashboard';
      } else {
        btnVoltar.href        = 'analista.html';
        btnVoltar.textContent = '← Voltar ao Meu Progresso';
      }
    }
  });

  // Carrega as formandas
  try {
    const usuarios = (await getUsuarios()).filter(
      u => u.tipo === 'analista' && u.ativo !== false
    );

    const grid = document.getElementById('formandasGrid');

    if (!usuarios.length) {
      grid.innerHTML = `
        <div class="loading-msg">
          Nenhuma formanda ainda. Continue o programa!
        </div>`;
      return;
    }

    grid.innerHTML = '';

    for (const u of usuarios) {
      const pdi        = await getPDI(u.id);
      const concluidas = pdi.filter(p => p.status === 'concluido').length;
      const notas      = pdi.filter(p => p.nota > 0).map(p => p.nota);
      const media      = notas.length
        ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
        : null;
      const mediaNum   = parseFloat(media) || 0;
      const pct        = Math.round(concluidas / 12 * 100);

      // Estrelas da media
      const starsHTML = media
        ? '⭐'.repeat(Math.round(mediaNum)) +
          '<span style="opacity:.25;">☆</span>'.repeat(5 - Math.round(mediaNum))
        : '<span style="opacity:.25;">☆☆☆☆☆</span>';

      grid.innerHTML += `
        <div class="formanda-card">

          <!-- Barra colorida do topo -->
          <div style="position:absolute;top:0;left:0;right:0;height:5px;
            border-radius:20px 20px 0 0;
            background:${u.cor || '#FC4807'};"></div>

          <!-- Avatar -->
          <div class="formanda-av"
            style="background:${u.cor || '#FC4807'}">
            ${initials(u.nome)}
          </div>

          <!-- Nome e cargo -->
          <div class="formanda-name">${u.nome}</div>
          <div class="formanda-cargo">${u.cargo || ''}</div>

          <!-- Nota media -->
          <div class="formanda-nota-media"
            style="color:${u.cor || '#FC4807'}">
            ${media ? media : '—'}
          </div>
          <div class="formanda-nota-lbl">Media geral</div>

          <!-- Estrelas -->
          <div style="font-size:18px;margin-bottom:14px;">
            ${starsHTML}
          </div>

          <!-- Barra de progresso -->
          <div class="prog-bar-wrap" style="margin-bottom:16px;">
            <div class="prog-label">
              <span>${concluidas}/12 semanas</span>
              <span>${pct}%</span>
            </div>
            <div class="prog-track">
              <div class="prog-fill" style="width:${pct}%"></div>
            </div>
          </div>

          <!-- Badge de status -->
          <div style="margin-bottom:16px;">
            ${pct === 100
              ? `<span style="background:var(--ok-bg);color:var(--ok);
                  border-radius:99px;padding:4px 14px;
                  font-size:11px;font-weight:700;">
                  Programa Concluido
                </span>`
              : `<span style="background:var(--warn-bg);color:var(--warn);
                  border-radius:99px;padding:4px 14px;
                  font-size:11px;font-weight:700;">
                  Em Andamento
                </span>`
            }
          </div>

          <!-- Botao do certificado -->
          <a href="certificado.html?id=${u.id}"
            class="btn btn-grad"
            style="width:100%;justify-content:center;
              text-decoration:none;height:38px;font-size:12px;">
            🎓 Ver Certificado
          </a>

        </div>`;
    }

    // Gera confetti
    gerarConfetti();

  } catch (e) {
    console.error('Erro ao carregar formatura:', e);
    document.getElementById('formandasGrid').innerHTML = `
      <div class="loading-msg" style="color:var(--err);">
        Erro ao carregar: ${e.message}
      </div>`;
  }
});

// ── CONFETTI ──────────────────────────────
function gerarConfetti() {
  const wrap = document.getElementById('confetti');
  if (!wrap) return;
  const emojis = ['⭐','✨','🌟','💫','👼','😇','🎓','🏆','🎉','🎊'];
  for (let i = 0; i < 30; i++) {
    const el       = document.createElement('div');
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
      position:absolute;
      font-size:${14 + Math.random() * 22}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      opacity:${0.2 + Math.random() * 0.6};
      animation:float ${3 + Math.random() * 4}s ease-in-out
        ${Math.random() * 3}s infinite alternate;
      pointer-events:none;
      user-select:none;`;
    wrap.appendChild(el);
  }
}

// ── HELPERS ───────────────────────────────
function initials(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  return p.length > 1
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : nome.substring(0, 2).toUpperCase();
}
