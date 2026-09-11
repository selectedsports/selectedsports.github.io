const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LoginScreens-CTj8qggc.js","assets/vendor-react-wgmC8U7r.js","assets/PhotoCropModal-DXbBm7d8.js","assets/vendor-supabase-BUgTx0zs.js","assets/AdminPortal-B9uQbmry.js","assets/indianStatesCities-CBX8Li9T.js","assets/PlayerPortal-K3gCRdWz.js","assets/ProPortal-C_l0Y_Uv.js","assets/PublicInvitePage-D1NysK4Q.js","assets/PublicAuctionView-CmivZ0ha.js","assets/PublicAuctionRegister-BJmUuR_Y.js","assets/TeamOwnerView-BEen8Z5f.js"])))=>i.map(i=>d[i]);
import{ac as _,a6 as at,$ as je,a3 as ke,ab as o,W as nt,a9 as Ce,z as rt,d as Pe,b as ot,Z as it,K as st,C as lt,i as ye,g as ct,a0 as xe,B as dt,S as ut,j as Ae,t as pt,_ as ft,V as mt,s as ze,a as gt,I as ht,f as be,aa as yt,R as xt}from"./vendor-react-wgmC8U7r.js";import{c as bt}from"./vendor-supabase-BUgTx0zs.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=a(r);fetch(r.href,s)}})();const wt="modulepreload",_t=function(e){return"/"+e},we={},D=function(t,a,n){let r=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),c=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));r=Promise.allSettled(a.map(d=>{if(d=_t(d),d in we)return;we[d]=!0;const p=d.endsWith(".css"),u=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${u}`))return;const f=document.createElement("link");if(f.rel=p?"stylesheet":wt,p||(f.as="script"),f.crossOrigin="",f.href=d,c&&f.setAttribute("nonce",c),document.head.appendChild(f),p)return new Promise((b,y)=>{f.addEventListener("load",b),f.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(l){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=l,window.dispatchEvent(c),!c.defaultPrevented)throw l}return r.then(l=>{for(const c of l||[])c.status==="rejected"&&s(c.reason);return t().catch(s)})};function Ft(e=900){const[t,a]=_.useState(()=>window.innerWidth<=e);return _.useEffect(()=>{const n=()=>a(window.innerWidth<=e);return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[e]),t}const vt="https://vsuemsmjbkrciidbvmfj.supabase.co",St="sb_publishable_CXzyHivaMP9h5IfZYqu7fw_bALpjwuq",i=bt(vt,St);function Q(e){if(!e)return null;const t=new Date(e),a=new Date;let n=a.getFullYear()-t.getFullYear();return a.getMonth()>t.getMonth()||a.getMonth()===t.getMonth()&&a.getDate()>=t.getDate()||n--,n<19?"Under 19":null}async function se(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10),{data:a,error:n}=await i.from("players").select("id, phone");if(n)throw n;return(a||[]).some(r=>(r.phone||"").replace(/[^0-9]/g,"").slice(-10)===t)}async function jt(e,t){const a=e.name.split(".").pop(),r=`profile-photos/${(t||"anon").replace(/[^0-9]/g,"")}-${Date.now()}.${a}`,{error:s}=await i.storage.from("team-assets").upload(r,e,{upsert:!0});if(s)throw s;const{data:l}=i.storage.from("team-assets").getPublicUrl(r);return l.publicUrl}async function kt(e,t,a){const n=e.name.split(".").pop(),r=(a||"anon").replace(/[^0-9]/g,""),s=`payment-receipts/${t||"auc"}-${r}-${Date.now()}.${n}`,{error:l}=await i.storage.from("team-assets").upload(s,e,{upsert:!0});if(l)throw l;const{data:c}=i.storage.from("team-assets").getPublicUrl(s);return c.publicUrl}async function X(e,t,a){try{await i.from("activity_log").insert({actor_player_id:e||null,action:t,summary:a})}catch{}}async function Ct(e=8){const{data:t,error:a}=await i.from("activity_log").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function H(e,t){try{await i.from("notifications").insert({type:e,message:t})}catch{}}async function Pt(e=20){const{data:t,error:a}=await i.from("notifications").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function At(){const{count:e,error:t}=await i.from("notifications").select("id",{count:"exact",head:!0}).eq("read",!1);if(t)throw t;return e||0}async function zt(e){const{error:t}=await i.from("notifications").update({read:!0}).eq("id",e);if(t)throw t}async function Et(){const{error:e}=await i.from("notifications").update({read:!0}).eq("read",!1);if(e)throw e}async function Rt(){const{data:e,error:t}=await i.from("players").select("*").order("name");if(t)throw t;return e}async function le(e,t,a="1234",n=null,r=null,s=null,l={}){if(await se(t))throw new Error("This phone number is already registered.");const c=Q(r),{data:d,error:p}=await i.from("players").insert({name:e,phone:t,pin:a,created_by:n,birth_date:r||null,profile_image_url:s||null,category:c,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,registration_source:l.source||"direct"}).select().single();if(p)throw p;return d&&d.approved===!1&&await H("player_pending",`${e} registered and is awaiting approval`),d}async function qt(e){const{data:t,error:a}=await i.from("players").select("*").eq("created_by",e).order("name");if(a)throw a;return t}async function $t(e,t,a,n,r,s={}){const l={name:t,phone:a,pin:n,city:r};s.birthDate!==void 0&&(l.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(l.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(l.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(l.jersey_size=s.jerseySize||null);const{error:c}=await i.from("players").update(l).eq("id",e);if(c)throw c;try{const d=(a||"").replace(/[^0-9]/g,"").slice(-10);if(d){const p={};t&&(p.name=t),r&&(p.city=r),s.birthDate!==void 0&&(p.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(p.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(p.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(p.jersey_size=s.jerseySize||null),Object.keys(p).length>0&&await i.from("auction_players").update(p).ilike("phone",`%${d}`)}}catch(d){console.warn("Could not sync auction_players:",d)}}async function Bt(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function Tt(){const{data:e,error:t}=await i.from("grounds").select("*").order("name");if(t)throw t;return e}async function It(e,t,a,n){const{data:r,error:s}=await i.from("grounds").insert({name:e,location:t,maps_link:a,notes:n}).select().single();if(s)throw s;return r}async function Dt(e,t){const{error:a}=await i.from("grounds").update(t).eq("id",e);if(a)throw a}async function Lt(e){const{error:t}=await i.from("grounds").delete().eq("id",e);if(t)throw t}async function Nt(){const{data:e,error:t}=await i.from("teams").select("*").order("name");if(t)throw t;return e}async function Ot(e,t){const{data:a,error:n}=await i.from("teams").insert({name:e,logo_url:t}).select().single();if(n)throw n;return a}async function Wt(e,t,a){const{error:n}=await i.from("teams").update({name:t,logo_url:a}).eq("id",e);if(n)throw n}async function Mt(e){const{error:t}=await i.from("teams").delete().eq("id",e);if(t)throw t}async function ce(e,t){const a=e.name.split(".").pop(),n=`team-logos/${t.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:r}=await i.storage.from("team-assets").upload(n,e,{upsert:!0});if(r)throw r;const{data:s}=i.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function Ee(){const{data:e,error:t}=await i.from("matches").select("*").order("date",{ascending:!1});if(t)throw t;return e}async function Ut(e){const{data:t,error:a}=await i.from("matches").select("*").eq("invite_token",e).single();if(a)throw a;return t}async function Gt({date:e,time_slot:t,ground:a,team:n,team_logo:r,our_team:s,our_team_logo:l,type:c,max_players:d,created_by:p,visibility:u}){const{data:f,error:b}=await i.from("matches").insert({date:e,time_slot:t,ground:a,team:n,team_logo:r,our_team:s||null,our_team_logo:l||null,type:c,max_players:d,created_by:p||null,status:"upcoming",link_active:!1,visibility:u||"private"}).select().single();if(b)throw b;let y="Someone";if(p){const{data:h}=await i.from("players").select("name").eq("id",p).maybeSingle();h!=null&&h.name&&(y=h.name)}const m=s?`${s} vs ${n}`:n;return await X(p,"match_created",`${y} created ${m}`),f}async function Ht(e){await i.from("match_players").delete().eq("match_id",e),await i.from("expenses").delete().eq("match_id",e),await i.from("payments").delete().eq("match_id",e),await i.from("chat_messages").delete().eq("match_id",e),await i.from("public_responses").delete().eq("match_id",e);const{error:t}=await i.from("matches").delete().eq("id",e);if(t)throw t}async function Yt(e,t){const{error:a}=await i.from("matches").update({status:t}).eq("id",e);if(a)throw a;if(t==="completed"){const{data:n}=await i.from("matches").select("team, our_team").eq("id",e).maybeSingle();n&&await X(null,"match_completed",`Match completed: ${n.our_team?`${n.our_team} vs ${n.team}`:n.team}`)}}async function Vt(e,t){const{error:a}=await i.from("matches").update({max_players:t}).eq("id",e);if(a)throw a}async function Kt(e,t){const{error:a}=await i.from("matches").update({link_active:t}).eq("id",e);if(a)throw a}async function Re(e){const{data:t,error:a}=await i.from("match_players").select("*, players(id, name, phone, role)").eq("match_id",e).order("responded_at",{ascending:!0,nullsFirst:!1});if(a)throw a;return t}async function Zt(e,t,a){let n=a||"confirmed",r=!1,s=null;if(n==="confirmed"){const{data:c}=await i.from("matches").select("max_players, team, date").eq("id",e).single();s=c;const d=(c==null?void 0:c.max_players)||0;if(d>0){const{data:p}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!p||p.status!=="confirmed"){const{count:u}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(u||0)>=d?n="waitlist":(u||0)+1===d&&(r=!0)}}}const{error:l}=await i.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(l)throw l;if(r&&n==="confirmed"&&s)try{const{data:c}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","confirmed"),d=(c||[]).map(u=>u.player_id),p=`🔒 Squad full for ${s.team} on ${s.date}! See you there 🏏[[match:${e}]]`;await Promise.all(d.map(u=>qe(u,"System",p).catch(()=>{})))}catch{}return n}async function Jt(e,t){const{error:a}=await i.from("match_players").upsert({match_id:e,player_id:t,status:"pending"},{onConflict:"match_id,player_id"});if(a)throw a}async function Qt(e,t){const{error:a}=await i.from("match_players").delete().eq("match_id",e).eq("player_id",t);if(a)throw a;await de(e)}async function Xt(e,t,a){let n=a;if(a==="confirmed"){const{data:s}=await i.from("matches").select("max_players").eq("id",e).single(),l=(s==null?void 0:s.max_players)||0;if(l>0){const{data:c}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!c||c.status!=="confirmed"){const{count:d}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(d||0)>=l&&(n="waitlist")}}}const{error:r}=await i.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(r)throw r;return a!=="confirmed"&&await de(e),n}async function ea(e){const{data:t,error:a}=await i.from("public_responses").select("*").eq("match_id",e).order("created_at");if(a)throw a;return t}async function ta(e,t,a,n){const{data:r}=await i.from("public_responses").select("id").eq("match_id",e).ilike("name",t.trim()).maybeSingle();if(r){const{error:c}=await i.from("public_responses").update({availability:n,phone:a,approved:null}).eq("id",r.id);if(c)throw c;return{updated:!0}}const{data:s,error:l}=await i.from("public_responses").insert({match_id:e,name:t.trim(),phone:(a==null?void 0:a.trim())||null,availability:n,approved:null}).select().single();if(l)throw l;return s}async function aa(e,t,a,n,r){const{data:s}=await i.from("match_players").select("id").eq("match_id",t).eq("status","confirmed"),c=((s==null?void 0:s.length)||0)>=r;let d=null;const{data:p}=await i.from("players").select("*").ilike("name",a.trim()).maybeSingle();if(p)d=p,n&&!p.phone&&await i.from("players").update({phone:n}).eq("id",p.id);else{const{data:b,error:y}=await i.from("players").insert({name:a.trim(),phone:(n==null?void 0:n.trim())||null,pin:"1234"}).select().single();if(y)throw y;d=b}const u=c?"waitlist":"confirmed";await i.from("match_players").upsert({match_id:t,player_id:d.id,status:u,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});const{error:f}=await i.from("public_responses").update({approved:!0,player_id:d.id}).eq("id",e);if(f)throw f;return{player:d,status:u}}async function na(e){const{error:t}=await i.from("public_responses").update({approved:!1}).eq("id",e);if(t)throw t}async function ra(e){const{data:t,error:a}=await i.from("expenses").select("*").eq("match_id",e);if(a)throw a;return t}async function oa(e,t,a){const{data:n,error:r}=await i.from("expenses").insert({match_id:e,label:t,amount:a}).select().single();if(r)throw r;return n}async function ia(e){const{error:t}=await i.from("expenses").delete().eq("id",e);if(t)throw t}async function sa(e){const{data:t,error:a}=await i.from("payments").select("*").eq("match_id",e);if(a)throw a;return t}async function la(e,t,a){const{error:n}=await i.from("payments").upsert({match_id:e,player_id:t,paid:a},{onConflict:"match_id,player_id"});if(n)throw n}async function ca(e){const{data:t,error:a}=await i.from("chat_messages").select("*").eq("match_id",e).order("sent_at");if(a)throw a;return t}async function da(e,t,a){const{data:n,error:r}=await i.from("chat_messages").insert({match_id:e,sender:t,message:a}).select().single();if(r)throw r;return n}function ua(e,t){return i.channel("chat:"+e).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:`match_id=eq.${e}`},a=>t(a.new)).subscribe()}async function ee(){const{data:e,error:t}=await i.from("settings").select("*");if(t)throw t;return Object.fromEntries((e||[]).map(a=>[a.key,a.value]))}async function I(e,t){const{error:a}=await i.from("settings").upsert({key:e,value:t},{onConflict:"key"});if(a)throw a}async function pa(e,t,a,n=null,r=null,s={}){if(await se(t))throw new Error("This phone number is already registered.");const l=Q(n),{data:c,error:d}=await i.from("players").insert({name:e,phone:t,pin:a,approved:!0,birth_date:n||null,profile_image_url:r||null,category:l,city:s.city||null,jersey_number:s.jerseyNumber||null,jersey_size:s.jerseySize||null,registration_source:"direct"}).select().single();if(d)throw d;return c}async function fa(){const{data:e,error:t}=await i.from("players").select("*").eq("approved",!1).order("id",{ascending:!1});if(t)throw t;return e}async function ma(e){const{error:t}=await i.from("players").update({approved:!0}).eq("id",e);if(t)throw t;const{data:a}=await i.from("players").select("name").eq("id",e).maybeSingle();a!=null&&a.name&&await X(null,"player_approved",`${a.name} was approved`)}async function ga(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function ha(e){const{data:t,error:a}=await i.from("contributions").select("*").eq("player_id",e).order("date",{ascending:!1});if(a)throw a;return t}async function ya(e,t,a,n,r){const{data:s,error:l}=await i.from("contributions").insert({player_id:e,amount:t,note:a||null,date:n||new Date().toISOString().split("T")[0],match_id:r||null}).select().single();if(l)throw l;return s}async function xa(e){const{error:t}=await i.from("contributions").delete().eq("id",e);if(t)throw t}async function ba(e,t){if(!t)return!1;const{data:a}=await i.from("contributions").select("id").eq("player_id",e).eq("match_id",t).maybeSingle();return!!a}async function wa(){const[e,t,a]=await Promise.all([i.from("matches").select("id",{count:"exact",head:!0}),i.from("players").select("id",{count:"exact",head:!0}),i.from("grounds").select("id",{count:"exact",head:!0})]);return{matches:e.count||0,players:t.count||0,venues:a.count||0}}async function _a(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);let n=0;if(a.length>0){const{data:s}=await i.from("match_players").select("player_id").in("match_id",a);n=new Set((s||[]).map(l=>l.player_id)).size}const{count:r}=await i.from("grounds").select("id",{count:"exact",head:!0});return{matches:a.length,players:n,venues:r||0}}async function Fa(e){const{data:t,error:a}=await i.from("match_players").select("status, matches(id, date, time_slot, ground, team, our_team, status, type)").eq("player_id",e).eq("status","confirmed");if(a)throw a;return(t||[]).map(n=>n.matches).filter(Boolean).sort((n,r)=>new Date(r.date)-new Date(n.date))}async function va(e){const{data:t}=await i.from("match_players").select("match_id, status").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(r=>r.match_id);let n=0;if(a.length>0){const{data:r}=await i.from("matches").select("ground").in("id",a);n=new Set((r||[]).map(s=>s.ground).filter(Boolean)).size}return{matches:a.length,venues:n}}async function Sa(e){if(!e||e.length===0)return{};const{data:t}=await i.from("match_players").select("match_id, status").in("match_id",e).eq("status","confirmed"),a={};return(t||[]).forEach(n=>{a[n.match_id]=(a[n.match_id]||0)+1}),a}async function de(e){const{data:t}=await i.from("matches").select("max_players").eq("id",e).single(),a=(t==null?void 0:t.max_players)||0;if(a<=0)return null;const{count:n}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");if((n||0)>=a)return null;const{data:r}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","waitlist").order("responded_at",{ascending:!0,nullsFirst:!1}).limit(1);if(!r||r.length===0)return null;const s=r[0].player_id;return await i.from("match_players").update({status:"confirmed"}).eq("match_id",e).eq("player_id",s),s}async function ja(e){const{data:t}=await i.from("matches").select("id, date").eq("created_by",e),a=(t||[]).map(d=>d.id);if(a.length===0)return[];const n=Object.fromEntries((t||[]).map(d=>[d.id,d.date])),{data:r}=await i.from("match_players").select("match_id, player_id, status, players(id, name, phone, city)").in("match_id",a),{data:s}=await i.from("contributions").select("player_id, amount").in("match_id",a),l={};(s||[]).forEach(d=>{l[d.player_id]=(l[d.player_id]||0)+Number(d.amount)});const c={};return(r||[]).forEach(d=>{const p=d.players;if(p)if(c[p.id]||(c[p.id]={id:p.id,name:p.name,phone:p.phone,city:p.city,played:0,confirmed:0,declined:0,contributed:0,lastPlayedDate:null}),d.status==="confirmed"){c[p.id].confirmed++,c[p.id].played++;const u=n[d.match_id];u&&(!c[p.id].lastPlayedDate||u>c[p.id].lastPlayedDate)&&(c[p.id].lastPlayedDate=u)}else d.status==="declined"&&c[p.id].declined++}),Object.values(c).forEach(d=>{d.contributed=l[d.id]||0}),Object.values(c).sort((d,p)=>p.played-d.played)}async function ka(e){const[{data:t,error:a},{data:n,error:r}]=await Promise.all([i.from("match_players").select("status, matches(*)").eq("player_id",e),i.from("matches").select("*").eq("visibility","public").eq("status","upcoming")]);if(a)throw a;if(r)throw r;const s=(t||[]).filter(d=>d.matches).map(d=>({match:d.matches,myStatus:d.status})),l=new Set(s.map(d=>d.match.id)),c=(n||[]).filter(d=>!l.has(d.id)).map(d=>({match:d,myStatus:"pending"}));return[...s,...c]}async function Ca(e,t){const{error:a}=await i.from("players").update({upi_id:t}).eq("id",e);if(a)throw a}async function Pa(e){try{if(e!=null&&e.created_by){const{data:t}=await i.from("players").select("upi_id").eq("id",e.created_by).maybeSingle();if(t!=null&&t.upi_id)return t.upi_id}}catch{}try{const t=await ee();return(t==null?void 0:t.upi)||(t==null?void 0:t.upi_id)||""}catch{return""}}async function qe(e,t,a){const{error:n}=await i.from("admin_messages").insert({player_id:e,sender:t,message:a});if(n)throw n}async function Aa(){const{data:e,error:t}=await i.from("admin_messages").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function za(e){const{data:t,error:a}=await i.from("admin_messages").select("*").or(`player_id.eq.${e},player_id.is.null`).order("created_at",{ascending:!1});if(a)throw a;return t}async function Ea(e){const{count:t,error:a}=await i.from("admin_messages").select("id",{count:"exact",head:!0}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(a)throw a;return t||0}async function Ra(e){const{error:t}=await i.from("admin_messages").update({read_at:new Date().toISOString()}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(t)throw t}async function $e(){const{data:e,error:t}=await i.from("match_players").select("player_id, status, created_at, players(id, name, city, role, profile_image_url), matches!inner(status, date, team, our_team)").eq("status","confirmed").eq("matches.status","completed");if(t)throw t;return e||[]}async function Be(e){const{data:t,error:a}=await i.from("pro_requests").insert({player_id:e,status:"pending"}).select().single();if(a)throw a;const{data:n}=await i.from("players").select("name").eq("id",e).maybeSingle();return n!=null&&n.name&&await H("pro_request",`${n.name} requested Pro access`),t}async function Te(e){const{error:t}=await i.from("pro_requests").delete().eq("id",e);if(t)throw t}async function Ie(e){const{data:t,error:a}=await i.from("pro_requests").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(a)throw a;return t}async function qa(){const{data:e,error:t}=await i.from("pro_requests").select("*, players(id, name, phone)").eq("status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function $a(e,t){const a=new Date(Date.now()+5184e6).toISOString().slice(0,10),{error:n}=await i.from("players").update({role:"pro",subscription_expiry:a}).eq("id",t);if(n)throw n;const{error:r}=await i.from("pro_requests").update({status:"approved",decided_at:new Date().toISOString()}).eq("id",e);if(r)throw r}async function Ba(e){const{error:t}=await i.from("pro_requests").update({status:"rejected",decided_at:new Date().toISOString()}).eq("id",e);if(t)throw t}async function Ta(e=5){const{data:t,error:a}=await i.from("players").select("name, city, id").order("id",{ascending:!1}).limit(e);if(a)throw a;return t}async function Ia(e){const{data:t}=await i.from("match_players").select("match_id").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(d=>d.match_id);if(a.length===0)return[];const{data:n}=await i.from("matches").select("ground").in("id",a),r=Array.from(new Set((n||[]).map(d=>d.ground).filter(Boolean)));if(r.length===0)return[];const{data:s}=await i.from("grounds").select("id, name, location").in("name",r),l=new Set((s||[]).map(d=>d.name)),c=r.filter(d=>!l.has(d)).map(d=>({id:d,name:d,location:""}));return[...s||[],...c]}async function De(e,t,a){const{error:n}=await i.from("direct_messages").insert({sender_id:e,recipient_id:t,message:a});if(n)throw n}async function Da(e,t){const{data:a,error:n}=await i.from("direct_messages").select("*").or(`and(sender_id.eq.${e},recipient_id.eq.${t}),and(sender_id.eq.${t},recipient_id.eq.${e})`).order("created_at",{ascending:!0});if(n)throw n;return a}async function La(e){const{data:t,error:a}=await i.from("direct_messages").select("*, sender:sender_id(id,name), recipient:recipient_id(id,name)").or(`sender_id.eq.${e},recipient_id.eq.${e}`).order("created_at",{ascending:!1});if(a)throw a;const n={};return(t||[]).forEach(r=>{var c,d;const s=r.sender_id===e?r.recipient_id:r.sender_id,l=(r.sender_id===e?(c=r.recipient)==null?void 0:c.name:(d=r.sender)==null?void 0:d.name)||"Player";n[s]||(n[s]={otherId:s,otherName:l,lastMessage:r.message,lastAt:r.created_at,unread:0}),r.recipient_id===e&&!r.read_at&&n[s].unread++}),Object.values(n).sort((r,s)=>new Date(s.lastAt)-new Date(r.lastAt))}async function Na(e,t){const{error:a}=await i.from("direct_messages").update({read_at:new Date().toISOString()}).eq("recipient_id",e).eq("sender_id",t).is("read_at",null);if(a)throw a}async function Oa(e){const{count:t,error:a}=await i.from("direct_messages").select("id",{count:"exact",head:!0}).eq("recipient_id",e).is("read_at",null);if(a)throw a;return t||0}async function Wa(e){const{data:t}=await i.from("players").select("id, name, role").eq("role","admin"),{data:a}=await i.from("match_players").select("status, matches(created_by)").eq("player_id",e).eq("status","confirmed"),n=Array.from(new Set((a||[]).map(l=>{var c;return(c=l.matches)==null?void 0:c.created_by}).filter(Boolean)));let r=[];if(n.length>0){const{data:l}=await i.from("players").select("id, name, role").in("id",n).eq("role","pro");r=l||[]}const s=new Map;return[...t||[],...r].forEach(l=>s.set(l.id,l)),Array.from(s.values())}async function Ma(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);if(a.length===0)return[];const{data:n}=await i.from("match_players").select("player_id, status, players(id, name)").in("match_id",a).eq("status","confirmed"),r=new Map;return(n||[]).forEach(s=>{s.players&&!r.has(s.player_id)&&r.set(s.player_id,s.players)}),Array.from(r.values())}async function Le(){const{count:e,error:t}=await i.from("players").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ne(){const{data:e,error:t}=await i.from("players").select("id").eq("role","admin").limit(1).maybeSingle();if(t)throw t;return(e==null?void 0:e.id)||null}async function Ua(e,t,a){const{error:n}=await i.from("feedback").insert({player_id:e,sender_name:t,message:a});if(n)throw n}async function Ga(){const{data:e,error:t}=await i.from("feedback").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Ha(e){const t=(e||"").trim();if(!t)return{players:[],teams:[],grounds:[],matches:[]};const[a,n,r,s]=await Promise.all([i.from("players").select("id, name, city, role").ilike("name",`%${t}%`).limit(5),i.from("teams").select("id, name").ilike("name",`%${t}%`).limit(5),i.from("grounds").select("id, name, location").ilike("name",`%${t}%`).limit(5),i.from("matches").select("id, team, our_team, ground, date, status").ilike("team",`%${t}%`).limit(5)]);return{players:a.data||[],teams:n.data||[],grounds:r.data||[],matches:s.data||[]}}async function Oe(){const{count:e,error:t}=await i.from("matches").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function We(){const{count:e,error:t}=await i.from("teams").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ya(e,t){const a=(t.phone||"").replace(/[^0-9]/g,"").slice(-10);if(await Me(a,e))return null;const r=Q(t.birth_date),s=await Z(e),{data:l,error:c}=await i.from("auction_players").insert({name:t.name,phone:a,status:"registered",auction_id:e,birth_date:t.birth_date||null,profile_image_url:t.profile_image_url||null,category:r,city:t.city||null,jersey_number:t.jersey_number||null,jersey_size:t.jersey_size||null,base_price:s}).select().single();if(c)throw c;return l}async function Z(e){if(!e)return null;const{data:t}=await i.from("auctions").select("points_purse").eq("id",e).maybeSingle();return t!=null&&t.points_purse?Math.round(t.points_purse/100):null}async function Va(e,t,a,n=null,r=null,s=null,l={}){var y,m;const c=Q(n),d=await Z(s),p={name:e,phone:t,playing_role:a,status:l.status||"registered",birth_date:n||null,profile_image_url:r||null,category:c,auction_id:s||null,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,base_price:d};l.paymentScreenshotUrl&&(p.payment_screenshot_url=l.paymentScreenshotUrl),l.paymentStatus&&(p.payment_status=l.paymentStatus);let{data:u,error:f}=await i.from("auction_players").insert(p).select().single();if(f&&((y=f.message)!=null&&y.includes("payment_screenshot_url")||(m=f.message)!=null&&m.includes("payment_status"))){console.warn("Retrying registerAuctionPlayer without payment columns:",f.message),delete p.payment_screenshot_url,delete p.payment_status;const h=await i.from("auction_players").insert(p).select().single();if(h.error)throw h.error;u=h.data}else if(f)throw f;const b=l.status==="waitlist"?`${e} joined the waiting list for auction`:`${e} registered for the auction`;await H("auction_registration",b);try{await le(e,t,"1234",null,n,r,{...l,source:"auction"})}catch(h){console.error("Failed to sync auction registrant into main player roster:",h)}return u}async function Ka(e,t){const{error:a}=await i.from("auction_players").update({payment_status:t}).eq("id",e);if(a)throw a}async function Za(e,t,a=null){const n={status:t};a&&(n.payment_status=a);const{error:r}=await i.from("auction_players").update(n).eq("id",e);if(r)throw r}async function ue(e=null){let t=i.from("auction_players").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;return a}async function Me(e,t=null){const a=(e||"").replace(/[^0-9]/g,"").slice(-10);let n=i.from("auction_players").select("id, phone");n=t?n.eq("auction_id",t):n.is("auction_id",null);const{data:r,error:s}=await n;if(s)throw s;return(r||[]).some(l=>(l.phone||"").replace(/[^0-9]/g,"").slice(-10)===a)}async function Ue(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10);if(t.length!==10)return null;const{data:a,error:n}=await i.from("players").select("id, name, playing_role, birth_date, profile_image_url, category, city, jersey_number, jersey_size").ilike("phone",`%${t}`);if(n)throw n;return a&&a[0]||null}async function Ja(e=null){if(e){const{data:a,error:n}=await i.from("auctions").select("registration_open").eq("id",e).maybeSingle();if(n)throw n;return(a==null?void 0:a.registration_open)!==!1}const t=await ee();return(t==null?void 0:t.auction_registration_open)!=="false"}async function Qa(e,t){if(typeof e=="boolean"){await I("auction_registration_open",e?"true":"false");return}const{error:a}=await i.from("auctions").update({registration_open:t}).eq("id",e);if(a)throw a}async function Xa(e,t){const{error:a}=await i.from("players").update({playing_role:t}).eq("id",e);if(a)throw a;try{const{data:n}=await i.from("players").select("phone").eq("id",e).maybeSingle(),r=((n==null?void 0:n.phone)||"").replace(/[^0-9]/g,"").slice(-10);r&&await i.from("auction_players").update({playing_role:t}).ilike("phone",`%${r}`)}catch(n){console.warn("Could not sync auction_players role:",n)}}async function en(e,t){const{error:a}=await i.from("auction_players").update({base_price:t}).eq("id",e);if(a)throw a}async function tn(e,t){const{error:a}=await i.from("auction_players").update({category:t}).eq("id",e);if(a)throw a}async function an(e){const{error:t}=await i.from("auction_players").delete().eq("id",e);if(t)throw t}async function nn(e){const{error:t}=await i.from("auction_players").update({status:"dropped",payment_status:"refunded"}).eq("id",e);if(t)throw t}async function rn(e){const{error:t}=await i.from("auction_players").update({status:"registered",payment_status:"paid"}).eq("id",e);if(t)throw t}async function on(e=null){let t=i.from("auction_teams").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;if(!a||a.length===0)return[];try{const r=a.map(c=>`auction_team_logo_${c.id}`),{data:s}=await i.from("settings").select("key, value").in("key",r),l={};return s&&s.forEach(c=>{l[c.key]=c.value}),a.map(c=>({...c,logo_url:c.logo_url||l[`auction_team_logo_${c.id}`]||null}))}catch(r){return console.warn("Could not load team logos:",r),a}}async function pe(e,t,{captainPlayerId:a,captainPhone:n,captainName:r}){var l,c,d,p,u;const s=(n||"").replace(/[^0-9]/g,"").slice(-10);if(a){const f={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(f.name=r.trim());let b=await i.from("auction_players").update(f).eq("id",a);b.error&&((l=b.error.message)!=null&&l.includes("is_captain"))&&(delete f.is_captain,await i.from("auction_players").update(f).eq("id",a));return}if(s&&s.length===10){let f=i.from("auction_players").select("id, name, phone");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:b}=await f,y=(b||[]).find(A=>(A.phone||"").replace(/[^0-9]/g,"").slice(-10)===s);if(y){const A={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(A.name=r.trim());let P=await i.from("auction_players").update(A).eq("id",y.id);P.error&&((c=P.error.message)!=null&&c.includes("is_captain"))&&(delete A.is_captain,await i.from("auction_players").update(A).eq("id",y.id));return}let m=null,h=null,w=null,k=null,x=null,F=null,S=r?r.trim():"Captain";try{const A=await Ue(s);A&&(!r&&A.name&&(S=A.name),m=A.profile_image_url||null,h=A.playing_role||null,w=A.city||null,k=A.birth_date||null,x=A.jersey_number||null,F=A.jersey_size||null)}catch{}const z=await Z(t),C={name:S,phone:s,playing_role:h||"All-rounder",status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,profile_image_url:m,city:w,birth_date:k,jersey_number:x,jersey_size:F,base_price:z||0};let $=await i.from("auction_players").insert(C);$.error&&((d=$.error.message)!=null&&d.includes("is_captain"))&&(delete C.is_captain,await i.from("auction_players").insert(C));return}if(r&&r.trim()){let f=i.from("auction_players").select("id, name");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:b}=await f,y=(b||[]).find(m=>(m.name||"").trim().toLowerCase()===r.trim().toLowerCase());if(y){const m={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};let h=await i.from("auction_players").update(m).eq("id",y.id);h.error&&((p=h.error.message)!=null&&p.includes("is_captain"))&&(delete m.is_captain,await i.from("auction_players").update(m).eq("id",y.id))}else{const m=await Z(t),h={name:r.trim(),status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,base_price:m||0};let w=await i.from("auction_players").insert(h);w.error&&((u=w.error.message)!=null&&u.includes("is_captain"))&&(delete h.is_captain,await i.from("auction_players").insert(h))}}}async function sn(e,t,a,n=null,r=null,s=null,l=null,c=null,d=null,p=null){var m,h;const u={name:e,owner_name:t||null,captain_name:r||null,purse_total:a,purse_remaining:a,auction_id:n||null};s&&(u.captain_phone=s),l&&(u.owner_phone=l);let f,{data:b,error:y}=await i.from("auction_teams").insert(u).select().single();if(y&&((m=y.message)!=null&&m.includes("captain_phone")||(h=y.message)!=null&&h.includes("owner_phone"))){delete u.captain_phone,delete u.owner_phone;const w=await i.from("auction_teams").insert(u).select().single();if(w.error)throw w.error;f=w.data}else{if(y)throw y;f=b}if(f!=null&&f.id&&(c||s||r))try{await pe(f.id,n,{captainPlayerId:c,captainPhone:s,captainName:r})}catch(w){console.warn("Could not pre-assign captain:",w)}if(f!=null&&f.id)try{let w=p||null;d&&(w=await ce(d,e)),w&&(await I(`auction_team_logo_${f.id}`,w),f.logo_url=w)}catch(w){console.warn("Could not save team logo:",w)}return f}async function ln(e,{name:t,ownerName:a,purseTotal:n,captainName:r,captainPhone:s,ownerPhone:l,captainPlayerId:c,auctionId:d,logoFile:p,logoUrl:u}){var y,m;const f={name:t,owner_name:a||null,captain_name:r||null,purse_total:n,purse_remaining:n};s&&(f.captain_phone=s),l&&(f.owner_phone=l);let{error:b}=await i.from("auction_teams").update(f).eq("id",e);if(b&&((y=b.message)!=null&&y.includes("captain_phone")||(m=b.message)!=null&&m.includes("owner_phone"))){delete f.captain_phone,delete f.owner_phone;const h=await i.from("auction_teams").update(f).eq("id",e);if(h.error)throw h.error}else if(b)throw b;if(e&&(c||s||r))try{await pe(e,d,{captainPlayerId:c,captainPhone:s,captainName:r})}catch(h){console.warn("Could not update pre-assigned captain:",h)}try{if(p){const h=await ce(p,t);await I(`auction_team_logo_${e}`,h)}else u!==void 0&&(u?await I(`auction_team_logo_${e}`,u):await i.from("settings").delete().eq("key",`auction_team_logo_${e}`))}catch(h){console.warn("Could not update team logo:",h)}}async function cn(e){const{error:t}=await i.from("auction_players").update({status:"registered",sold_team_id:null,sold_price:null,sold_at:null}).eq("sold_team_id",e);if(t)throw t;try{await i.from("auction_bids").delete().eq("team_id",e)}catch(n){console.warn("Could not delete bids for team:",n)}try{await i.from("auctions").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("auction_state").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("settings").delete().eq("key",`auction_team_logo_${e}`)}catch{}const{error:a}=await i.from("auction_teams").delete().eq("id",e);if(a)throw a}async function dn(e=null){if(e)return await Ye(e);const{data:t,error:a}=await i.from("auction_state").select("*").eq("id",1).single();if(a)throw a;return t}function Ge(e,t){const a=e.filter(r=>r.id!==t&&r.status==="registered"&&!r.is_captain&&r.status!=="captain");if(a.length===0)return null;const n=Math.floor(Math.random()*a.length);return a[n]}async function un(e,t=null){const a=await ue(t),n=Ge(a,null);if(!n)throw new Error("No players in the pool yet — add players before starting.");const r=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(r).update({status:"live",bid_increment:e,current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function pn(e,t,a,n=null){const{error:r}=await i.from("auction_bids").insert({player_id:e,team_id:t,amount:a,auction_id:n||null});if(r)throw r;const s=n?"auctions":"auction_state",l=n||1,{error:c}=await i.from(s).update({current_bid:a,current_team_id:t}).eq("id",l);if(c)throw c}async function fn(e,t=null){const{data:a,error:n}=await i.from("auction_bids").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(2);if(n)throw n;if(!a||a.length===0)return;const{error:r}=await i.from("auction_bids").delete().eq("id",a[0].id);if(r)throw r;const s=a[1],{data:l}=await i.from("auction_players").select("base_price").eq("id",e).single(),c=t?"auctions":"auction_state",d=t||1,{error:p}=await i.from(c).update({current_bid:s?s.amount:(l==null?void 0:l.base_price)||0,current_team_id:s?s.team_id:null}).eq("id",d);if(p)throw p}async function mn(e,t,a,n=null){const{error:r}=await i.from("auction_players").update({status:"sold",sold_price:a,sold_team_id:t,sold_at:new Date().toISOString()}).eq("id",e);if(r)throw r;const{data:s,error:l}=await i.from("auction_teams").select("purse_remaining, name").eq("id",t).single();if(l)throw l;const{error:c}=await i.from("auction_teams").update({purse_remaining:s.purse_remaining-a}).eq("id",t);if(c)throw c;const{data:d}=await i.from("auction_players").select("name").eq("id",e).maybeSingle();d!=null&&d.name&&await X(null,"auction_sold",`${d.name} sold to ${s.name} for ₹${a}`),await He(e,n)}async function gn(e,t=null){const{error:a}=await i.from("auction_players").update({status:"unsold"}).eq("id",e);if(a)throw a;await He(e,t)}async function He(e,t=null){const a=await ue(t),n=Ge(a,e),r=t?"auctions":"auction_state",s=t||1;if(!n){const{error:c}=await i.from(r).update({status:"completed",current_player_id:null,current_bid:0,current_team_id:null}).eq("id",s);if(c)throw c;return}const{error:l}=await i.from(r).update({current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function hn(e,t=null){const{data:a,error:n}=await i.from("auction_players").select("base_price").eq("id",e).single();if(n)throw n;const r=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(r).update({current_player_id:e,current_bid:a.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function yn(e,t=null){let a=i.from("auction_bids").select("*, auction_teams(name)").eq("player_id",e).order("created_at",{ascending:!1});t&&(a=a.eq("auction_id",t));const{data:n,error:r}=await a;if(r)throw r;return n}async function xn(){const e=await ee(),t=e==null?void 0:e.platform_upi_id;return t&&t!=="9897439743@okbizaxis"?t:"9897439743@pz"}async function bn(e){await I("platform_upi_id",e)}function M(e){var t;return e&&(e.organized_by||(e.logo_url&&e.logo_url.startsWith("org:")?e.organized_by=e.logo_url.replace(/^org:/,"").trim():(t=e.players)!=null&&t.name&&(e.organized_by=e.players.name)),e)}async function wn({name:e,organizerId:t,location:a,auctionDate:n,auctionTime:r,planTier:s,maxTeams:l,pointsPurse:c,amountDue:d,playerEntryFee:p=0,organizerUpiId:u=null,organizerPaymentPhone:f=null,organizedBy:b=null}){var x,F,S,z;const y=d>0?"pending":"free",m=b?b.trim():null,h={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:c||null,amount_due:d||0,payment_status:y};p!==void 0&&(h.player_entry_fee=p?Number(p):0),u&&(h.organizer_upi_id=u.trim()),f&&(h.organizer_payment_phone=f.trim()),m&&(h.organized_by=m,h.logo_url=`org:${m}`);let{data:w,error:k}=await i.from("auctions").insert(h).select().single();if(k&&((x=k.message)!=null&&x.includes("player_entry_fee")||(F=k.message)!=null&&F.includes("organizer_upi_id")||(S=k.message)!=null&&S.includes("organizer_payment_phone")||(z=k.message)!=null&&z.includes("organized_by"))){console.warn("Retrying createAuction without unrecognized columns:",k.message);const C={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:c||null,amount_due:d||0,payment_status:y,logo_url:m?`org:${m}`:null},$=await i.from("auctions").insert(C).select().single();if($.error)throw $.error;w=$.data}else if(k)throw k;return m&&(w!=null&&w.id)&&(I(`auction_org_${w.id}`,m).catch(()=>{}),w.auction_code&&I(`auction_org_${w.auction_code}`,m).catch(()=>{})),d>0&&await H("auction_payment_pending",`New auction "${e}" awaiting payment confirmation (₹${d})`),M(w)}async function _n(e,t={}){var l;const a={};t.auctionDate!==void 0&&(a.auction_date=t.auctionDate||null),t.auction_date!==void 0&&(a.auction_date=t.auction_date||null),t.auctionTime!==void 0&&(a.auction_time=t.auctionTime||null),t.auction_time!==void 0&&(a.auction_time=t.auction_time||null),t.name!==void 0&&(a.name=t.name.trim()),t.location!==void 0&&(a.location=t.location?t.location.trim():null),t.pointsPurse!==void 0&&(a.points_purse=t.pointsPurse?Number(t.pointsPurse):null),t.points_purse!==void 0&&(a.points_purse=t.points_purse?Number(t.points_purse):null),t.bidIncrement!==void 0&&(a.bid_increment=t.bidIncrement?Number(t.bidIncrement):1e3),t.bid_increment!==void 0&&(a.bid_increment=t.bid_increment?Number(t.bid_increment):1e3);const n=t.organizedBy?t.organizedBy.trim():t.organized_by?t.organized_by.trim():null;n!==null&&(a.organized_by=n,a.logo_url=`org:${n}`);let{data:r,error:s}=await i.from("auctions").update(a).eq("id",e).select().single();if(s&&((l=s.message)!=null&&l.includes("organized_by"))){delete a.organized_by;const c=await i.from("auctions").update(a).eq("id",e).select().single();if(c.error)throw c.error;r=c.data}else if(s)throw s;return n&&e&&(I(`auction_org_${e}`,n).catch(()=>{}),r!=null&&r.auction_code&&I(`auction_org_${r.auction_code}`,n).catch(()=>{})),M(r)}async function Fn(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("organizer_id",e).order("created_at",{ascending:!1});if(a)throw a;return t}async function vn(){const{data:e,error:t}=await i.from("auction_teams").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function Sn(){const{data:e,error:t}=await i.from("auction_players").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function jn(e){if(!e)return[];const t=e.replace(/[^0-9]/g,"").slice(-10);try{const{data:a,error:n}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time), auction_teams!sold_team_id(id, name, owner_name, captain_name)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(!n&&a){const r=a.filter(u=>u.auctions),s=r.filter(u=>u.sold_team_id).map(u=>u.sold_team_id),l=[...new Set(r.map(u=>u.auction_id).filter(Boolean))];let c=[],d=[];try{const[u,f]=await Promise.all([s.length>0?i.from("settings").select("key, value").in("key",s.map(b=>`auction_team_logo_${b}`)):Promise.resolve({data:[]}),l.length>0?i.from("auction_teams").select("id, name, owner_name, captain_name, purse_total, auction_id").in("auction_id",l):Promise.resolve({data:[]})]);c=(u==null?void 0:u.data)||[],d=(f==null?void 0:f.data)||[]}catch{}let p={};return c.forEach(u=>{p[u.key]=u.value}),r.map(u=>{var k;const f=u.auctions||{};let b=null;(k=f.logo_url)!=null&&k.startsWith("org:")&&(b=f.logo_url.replace(/^org:/,""));let y=u.auction_teams||null;const m=(u.name||"").toLowerCase().trim();if(!y&&u.auction_id&&m){const x=d.find(F=>F.auction_id===u.auction_id&&(F.captain_name&&F.captain_name.toLowerCase().trim()===m||F.owner_name&&F.owner_name.toLowerCase().trim()===m));x&&(y=x)}const h=u.status==="captain"||y&&(y.captain_name&&y.captain_name.toLowerCase().trim()===m||y.owner_name&&y.owner_name.toLowerCase().trim()===m);let w=null;return y!=null&&y.id&&(w=p[`auction_team_logo_${y.id}`]||null),{...u,status:h?"captain":u.status,is_captain:!!h,sold_team_id:(y==null?void 0:y.id)||u.sold_team_id,auctions:{...f,organized_by:b||null},auction_teams:y?{...y,logo_url:w}:null}})}}catch(a){console.warn("fetchPlayerAuctionHistory main query failed:",a)}try{const{data:a,error:n}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(n)throw n;return(a||[]).filter(r=>r.auctions).map(r=>{var s;return{...r,auctions:{...r.auctions,organized_by:(s=r.auctions.logo_url)!=null&&s.startsWith("org:")?r.auctions.logo_url.replace(/^org:/,""):null}}})}catch(a){return console.warn("fetchPlayerAuctionHistory fallback failed:",a),[]}}async function kn(){const e=d=>(d||"").replace(/[^0-9]/g,"").slice(-10),[{data:t,error:a},{data:n,error:r}]=await Promise.all([i.from("auction_players").select("name, phone, birth_date, profile_image_url, city, jersey_number, jersey_size"),i.from("players").select("phone")]);if(a)throw a;if(r)throw r;const s=new Set((n||[]).map(d=>e(d.phone)));let l=0,c=0;for(const d of t||[]){const p=e(d.phone);if(!p||s.has(p)){c++;continue}try{await le(d.name,p,"1234",null,d.birth_date,d.profile_image_url,{city:d.city,jerseyNumber:d.jersey_number,jerseySize:d.jersey_size,source:"auction"}),s.add(p),l++}catch(u){console.error(`Failed to sync ${d.name} (${p}):`,u),c++}}return{synced:l,skipped:c}}async function Cn(e){const{data:t,error:a}=await i.from("auction_sponsors").select("*").eq("auction_id",e).order("created_at",{ascending:!0});if(a)throw a;return t||[]}async function Pn(e,t,a){const{data:n,error:r}=await i.from("auction_sponsors").insert({auction_id:e,name:t,logo_url:a||null}).select().single();if(r)throw r;return n}async function An(e){const{error:t}=await i.from("auction_sponsors").delete().eq("id",e);if(t)throw t}async function zn(e,t){const a=e.name.split(".").pop(),n=`sponsor-logos/${(t||"sponsor").toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:r}=await i.storage.from("team-assets").upload(n,e,{upsert:!0});if(r)throw r;const{data:s}=i.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function En(){const{data:e,error:t}=await i.from("auctions").select("*, players(name)").order("created_at",{ascending:!1});if(t)throw t;return(e||[]).map(M)}async function Rn(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("auction_code",e).maybeSingle();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await i.from("settings").select("value").eq("key",`auction_org_${t.id}`).maybeSingle();if(n!=null&&n.value)t.organized_by=n.value;else{const{data:r}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();r!=null&&r.value&&(t.organized_by=r.value)}}catch{}return t}async function Ye(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("id",e).single();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();n!=null&&n.value&&(t.organized_by=n.value)}catch{}return t}async function qn(){const{data:e,error:t}=await i.from("auctions").select("*, players(name, phone)").eq("payment_status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function $n(e){await H("auction_payment_claimed","An organizer marked auction payment as sent — please verify and approve.")}async function Bn(e){const{error:t}=await i.from("auctions").update({payment_status:"paid"}).eq("id",e);if(t)throw t}async function Tn(e){const{error:t}=await i.from("auctions").update({payment_status:"rejected"}).eq("id",e);if(t)throw t}async function In(e){await i.from("auction_bids").delete().eq("auction_id",e),await i.from("auction_players").delete().eq("auction_id",e),await i.from("auction_teams").delete().eq("auction_id",e);const{error:t}=await i.from("auctions").delete().eq("id",e);if(t)throw t}async function Dn(e,t){const{error:a}=await i.from("players").update({role:t}).eq("id",e);if(a)throw a}const J="selected_ground_bookings_cache";async function te(){try{const{data:e,error:t}=await i.from("settings").select("value").eq("key","ground_bookings").maybeSingle();if(!t&&(e!=null&&e.value)){const a=JSON.parse(e.value);if(Array.isArray(a)){try{localStorage.setItem(J,e.value)}catch{}return a}}}catch(e){console.warn("fetchGroundBookings error:",e)}try{const e=localStorage.getItem(J);if(e){const t=JSON.parse(e);if(Array.isArray(t))return t}}catch{}return[]}async function Ve(e){const t=await te(),a=new Date().toISOString(),n=e.id||"gb_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),r=Number(e.rate||0),s=Number(e.advance_paid||0),l=Math.max(0,r-s);let c=e.payment_status;(!c||c==="auto")&&(r>0&&s>=r?c="paid":s>0?c="advance":c="pending");const d={...e,id:n,rate:r,advance_paid:s,balance_due:l,payment_status:c,status:e.status||"confirmed",updated_at:a,created_at:e.created_at||a},p=t.findIndex(y=>y.id===n);let u;p>=0?(u=[...t],u[p]=d):u=[d,...t],u.sort((y,m)=>(y.date||"").localeCompare(m.date||""));const f=JSON.stringify(u);try{localStorage.setItem(J,f)}catch{}const{error:b}=await i.from("settings").upsert({key:"ground_bookings",value:f});return b&&console.warn("Supabase ground_bookings upsert error, cached locally:",b),d}async function Ln(e){const a=(await te()).filter(s=>s.id!==e),n=JSON.stringify(a);try{localStorage.setItem(J,n)}catch{}const{error:r}=await i.from("settings").upsert({key:"ground_bookings",value:n});return r&&console.warn("Supabase ground_bookings delete error, cached locally:",r),!0}async function Nn(e,{advance_paid:t,payment_status:a,payment_method:n}){const s=(await te()).find(c=>c.id===e);if(!s)throw new Error("Booking not found");const l={...s};return t!==void 0&&(l.advance_paid=Number(t),l.balance_due=Math.max(0,Number(l.rate||0)-Number(t)),l.balance_due===0&&l.rate>0?l.payment_status="paid":l.advance_paid>0?l.payment_status="advance":l.payment_status="pending"),a&&(l.payment_status=a),n&&(l.payment_method=n),await Ve(l)}const xr=Object.freeze(Object.defineProperty({__proto__:null,addAuctionSponsor:Pn,addContribution:ya,addExpense:oa,addGround:It,addPlayer:le,addRosterPlayerToAuction:Ya,addTeam:Ot,approveAuctionPayment:Bn,approvePlayer:ma,approveProRequest:$a,approvePublicResponse:aa,assignCaptainToTeam:pe,cancelProRequest:Te,checkAuctionPhoneExists:Me,checkPlayerPhoneExists:se,confirmPlayerToMatch:Zt,contributionExists:ba,countUnreadDirectMessages:Oa,countUnreadMessages:Ea,createAuction:wn,createAuctionTeam:sn,createMatch:Gt,deleteAuctionEvent:In,deleteAuctionPlayer:an,deleteAuctionSponsor:An,deleteAuctionTeam:cn,deleteContribution:xa,deleteExpense:ia,deleteGround:Lt,deleteGroundBooking:Ln,deleteMatch:Ht,deletePlayer:Bt,deleteTeam:Mt,fetchAdminPlayerId:Ne,fetchAllAuctionPlayerCounts:Sn,fetchAllAuctionTeamCounts:vn,fetchAllAuctions:En,fetchAuctionBidHistory:yn,fetchAuctionByCode:Rn,fetchAuctionById:Ye,fetchAuctionPlayers:ue,fetchAuctionRegistrationOpen:Ja,fetchAuctionSponsors:Cn,fetchAuctionState:dn,fetchAuctionTeams:on,fetchChat:ca,fetchContributions:ha,fetchConversation:Da,fetchExpenses:ra,fetchFeedback:Ga,fetchGroundBookings:te,fetchGrounds:Tt,fetchInboxMessages:za,fetchLeaderboard:$e,fetchMatchByToken:Ut,fetchMatchCount:Oe,fetchMatchCounts:Sa,fetchMatchPlayers:Re,fetchMatches:Ee,fetchMyAuctions:Fn,fetchMyConfirmedPlayers:Ma,fetchMyConversations:La,fetchMyInvites:ka,fetchMyOrganizers:Wa,fetchMyProRequest:Ie,fetchNotifications:Pt,fetchOrganizerUpi:Pa,fetchPayments:sa,fetchPendingAuctionPayments:qn,fetchPendingPlayers:fa,fetchPendingProRequests:qa,fetchPlatformUpi:xn,fetchPlayerAuctionHistory:jn,fetchPlayerCount:Le,fetchPlayerGrounds:Ia,fetchPlayerMatchHistory:Fa,fetchPlayerStats:va,fetchPlayers:Rt,fetchPlayersByCreator:qt,fetchProGroupPlayers:ja,fetchProStats:_a,fetchPublicResponses:ea,fetchRecentActivity:Ct,fetchRecentlyRegistered:Ta,fetchSentMessages:Aa,fetchSettings:ee,fetchStats:wa,fetchTeamCount:We,fetchTeams:Nt,fetchUnreadNotificationCount:At,findPlayerByPhone:Ue,globalSearch:Ha,jumpToAuctionPlayer:hn,markAllNotificationsRead:Et,markAuctionPaidByOrganizer:$n,markConversationRead:Na,markMessagesRead:Ra,markNotificationRead:zt,markPlayerSold:mn,markPlayerUnsold:gn,normalizeAuctionOrganizedBy:M,notifyPlayer:Jt,placeBid:pn,promoteFromWaitlist:de,registerAuctionPlayer:Va,registerPlayer:pa,rejectAuctionPayment:Tn,rejectPlayer:ga,rejectProRequest:Ba,rejectPublicResponse:na,removePlayerFromMatch:Qt,requestProAccess:Be,restoreAuctionPlayer:rn,saveGroundBooking:Ve,sendAdminMessage:qe,sendDirectMessage:De,sendFeedback:Ua,sendMessage:da,setAuctionRegistrationOpen:Qa,setPlatformUpi:bn,setPlayerAccountRole:Dn,setPlayerStatus:Xt,startAuction:un,submitPublicResponse:ta,subscribeToChat:ua,syncAuctionPlayersToRoster:kn,tagAuctionPlayerDropped:nn,toggleMatchLink:Kt,togglePayment:la,undoLastBid:fn,updateAuction:_n,updateAuctionPlayerBasePrice:en,updateAuctionPlayerCategory:tn,updateAuctionPlayerPaymentStatus:Ka,updateAuctionPlayerStatus:Za,updateAuctionTeam:ln,updateBookingPaymentStatus:Nn,updateGround:Dt,updateMatchMaxPlayers:Vt,updateMatchStatus:Yt,updatePlayer:$t,updatePlayerRole:Xa,updatePlayerUpi:Ca,updateTeam:Wt,uploadPaymentReceipt:kt,uploadProfilePhoto:jt,uploadSponsorLogo:zn,uploadTeamLogo:ce,upsertSetting:I},Symbol.toStringTag,{value:"Module"})),Ke="ss_home_stats_v2";function On(){try{const e=localStorage.getItem(Ke);if(e)return JSON.parse(e)}catch{}return{p:80,m:43,t:24}}function Wn({onLogin:e,onRegister:t}){const a=Ft(),n=_.useMemo(()=>On(),[]),[r,s]=_.useState(n.p),[l,c]=_.useState(n.m),[d,p]=_.useState(n.t),[u,f]=_.useState({p:n.p,m:n.m,t:n.t}),[b,y]=_.useState(!1),[m,h]=_.useState(!1);_.useEffect(()=>{y(!0);let x=!1;return Promise.all([Le().catch(()=>null),Oe().catch(()=>null),We().catch(()=>null)]).then(([F,S,z])=>{if(x)return;const C={p:typeof F=="number"&&F>0?F:n.p,m:typeof S=="number"&&S>0?S:n.m,t:typeof z=="number"&&z>0?z:n.t};s(C.p),c(C.m),p(C.t),f(C);try{localStorage.setItem(Ke,JSON.stringify(C))}catch{}}),()=>{x=!0}},[n]);const w=[{icon:at,v:u.p,label:"Active Players",sub:"Registered Pool",color:"#166534"},{icon:je,v:u.m,label:"Matches Played",sub:"Games & Fixtures",color:"#B8860B"},{icon:ke,v:u.t,label:"Cricket Teams",sub:"Franchises",color:"#0F766E"}],k=[{label:"Digital Player Pass",icon:nt},{label:"Live Auction Console",icon:Ce},{label:"Grounds on Google Maps",icon:rt},{label:"Season MVP Leaderboard",icon:Pe}];return o.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 40%, #F8FAF8 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-body)",position:"relative",overflow:"hidden",padding:a?"24px 16px 36px":"40px 20px"},children:[o.jsx("div",{style:{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:a?400:700,height:a?400:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0) 70%)",pointerEvents:"none"}}),o.jsx("div",{style:{position:"fixed",bottom:"-10%",right:"-10%",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle, rgba(246,196,83,0.06) 0%, rgba(246,196,83,0) 70%)",pointerEvents:"none"}}),o.jsxs("div",{style:{width:"100%",maxWidth:520,textAlign:"center",position:"relative",zIndex:1,opacity:b?1:0,transform:b?"translateY(0)":"translateY(-8px)",transition:"opacity 300ms ease-out, transform 300ms ease-out"},children:[o.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"#FFFFFF",border:"1px solid rgba(22,101,52,0.25)",padding:"5px 14px",borderRadius:999,fontSize:11,fontWeight:800,color:"#166534",boxShadow:"0 2px 8px rgba(22,101,52,0.06)",marginBottom:16,letterSpacing:.5,textTransform:"uppercase"},children:[o.jsx("span",{style:{width:7,height:7,borderRadius:"50%",background:"#22C55E",animation:"pulse 2s infinite"}}),"Selected Sports • Cricket Platform"]}),o.jsx("div",{style:{position:"relative",display:"inline-block",margin:"0 auto 12px"},children:o.jsx("img",{src:"/logo-full.png",alt:"Selected Sports",width:a?180:210,height:a?180:210,style:{height:a?180:210,width:"auto",display:"block",margin:"0 auto",filter:"drop-shadow(0 10px 24px rgba(22,101,52,0.12))",userSelect:"none"}})}),o.jsxs("div",{style:{fontSize:a?22:25,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",letterSpacing:"-0.5px",lineHeight:1.25,marginBottom:8},children:["PLAY. COMPETE."," ",o.jsx("span",{style:{background:"linear-gradient(135deg, #166534 0%, #15803D 50%, #0F766E 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"GET RECOGNISED."})]}),o.jsx("p",{style:{color:"#64748B",fontSize:a?13:14,lineHeight:1.5,maxWidth:420,margin:"0 auto 22px"},children:"India's premier cricket community for live auction tournaments, match scheduling, digital player passes, and official player leaderboards."}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20},children:w.map((x,F)=>o.jsxs("div",{style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,padding:"14px 6px",boxShadow:"0 4px 14px rgba(15,23,42,0.04)",transition:"transform 150ms ease, box-shadow 150ms ease"},children:[o.jsx("div",{style:{width:34,height:34,borderRadius:10,background:`${x.color}12`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"},children:o.jsx(x.icon,{size:17,color:x.color})}),o.jsxs("div",{style:{fontSize:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.1},children:[x.v,"+"]}),o.jsx("div",{style:{fontSize:11,fontWeight:800,color:"#0F172A",marginTop:3},children:x.label}),o.jsx("div",{style:{fontSize:9,color:"#94A3B8",marginTop:1},children:x.sub})]},F))}),o.jsx("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginBottom:24},children:k.map((x,F)=>o.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(22,101,52,0.06)",border:"1px solid rgba(22,101,52,0.18)",color:"#166534",padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:700},children:[o.jsx(x.icon,{size:13,color:"#166534"}),x.label]},F))}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:18},children:[o.jsxs("button",{onClick:e,style:{width:"100%",height:54,borderRadius:15,background:"linear-gradient(135deg, #166534 0%, #15803D 100%)",border:"none",color:"#FFFFFF",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",boxShadow:"0 8px 22px rgba(22,101,52,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 150ms ease, box-shadow 150ms ease"},onMouseEnter:x=>{x.currentTarget.style.transform="translateY(-2px)",x.currentTarget.style.boxShadow="0 12px 28px rgba(22,101,52,0.45)"},onMouseLeave:x=>{x.currentTarget.style.transform="translateY(0)",x.currentTarget.style.boxShadow="0 8px 22px rgba(22,101,52,0.35)"},children:[o.jsx("span",{children:"Login to Selected Sports"}),o.jsx(ot,{size:17})]}),o.jsxs("button",{onClick:t,style:{width:"100%",padding:"14px 18px",borderRadius:15,background:"#FFFFFF",border:"1.5px solid #166534",color:"#166534",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(15,23,42,0.03)",transition:"background 150ms ease"},onMouseEnter:x=>{x.currentTarget.style.background="rgba(22,101,52,0.06)"},onMouseLeave:x=>{x.currentTarget.style.background="#FFFFFF"},children:[o.jsx(it,{size:16,color:"#166534"}),o.jsx("span",{children:"Create New Player Account"})]})]}),o.jsxs("div",{style:{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:"#64748B",marginTop:6},children:[o.jsx("span",{style:{display:"flex",alignItems:"center",gap:6},children:o.jsx("span",{children:"Want to organize an auction?"})}),o.jsx("button",{onClick:()=>h(!0),style:{background:"none",border:"none",color:"#166534",fontWeight:800,cursor:"pointer",padding:0,textDecoration:"underline"},children:"Contact Md Zeeshan ↗"})]}),o.jsx("div",{style:{fontSize:11,color:"#94A3B8",fontWeight:700,marginTop:20,letterSpacing:.5,textTransform:"uppercase"},children:"Selected Sports • Play • Compete • Get Recognised"})]}),m&&o.jsx("div",{onClick:()=>h(!1),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:x=>x.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:20,maxWidth:420,width:"100%",padding:24,boxShadow:"0 25px 60px rgba(15,23,42,0.3)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[o.jsx("div",{style:{fontWeight:800,fontSize:17,fontFamily:"var(--font-head)",color:"#0F172A"},children:"Tournament Organizer Support"}),o.jsx("button",{onClick:()=>h(!1),style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"✕"})]}),o.jsx("p",{style:{fontSize:13,color:"#64748B",margin:"0 0 16px",lineHeight:1.5},children:"Want to organize an auction for your tournament, schedule matches, or need account help? Contact Md Zeeshan:"}),o.jsxs("div",{style:{background:"#F8FAF8",borderRadius:12,padding:"14px",border:"1px solid #E2E8F0",marginBottom:16},children:[o.jsx("div",{style:{fontWeight:800,fontSize:16,color:"#0F172A"},children:"Md Zeeshan"}),o.jsx("div",{style:{fontSize:12,color:"#64748B",marginTop:2},children:"Head of Tournament Operations"}),o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:15,fontWeight:800,color:"#166534"},children:[o.jsx(st,{size:15})," 9897439743"]})]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[o.jsx("a",{href:"tel:9897439743",style:{padding:"12px",borderRadius:11,background:"#166534",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"📞 Call Now"}),o.jsx("a",{href:"https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20interested%20in%20organizing%20an%20auction%20tournament%20with%20Selected%20Sports",target:"_blank",rel:"noreferrer",style:{padding:"12px",borderRadius:11,background:"#25D366",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"WhatsApp ↗"})]})]})})]})}const Mn="9897439743",br="9897439743@pz",_e=["#1D9E75","#8B1E2E","#BA7517","#0F6E56","#7A4F13","#3B6D11","#A6192E","#5B7C4A"],Un=e=>_e[e%_e.length],Gn=e=>e.split(" ").map(t=>t[0]).join("").slice(0,2).toUpperCase(),Ze=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}),wr=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"}),_r=e=>e.our_team?`${e.our_team} vs ${e.team}`:e.team,Fr=[{id:"free",label:"Free",maxTeams:3,price:0},{id:"plan2",label:"Plan 2",maxTeams:4,price:1999},{id:"plan2b",label:"Plan 2B",maxTeams:5,price:2249},{id:"plan3",label:"Plan 3",maxTeams:6,price:2499},{id:"plan4",label:"Plan 4",maxTeams:8,price:2999},{id:"plan5",label:"Plan 5",maxTeams:12,price:3999},{id:"plan6",label:"Plan 6",maxTeams:16,price:4999}],ie=15,Hn=9,Yn=1e3;function vr(e,t,a=Hn,n=Yn){if(t>=a)return 0;const r=Math.max(0,a-t),l=Math.max(0,r-1)*n;return Math.max(0,(e||0)-l)}function Sr(){const e=new Date;return e.setFullYear(e.getFullYear()-ie),e.toISOString().split("T")[0]}const jr=e=>/^[A-Za-z\s'.-]+$/.test((e||"").trim())&&(e||"").trim().length>0;function kr(e){if(!e)return"Please enter a date of birth.";const t=new Date(e+"T00:00:00");if(isNaN(t.getTime()))return"Please enter a valid date of birth.";const a=new Date;if(a.setHours(0,0,0,0),t>a)return"Date of birth can't be in the future.";let n=a.getFullYear()-t.getFullYear();const r=a.getMonth()-t.getMonth();return(r<0||r===0&&a.getDate()<t.getDate())&&n--,n<ie?`Players must be at least ${ie} years old to register.`:null}function Cr(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(m=>m.sold_team_id===e.id).sort((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id?1:0;return(h.is_captain||h.status==="captain"||e.captain_player_id&&h.id===e.captain_player_id?1:0)-w});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=m=>m==null?'""':`"${String(m).replace(/"/g,'""')}"`,s=["S.No","Player Name","Team Role","Playing Role","Jersey Number","Jersey Size","City","Date of Birth","Mobile Number","Price Paid (Coins)","Status"],l=n.map((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id,k=w?"Captain":"Squad Member",x=w?"0 (Captain)":`🪙 ${Number(m.sold_price||0).toLocaleString("en-IN")}`;return[h+1,r(m.name||""),r(k),r(m.playing_role||"—"),r(m.jersey_number||"—"),r(m.jersey_size||"—"),r(m.city||"—"),r(m.birth_date||"—"),r(m.phone||"—"),r(x),r(w?"Captain":m.status||"Sold")].join(",")}),c=r(`Tournament: ${a} — Team Roster: ${e.name}`),d=r(`Captain: ${e.captain_name||"—"}${e.captain_phone?` (${e.captain_phone})`:""} | Owner: ${e.owner_name||"—"}${e.owner_phone?` (${e.owner_phone})`:""} | Starting Purse: 🪙 ${Number(e.purse_total||0).toLocaleString("en-IN")} | Remaining Purse: 🪙 ${Number(e.purse_remaining||0).toLocaleString("en-IN")} | Squad: ${n.length}/9`),p=[c,d,"",s.join(","),...l].join(`\r
`),u=new Blob(["\uFEFF"+p],{type:"text/csv;charset=utf-8;"}),f=URL.createObjectURL(u),b=document.createElement("a"),y=`${(e.name||"Team").replace(/[^a-zA-Z0-9_-]/g,"_")}_Roster.csv`;b.href=f,b.download=y,document.body.appendChild(b),b.click(),document.body.removeChild(b),URL.revokeObjectURL(f)}function Pr(e,t){if(!e)return;const a=window.location.origin,n=(t==null?void 0:t.auction_code)||"",r=`${a}/team-view/${n}/${e.id}`,s=(e.captain_phone||e.owner_phone||"").replace(/[^0-9]/g,"").slice(-10),l=e.captain_name||e.owner_name||e.name,d=`🏏 *${(t==null?void 0:t.name)||"Selected Sports Cricket Tournament"}*

