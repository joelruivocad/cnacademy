// Stars background — compartilhado entre todas as paginas
(function(){
  const s = document.getElementById('stars');
  if(!s) return;
  for(let i=0;i<30;i++){
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', Math.random()*100+'%');
    c.setAttribute('cy', Math.random()*50+'%');
    c.setAttribute('r',  Math.random()*1.5+.4);
    c.setAttribute('fill','#F5C842');
    c.style.animation = `twinkle ${1.2+Math.random()*2.5}s ease-in-out ${Math.random()*3}s infinite alternate`;
    s.appendChild(c);
  }
})();
