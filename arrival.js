// One brief apparition per session. The page stays usable throughout.
(() => {
 const root=document.documentElement,key='sculptlab-arrival-seen';
 const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let played=false,active=null,bootTimer=null;
 const isHome=()=>/^\/(?:fr\/?|en\/?|premiere\/?)?$/.test(location.pathname);
 const supported=()=>Boolean(window.CSS?.supports('clip-path','ellipse(75% 75% at 50% 50%)'));
 function seen(){try{return played||window.sessionStorage.getItem(key)==='1'}catch{return played}}
 function remember(){played=true;try{window.sessionStorage.setItem(key,'1')}catch{}}
 function finish(){
  if(bootTimer!==null)window.clearTimeout(bootTimer);bootTimer=null;
  if(active){
   window.clearTimeout(active.timer);
   active.image.removeEventListener('load',active.reveal);
   active.image.removeEventListener('error',finish);
   active=null;
  }
  root.classList?.remove('arrival-pending','arrival-playing');
 }
 function start(){
  finish();
  if(!isHome()||seen()||motion?.matches||!supported()||location.hash||window.scrollY>80||document.hidden)return;
  const image=document.querySelector('.hero-art');
  if(!image)return;
  remember();
  root.classList.add('arrival-pending');
  const state={image,timer:null,reveal:null};active=state;
  state.reveal=()=>{
   if(active!==state)return;
   window.clearTimeout(state.timer);
   image.removeEventListener('load',state.reveal);
   image.removeEventListener('error',finish);
   if(motion?.matches||document.hidden){finish();return}
   root.classList.remove('arrival-pending');root.classList.add('arrival-playing');
   state.timer=window.setTimeout(finish,1450);
  };
  if(image.complete&&image.naturalWidth>0)state.reveal();
  else{
   image.addEventListener('load',state.reveal,{once:true});
   image.addEventListener('error',finish,{once:true});
   state.timer=window.setTimeout(finish,700);
  }
 }
 window.sculptlabArrival={start,finish};
 if(isHome()&&!seen()&&!motion?.matches&&supported()&&!location.hash){
  root.classList.add('arrival-pending');
  // If the application cannot initialise, the static page reveals itself.
  bootTimer=window.setTimeout(finish,2200);
 }
 for(const event of ['pointerdown','touchstart','wheel','keydown'])document.addEventListener(event,finish,{passive:true});
 window.addEventListener('scroll',finish,{passive:true});
 window.addEventListener('pageshow',event=>{if(event.persisted)finish()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
 motion?.addEventListener('change',()=>{if(motion.matches)finish()});
})();
