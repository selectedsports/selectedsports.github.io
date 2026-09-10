const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LoginScreens-BwKYq4v8.js","assets/vendor-react-BSyO9dFN.js","assets/PhotoCropModal-DdHvfe5v.js","assets/vendor-supabase-BUgTx0zs.js","assets/AdminPortal-ByYJjtIO.js","assets/indianStatesCities-CBX8Li9T.js","assets/PlayerPortal-B6rrYiEM.js","assets/ProPortal-DvebQrAM.js","assets/PublicInvitePage-BImWn8lJ.js","assets/PublicAuctionView-DcpLalR1.js","assets/PublicAuctionRegister-D4LE-g6e.js","assets/TeamOwnerView-CNJnwn96.js"])))=>i.map(i=>d[i]);
import{a7 as x,a1 as He,W as we,_ as _e,a6 as i,Q as Ye,a4 as be,y as Ve,d as Ze,b as Ke,U as Je,P as Xe,i as ue,C as Qe,g as et,X as tt,B as pe,j as xe,V as ee,s as at,O as nt,r as rt,a as ot,I as it,f as fe,a5 as st,R as lt}from"./vendor-react-BSyO9dFN.js";import{c as ct}from"./vendor-supabase-BUgTx0zs.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=a(r);fetch(r.href,s)}})();const dt="modulepreload",ut=function(e){return"/"+e},me={},I=function(t,a,n){let r=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));r=Promise.allSettled(a.map(d=>{if(d=ut(d),d in me)return;me[d]=!0;const p=d.endsWith(".css"),u=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${u}`))return;const m=document.createElement("link");if(m.rel=p?"stylesheet":dt,p||(m.as="script"),m.crossOrigin="",m.href=d,c&&m.setAttribute("nonce",c),document.head.appendChild(m),p)return new Promise((_,h)=>{m.addEventListener("load",_),m.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(l){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=l,window.dispatchEvent(c),!c.defaultPrevented)throw l}return r.then(l=>{for(const c of l||[])c.status==="rejected"&&s(c.reason);return t().catch(s)})};function pt(e=900){const[t,a]=x.useState(()=>window.innerWidth<=e);return x.useEffect(()=>{const n=()=>a(window.innerWidth<=e);return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[e]),t}const ft="https://vsuemsmjbkrciidbvmfj.supabase.co",mt="sb_publishable_CXzyHivaMP9h5IfZYqu7fw_bALpjwuq",o=ct(ft,mt);function Y(e){if(!e)return null;const t=new Date(e),a=new Date;let n=a.getFullYear()-t.getFullYear();return a.getMonth()>t.getMonth()||a.getMonth()===t.getMonth()&&a.getDate()>=t.getDate()||n--,n<19?"Under 19":null}async function ne(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10),{data:a,error:n}=await o.from("players").select("id, phone");if(n)throw n;return(a||[]).some(r=>(r.phone||"").replace(/[^0-9]/g,"").slice(-10)===t)}async function gt(e,t){const a=e.name.split(".").pop(),r=`profile-photos/${(t||"anon").replace(/[^0-9]/g,"")}-${Date.now()}.${a}`,{error:s}=await o.storage.from("team-assets").upload(r,e,{upsert:!0});if(s)throw s;const{data:l}=o.storage.from("team-assets").getPublicUrl(r);return l.publicUrl}async function ht(e,t,a){const n=e.name.split(".").pop(),r=(a||"anon").replace(/[^0-9]/g,""),s=`payment-receipts/${t||"auc"}-${r}-${Date.now()}.${n}`,{error:l}=await o.storage.from("team-assets").upload(s,e,{upsert:!0});if(l)throw l;const{data:c}=o.storage.from("team-assets").getPublicUrl(s);return c.publicUrl}async function V(e,t,a){try{await o.from("activity_log").insert({actor_player_id:e||null,action:t,summary:a})}catch{}}async function yt(e=8){const{data:t,error:a}=await o.from("activity_log").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function U(e,t){try{await o.from("notifications").insert({type:e,message:t})}catch{}}async function wt(e=20){const{data:t,error:a}=await o.from("notifications").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function _t(){const{count:e,error:t}=await o.from("notifications").select("id",{count:"exact",head:!0}).eq("read",!1);if(t)throw t;return e||0}async function bt(e){const{error:t}=await o.from("notifications").update({read:!0}).eq("id",e);if(t)throw t}async function xt(){const{error:e}=await o.from("notifications").update({read:!0}).eq("read",!1);if(e)throw e}async function Ft(){const{data:e,error:t}=await o.from("players").select("*").order("name");if(t)throw t;return e}async function re(e,t,a="1234",n=null,r=null,s=null,l={}){if(await ne(t))throw new Error("This phone number is already registered.");const c=Y(r),{data:d,error:p}=await o.from("players").insert({name:e,phone:t,pin:a,created_by:n,birth_date:r||null,profile_image_url:s||null,category:c,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,registration_source:l.source||"direct"}).select().single();if(p)throw p;return d&&d.approved===!1&&await U("player_pending",`${e} registered and is awaiting approval`),d}async function vt(e){const{data:t,error:a}=await o.from("players").select("*").eq("created_by",e).order("name");if(a)throw a;return t}async function St(e,t,a,n,r,s={}){const l={name:t,phone:a,pin:n,city:r};s.birthDate!==void 0&&(l.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(l.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(l.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(l.jersey_size=s.jerseySize||null);const{error:c}=await o.from("players").update(l).eq("id",e);if(c)throw c}async function jt(e){const{error:t}=await o.from("players").delete().eq("id",e);if(t)throw t}async function Pt(){const{data:e,error:t}=await o.from("grounds").select("*").order("name");if(t)throw t;return e}async function Ct(e,t,a,n){const{data:r,error:s}=await o.from("grounds").insert({name:e,location:t,maps_link:a,notes:n}).select().single();if(s)throw s;return r}async function At(e,t){const{error:a}=await o.from("grounds").update(t).eq("id",e);if(a)throw a}async function kt(e){const{error:t}=await o.from("grounds").delete().eq("id",e);if(t)throw t}async function zt(){const{data:e,error:t}=await o.from("teams").select("*").order("name");if(t)throw t;return e}async function Et(e,t){const{data:a,error:n}=await o.from("teams").insert({name:e,logo_url:t}).select().single();if(n)throw n;return a}async function qt(e,t,a){const{error:n}=await o.from("teams").update({name:t,logo_url:a}).eq("id",e);if(n)throw n}async function $t(e){const{error:t}=await o.from("teams").delete().eq("id",e);if(t)throw t}async function oe(e,t){const a=e.name.split(".").pop(),n=`team-logos/${t.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:r}=await o.storage.from("team-assets").upload(n,e,{upsert:!0});if(r)throw r;const{data:s}=o.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function Fe(){const{data:e,error:t}=await o.from("matches").select("*").order("date",{ascending:!1});if(t)throw t;return e}async function Rt(e){const{data:t,error:a}=await o.from("matches").select("*").eq("invite_token",e).single();if(a)throw a;return t}async function Bt({date:e,time_slot:t,ground:a,team:n,team_logo:r,our_team:s,our_team_logo:l,type:c,max_players:d,created_by:p,visibility:u}){const{data:m,error:_}=await o.from("matches").insert({date:e,time_slot:t,ground:a,team:n,team_logo:r,our_team:s||null,our_team_logo:l||null,type:c,max_players:d,created_by:p||null,status:"upcoming",link_active:!1,visibility:u||"private"}).select().single();if(_)throw _;let h="Someone";if(p){const{data:g}=await o.from("players").select("name").eq("id",p).maybeSingle();g!=null&&g.name&&(h=g.name)}const f=s?`${s} vs ${n}`:n;return await V(p,"match_created",`${h} created ${f}`),m}async function Tt(e){await o.from("match_players").delete().eq("match_id",e),await o.from("expenses").delete().eq("match_id",e),await o.from("payments").delete().eq("match_id",e),await o.from("chat_messages").delete().eq("match_id",e),await o.from("public_responses").delete().eq("match_id",e);const{error:t}=await o.from("matches").delete().eq("id",e);if(t)throw t}async function It(e,t){const{error:a}=await o.from("matches").update({status:t}).eq("id",e);if(a)throw a;if(t==="completed"){const{data:n}=await o.from("matches").select("team, our_team").eq("id",e).maybeSingle();n&&await V(null,"match_completed",`Match completed: ${n.our_team?`${n.our_team} vs ${n.team}`:n.team}`)}}async function Dt(e,t){const{error:a}=await o.from("matches").update({max_players:t}).eq("id",e);if(a)throw a}async function Lt(e,t){const{error:a}=await o.from("matches").update({link_active:t}).eq("id",e);if(a)throw a}async function ve(e){const{data:t,error:a}=await o.from("match_players").select("*, players(id, name, phone, role)").eq("match_id",e).order("responded_at",{ascending:!0,nullsFirst:!1});if(a)throw a;return t}async function Mt(e,t,a){let n=a||"confirmed",r=!1,s=null;if(n==="confirmed"){const{data:c}=await o.from("matches").select("max_players, team, date").eq("id",e).single();s=c;const d=(c==null?void 0:c.max_players)||0;if(d>0){const{data:p}=await o.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!p||p.status!=="confirmed"){const{count:u}=await o.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(u||0)>=d?n="waitlist":(u||0)+1===d&&(r=!0)}}}const{error:l}=await o.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(l)throw l;if(r&&n==="confirmed"&&s)try{const{data:c}=await o.from("match_players").select("player_id").eq("match_id",e).eq("status","confirmed"),d=(c||[]).map(u=>u.player_id),p=`🔒 Squad full for ${s.team} on ${s.date}! See you there 🏏[[match:${e}]]`;await Promise.all(d.map(u=>Se(u,"System",p).catch(()=>{})))}catch{}return n}async function Nt(e,t){const{error:a}=await o.from("match_players").upsert({match_id:e,player_id:t,status:"pending"},{onConflict:"match_id,player_id"});if(a)throw a}async function Ot(e,t){const{error:a}=await o.from("match_players").delete().eq("match_id",e).eq("player_id",t);if(a)throw a;await ie(e)}async function Wt(e,t,a){let n=a;if(a==="confirmed"){const{data:s}=await o.from("matches").select("max_players").eq("id",e).single(),l=(s==null?void 0:s.max_players)||0;if(l>0){const{data:c}=await o.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!c||c.status!=="confirmed"){const{count:d}=await o.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(d||0)>=l&&(n="waitlist")}}}const{error:r}=await o.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(r)throw r;return a!=="confirmed"&&await ie(e),n}async function Ut(e){const{data:t,error:a}=await o.from("public_responses").select("*").eq("match_id",e).order("created_at");if(a)throw a;return t}async function Gt(e,t,a,n){const{data:r}=await o.from("public_responses").select("id").eq("match_id",e).ilike("name",t.trim()).maybeSingle();if(r){const{error:c}=await o.from("public_responses").update({availability:n,phone:a,approved:null}).eq("id",r.id);if(c)throw c;return{updated:!0}}const{data:s,error:l}=await o.from("public_responses").insert({match_id:e,name:t.trim(),phone:(a==null?void 0:a.trim())||null,availability:n,approved:null}).select().single();if(l)throw l;return s}async function Ht(e,t,a,n,r){const{data:s}=await o.from("match_players").select("id").eq("match_id",t).eq("status","confirmed"),c=((s==null?void 0:s.length)||0)>=r;let d=null;const{data:p}=await o.from("players").select("*").ilike("name",a.trim()).maybeSingle();if(p)d=p,n&&!p.phone&&await o.from("players").update({phone:n}).eq("id",p.id);else{const{data:_,error:h}=await o.from("players").insert({name:a.trim(),phone:(n==null?void 0:n.trim())||null,pin:"1234"}).select().single();if(h)throw h;d=_}const u=c?"waitlist":"confirmed";await o.from("match_players").upsert({match_id:t,player_id:d.id,status:u,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});const{error:m}=await o.from("public_responses").update({approved:!0,player_id:d.id}).eq("id",e);if(m)throw m;return{player:d,status:u}}async function Yt(e){const{error:t}=await o.from("public_responses").update({approved:!1}).eq("id",e);if(t)throw t}async function Vt(e){const{data:t,error:a}=await o.from("expenses").select("*").eq("match_id",e);if(a)throw a;return t}async function Zt(e,t,a){const{data:n,error:r}=await o.from("expenses").insert({match_id:e,label:t,amount:a}).select().single();if(r)throw r;return n}async function Kt(e){const{error:t}=await o.from("expenses").delete().eq("id",e);if(t)throw t}async function Jt(e){const{data:t,error:a}=await o.from("payments").select("*").eq("match_id",e);if(a)throw a;return t}async function Xt(e,t,a){const{error:n}=await o.from("payments").upsert({match_id:e,player_id:t,paid:a},{onConflict:"match_id,player_id"});if(n)throw n}async function Qt(e){const{data:t,error:a}=await o.from("chat_messages").select("*").eq("match_id",e).order("sent_at");if(a)throw a;return t}async function ea(e,t,a){const{data:n,error:r}=await o.from("chat_messages").insert({match_id:e,sender:t,message:a}).select().single();if(r)throw r;return n}function ta(e,t){return o.channel("chat:"+e).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:`match_id=eq.${e}`},a=>t(a.new)).subscribe()}async function Z(){const{data:e,error:t}=await o.from("settings").select("*");if(t)throw t;return Object.fromEntries((e||[]).map(a=>[a.key,a.value]))}async function T(e,t){const{error:a}=await o.from("settings").upsert({key:e,value:t},{onConflict:"key"});if(a)throw a}async function aa(e,t,a,n=null,r=null,s={}){if(await ne(t))throw new Error("This phone number is already registered.");const l=Y(n),{data:c,error:d}=await o.from("players").insert({name:e,phone:t,pin:a,approved:!0,birth_date:n||null,profile_image_url:r||null,category:l,city:s.city||null,jersey_number:s.jerseyNumber||null,jersey_size:s.jerseySize||null,registration_source:"direct"}).select().single();if(d)throw d;return c}async function na(){const{data:e,error:t}=await o.from("players").select("*").eq("approved",!1).order("id",{ascending:!1});if(t)throw t;return e}async function ra(e){const{error:t}=await o.from("players").update({approved:!0}).eq("id",e);if(t)throw t;const{data:a}=await o.from("players").select("name").eq("id",e).maybeSingle();a!=null&&a.name&&await V(null,"player_approved",`${a.name} was approved`)}async function oa(e){const{error:t}=await o.from("players").delete().eq("id",e);if(t)throw t}async function ia(e){const{data:t,error:a}=await o.from("contributions").select("*").eq("player_id",e).order("date",{ascending:!1});if(a)throw a;return t}async function sa(e,t,a,n,r){const{data:s,error:l}=await o.from("contributions").insert({player_id:e,amount:t,note:a||null,date:n||new Date().toISOString().split("T")[0],match_id:r||null}).select().single();if(l)throw l;return s}async function la(e){const{error:t}=await o.from("contributions").delete().eq("id",e);if(t)throw t}async function ca(e,t){if(!t)return!1;const{data:a}=await o.from("contributions").select("id").eq("player_id",e).eq("match_id",t).maybeSingle();return!!a}async function da(){const[e,t,a]=await Promise.all([o.from("matches").select("id",{count:"exact",head:!0}),o.from("players").select("id",{count:"exact",head:!0}),o.from("grounds").select("id",{count:"exact",head:!0})]);return{matches:e.count||0,players:t.count||0,venues:a.count||0}}async function ua(e){const{data:t}=await o.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);let n=0;if(a.length>0){const{data:s}=await o.from("match_players").select("player_id").in("match_id",a);n=new Set((s||[]).map(l=>l.player_id)).size}const{count:r}=await o.from("grounds").select("id",{count:"exact",head:!0});return{matches:a.length,players:n,venues:r||0}}async function pa(e){const{data:t,error:a}=await o.from("match_players").select("status, matches(id, date, time_slot, ground, team, our_team, status, type)").eq("player_id",e).eq("status","confirmed");if(a)throw a;return(t||[]).map(n=>n.matches).filter(Boolean).sort((n,r)=>new Date(r.date)-new Date(n.date))}async function fa(e){const{data:t}=await o.from("match_players").select("match_id, status").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(r=>r.match_id);let n=0;if(a.length>0){const{data:r}=await o.from("matches").select("ground").in("id",a);n=new Set((r||[]).map(s=>s.ground).filter(Boolean)).size}return{matches:a.length,venues:n}}async function ma(e){if(!e||e.length===0)return{};const{data:t}=await o.from("match_players").select("match_id, status").in("match_id",e).eq("status","confirmed"),a={};return(t||[]).forEach(n=>{a[n.match_id]=(a[n.match_id]||0)+1}),a}async function ie(e){const{data:t}=await o.from("matches").select("max_players").eq("id",e).single(),a=(t==null?void 0:t.max_players)||0;if(a<=0)return null;const{count:n}=await o.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");if((n||0)>=a)return null;const{data:r}=await o.from("match_players").select("player_id").eq("match_id",e).eq("status","waitlist").order("responded_at",{ascending:!0,nullsFirst:!1}).limit(1);if(!r||r.length===0)return null;const s=r[0].player_id;return await o.from("match_players").update({status:"confirmed"}).eq("match_id",e).eq("player_id",s),s}async function ga(e){const{data:t}=await o.from("matches").select("id, date").eq("created_by",e),a=(t||[]).map(d=>d.id);if(a.length===0)return[];const n=Object.fromEntries((t||[]).map(d=>[d.id,d.date])),{data:r}=await o.from("match_players").select("match_id, player_id, status, players(id, name, phone, city)").in("match_id",a),{data:s}=await o.from("contributions").select("player_id, amount").in("match_id",a),l={};(s||[]).forEach(d=>{l[d.player_id]=(l[d.player_id]||0)+Number(d.amount)});const c={};return(r||[]).forEach(d=>{const p=d.players;if(p)if(c[p.id]||(c[p.id]={id:p.id,name:p.name,phone:p.phone,city:p.city,played:0,confirmed:0,declined:0,contributed:0,lastPlayedDate:null}),d.status==="confirmed"){c[p.id].confirmed++,c[p.id].played++;const u=n[d.match_id];u&&(!c[p.id].lastPlayedDate||u>c[p.id].lastPlayedDate)&&(c[p.id].lastPlayedDate=u)}else d.status==="declined"&&c[p.id].declined++}),Object.values(c).forEach(d=>{d.contributed=l[d.id]||0}),Object.values(c).sort((d,p)=>p.played-d.played)}async function ha(e){const[{data:t,error:a},{data:n,error:r}]=await Promise.all([o.from("match_players").select("status, matches(*)").eq("player_id",e),o.from("matches").select("*").eq("visibility","public").eq("status","upcoming")]);if(a)throw a;if(r)throw r;const s=(t||[]).filter(d=>d.matches).map(d=>({match:d.matches,myStatus:d.status})),l=new Set(s.map(d=>d.match.id)),c=(n||[]).filter(d=>!l.has(d.id)).map(d=>({match:d,myStatus:"pending"}));return[...s,...c]}async function ya(e,t){const{error:a}=await o.from("players").update({upi_id:t}).eq("id",e);if(a)throw a}async function wa(e){try{if(e!=null&&e.created_by){const{data:t}=await o.from("players").select("upi_id").eq("id",e.created_by).maybeSingle();if(t!=null&&t.upi_id)return t.upi_id}}catch{}try{const t=await Z();return(t==null?void 0:t.upi)||(t==null?void 0:t.upi_id)||""}catch{return""}}async function Se(e,t,a){const{error:n}=await o.from("admin_messages").insert({player_id:e,sender:t,message:a});if(n)throw n}async function _a(){const{data:e,error:t}=await o.from("admin_messages").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function ba(e){const{data:t,error:a}=await o.from("admin_messages").select("*").or(`player_id.eq.${e},player_id.is.null`).order("created_at",{ascending:!1});if(a)throw a;return t}async function xa(e){const{count:t,error:a}=await o.from("admin_messages").select("id",{count:"exact",head:!0}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(a)throw a;return t||0}async function Fa(e){const{error:t}=await o.from("admin_messages").update({read_at:new Date().toISOString()}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(t)throw t}async function je(){const{data:e,error:t}=await o.from("match_players").select("player_id, status, created_at, players(id, name, city, role), matches!inner(status, date, team, our_team)").eq("status","confirmed").eq("matches.status","completed");if(t)throw t;return e||[]}async function Pe(e){const{data:t,error:a}=await o.from("pro_requests").insert({player_id:e,status:"pending"}).select().single();if(a)throw a;const{data:n}=await o.from("players").select("name").eq("id",e).maybeSingle();return n!=null&&n.name&&await U("pro_request",`${n.name} requested Pro access`),t}async function Ce(e){const{error:t}=await o.from("pro_requests").delete().eq("id",e);if(t)throw t}async function Ae(e){const{data:t,error:a}=await o.from("pro_requests").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(a)throw a;return t}async function va(){const{data:e,error:t}=await o.from("pro_requests").select("*, players(id, name, phone)").eq("status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function Sa(e,t){const a=new Date(Date.now()+5184e6).toISOString().slice(0,10),{error:n}=await o.from("players").update({role:"pro",subscription_expiry:a}).eq("id",t);if(n)throw n;const{error:r}=await o.from("pro_requests").update({status:"approved",decided_at:new Date().toISOString()}).eq("id",e);if(r)throw r}async function ja(e){const{error:t}=await o.from("pro_requests").update({status:"rejected",decided_at:new Date().toISOString()}).eq("id",e);if(t)throw t}async function Pa(e=5){const{data:t,error:a}=await o.from("players").select("name, city, id").order("id",{ascending:!1}).limit(e);if(a)throw a;return t}async function Ca(e){const{data:t}=await o.from("match_players").select("match_id").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(d=>d.match_id);if(a.length===0)return[];const{data:n}=await o.from("matches").select("ground").in("id",a),r=Array.from(new Set((n||[]).map(d=>d.ground).filter(Boolean)));if(r.length===0)return[];const{data:s}=await o.from("grounds").select("id, name, location").in("name",r),l=new Set((s||[]).map(d=>d.name)),c=r.filter(d=>!l.has(d)).map(d=>({id:d,name:d,location:""}));return[...s||[],...c]}async function ke(e,t,a){const{error:n}=await o.from("direct_messages").insert({sender_id:e,recipient_id:t,message:a});if(n)throw n}async function Aa(e,t){const{data:a,error:n}=await o.from("direct_messages").select("*").or(`and(sender_id.eq.${e},recipient_id.eq.${t}),and(sender_id.eq.${t},recipient_id.eq.${e})`).order("created_at",{ascending:!0});if(n)throw n;return a}async function ka(e){const{data:t,error:a}=await o.from("direct_messages").select("*, sender:sender_id(id,name), recipient:recipient_id(id,name)").or(`sender_id.eq.${e},recipient_id.eq.${e}`).order("created_at",{ascending:!1});if(a)throw a;const n={};return(t||[]).forEach(r=>{var c,d;const s=r.sender_id===e?r.recipient_id:r.sender_id,l=(r.sender_id===e?(c=r.recipient)==null?void 0:c.name:(d=r.sender)==null?void 0:d.name)||"Player";n[s]||(n[s]={otherId:s,otherName:l,lastMessage:r.message,lastAt:r.created_at,unread:0}),r.recipient_id===e&&!r.read_at&&n[s].unread++}),Object.values(n).sort((r,s)=>new Date(s.lastAt)-new Date(r.lastAt))}async function za(e,t){const{error:a}=await o.from("direct_messages").update({read_at:new Date().toISOString()}).eq("recipient_id",e).eq("sender_id",t).is("read_at",null);if(a)throw a}async function Ea(e){const{count:t,error:a}=await o.from("direct_messages").select("id",{count:"exact",head:!0}).eq("recipient_id",e).is("read_at",null);if(a)throw a;return t||0}async function qa(e){const{data:t}=await o.from("players").select("id, name, role").eq("role","admin"),{data:a}=await o.from("match_players").select("status, matches(created_by)").eq("player_id",e).eq("status","confirmed"),n=Array.from(new Set((a||[]).map(l=>{var c;return(c=l.matches)==null?void 0:c.created_by}).filter(Boolean)));let r=[];if(n.length>0){const{data:l}=await o.from("players").select("id, name, role").in("id",n).eq("role","pro");r=l||[]}const s=new Map;return[...t||[],...r].forEach(l=>s.set(l.id,l)),Array.from(s.values())}async function $a(e){const{data:t}=await o.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);if(a.length===0)return[];const{data:n}=await o.from("match_players").select("player_id, status, players(id, name)").in("match_id",a).eq("status","confirmed"),r=new Map;return(n||[]).forEach(s=>{s.players&&!r.has(s.player_id)&&r.set(s.player_id,s.players)}),Array.from(r.values())}async function ze(){const{count:e,error:t}=await o.from("players").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ee(){const{data:e,error:t}=await o.from("players").select("id").eq("role","admin").limit(1).maybeSingle();if(t)throw t;return(e==null?void 0:e.id)||null}async function Ra(e,t,a){const{error:n}=await o.from("feedback").insert({player_id:e,sender_name:t,message:a});if(n)throw n}async function Ba(){const{data:e,error:t}=await o.from("feedback").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Ta(e){const t=(e||"").trim();if(!t)return{players:[],teams:[],grounds:[],matches:[]};const[a,n,r,s]=await Promise.all([o.from("players").select("id, name, city, role").ilike("name",`%${t}%`).limit(5),o.from("teams").select("id, name").ilike("name",`%${t}%`).limit(5),o.from("grounds").select("id, name, location").ilike("name",`%${t}%`).limit(5),o.from("matches").select("id, team, our_team, ground, date, status").ilike("team",`%${t}%`).limit(5)]);return{players:a.data||[],teams:n.data||[],grounds:r.data||[],matches:s.data||[]}}async function qe(){const{count:e,error:t}=await o.from("matches").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function $e(){const{count:e,error:t}=await o.from("teams").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ia(e,t){const a=(t.phone||"").replace(/[^0-9]/g,"").slice(-10);if(await Re(a,e))return null;const r=Y(t.birth_date),s=await G(e),{data:l,error:c}=await o.from("auction_players").insert({name:t.name,phone:a,status:"registered",auction_id:e,birth_date:t.birth_date||null,profile_image_url:t.profile_image_url||null,category:r,city:t.city||null,jersey_number:t.jersey_number||null,jersey_size:t.jersey_size||null,base_price:s}).select().single();if(c)throw c;return l}async function G(e){if(!e)return null;const{data:t}=await o.from("auctions").select("points_purse").eq("id",e).maybeSingle();return t!=null&&t.points_purse?Math.round(t.points_purse/100):null}async function Da(e,t,a,n=null,r=null,s=null,l={}){var _,h;const c=Y(n),d=await G(s),p={name:e,phone:t,playing_role:a,status:"registered",birth_date:n||null,profile_image_url:r||null,category:c,auction_id:s||null,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,base_price:d};l.paymentScreenshotUrl&&(p.payment_screenshot_url=l.paymentScreenshotUrl),l.paymentStatus&&(p.payment_status=l.paymentStatus);let{data:u,error:m}=await o.from("auction_players").insert(p).select().single();if(m&&((_=m.message)!=null&&_.includes("payment_screenshot_url")||(h=m.message)!=null&&h.includes("payment_status"))){console.warn("Retrying registerAuctionPlayer without payment columns:",m.message),delete p.payment_screenshot_url,delete p.payment_status;const f=await o.from("auction_players").insert(p).select().single();if(f.error)throw f.error;u=f.data}else if(m)throw m;await U("auction_registration",`${e} registered for the auction`);try{await re(e,t,"1234",null,n,r,{...l,source:"auction"})}catch(f){console.error("Failed to sync auction registrant into main player roster:",f)}return u}async function La(e,t){const{error:a}=await o.from("auction_players").update({payment_status:t}).eq("id",e);if(a)throw a}async function se(e=null){let t=o.from("auction_players").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;return a}async function Re(e,t=null){const a=(e||"").replace(/[^0-9]/g,"").slice(-10);let n=o.from("auction_players").select("id, phone");n=t?n.eq("auction_id",t):n.is("auction_id",null);const{data:r,error:s}=await n;if(s)throw s;return(r||[]).some(l=>(l.phone||"").replace(/[^0-9]/g,"").slice(-10)===a)}async function Be(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10);if(t.length!==10)return null;const{data:a,error:n}=await o.from("players").select("id, name, playing_role, birth_date, profile_image_url, category, city, jersey_number, jersey_size").ilike("phone",`%${t}`);if(n)throw n;return a&&a[0]||null}async function Ma(e=null){if(e){const{data:a,error:n}=await o.from("auctions").select("registration_open").eq("id",e).maybeSingle();if(n)throw n;return(a==null?void 0:a.registration_open)!==!1}const t=await Z();return(t==null?void 0:t.auction_registration_open)!=="false"}async function Na(e,t){if(typeof e=="boolean"){await T("auction_registration_open",e?"true":"false");return}const{error:a}=await o.from("auctions").update({registration_open:t}).eq("id",e);if(a)throw a}async function Oa(e,t){const{error:a}=await o.from("players").update({playing_role:t}).eq("id",e);if(a)throw a}async function Wa(e,t){const{error:a}=await o.from("auction_players").update({base_price:t}).eq("id",e);if(a)throw a}async function Ua(e,t){const{error:a}=await o.from("auction_players").update({category:t}).eq("id",e);if(a)throw a}async function Ga(e){const{error:t}=await o.from("auction_players").delete().eq("id",e);if(t)throw t}async function Ha(e=null){let t=o.from("auction_teams").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;if(!a||a.length===0)return[];try{const r=a.map(c=>`auction_team_logo_${c.id}`),{data:s}=await o.from("settings").select("key, value").in("key",r),l={};return s&&s.forEach(c=>{l[c.key]=c.value}),a.map(c=>({...c,logo_url:c.logo_url||l[`auction_team_logo_${c.id}`]||null}))}catch(r){return console.warn("Could not load team logos:",r),a}}async function le(e,t,{captainPlayerId:a,captainPhone:n,captainName:r}){var l,c,d,p,u;const s=(n||"").replace(/[^0-9]/g,"").slice(-10);if(a){const m={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(m.name=r.trim());let _=await o.from("auction_players").update(m).eq("id",a);_.error&&((l=_.error.message)!=null&&l.includes("is_captain"))&&(delete m.is_captain,await o.from("auction_players").update(m).eq("id",a));return}if(s&&s.length===10){let m=o.from("auction_players").select("id, name, phone");m=t?m.eq("auction_id",t):m.is("auction_id",null);const{data:_}=await m,h=(_||[]).find(A=>(A.phone||"").replace(/[^0-9]/g,"").slice(-10)===s);if(h){const A={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(A.name=r.trim());let z=await o.from("auction_players").update(A).eq("id",h.id);z.error&&((c=z.error.message)!=null&&c.includes("is_captain"))&&(delete A.is_captain,await o.from("auction_players").update(A).eq("id",h.id));return}let f=null,g=null,b=null,P=null,y=null,F=null,v=r?r.trim():"Captain";try{const A=await Be(s);A&&(!r&&A.name&&(v=A.name),f=A.profile_image_url||null,g=A.playing_role||null,b=A.city||null,P=A.birth_date||null,y=A.jersey_number||null,F=A.jersey_size||null)}catch{}const k=await G(t),C={name:v,phone:s,playing_role:g||"All-rounder",status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,profile_image_url:f,city:b,birth_date:P,jersey_number:y,jersey_size:F,base_price:k||0};let q=await o.from("auction_players").insert(C);q.error&&((d=q.error.message)!=null&&d.includes("is_captain"))&&(delete C.is_captain,await o.from("auction_players").insert(C));return}if(r&&r.trim()){let m=o.from("auction_players").select("id, name");m=t?m.eq("auction_id",t):m.is("auction_id",null);const{data:_}=await m,h=(_||[]).find(f=>(f.name||"").trim().toLowerCase()===r.trim().toLowerCase());if(h){const f={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};let g=await o.from("auction_players").update(f).eq("id",h.id);g.error&&((p=g.error.message)!=null&&p.includes("is_captain"))&&(delete f.is_captain,await o.from("auction_players").update(f).eq("id",h.id))}else{const f=await G(t),g={name:r.trim(),status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,base_price:f||0};let b=await o.from("auction_players").insert(g);b.error&&((u=b.error.message)!=null&&u.includes("is_captain"))&&(delete g.is_captain,await o.from("auction_players").insert(g))}}}async function Ya(e,t,a,n=null,r=null,s=null,l=null,c=null,d=null,p=null){var f,g;const u={name:e,owner_name:t||null,captain_name:r||null,purse_total:a,purse_remaining:a,auction_id:n||null};s&&(u.captain_phone=s),l&&(u.owner_phone=l);let m,{data:_,error:h}=await o.from("auction_teams").insert(u).select().single();if(h&&((f=h.message)!=null&&f.includes("captain_phone")||(g=h.message)!=null&&g.includes("owner_phone"))){delete u.captain_phone,delete u.owner_phone;const b=await o.from("auction_teams").insert(u).select().single();if(b.error)throw b.error;m=b.data}else{if(h)throw h;m=_}if(m!=null&&m.id&&(c||s||r))try{await le(m.id,n,{captainPlayerId:c,captainPhone:s,captainName:r})}catch(b){console.warn("Could not pre-assign captain:",b)}if(m!=null&&m.id)try{let b=p||null;d&&(b=await oe(d,e)),b&&(await T(`auction_team_logo_${m.id}`,b),m.logo_url=b)}catch(b){console.warn("Could not save team logo:",b)}return m}async function Va(e,{name:t,ownerName:a,purseTotal:n,captainName:r,captainPhone:s,ownerPhone:l,captainPlayerId:c,auctionId:d,logoFile:p,logoUrl:u}){var h,f;const m={name:t,owner_name:a||null,captain_name:r||null,purse_total:n,purse_remaining:n};s&&(m.captain_phone=s),l&&(m.owner_phone=l);let{error:_}=await o.from("auction_teams").update(m).eq("id",e);if(_&&((h=_.message)!=null&&h.includes("captain_phone")||(f=_.message)!=null&&f.includes("owner_phone"))){delete m.captain_phone,delete m.owner_phone;const g=await o.from("auction_teams").update(m).eq("id",e);if(g.error)throw g.error}else if(_)throw _;if(e&&(c||s||r))try{await le(e,d,{captainPlayerId:c,captainPhone:s,captainName:r})}catch(g){console.warn("Could not update pre-assigned captain:",g)}try{if(p){const g=await oe(p,t);await T(`auction_team_logo_${e}`,g)}else u!==void 0&&(u?await T(`auction_team_logo_${e}`,u):await o.from("settings").delete().eq("key",`auction_team_logo_${e}`))}catch(g){console.warn("Could not update team logo:",g)}}async function Za(e){const{error:t}=await o.from("auction_players").update({status:"registered",sold_team_id:null,sold_price:null,sold_at:null}).eq("sold_team_id",e);if(t)throw t;try{await o.from("auction_bids").delete().eq("team_id",e)}catch(n){console.warn("Could not delete bids for team:",n)}try{await o.from("auctions").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await o.from("auction_state").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await o.from("settings").delete().eq("key",`auction_team_logo_${e}`)}catch{}const{error:a}=await o.from("auction_teams").delete().eq("id",e);if(a)throw a}async function Ka(e=null){if(e)return await De(e);const{data:t,error:a}=await o.from("auction_state").select("*").eq("id",1).single();if(a)throw a;return t}function Te(e,t){const a=e.filter(r=>r.id!==t&&r.status==="registered"&&!r.is_captain&&r.status!=="captain");if(a.length===0)return null;const n=Math.floor(Math.random()*a.length);return a[n]}async function Ja(e,t=null){const a=await se(t),n=Te(a,null);if(!n)throw new Error("No players in the pool yet — add players before starting.");const r=t?"auctions":"auction_state",s=t||1,{error:l}=await o.from(r).update({status:"live",bid_increment:e,current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function Xa(e,t,a,n=null){const{error:r}=await o.from("auction_bids").insert({player_id:e,team_id:t,amount:a,auction_id:n||null});if(r)throw r;const s=n?"auctions":"auction_state",l=n||1,{error:c}=await o.from(s).update({current_bid:a,current_team_id:t}).eq("id",l);if(c)throw c}async function Qa(e,t=null){const{data:a,error:n}=await o.from("auction_bids").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(2);if(n)throw n;if(!a||a.length===0)return;const{error:r}=await o.from("auction_bids").delete().eq("id",a[0].id);if(r)throw r;const s=a[1],{data:l}=await o.from("auction_players").select("base_price").eq("id",e).single(),c=t?"auctions":"auction_state",d=t||1,{error:p}=await o.from(c).update({current_bid:s?s.amount:(l==null?void 0:l.base_price)||0,current_team_id:s?s.team_id:null}).eq("id",d);if(p)throw p}async function en(e,t,a,n=null){const{error:r}=await o.from("auction_players").update({status:"sold",sold_price:a,sold_team_id:t,sold_at:new Date().toISOString()}).eq("id",e);if(r)throw r;const{data:s,error:l}=await o.from("auction_teams").select("purse_remaining, name").eq("id",t).single();if(l)throw l;const{error:c}=await o.from("auction_teams").update({purse_remaining:s.purse_remaining-a}).eq("id",t);if(c)throw c;const{data:d}=await o.from("auction_players").select("name").eq("id",e).maybeSingle();d!=null&&d.name&&await V(null,"auction_sold",`${d.name} sold to ${s.name} for ₹${a}`),await Ie(e,n)}async function tn(e,t=null){const{error:a}=await o.from("auction_players").update({status:"unsold"}).eq("id",e);if(a)throw a;await Ie(e,t)}async function Ie(e,t=null){const a=await se(t),n=Te(a,e),r=t?"auctions":"auction_state",s=t||1;if(!n){const{error:c}=await o.from(r).update({status:"completed",current_player_id:null,current_bid:0,current_team_id:null}).eq("id",s);if(c)throw c;return}const{error:l}=await o.from(r).update({current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function an(e,t=null){const{data:a,error:n}=await o.from("auction_players").select("base_price").eq("id",e).single();if(n)throw n;const r=t?"auctions":"auction_state",s=t||1,{error:l}=await o.from(r).update({current_player_id:e,current_bid:a.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function nn(e,t=null){let a=o.from("auction_bids").select("*, auction_teams(name)").eq("player_id",e).order("created_at",{ascending:!1});t&&(a=a.eq("auction_id",t));const{data:n,error:r}=await a;if(r)throw r;return n}async function rn(){const e=await Z(),t=e==null?void 0:e.platform_upi_id;return t&&t!=="9897439743@okbizaxis"?t:"9897439743@pz"}async function on(e){await T("platform_upi_id",e)}function M(e){var t;return e&&(e.organized_by||(e.logo_url&&e.logo_url.startsWith("org:")?e.organized_by=e.logo_url.replace(/^org:/,"").trim():(t=e.players)!=null&&t.name&&(e.organized_by=e.players.name)),e)}async function sn({name:e,organizerId:t,location:a,auctionDate:n,auctionTime:r,planTier:s,maxTeams:l,pointsPurse:c,amountDue:d,playerEntryFee:p=0,organizerUpiId:u=null,organizerPaymentPhone:m=null,organizedBy:_=null}){var y,F,v,k;const h=d>0?"pending":"free",f=_?_.trim():null,g={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:c||null,amount_due:d||0,payment_status:h};p!==void 0&&(g.player_entry_fee=p?Number(p):0),u&&(g.organizer_upi_id=u.trim()),m&&(g.organizer_payment_phone=m.trim()),f&&(g.organized_by=f,g.logo_url=`org:${f}`);let{data:b,error:P}=await o.from("auctions").insert(g).select().single();if(P&&((y=P.message)!=null&&y.includes("player_entry_fee")||(F=P.message)!=null&&F.includes("organizer_upi_id")||(v=P.message)!=null&&v.includes("organizer_payment_phone")||(k=P.message)!=null&&k.includes("organized_by"))){console.warn("Retrying createAuction without unrecognized columns:",P.message);const C={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:c||null,amount_due:d||0,payment_status:h,logo_url:f?`org:${f}`:null},q=await o.from("auctions").insert(C).select().single();if(q.error)throw q.error;b=q.data}else if(P)throw P;return f&&(b!=null&&b.id)&&(T(`auction_org_${b.id}`,f).catch(()=>{}),b.auction_code&&T(`auction_org_${b.auction_code}`,f).catch(()=>{})),d>0&&await U("auction_payment_pending",`New auction "${e}" awaiting payment confirmation (₹${d})`),M(b)}async function ln(e,t={}){var l;const a={};t.auctionDate!==void 0&&(a.auction_date=t.auctionDate||null),t.auction_date!==void 0&&(a.auction_date=t.auction_date||null),t.auctionTime!==void 0&&(a.auction_time=t.auctionTime||null),t.auction_time!==void 0&&(a.auction_time=t.auction_time||null),t.name!==void 0&&(a.name=t.name.trim()),t.location!==void 0&&(a.location=t.location?t.location.trim():null),t.pointsPurse!==void 0&&(a.points_purse=t.pointsPurse?Number(t.pointsPurse):null),t.points_purse!==void 0&&(a.points_purse=t.points_purse?Number(t.points_purse):null),t.bidIncrement!==void 0&&(a.bid_increment=t.bidIncrement?Number(t.bidIncrement):1e3),t.bid_increment!==void 0&&(a.bid_increment=t.bid_increment?Number(t.bid_increment):1e3);const n=t.organizedBy?t.organizedBy.trim():t.organized_by?t.organized_by.trim():null;n!==null&&(a.organized_by=n,a.logo_url=`org:${n}`);let{data:r,error:s}=await o.from("auctions").update(a).eq("id",e).select().single();if(s&&((l=s.message)!=null&&l.includes("organized_by"))){delete a.organized_by;const c=await o.from("auctions").update(a).eq("id",e).select().single();if(c.error)throw c.error;r=c.data}else if(s)throw s;return n&&e&&(T(`auction_org_${e}`,n).catch(()=>{}),r!=null&&r.auction_code&&T(`auction_org_${r.auction_code}`,n).catch(()=>{})),M(r)}async function cn(e){const{data:t,error:a}=await o.from("auctions").select("*").eq("organizer_id",e).order("created_at",{ascending:!1});if(a)throw a;return t}async function dn(){const{data:e,error:t}=await o.from("auction_teams").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function un(){const{data:e,error:t}=await o.from("auction_players").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function pn(e){if(!e)return[];const t=e.replace(/[^0-9]/g,"").slice(-10);try{const{data:a,error:n}=await o.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time), auction_teams!sold_team_id(id, name, owner_name, captain_name)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(!n&&a){const r=a.filter(u=>u.auctions),s=r.filter(u=>u.sold_team_id).map(u=>u.sold_team_id),l=[...new Set(r.map(u=>u.auction_id).filter(Boolean))];let c=[],d=[];try{const[u,m]=await Promise.all([s.length>0?o.from("settings").select("key, value").in("key",s.map(_=>`auction_team_logo_${_}`)):Promise.resolve({data:[]}),l.length>0?o.from("auction_teams").select("id, name, owner_name, captain_name, purse_total, auction_id").in("auction_id",l):Promise.resolve({data:[]})]);c=(u==null?void 0:u.data)||[],d=(m==null?void 0:m.data)||[]}catch{}let p={};return c.forEach(u=>{p[u.key]=u.value}),r.map(u=>{var P;const m=u.auctions||{};let _=null;(P=m.logo_url)!=null&&P.startsWith("org:")&&(_=m.logo_url.replace(/^org:/,""));let h=u.auction_teams||null;const f=(u.name||"").toLowerCase().trim();if(!h&&u.auction_id&&f){const y=d.find(F=>F.auction_id===u.auction_id&&(F.captain_name&&F.captain_name.toLowerCase().trim()===f||F.owner_name&&F.owner_name.toLowerCase().trim()===f));y&&(h=y)}const g=u.status==="captain"||h&&(h.captain_name&&h.captain_name.toLowerCase().trim()===f||h.owner_name&&h.owner_name.toLowerCase().trim()===f);let b=null;return h!=null&&h.id&&(b=p[`auction_team_logo_${h.id}`]||null),{...u,status:g?"captain":u.status,is_captain:!!g,sold_team_id:(h==null?void 0:h.id)||u.sold_team_id,auctions:{...m,organized_by:_||null},auction_teams:h?{...h,logo_url:b}:null}})}}catch(a){console.warn("fetchPlayerAuctionHistory main query failed:",a)}try{const{data:a,error:n}=await o.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(n)throw n;return(a||[]).filter(r=>r.auctions).map(r=>{var s;return{...r,auctions:{...r.auctions,organized_by:(s=r.auctions.logo_url)!=null&&s.startsWith("org:")?r.auctions.logo_url.replace(/^org:/,""):null}}})}catch(a){return console.warn("fetchPlayerAuctionHistory fallback failed:",a),[]}}async function fn(){const e=d=>(d||"").replace(/[^0-9]/g,"").slice(-10),[{data:t,error:a},{data:n,error:r}]=await Promise.all([o.from("auction_players").select("name, phone, birth_date, profile_image_url, city, jersey_number, jersey_size"),o.from("players").select("phone")]);if(a)throw a;if(r)throw r;const s=new Set((n||[]).map(d=>e(d.phone)));let l=0,c=0;for(const d of t||[]){const p=e(d.phone);if(!p||s.has(p)){c++;continue}try{await re(d.name,p,"1234",null,d.birth_date,d.profile_image_url,{city:d.city,jerseyNumber:d.jersey_number,jerseySize:d.jersey_size,source:"auction"}),s.add(p),l++}catch(u){console.error(`Failed to sync ${d.name} (${p}):`,u),c++}}return{synced:l,skipped:c}}async function mn(e){const{data:t,error:a}=await o.from("auction_sponsors").select("*").eq("auction_id",e).order("created_at",{ascending:!0});if(a)throw a;return t||[]}async function gn(e,t,a){const{data:n,error:r}=await o.from("auction_sponsors").insert({auction_id:e,name:t,logo_url:a||null}).select().single();if(r)throw r;return n}async function hn(e){const{error:t}=await o.from("auction_sponsors").delete().eq("id",e);if(t)throw t}async function yn(e,t){const a=e.name.split(".").pop(),n=`sponsor-logos/${(t||"sponsor").toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:r}=await o.storage.from("team-assets").upload(n,e,{upsert:!0});if(r)throw r;const{data:s}=o.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function wn(){const{data:e,error:t}=await o.from("auctions").select("*, players(name)").order("created_at",{ascending:!1});if(t)throw t;return(e||[]).map(M)}async function _n(e){const{data:t,error:a}=await o.from("auctions").select("*").eq("auction_code",e).maybeSingle();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await o.from("settings").select("value").eq("key",`auction_org_${t.id}`).maybeSingle();if(n!=null&&n.value)t.organized_by=n.value;else{const{data:r}=await o.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();r!=null&&r.value&&(t.organized_by=r.value)}}catch{}return t}async function De(e){const{data:t,error:a}=await o.from("auctions").select("*").eq("id",e).single();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await o.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();n!=null&&n.value&&(t.organized_by=n.value)}catch{}return t}async function bn(){const{data:e,error:t}=await o.from("auctions").select("*, players(name, phone)").eq("payment_status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function xn(e){await U("auction_payment_claimed","An organizer marked auction payment as sent — please verify and approve.")}async function Fn(e){const{error:t}=await o.from("auctions").update({payment_status:"paid"}).eq("id",e);if(t)throw t}async function vn(e){const{error:t}=await o.from("auctions").update({payment_status:"rejected"}).eq("id",e);if(t)throw t}async function Sn(e){await o.from("auction_bids").delete().eq("auction_id",e),await o.from("auction_players").delete().eq("auction_id",e),await o.from("auction_teams").delete().eq("auction_id",e);const{error:t}=await o.from("auctions").delete().eq("id",e);if(t)throw t}async function jn(e,t){const{error:a}=await o.from("players").update({role:t}).eq("id",e);if(a)throw a}const nr=Object.freeze(Object.defineProperty({__proto__:null,addAuctionSponsor:gn,addContribution:sa,addExpense:Zt,addGround:Ct,addPlayer:re,addRosterPlayerToAuction:Ia,addTeam:Et,approveAuctionPayment:Fn,approvePlayer:ra,approveProRequest:Sa,approvePublicResponse:Ht,assignCaptainToTeam:le,cancelProRequest:Ce,checkAuctionPhoneExists:Re,checkPlayerPhoneExists:ne,confirmPlayerToMatch:Mt,contributionExists:ca,countUnreadDirectMessages:Ea,countUnreadMessages:xa,createAuction:sn,createAuctionTeam:Ya,createMatch:Bt,deleteAuctionEvent:Sn,deleteAuctionPlayer:Ga,deleteAuctionSponsor:hn,deleteAuctionTeam:Za,deleteContribution:la,deleteExpense:Kt,deleteGround:kt,deleteMatch:Tt,deletePlayer:jt,deleteTeam:$t,fetchAdminPlayerId:Ee,fetchAllAuctionPlayerCounts:un,fetchAllAuctionTeamCounts:dn,fetchAllAuctions:wn,fetchAuctionBidHistory:nn,fetchAuctionByCode:_n,fetchAuctionById:De,fetchAuctionPlayers:se,fetchAuctionRegistrationOpen:Ma,fetchAuctionSponsors:mn,fetchAuctionState:Ka,fetchAuctionTeams:Ha,fetchChat:Qt,fetchContributions:ia,fetchConversation:Aa,fetchExpenses:Vt,fetchFeedback:Ba,fetchGrounds:Pt,fetchInboxMessages:ba,fetchLeaderboard:je,fetchMatchByToken:Rt,fetchMatchCount:qe,fetchMatchCounts:ma,fetchMatchPlayers:ve,fetchMatches:Fe,fetchMyAuctions:cn,fetchMyConfirmedPlayers:$a,fetchMyConversations:ka,fetchMyInvites:ha,fetchMyOrganizers:qa,fetchMyProRequest:Ae,fetchNotifications:wt,fetchOrganizerUpi:wa,fetchPayments:Jt,fetchPendingAuctionPayments:bn,fetchPendingPlayers:na,fetchPendingProRequests:va,fetchPlatformUpi:rn,fetchPlayerAuctionHistory:pn,fetchPlayerCount:ze,fetchPlayerGrounds:Ca,fetchPlayerMatchHistory:pa,fetchPlayerStats:fa,fetchPlayers:Ft,fetchPlayersByCreator:vt,fetchProGroupPlayers:ga,fetchProStats:ua,fetchPublicResponses:Ut,fetchRecentActivity:yt,fetchRecentlyRegistered:Pa,fetchSentMessages:_a,fetchSettings:Z,fetchStats:da,fetchTeamCount:$e,fetchTeams:zt,fetchUnreadNotificationCount:_t,findPlayerByPhone:Be,globalSearch:Ta,jumpToAuctionPlayer:an,markAllNotificationsRead:xt,markAuctionPaidByOrganizer:xn,markConversationRead:za,markMessagesRead:Fa,markNotificationRead:bt,markPlayerSold:en,markPlayerUnsold:tn,normalizeAuctionOrganizedBy:M,notifyPlayer:Nt,placeBid:Xa,promoteFromWaitlist:ie,registerAuctionPlayer:Da,registerPlayer:aa,rejectAuctionPayment:vn,rejectPlayer:oa,rejectProRequest:ja,rejectPublicResponse:Yt,removePlayerFromMatch:Ot,requestProAccess:Pe,sendAdminMessage:Se,sendDirectMessage:ke,sendFeedback:Ra,sendMessage:ea,setAuctionRegistrationOpen:Na,setPlatformUpi:on,setPlayerAccountRole:jn,setPlayerStatus:Wt,startAuction:Ja,submitPublicResponse:Gt,subscribeToChat:ta,syncAuctionPlayersToRoster:fn,toggleMatchLink:Lt,togglePayment:Xt,undoLastBid:Qa,updateAuction:ln,updateAuctionPlayerBasePrice:Wa,updateAuctionPlayerCategory:Ua,updateAuctionPlayerPaymentStatus:La,updateAuctionTeam:Va,updateGround:At,updateMatchMaxPlayers:Dt,updateMatchStatus:It,updatePlayer:St,updatePlayerRole:Oa,updatePlayerUpi:ya,updateTeam:qt,uploadPaymentReceipt:ht,uploadProfilePhoto:gt,uploadSponsorLogo:yn,uploadTeamLogo:oe,upsertSetting:T},Symbol.toStringTag,{value:"Module"})),Le="ss_home_stats_v2";function Pn(){try{const e=localStorage.getItem(Le);if(e)return JSON.parse(e)}catch{}return{p:80,m:43,t:24}}function Cn({onLogin:e,onRegister:t}){const a=pt(),n=x.useMemo(()=>Pn(),[]),[r,s]=x.useState(n.p),[l,c]=x.useState(n.m),[d,p]=x.useState(n.t),[u,m]=x.useState({p:n.p,m:n.m,t:n.t}),[_,h]=x.useState(!1),[f,g]=x.useState(!1);x.useEffect(()=>{h(!0);let y=!1;return Promise.all([ze().catch(()=>null),qe().catch(()=>null),$e().catch(()=>null)]).then(([F,v,k])=>{if(y)return;const C={p:typeof F=="number"&&F>0?F:n.p,m:typeof v=="number"&&v>0?v:n.m,t:typeof k=="number"&&k>0?k:n.t};s(C.p),c(C.m),p(C.t),m(C);try{localStorage.setItem(Le,JSON.stringify(C))}catch{}}),()=>{y=!0}},[n]);const b=[{icon:He,v:u.p,label:"Active Players",sub:"Registered Pool",color:"#166534"},{icon:we,v:u.m,label:"Matches Played",sub:"Games & Fixtures",color:"#B8860B"},{icon:_e,v:u.t,label:"Cricket Teams",sub:"Franchises",color:"#0F766E"}],P=[{label:"Digital Player Pass",icon:Ye},{label:"Live Auction Console",icon:be},{label:"Grounds on Google Maps",icon:Ve},{label:"Season MVP Leaderboard",icon:Ze}];return i.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 40%, #F8FAF8 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-body)",position:"relative",overflow:"hidden",padding:a?"24px 16px 36px":"40px 20px"},children:[i.jsx("div",{style:{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:a?400:700,height:a?400:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0) 70%)",pointerEvents:"none"}}),i.jsx("div",{style:{position:"fixed",bottom:"-10%",right:"-10%",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle, rgba(246,196,83,0.06) 0%, rgba(246,196,83,0) 70%)",pointerEvents:"none"}}),i.jsxs("div",{style:{width:"100%",maxWidth:520,textAlign:"center",position:"relative",zIndex:1,opacity:_?1:0,transform:_?"translateY(0)":"translateY(-8px)",transition:"opacity 300ms ease-out, transform 300ms ease-out"},children:[i.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"#FFFFFF",border:"1px solid rgba(22,101,52,0.25)",padding:"5px 14px",borderRadius:999,fontSize:11,fontWeight:800,color:"#166534",boxShadow:"0 2px 8px rgba(22,101,52,0.06)",marginBottom:16,letterSpacing:.5,textTransform:"uppercase"},children:[i.jsx("span",{style:{width:7,height:7,borderRadius:"50%",background:"#22C55E",animation:"pulse 2s infinite"}}),"Selected Sports • Cricket Platform"]}),i.jsx("div",{style:{position:"relative",display:"inline-block",margin:"0 auto 12px"},children:i.jsx("img",{src:"/logo-full.png",alt:"Selected Sports",width:a?180:210,height:a?180:210,style:{height:a?180:210,width:"auto",display:"block",margin:"0 auto",filter:"drop-shadow(0 10px 24px rgba(22,101,52,0.12))",userSelect:"none"}})}),i.jsxs("div",{style:{fontSize:a?22:25,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",letterSpacing:"-0.5px",lineHeight:1.25,marginBottom:8},children:["PLAY. COMPETE."," ",i.jsx("span",{style:{background:"linear-gradient(135deg, #166534 0%, #15803D 50%, #0F766E 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"GET RECOGNISED."})]}),i.jsx("p",{style:{color:"#64748B",fontSize:a?13:14,lineHeight:1.5,maxWidth:420,margin:"0 auto 22px"},children:"India's premier cricket community for live auction tournaments, match scheduling, digital player passes, and official player leaderboards."}),i.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20},children:b.map((y,F)=>i.jsxs("div",{style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,padding:"14px 6px",boxShadow:"0 4px 14px rgba(15,23,42,0.04)",transition:"transform 150ms ease, box-shadow 150ms ease"},children:[i.jsx("div",{style:{width:34,height:34,borderRadius:10,background:`${y.color}12`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"},children:i.jsx(y.icon,{size:17,color:y.color})}),i.jsxs("div",{style:{fontSize:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.1},children:[y.v,"+"]}),i.jsx("div",{style:{fontSize:11,fontWeight:800,color:"#0F172A",marginTop:3},children:y.label}),i.jsx("div",{style:{fontSize:9,color:"#94A3B8",marginTop:1},children:y.sub})]},F))}),i.jsx("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginBottom:24},children:P.map((y,F)=>i.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(22,101,52,0.06)",border:"1px solid rgba(22,101,52,0.18)",color:"#166534",padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:700},children:[i.jsx(y.icon,{size:13,color:"#166534"}),y.label]},F))}),i.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:18},children:[i.jsxs("button",{onClick:e,style:{width:"100%",height:54,borderRadius:15,background:"linear-gradient(135deg, #166534 0%, #15803D 100%)",border:"none",color:"#FFFFFF",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",boxShadow:"0 8px 22px rgba(22,101,52,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 150ms ease, box-shadow 150ms ease"},onMouseEnter:y=>{y.currentTarget.style.transform="translateY(-2px)",y.currentTarget.style.boxShadow="0 12px 28px rgba(22,101,52,0.45)"},onMouseLeave:y=>{y.currentTarget.style.transform="translateY(0)",y.currentTarget.style.boxShadow="0 8px 22px rgba(22,101,52,0.35)"},children:[i.jsx("span",{children:"Login to Selected Sports"}),i.jsx(Ke,{size:17})]}),i.jsxs("button",{onClick:t,style:{width:"100%",padding:"14px 18px",borderRadius:15,background:"#FFFFFF",border:"1.5px solid #166534",color:"#166534",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(15,23,42,0.03)",transition:"background 150ms ease"},onMouseEnter:y=>{y.currentTarget.style.background="rgba(22,101,52,0.06)"},onMouseLeave:y=>{y.currentTarget.style.background="#FFFFFF"},children:[i.jsx(Je,{size:16,color:"#166534"}),i.jsx("span",{children:"Create New Player Account"})]})]}),i.jsxs("div",{style:{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:"#64748B",marginTop:6},children:[i.jsx("span",{style:{display:"flex",alignItems:"center",gap:6},children:i.jsx("span",{children:"Want to organize an auction?"})}),i.jsx("button",{onClick:()=>g(!0),style:{background:"none",border:"none",color:"#166534",fontWeight:800,cursor:"pointer",padding:0,textDecoration:"underline"},children:"Contact Md Zeeshan ↗"})]}),i.jsx("div",{style:{fontSize:11,color:"#94A3B8",fontWeight:700,marginTop:20,letterSpacing:.5,textTransform:"uppercase"},children:"Selected Sports • Play • Compete • Get Recognised"})]}),f&&i.jsx("div",{onClick:()=>g(!1),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:i.jsxs("div",{onClick:y=>y.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:20,maxWidth:420,width:"100%",padding:24,boxShadow:"0 25px 60px rgba(15,23,42,0.3)"},children:[i.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[i.jsx("div",{style:{fontWeight:800,fontSize:17,fontFamily:"var(--font-head)",color:"#0F172A"},children:"Tournament Organizer Support"}),i.jsx("button",{onClick:()=>g(!1),style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"✕"})]}),i.jsx("p",{style:{fontSize:13,color:"#64748B",margin:"0 0 16px",lineHeight:1.5},children:"Want to organize an auction for your tournament, schedule matches, or need account help? Contact Md Zeeshan:"}),i.jsxs("div",{style:{background:"#F8FAF8",borderRadius:12,padding:"14px",border:"1px solid #E2E8F0",marginBottom:16},children:[i.jsx("div",{style:{fontWeight:800,fontSize:16,color:"#0F172A"},children:"Md Zeeshan"}),i.jsx("div",{style:{fontSize:12,color:"#64748B",marginTop:2},children:"Head of Tournament Operations"}),i.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:15,fontWeight:800,color:"#166534"},children:[i.jsx(Xe,{size:15})," 9897439743"]})]}),i.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[i.jsx("a",{href:"tel:9897439743",style:{padding:"12px",borderRadius:11,background:"#166534",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"📞 Call Now"}),i.jsx("a",{href:"https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20interested%20in%20organizing%20an%20auction%20tournament%20with%20Selected%20Sports",target:"_blank",rel:"noreferrer",style:{padding:"12px",borderRadius:11,background:"#25D366",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"WhatsApp ↗"})]})]})})]})}const An="9897439743",rr="9897439743@pz",ge=["#1D9E75","#8B1E2E","#BA7517","#0F6E56","#7A4F13","#3B6D11","#A6192E","#5B7C4A"],kn=e=>ge[e%ge.length],zn=e=>e.split(" ").map(t=>t[0]).join("").slice(0,2).toUpperCase(),Me=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}),or=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"}),ir=e=>e.our_team?`${e.our_team} vs ${e.team}`:e.team,sr=[{id:"free",label:"Free",maxTeams:3,price:0},{id:"plan2",label:"Plan 2",maxTeams:4,price:1999},{id:"plan2b",label:"Plan 2B",maxTeams:5,price:2249},{id:"plan3",label:"Plan 3",maxTeams:6,price:2499},{id:"plan4",label:"Plan 4",maxTeams:8,price:2999},{id:"plan5",label:"Plan 5",maxTeams:12,price:3999},{id:"plan6",label:"Plan 6",maxTeams:16,price:4999}],te=15,En=9,qn=1e3;function lr(e,t,a=En,n=qn){if(t>=a)return 0;const r=Math.max(0,a-t),l=Math.max(0,r-1)*n;return Math.max(0,(e||0)-l)}function cr(){const e=new Date;return e.setFullYear(e.getFullYear()-te),e.toISOString().split("T")[0]}const dr=e=>/^[A-Za-z\s'.-]+$/.test((e||"").trim())&&(e||"").trim().length>0;function ur(e){if(!e)return"Please enter a date of birth.";const t=new Date(e+"T00:00:00");if(isNaN(t.getTime()))return"Please enter a valid date of birth.";const a=new Date;if(a.setHours(0,0,0,0),t>a)return"Date of birth can't be in the future.";let n=a.getFullYear()-t.getFullYear();const r=a.getMonth()-t.getMonth();return(r<0||r===0&&a.getDate()<t.getDate())&&n--,n<te?`Players must be at least ${te} years old to register.`:null}function pr(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(f=>f.sold_team_id===e.id).sort((f,g)=>{const b=f.is_captain||f.status==="captain"||e.captain_player_id&&f.id===e.captain_player_id?1:0;return(g.is_captain||g.status==="captain"||e.captain_player_id&&g.id===e.captain_player_id?1:0)-b});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=f=>f==null?'""':`"${String(f).replace(/"/g,'""')}"`,s=["S.No","Player Name","Team Role","Playing Role","Jersey Number","Jersey Size","City","Date of Birth","Mobile Number","Price Paid (Coins)","Status"],l=n.map((f,g)=>{const b=f.is_captain||f.status==="captain"||e.captain_player_id&&f.id===e.captain_player_id,P=b?"Captain":"Squad Member",y=b?"0 (Captain)":`🪙 ${Number(f.sold_price||0).toLocaleString("en-IN")}`;return[g+1,r(f.name||""),r(P),r(f.playing_role||"—"),r(f.jersey_number||"—"),r(f.jersey_size||"—"),r(f.city||"—"),r(f.birth_date||"—"),r(f.phone||"—"),r(y),r(b?"Captain":f.status||"Sold")].join(",")}),c=r(`Tournament: ${a} — Team Roster: ${e.name}`),d=r(`Captain: ${e.captain_name||"—"}${e.captain_phone?` (${e.captain_phone})`:""} | Owner: ${e.owner_name||"—"}${e.owner_phone?` (${e.owner_phone})`:""} | Starting Purse: 🪙 ${Number(e.purse_total||0).toLocaleString("en-IN")} | Remaining Purse: 🪙 ${Number(e.purse_remaining||0).toLocaleString("en-IN")} | Squad: ${n.length}/9`),p=[c,d,"",s.join(","),...l].join(`\r
`),u=new Blob(["\uFEFF"+p],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(u),_=document.createElement("a"),h=`${(e.name||"Team").replace(/[^a-zA-Z0-9_-]/g,"_")}_Roster.csv`;_.href=m,_.download=h,document.body.appendChild(_),_.click(),document.body.removeChild(_),URL.revokeObjectURL(m)}function fr(e,t){if(!e)return;const a=window.location.origin,n=(t==null?void 0:t.auction_code)||"",r=`${a}/team-view/${n}/${e.id}`,s=(e.captain_phone||e.owner_phone||"").replace(/[^0-9]/g,"").slice(-10),l=e.captain_name||e.owner_name||e.name,d=`🏏 *${(t==null?void 0:t.name)||"Selected Sports Cricket Tournament"}*

