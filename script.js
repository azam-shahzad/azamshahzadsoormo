
const cats={games:{title:"Games",icon:"🎮",cls:"games"},websites:{title:"Websites",icon:"🖥️",cls:"websites"},logos:{title:"Logos",icon:"✒️",cls:"logos2"},branding:{title:"Branding",icon:"🏷️",cls:"branding"}};
const projects=[{id:"fashion",cat:"games",title:"Fashion Game",sub:"Mobile Game • UI/Art",cover:"assets/images/games/fashion/cover.jpg",fallback:"👗",play:"",imgs:["assets/images/games/fashion/01.jpg","assets/images/games/fashion/02.jpg","assets/images/games/fashion/03.jpg","assets/images/games/fashion/04.jpg"]},{id:"racing",cat:"games",title:"Car Racing Game",sub:"Racing Game • UI/Art",cover:"assets/images/games/car-racing/cover.jpg",fallback:"🏎️",play:"",imgs:["assets/images/games/car-racing/01.jpg","assets/images/games/car-racing/02.jpg","assets/images/games/car-racing/03.jpg","assets/images/games/car-racing/04.jpg"]},{id:"casual",cat:"games",title:"Casual Game UI",sub:"Mobile Game • UI/UX",cover:"assets/images/games/casual-ui/cover.jpg",fallback:"🎲",play:"",imgs:["assets/images/games/casual-ui/01.jpg","assets/images/games/casual-ui/02.jpg"]},{id:"web1",cat:"websites",title:"Creative Website",sub:"Website Design",cover:"assets/images/websites/website-01/cover.jpg",fallback:"🌐",imgs:["assets/images/websites/website-01/01.jpg","assets/images/websites/website-01/02.jpg"]},{id:"logo1",cat:"logos",title:"Logo Collection",sub:"Logo Design",cover:"assets/images/logos/logo-01/cover.jpg",fallback:"✒️",imgs:["assets/images/logos/logo-01/01.jpg","assets/images/logos/logo-01/02.jpg"]},{id:"brand1",cat:"branding",title:"Brand Identity",sub:"Branding",cover:"assets/images/branding/branding-01/cover.jpg",fallback:"🛍️",imgs:["assets/images/branding/branding-01/01.jpg","assets/images/branding/branding-01/02.jpg"]}];
document.querySelector("#cats").innerHTML=Object.entries(cats).map(([k,c])=>`<button class="catcard reveal" data-cat="${k}"><div class="catart ${c.cls}">${c.icon}</div><div class="catinfo">${c.title.toUpperCase()}<span>→</span></div></button>`).join("");
let activeCat="games",pi=0,ii=0,scale=1,x=0,y=0,drag=false,sx=0,sy=0;
const cat=document.querySelector("#category"),viewer=document.querySelector("#viewer"),grid=document.querySelector("#projects"),img=document.querySelector("#vimg"),missing=document.querySelector("#missing");
const catBack=document.querySelector("#catBack"),catClose=document.querySelector("#catClose"),
projectBack=document.querySelector("#projectBack"),vclose=document.querySelector("#vclose"),
next=document.querySelector("#next"),prev=document.querySelector("#prev"),
nextProject=document.querySelector("#nextProject"),prevProject=document.querySelector("#prevProject"),
vtitle=document.querySelector("#vtitle"),count=document.querySelector("#count"),play=document.querySelector("#play"),
viewport=document.querySelector("#viewport"),plus=document.querySelector("#plus"),minus=document.querySelector("#minus");


function replayCategoryCards(){
  const cards=[...grid.querySelectorAll(".project")];
  cards.forEach((b,i)=>{
    b.classList.remove("project-clicked","project-enter");
    b.style.setProperty("--delay",(i*150)+"ms");
  });
  /* force browser to forget the previous animation state */
  void grid.offsetWidth;
  requestAnimationFrame(()=>{
    cards.forEach(b=>b.classList.add("project-enter"));
  });
}

