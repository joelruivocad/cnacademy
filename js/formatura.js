import { auth } from './firebase.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getUsuarios, getPDI } from './crud.js';

const JOEL_EMAIL = 'joel.ruivo@cadastra.com';

window.addEventListener('load', () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }

    try {
      const todos    = await getUsuarios();
      const ehJoel   = user.email === JOEL_EMAIL;
      const euUsuario = todos.find(u => u.email === user.email);

      // Ajusta o botao de voltar
      const btnVoltar = document.getElementById('btnVoltar');
      if (btnVoltar) {
        if (ehJoel) {
          btnVoltar.href        = 'dashboard.html';
          btnVoltar.textContent = '← Voltar ao Dashboard';
        } else {
          btnVoltar.href        = 'analista.html';
          btnVoltar.textContent = '← Voltar ao Meu Progresso';
        }
      }

      // Se for analista — verifica se concluiu todas as 12 semanas
      if (!ehJoel && euUsuario) {
        const meuPDI     = await getPDI(euUsuario.id);
        const concluidas = meuPDI.filter(p => p.status === 'concluido').length;

        if (concluidas < 12) {
          // Nao concluiu — bloqueia a pagina e redireciona
          document.getElementById('formandasGrid').innerHTML = `
            <div style="text-align:center;padding:48px 24px;">
              <div style="font-size:56px;margin-bottom:16px;
                animation:float 3s ease-in-out infinite;display:inline-block;">
                🔒
              </div>
              <div style="font-family:var(--fd);font-size:20px;font-weight:700;
                color:var(--gs900);margin-bottom:8px;">
                Pagina bloqueada
              </div>
              <p style="font-size:14px;color:var(--gs500);
                max-width:380px;margin:0 auto 20px;line-height:1.65;">
                A pagina de formatura fica disponivel somente apos a conclusao
                das <strong>12 semanas</strong> do programa.
                Voce concluiu <strong>${concluidas}/12</strong> semanas ate agora.
              </p>
              <div style="background:var(--gs50);border-radius:var(--r16);
                padding:14px 20px;display:inline-block;margin-bottom:24px;">
                <div style="font-size:11px;color:var(--gs400);
                  margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px;">
                  Seu progresso
                </div>
                <div style="background:var(--gs100);border-radius:99px;
                  height:8px;width:240px;overflow:hidden;margin-bottom:6px;">
                  <div style="height:100%;border-radius:99px;
                    background:linear-gradient(90deg,var(--purple),var(--brand));
                    width:${Math.round(concluidas/12*100)}%;
                    transition:width 600ms ease;">
                  </div>
                </div>
                <div style="font-size:12px;color:var(--gs500);">
                  ${concluidas} de 12 semanas concluidas
                  (${Math.round(concluidas/12*100)}%)
                </div>
              </div>
              <br/>
              <a href="analista.html" class="btn btn-grad"
                style="text-decoration:none;">
                Voltar ao Meu Progresso
              </a>
            </div>`;

          // Atualiza o titulo da pagina hero para nao mostrar mensagem de formatura
          const heroTitle = document.querySelector('.formatura-title');
          if (heroTitle) heroTitle.textContent = 'Continue sua jornada!';
          const heroSub = document.querySelector('.formatura-sub');
          if (heroSub) heroSub.textContent =
            'Complete as 12 semanas do programa para acessar a sua formatura.';
          const heroAngel = document.querySelector('.formatura-angel');
          if (heroAngel) heroAngel.textContent = '🌤';

          return;
        }

        // Analista concluiu — mostra apenas o proprio card
        await renderFormandas([euUsuario], ehJoel);
        return;
      }

      // Joel — ve todas as analistas
      const analistas = todos.filter(
        u => u.tipo === 'analista' && u.ativo !== false
      );
      await renderFormandas(analistas, ehJoel);

    } catch (e) {
      console.error('Erro ao carregar formatura:', e);
      document.getElementById('formandasGrid').innerHTML = `
        <div class="loading-msg" style="color:var(--err);">
          Erro ao carregar: ${e.message}
        </div>`;
    }
  });
});

// ── RENDER FORMANDAS ──────────────────────
async function renderFormandas(usuarios, ehJoel) {
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

    // Estrelas
    const starsHTML = media
      ? '⭐'.repeat(Math.round(mediaNum)) +
        '<span style="opacity:.25;">☆</span>'.repeat(5 - Math.round(mediaNum))
      : '<span style="opacity:.25;">☆☆☆☆☆</span>';

    grid.innerHTML += `
      <div class="formanda-card">

        <!-- Barra colorida -->
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
        <div style="font-size:18px;margin-bottom:14px;">${starsHTML}</div>

        <!-- Progresso -->
        <div class="prog-bar-wrap" style="margin-bottom:16px;">
          <div class="prog-label">
            <span>${concluidas}/12 semanas</span>
            <span>${pct}%</span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <!-- Badge -->
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

        <!-- Botao certificado -->
        <a href="certificado.html?id=${u.id}"
          class="btn btn-grad"
          style="width:100%;justify-content:center;
            text-decoration:none;height:38px;font-size:12px;">
          🎓 Ver Certificado
        </a>

      </div>`;
  }

  // Confetti so para analista que concluiu
  gerarConfetti();
}

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