Hi ${l},
Here is your private team link to view *${e.name}* squad, purse wallet, and live auction roster:
👉 ${r}

Good luck for the auction!`,p=s?`https://wa.me/91${s}?text=${encodeURIComponent(d)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(d)}`;window.open(p,"_blank")}function Ar(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(u=>u.sold_team_id===e.id).sort((u,f)=>{const b=u.is_captain||u.status==="captain"||e.captain_player_id&&u.id===e.captain_player_id?1:0;return(f.is_captain||f.status==="captain"||e.captain_player_id&&f.id===e.captain_player_id?1:0)-b});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=u=>String(u??"").replace(/[&<>"']/g,f=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[f]),s=n.map((u,f)=>{const b=u.is_captain||u.status==="captain"||e.captain_player_id&&u.id===e.captain_player_id,y=b?'<span class="captain-badge">👑 CAPTAIN</span>':'<span class="player-badge">PLAYER</span>',m=b?"🪙 0 (Captain)":`🪙 ${Number(u.sold_price||0).toLocaleString("en-IN")}`,h=u.birth_date?u.birth_date:"—";return`
      <tr>
        <td style="text-align:center;font-weight:700;color:#64748B;">${f+1}</td>
        <td>
          <div style="font-weight:800;color:#0F172A;font-size:13px;">${r(u.name||"")}</div>
        </td>
        <td>${y}</td>
        <td><strong>${r(u.playing_role||"—")}</strong></td>
        <td style="text-align:center;">${r(u.jersey_number?`#${u.jersey_number}`:"—")}${u.jersey_size?` (${r(u.jersey_size)})`:""}</td>
        <td>${r(u.city||"—")}</td>
        <td>${r(h)}</td>
        <td><strong style="color:#166534;">${r(u.phone||"—")}</strong></td>
        <td style="font-weight:800;color:#166534;text-align:right;">${m}</td>
        <td style="text-align:center;"><span class="status-sold">${r(b?"Captain":"Sold")}</span></td>
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
</html>`,p=window.open("","_blank");if(!p){alert("Please allow pop-ups to open the PDF export.");return}p.document.write(d),p.document.close(),p.onload=()=>{setTimeout(()=>{p.print()},250)}}const Vn=[{name:"Shinde High School Cricket Ground",location:"Sahakar Nagar, Pune"},{name:"Poona Club Cricket Ground",location:"Camp, Pune"},{name:"PYC Hindu Gymkhana",location:"Deccan Gymkhana, Pune"},{name:"Law College Cricket Ground",location:"Erandwane, Pune"},{name:"Deccan Gymkhana Cricket Ground",location:"Deccan, Pune"},{name:"Nehru Stadium",location:"Swargate, Pune"},{name:"Fergusson College Ground",location:"FC Road, Pune"},{name:"SP College Ground",location:"Sadashiv Peth, Pune"},{name:"Eagle Turf",location:"Khadi Machine Chowk, Pune"},{name:"MM Turf Play Ground",location:"Parge Nagar, Pune"},{name:"Parge Play On",location:"Parge Nagar, Pune"},{name:"Anfield Turf",location:"Mohammadwadi, Pune"},{name:"Kanade Sports Club - Full Ground",location:"Pisoli, Pune"},{name:"Kanade Sports Club - Single",location:"Undri, Pune"},{name:"Kanade Sports Club - Indoor",location:"Pisoli, Pune"},{name:"Blades Cricket Ground",location:"Bavdhan, Pune"},{name:"Legends Cricket Ground",location:"Hadapsar, Pune"},{name:"Champions Turf & Cricket Ground",location:"Viman Nagar, Pune"},{name:"The Turf",location:"Baner, Pune"},{name:"Oxford Cricket Resort Ground",location:"Bavdhan, Pune"},{name:"Kharadi Sports Complex Cricket Ground",location:"Kharadi, Pune"},{name:"Wakad Cricket Ground",location:"Wakad, Pune"},{name:"DY Patil Cricket Stadium",location:"Akurdi, Pune"},{name:"Telco Cricket Ground",location:"Pimpri-Chinchwad, Pune"}];async function Kn(e="",t="Pune",a="Maharashtra"){const n=(e||"").trim(),r=(t||"Pune").trim(),s=(a||"Maharashtra").trim(),l=[],c=new Set;if(!r||r.toLowerCase()==="pune"){const d=Vn.filter(p=>{if(!n)return!0;const u=n.toLowerCase();return p.name.toLowerCase().includes(u)||p.location.toLowerCase().includes(u)});for(const p of d)c.has(p.name.toLowerCase())||(c.add(p.name.toLowerCase()),l.push({name:p.name,location:p.location,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name+" "+p.location)}`,isCurated:!0}))}try{const d=n?`${n} cricket ground ${r} ${s}`:`cricket ground in ${r} ${s}`,p=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d)}&limit=10&addressdetails=1`,u=await fetch(p,{headers:{Accept:"application/json"}});if(u.ok){const f=await u.json();for(const b of f||[]){const m=(b.name||(b.display_name?b.display_name.split(",")[0]:"")).replace(/,\s*India$/i,"").trim();if(m&&!c.has(m.toLowerCase())){c.add(m.toLowerCase());const h=b.address||{},k=`${h.suburb||h.neighbourhood||h.residential||h.city_district||r}, ${r}`;l.push({name:m,location:k,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m+" "+r)}`,isMap:!0})}}}}catch(d){console.warn("Map grounds search failed:",d)}return l}async function zr(e=""){return Kn(e,"Pune","Maharashtra")}function Er(e,t){if(!e)return"";const n=`${t||(typeof window<"u"?window.location.origin:"https://selectedsports.github.io")}/auction-register/${e.auction_code||""}`,r=e.auction_date?Ze(e.auction_date):"To Be Announced",s=e.auction_time||"To Be Announced",l=e.location||"Ground / Venue to be confirmed",c=e.organized_by?`
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
🏆 *Selected Sports Cricket Platform*`}function Rr(e,t){if(!t||t.length===0){alert("No players in the auction pool to export.");return}const a=["Lot No","Player Name","Player Type / Role","City","Base Price (Coins)","Category"],n=t.map((d,p)=>{const u=f=>`"${String(f??"").replace(/"/g,'""')}"`;return[p+1,u(d.name||""),u(d.playing_role||"—"),u(d.city||"—"),d.base_price??0,u(d.category||"—")].join(",")}),r="data:text/csv;charset=utf-8,\uFEFF"+[a.join(","),...n].join(`\r
`),s=encodeURI(r),l=document.createElement("a"),c=`${((e==null?void 0:e.name)||"Auction").replace(/[^a-zA-Z0-9_-]/g,"_")}_Player_Pool_${t.length}_Players.csv`;l.setAttribute("href",s),l.setAttribute("download",c),document.body.appendChild(l),l.click(),document.body.removeChild(l)}function Zn(e,t){if(!t||t.length===0)return"";const a=(e==null?void 0:e.name)||"Cricket Tournament Auction",n=e!=null&&e.auction_date?Ze(e.auction_date):"Upcoming",r=(e==null?void 0:e.auction_time)||"8:00 PM IST",s=(e==null?void 0:e.location)||"Venue TBD",l={"All-rounder":[],Batsman:[],Bowler:[],Wicketkeeper:[],Other:[]};t.forEach(u=>{const f=(u.playing_role||"").toLowerCase();f.includes("all")?l["All-rounder"].push(u):f.includes("bat")?l.Batsman.push(u):f.includes("bowl")?l.Bowler.push(u):f.includes("keep")||f.includes("wk")?l.Wicketkeeper.push(u):l.Other.push(u)});let c=`🏏 *OFFICIAL AUCTION PLAYER POOL — FOR CAPTAINS*
`;c+=`🏆 *${a}*
`,c+=`👥 *Total Players in Pool:* ${t.length} Players
`,c+=`📅 *Auction Date:* ${n} · ${r}
`,c+=`📍 *Venue:* ${s}

`,c+=`Dear Captains & Franchise Owners,
`,c+=`Here is the official list of ${t.length} players available in the auction pool for your pre-bidding strategy & purse allocation:

`;let d=1;const p=(u,f)=>{if(f.length===0)return"";let b=`*${u.toUpperCase()} (${f.length}):*
`;return f.forEach(y=>{const m=y.city?` · ${y.city}`:"",h=` · Base: 🪙 ${Number(y.base_price||0).toLocaleString("en-IN")}`;b+=`${d}. *${y.name}*${m}${h}
`,d++}),b+=`
`,b};return c+=p("🏏 All-Rounders",l["All-rounder"]),c+=p("⚡ Batsmen",l.Batsman),c+=p("🎯 Bowlers",l.Bowler),c+=p("🧤 Wicketkeepers",l.Wicketkeeper),l.Other.length>0&&(c+=p("👥 Other Players",l.Other)),c+=`🎯 *Captains, analyze your squad composition & coin reserves before the live auction stage!*
`,c+=`🔒 _Note: Player contact numbers are strictly confidential and withheld for player privacy._
`,c+="🏆 *Selected Sports Auction Platform*",c}function qr(e,t){const a=Zn(e,t);if(!a)return;const n=`https://api.whatsapp.com/send?text=${encodeURIComponent(a)}`;window.open(n,"_blank")}function $r(e,t){if(!t||t.length===0){alert("No players found in the auction pool to export.");return}const a=m=>String(m??"").replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[h]),n=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),r=(e==null?void 0:e.name)||"Selected Sports Cricket Auction",s=t.reduce((m,h)=>m+(Number(h.base_price)||0),0);let l=0,c=0,d=0,p=0;t.forEach(m=>{const h=(m.playing_role||"").toLowerCase();h.includes("all")?l++:h.includes("bat")?c++:h.includes("bowl")?d++:(h.includes("keep")||h.includes("wk"))&&p++});const u=t.map((m,h)=>{const w=h+1,k=m.playing_role||"Player",x=k.toLowerCase();let F="role-other",S="🏏";x.includes("all")?(F="role-all",S="🏏"):x.includes("bat")?(F="role-bat",S="⚡"):x.includes("bowl")?(F="role-bowl",S="🎯"):(x.includes("keep")||x.includes("wk"))&&(F="role-keep",S="🧤");const z=(m.name||"?").slice(0,1).toUpperCase(),C=m.profile_image_url?`<img src="${a(m.profile_image_url)}" alt="${a(m.name)}" class="player-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="player-initials-fallback" style="display:none;">${a(z)}</div>`:`<div class="player-initials-fallback">${a(z)}</div>`;return`
      <div class="player-card">
        <div class="card-top">
          <span class="lot-badge">#${w<10?"0"+w:w}</span>
          <span class="role-badge ${F}">${S} ${a(k)}</span>
        </div>
        <div class="photo-container">
          ${C}
        </div>
        <div class="player-name">${a(m.name)}</div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">📍 City</span>
            <span class="detail-val">${a(m.city||"—")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🪙 Base Price</span>
            <span class="detail-val base-price">🪙 ₹${Number(m.base_price||0).toLocaleString("en-IN")}</span>
          </div>
          ${m.category?`
          <div class="detail-row">
            <span class="detail-label">🏷️ Category</span>
            <span class="detail-val">${a(m.category)}</span>
          </div>`:""}
        </div>
      </div>
    `}).join(""),f=t.map((m,h)=>{const w=h+1,k=(m.name||"?").slice(0,1).toUpperCase(),x=m.profile_image_url?`<img src="${a(m.profile_image_url)}" alt="${a(m.name)}" class="table-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" /><span class="table-thumb-fallback" style="display:none;">${a(k)}</span>`:`<span class="table-thumb-fallback">${a(k)}</span>`;return`
      <tr>
        <td style="text-align:center;font-weight:800;color:#64748B;">#${w<10?"0"+w:w}</td>
        <td style="width:40px;text-align:center;">${x}</td>
        <td><strong style="color:#0F172A;font-size:13px;">${a(m.name)}</strong></td>
        <td><span class="table-role">${a(m.playing_role||"—")}</span></td>
        <td>${a(m.city||"—")}</td>
        <td style="font-weight:800;color:#166534;text-align:right;">🪙 ₹${Number(m.base_price||0).toLocaleString("en-IN")}</td>
        <td>${a(m.category||"—")}</td>
      </tr>
    `}).join(""),b=`<!DOCTYPE html>
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
      ${f}
    </tbody>
  </table>

  <div class="footer">
    <div>Selected Sports Auction Platform · Official Tournament Document</div>
    <div>Strictly Confidential · For Team Captains &amp; Owners Bidding Analysis</div>
  </div>
</body>
</html>`,y=window.open("","_blank");if(!y){alert("Please allow pop-ups to open the PDF export.");return}y.document.write(b),y.document.close(),y.onload=()=>{setTimeout(()=>{try{y.print()}catch{}},350)}}function Br(e,t=1e3){const a=Number(e)||0;return a<t?t:a<2e4?Math.floor(a/1e3)*1e3+1e3:a<6e4?Math.floor(a/2e3)*2e3+2e3:Math.floor(a/3e3)*3e3+3e3}function Tr(e,t=1e3){const a=Number(e)||0;let n;return a>6e4?(n=Math.ceil(a/3e3)*3e3-3e3,n<6e4&&(n=6e4)):a>2e4?(n=Math.ceil(a/2e3)*2e3-2e3,n<2e4&&(n=2e4)):n=Math.ceil(a/1e3)*1e3-1e3,Math.max(t,n)}function Jn({size:e=36}){return o.jsx("img",{src:"/logo-icon-v4.png",alt:"Selected Sports",style:{height:e,width:"auto",display:"block"}})}function Ir({size:e=40}){return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[o.jsx(Jn,{size:e}),o.jsxs("div",{children:[o.jsx("div",{style:{color:"#0F172A",fontFamily:"var(--font-head)",fontWeight:700,fontSize:e*.44,letterSpacing:"-0.5px",lineHeight:1.1},children:"Selected"}),o.jsx("div",{style:{color:"#B8860B",fontFamily:"var(--font-head)",fontWeight:600,fontSize:e*.27,letterSpacing:"2.5px",textTransform:"uppercase",lineHeight:1.1},children:"Sports"})]})]})}function U({name:e,id:t,sz:a=34}){return o.jsx("div",{style:{width:a,height:a,borderRadius:"50%",background:Un(t),display:"flex",alignItems:"center",justifyContent:"center",fontSize:a*.3,fontWeight:700,color:"#0F172A",flexShrink:0,letterSpacing:"-0.5px",fontFamily:"var(--font-head)"},children:Gn(e)})}const Fe={green:{bg:"rgba(25,182,106,0.12)",tx:"rgba(34,197,94,0.15)"},lime:{bg:"rgba(132,204,22,0.12)",tx:"#4D7C0F"},yellow:{bg:"rgba(244,180,0,0.12)",tx:"rgba(246,196,83,0.15)"},red:{bg:"rgba(229,57,53,0.1)",tx:"rgba(231,76,60,0.15)"},blue:{bg:"rgba(37,95,184,0.1)",tx:"#FFFFFF"},teal:{bg:"rgba(20,184,166,0.12)",tx:"#0F766E"},orange:{bg:"rgba(251,146,60,0.12)",tx:"rgba(251,146,60,0.15)"},purple:{bg:"rgba(167,139,250,0.12)",tx:"rgba(91,33,182,0.12)"},gray:{bg:"#F8FAF8",tx:"#F8FAF8"}},ve={founder:{label:"Founder",icon:ze,bg:"linear-gradient(135deg,#FBBF24,#D4A017)",color:"#FFFFFF"},organizer:{label:"Organizer",icon:mt,bg:"#166534",color:"#FFFFFF"},pro:{label:"PRO",icon:ft,bg:"#FFFFFF",color:"#2563EB",border:"1.5px solid #2563EB"},player:{label:"Player",icon:je,bg:"#22C55E",color:"#FFFFFF"},guest:{label:"Guest",icon:pt,bg:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0"}};function Se({role:e="player",size:t="md"}){const[a,n]=_.useState(!1);_.useEffect(()=>{const l=setTimeout(()=>n(!0),10);return()=>clearTimeout(l)},[]);const r=ve[e]||ve.player,s=t==="sm";return o.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:s?4:6,padding:s?"3px 9px":"5px 13px",borderRadius:999,background:r.bg,color:r.color,border:r.border||"none",fontSize:s?10:12,fontWeight:700,fontFamily:"var(--font-body)",boxShadow:"0 2px 6px rgba(15,23,42,0.12)",whiteSpace:"nowrap",opacity:a?1:0,transform:a?"scale(1)":"scale(0.95)",transition:"opacity 250ms, transform 250ms"},children:[o.jsx(r.icon,{size:s?11:13}),r.label]})}function Dr({children:e,col:t="gray"}){const a=Fe[t]||Fe.gray;return o.jsx("span",{style:{background:a.bg,color:a.tx,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-block",fontFamily:"var(--font-head)"},children:e})}function Lr({children:e,onClick:t,variant:a="primary",size:n="md",disabled:r=!1,style:s={}}){const l={border:"none",borderRadius:10,cursor:r?"not-allowed":"pointer",fontWeight:600,fontFamily:"var(--font-body)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,opacity:r?.55:1},c={primary:{background:"linear-gradient(135deg,#166534,#FFFFFF)",color:"#0F172A"},green:{background:"#166534",color:"#0F172A"},danger:{background:"rgba(229,57,53,0.1)",color:"#DC2626",border:"1px solid rgba(229,57,53,0.3)"},ghost:{background:"#F8FAF8",color:"#0F172A"},wa:{background:"rgba(25,182,106,0.12)",color:"#166534",border:"1px solid rgba(25,182,106,0.3)"},outline:{background:"transparent",color:"#166534",border:"1.5px solid #166534"},dark:{background:"#FFFFFF",color:"#0F172A",border:"none"}},d={sm:{padding:"5px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};return o.jsx("button",{onClick:r?void 0:t,style:{...l,...c[a],...d[n],...s},children:e})}function G(){return o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:48},children:[o.jsx("div",{style:{width:32,height:32,borderRadius:"50%",border:"3px solid #E2E8F0",borderTopColor:"#166534",animation:"spin 0.7s linear infinite"}}),o.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})}function K({children:e,style:t={},onClick:a}){return o.jsx("div",{onClick:a,style:{background:"#FFFFFF",borderRadius:16,border:"1.5px solid #E2E8F0",boxShadow:"0 1px 4px rgba(37,95,184,0.06)",...t},children:e})}function Nr({messages:e,onClose:t,player:a}){const[n,r]=_.useState(""),[s,l]=_.useState(!1),[c,d]=_.useState(!1),[p,u]=_.useState(null),[f,b]=_.useState([]),[y,m]=_.useState(!1),h=async()=>{if(!(!n.trim()||!a)){l(!0);try{const x=await Ne();x&&(await De(a.id,x,n.trim()),d(!0),r(""))}catch(x){alert(x.message)}l(!1)}},w=x=>{const F=x.match(/\[\[match:([a-zA-Z0-9-]+)\]\]/);return{clean:x.replace(/\[\[match:[a-zA-Z0-9-]+\]\]/,"").trim(),matchId:F?F[1]:null}},k=async x=>{u(x),m(!0);try{b(await Re(x))}catch(F){alert(F.message)}m(!1)};if(p){const x=f.filter(S=>S.status==="confirmed"),F=f.filter(S=>S.status==="waitlist");return o.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:S=>S.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[o.jsxs("button",{onClick:()=>u(null),style:{background:"transparent",border:"none",fontSize:13,fontWeight:700,color:"#166534",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0},children:[o.jsx(gt,{size:15})," Back"]}),o.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),y?o.jsx(G,{}):o.jsxs(o.Fragment,{children:[o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:10,fontFamily:"var(--font-head)"},children:["Confirmed (",x.length,")"]}),o.jsx("div",{style:{marginBottom:18},children:x.length===0?o.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one confirmed yet."}):x.map(S=>{var z,C;return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[o.jsx(U,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),o.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((C=S.players)==null?void 0:C.name)||"Player"})]},S.id)})}),o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#B8860B",marginBottom:10,fontFamily:"var(--font-head)"},children:["Waitlist (",F.length,")"]}),o.jsx("div",{children:F.length===0?o.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one on the waitlist."}):F.map(S=>{var z,C;return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[o.jsx(U,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),o.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((C=S.players)==null?void 0:C.name)||"Player"})]},S.id)})})]})]})})}return o.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:x=>x.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[o.jsxs("div",{style:{fontWeight:700,fontSize:16,fontFamily:"var(--font-head)",color:"#0F172A",display:"flex",alignItems:"center",gap:8},children:[o.jsx(ht,{size:18})," Messages"]}),o.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),e.length===0&&o.jsx("div",{style:{color:"#64748B",fontSize:13,textAlign:"center",padding:"20px 0"},children:"No messages yet."}),e.map(x=>{const{clean:F,matchId:S}=w(x.message);return o.jsxs("div",{onClick:S?()=>k(S):void 0,style:{padding:"12px 0",borderBottom:"1px solid #E2E8F0",cursor:S?"pointer":"default"},children:[o.jsx("div",{style:{fontSize:13,color:"#0F172A",lineHeight:1.5},children:F}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:5,display:"flex",alignItems:"center",gap:6},children:["From ",x.sender," · ",x.created_at?new Date(x.created_at).toLocaleString():"",S&&o.jsxs("span",{style:{color:"#166534",fontWeight:700,display:"flex",alignItems:"center",gap:2},children:["· View squad ",o.jsx(Ae,{size:11})]})]})]},x.id)}),a&&o.jsxs("div",{style:{marginTop:14,paddingTop:14,borderTop:"1.5px solid #E2E8F0"},children:[o.jsx("div",{style:{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:8},children:"Reply to Admin"}),c&&o.jsx("div",{style:{fontSize:12,color:"#166534",marginBottom:8},children:"✓ Sent! Full conversation is in Direct Messages."}),o.jsxs("div",{style:{display:"flex",gap:8},children:[o.jsx("input",{value:n,onChange:x=>r(x.target.value),onKeyDown:x=>x.key==="Enter"&&h(),placeholder:"Type a reply...",style:{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#F8FAF8",color:"#0F172A",fontSize:13,outline:"none",fontFamily:"var(--font-body)"}}),o.jsx("button",{onClick:h,disabled:s,style:{padding:"9px 14px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:600},children:s?"...":"Send"})]})]})]})})}function Or({isMobile:e,myId:t}){var he;const[n,r]=_.useState([]),[s,l]=_.useState(!0),[c,d]=_.useState(null),[p,u]=_.useState(!1),[f,b]=_.useState(!1),[y,m]=_.useState("points"),[h,w]=_.useState("all"),[k,x]=_.useState(!1),[F,S]=_.useState("all"),[z,C]=_.useState(!1),[$,A]=_.useState(""),[P,B]=_.useState(null);if(_.useEffect(()=>{$e().then(g=>{r(g),setTimeout(()=>u(!0),50),g.length>0&&(b(!0),setTimeout(()=>b(!1),2200))}).catch(g=>d(g.message||String(g))).finally(()=>l(!1))},[]),s)return o.jsx(G,{});const O=Array.from(new Set(n.map(g=>{var v;return(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)}).filter(Boolean))).sort().reverse(),N=n.filter(g=>{var v,R;return!(h!=="all"&&(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)!==h||F!=="all"&&(((R=g.players)==null?void 0:R.role)||"player")!==F)}),j={};N.forEach(g=>{const v=g.players;v&&(j[v.id]||(j[v.id]={id:v.id,name:v.name,city:v.city,role:v.role,profile_image_url:v.profile_image_url,matchesPlayed:0,matches:[],earliestConfirmedAt:g.created_at}),j[v.id].matchesPlayed++,g.matches&&j[v.id].matches.push({...g.matches,confirmedAt:g.created_at}),g.created_at&&(!j[v.id].earliestConfirmedAt||g.created_at<j[v.id].earliestConfirmedAt)&&(j[v.id].earliestConfirmedAt=g.created_at))});const q=Object.values(j).map(g=>({...g,points:g.matchesPlayed*20})).sort((g,v)=>v.points!==g.points?v.points-g.points:g.earliestConfirmedAt?v.earliestConfirmedAt?new Date(g.earliestConfirmedAt)-new Date(v.earliestConfirmedAt):-1:1),T=$.trim().toLowerCase(),Qe=q.filter(g=>!T||g.name.toLowerCase().includes(T)||(g.city||"").toLowerCase().includes(T)),Y=q.slice(0,3),ge=T?Qe:q.slice(3),V=t?q.findIndex(g=>g.id===t):-1,Xe={1:{title:"👑 MVP · CHAMPION",border:"2px solid #F59E0B",bg:"linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.03) 100%)",badgeBg:"linear-gradient(135deg, #F59E0B, #D97706)",glow:"0 10px 28px rgba(245,158,11,0.28)",avatarBorder:"#F59E0B",avatarGlow:"0 0 20px rgba(245,158,11,0.4)"},2:{title:"🥈 2ND PLACE",border:"1.5px solid #CBD5E1",bg:"linear-gradient(180deg, rgba(241,245,249,0.9) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #94A3B8, #64748B)",glow:"0 8px 20px rgba(100,116,139,0.15)",avatarBorder:"#94A3B8",avatarGlow:"none"},3:{title:"🥉 3RD PLACE",border:"1.5px solid #FDE68A",bg:"linear-gradient(180deg, rgba(254,243,199,0.5) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #D97706, #B45309)",glow:"0 8px 20px rgba(180,83,9,0.15)",avatarBorder:"#D97706",avatarGlow:"none"}},ne=({p:g,rank:v})=>{if(!g)return o.jsx("div",{style:{flex:1}});const R=Xe[v],E=v===1;return o.jsxs("div",{onClick:()=>B(g),style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:p?1:0,transform:p?E?"translateY(-6px) scale(1.02)":"translateY(0) scale(1)":"translateY(24px) scale(0.95)",transition:`all 350ms cubic-bezier(0.16, 1, 0.3, 1) ${v===1?200:v===2?100:0}ms`,zIndex:E?3:2},children:[E&&o.jsxs("div",{style:{background:R.badgeBg,color:"#FFFFFF",fontSize:10,fontWeight:900,padding:"4px 12px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:5,marginBottom:8,boxShadow:"0 4px 12px rgba(245,158,11,0.4)",letterSpacing:.5,fontFamily:"var(--font-head)"},children:[o.jsx(ze,{size:12,fill:"#FFFFFF"})," MVP · RANK 1"]}),o.jsxs("div",{style:{position:"relative",padding:E?e?"18px 10px 16px":"24px 16px 20px":e?"14px 8px 12px":"18px 12px 16px",borderRadius:20,background:R.bg,border:R.border,width:"100%",textAlign:"center",boxShadow:R.glow,boxSizing:"border-box"},children:[o.jsxs("div",{style:{position:"relative",display:"inline-block",marginBottom:10},children:[o.jsx("div",{style:{borderRadius:"50%",boxShadow:R.avatarGlow,padding:2,background:"#FFFFFF",border:`2px solid ${R.avatarBorder}`},children:g.profile_image_url?o.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:E?e?54:68:e?42:52,height:E?e?54:68:e?42:52,borderRadius:"50%",objectFit:"cover",display:"block"}}):o.jsx(U,{name:g.name,id:g.id,sz:E?e?54:68:e?42:52})}),o.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:E?24:20,height:E?24:20,borderRadius:"50%",background:R.badgeBg,color:"#FFFFFF",fontSize:E?12:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #FFFFFF",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"},children:v})]}),o.jsx("div",{style:{fontWeight:800,fontSize:E?e?13:15:e?12:13,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:g.name}),o.jsxs("div",{style:{marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:4},children:[g.role&&g.role!=="player"?o.jsx(Se,{role:g.role,size:"sm"}):o.jsx("span",{style:{fontSize:9.5,fontWeight:800,background:"rgba(22,101,52,0.1)",color:"#166534",padding:"1px 6px",borderRadius:4},children:"PLAYER"}),g.city&&!e&&o.jsxs("span",{style:{fontSize:10,color:"#94A3B8"},children:["· ",g.city]})]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:4,fontWeight:600},children:[g.matchesPlayed," Matches"]}),o.jsxs("div",{style:{fontSize:E?e?18:22:e?15:18,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3},children:[o.jsx("span",{children:g.points}),o.jsx("span",{style:{fontSize:10,fontWeight:800,color:"#94A3B8"},children:"PTS"})]})]})]})},et=({i:g})=>{const v=["#F59E0B","#166534","#22C55E","#FBBF24","#3B82F6"],R=Math.random()*100,E=Math.random()*300,oe=1200+Math.random()*600,W=Math.random()*360,tt=v[g%v.length];return o.jsx("div",{style:{position:"absolute",top:-10,left:R+"%",width:8,height:8,background:tt,borderRadius:g%2===0?"50%":2,animation:`confettiFall ${oe}ms ease-in ${E}ms forwards`,transform:`rotate(${W}deg)`}})},re=({label:g,desc:v})=>o.jsxs(K,{style:{padding:"44px 20px",textAlign:"center",borderRadius:16},children:[o.jsx("div",{style:{width:56,height:56,borderRadius:"50%",background:"#F8FAF8",border:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"},children:o.jsx(xe,{size:26,color:"#94A3B8"})}),o.jsxs("div",{style:{fontWeight:900,fontSize:16,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)"},children:[g," Leaderboard Coming Soon"]}),o.jsx("div",{style:{color:"#64748B",fontSize:13,maxWidth:360,margin:"0 auto",lineHeight:1.5},children:v||"Individual batting and bowling statistics will populate automatically once ball-by-ball live match scoring is active."})]});return o.jsxs("div",{style:{position:"relative"},children:[o.jsx("style",{children:`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(260px) rotate(320deg); }
        }
      `}),f&&o.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:260,overflow:"hidden",pointerEvents:"none",zIndex:10},children:Array.from({length:36}).map((g,v)=>o.jsx(et,{i:v},v))}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:e?"flex-start":"center",marginBottom:16,gap:12,flexDirection:e?"column":"row",flexWrap:"wrap"},children:[o.jsx("div",{children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[o.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg, rgba(245,158,11,0.15), rgba(22,101,52,0.1))",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(ke,{size:20,color:"#D97706"})}),o.jsxs("div",{children:[o.jsx("h2",{style:{fontFamily:"var(--font-head)",color:"#0F172A",fontSize:e?19:22,margin:0,fontWeight:900,letterSpacing:"-0.4px"},children:"Player Leaderboard"}),o.jsx("div",{style:{fontSize:11.5,color:"#64748B",marginTop:2},children:"Official community rankings calculated from verified match appearances (20 PTS / Match)"})]})]})}),o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,width:e?"100%":"auto",flexWrap:"wrap"},children:[o.jsxs("div",{style:{position:"relative"},children:[o.jsxs("button",{type:"button",onClick:()=>{x(g=>!g),C(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[o.jsx(lt,{size:13,color:"#166534"}),o.jsx("span",{children:h==="all"?"All Seasons":`Season ${h}`}),o.jsx(ye,{size:13,color:"#94A3B8"})]}),k&&o.jsxs("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[o.jsx("button",{type:"button",onClick:()=>{w("all"),x(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h==="all"?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h==="all"?800:500},children:"All Seasons"}),O.map(g=>o.jsxs("button",{type:"button",onClick:()=>{w(g),x(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h===g?800:500},children:["Season ",g]},g))]})]}),o.jsxs("div",{style:{position:"relative"},children:[o.jsxs("button",{type:"button",onClick:()=>{C(g=>!g),x(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[o.jsx("span",{children:F==="all"?"All Players":F==="pro"?"PRO Only":"Players Only"}),o.jsx(ye,{size:13,color:"#94A3B8"})]}),z&&o.jsx("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[["all","All Players"],["player","Players Only"],["pro","PRO Only"]].map(([g,v])=>o.jsx("button",{type:"button",onClick:()=>{S(g),C(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:F===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:F===g?800:500},children:v},g))})]})]})]}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:18,flexDirection:e?"column":"row"},children:[o.jsx("div",{style:{display:"flex",gap:8,overflowX:"auto",width:e?"100%":"auto",paddingBottom:2},children:[["points","Points Table",ct],["runs","Most Runs",xe],["wickets","Most Wickets",dt],["sixes","Most 6s",Ce]].map(([g,v,R])=>o.jsxs("button",{type:"button",onClick:()=>m(g),style:{padding:"8px 14px",borderRadius:999,border:y===g?"none":"1.5px solid #E2E8F0",background:y===g?"#166534":"#FFFFFF",color:y===g?"#FFFFFF":"#64748B",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0,boxShadow:y===g?"0 2px 8px rgba(22,101,52,0.25)":"none",transition:"all 150ms ease"},children:[o.jsx(R,{size:13}),o.jsx("span",{children:v})]},g))}),y==="points"&&o.jsxs("div",{style:{width:e?"100%":240,position:"relative"},children:[o.jsx(ut,{size:14,color:"#94A3B8",style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}),o.jsx("input",{type:"text",value:$,onChange:g=>A(g.target.value),placeholder:"Search ranked player...",style:{width:"100%",padding:"8px 12px 8px 32px",borderRadius:999,border:"1.5px solid #E2E8F0",fontSize:12,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}})]})]}),y==="runs"&&o.jsx(re,{label:"Most Runs",desc:"Track top batsmen across tournaments once live match scoring is recorded."}),y==="wickets"&&o.jsx(re,{label:"Most Wickets",desc:"Track top wicket-takers across matches once match scorecards are submitted."}),y==="sixes"&&o.jsx(re,{label:"Most 6s",desc:"Track maximum sixes hit per season once live innings balls are captured."}),y==="points"&&(c?o.jsxs("div",{style:{color:"#EF4444",fontSize:13,textAlign:"center",padding:"30px 0",background:"rgba(239,68,68,0.06)",borderRadius:12,border:"1px solid rgba(239,68,68,0.25)"},children:["⚠️ Couldn't load the leaderboard: ",c]}):q.length===0?o.jsx(K,{style:{padding:"40px 20px",textAlign:"center",borderRadius:16},children:o.jsxs("div",{style:{fontSize:14,color:"#64748B"},children:["No completed matches recorded yet",h!=="all"?` for Season ${h}`:"","."]})}):o.jsxs(o.Fragment,{children:[!T&&Y.length>0&&o.jsxs("div",{style:{display:"flex",alignItems:"stretch",gap:e?8:14,marginBottom:22,padding:"0 2px"},children:[o.jsx(ne,{p:Y[1],rank:2}),o.jsx(ne,{p:Y[0],rank:1}),o.jsx(ne,{p:Y[2],rank:3})]}),ge.length>0?o.jsxs("div",{style:{borderRadius:16,overflow:"hidden",border:"1px solid #E2E8F0",background:"#FFFFFF",marginBottom:20,boxShadow:"0 4px 16px rgba(15,23,42,0.03)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",padding:e?"12px 14px":"12px 20px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",color:"#64748B",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:[o.jsx("div",{style:{width:34},children:"#"}),o.jsx("div",{style:{flex:1},children:"Player"}),o.jsx("div",{style:{width:80,textAlign:"center"},children:"Role"}),o.jsx("div",{style:{width:70,textAlign:"center"},children:"Matches"}),o.jsx("div",{style:{width:80,textAlign:"right"},children:"Points"}),o.jsx("div",{style:{width:24}})]}),ge.map((g,v)=>{const R=T?q.findIndex(W=>W.id===g.id)+1:v+4,E=g.id===t,oe=R<=10;return o.jsxs("div",{onClick:()=>B(g),style:{display:"flex",alignItems:"center",padding:e?"11px 14px":"12px 20px",background:E?"rgba(34,197,94,0.07)":"#FFFFFF",borderTop:"1px solid #F1F5F9",cursor:"pointer",transition:"background 150ms ease",position:"relative"},onMouseEnter:W=>{E||(W.currentTarget.style.background="#F8FAF8")},onMouseLeave:W=>{E||(W.currentTarget.style.background="#FFFFFF")},children:[o.jsx("div",{style:{width:34,flexShrink:0},children:oe?o.jsx("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:6,background:"#F1F5F9",color:"#0F172A",fontSize:11,fontWeight:900,fontFamily:"var(--font-head)"},children:R}):o.jsx("span",{style:{fontSize:13,fontWeight:700,color:"#94A3B8",fontFamily:"var(--font-head)"},children:R})}),o.jsxs("div",{style:{flex:1,display:"flex",alignItems:"center",gap:10,minWidth:0},children:[g.profile_image_url?o.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"1.5px solid #E2E8F0"}}):o.jsx(U,{name:g.name,id:g.id,sz:34}),o.jsxs("div",{style:{minWidth:0},children:[o.jsxs("div",{style:{fontWeight:800,fontSize:13.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6},children:[o.jsx("span",{children:g.name}),E&&o.jsx("span",{style:{background:"#166534",color:"#FFFFFF",fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:4},children:"YOU"})]}),g.city&&o.jsxs("div",{style:{fontSize:11,color:"#94A3B8",marginTop:1},children:["📍 ",g.city]})]})]}),o.jsx("div",{style:{width:80,textAlign:"center",flexShrink:0},children:g.role&&g.role!=="player"?o.jsx(Se,{role:g.role,size:"sm"}):o.jsx("span",{style:{fontSize:10,fontWeight:800,background:"rgba(22,101,52,0.08)",color:"#166534",padding:"2px 7px",borderRadius:4},children:"Player"})}),o.jsx("div",{style:{width:70,textAlign:"center",fontSize:13,fontWeight:800,color:"#0F172A",flexShrink:0},children:g.matchesPlayed}),o.jsxs("div",{style:{width:80,textAlign:"right",fontSize:14,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",flexShrink:0},children:[g.points," ",o.jsx("span",{style:{fontSize:9.5,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),o.jsx("div",{style:{width:24,display:"flex",justifyContent:"flex-end",flexShrink:0},children:o.jsx(Ae,{size:15,color:"#CBD5E1"})})]},g.id)})]}):T?o.jsx(K,{style:{padding:"32px 16px",textAlign:"center",borderRadius:14},children:o.jsxs("div",{style:{fontSize:13.5,color:"#64748B"},children:['No ranked players match "',$,'".']})}):null,V>=0&&o.jsxs("div",{style:{padding:"14px 18px",display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg, rgba(22,101,52,0.08), rgba(22,101,52,0.02))",border:"1.5px solid rgba(22,101,52,0.3)",borderRadius:16,boxShadow:"0 4px 14px rgba(22,101,52,0.08)"},children:[o.jsx("div",{style:{width:42,height:42,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(22,101,52,0.3)"},children:o.jsx(Pe,{size:20,color:"#FFFFFF"})}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("div",{style:{fontSize:12,color:"#166534",fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:"Your Season Ranking"}),o.jsxs("div",{style:{fontSize:17,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["Rank #",V+1," ",o.jsxs("span",{style:{fontSize:12,fontWeight:600,color:"#64748B"},children:["of ",q.length," players"]})]})]}),o.jsxs("div",{style:{textAlign:"right",flexShrink:0},children:[o.jsxs("div",{style:{fontSize:20,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)"},children:[q[V].points," ",o.jsx("span",{style:{fontSize:11,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:[q[V].matchesPlayed," matches played"]})]})]})]})),P&&o.jsx("div",{onClick:()=>B(null),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16},children:o.jsxs("div",{onClick:g=>g.stopPropagation(),style:{background:"#FFFFFF",borderRadius:20,maxWidth:440,width:"100%",padding:22,boxShadow:"0 24px 60px rgba(15,23,42,0.3)",maxHeight:"90vh",display:"flex",flexDirection:"column"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[P.profile_image_url?o.jsx("img",{src:P.profile_image_url,alt:P.name,style:{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:"2px solid #166534"}}):o.jsx(U,{name:P.name,id:P.id,sz:50}),o.jsxs("div",{children:[o.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)"},children:P.name}),o.jsxs("div",{style:{fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:6,marginTop:2},children:[o.jsx("span",{children:P.city||"Pune"}),o.jsx("span",{children:"·"}),o.jsx("span",{style:{fontWeight:700,color:"#166534"},children:P.role||"Player"})]})]})]}),o.jsx("button",{onClick:()=>B(null),style:{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94A3B8",padding:0},children:"×"})]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16,background:"#F8FAF8",padding:12,borderRadius:12,border:"1px solid #E2E8F0",textAlign:"center"},children:[o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Rank"}),o.jsxs("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["#",q.findIndex(g=>g.id===P.id)+1]})]}),o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Matches"}),o.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:P.matchesPlayed})]}),o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Points"}),o.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:2},children:P.points})]})]}),o.jsxs("div",{style:{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:8,textTransform:"uppercase",letterSpacing:.3},children:["Verified Completed Matches (",((he=P.matches)==null?void 0:he.length)||0,")"]}),o.jsx("div",{style:{flex:1,overflowY:"auto",display:"grid",gap:8,paddingRight:2,maxHeight:240},children:(P.matches||[]).map((g,v)=>o.jsxs("div",{style:{padding:"9px 12px",background:"#F8FAF8",borderRadius:10,border:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[o.jsxs("div",{style:{minWidth:0},children:[o.jsxs("div",{style:{fontSize:12.5,fontWeight:800,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[g.our_team||"Team"," vs ",g.team||"Opponent"]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:["📅 ",g.date||"Completed"]})]}),o.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#166534",background:"#DCFCE7",padding:"2px 7px",borderRadius:6,flexShrink:0},children:"+20 PTS"})]},v))}),o.jsx("button",{onClick:()=>B(null),style:{width:"100%",padding:"11px",borderRadius:10,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",marginTop:16},children:"Close"})]})})]})}function Wr({player:e}){const[t,a]=_.useState(null),[n,r]=_.useState(!0),[s,l]=_.useState(!1),[c,d]=_.useState(!1);_.useEffect(()=>{Ie(e.id).then(a).catch(()=>{}).finally(()=>r(!1))},[e.id]);const p=async()=>{l(!0);try{const b=await Be(e.id);a(b)}catch(b){alert(b.message)}l(!1)},u=async()=>{if(t!=null&&t.id){d(!0);try{await Te(t.id),a(null)}catch(b){alert(b.message)}d(!1)}};if(e.role==="pro"||n)return null;const f=t==null?void 0:t.status;return o.jsxs(K,{style:{padding:"16px",marginTop:16},children:[o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:8,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:8},children:[o.jsx(be,{size:17,color:"#166534"})," Schedule Your Own Matches"]}),o.jsx("div",{style:{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.5},children:"Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days."}),f==="pending"?o.jsxs(o.Fragment,{children:[o.jsx("div",{style:{padding:"10px 12px",background:"rgba(216,176,91,0.1)",borderRadius:10,color:"#B8860B",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:10},children:"⏳ Your request is pending admin approval"}),o.jsx("button",{onClick:u,disabled:c,style:{width:"100%",padding:"9px",borderRadius:10,background:"transparent",border:"1.5px solid #E2E8F0",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)"},children:c?"Cancelling...":"Cancel Request"})]}):o.jsx("button",{onClick:p,disabled:s,style:{width:"100%",padding:"11px",borderRadius:10,background:"linear-gradient(135deg,#166534,#FFFFFF)",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:s?"Sending...":f==="rejected"?"Request Again":o.jsxs(o.Fragment,{children:[o.jsx(be,{size:15})," Request to Schedule Matches"]})})]})}const fe="ss_session";function Qn(e,t=null){try{localStorage.setItem(fe,JSON.stringify({role:e,player:t}))}catch{}}function Xn(){try{return JSON.parse(localStorage.getItem(fe)||"null")}catch{return null}}function Je(){try{localStorage.removeItem(fe)}catch{}}class er extends _.Component{constructor(t){super(t),this.state={hasError:!1,isChunkError:!1}}static getDerivedStateFromError(t){const a=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();return{hasError:!0,isChunkError:/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(a)}}componentDidCatch(t,a){console.error("SelectedSports App Error caught by boundary:",t,a);const n=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();if(/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(n)){const r=parseInt(sessionStorage.getItem("boundary_reload_ts")||"0",10);if(Date.now()-r>6e3){sessionStorage.setItem("boundary_reload_ts",String(Date.now()));const s=new URL(window.location.href);s.searchParams.set("_v",String(Date.now())),window.location.replace(s.toString())}}}render(){return this.state.hasError?this.state.isChunkError?o.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"},children:[o.jsx(G,{}),o.jsx("p",{style:{marginTop:16,fontSize:13,color:"#64748B",fontWeight:600,fontFamily:"var(--font-head)"},children:"Updating application..."})]}):o.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",fontFamily:"var(--font-body)"},children:[o.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"rgba(22,101,52,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16},children:"🏏"}),o.jsx("h2",{style:{fontSize:20,fontWeight:900,color:"#0F172A",margin:"0 0 8px",fontFamily:"var(--font-head)"},children:"Selected Sports"}),o.jsx("p",{style:{fontSize:13,color:"#64748B",maxWidth:360,margin:"0 0 20px",lineHeight:1.5},children:"Something unexpected happened. Tap below to reload."}),o.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"},children:[o.jsx("button",{onClick:()=>window.location.reload(),style:{padding:"12px 22px",borderRadius:12,background:"#166534",color:"#FFFFFF",border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)"},children:"🔄 Reload App"}),o.jsx("button",{onClick:()=>{Je(),localStorage.clear(),window.location.href="/"},style:{padding:"12px 18px",borderRadius:12,background:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0",fontSize:13,fontWeight:700,cursor:"pointer"},children:"Return to Home"})]})]}):this.props.children}}function L(e){return _.lazy(async()=>{try{return await e()}catch(t){console.warn("Chunk load failed, auto-reloading to fetch new version:",t);const a=parseInt(sessionStorage.getItem("chunk_reload_ts")||"0",10),n=Date.now();if(n-a>8e3){sessionStorage.setItem("chunk_reload_ts",String(n));const r=new URL(window.location.href);return r.searchParams.set("_v",String(n)),window.location.replace(r.toString()),new Promise(()=>{})}throw t}})}const tr=L(()=>D(()=>import("./LoginScreens-CTj8qggc.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.UnifiedLoginScreen}))),ar=L(()=>D(()=>import("./LoginScreens-CTj8qggc.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegisterScreen}))),nr=L(()=>D(()=>import("./LoginScreens-CTj8qggc.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegistrationSubmittedScreen}))),rr=L(()=>D(()=>import("./AdminPortal-B9uQbmry.js").then(e=>e.A),__vite__mapDeps([4,1,5,2,6,3]))),or=L(()=>D(()=>import("./PlayerPortal-K3gCRdWz.js"),__vite__mapDeps([6,1,2,3]))),ir=L(()=>D(()=>import("./ProPortal-C_l0Y_Uv.js"),__vite__mapDeps([7,1,2,4,5,6,3]))),sr=L(()=>D(()=>import("./PublicInvitePage-D1NysK4Q.js"),__vite__mapDeps([8,1,3]))),lr=L(()=>D(()=>import("./PublicAuctionView-CmivZ0ha.js"),__vite__mapDeps([9,1,3]))),cr=L(()=>D(()=>import("./PublicAuctionRegister-BJmUuR_Y.js"),__vite__mapDeps([10,1,2,5,3]))),dr=L(()=>D(()=>import("./TeamOwnerView-BEen8Z5f.js"),__vite__mapDeps([11,1,3])));function ae(){const t=new URLSearchParams(window.location.search).get("p");t&&window.history.replaceState(null,"",t)}function ur(){ae();const t=window.location.pathname.match(/\/join\/([a-zA-Z0-9\-]+)/);return t?t[1]:null}function pr(){ae();const e=window.location.pathname.match(/\/live-auction(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function fr(){ae();const e=window.location.pathname.match(/\/auction-register(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function mr(){ae();const e=window.location.pathname.match(/\/team-view\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/?$/);return e?{auctionCode:e[1],teamId:e[2]}:null}function gr(){const[e,t]=_.useState("home"),[a,n]=_.useState(null),[r,s]=_.useState(!1),[l,c]=_.useState([]),[d,p]=_.useState(!1),[u,f]=_.useState(null),[b,y]=_.useState(null),[m,h]=_.useState(null),[w,k]=_.useState(null);_.useEffect(()=>{const P=mr();if(P){k(P),t("teamView");return}const B=pr();if(B!==void 0){y(B),t("liveAuction");return}const O=fr();if(O!==void 0){h(O),t("auctionRegister");return}const N=ur();if(N){f(N),t("publicInvite");return}const j=Xn();(j==null?void 0:j.role)==="admin"||(j==null?void 0:j.role)==="founder"?(s(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="organizer"&&(j!=null&&j.player)?(s(!0),C(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="pro"&&(j!=null&&j.player)?(s(!1),S(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="player"&&(j!=null&&j.player)&&(s(!1),n(j.player),x().then(()=>t("portal")))},[]);const x=async()=>{p(!0);try{c(await Ee())}catch{}p(!1)},[F,S]=_.useState(!1),[z,C]=_.useState(!1),$=async P=>{const B=(P.phone||"").replace(/[^0-9]/g,"").slice(-10),O=Mn.replace(/[^0-9]/g,"").slice(-10);console.log("phone:",B,"adminPhone:",O);const N=B===O||P.role==="founder",j=!N&&P.role==="organizer",q=N||j,T=!q&&P.role==="pro";s(q),C(j),S(T),n(P),q||await x(),Qn(N?"founder":j?"organizer":T?"pro":"player",P),t("portal")},A=()=>{Je(),n(null),s(!1),S(!1),C(!1),c([]),t("home")};return o.jsx(er,{children:o.jsxs(_.Suspense,{fallback:o.jsx("div",{style:{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(G,{})}),children:[e==="publicInvite"&&o.jsx(sr,{token:u}),e==="liveAuction"&&o.jsx(lr,{auctionCode:b}),e==="teamView"&&o.jsx(dr,{auctionCode:w==null?void 0:w.auctionCode,teamId:w==null?void 0:w.teamId}),e==="auctionRegister"&&o.jsx(cr,{auctionCode:m}),e==="home"&&o.jsx(Wn,{onLogin:()=>t("login"),onRegister:()=>t("register")}),e==="register"&&o.jsx(ar,{onSuccess:()=>t("registered"),onBack:()=>t("home")}),e==="registered"&&o.jsx(nr,{onBack:()=>t("home")}),e==="login"&&o.jsx(tr,{onAdminSuccess:$,onPlayerSuccess:$,onBack:()=>t("home"),onRegister:()=>t("register")}),e==="portal"&&r&&o.jsx(rr,{player:a,onLogout:A,isFounder:!z}),e==="portal"&&!r&&F&&o.jsx(ir,{player:a,onLogout:A}),e==="portal"&&!r&&!F&&(d||!a?o.jsx("div",{style:{minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(G,{})}):o.jsx(or,{player:a,matches:l,onLogout:A}))]})})}document.documentElement.style.setProperty("background","#F8FAF8","important");document.body.style.setProperty("background","#F8FAF8","important");"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(e=>{e.forEach(t=>t.unregister())}).catch(()=>{});"caches"in window&&caches.keys().then(e=>{e.forEach(t=>caches.delete(t))}).catch(()=>{});async function me(){try{const e=await fetch("/version.json?_cb="+Date.now(),{cache:"no-store"});if(!e.ok)return;const t=await e.json();if(t!=null&&t.v&&t.v>1789163260580){console.warn("New build detected on server. Reloading to latest:",t.v,">",1789163260580);const a=new URL(window.location.href);a.searchParams.set("_v",String(t.v)),window.location.replace(a.toString())}}catch{}}me();setInterval(me,3e4);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&me()});window.addEventListener("vite:preloadError",e=>{e.preventDefault(),console.warn("Dynamic import preload error, fetching fresh bundle:",e);const t=parseInt(sessionStorage.getItem("vite_preload_ts")||"0",10);if(Date.now()-t>6e3){sessionStorage.setItem("vite_preload_ts",String(Date.now()));const a=new URL(window.location.href);a.searchParams.set("_v",String(Date.now())),window.location.replace(a.toString())}});window.addEventListener("unhandledrejection",e=>{var a;const t=((a=e.reason)==null?void 0:a.message)||String(e.reason||"");if(/dynamically imported|loading chunk|failed to fetch/i.test(t)){e.preventDefault();const n=parseInt(sessionStorage.getItem("unhandled_chunk_ts")||"0",10);if(Date.now()-n>6e3){sessionStorage.setItem("unhandled_chunk_ts",String(Date.now()));const r=new URL(window.location.href);r.searchParams.set("_v",String(Date.now())),window.location.replace(r.toString())}}});yt.createRoot(document.getElementById("root")).render(o.jsx(xt.StrictMode,{children:o.jsx(gr,{})}));export{Sn as $,Mn as A,Lr as B,K as C,Hn as D,wr as E,xr as F,In as G,an as H,An as I,cn as J,xa as K,Or as L,Yn as M,ia as N,Lt as O,_e as P,Ln as Q,Se as R,G as S,Dr as T,Ht as U,Mt as V,Rr as W,$r as X,Cr as Y,Ar as Z,D as _,br as a,Ve as a$,vn as a0,En as a1,yn as a2,Rn as a3,ue as a4,Ja as a5,Cn as a6,dn as a7,on as a8,ca as a9,Ct as aA,ee as aB,Nt as aC,At as aD,Ue as aE,Ze as aF,Er as aG,Zn as aH,Ha as aI,jr as aJ,hn as aK,Et as aL,$n as aM,Ra as aN,mn as aO,gn as aP,_r as aQ,Sr as aR,Jt as aS,pn as aT,Va as aU,pa as aV,Tn as aW,Ba as aX,na as aY,Qt as aZ,rn as a_,ha as aa,ra as ab,te as ac,Tt as ad,za as ae,$e as af,Ut as ag,Sa as ah,Re as ai,Ee as aj,Fn as ak,ka as al,Pt as am,Pa as an,sa as ao,qn as ap,qa as aq,xn as ar,jn as as,Ia as at,Fa as au,va as av,Rt as aw,ja as ax,_a as ay,ea as az,Fr as b,Qn as b0,Kn as b1,zr as b2,da as b3,Qa as b4,Xt as b5,qr as b6,Pr as b7,un as b8,Tr as b9,Br as ba,ua as bb,i as bc,kn as bd,nn as be,Kt as bf,la as bg,fn as bh,_n as bi,en as bj,Ka as bk,Za as bl,ln as bm,Nn as bn,Dt as bo,Vt as bp,Yt as bq,$t as br,Xa as bs,Ca as bt,Wt as bu,kt as bv,jt as bw,zn as bx,Ft as by,U as c,Jn as d,Ir as e,Nr as f,Vn as g,Wr as h,Pn as i,ya as j,oa as k,It as l,le as m,Ya as n,Ot as o,Bn as p,$a as q,aa as r,kr as s,vr as t,Me as u,Zt as v,Ea as w,wn as x,sn as y,Gt as z};