function openCat(k){
activeCat=k;
document.querySelector("#catTitle").textContent=cats[k].title+" Projects";
document.querySelector("#catIntro").textContent="Select a project thumbnail to view the complete project gallery.";
let list=projects.filter(p=>p.cat===k);
grid.innerHTML=list.map(p=>`<article class="project project-enter" data-project="${p.id}" tabindex="0" role="button">
<div class="project-media">
  <div class="pthumb"><img src="${p.cover}" alt="${p.title}" onerror="this.remove();this.parentElement.innerHTML='<span class=&quot;project-fallback&quot;>${p.fallback}</span>'"></div>
  <span class="project-badge">${cats[p.cat].title}</span>
</div>
<div class="project-card-body">
  <div class="project-heading">
    <span class="project-round-icon">${p.fallback}</span>
    <div class="project-name"><b>${p.title}</b><small>${p.sub}</small></div>
  </div>
  <p class="project-desc">${p.cat==='games'?'Game UI, visual design and mobile experience project.':p.cat==='websites'?'Creative website design and responsive visual experience.':p.cat==='logos'?'Logo design, identity exploration and presentation.':'Brand identity, visual system and presentation design.'}</p>
  <div class="project-actions">
    <button type="button" class="project-view" data-open="${p.id}">View Project <span>↗</span></button>
    ${p.cat==='games' ? `<a class="project-live ${p.play?'':'is-disabled'}" ${p.play?`href="${p.play}" target="_blank" rel="noopener"`:`href="#" aria-disabled="true"`}>Play Store <span>▶</span></a>` : ''}
  </div>
</div>
</article>`).join("");

grid.querySelectorAll("[data-project]").forEach((b,i)=>{
  b.style.setProperty("--delay",(i*150)+"ms");
  const openCard=()=>{
    if(b.classList.contains("project-clicked")) return;
    b.classList.add("project-clicked");
    setTimeout(()=>openProject(b.dataset.project),360);
  };
  b.onclick=(e)=>{
    const live=e.target.closest(".project-live");
    if(live){ e.stopPropagation(); if(live.classList.contains("is-disabled")) e.preventDefault(); return; }
    openCard();
  };
  b.onkeydown=(e)=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();openCard();} };
});

cat.classList.add("open");
document.body.style.overflow="hidden";

/* restart entrance animation every time this category is opened */
replayCategoryCards();
}
document.addEventListener("click",e=>{let b=e.target.closest("[data-cat]");if(b){e.preventDefault();openCat(b.dataset.cat)}});function closeCat(){cat.classList.remove("open");document.body.style.overflow=""}catBack.onclick=closeCat;catClose.onclick=closeCat;
function list(){return projects.filter(p=>p.cat===activeCat)}function openProject(id){pi=list().findIndex(p=>p.id===id);ii=0;reset(false);viewer.classList.add("open");render()}function render(){let p=list()[pi],src=p.imgs[ii];vtitle.textContent=p.title;
if(infoTitle)infoTitle.textContent=p.title;
if(infoSub)infoSub.textContent=p.sub||cats[p.cat].title;
if(infoDesc)infoDesc.textContent=p.cat==="games"?"Game UI, visual design and mobile experience project.":p.cat==="websites"?"Creative website design and responsive visual experience.":p.cat==="logos"?"Logo design, identity exploration and presentation.":"Brand identity, visual system and presentation design.";
count.textContent=`${String(ii+1).padStart(2,"0")} / ${String(p.imgs.length).padStart(2,"0")}`;if(p.cat==="games"&&p.play){play.href=p.play;play.classList.remove("hide")}else play.classList.add("hide");missing.style.display="none";img.style.display="block";img.onerror=()=>{img.style.display="none";missing.style.display="grid";missing.innerHTML=`Add project image:<br><b>${src}</b>`};img.src=src;apply()}function closeV(){
viewer.classList.remove("open");
/* When returning to the category screen, clear the clicked/glow state
   and replay the wave animation from card 1. */
setTimeout(replayCategoryCards,80);
}projectBack.onclick=closeV;vclose.onclick=closeV;next.onclick=()=>{ii=(ii+1)%list()[pi].imgs.length;reset(false);render()};prev.onclick=()=>{ii=(ii-1+list()[pi].imgs.length)%list()[pi].imgs.length;reset(false);render()};nextProject.onclick=()=>{pi=(pi+1)%list().length;ii=0;reset(false);render()};prevProject.onclick=()=>{pi=(pi-1+list().length)%list().length;ii=0;reset(false);render()};
function apply(){img.style.transform=`translate(${x}px,${y}px) scale(${scale})`;reset.textContent=Math.round(scale*100)+"%"}function zoom(d){scale=Math.max(.5,Math.min(4,scale+d));apply()}function resetZ(doit=true){scale=1;x=y=0;if(doit)apply()}window.reset=resetZ;plus.onclick=()=>zoom(.25);minus.onclick=()=>zoom(-.25);document.querySelector("#reset").onclick=()=>resetZ();viewport.addEventListener("wheel",e=>{e.preventDefault();zoom(e.deltaY<0?.15:-.15)},{passive:false});viewport.onpointerdown=e=>{drag=true;sx=e.clientX-x;sy=e.clientY-y};viewport.onpointermove=e=>{if(drag&&scale>1){x=e.clientX-sx;y=e.clientY-sy;apply()}};viewport.onpointerup=()=>drag=false;
const revealEls=[...document.querySelectorAll(".reveal")];
function revealVisible(){revealEls.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<window.innerHeight*1.08)el.classList.add("show")})}
if("IntersectionObserver" in window){
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("show")}),{threshold:.05});
 revealEls.forEach(e=>obs.observe(e));
 revealVisible();
 window.addEventListener("load",revealVisible,{once:true});
}else{revealEls.forEach(e=>e.classList.add("show"))}document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(viewer.classList.contains("open"))closeV();else if(cat.classList.contains("open"))closeCat()}});
function setDockActive(el){document.querySelectorAll(".dock>a,.dock>button").forEach(x=>x.classList.remove("active"));if(el)el.classList.add("active")}
document.querySelectorAll(".dock [data-cat]").forEach(b=>b.addEventListener("click",()=>setDockActive(b)));
document.querySelectorAll('.dock a[href="#home"]').forEach(a=>a.addEventListener("click",()=>setDockActive(a)));
document.querySelectorAll('.dock a[href="#contact"]').forEach(a=>a.addEventListener("click",()=>setDockActive(a)));


