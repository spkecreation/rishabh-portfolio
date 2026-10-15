const gallery = document.querySelector('#gallery');
const entries = [];
for (const [category, prefix, count, label] of [['graphic','graphic',6,'Graphic design'],['motion','motion',4,'Motion study'],['motion','product',2,'Product film'],['3d','3d',7,'3D study'],['ui','ui',3,'Interface study']]) {
  for(let i=1;i<=count;i++) entries.push({category,prefix,id:String(i).padStart(2,'0'),title:`${label} / ${String(i).padStart(2,'0')}`});
}
entries.forEach(item=>{
 const video=item.category==='motion'; const base=`assets/imported/${item.prefix}-${item.id}`;
 const article=document.createElement('article'); article.className='gallery-item';article.dataset.category=item.category;
  article.innerHTML=`<button aria-label="${video?'Play':'Enlarge'} ${item.title}">${video?`<video autoplay muted playsinline loop poster="${base}-poster.jpg" src="${base}.mp4" preload="none" aria-hidden="true"></video><span class="video-play" aria-hidden="true">▷</span>`:`<img src="${base}.jpg" alt="${item.title} by Rishabh Raj" loading="lazy" decoding="async">`}</button><h3>${item.title}</h3><p>${{graphic:'GRAPHIC DESIGN',motion:item.prefix==='product'?'PRODUCT ANIMATION':'MOTION DESIGN','3d':'3D EXPLORATION',ui:'INTERFACE DESIGN'}[item.category]}</p>`;
 article.querySelector('button').addEventListener('click',()=>{
  const media=document.createElement(video?'video':'img');media.src=base+(video?'.mp4':'.png');
   if(video){media.controls=true;media.muted=true;media.defaultMuted=true;media.playsInline=true;media.autoplay=true;media.loop=true;}
   else{media.alt=item.title;}
   document.querySelector('#viewer-content').replaceChildren(media);document.querySelector('#viewer-caption').textContent=item.title;document.querySelector('#viewer').showModal();
   if(video)media.play().catch(()=>{});
 });gallery.append(article);
});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  let count=0;document.querySelectorAll('.gallery-item').forEach(el=>{el.hidden=button.dataset.filter!=='all'&&el.dataset.category!==button.dataset.filter;if(!el.hidden)count++;});
  document.querySelector('#work-count').textContent=`${count} explorations`;
  window.portfolioMotion?.refresh();
 }));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>dialog.querySelectorAll('video').forEach(v=>v.pause()));
});
const menu=document.querySelector('.menu-toggle'),links=document.querySelector('#nav-links');
if(menu&&links){
  menu.addEventListener('click',()=>{
    const open=links.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
    menu.textContent=open?'Close ✕':'Menu ☰';
  });
  links.querySelectorAll('a, button').forEach(el=>el.addEventListener('click',()=>{
    links.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    menu.textContent='Menu ☰';
  }));
  document.addEventListener('click',e=>{
    if(links.classList.contains('open')&&!menu.contains(e.target)&&!links.contains(e.target)){
      links.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.textContent='Menu ☰';
    }
  });
}
document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>{
 const resume=b.dataset.info==='resume';document.querySelector('#info-title').textContent=resume?'Résumé coming soon.':'Let’s stay in touch.';
 document.querySelector('#info-copy').textContent=resume?'My résumé will be available here soon. In the meantime, explore my selected work and design approach.':'My direct contact details are being updated. You can find my latest work and updates on my current portfolio.';
 document.querySelector('#info-dialog').showModal();
}));
