(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Reveal small pieces when they enter view, including newly filtered cards.
  const targets = document.querySelectorAll('.about>*,.approach li,.work>.eyebrow,.work>h2,.work>.muted,.projects article,.project-note,.play,.archive>.eyebrow,.archive-heading,.filters,.gallery-item,.contact,footer,.detail>.eyebrow,.detail>h1,.detail>.detail-lead,.detail>video,.detail-grid>h2,.detail-grid>div>p,.detail-grid li,.detail-grid .text-link');
  const reveal = 'IntersectionObserver' in window ? new IntersectionObserver(items => items.forEach(({target,isIntersecting}) => {
    if (isIntersecting) { target.classList.add('is-visible'); reveal.unobserve(target); }
  }), {threshold: .08}) : null;
  targets.forEach((el,i) => { el.classList.add('motion-enter'); el.style.setProperty('--stagger',`${i % 3 * 65}ms`); if (reveal) reveal.observe(el); else el.classList.add('is-visible'); });

  // Muting is necessary for browser autoplay. Offscreen media saves bandwidth.
  const visible = video => { const r=video.getBoundingClientRect(); return !video.closest('[hidden]') && r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth; };
  const syncVideo = video => {
    video.muted=true; video.defaultMuted=true; video.loop=true; video.playsInline=true; video.autoplay=true;
    if (!document.hidden && visible(video)) video.play().catch(()=>{});
    else video.pause();
  };
  const videos = document.querySelectorAll('video');
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(items => items.forEach(({target}) => syncVideo(target)),{threshold:[0,.15]}) : null;
  videos.forEach(v => { syncVideo(v); videoObserver?.observe(v); });
  const refresh = () => {
    document.querySelectorAll('video').forEach(syncVideo);
    document.querySelectorAll('.gallery-item:not([hidden])').forEach((el,i)=>{
      if (!reduced.matches) el.animate([{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:420,delay:i%3*45,easing:'ease-out'});
    });
  };
  window.portfolioMotion={refresh};
  document.addEventListener('visibilitychange',()=>document.querySelectorAll('video').forEach(syncVideo));
  reduced.addEventListener('change',()=>{if(reduced.matches) targets.forEach(el=>el.classList.add('is-visible')); document.querySelectorAll('video').forEach(syncVideo);});

  const canvas=document.querySelector('.intro');
  if (canvas) {
    const toolbar=document.createElement('div'); toolbar.className='desk-tools';
    toolbar.innerHTML='<span>Make yourself at home. Drag things around ↗</span><button type="button">Reset desk ↺</button>';
    canvas.append(toolbar);
    const help=document.createElement('p'); help.id='desk-help';help.className='desk-help';help.textContent='Drag to move. Or use arrow keys; Shift moves faster. Home restores this object. Reset desk restores everything.';canvas.append(help);
    let layer=6;
    const isMobile=()=>window.matchMedia('(max-width:700px)').matches;
    const getTargetObjects=()=>isMobile()?[...canvas.querySelectorAll('.sticky,.role,.pin,.pencil,.camera')]:[...canvas.querySelectorAll('h1,.sticky,.role,.pin,.pencil,.camera,.who')];
    const objects=getTargetObjects();
    const states=objects.map((el,i)=>{
      const state={el,x:0,y:0,pointer:null,frame:0,isDragging:false};
      el.classList.add('desk-object');el.tabIndex=0;el.setAttribute('aria-describedby','desk-help');el.style.setProperty('--arrival',`${.2+i*.09}s`);
      if(el.matches('.pin,.pencil')) {el.removeAttribute('aria-hidden');el.setAttribute('aria-label',el.matches('.pin')?'Move the pin':'Move the pencil');el.setAttribute('role','img');}
      el.addEventListener('dragstart',e=>e.preventDefault());
      const paint=()=>{el.style.setProperty('--drag-x',`${state.x}px`);el.style.setProperty('--drag-y',`${state.y}px`);};
      const move=(x,y)=>{
        const r=el.getBoundingClientRect(), c=canvas.getBoundingClientRect();
        // Keep a reachable portion of even oversized artwork on the desk.
        state.x=Math.max(c.left-r.right+state.x+48,Math.min(x,c.right-r.left+state.x-48));
        state.y=Math.max(c.top-r.bottom+state.y+48,Math.min(y,c.bottom-r.top+state.y-48));paint();
      };
      el.addEventListener('pointerdown',e=>{
        if(e.button!==0 || state.pointer!==null)return;
        state.pointer=e.pointerId;state.startX=e.clientX;state.startY=e.clientY;state.baseX=state.x;state.baseY=state.y;state.vx=0;state.vy=0;state.last=performance.now();state.isDragging=false;
        if(e.pointerType!=='touch'){
          cancelAnimationFrame(state.frame);el.classList.add('was-moved','is-dragging');el.style.zIndex=String(++layer);
          el.setPointerCapture(e.pointerId);el.focus({preventScroll:true});e.preventDefault();
        }
      });
      el.addEventListener('pointermove',e=>{
        if(e.pointerId!==state.pointer)return;
        const dx=e.clientX-state.startX, dy=e.clientY-state.startY;
        if(e.pointerType==='touch'&&!state.isDragging){
          if(Math.hypot(dx,dy)>8){
            state.isDragging=true;cancelAnimationFrame(state.frame);el.classList.add('was-moved','is-dragging');el.style.zIndex=String(++layer);
            try{el.setPointerCapture(e.pointerId);}catch(_){}
          }else{return;}
        }
        const oldX=state.x,oldY=state.y,now=performance.now(),dt=Math.max(8,now-state.last);
        move(state.baseX+dx,state.baseY+dy);
        state.vx=(state.x-oldX)/dt;state.vy=(state.y-oldY)/dt;state.last=now;
      });
      const finish=e=>{
        if(e.pointerId!==state.pointer)return;
        const wasDragging=state.isDragging||e.pointerType!=='touch';
        state.pointer=null;state.isDragging=false;el.classList.remove('is-dragging');
        if(el.hasPointerCapture(e.pointerId)){try{el.releasePointerCapture(e.pointerId);}catch(_){}}
        if(!wasDragging||reduced.matches||e.type!=='pointerup'||performance.now()-state.last>100)return;
        let vx=Math.max(-2,Math.min(2,state.vx))*12,vy=Math.max(-2,Math.min(2,state.vy))*12;
        const glide=()=>{vx*=.84;vy*=.84;move(state.x+vx,state.y+vy);if(Math.abs(vx)+Math.abs(vy)>.25)state.frame=requestAnimationFrame(glide);};state.frame=requestAnimationFrame(glide);
      };
      ['pointerup','pointercancel','lostpointercapture'].forEach(name=>el.addEventListener(name,finish));
      state.reset=()=>{cancelAnimationFrame(state.frame);state.pointer=null;state.isDragging=false;state.x=state.y=0;el.classList.remove('was-moved','is-dragging');el.style.zIndex='';paint();};
      el.addEventListener('keydown',e=>{
        const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
        if(e.key==='Home'){e.preventDefault();state.reset();return;}
        if(!steps[e.key])return;e.preventDefault();cancelAnimationFrame(state.frame);el.classList.add('was-moved');el.style.zIndex=String(++layer);
        const [x,y]=steps[e.key],step=e.shiftKey?30:10;move(state.x+x*step,state.y+y*step);
      });return state;
    });
    // Start only after the hero artwork and fonts can actually be painted.
    const artwork=[...canvas.querySelectorAll('img')].map(img=>img.decode?.());
    Promise.race([
      Promise.allSettled([...artwork, document.fonts.ready]),
      new Promise(resolve=>setTimeout(resolve,1800))
    ]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      canvas.classList.add('arrival-ready');
    })));
    toolbar.querySelector('button').addEventListener('click',()=>states.forEach(s=>s.reset()));
    window.addEventListener('resize',()=>states.forEach(s=>s.reset()));
  }
  document.querySelectorAll('a[href$=".html"]').forEach(link=>link.addEventListener('click',e=>{
    if(reduced.matches||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0||link.target)return;
    e.preventDefault();document.body.classList.add('page-away');setTimeout(()=>location.assign(link.href),180);
  }));
  window.addEventListener('pageshow',()=>document.body.classList.remove('page-away'));
})();
