// Sidebar on small screens, current-section highlight.
(function(){
  var side=document.getElementById('side'), menu=document.getElementById('menu');
  if(menu&&side){menu.onclick=function(){side.classList.add('open')};
    side.querySelector('.side-close').onclick=function(){side.classList.remove('open')};
    side.addEventListener('click',function(e){if(e.target.tagName==='A')side.classList.remove('open')});}
  var links=[].slice.call(document.querySelectorAll('.toc a'));
  if(!links.length||!('IntersectionObserver' in window))return;
  var map={};links.forEach(function(a){map[decodeURIComponent(a.hash.slice(1))]=a});
  var heads=[].slice.call(document.querySelectorAll('.course h2[id]')).filter(function(h){return map[h.id]});
  function upd(){var y=window.scrollY+120,cur=null;heads.forEach(function(h){if(h.offsetTop<=y)cur=h});
    links.forEach(function(a){a.classList.remove('cur')});if(cur)map[cur.id].classList.add('cur');}
  window.addEventListener('scroll',upd,{passive:true});upd();
})();
// Long inline formulas: let them scroll sideways inside the text column instead of widening the page.
(function(){
  function fit(){[].forEach.call(document.querySelectorAll('.course .katex'),function(k){
    if(k.parentElement.classList.contains('katex-display'))return;
    k.classList.remove('wide');var c=k.closest('p,li,td,div');if(!c)return;
    if(k.getBoundingClientRect().width>c.getBoundingClientRect().width)k.classList.add('wide');});}
  window.addEventListener('load',fit);window.addEventListener('resize',fit);
})();
