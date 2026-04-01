import { getUsuarios, getPDI, updatePDI, createUsuario, deleteUsuario, DESAFIOS, MODULOS, STATUS_CFG } from './crud.js';
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const CORES = ['#FC4807','#FF1493','#00CC88','#CC0044','#007CC5','#7C5CCC','#D4940E','#00A700'];
let usuarios = [], selCorAdd = '#FC4807', editAnalistaId = null, deleteAnalistaId = null;

// INIT
window.addEventListener('load', async () => {
  await loadDashboard();
  buildColorPicker('colorPicker', CORES, c => selCorAdd = c);
});

async function loadDashboard() {
  try {
    usuarios = (await getUsuarios()).filter(u => u.tipo === 'analista' && u.ativo !== false);
    await renderKPIs();
    await renderAnalistas();
  } catch(e) { showToast('Erro ao carregar dados','err'); }
}

async function renderKPIs() {
  const total = usuarios.length;
  let totalConcluidos = 0, totalSemanas = 0;
  for(const u of usuarios) {
    const pdi = await getPDI(u.id);
    totalConcluidos += pdi.filter(p => p.status === 'concluido').length;
    totalSemanas += 12;
  }
  const pct = totalSemanas > 0 ? Math.round(totalConcluidos/totalSemanas*100) : 0;
  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi"><div class="kpi-ico">👼</div><div class="kpi-val" style="color:var(--purple)">${total}</div><div class="kpi-lbl">Analistas</div></div>
    <div class="kpi"><div class="kpi-ico">✅</div><div class="kpi-val" style="color:var(--ok)">${totalConcluidos}</div><div class="kpi-lbl">Semanas Concluidas</div></div>
    <div class="kpi"><div class="kpi-ico">📊</div><div class="kpi-val" style="color:var(--brand)">${pct}%</div><div class="kpi-lbl">Progresso Geral</div></div>
    <div class="kpi"><div class="kpi-ico">🎓</div><div class="kpi-val" style="color:var(--warn)">${usuarios.filter(u=>u.formada).length}</div><div class="kpi-lbl">Formandas</div></div>
  `;
}

async function renderAnalistas() {
  const grid = document.getElementById('analistasGrid');
  if(!usuarios.length){ grid.innerHTML='<div class="loading-msg">Nenhuma analista cadastrada ainda.</div>'; return; }
  grid.innerHTML = '';
  for(const u of usuarios) {
    const pdi = await getPDI(u.id);
    const concluidas = pdi.filter(p=>p.status==='concluido').length;
    const pct = Math.round(concluidas/12*100);
    const card = document.createElement('div');
    card.className = 'analista-card';
    card.innerHTML = `
      <div class="analista-card-bar" style="background:${u.cor||'#FC4807'};"></div>
      <div class="analista-card-hd">
        <div class="analista-av" style="background:${u.cor||'#FC4807'}">${initials(u.nome)}</div>
        <div>
          <div class="analista-name">${u.nome}</div>
          <div class="analista-cargo">${u.cargo||''}</div>
        </div>
        <div class="analista-actions">
          <button class="btn btn-sec btn-sm" onclick="openFeedback('${u.id}','${u.nome}')">Feedback</button>
          <button class="btn btn-sec btn-sm" onclick="emitirCertificado('${u.id}')">Cert.</button>
          <button class="btn btn-err btn-sm" onclick="openDelete('${u.id}','${u.nome}')">✕</button>
        </div>
      </div>
      <div class="prog-bar-wrap">
        <div class="prog-label"><span>${concluidas}/12 semanas concluidas</span><span>${pct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="analista-card-ft">
        ${Object.keys(DESAFIOS).map((s,i)=>{
          const item = pdi.find(p=>p.semana===s);
          const st = item ? item.status : 'a_fazer';
          const cfg = STATUS_CFG[st]||STATUS_CFG.a_fazer;
          return `<div class="semana-dot" style="background:${cfg.color};color:${cfg.text};" title="${s}: ${cfg.label}">${i+1}</div>`;
        }).join('')}
      </div>
    `;
    grid.appendChild(card);
  }
}

// FEEDBACK MODAL
window.openFeedback = (id, nome) => {
  editAnalistaId = id;
  document.getElementById('fb-analista-nome').textContent = nome;
  const sel = document.getElementById('fb-semana');
  sel.innerHTML = Object.keys(DESAFIOS).map(s=>`<option value="${s}">${s} — ${DESAFIOS[s].tema}</option>`).join('');
  sel.onchange = () => loadFeedbackData(id, sel.value);
  loadFeedbackData(id, sel.value);
  buildNotaStars(0);
  openModal('feedbackModal');
};

async function loadFeedbackData(analistaId, semana) {
  const pdi = await getPDI(analistaId);
  const item = pdi.find(p=>p.semana===semana);
  if(item) {
    document.getElementById('fb-status').value = item.status || 'a_fazer';
    document.getElementById('fb-fortes').value = item.pontosFortes || '';
    document.getElementById('fb-melhoria').value = item.pontosMelhoria || '';
    document.getElementById('fb-obs').value = item.observacoes || '';
    buildNotaStars(item.nota || 0);
  } else {
    document.getElementById('fb-status').value = 'a_fazer';
    document.getElementById('fb-fortes').value = '';
    document.getElementById('fb-melhoria').value = '';
    document.getElementById('fb-obs').value = '';
    buildNotaStars(0);
  }
}

function buildNotaStars(nota) {
  const wrap = document.getElementById('notaStars');
  wrap.innerHTML = '';
  for(let i=1;i<=5;i++) {
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
  btn.disabled=true; btn.textContent='Salvando...';
  const semana = document.getElementById('fb-semana').value;
  try {
    await updatePDI(editAnalistaId, semana, {
      semana,
      status:          document.getElementById('fb-status').value,
      nota:            parseInt(document.getElementById('fb-nota').value)||0,
      pontosFortes:    document.getElementById('fb-fortes').value.trim(),
      pontosMelhoria:  document.getElementById('fb-melhoria').value.trim(),
      observacoes:     document.getElementById('fb-obs').value.trim(),
    });
    closeModal('feedbackModal');
    showToast('Feedback salvo!','ok');
    await renderAnalistas();
  } catch(e) { showToast('Erro ao salvar','err'); }
  btn.disabled=false; btn.textContent='Salvar Feedback';
};

// ADD ANALISTA
window.openAddAnalista = () => openModal('addAnalistaModal');
window.createAnalista = async () => {
  const btn = document.getElementById('addAnalistaBtn');
  const nome  = document.getElementById('an-nome').value.trim();
  const email = document.getElementById('an-email').value.trim();
  const cargo = document.getElementById('an-cargo').value.trim();
  const senha = document.getElementById('an-senha').value;
  const inicio= document.getElementById('an-inicio').value;
  if(!nome||!email||!senha){ showToast('Preencha todos os campos','err'); return; }
  btn.disabled=true; btn.textContent='Criando...';
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await createUsuario({ nome, email, cargo, cor:selCorAdd, dataInicio:inicio, uid:cred.user.uid });
    closeModal('addAnalistaModal');
    showToast(`${nome} adicionada!`,'ok');
    await loadDashboard();
  } catch(e){ showToast('Erro: '+e.message,'err'); }
  btn.disabled=false; btn.textContent='Criar Analista';
};

// DELETE
window.openDelete = (id, nome) => {
  deleteAnalistaId = id;
  document.getElementById('deleteAnalistaNome').textContent = nome;
  openModal('deleteModal');
};
window.confirmDelete = async () => {
  try {
    await deleteUsuario(deleteAnalistaId);
    closeModal('deleteModal');
    showToast('Analista removida','info');
    await loadDashboard();
  } catch(e){ showToast('Erro ao remover','err'); }
};

// CERTIFICADO
window.emitirCertificado = (id) => {
  window.location.href = `certificado.html?id=${id}`;
};

// HELPERS
function initials(nome){ if(!nome)return'?'; const p=nome.trim().split(' '); return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():nome.substring(0,2).toUpperCase(); }
function buildColorPicker(id, cores, cb){
  const c=document.getElementById(id); if(!c)return; c.innerHTML='';
  cores.forEach(col=>{ const d=document.createElement('div'); d.className='color-opt'+(col===selCorAdd?' sel':''); d.style.background=col; d.onclick=()=>{ c.querySelectorAll('.color-opt').forEach(x=>x.classList.remove('sel')); d.classList.add('sel'); cb(col); }; c.appendChild(d); });
}
window.openModal  = id => document.getElementById(id).classList.add('open');
window.closeModal = id => document.getElementById(id).classList.remove('open');
document.addEventListener('click',e=>{ if(e.target.classList.contains('overlay')) e.target.classList.remove('open'); });
function showToast(msg,t='info'){
  let wrap=document.querySelector('.toast-wrap'); if(!wrap){wrap=document.createElement('div');wrap.className='toast-wrap';document.body.appendChild(wrap);}
  const el=document.createElement('div'); el.className=`toast t-${t}`; el.textContent=msg; wrap.appendChild(el); setTimeout(()=>el.remove(),3500);
}
