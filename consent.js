// Basic consent mode: no Google script or request before an explicit analytics opt-in.
(() => {
 const KEY='sculptlab-consent',VERSION=1,ID='G-7BNG9RNN76';
 const denied={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
 const subscribers=new Set();
 let initialized=false,applied=null,expiryTimer=null;
 function valid(value){return value?.version===VERSION&&typeof value.analytics==='boolean'&&Number.isFinite(value.updatedAt)&&Number.isFinite(value.expiresAt)&&value.updatedAt<=Date.now()&&value.expiresAt>Date.now()&&value.expiresAt-value.updatedAt<=184*86400000}
 function read(){try{const value=JSON.parse(window.localStorage.getItem(KEY));return valid(value)?value:null}catch{return null}}
 let choice=read();
 window['ga-disable-'+ID]=true;
 function clearAnalyticsCookies(){
  const names=(document.cookie||'').split(';').map(part=>part.trim().split('=')[0]).filter(name=>name==='_ga'||name==='_ga_7BNG9RNN76');
  const host=location.hostname,domains=['',host,'.'+host];
  if(host?.endsWith('.sculptlab.fr'))domains.push('sculptlab.fr','.sculptlab.fr');
  for(const name of names)for(const domain of domains)document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax'+(domain?'; Domain='+domain:'');
 }
 function current(){if(choice&&!valid(choice))choice=null;return choice}
 function apply(){
  const allowed=current()?.analytics===true;
  window['ga-disable-'+ID]=!allowed;
  if(!allowed){
   if(initialized&&applied===true)window.gtag('consent','update',{...denied});
   if(applied!==false)clearAnalyticsCookies();
   applied=false;return;
  }
  if(applied===true)return;
  if(!initialized){
   window.dataLayer=window.dataLayer||[];
   window.gtag=function(){window.dataLayer.push(arguments)};
   window.gtag('consent','default',{...denied});
   window.gtag('js',new Date());
  }
  window.gtag('consent','update',{...denied,analytics_storage:'granted'});
  window.gtag('config',ID,{
   allow_google_signals:false,allow_ad_personalization_signals:false,
   cookie_domain:'none',cookie_path:'/',cookie_update:false,
   cookie_expires:Math.max(1,Math.floor((choice.expiresAt-Date.now())/1000))
  });
  if(!initialized){
   const script=document.createElement('script');script.async=true;
   script.src='https://www.googletagmanager.com/gtag/js?id='+ID;
   script.id='sculptlab-analytics';document.head.appendChild(script);
   initialized=true;
  }
  // GA's existing enhanced measurement handles history changes; no duplicate manual pageviews.
  applied=true;
 }
 function notify(){for(const listener of subscribers)listener(current())}
 function scheduleExpiry(){
  if(expiryTimer!==null)window.clearTimeout(expiryTimer);expiryTimer=null;
  if(!current()||typeof window.setTimeout!=='function')return;
  expiryTimer=window.setTimeout(()=>{current();apply();scheduleExpiry();notify()},Math.min(choice.expiresAt-Date.now()+1,2147483647));
 }
 function save(analytics){
  const now=Date.now(),end=new Date(now);end.setUTCMonth(end.getUTCMonth()+6);
  choice={version:VERSION,analytics:analytics===true,updatedAt:now,expiresAt:end.getTime()};
  try{window.localStorage.setItem(KEY,JSON.stringify(choice))}catch{}
  apply();scheduleExpiry();notify();
 }
 window.sculptlabConsent={getChoice:()=>current()?{...choice}:null,save,start(){apply();scheduleExpiry()},onChange(fn){subscribers.add(fn);return()=>subscribers.delete(fn)}};
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){choice=read();apply();scheduleExpiry();notify()}});
})();