/* ===== v2.4 FEATURED BANNERS =====
   Upload the banner files below. Each banner can open a project.
   projectId must match a project id in the projects array. */
const featuredBanners=[
 {src:"assets/images/banners/banner-01.jpg"},
 {src:"assets/images/banners/banner-02.jpg"},
 {src:"assets/images/banners/banner-03.jpg"},
 {src:"assets/images/banners/banner-04.jpg"}
];
let liveBanners=[],featuredIndex=0,featuredTimer=null;
const featuredImage=document.querySelector("#bannerImage");
const featuredFallback=document.querySelector("#bannerFallback");
const featuredDots=document.querySelector("#bannerDots");
const featuredLink=document.querySelector("#bannerProjectLink");

async function featuredBannerInit(){
 const checks=featuredBanners.map(item=>new Promise(resolve=>{
   const test=new Image();test.onload=()=>resolve(item);test.onerror=()=>resolve(null);test.src=item.src;
 }));
 liveBanners=(await Promise.all(checks)).filter(Boolean);
 if(!liveBanners.length){
   featuredImage.style.display="none";if(featuredFallback)featuredFallback.style.display="flex";
   document.querySelector("#prevBanner").style.display="none";document.querySelector("#nextBanner").style.display="none";
   return;
 }
 featuredImage.style.display="block";if(featuredFallback)featuredFallback.style.display="none";
 featuredDots.innerHTML=liveBanners.map((_,i)=>`<button class="banner-dot ${i===0?"active":""}" data-featured="${i}" aria-label="Featured banner ${i+1}"></button>`).join("");
 featuredDots.querySelectorAll("[data-featured]").forEach(b=>b.onclick=e=>{e.stopPropagation();featuredShow(+b.dataset.featured,true)});
 if(liveBanners.length===1){document.querySelector("#prevBanner").style.display="none";document.querySelector("#nextBanner").style.display="none"}
 featuredShow(0,false);featuredStart();
}
function featuredShow(i,restart=true){
 if(!liveBanners.length)return;
 featuredIndex=(i+liveBanners.length)%liveBanners.length;
 featuredImage.classList.add("changing");
 setTimeout(()=>{featuredImage.src=liveBanners[featuredIndex].src;featuredImage.onload=()=>featuredImage.classList.remove("changing")},130);
 featuredDots.querySelectorAll(".banner-dot").forEach((d,n)=>d.classList.toggle("active",n===featuredIndex));
 if(restart)featuredStart();
}
function featuredStart(){clearInterval(featuredTimer);if(liveBanners.length>1)featuredTimer=setInterval(()=>featuredShow(featuredIndex+1,false),5000)}
document.querySelector("#prevBanner").addEventListener("click",e=>{e.stopPropagation();featuredShow(featuredIndex-1,true)});
document.querySelector("#nextBanner").addEventListener("click",e=>{e.stopPropagation();featuredShow(featuredIndex+1,true)});
featuredLink.addEventListener("click",()=>{const work=document.querySelector("#work");if(work)work.scrollIntoView({behavior:"smooth",block:"start"});});
featuredBannerInit();

if(document.querySelector("#gridBack"))document.querySelector("#gridBack").onclick=()=>document.querySelector("#projectBack").click();

/* v2.6.24 — replay Explore My Work card entrance every time section re-enters viewport */
(() => {
  const cards=[...document.querySelectorAll('.catgrid > a')];
  if(!cards.length) return;
  cards.forEach((card,i)=>{
    card.classList.add('scroll-anim-ready');
    card.style.transitionDelay=`${i*80}ms`;
  });
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const card=entry.target;
      if(entry.isIntersecting){
        requestAnimationFrame(()=>card.classList.add('scroll-anim-in'));
      }else{
        card.classList.remove('scroll-anim-in');
      }
    });
  },{threshold:.22,rootMargin:'0px 0px -6% 0px'});
  cards.forEach(card=>io.observe(card));
})();

/* v2.6.24 — robust smooth scrolling for top Option 7 links */
(() => {
 document.querySelectorAll('.option7-nav a[href^="#"]').forEach(a=>{
   a.addEventListener('click',e=>{
     const id=a.getAttribute('href').slice(1);
     const target=document.getElementById(id);
     if(!target) return;
     e.preventDefault();
     target.scrollIntoView({behavior:'smooth',block:'start'});
     history.replaceState(null,'','#'+id);
   });
 });
})();
