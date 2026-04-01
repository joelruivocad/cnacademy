import { db, auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getUsuarios, getPDI, DESAFIOS, MODULOS, STATUS_CFG } from './crud.js';

// Aguarda autenticacao antes de carregar
onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = 'login.html';
    return;
  }

  try {
    const usuarios = await getUsuarios();
    const eu = usuarios.find(u => u.email === user.email);

    if(!eu){
      document.getElementById('perfilCard').innerHTML = `
        <div style="color:var(--err);font-size:14px;padding:16px;">
          Perfil nao encontrado. Contate o Joel.
        </div>`;
      return;
    }

    renderPerfil(eu);
    const pdi = await getPDI(eu.id);
    renderProgressoGeral(pdi);
    renderTimeline(pdi, eu);

  } catch(e) {
    console.error('Erro ao carregar analista:', e);
    document.getElementById('perfilCard').innerHTML = `
      <div style="color:var(--err);font-size:14px;padding:16px;">
        Erro ao carregar perfil: ${e.message}
      </div>`;
  }
});

function renderPerfil(u) {
  // Atualiza o subtitulo do nav
  const navSub = document.getElementById('navSub');
  if(navSub) navSub.textContent = u.nome;

  document.getElementById('perfilCard').innerHTML = `
    <div class="perfil-av" style="background:${u.cor||'#7C5CCC'}">${initials(u.nome)}</div>
    <div>
      <div class="perfil-name">${u.nome}</div>
      <div class="perfil-cargo">${u.cargo||''}</div>
      <div class="perfil-meta">
        Inicio: ${fmtDate(u.dataInicio)} &nbsp;·&nbsp; CNAcademy Turma 2026
      </div>
    </div>`;
}

function renderProgressoGeral(pdi) {
  const wrap = document.getElementById('progressoGeral');
  if(!wrap) return;
  wrap.innerHTML = '';

  Object.entries(MODULOS).forEach(([id, m]) => {
    const semanasDom = m.semanas;
    const concluidas = pdi.filter(p =>
      semanasDom.includes(p.semana) && p.status === 'concluido'
    ).length;
    const pct = Math.round(concluidas / semanasDom.length * 100);
    const notas = pdi
      .filter(p => semanasDom.includes(p.semana) && p.nota > 0)
      .map(p => p.nota);
    const media = notas.length
      ? (notas.reduce((a,b) => a+b, 0) / notas.length).toFixed(1)
      : '—';

    wrap.innerHTML += `
      <div class="prog-modulo">
        <div class="prog-modulo-name">${m.nome}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gs400);margin-bottom:6px;">
          <span>${concluidas}/${semanasDom.length} semanas</span>
          <span>Media: ${media} ${media !== '—' ? '⭐' : ''}</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  });
}

function renderTimeline(pdi, u) {
  const tl = document.getElementById('timeline');
  if(!tl) return;
  tl.innerHTML = '';

  Object.entries(DESAFIOS).forEach(([semana, d], i) => {
    const item = pdi.find(p => p.semana === semana) || {};
    const st  = item.status || 'a_fazer';
    const cfg = STATUS_CFG[st] || STATUS_CFG.a_fazer;
    const nota = item.nota || 0;
    const stars = nota > 0
      ? '<span style="color:#F5C842">⭐</span>'.repeat(nota)
        + '<span style="opacity:.3">☆</span>'.repeat(5 - nota)
      : '<span style="opacity:.3">☆☆☆☆☆</span>';

    tl.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-num"
          style="background:${cfg.color};color:${cfg.text};">
          ${i+1}
        </div>
        <div class="timeline-content">
          <div class="timeline-week">${semana} · Sheets: ${d.sheets}</div>
          <div class="timeline-tema">${d.tema}</div>
          <div style="display:flex;align-items:center;gap:10px;margin:6px 0;">
            <span style="background:${cfg.color};color:${cfg.text};
              border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">
              ${cfg.label}
            </span>
            <span style="font-size:16px;">${stars}</span>
          </div>
          <div style="font-size:12px;color:var(--gs500);line-height:1.55;
            background:var(--gs50);border-radius:var(--r8);padding:10px 12px;
            margin-bottom:4px;">
            <strong style="font-size:10px;text-transform:uppercase;
              letter-spacing:.4px;color:var(--gs700);">Desafio</strong><br/>
            ${d.contexto}
          </div>
          ${item.pontosFortes ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Pontos Fortes</div>
              ${item.pontosFortes}
            </div>` : ''}
          ${item.pontosMelhoria ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Pontos de Melhoria</div>
              ${item.pontosMelhoria}
            </div>` : ''}
          ${item.observacoes ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Observacoes de Joel</div>
              ${item.observacoes}
            </div>` : ''}
        </div>
      </div>`;
  });
}

// HELPERS
function initials(nome){
  if(!nome) return '?';
  const p = nome.trim().split(' ');
  return p.length > 1
    ? (p[0][0] + p[p.length-1][0]).toUpperCase()
    : nome.substring(0,2).toUpperCase();
}

function fmtDate(s){
  if(!s) return '—';
  try {
    const d = new Date(s+'T12:00:00');
    return d.toLocaleDateString('pt-BR', {
      day:'2-digit', month:'long', year:'numeric'
    });
  } catch { return s; }
}