Hi ${l},
Here is your private team link to view *${e.name}* squad, purse wallet, and live auction roster:
👉 ${r}

Good luck for the auction!`,p=s?`https://wa.me/91${s}?text=${encodeURIComponent(d)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(d)}`;window.open(p,"_blank")}function mr(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(u=>u.sold_team_id===e.id).sort((u,m)=>{const _=u.is_captain||u.status==="captain"||e.captain_player_id&&u.id===e.captain_player_id?1:0;return(m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id?1:0)-_});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=u=>String(u??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]),s=n.map((u,m)=>{const _=u.is_captain||u.status==="captain"||e.captain_player_id&&u.id===e.captain_player_id,h=_?'<span class="captain-badge">👑 CAPTAIN</span>':'<span class="player-badge">PLAYER</span>',f=_?"🪙 0 (Captain)":`🪙 ${Number(u.sold_price||0).toLocaleString("en-IN")}`,g=u.birth_date?u.birth_date:"—";return`
      <tr>
        <td style="text-align:center;font-weight:700;color:#64748B;">${m+1}</td>
        <td>
          <div style="font-weight:800;color:#0F172A;font-size:13px;">${r(u.name||"")}</div>
        </td>
        <td>${h}</td>
        <td><strong>${r(u.playing_role||"—")}</strong></td>
        <td style="text-align:center;">${r(u.jersey_number?`#${u.jersey_number}`:"—")}${u.jersey_size?` (${r(u.jersey_size)})`:""}</td>
        <td>${r(u.city||"—")}</td>
        <td>${r(g)}</td>
        <td><strong style="color:#166534;">${r(u.phone||"—")}</strong></td>
        <td style="font-weight:800;color:#166534;text-align:right;">${f}</td>
        <td style="text-align:center;"><span class="status-sold">${r(_?"Captain":"Sold")}</span></td>
      </tr>
    `}).join(""),l=(e.purse_total||0)-(e.purse_remaining||0),c=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),d=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${r(e.name)} — Official Team Roster</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 14mm 12mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 16px;
      font-size: 12px;
    }
    .header {
      border-bottom: 2.5px solid #166534;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tournament-tag {
      font-size: 11px;
      color: #B8860B;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .team-title {
      font-size: 24px;
      font-weight: 900;
      color: #166534;
      margin: 2px 0 0;
      letter-spacing: -0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #F8FAF8;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 10px;
      color: #64748B;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
    }
    .purse-val {
      color: #166534;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      background: #166534;
      color: #FFFFFF;
      text-align: left;
      padding: 8px 9px;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 800;
    }
    td {
      padding: 7px 9px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11.5px;
    }
    tr:nth-child(even) td {
      background: #FAFCFA;
    }
    .captain-badge {
      background: #B8860B;
      color: #FFFFFF;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 800;
      display: inline-block;
    }
    .player-badge {
      background: #E2E8F0;
      color: #475569;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 700;
      display: inline-block;
    }
    .status-sold {
      background: #DCFCE7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748B;
    }
    .no-print-bar {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .no-print-btn {
      background: #166534;
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span style="font-weight:700;color:#166534;font-size:13px;">📄 Team Roster PDF: Click "Save as PDF" in the print dialog.</span>
    <button class="no-print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div class="header">
    <div class="brand">
      <img src="${window.location.origin}/logo-full.png?v=1" alt="Selected Sports" style="height:44px;width:auto;" onerror="this.style.display='none'"/>
      <div>
        <div class="tournament-tag">${r(a||"Selected Sports Cricket Tournament")}</div>
        <h1 class="team-title">${r(e.name)}</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:800;color:#0F172A;">OFFICIAL SQUAD ROSTER</div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${c}</div>
      <div style="font-size:10px;color:#166534;font-weight:700;margin-top:2px;">Squad Size: ${n.length} / 9 Players</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Team Captain</span>
      <span class="meta-val">👑 ${r(e.captain_name||"—")}</span>
      ${e.captain_phone?`<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${r(e.captain_phone)}</span>`:""}
    </div>
    <div class="meta-item">
      <span class="meta-label">Team Owner</span>
      <span class="meta-val">${r(e.owner_name||"—")}</span>
      ${e.owner_phone?`<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${r(e.owner_phone)}</span>`:""}
    </div>
    <div class="meta-item">
      <span class="meta-label">Purse Budget</span>
      <span class="meta-val purse-val">🪙 ${Number(e.purse_total||0).toLocaleString("en-IN")}</span>
      <span style="font-size:10.5px;color:#EF4444;margin-top:2px;">Spent: 🪙 ${Number(l||0).toLocaleString("en-IN")}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Remaining Purse</span>
      <span class="meta-val purse-val">🪙 ${Number(e.purse_remaining||0).toLocaleString("en-IN")}</span>
      <span style="font-size:10.5px;color:#64748B;margin-top:2px;">Available to Bid</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>Player Name</th>
        <th style="width:95px;">Team Role</th>
        <th style="width:110px;">Playing Role</th>
        <th style="width:90px;text-align:center;">Jersey</th>
        <th style="width:95px;">City</th>
        <th style="width:90px;">Date of Birth</th>
        <th style="width:110px;">Mobile Number</th>
        <th style="width:105px;text-align:right;">Price Paid</th>
        <th style="width:65px;text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${s}
    </tbody>
  </table>

  <div class="footer">
    <div>Official Roster Document · Selected Sports Auction Platform</div>
    <div>Confidential &amp; Proprietary · Tournament Organizer &amp; Team Management Copy</div>
  </div>
</body>
</html>`,p=window.open("","_blank");if(!p){alert("Please allow pop-ups to open the PDF export.");return}p.document.write(d),p.document.close(),p.onload=()=>{setTimeout(()=>{p.print()},250)}}const $n=[{name:"Shinde High School Cricket Ground",location:"Sahakar Nagar, Pune"},{name:"Poona Club Cricket Ground",location:"Camp, Pune"},{name:"PYC Hindu Gymkhana",location:"Deccan Gymkhana, Pune"},{name:"Law College Cricket Ground",location:"Erandwane, Pune"},{name:"Deccan Gymkhana Cricket Ground",location:"Deccan, Pune"},{name:"Nehru Stadium",location:"Swargate, Pune"},{name:"Fergusson College Ground",location:"FC Road, Pune"},{name:"SP College Ground",location:"Sadashiv Peth, Pune"},{name:"Eagle Turf",location:"Khadi Machine Chowk, Pune"},{name:"MM Turf Play Ground",location:"Parge Nagar, Pune"},{name:"Parge Play On",location:"Parge Nagar, Pune"},{name:"Anfield Turf",location:"Mohammadwadi, Pune"},{name:"Kanade Sports Club - Full Ground",location:"Pisoli, Pune"},{name:"Kanade Sports Club - Single",location:"Undri, Pune"},{name:"Kanade Sports Club - Indoor",location:"Pisoli, Pune"},{name:"Blades Cricket Ground",location:"Bavdhan, Pune"},{name:"Legends Cricket Ground",location:"Hadapsar, Pune"},{name:"Champions Turf & Cricket Ground",location:"Viman Nagar, Pune"},{name:"The Turf",location:"Baner, Pune"},{name:"Oxford Cricket Resort Ground",location:"Bavdhan, Pune"},{name:"Kharadi Sports Complex Cricket Ground",location:"Kharadi, Pune"},{name:"Wakad Cricket Ground",location:"Wakad, Pune"},{name:"DY Patil Cricket Stadium",location:"Akurdi, Pune"},{name:"Telco Cricket Ground",location:"Pimpri-Chinchwad, Pune"}];async function Rn(e="",t="Pune",a="Maharashtra"){const n=(e||"").trim(),r=(t||"Pune").trim(),s=(a||"Maharashtra").trim(),l=[],c=new Set;if(!r||r.toLowerCase()==="pune"){const d=$n.filter(p=>{if(!n)return!0;const u=n.toLowerCase();return p.name.toLowerCase().includes(u)||p.location.toLowerCase().includes(u)});for(const p of d)c.has(p.name.toLowerCase())||(c.add(p.name.toLowerCase()),l.push({name:p.name,location:p.location,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.location)}`,isCurated:!0}))}try{const d=n?`${n} cricket ground ${r} ${s}`:`cricket ground in ${r} ${s}`,p=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d)}&limit=10&addressdetails=1`,u=await fetch(p,{headers:{Accept:"application/json"}});if(u.ok){const m=await u.json();for(const _ of m||[]){const f=(_.name||(_.display_name?_.display_name.split(",")[0]:"")).replace(/,\s*India$/i,"").trim();if(f&&!c.has(f.toLowerCase())){c.add(f.toLowerCase());const g=_.address||{},P=`${g.suburb||g.neighbourhood||g.residential||g.city_district||r}, ${r}`;l.push({name:f,location:P,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f+" "+r)}`,isMap:!0})}}}}catch(d){console.warn("Map grounds search failed:",d)}return l}async function gr(e=""){return Rn(e,"Pune","Maharashtra")}function hr(e,t){if(!e)return"";const n=`${t||(typeof window<"u"?window.location.origin:"https://selectedsports.github.io")}/auction-register/${e.auction_code||""}`,r=e.auction_date?Me(e.auction_date):"To Be Announced",s=e.auction_time||"To Be Announced",l=e.location||"Ground / Venue to be confirmed",c=e.organized_by?`
🛡️ *Organized By:* ${e.organized_by}`:"",p=`₹${Number(e.player_entry_fee)>0?Number(e.player_entry_fee):180}`;return`🏏 *PLAYER REGISTRATION OPEN — ${(e.name||"CRICKET TOURNAMENT").toUpperCase()}* 🏏${c}

📅 *Auction Date:* ${r}
⏰ *Auction Time:* ${s}
📍 *Venue:* ${l}
💰 *Player Entry Fee:* ${p} (Mandatory for player registration)

📢 *ATTENTION CRICKET PLAYERS:*
Official player registrations are now LIVE! All players must register before the auction deadline to enter the player pool and get picked by franchise teams.

📝 *How to Register:*
1️⃣ Click the official registration link below
2️⃣ Enter your Mobile Number (existing player details will auto-fill)
3️⃣ Review & edit your Name, Playing Role, City, Jersey # & Profile Photo
4️⃣ Pay the ${p} registration fee via Google Pay / UPI & attach payment screenshot
5️⃣ Submit your registration — the organizer will verify your payment and approve you into the live auction pool!

👉 *REGISTER NOW VIA OFFICIAL LINK:*
🔗 ${n}

⚡ _Register and transfer the entry fee before the deadline to ensure your spot in the auction!_
🏆 *Selected Sports Cricket Platform*`}function yr(e,t){if(!t||t.length===0){alert("No players in the auction pool to export.");return}const a=["Lot No","Player Name","Player Type / Role","City","Base Price (Coins)","Category"],n=t.map((d,p)=>{const u=m=>`"${String(m??"").replace(/"/g,'""')}"`;return[p+1,u(d.name||""),u(d.playing_role||"—"),u(d.city||"—"),d.base_price??0,u(d.category||"—")].join(",")}),r="data:text/csv;charset=utf-8,\uFEFF"+[a.join(","),...n].join(`\r
`),s=encodeURI(r),l=document.createElement("a"),c=`${((e==null?void 0:e.name)||"Auction").replace(/[^a-zA-Z0-9_-]/g,"_")}_Player_Pool_${t.length}_Players.csv`;l.setAttribute("href",s),l.setAttribute("download",c),document.body.appendChild(l),l.click(),document.body.removeChild(l)}function Bn(e,t){if(!t||t.length===0)return"";const a=(e==null?void 0:e.name)||"Cricket Tournament Auction",n=e!=null&&e.auction_date?Me(e.auction_date):"Upcoming",r=(e==null?void 0:e.auction_time)||"8:00 PM IST",s=(e==null?void 0:e.location)||"Venue TBD",l={"All-rounder":[],Batsman:[],Bowler:[],Wicketkeeper:[],Other:[]};t.forEach(u=>{const m=(u.playing_role||"").toLowerCase();m.includes("all")?l["All-rounder"].push(u):m.includes("bat")?l.Batsman.push(u):m.includes("bowl")?l.Bowler.push(u):m.includes("keep")||m.includes("wk")?l.Wicketkeeper.push(u):l.Other.push(u)});let c=`🏏 *OFFICIAL AUCTION PLAYER POOL — FOR CAPTAINS*
`;c+=`🏆 *${a}*
`,c+=`👥 *Total Players in Pool:* ${t.length} Players
`,c+=`📅 *Auction Date:* ${n} · ${r}
`,c+=`📍 *Venue:* ${s}

`,c+=`Dear Captains & Franchise Owners,
`,c+=`Here is the official list of ${t.length} players available in the auction pool for your pre-bidding strategy & purse allocation:

`;let d=1;const p=(u,m)=>{if(m.length===0)return"";let _=`*${u.toUpperCase()} (${m.length}):*
`;return m.forEach(h=>{const f=h.city?` · ${h.city}`:"",g=` · Base: 🪙 ${Number(h.base_price||0).toLocaleString("en-IN")}`;_+=`${d}. *${h.name}*${f}${g}
`,d++}),_+=`
`,_};return c+=p("🏏 All-Rounders",l["All-rounder"]),c+=p("⚡ Batsmen",l.Batsman),c+=p("🎯 Bowlers",l.Bowler),c+=p("🧤 Wicketkeepers",l.Wicketkeeper),l.Other.length>0&&(c+=p("👥 Other Players",l.Other)),c+=`🎯 *Captains, analyze your squad composition & coin reserves before the live auction stage!*
`,c+=`🔒 _Note: Player contact numbers are strictly confidential and withheld for player privacy._
`,c+="🏆 *Selected Sports Auction Platform*",c}function wr(e,t){const a=Bn(e,t);if(!a)return;const n=`https://api.whatsapp.com/send?text=${encodeURIComponent(a)}`;window.open(n,"_blank")}function _r(e,t){if(!t||t.length===0){alert("No players found in the auction pool to export.");return}const a=f=>String(f??"").replace(/[&<>"']/g,g=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[g]),n=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),r=(e==null?void 0:e.name)||"Selected Sports Cricket Auction",s=t.reduce((f,g)=>f+(Number(g.base_price)||0),0);let l=0,c=0,d=0,p=0;t.forEach(f=>{const g=(f.playing_role||"").toLowerCase();g.includes("all")?l++:g.includes("bat")?c++:g.includes("bowl")?d++:(g.includes("keep")||g.includes("wk"))&&p++});const u=t.map((f,g)=>{const b=g+1,P=f.playing_role||"Player",y=P.toLowerCase();let F="role-other",v="🏏";y.includes("all")?(F="role-all",v="🏏"):y.includes("bat")?(F="role-bat",v="⚡"):y.includes("bowl")?(F="role-bowl",v="🎯"):(y.includes("keep")||y.includes("wk"))&&(F="role-keep",v="🧤");const k=(f.name||"?").slice(0,1).toUpperCase(),C=f.profile_image_url?`<img src="${a(f.profile_image_url)}" alt="${a(f.name)}" class="player-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="player-initials-fallback" style="display:none;">${a(k)}</div>`:`<div class="player-initials-fallback">${a(k)}</div>`;return`
      <div class="player-card">
        <div class="card-top">
          <span class="lot-badge">#${b<10?"0"+b:b}</span>
          <span class="role-badge ${F}">${v} ${a(P)}</span>
        </div>
        <div class="photo-container">
          ${C}
        </div>
        <div class="player-name">${a(f.name)}</div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">📍 City</span>
            <span class="detail-val">${a(f.city||"—")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🪙 Base Price</span>
            <span class="detail-val base-price">🪙 ₹${Number(f.base_price||0).toLocaleString("en-IN")}</span>
          </div>
          ${f.category?`
          <div class="detail-row">
            <span class="detail-label">🏷️ Category</span>
            <span class="detail-val">${a(f.category)}</span>
          </div>`:""}
        </div>
      </div>
    `}).join(""),m=t.map((f,g)=>{const b=g+1,P=(f.name||"?").slice(0,1).toUpperCase(),y=f.profile_image_url?`<img src="${a(f.profile_image_url)}" alt="${a(f.name)}" class="table-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" /><span class="table-thumb-fallback" style="display:none;">${a(P)}</span>`:`<span class="table-thumb-fallback">${a(P)}</span>`;return`
      <tr>
        <td style="text-align:center;font-weight:800;color:#64748B;">#${b<10?"0"+b:b}</td>
        <td style="width:40px;text-align:center;">${y}</td>
        <td><strong style="color:#0F172A;font-size:13px;">${a(f.name)}</strong></td>
        <td><span class="table-role">${a(f.playing_role||"—")}</span></td>
        <td>${a(f.city||"—")}</td>
        <td style="font-weight:800;color:#166534;text-align:right;">🪙 ₹${Number(f.base_price||0).toLocaleString("en-IN")}</td>
        <td>${a(f.category||"—")}</td>
      </tr>
    `}).join(""),_=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${a(r)} — Official Auction Player Pool (${t.length} Players)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 12mm 10mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 16px;
      font-size: 12px;
    }
    .no-print-bar {
      background: #F0FDF4;
      border: 1.5px solid #BBF7D0;
      padding: 12px 18px;
      border-radius: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(22,101,52,0.06);
    }
    .no-print-btn {
      background: #166534;
      color: #FFFFFF;
      padding: 9px 20px;
      border-radius: 9px;
      border: none;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .close-btn {
      background: #FFFFFF;
      color: #64748B;
      padding: 9px 16px;
      border-radius: 9px;
      border: 1.5px solid #CBD5E1;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .header {
      border-bottom: 2.5px solid #166534;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tour-tag {
      font-size: 11px;
      color: #B8860B;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-title {
      font-size: 22px;
      font-weight: 900;
      color: #166534;
      margin: 2px 0 0;
      letter-spacing: -0.5px;
    }
    .confidential-banner {
      background: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 14px;
      font-size: 11px;
      color: #92400E;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      background: #F8FAF8;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 18px;
      text-align: center;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 14px;
      font-weight: 900;
      color: #0F172A;
      margin-top: 2px;
    }
    .stat-val.green {
      color: #166534;
    }

    .section-title {
      font-size: 14px;
      font-weight: 900;
      color: #0F172A;
      margin: 20px 0 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 6px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .player-card {
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      background: #FFFFFF;
      page-break-inside: avoid;
      box-shadow: 0 1px 4px rgba(15,23,42,0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .card-top {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .lot-badge {
      font-size: 10.5px;
      font-weight: 900;
      color: #64748B;
      background: #F1F5F9;
      padding: 2px 7px;
      border-radius: 6px;
    }
    .role-badge {
      font-size: 9.5px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .role-all { background: #DCFCE7; color: #166534; }
    .role-bat { background: #DBEAFE; color: #1E40AF; }
    .role-bowl { background: #FFEDD5; color: #C2410C; }
    .role-keep { background: #F3E8FF; color: #7E22CE; }
    .role-other { background: #F1F5F9; color: #475569; }

    .photo-container {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 8px;
      border: 2px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F8FAF8;
    }
    .player-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .player-initials-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #166534, #14532D);
      color: #FFFFFF;
      font-weight: 900;
      font-size: 22px;
    }
    .player-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      line-height: 1.25;
    }
    .card-details {
      width: 100%;
      border-top: 1px dashed #E2E8F0;
      padding-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .detail-label {
      color: #64748B;
      font-weight: 600;
    }
    .detail-val {
      color: #0F172A;
      font-weight: 700;
    }
    .detail-val.base-price {
      color: #166534;
      font-weight: 800;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-top: 8px;
      page-break-inside: avoid;
    }
    th {
      background: #166534;
      color: #FFFFFF;
      text-align: left;
      padding: 7px 9px;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    td {
      padding: 6px 9px;
      border-bottom: 1px solid #E2E8F0;
    }
    tr:nth-child(even) td {
      background: #FAFCFA;
    }
    .table-thumb {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: cover;
      vertical-align: middle;
    }
    .table-thumb-fallback {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #166534;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      vertical-align: middle;
    }
    .table-role {
      font-weight: 700;
      color: #334155;
    }

    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }

    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0; }
      .cards-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .player-card { border: 1px solid #CBD5E1; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong style="color:#166534;font-size:13.5px;">📄 Official Auction Player Pool (${t.length} Players)</strong>
      <div style="font-size:11.5px;color:#475569;margin-top:2px;">Shared for Captains &amp; Franchise Owners Pre-Bidding Analysis. Mobile numbers are withheld for privacy.</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="no-print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
      <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
  </div>

  <div class="header">
    <div class="brand">
      <img src="${window.location.origin}/logo-full.png?v=1" alt="Selected Sports" style="height:42px;width:auto;" onerror="this.style.display='none'"/>
      <div>
        <div class="tour-tag">${a(r)}</div>
        <h1 class="doc-title">Auction Player Pool Catalog</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:900;color:#0F172A;letter-spacing:0.5px;">OFFICIAL SCOUTING DOSSIER</div>
      <div style="font-size:10.5px;color:#64748B;margin-top:2px;">Pool Size: <strong>${t.length} Players</strong></div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${n}</div>
    </div>
  </div>

  <div class="confidential-banner">
    <span>🔒</span>
    <span><strong>CONFIDENTIAL FOR FRANCHISE CAPTAINS &amp; OWNERS:</strong> This roster is provided solely for pre-auction squad planning and bid strategy analysis. Player mobile numbers are strictly withheld for privacy.</span>
  </div>

  <div class="stats-bar">
    <div class="stat-box">
      <span class="stat-label">Total in Pool</span>
      <span class="stat-val green">${t.length}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Total Base Value</span>
      <span class="stat-val green">🪙 ₹${s.toLocaleString("en-IN")}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">All-Rounders</span>
      <span class="stat-val">${l}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Batsmen</span>
      <span class="stat-val">${c}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Bowlers</span>
      <span class="stat-val">${d}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Wicketkeepers</span>
      <span class="stat-val">${p}</span>
    </div>
  </div>

  <div class="section-title">
    <span>📸</span> Player Scouting Cards (Visual Roster)
  </div>
  <div class="cards-grid">
    ${u}
  </div>

  <div class="section-title">
    <span>📋</span> Master Player Roster Table
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:45px;text-align:center;">Lot #</th>
        <th style="width:40px;text-align:center;">Photo</th>
        <th>Player Name</th>
        <th style="width:130px;">Playing Role</th>
        <th style="width:110px;">City</th>
        <th style="width:115px;text-align:right;">Base Price</th>
        <th style="width:100px;">Category</th>
      </tr>
    </thead>
    <tbody>
      ${m}
    </tbody>
  </table>

  <div class="footer">
    <div>Selected Sports Auction Platform · Official Tournament Document</div>
    <div>Strictly Confidential · For Team Captains &amp; Owners Bidding Analysis</div>
  </div>
</body>
</html>`,h=window.open("","_blank");if(!h){alert("Please allow pop-ups to open the PDF export.");return}h.document.write(_),h.document.close(),h.onload=()=>{setTimeout(()=>{try{h.print()}catch{}},350)}}function Tn({size:e=36}){return i.jsx("img",{src:"/logo-icon-v4.png",alt:"Selected Sports",style:{height:e,width:"auto",display:"block"}})}function br({size:e=40}){return i.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[i.jsx(Tn,{size:e}),i.jsxs("div",{children:[i.jsx("div",{style:{color:"#0F172A",fontFamily:"var(--font-head)",fontWeight:700,fontSize:e*.44,letterSpacing:"-0.5px",lineHeight:1.1},children:"Selected"}),i.jsx("div",{style:{color:"#B8860B",fontFamily:"var(--font-head)",fontWeight:600,fontSize:e*.27,letterSpacing:"2.5px",textTransform:"uppercase",lineHeight:1.1},children:"Sports"})]})]})}function H({name:e,id:t,sz:a=34}){return i.jsx("div",{style:{width:a,height:a,borderRadius:"50%",background:kn(t),display:"flex",alignItems:"center",justifyContent:"center",fontSize:a*.3,fontWeight:700,color:"#0F172A",flexShrink:0,letterSpacing:"-0.5px",fontFamily:"var(--font-head)"},children:zn(e)})}const he={green:{bg:"rgba(25,182,106,0.12)",tx:"rgba(34,197,94,0.15)"},lime:{bg:"rgba(132,204,22,0.12)",tx:"#4D7C0F"},yellow:{bg:"rgba(244,180,0,0.12)",tx:"rgba(246,196,83,0.15)"},red:{bg:"rgba(229,57,53,0.1)",tx:"rgba(231,76,60,0.15)"},blue:{bg:"rgba(37,95,184,0.1)",tx:"#FFFFFF"},teal:{bg:"rgba(20,184,166,0.12)",tx:"#0F766E"},orange:{bg:"rgba(251,146,60,0.12)",tx:"rgba(251,146,60,0.15)"},purple:{bg:"rgba(167,139,250,0.12)",tx:"rgba(91,33,182,0.12)"},gray:{bg:"#F8FAF8",tx:"#F8FAF8"}},ye={founder:{label:"Founder",icon:rt,bg:"linear-gradient(135deg,#FBBF24,#D4A017)",color:"#FFFFFF"},organizer:{label:"Organizer",icon:nt,bg:"#166534",color:"#FFFFFF"},pro:{label:"PRO",icon:ee,bg:"#FFFFFF",color:"#2563EB",border:"1.5px solid #2563EB"},player:{label:"Player",icon:we,bg:"#22C55E",color:"#FFFFFF"},guest:{label:"Guest",icon:at,bg:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0"}};function Q({role:e="player",size:t="md"}){const[a,n]=x.useState(!1);x.useEffect(()=>{const l=setTimeout(()=>n(!0),10);return()=>clearTimeout(l)},[]);const r=ye[e]||ye.player,s=t==="sm";return i.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:s?4:6,padding:s?"3px 9px":"5px 13px",borderRadius:999,background:r.bg,color:r.color,border:r.border||"none",fontSize:s?10:12,fontWeight:700,fontFamily:"var(--font-body)",boxShadow:"0 2px 6px rgba(15,23,42,0.12)",whiteSpace:"nowrap",opacity:a?1:0,transform:a?"scale(1)":"scale(0.95)",transition:"opacity 250ms, transform 250ms"},children:[i.jsx(r.icon,{size:s?11:13}),r.label]})}function xr({children:e,col:t="gray"}){const a=he[t]||he.gray;return i.jsx("span",{style:{background:a.bg,color:a.tx,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-block",fontFamily:"var(--font-head)"},children:e})}function Fr({children:e,onClick:t,variant:a="primary",size:n="md",disabled:r=!1,style:s={}}){const l={border:"none",borderRadius:10,cursor:r?"not-allowed":"pointer",fontWeight:600,fontFamily:"var(--font-body)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,opacity:r?.55:1},c={primary:{background:"linear-gradient(135deg,#166534,#FFFFFF)",color:"#0F172A"},green:{background:"#166534",color:"#0F172A"},danger:{background:"rgba(229,57,53,0.1)",color:"#DC2626",border:"1px solid rgba(229,57,53,0.3)"},ghost:{background:"#F8FAF8",color:"#0F172A"},wa:{background:"rgba(25,182,106,0.12)",color:"#166534",border:"1px solid rgba(25,182,106,0.3)"},outline:{background:"transparent",color:"#166534",border:"1.5px solid #166534"},dark:{background:"#FFFFFF",color:"#0F172A",border:"none"}},d={sm:{padding:"5px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};return i.jsx("button",{onClick:r?void 0:t,style:{...l,...c[a],...d[n],...s},children:e})}function W(){return i.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:48},children:[i.jsx("div",{style:{width:32,height:32,borderRadius:"50%",border:"3px solid #E2E8F0",borderTopColor:"#166534",animation:"spin 0.7s linear infinite"}}),i.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})}function ae({children:e,style:t={},onClick:a}){return i.jsx("div",{onClick:a,style:{background:"#FFFFFF",borderRadius:16,border:"1.5px solid #E2E8F0",boxShadow:"0 1px 4px rgba(37,95,184,0.06)",...t},children:e})}function vr({messages:e,onClose:t,player:a}){const[n,r]=x.useState(""),[s,l]=x.useState(!1),[c,d]=x.useState(!1),[p,u]=x.useState(null),[m,_]=x.useState([]),[h,f]=x.useState(!1),g=async()=>{if(!(!n.trim()||!a)){l(!0);try{const y=await Ee();y&&(await ke(a.id,y,n.trim()),d(!0),r(""))}catch(y){alert(y.message)}l(!1)}},b=y=>{const F=y.match(/\[\[match:([a-zA-Z0-9-]+)\]\]/);return{clean:y.replace(/\[\[match:[a-zA-Z0-9-]+\]\]/,"").trim(),matchId:F?F[1]:null}},P=async y=>{u(y),f(!0);try{_(await ve(y))}catch(F){alert(F.message)}f(!1)};if(p){const y=m.filter(v=>v.status==="confirmed"),F=m.filter(v=>v.status==="waitlist");return i.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:i.jsxs("div",{onClick:v=>v.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[i.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[i.jsxs("button",{onClick:()=>u(null),style:{background:"transparent",border:"none",fontSize:13,fontWeight:700,color:"#166534",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0},children:[i.jsx(ot,{size:15})," Back"]}),i.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),h?i.jsx(W,{}):i.jsxs(i.Fragment,{children:[i.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:10,fontFamily:"var(--font-head)"},children:["Confirmed (",y.length,")"]}),i.jsx("div",{style:{marginBottom:18},children:y.length===0?i.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one confirmed yet."}):y.map(v=>{var k,C;return i.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[i.jsx(H,{name:((k=v.players)==null?void 0:k.name)||"Player",id:v.player_id,sz:28}),i.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((C=v.players)==null?void 0:C.name)||"Player"})]},v.id)})}),i.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#B8860B",marginBottom:10,fontFamily:"var(--font-head)"},children:["Waitlist (",F.length,")"]}),i.jsx("div",{children:F.length===0?i.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one on the waitlist."}):F.map(v=>{var k,C;return i.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[i.jsx(H,{name:((k=v.players)==null?void 0:k.name)||"Player",id:v.player_id,sz:28}),i.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((C=v.players)==null?void 0:C.name)||"Player"})]},v.id)})})]})]})})}return i.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:i.jsxs("div",{onClick:y=>y.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[i.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[i.jsxs("div",{style:{fontWeight:700,fontSize:16,fontFamily:"var(--font-head)",color:"#0F172A",display:"flex",alignItems:"center",gap:8},children:[i.jsx(it,{size:18})," Messages"]}),i.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),e.length===0&&i.jsx("div",{style:{color:"#64748B",fontSize:13,textAlign:"center",padding:"20px 0"},children:"No messages yet."}),e.map(y=>{const{clean:F,matchId:v}=b(y.message);return i.jsxs("div",{onClick:v?()=>P(v):void 0,style:{padding:"12px 0",borderBottom:"1px solid #E2E8F0",cursor:v?"pointer":"default"},children:[i.jsx("div",{style:{fontSize:13,color:"#0F172A",lineHeight:1.5},children:F}),i.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:5,display:"flex",alignItems:"center",gap:6},children:["From ",y.sender," · ",y.created_at?new Date(y.created_at).toLocaleString():"",v&&i.jsxs("span",{style:{color:"#166534",fontWeight:700,display:"flex",alignItems:"center",gap:2},children:["· View squad ",i.jsx(xe,{size:11})]})]})]},y.id)}),a&&i.jsxs("div",{style:{marginTop:14,paddingTop:14,borderTop:"1.5px solid #E2E8F0"},children:[i.jsx("div",{style:{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:8},children:"Reply to Admin"}),c&&i.jsx("div",{style:{fontSize:12,color:"#166534",marginBottom:8},children:"✓ Sent! Full conversation is in Direct Messages."}),i.jsxs("div",{style:{display:"flex",gap:8},children:[i.jsx("input",{value:n,onChange:y=>r(y.target.value),onKeyDown:y=>y.key==="Enter"&&g(),placeholder:"Type a reply...",style:{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#F8FAF8",color:"#0F172A",fontSize:13,outline:"none",fontFamily:"var(--font-body)"}}),i.jsx("button",{onClick:g,disabled:s,style:{padding:"9px 14px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:600},children:s?"...":"Send"})]})]})]})})}function Sr({isMobile:e,myId:t}){const[n,r]=x.useState([]),[s,l]=x.useState(!0),[c,d]=x.useState(null),[p,u]=x.useState(!1),[m,_]=x.useState(!1),[h,f]=x.useState("points"),[g,b]=x.useState("all"),[P,y]=x.useState(!1),[F,v]=x.useState("all"),[k,C]=x.useState(!1);if(x.useEffect(()=>{je().then(w=>{r(w),setTimeout(()=>u(!0),50),w.length>0&&(_(!0),setTimeout(()=>_(!1),2e3))}).catch(w=>d(w.message||String(w))).finally(()=>l(!1))},[]),s)return i.jsx(W,{});const q=Array.from(new Set(n.map(w=>{var S;return(((S=w.matches)==null?void 0:S.date)||"").slice(0,4)}).filter(Boolean))).sort().reverse(),A=n.filter(w=>{var S,B;return!(g!=="all"&&(((S=w.matches)==null?void 0:S.date)||"").slice(0,4)!==g||F!=="all"&&(((B=w.players)==null?void 0:B.role)||"player")!==F)}),z={};A.forEach(w=>{const S=w.players;S&&(z[S.id]||(z[S.id]={id:S.id,name:S.name,city:S.city,role:S.role,matchesPlayed:0,earliestConfirmedAt:w.created_at}),z[S.id].matchesPlayed++,w.created_at&&(!z[S.id].earliestConfirmedAt||w.created_at<z[S.id].earliestConfirmedAt)&&(z[S.id].earliestConfirmedAt=w.created_at))});const E=Object.values(z).map(w=>({...w,points:w.matchesPlayed*20})).sort((w,S)=>S.points!==w.points?S.points-w.points:w.earliestConfirmedAt?S.earliestConfirmedAt?new Date(w.earliestConfirmedAt)-new Date(S.earliestConfirmedAt):-1:1),R=E.slice(0,3),L=E.slice(3),j=t?E.findIndex(w=>w.id===t):-1,N=["#FBBF24","#94A3B8","#B45309"],O={1:200,2:100,3:0},J=({p:w,rank:S})=>{if(!w)return i.jsx("div",{style:{flex:1}});const B=S-1,$=S===1;return i.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",opacity:p?1:0,transform:p?"translateY(0) scale(1)":"translateY(20px) scale(0.95)",transition:`opacity 300ms ease-in-out ${O[S]}ms, transform 300ms ease-in-out ${O[S]}ms`},children:[$&&i.jsxs("div",{style:{background:"linear-gradient(135deg,#FBBF24,#F59E0B)",color:"#FFFFFF",fontSize:9,fontWeight:800,padding:"3px 10px",borderRadius:20,display:"flex",alignItems:"center",gap:3,marginBottom:8,boxShadow:"0 4px 10px rgba(212,160,23,0.4)"},title:"Most Valuable Player",children:[i.jsx(ee,{size:10,fill:"#FFFFFF"})," MVP"]}),i.jsxs("div",{style:{position:"relative",padding:$?"18px 14px 14px":"14px 10px",borderRadius:20,background:$?"linear-gradient(180deg,rgba(251,191,36,0.14),rgba(251,191,36,0.04))":"#FFFFFF",border:$?"1.5px solid rgba(251,191,36,0.35)":"1.5px solid #E2E8F0",width:"100%",textAlign:"center"},children:[i.jsxs("div",{style:{position:"relative",display:"inline-block",marginBottom:8},children:[i.jsx("div",{style:{borderRadius:"50%",boxShadow:$?"0 0 30px rgba(251,191,36,0.25)":"none"},children:i.jsx(H,{name:w.name,id:w.id,sz:S===1?e?52:60:e?40:46})}),i.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:20,height:20,borderRadius:"50%",background:N[B],color:"#FFFFFF",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #FFFFFF"},children:S})]}),i.jsx("div",{style:{fontWeight:700,fontSize:S===1?13:12,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:w.name}),w.role&&w.role!=="player"&&i.jsx("div",{style:{marginTop:4,display:"flex",justifyContent:"center"},children:i.jsx(Q,{role:w.role,size:"sm"})}),i.jsxs("div",{style:{fontSize:11,color:"#94A3B8",marginTop:3},children:[w.matchesPlayed," Matches"]}),i.jsxs("div",{style:{fontSize:$?20:16,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:2},children:[w.points," ",i.jsx("span",{style:{fontSize:10,fontWeight:700,color:"#94A3B8"},children:"PTS"})]})]})]})},Oe=({i:w})=>{const S=["#FBBF24","#14532D","#22C55E","#FBBF24"],B=Math.random()*100,$=Math.random()*300,We=1200+Math.random()*500,Ue=Math.random()*360,Ge=S[w%S.length];return i.jsx("div",{style:{position:"absolute",top:-10,left:B+"%",width:7,height:7,background:Ge,borderRadius:w%2===0?"50%":2,animation:`confettiFall ${We}ms ease-in ${$}ms forwards`,transform:`rotate(${Ue}deg)`}})},X=({label:w})=>i.jsxs(ae,{style:{padding:"40px 20px",textAlign:"center"},children:[i.jsx("div",{style:{marginBottom:12,display:"flex",justifyContent:"center"},children:i.jsx(pe,{size:32,color:"#E2E8F0"})}),i.jsxs("div",{style:{fontWeight:800,fontSize:15,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)"},children:[w," isn't tracked yet"]}),i.jsx("div",{style:{color:"#64748B",fontSize:12,maxWidth:280,margin:"0 auto"},children:"This needs ball-by-ball match scoring, which hasn't been built yet. Once live scoring is added, this tab will populate automatically."})]});return i.jsxs("div",{style:{position:"relative"},children:[i.jsx("style",{children:`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(220px) rotate(280deg); }
        }
      `}),m&&i.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:240,overflow:"hidden",pointerEvents:"none",zIndex:5},children:Array.from({length:30}).map((w,S)=>i.jsx(Oe,{i:S},S))}),i.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:10,flexWrap:"wrap"},children:[i.jsxs("h2",{style:{fontFamily:"var(--font-head)",color:"#0F172A",fontSize:e?18:20,margin:0,display:"flex",alignItems:"center",gap:8},children:[i.jsx(_e,{size:e?20:22,color:"#B8860B"})," Leaderboard"]}),i.jsxs("div",{style:{position:"relative"},children:[i.jsxs("button",{onClick:()=>C(w=>!w),style:{padding:"8px 14px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[F==="all"?"All Players":F==="pro"?"Pro Only":"Players Only"," ",i.jsx(ue,{size:13})]}),k&&i.jsx("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:140,overflow:"hidden"},children:[["all","All Players"],["player","Players Only"],["pro","Pro Only"]].map(([w,S])=>i.jsx("button",{onClick:()=>{v(w),C(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:F===w?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:F===w?700:500},children:S},w))})]})]}),i.jsxs("div",{style:{position:"relative",marginBottom:14},children:[i.jsxs("button",{onClick:()=>y(w=>!w),style:{padding:"8px 14px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[i.jsx(Qe,{size:13})," ",g==="all"?"All Seasons":`Season ${g}`," ",i.jsx(ue,{size:13})]}),P&&i.jsxs("div",{style:{position:"absolute",top:"100%",left:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:140,overflow:"hidden"},children:[i.jsx("button",{onClick:()=>{b("all"),y(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:g==="all"?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:g==="all"?700:500},children:"All Seasons"}),q.map(w=>i.jsxs("button",{onClick:()=>{b(w),y(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:g===w?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:g===w?700:500},children:["Season ",w]},w))]})]}),i.jsx("div",{style:{display:"flex",gap:8,marginBottom:18,overflowX:"auto"},children:[["points","Points Table",et],["runs","Most Runs",tt],["wickets","Most Wickets",pe],["sixes","Most 6s",be]].map(([w,S,B])=>i.jsxs("button",{onClick:()=>f(w),style:{padding:"9px 14px",borderRadius:999,border:h===w?"none":"1.5px solid #E2E8F0",background:h===w?"#166534":"#FFFFFF",color:h===w?"#FFFFFF":"#64748B",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0},children:[i.jsx(B,{size:13})," ",S]},w))}),h==="runs"&&i.jsx(X,{label:"Most Runs"}),h==="wickets"&&i.jsx(X,{label:"Most Wickets"}),h==="sixes"&&i.jsx(X,{label:"Most 6s"}),h==="points"&&(c?i.jsxs("div",{style:{color:"#EF4444",fontSize:13,textAlign:"center",padding:"30px 0",background:"rgba(239,68,68,0.06)",borderRadius:12,border:"1px solid rgba(239,68,68,0.25)"},children:["⚠️ Couldn't load the leaderboard: ",c]}):E.length===0?i.jsxs("div",{style:{color:"#475569",fontSize:13,textAlign:"center",padding:"30px 0"},children:["No matches played yet",g!=="all"?` in Season ${g}`:"","."]}):i.jsxs(i.Fragment,{children:[R.length>0&&i.jsxs("div",{style:{display:"flex",alignItems:"stretch",gap:8,marginBottom:20,padding:"0 4px"},children:[i.jsx(J,{p:R[1],rank:2}),i.jsx(J,{p:R[0],rank:1}),i.jsx(J,{p:R[2],rank:3})]}),L.length>0&&i.jsxs("div",{style:{borderRadius:14,overflow:"hidden",border:"1px solid #E2E8F0",marginBottom:16},children:[i.jsxs("div",{style:{display:"flex",alignItems:"center",padding:"12px 16px",background:"#166534",color:"#FFFFFF",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.4},children:[i.jsx("div",{style:{width:26},children:"#"}),i.jsx("div",{style:{flex:1},children:"Player"}),i.jsx("div",{style:{width:70,textAlign:"center"},children:"Type"}),i.jsx("div",{style:{width:60,textAlign:"center"},children:"Matches"}),i.jsx("div",{style:{width:70,textAlign:"right"},children:"Points"}),i.jsx("div",{style:{width:18}})]}),L.map((w,S)=>{const B=S+4,$=w.id===t;return i.jsxs("div",{style:{display:"flex",alignItems:"center",padding:"12px 16px",background:$?"rgba(34,197,94,0.05)":"#FFFFFF",borderTop:"1px solid #F1F5F9"},children:[i.jsx("div",{style:{width:26,fontSize:13,fontWeight:800,color:"#475569",fontFamily:"var(--font-head)"},children:B}),i.jsxs("div",{style:{flex:1,display:"flex",alignItems:"center",gap:10,minWidth:0},children:[i.jsx(H,{name:w.name,id:w.id,sz:30}),i.jsx("div",{style:{minWidth:0},children:i.jsxs("div",{style:{fontWeight:700,fontSize:13,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[w.name,$&&i.jsx("span",{style:{marginLeft:6,background:"#166534",color:"#FFFFFF",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:6},children:"YOU"})]})})]}),i.jsxs("div",{style:{width:70,textAlign:"center"},children:[w.role&&w.role!=="player"&&i.jsx(Q,{role:w.role,size:"sm"}),(!w.role||w.role==="player")&&i.jsx(Q,{role:"player",size:"sm"})]}),i.jsx("div",{style:{width:60,textAlign:"center",fontSize:13,fontWeight:700,color:"#0F172A"},children:w.matchesPlayed}),i.jsxs("div",{style:{width:70,textAlign:"right",fontSize:13,fontWeight:800,color:"#166534",fontFamily:"var(--font-head)"},children:[w.points," ",i.jsx("span",{style:{fontSize:9,fontWeight:600,color:"#94A3B8"},children:"PTS"})]}),i.jsx("div",{style:{width:18,display:"flex",justifyContent:"flex-end"},children:i.jsx(xe,{size:15,color:"#94A3B8"})})]},w.id)})]}),j>=0&&i.jsxs(ae,{style:{padding:"14px 16px",display:"flex",alignItems:"center",gap:14,background:"rgba(34,197,94,0.06)",border:"1.5px solid rgba(34,197,94,0.25)"},children:[i.jsx("div",{style:{width:40,height:40,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:i.jsx(ee,{size:18,color:"#FFFFFF",fill:"#FFFFFF"})}),i.jsxs("div",{style:{flex:1,minWidth:0},children:[i.jsxs("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)"},children:["#",j+1]}),i.jsxs("div",{style:{fontSize:12,color:"#64748B"},children:[E[j].matchesPlayed," Matches Played"]})]}),i.jsxs("div",{style:{fontSize:22,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",flexShrink:0},children:[E[j].points," ",i.jsx("span",{style:{fontSize:11,fontWeight:700,color:"#94A3B8"},children:"PTS"})]})]})]}))]})}function jr({player:e}){const[t,a]=x.useState(null),[n,r]=x.useState(!0),[s,l]=x.useState(!1),[c,d]=x.useState(!1);x.useEffect(()=>{Ae(e.id).then(a).catch(()=>{}).finally(()=>r(!1))},[e.id]);const p=async()=>{l(!0);try{const _=await Pe(e.id);a(_)}catch(_){alert(_.message)}l(!1)},u=async()=>{if(t!=null&&t.id){d(!0);try{await Ce(t.id),a(null)}catch(_){alert(_.message)}d(!1)}};if(e.role==="pro"||n)return null;const m=t==null?void 0:t.status;return i.jsxs(ae,{style:{padding:"16px",marginTop:16},children:[i.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:8,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:8},children:[i.jsx(fe,{size:17,color:"#166534"})," Schedule Your Own Matches"]}),i.jsx("div",{style:{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.5},children:"Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days."}),m==="pending"?i.jsxs(i.Fragment,{children:[i.jsx("div",{style:{padding:"10px 12px",background:"rgba(216,176,91,0.1)",borderRadius:10,color:"#B8860B",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:10},children:"⏳ Your request is pending admin approval"}),i.jsx("button",{onClick:u,disabled:c,style:{width:"100%",padding:"9px",borderRadius:10,background:"transparent",border:"1.5px solid #E2E8F0",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)"},children:c?"Cancelling...":"Cancel Request"})]}):i.jsx("button",{onClick:p,disabled:s,style:{width:"100%",padding:"11px",borderRadius:10,background:"linear-gradient(135deg,#166534,#FFFFFF)",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:s?"Sending...":m==="rejected"?"Request Again":i.jsxs(i.Fragment,{children:[i.jsx(fe,{size:15})," Request to Schedule Matches"]})})]})}const ce="ss_session";function In(e,t=null){try{localStorage.setItem(ce,JSON.stringify({role:e,player:t}))}catch{}}function Dn(){try{return JSON.parse(localStorage.getItem(ce)||"null")}catch{return null}}function Ne(){try{localStorage.removeItem(ce)}catch{}}class Ln extends x.Component{constructor(t){super(t),this.state={hasError:!1,isChunkError:!1}}static getDerivedStateFromError(t){const a=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();return{hasError:!0,isChunkError:/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(a)}}componentDidCatch(t,a){console.error("SelectedSports App Error caught by boundary:",t,a);const n=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();if(/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(n)){const r=parseInt(sessionStorage.getItem("boundary_reload_ts")||"0",10);if(Date.now()-r>6e3){sessionStorage.setItem("boundary_reload_ts",String(Date.now()));const s=new URL(window.location.href);s.searchParams.set("_v",String(Date.now())),window.location.replace(s.toString())}}}render(){return this.state.hasError?this.state.isChunkError?i.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"},children:[i.jsx(W,{}),i.jsx("p",{style:{marginTop:16,fontSize:13,color:"#64748B",fontWeight:600,fontFamily:"var(--font-head)"},children:"Updating application..."})]}):i.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",fontFamily:"var(--font-body)"},children:[i.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"rgba(22,101,52,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16},children:"🏏"}),i.jsx("h2",{style:{fontSize:20,fontWeight:900,color:"#0F172A",margin:"0 0 8px",fontFamily:"var(--font-head)"},children:"Selected Sports"}),i.jsx("p",{style:{fontSize:13,color:"#64748B",maxWidth:360,margin:"0 0 20px",lineHeight:1.5},children:"Something unexpected happened. Tap below to reload."}),i.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"},children:[i.jsx("button",{onClick:()=>window.location.reload(),style:{padding:"12px 22px",borderRadius:12,background:"#166534",color:"#FFFFFF",border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)"},children:"🔄 Reload App"}),i.jsx("button",{onClick:()=>{Ne(),localStorage.clear(),window.location.href="/"},style:{padding:"12px 18px",borderRadius:12,background:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0",fontSize:13,fontWeight:700,cursor:"pointer"},children:"Return to Home"})]})]}):this.props.children}}function D(e){return x.lazy(async()=>{try{return await e()}catch(t){console.warn("Chunk load failed, auto-reloading to fetch new version:",t);const a=parseInt(sessionStorage.getItem("chunk_reload_ts")||"0",10),n=Date.now();if(n-a>8e3){sessionStorage.setItem("chunk_reload_ts",String(n));const r=new URL(window.location.href);return r.searchParams.set("_v",String(n)),window.location.replace(r.toString()),new Promise(()=>{})}throw t}})}const Mn=D(()=>I(()=>import("./LoginScreens-BwKYq4v8.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.UnifiedLoginScreen}))),Nn=D(()=>I(()=>import("./LoginScreens-BwKYq4v8.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegisterScreen}))),On=D(()=>I(()=>import("./LoginScreens-BwKYq4v8.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegistrationSubmittedScreen}))),Wn=D(()=>I(()=>import("./AdminPortal-ByYJjtIO.js").then(e=>e.A),__vite__mapDeps([4,1,5,2,6,3]))),Un=D(()=>I(()=>import("./PlayerPortal-B6rrYiEM.js"),__vite__mapDeps([6,1,2,3]))),Gn=D(()=>I(()=>import("./ProPortal-DvebQrAM.js"),__vite__mapDeps([7,1,2,4,5,6,3]))),Hn=D(()=>I(()=>import("./PublicInvitePage-BImWn8lJ.js"),__vite__mapDeps([8,1,3]))),Yn=D(()=>I(()=>import("./PublicAuctionView-DcpLalR1.js"),__vite__mapDeps([9,1,3]))),Vn=D(()=>I(()=>import("./PublicAuctionRegister-D4LE-g6e.js"),__vite__mapDeps([10,1,2,5,3]))),Zn=D(()=>I(()=>import("./TeamOwnerView-CNJnwn96.js"),__vite__mapDeps([11,1,3])));function K(){const t=new URLSearchParams(window.location.search).get("p");t&&window.history.replaceState(null,"",t)}function Kn(){K();const t=window.location.pathname.match(/\/join\/([a-zA-Z0-9\-]+)/);return t?t[1]:null}function Jn(){K();const e=window.location.pathname.match(/\/live-auction(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function Xn(){K();const e=window.location.pathname.match(/\/auction-register(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function Qn(){K();const e=window.location.pathname.match(/\/team-view\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/?$/);return e?{auctionCode:e[1],teamId:e[2]}:null}function er(){const[e,t]=x.useState("home"),[a,n]=x.useState(null),[r,s]=x.useState(!1),[l,c]=x.useState([]),[d,p]=x.useState(!1),[u,m]=x.useState(null),[_,h]=x.useState(null),[f,g]=x.useState(null),[b,P]=x.useState(null);x.useEffect(()=>{const z=Qn();if(z){P(z),t("teamView");return}const E=Jn();if(E!==void 0){h(E),t("liveAuction");return}const R=Xn();if(R!==void 0){g(R),t("auctionRegister");return}const L=Kn();if(L){m(L),t("publicInvite");return}const j=Dn();(j==null?void 0:j.role)==="admin"||(j==null?void 0:j.role)==="founder"?(s(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="organizer"&&(j!=null&&j.player)?(s(!0),C(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="pro"&&(j!=null&&j.player)?(s(!1),v(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="player"&&(j!=null&&j.player)&&(s(!1),n(j.player),y().then(()=>t("portal")))},[]);const y=async()=>{p(!0);try{c(await Fe())}catch{}p(!1)},[F,v]=x.useState(!1),[k,C]=x.useState(!1),q=async z=>{const E=(z.phone||"").replace(/[^0-9]/g,"").slice(-10),R=An.replace(/[^0-9]/g,"").slice(-10);console.log("phone:",E,"adminPhone:",R);const L=E===R||z.role==="founder",j=!L&&z.role==="organizer",N=L||j,O=!N&&z.role==="pro";s(N),C(j),v(O),n(z),N||await y(),In(L?"founder":j?"organizer":O?"pro":"player",z),t("portal")},A=()=>{Ne(),n(null),s(!1),v(!1),C(!1),c([]),t("home")};return i.jsx(Ln,{children:i.jsxs(x.Suspense,{fallback:i.jsx("div",{style:{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"},children:i.jsx(W,{})}),children:[e==="publicInvite"&&i.jsx(Hn,{token:u}),e==="liveAuction"&&i.jsx(Yn,{auctionCode:_}),e==="teamView"&&i.jsx(Zn,{auctionCode:b==null?void 0:b.auctionCode,teamId:b==null?void 0:b.teamId}),e==="auctionRegister"&&i.jsx(Vn,{auctionCode:f}),e==="home"&&i.jsx(Cn,{onLogin:()=>t("login"),onRegister:()=>t("register")}),e==="register"&&i.jsx(Nn,{onSuccess:()=>t("registered"),onBack:()=>t("home")}),e==="registered"&&i.jsx(On,{onBack:()=>t("home")}),e==="login"&&i.jsx(Mn,{onAdminSuccess:q,onPlayerSuccess:q,onBack:()=>t("home"),onRegister:()=>t("register")}),e==="portal"&&r&&i.jsx(Wn,{player:a,onLogout:A,isFounder:!k}),e==="portal"&&!r&&F&&i.jsx(Gn,{player:a,onLogout:A}),e==="portal"&&!r&&!F&&(d||!a?i.jsx("div",{style:{minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center"},children:i.jsx(W,{})}):i.jsx(Un,{player:a,matches:l,onLogout:A}))]})})}document.documentElement.style.setProperty("background","#F8FAF8","important");document.body.style.setProperty("background","#F8FAF8","important");"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(e=>{e.forEach(t=>t.unregister())}).catch(()=>{});"caches"in window&&caches.keys().then(e=>{e.forEach(t=>caches.delete(t))}).catch(()=>{});async function de(){try{const e=await fetch("/version.json?_cb="+Date.now(),{cache:"no-store"});if(!e.ok)return;const t=await e.json();if(t!=null&&t.v&&t.v>1789022953471){console.warn("New build detected on server. Reloading to latest:",t.v,">",1789022953471);const a=new URL(window.location.href);a.searchParams.set("_v",String(t.v)),window.location.replace(a.toString())}}catch{}}de();setInterval(de,3e4);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&de()});window.addEventListener("vite:preloadError",e=>{e.preventDefault(),console.warn("Dynamic import preload error, fetching fresh bundle:",e);const t=parseInt(sessionStorage.getItem("vite_preload_ts")||"0",10);if(Date.now()-t>6e3){sessionStorage.setItem("vite_preload_ts",String(Date.now()));const a=new URL(window.location.href);a.searchParams.set("_v",String(Date.now())),window.location.replace(a.toString())}});window.addEventListener("unhandledrejection",e=>{var a;const t=((a=e.reason)==null?void 0:a.message)||String(e.reason||"");if(/dynamically imported|loading chunk|failed to fetch/i.test(t)){e.preventDefault();const n=parseInt(sessionStorage.getItem("unhandled_chunk_ts")||"0",10);if(Date.now()-n>6e3){sessionStorage.setItem("unhandled_chunk_ts",String(Date.now()));const r=new URL(window.location.href);r.searchParams.set("_v",String(Date.now())),window.location.replace(r.toString())}}});st.createRoot(document.getElementById("root")).render(i.jsx(lt.StrictMode,{children:i.jsx(er,{})}));export{dn as $,An as A,Fr as B,ae as C,En as D,or as E,nr as F,Sn as G,Ga as H,hn as I,Za as J,la as K,Sr as L,qn as M,Kt as N,kt as O,ge as P,Tt as Q,Q as R,W as S,xr as T,$t as U,yr as V,_r as W,pr as X,mr as Y,un as Z,I as _,rr as a,ea as a$,wn as a0,nn as a1,_n as a2,se as a3,Ma as a4,mn as a5,Ka as a6,Ha as a7,Qt as a8,ia as a9,zt as aA,_t as aB,Be as aC,Me as aD,hr as aE,Bn as aF,Ta as aG,dr as aH,an as aI,xt as aJ,xn as aK,Fa as aL,en as aM,tn as aN,ir as aO,cr as aP,Nt as aQ,Xa as aR,Da as aS,aa as aT,vn as aU,ja as aV,Yt as aW,Ot as aX,In as aY,Rn as aZ,gr as a_,Vt as aa,Pt as ab,ba as ac,je as ad,Rt as ae,ma as af,ve as ag,Fe as ah,cn as ai,ha as aj,wt as ak,wa as al,Jt as am,bn as an,va as ao,rn as ap,pn as aq,Ca as ar,pa as as,fa as at,Ft as au,ga as av,ua as aw,Ut as ax,yt as ay,Z as az,sr as b,Na as b0,Wt as b1,wr as b2,fr as b3,Ja as b4,ta as b5,o as b6,fn as b7,Lt as b8,Xt as b9,Qa as ba,ln as bb,Wa as bc,La as bd,Va as be,At as bf,Dt as bg,It as bh,St as bi,Oa as bj,ya as bk,qt as bl,ht as bm,gt as bn,yn as bo,pt as bp,H as c,Tn as d,br as e,vr as f,$n as g,jr as h,gn as i,sa as j,Zt as k,Ct as l,re as m,Ia as n,Et as o,Fn as p,Sa as q,Ht as r,ur as s,lr as t,Re as u,Mt as v,xa as w,sn as x,Ya as y,Bt as z};
