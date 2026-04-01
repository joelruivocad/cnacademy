import { db, auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getUsuarios, getPDI, updatePDI, DESAFIOS, MODULOS, STATUS_CFG } from './crud.js';

// Variavel global acessivel por todas as funcoes
window._meuId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = 'login.html'; return; }

  try {
    const usuarios = await getUsuarios();
    const eu = usuarios.find(u => u.email === user.email);

    if (!eu) {
      document.getElementById('perfilCard').innerHTML = `
        <div style="color:var(--err);font-size:14px;padding:16px;">
          Perfil nao encontrado. Contate o Joel.
        </div>`;
      return;
    }

    // Salva o id globalmente ANTES de renderizar
    window._meuId = eu.id;

    // Renderiza o perfil
    renderPerfil(eu);

    // Busca o PDI
    const pdi = await getPDI(eu.id);

    // Controla visibilidade do botao de formatura
    const btnFormatura = document.getElementById('btnFormatura');
    if (btnFormatura) {
      const concluidas = pdi.filter(p => p.status === 'concluido').length;
      if (concluidas < 12) {
        btnFormatura.style.display = 'none';
      } else {
        btnFormatura.style.display = '';
      }
    }

    // Renderiza progresso e timeline
    renderProgressoGeral(pdi);
    renderTimeline(pdi, eu);

  } catch (e) {
    console.error('Erro ao carregar analista:', e);
    document.getElementById('perfilCard').innerHTML = `
      <div style="color:var(--err);font-size:14px;padding:16px;">
        Erro ao carregar: ${e.message}
      </div>`;
  }
});

function renderPerfil(u) {
  const navSub = document.getElementById('navSub');
  if (navSub) navSub.textContent = u.nome;
  document.getElementById('perfilCard').innerHTML = `
    <div class="perfil-av" style="background:${u.cor || '#7C5CCC'}">${initials(u.nome)}</div>
    <div>
      <div class="perfil-name">${u.nome}</div>
      <div class="perfil-cargo">${u.cargo || ''}</div>
      <div class="perfil-meta">
        Inicio: ${fmtDate(u.dataInicio)} &nbsp;·&nbsp; CNAcademy Turma 2026
      </div>
    </div>`;
}

