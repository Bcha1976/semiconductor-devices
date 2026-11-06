// Semiconductor Devices Physics website v2: navigator, reading progress, section filter, interactives loader.
(function(){
  var side=document.getElementById('side'), menu=document.getElementById('menu'), veil=document.getElementById('veil');
  function close(){side.classList.remove('open');document.body.style.overflow='';}
  if(menu&&side){
    menu.onclick=function(){side.classList.add('open');document.body.style.overflow='hidden';};
    side.querySelector('.side-close').onclick=close;
    if(veil)veil.onclick=close;
    side.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.hash&&a.pathname===location.pathname)close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  }
  // in a chapter button, the title follows the link and the arrow folds
  [].forEach.call(document.querySelectorAll('.nc summary .nc-a'),function(a){
    a.addEventListener('click',function(e){e.stopPropagation();});
  });

  var inner=side&&side.querySelector('.side-in'), on=side&&side.querySelector('.nc.on');
  if(inner&&on){inner.scrollTop=Math.max(0,on.offsetTop-110);}

  // reading progress + current section
  var bar=document.getElementById('readbar'), prog=document.getElementById('prog'), progtxt=document.getElementById('progtxt');
  var links=[].slice.call(document.querySelectorAll('.nc.on .toc a'));
  var map={};links.forEach(function(a){map[decodeURIComponent(a.hash.slice(1))]=a;});
  var heads=[].slice.call(document.querySelectorAll('.course h2[id], .course .coursepart[id]')).filter(function(h){return map[h.id];});
  var last=null;
  function upd(){
    var d=document.documentElement, max=d.scrollHeight-window.innerHeight, f=max>0?Math.min(1,window.scrollY/max):0;
    if(bar)bar.style.width=(f*100)+'%';
    if(prog)prog.style.width=(f*100)+'%';
    if(progtxt)progtxt.textContent=Math.round(f*100)+'%';
    if(!heads.length)return;
    var y=140,cur=null;
    for(var i=0;i<heads.length;i++){if(heads[i].getBoundingClientRect().top<=y)cur=heads[i];}
    if(cur!==last){
      links.forEach(function(a){a.classList.remove('cur');});
      if(cur){var a=map[cur.id];a.classList.add('cur');
        if(inner&&window.innerWidth>980){var r=a.getBoundingClientRect(),R=inner.getBoundingClientRect();
          if(r.top<R.top+60||r.bottom>R.bottom-20)inner.scrollTop+=r.top-R.top-R.height/3;}}
      last=cur;
    }
  }
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();

  // filter the navigator
  var filt=document.getElementById('filter');
  if(filt){
    var chaps=[].slice.call(side.querySelectorAll('.chaps>.nc'));
    var saved=chaps.map(function(li){var d=li.querySelector('details');return d?d.open:false;});
    var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');};
    filt.addEventListener('input',function(){
      var q=norm(filt.value.trim());
      chaps.forEach(function(li,k){
        var d=li.querySelector('details'), items=[].slice.call(li.querySelectorAll('.toc li'));
        if(!q){li.classList.remove('hide');items.forEach(function(x){x.classList.remove('hide');});if(d)d.open=saved[k];return;}
        var any=false;
        items.forEach(function(x){if(x.classList.contains('tp'))return;
          var ok=norm(x.textContent).indexOf(q)>=0;x.classList.toggle('hide',!ok);if(ok)any=true;});
        items.forEach(function(x){if(!x.classList.contains('tp'))return;
          var self=norm(x.querySelector('.tp-h').textContent).indexOf(q)>=0;
          if(self)[].forEach.call(x.querySelectorAll('li'),function(y){y.classList.remove('hide');});
          var vis=self||[].some.call(x.querySelectorAll('li'),function(y){return !y.classList.contains('hide');});
          x.classList.toggle('hide',!vis);if(vis)any=true;});
        var hit=any||norm(li.querySelector('.nc-t').textContent).indexOf(q)>=0;
        li.classList.toggle('hide',!hit);
        if(d)d.open=any;
      });
    });
  }

  // exercises: open / fold all
  [].forEach.call(document.querySelectorAll('.ex-tools .tbtn'),function(b){
    b.onclick=function(){var open=b.getAttribute('data-act')==='open';
      [].forEach.call(document.querySelectorAll('.exo details'),function(d){d.open=open;});};
  });
  // open a folded block when a link points inside it
  function reveal(){if(!location.hash)return;var t=null;try{t=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch(e){}
    while(t){if(t.tagName==='DETAILS')t.open=true;t=t.parentElement;}}
  window.addEventListener('hashchange',reveal);reveal();

  // long inline formulas: scroll sideways inside the column
  function fit(){[].forEach.call(document.querySelectorAll('.course .katex'),function(k){
    if(k.parentElement.classList.contains('katex-display'))return;
    k.classList.remove('wide');var c=k.closest('p,li,td,div');if(!c)return;
    if(k.getBoundingClientRect().width>c.getBoundingClientRect().width)k.classList.add('wide');});}
  window.addEventListener('load',fit);window.addEventListener('resize',fit);

  // interactives: mount when they come near the screen
  var boxes=[].slice.call(document.querySelectorAll('.ix[data-ix]'));
  function mount(el){
    if(el.getAttribute('data-mounted'))return;var id=el.getAttribute('data-ix');
    if(!(window.IX&&window.IX[id]))return;
    el.setAttribute('data-mounted','1');el.innerHTML='';
    var keep=anchorKeep();
    try{window.IX[id](el);}catch(e){el.innerHTML='<div class="ix-loading">This interactive could not start.</div>';if(window.console)console.error(e);}
  }
  boxes.forEach(function(el){el.innerHTML='<div class="ix-loading">Loading the interactive…</div>';});
  // keep a #hash target in place while interactives above it grow (first seconds after load)
  var t0=Date.now(), userMoved=false;
  ['wheel','touchstart','keydown','mousedown'].forEach(function(ev){window.addEventListener(ev,function(){userMoved=true;},{passive:true});});
  function anchorKeep(){
    if(!location.hash||userMoved||Date.now()-t0>6000)return null;
    var t=null;try{t=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch(e){}
    if(!t)return null;
    setTimeout(function(){document.documentElement.style.scrollBehavior='auto';t.scrollIntoView();document.documentElement.style.scrollBehavior='';},60);
    return t;
  }
  function start(){
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){mount(e.target);io.unobserve(e.target);}});},{rootMargin:'600px 0px'});
      boxes.forEach(function(el){io.observe(el);});
    }else boxes.forEach(mount);
  }
  if(document.readyState==='complete')start();else window.addEventListener('load',start);
})();
