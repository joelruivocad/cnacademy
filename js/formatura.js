import { getUsuarios, getPDI } from './crud.js';

window.addEventListener('load', async () => {
  const usuarios = (await getUsuarios()).filter(u => u.tipo==='analista' && u.ativo!==false);
  const grid = document.getElementById('formandasGrid');
  if(!usuarios.length){ grid.innerHTML='<div class="loading-msg">Nenhuma formanda ainda.</div>'; return; }
  grid.innerHTML = '';
  for(const u of usuarios) {
    const pdi = await getPDI(u.id);
    const concluidas = pdi.filter(p=>p.status==='concluido').length;
    const notas = pdi.filter(p=>p.nota>0).map(p=>p.nota);
    const media = notas.length ? (notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(1) : '—';
    const pct = Math.round(concluidas/12*100);
    const stars = media !== '—' ? '⭐'.repeat(Math.round(parseFloat(media))) : '';
    grid.innerHTML += `
      <div class="formanda-card">
        <div style="position:absolute;top:0;left:0;right:0;height:4px;border-radius:20px 20px 0 0;background:${u.cor||'#FC4807'};"></div>
        <div class="formanda-av" style="background:${u.cor||'#FC4807'}">${initials(u.nome)}</div>
        <div class="formanda-name">${u.nome}</div>
        <div class="formanda-cargo">${u.cargo||''}</div>
        <div class="formanda-nota-media" style="color:${u.cor||'#FC4807'}">${media} ${stars}</div>
        <div class="formanda-nota-lbl">Media geral</div>
        <div class="prog-bar-wrap" style="margin:12px 0;">
          <div class="prog-label"><span>${concluidas}/12 semanas</span><span>${pct}%</span></div>
          <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
        </div>
        <a href="certificado.html?id=${u.id}" class="btn btn-grad" style="width:100%;justify-content:center;margin-top:4px;text-decoration:none;">
          🎓 Ver Certificado
        </a>
      </div>`;
  }
  gerarConfetti();
});

function initials(nome){ const p=nome.trim().split(' '); return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():nome.substring(0,2).toUpperCase(); }

function gerarConfetti(){
  const wrap = document.getElementById('confetti');
  if(!wrap) return;
  const emojis = ['⭐','✨','🌟','💫','👼','😇','🎓','🏆'];
  for(let i=0;i<30;i++){
    const el = document.createElement('div');
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    el.style.cssText = `
      position:absolute;font-size:${16+Math.random()*24}px;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      opacity:${0.3+Math.random()*0.7};
      animation:float ${3+Math.random()*4}s ease-in-out ${Math.random()*3}s infinite alternate;
      pointer-events:none;`;
    wrap.appendChild(el);
  }
}