function renderProgressoGeral(pdi) {
  const wrap = document.getElementById('progressoGeral');
  if (!wrap) return;
  wrap.innerHTML = '';
  Object.entries(MODULOS).forEach(([id, m]) => {
    const concluidas = pdi.filter(p =>
      m.semanas.includes(p.semana) && p.status === 'concluido'
    ).length;
    const pct = Math.round(concluidas / m.semanas.length * 100);
    const notas = pdi
      .filter(p => m.semanas.includes(p.semana) && p.nota > 0)
      .map(p => p.nota);
    const media = notas.length
      ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
      : '—';
    wrap.innerHTML += `
      <div class="prog-modulo">
        <div class="prog-modulo-name">${m.nome}</div>
        <div style="display:flex;justify-content:space-between;
          font-size:11px;color:var(--gs400);margin-bottom:6px;">
          <span>${concluidas}/${m.semanas.length} semanas</span>
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
  if (!tl) return;
  tl.innerHTML = '';

  Object.entries(DESAFIOS).forEach(([semana, d], i) => {
    const item = pdi.find(p => p.semana === semana) || {};
    const st   = item.status || 'a_fazer';
    const cfg  = STATUS_CFG[st] || STATUS_CFG.a_fazer;
    const nota = item.nota || 0;
    const stars = nota > 0
      ? '<span style="color:#F5C842">⭐</span>'.repeat(nota) +
        '<span style="opacity:.25">☆</span>'.repeat(5 - nota)
      : '<span style="opacity:.25">☆☆☆☆☆</span>';

    const semanaKey = semana.replace(/\s/g, '-');

    const entregasHTML = d.entregas.map(e => `
      <li style="font-size:12px;color:var(--gs500);padding:5px 0;
        border-bottom:1px solid var(--gs100);display:flex;
        align-items:flex-start;gap:8px;line-height:1.5;">
        <span style="color:var(--purple);font-weight:700;flex-shrink:0;margin-top:1px;">→</span>
        <span>${e}</span>
      </li>`).join('');

    tl.innerHTML += `
      <div class="timeline-item" id="tl-${semanaKey}">
        <div class="timeline-num"
          style="background:${cfg.color};color:${cfg.text};">${i + 1}
        </div>
        <div class="timeline-content" style="width:100%;">

          <!-- Header -->
          <div style="display:flex;align-items:flex-start;
            justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              <div class="timeline-week">${semana} · Sheets: ${d.sheets}</div>
              <div class="timeline-tema">${d.tema}</div>
            </div>
            <span style="background:${cfg.color};color:${cfg.text};
              border-radius:99px;padding:3px 10px;font-size:10px;
              font-weight:700;white-space:nowrap;flex-shrink:0;">
              ${cfg.label}
            </span>
          </div>

          <!-- Contexto -->
          <div style="background:var(--purple-bg);border-radius:var(--r8);
            padding:10px 14px;margin-bottom:10px;font-size:12px;
            color:var(--purple);line-height:1.6;">
            <strong style="font-size:10px;text-transform:uppercase;
              letter-spacing:.4px;display:block;margin-bottom:4px;">
              Contexto
            </strong>
            ${d.contexto}
          </div>

          <!-- Objetivo -->
          <div style="background:var(--brand-light);border-radius:var(--r8);
            padding:10px 14px;margin-bottom:10px;font-size:12px;
            color:var(--brand);line-height:1.6;">
            <strong style="font-size:10px;text-transform:uppercase;
              letter-spacing:.4px;display:block;margin-bottom:4px;">
              Objetivo da Semana
            </strong>
            ${d.objetivo}
          </div>

          <!-- Entregas -->
          <div style="background:var(--gs50);border:1px solid var(--gs100);
            border-radius:var(--r8);padding:12px 14px;margin-bottom:10px;">
            <strong style="font-size:10px;text-transform:uppercase;
              letter-spacing:.4px;color:var(--gs700);display:block;margin-bottom:8px;">
              O que entregar
            </strong>
            <ul style="list-style:none;padding:0;">${entregasHTML}</ul>
          </div>

          <!-- Formato + Dica -->
          <div style="display:grid;grid-template-columns:1fr 1fr;
            gap:8px;margin-bottom:12px;">
            <div style="background:var(--ok-bg);border-radius:var(--r8);
              padding:10px 12px;font-size:12px;color:var(--ok);line-height:1.5;">
              <strong style="font-size:10px;text-transform:uppercase;
                letter-spacing:.4px;display:block;margin-bottom:3px;">
                Formato de Entrega
              </strong>
              ${d.formato}
            </div>
            <div style="background:var(--warn-bg);border-radius:var(--r8);
              padding:10px 12px;font-size:12px;color:var(--warn);line-height:1.5;">
              <strong style="font-size:10px;text-transform:uppercase;
                letter-spacing:.4px;display:block;margin-bottom:3px;">
                Dica do Joel
              </strong>
              ${d.dica}
            </div>
          </div>

          <!-- Controles: status + link -->
          <div style="display:flex;align-items:center;gap:8px;
            flex-wrap:wrap;margin-bottom:10px;">

            <select
              id="status-${semanaKey}"
              onchange="window.atualizarStatus('${semana}', this.value)"
              style="border:1px solid var(--gs200);border-radius:var(--r8);
                padding:6px 10px;font:600 11px var(--fp);
                color:${cfg.text};background:${cfg.color};
                cursor:pointer;outline:none;flex-shrink:0;">
              ${Object.entries(STATUS_CFG).map(([k, v]) =>
                `<option value="${k}" ${k === st ? 'selected' : ''}>${v.label}</option>`
              ).join('')}
            </select>

            <div style="display:flex;gap:6px;flex:1;min-width:220px;">
              <input
                type="url"
                id="link-${semanaKey}"
                placeholder="Cole o link da sua entrega..."
                value="${item.linkEntrega || ''}"
                style="flex:1;border:1px solid var(--gs200);border-radius:var(--r8);
                  padding:6px 10px;font:400 11px var(--fm);color:var(--gs900);
                  background:var(--white);outline:none;transition:border-color 150ms;"
                onfocus="this.style.borderColor='var(--purple)'"
                onblur="this.style.borderColor='var(--gs200)'"/>
              <button
                onclick="window.salvarLink('${semana}')"
                style="background:var(--purple);color:#fff;border:none;
                  border-radius:var(--r8);padding:6px 14px;
                  font:600 11px var(--fp);cursor:pointer;
                  white-space:nowrap;flex-shrink:0;transition:opacity 150ms;"
                onmouseover="this.style.opacity='.8'"
                onmouseout="this.style.opacity='1'">
                Enviar
              </button>
            </div>
          </div>

          <!-- Nota + Feedback -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:11px;color:var(--gs400);font-weight:600;">
              Avaliacao:
            </span>
            <span style="font-size:15px;">${stars}</span>
          </div>

          ${item.pontosFortes ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Pontos Fortes — Joel</div>
              ${item.pontosFortes}
            </div>` : ''}

          ${item.pontosMelhoria ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Pontos de Melhoria — Joel</div>
              ${item.pontosMelhoria}
            </div>` : ''}

          ${item.observacoes ? `
            <div class="timeline-fb" style="margin-top:6px;">
              <div class="timeline-fb-label">Observacoes — Joel</div>
              ${item.observacoes}
            </div>` : ''}

        </div>
      </div>`;
  });
}

// ── ATUALIZAR STATUS ──────────────────────
window.atualizarStatus = async (semana, novoStatus) => {
  const id = window._meuId;
  if (!id) {
    showToast('Aguarde o carregamento do perfil', 'err');
    return;
  }
  const semanaKey = semana.replace(/\s/g, '-');
  const sel = document.getElementById('status-' + semanaKey);
  if (sel) sel.disabled = true;
  try {
    await updatePDI(id, semana, { semana, status: novoStatus });
    // Atualiza a cor do select visualmente
    const cfg = STATUS_CFG[novoStatus] || STATUS_CFG.a_fazer;
    if (sel) {
      sel.style.background = cfg.color;
      sel.style.color = cfg.text;
      sel.disabled = false;
    }
    showToast('Status atualizado!', 'ok');
  } catch (e) {
    console.error('Erro ao atualizar status:', e);
    showToast('Erro ao salvar: ' + e.message, 'err');
    if (sel) sel.disabled = false;
  }
};

// ── SALVAR LINK ───────────────────────────
window.salvarLink = async (semana) => {
  const id = window._meuId;
  if (!id) {
    showToast('Aguarde o carregamento do perfil', 'err');
    return;
  }
  const semanaKey = semana.replace(/\s/g, '-');
  const input = document.getElementById('link-' + semanaKey);
  if (!input) return;
  const link = input.value.trim();
  if (!link) {
    showToast('Cole um link valido antes de enviar', 'err');
    return;
  }
  // Valida se e uma URL
  try { new URL(link); } catch {
    showToast('O link nao parece valido. Use uma URL completa (https://...)', 'err');
    return;
  }
  input.disabled = true;
  try {
    await updatePDI(id, semana, { semana, linkEntrega: link });
    input.style.borderColor = 'var(--ok)';
    input.disabled = false;
    showToast('Entrega enviada para o Joel!', 'ok');
  } catch (e) {
    console.error('Erro ao salvar link:', e);
    showToast('Erro ao enviar entrega: ' + e.message, 'err');
    input.disabled = false;
  }
};

// ── HELPERS ───────────────────────────────
function initials(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  return p.length > 1
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : nome.substring(0, 2).toUpperCase();
}

function fmtDate(s) {
  if (!s) return '—';
  try {
    return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch { return s; }
}

function showToast(msg, t = 'info') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast t-${t}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
