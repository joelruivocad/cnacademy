import {
  getUsuarios, getPDI, updatePDI,
  createUsuario, deleteUsuario,
  DESAFIOS, MODULOS, STATUS_CFG
} from './crud.js';
import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const CORES = [
  '#FC4807','#FF1493','#00CC88',
  '#CC0044','#007CC5','#7C5CCC',
  '#D4940E','#00A700'
];

let usuarios        = [];
let selCorAdd       = '#FC4807';
let editAnalistaId  = null;
let deleteAnalistaId= null;

// ── INIT ──────────────────────────────────
window.addEventListener('load', async () => {
  await loadDashboard();
  buildColorPicker('colorPicker', CORES, c => selCorAdd = c);
});

async function loadDashboard() {
  try {
    const todos = await getUsuarios();
    usuarios = todos.filter(u => u.tipo === 'analista' && u.ativo !== false);
    await renderKPIs();
    await renderAnalistas();
  } catch (e) {
    showToast('Erro ao carregar dados: ' + e.message, 'err');
    console.error(e);
  }
}

// ── KPIs ──────────────────────────────────
async function renderKPIs() {
  const total = usuarios.length;
  let totalConcluidos = 0;
  let totalEntregas   = 0;

  for (const u of usuarios) {
    const pdi = await getPDI(u.id);
    totalConcluidos += pdi.filter(p => p.status === 'concluido').length;
    totalEntregas   += pdi.filter(p => p.linkEntrega && p.linkEntrega.trim() !== '').length;
  }

  const pct      = total > 0 ? Math.round(totalConcluidos / (total * 12) * 100) : 0;
  const formadas = usuarios.filter(u => u.formada).length;

  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi">
      <div class="kpi-ico">👼</div>
      <div class="kpi-val" style="color:var(--purple)">${total}</div>
      <div class="kpi-lbl">Analistas</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">✅</div>
      <div class="kpi-val" style="color:var(--ok)">${totalConcluidos}</div>
      <div class="kpi-lbl">Semanas Concluidas</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">📤</div>
      <div class="kpi-val" style="color:var(--blue)">${totalEntregas}</div>
      <div class="kpi-lbl">Entregas Enviadas</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">📊</div>
      <div class="kpi-val" style="color:var(--brand)">${pct}%</div>
      <div class="kpi-lbl">Progresso Geral</div>
    </div>
    <div class="kpi">
      <div class="kpi-ico">🎓</div>
      <div class="kpi-val" style="color:var(--warn)">${formadas}</div>
      <div class="kpi-lbl">Formandas</div>
    </div>`;
}

// ── ANALISTAS ─────────────────────────────
async function renderAnalistas() {
  const grid = document.getElementById('analistasGrid');
  if (!usuarios.length) {
    grid.innerHTML = `
      <div class="loading-msg">
        Nenhuma analista cadastrada ainda.
      </div>`;
    return;
  }
  grid.innerHTML = '';

  for (const u of usuarios) {
    const pdi        = await getPDI(u.id);
    const concluidas = pdi.filter(p => p.status === 'concluido').length;
    const entregas   = pdi.filter(p => p.linkEntrega && p.linkEntrega.trim() !== '').length;
    const pendentes  = pdi.filter(p => p.linkEntrega && p.linkEntrega.trim() !== '' && p.status === 'entregue').length;
    const pct        = Math.round(concluidas / 12 * 100);

    const card = document.createElement('div');
    card.className = 'analista-card';
    card.innerHTML = `
      <div class="analista-card-bar"
        style="background:${u.cor || '#FC4807'};"></div>

      <div class="analista-card-hd">
        <div class="analista-av"
          style="background:${u.cor || '#FC4807'}">
          ${initials(u.nome)}
        </div>
        <div style="flex:1;min-width:0;">
          <div class="analista-name">${u.nome}</div>
          <div class="analista-cargo">${u.cargo || ''}</div>
        </div>
        <div class="analista-actions">
          <button class="btn btn-sec btn-sm"
            onclick="window.openFeedback('${u.id}','${u.nome}')">
            ${pendentes > 0
              ? `<span style="background:var(--brand);color:#fff;border-radius:50%;
                  width:16px;height:16px;font-size:9px;font-weight:700;
                  display:inline-flex;align-items:center;justify-content:center;
                  margin-right:3px;">${pendentes}</span>`
              : ''}
            Feedback
          </button>
          <button class="btn btn-ok btn-sm"
            onclick="window.emitirCertificado('${u.id}')">
            Cert.
          </button>
          <button class="btn btn-err btn-sm"
            onclick="window.openDelete('${u.id}','${u.nome}')">
            ✕
          </button>
        </div>
      </div>

      <!-- Progresso -->
      <div class="prog-bar-wrap">
        <div class="prog-label">
          <span>${concluidas}/12 semanas concluidas</span>
          <span>${pct}%</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <!-- Badges de status -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <span style="background:var(--blue-bg);color:var(--blue);
          border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">
          ${entregas} entrega${entregas !== 1 ? 's' : ''} enviada${entregas !== 1 ? 's' : ''}
        </span>
        ${pendentes > 0 ? `
          <span style="background:var(--brand-light);color:var(--brand);
            border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">
            ${pendentes} aguardando correcao
          </span>` : ''}
        <span style="background:var(--ok-bg);color:var(--ok);
          border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;">
          ${concluidas} concluida${concluidas !== 1 ? 's' : ''}
        </span>
      </div>

      <!-- Dots das semanas -->
      <div class="analista-card-ft">
        ${Object.keys(DESAFIOS).map((s, i) => {
          const item = pdi.find(p => p.semana === s);
          const st   = item ? item.status : 'a_fazer';
          const cfg  = STATUS_CFG[st] || STATUS_CFG.a_fazer;
          const temEntrega = item && item.linkEntrega && item.linkEntrega.trim() !== '';
          return `<div class="semana-dot"
            style="background:${cfg.color};color:${cfg.text};"
            title="${s}: ${cfg.label}${temEntrega ? ' — Entrega enviada' : ''}">
            ${temEntrega ? '🔗' : (i + 1)}
          </div>`;
        }).join('')}
      </div>`;

    grid.appendChild(card);
  }
}

// ── FEEDBACK MODAL ────────────────────────
window.openFeedback = async (id, nome) => {
  editAnalistaId = id;
  document.getElementById('fb-analista-nome').textContent = nome;

  // Monta o select de semanas
  const sel = document.getElementById('fb-semana');
  sel.innerHTML = Object.keys(DESAFIOS).map(s =>
    `<option value="${s}">${s} — ${DESAFIOS[s].tema}</option>`
  ).join('');

  // Carrega dados da primeira semana imediatamente
  await loadFeedbackData(id, sel.value);

  // Quando mudar de semana recarrega
  sel.onchange = () => loadFeedbackData(id, sel.value);

  openModal('feedbackModal');
};

async function loadFeedbackData(analistaId, semana) {
  const linkArea = document.getElementById('fb-link-entrega');

  // Mostra loading enquanto busca
  linkArea.innerHTML = `
    <div style="background:var(--gs50);border-radius:var(--r8);
      padding:10px 12px;font-size:12px;color:var(--gs400);
      display:flex;align-items:center;gap:8px;">
      <div style="width:14px;height:14px;border:2px solid var(--gs200);
        border-top-color:var(--purple);border-radius:50%;
        animation:spin .7s linear infinite;flex-shrink:0;"></div>
      Buscando entrega no banco de dados...
    </div>`;

  try {
    // Busca sempre direto do Firestore sem cache
    const pdi  = await getPDI(analistaId);
    const item = pdi.find(p => p.semana === semana);

    // Exibe o link se existir
    if (item && item.linkEntrega && item.linkEntrega.trim() !== '') {
      linkArea.innerHTML = `
        <div style="background:var(--ok-bg);border:1px solid var(--ok);
          border-radius:var(--r8);padding:12px 14px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;
            letter-spacing:.4px;color:var(--ok);margin-bottom:6px;
            display:flex;align-items:center;gap:5px;">
            ✅ Entrega recebida — clique para abrir e corrigir
          </div>
          <a href="${item.linkEntrega}" target="_blank"
            style="color:var(--blue);font-family:var(--fm);font-size:12px;
              word-break:break-all;display:block;margin-bottom:6px;
              text-decoration:underline;line-height:1.5;">
            ${item.linkEntrega}
          </a>
          <div style="font-size:10px;color:var(--gs400);">
            Status atual da analista:
            <strong style="color:var(--gs900);">
              ${STATUS_CFG[item.status]?.label || 'A Fazer'}
            </strong>
          </div>
        </div>`;
    } else {
      linkArea.innerHTML = `
        <div style="background:var(--gs50);border:1px solid var(--gs100);
          border-radius:var(--r8);padding:10px 12px;
          font-size:12px;color:var(--gs400);">
          Nenhuma entrega enviada ainda para esta semana.
        </div>`;
    }

    // Preenche os demais campos do modal
    if (item) {
      document.getElementById('fb-status').value   = item.status || 'a_fazer';
      document.getElementById('fb-fortes').value   = item.pontosFortes || '';
      document.getElementById('fb-melhoria').value = item.pontosMelhoria || '';
      document.getElementById('fb-obs').value      = item.observacoes || '';
      buildNotaStars(item.nota || 0);
    } else {
      document.getElementById('fb-status').value   = 'a_fazer';
      document.getElementById('fb-fortes').value   = '';
      document.getElementById('fb-melhoria').value = '';
      document.getElementById('fb-obs').value      = '';
      buildNotaStars(0);
    }

  } catch (e) {
    console.error('Erro ao carregar feedback:', e);
    linkArea.innerHTML = `
      <div style="background:var(--err-bg);border:1px solid var(--err);
        border-radius:var(--r8);padding:10px 12px;
        font-size:12px;color:var(--err);">
        Erro ao buscar entrega: ${e.message}
      </div>`;
  }
}

function buildNotaStars(nota) {
  const wrap = document.getElementById('notaStars');
  wrap.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.textContent = i <= nota ? '⭐' : '☆';
    btn.onclick = () => {
      document.getElementById('fb-nota').value = i;
      buildNotaStars(i);
    };
    wrap.appendChild(btn);
  }
}

window.saveFeedback = async () => {
  const btn = document.getElementById('saveFbBtn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  const semana = document.getElementById('fb-semana').value;
  try {
    await updatePDI(editAnalistaId, semana, {
      semana,
      status:         document.getElementById('fb-status').value,
      nota:           parseInt(document.getElementById('fb-nota').value) || 0,
      pontosFortes:   document.getElementById('fb-fortes').value.trim(),
      pontosMelhoria: document.getElementById('fb-melhoria').value.trim(),
      observacoes:    document.getElementById('fb-obs').value.trim(),
    });
    closeModal('feedbackModal');
    showToast('Feedback salvo com sucesso!', 'ok');
    await loadDashboard();
  } catch (e) {
    showToast('Erro ao salvar: ' + e.message, 'err');
    console.error(e);
  }
  btn.disabled = false;
  btn.textContent = 'Salvar Feedback';
};

// ── ADD ANALISTA ──────────────────────────
window.openAddAnalista = () => openModal('addAnalistaModal');

window.createAnalista = async () => {
  const btn   = document.getElementById('addAnalistaBtn');
  const nome  = document.getElementById('an-nome').value.trim();
  const email = document.getElementById('an-email').value.trim();
  const cargo = document.getElementById('an-cargo').value.trim();
  const senha = document.getElementById('an-senha').value;
  const inicio= document.getElementById('an-inicio').value;

  if (!nome || !email || !senha) {
    showToast('Preencha nome, email e senha', 'err');
    return;
  }
  if (senha.length < 6) {
    showToast('A senha precisa ter pelo menos 6 caracteres', 'err');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Criando...';

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await createUsuario({
      nome, email, cargo,
      cor: selCorAdd,
      dataInicio: inicio,
      uid: cred.user.uid
    });
    closeModal('addAnalistaModal');
    showToast(`${nome} adicionada com sucesso!`, 'ok');
    // Limpa o formulario
    ['an-nome','an-email','an-cargo','an-senha','an-inicio'].forEach(id => {
      document.getElementById(id).value = '';
    });
    await loadDashboard();
  } catch (e) {
    showToast('Erro: ' + e.message, 'err');
    console.error(e);
  }

  btn.disabled = false;
  btn.textContent = 'Criar Analista';
};

// ── DELETE ────────────────────────────────
window.openDelete = (id, nome) => {
  deleteAnalistaId = id;
  document.getElementById('deleteAnalistaNome').textContent = nome;
  openModal('deleteModal');
};

window.confirmDelete = async () => {
  try {
    await deleteUsuario(deleteAnalistaId);
    closeModal('deleteModal');
    showToast('Analista removida', 'info');
    await loadDashboard();
  } catch (e) {
    showToast('Erro ao remover: ' + e.message, 'err');
    console.error(e);
  }
};

// ── CERTIFICADO ───────────────────────────
window.emitirCertificado = (id) => {
  window.location.href = `certificado.html?id=${id}`;
};

// ── HELPERS ───────────────────────────────
function initials(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  return p.length > 1
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : nome.substring(0, 2).toUpperCase();
}

function buildColorPicker(id, cores, cb) {
  const c = document.getElementById(id);
  if (!c) return;
  c.innerHTML = '';
  cores.forEach(col => {
    const d = document.createElement('div');
    d.className = 'color-opt' + (col === selCorAdd ? ' sel' : '');
    d.style.background = col;
    d.title = col;
    d.onclick = () => {
      c.querySelectorAll('.color-opt').forEach(x => x.classList.remove('sel'));
      d.classList.add('sel');
      cb(col);
    };
    c.appendChild(d);
  });
}

window.openModal = id =>
  document.getElementById(id).classList.add('open');

window.closeModal = id =>
  document.getElementById(id).classList.remove('open');

document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay'))
    e.target.classList.remove('open');
});

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
  setTimeout(() => el.remove(), 3800);
}
