import { getUsuarios, getPDI, DESAFIOS, MODULOS, STATUS_CFG } from './crud.js';

window.addEventListener('load', async () => {
  const user = window.currentUser;
  if(!user) return;
  const usuarios = await getUsuarios();
  const eu = usuarios.find(u => u.email === user.email);
  if(!eu) return;
  renderPerfil(eu);
  const pdi = await getPDI(eu.id);
  renderProgressoGeral(pdi);
  renderTimeline(pdi, eu);
});

function renderPerfil(u) {
  document.getElementById('navSub').textContent = u.nome;
  document.getElementById('perfilCard').innerHTML = `
    <div class="perfil-av" style="background:${u.cor||'#7C5CCC'}">${initials(u.nome)}</div>
    <div>
      <div class="perfil-name">${u.nome}</div>
      <div class="perfil-cargo">${u.cargo||''}</div>
      <div class="perfil-meta">Inicio: ${fmtDate(u.dataInicio)} · CNAcademy Turma 2026</div>
    </div>`;
}

function renderProgressoGeral(pdi) {
  const wrap = document.getElementById('progressoGeral');
  wrap.innerHTML = '';
  Object.entries(MODULOS).forEach(([id, m]) => {
    const semanasDom = m.semanas;
    const concluidas = pdi.filter(p => semanasDom.includes(p.semana) && p.status==='concluido').length;
    const pct = Math.round(concluidas/semanasDom.length*100);
    const notas = pdi.filter(p => semanasDom.includes(p.semana) && p.nota > 0).map(p=>p.nota);
    const media = notas.length ? (notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(1) : '—';
    wrap.innerHTML += `
      <div class="prog-modulo">
        <div class="prog-modulo-name">${m.nome}</div>
        <div class="prog-label" style="font-size:11px;color:var(--gs400);display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>${concluidas}/${semanasDom.length} semanas</span><span>Media: ${media} ⭐</span>
        </div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>`;
  });
}

function renderTimeline(pdi, u) {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';
  Object.entries(DESAFIOS).forEach(([semana, d], i) => {
    const item = pdi.find(p=>p.semana===semana) || {};
    const st = item.status || 'a_fazer';
    const cfg = STATUS_CFG[st] || STATUS_CFG.a_fazer;
    const nota = item.nota || 0;
    const stars = nota > 0 ? '⭐'.repeat(nota) : '—';
    tl.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-num" style="background:${cfg.color};color:${cfg.text};">${i+1}</div>
        <div class="timeline-content">
          <div class="timeline-week">${semana} · ${d.sheets}</div>
          <div class="timeline-tema">${d.tema}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span class="semana-dot" style="background:${cfg.color};color:${cfg.text};border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">${cfg.label}</span>
            <div class="timeline-nota">${stars}</div>
          </div>
          ${item.pontosFortes ? `<div class="timeline-fb"><div class="timeline-fb-label">Pontos Fortes</div>${item.pontosFortes}</div>` : ''}
          ${item.pontosMelhoria ? `<div class="timeline-fb" style="margin-top:6px;"><div class="timeline-fb-label">Pontos de Melhoria</div>${item.pontosMelhoria}</div>` : ''}
          ${item.observacoes ? `<div class="timeline-fb" style="margin-top:6px;"><div class="timeline-fb-label">Observacoes</div>${item.observacoes}</div>` : ''}
        </div>
      </div>`;
  });
}

function initials(nome){ const p=nome.trim().split(' '); return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():nome.substring(0,2).toUpperCase(); }
function fmtDate(s){ if(!s)return'—'; try{ const d=new Date(s); return d.toLocaleDateString('pt-BR'); } catch{ return s; } }
