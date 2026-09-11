const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LoginScreens-Cep1xH6u.js","assets/vendor-react-ChecQWJN.js","assets/PhotoCropModal-Dajk8g3A.js","assets/vendor-supabase-BUgTx0zs.js","assets/AdminPortal-DuS9t30j.js","assets/indianStatesCities-CBX8Li9T.js","assets/GroundBookingsSection-DHekwxF5.js","assets/PlayerPortal-C9a05wTR.js","assets/ProPortal-CrPb_c8M.js","assets/GroundOwnerPortal-tzYgPl8_.js","assets/PublicInvitePage-BrQnTBwG.js","assets/PublicAuctionView-tlZxFQN0.js","assets/PublicAuctionRegister-CS_nmZhX.js","assets/TeamOwnerView-C-_YgfNL.js"])))=>i.map(i=>d[i]);
import{ad as F,a7 as st,a0 as ze,a4 as Ee,ac as o,X as lt,aa as Re,z as ct,d as qe,b as dt,_ as ut,K as pt,C as ft,i as _e,g as mt,a1 as Fe,B as gt,T as ht,j as $e,t as yt,$ as xt,W as bt,s as Be,a as wt,I as _t,f as Se,ab as Ft,R as St}from"./vendor-react-ChecQWJN.js";import{c as vt}from"./vendor-supabase-BUgTx0zs.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();const jt="modulepreload",kt=function(e){return"/"+e},ve={},D=function(t,n,a){let r=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));r=Promise.allSettled(n.map(c=>{if(c=kt(c),c in ve)return;ve[c]=!0;const u=c.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${p}`))return;const f=document.createElement("link");if(f.rel=u?"stylesheet":jt,u||(f.as="script"),f.crossOrigin="",f.href=c,d&&f.setAttribute("nonce",d),document.head.appendChild(f),u)return new Promise((x,y)=>{f.addEventListener("load",x),f.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(l){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=l,window.dispatchEvent(d),!d.defaultPrevented)throw l}return r.then(l=>{for(const d of l||[])d.status==="rejected"&&s(d.reason);return t().catch(s)})};function Ct(e=900){const[t,n]=F.useState(()=>window.innerWidth<=e);return F.useEffect(()=>{const a=()=>n(window.innerWidth<=e);return window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[e]),t}const Pt="https://vsuemsmjbkrciidbvmfj.supabase.co",At="sb_publishable_CXzyHivaMP9h5IfZYqu7fw_bALpjwuq",i=vt(Pt,At);function te(e){if(!e)return null;const t=new Date(e),n=new Date;let a=n.getFullYear()-t.getFullYear();return n.getMonth()>t.getMonth()||n.getMonth()===t.getMonth()&&n.getDate()>=t.getDate()||a--,a<19?"Under 19":null}async function pe(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10),{data:n,error:a}=await i.from("players").select("id, phone");if(a)throw a;return(n||[]).some(r=>(r.phone||"").replace(/[^0-9]/g,"").slice(-10)===t)}async function zt(e,t){const n=e.name.split(".").pop(),r=`profile-photos/${(t||"anon").replace(/[^0-9]/g,"")}-${Date.now()}.${n}`,{error:s}=await i.storage.from("team-assets").upload(r,e,{upsert:!0});if(s)throw s;const{data:l}=i.storage.from("team-assets").getPublicUrl(r);return l.publicUrl}async function Et(e,t,n){const a=e.name.split(".").pop(),r=(n||"anon").replace(/[^0-9]/g,""),s=`payment-receipts/${t||"auc"}-${r}-${Date.now()}.${a}`,{error:l}=await i.storage.from("team-assets").upload(s,e,{upsert:!0});if(l)throw l;const{data:d}=i.storage.from("team-assets").getPublicUrl(s);return d.publicUrl}async function ne(e,t,n){try{await i.from("activity_log").insert({actor_player_id:e||null,action:t,summary:n})}catch{}}async function Rt(e=8){const{data:t,error:n}=await i.from("activity_log").select("*").order("created_at",{ascending:!1}).limit(e);if(n)throw n;return t}async function V(e,t){try{await i.from("notifications").insert({type:e,message:t})}catch{}}async function qt(e=20){const{data:t,error:n}=await i.from("notifications").select("*").order("created_at",{ascending:!1}).limit(e);if(n)throw n;return t}async function $t(){const{count:e,error:t}=await i.from("notifications").select("id",{count:"exact",head:!0}).eq("read",!1);if(t)throw t;return e||0}async function Bt(e){const{error:t}=await i.from("notifications").update({read:!0}).eq("id",e);if(t)throw t}async function Tt(){const{error:e}=await i.from("notifications").update({read:!0}).eq("read",!1);if(e)throw e}async function Te(){const{data:e,error:t}=await i.from("players").select("*").order("name");if(t)throw t;return e}async function fe(e,t,n="1234",a=null,r=null,s=null,l={}){if(await pe(t))throw new Error("This phone number is already registered.");const d=te(r),{data:c,error:u}=await i.from("players").insert({name:e,phone:t,pin:n,created_by:a,birth_date:r||null,profile_image_url:s||null,category:d,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,registration_source:l.source||"direct"}).select().single();if(u)throw u;return c&&c.approved===!1&&await V("player_pending",`${e} registered and is awaiting approval`),c}async function It(e){const{data:t,error:n}=await i.from("players").select("*").eq("created_by",e).order("name");if(n)throw n;return t}async function Dt(e,t,n,a,r,s={}){const l={name:t,phone:n,pin:a,city:r};s.birthDate!==void 0&&(l.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(l.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(l.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(l.jersey_size=s.jerseySize||null);const{error:d}=await i.from("players").update(l).eq("id",e);if(d)throw d;try{const c=(n||"").replace(/[^0-9]/g,"").slice(-10);if(c){const u={};t&&(u.name=t),r&&(u.city=r),s.birthDate!==void 0&&(u.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(u.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(u.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(u.jersey_size=s.jerseySize||null),Object.keys(u).length>0&&await i.from("auction_players").update(u).ilike("phone",`%${c}`)}}catch(c){console.warn("Could not sync auction_players:",c)}}async function Lt(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function Ot(){const{data:e,error:t}=await i.from("grounds").select("*").order("name");if(t)throw t;return e}async function Nt(e,t,n,a){const{data:r,error:s}=await i.from("grounds").insert({name:e,location:t,maps_link:n,notes:a}).select().single();if(s)throw s;return r}async function Mt(e,t){const{error:n}=await i.from("grounds").update(t).eq("id",e);if(n)throw n}async function Wt(e){const{error:t}=await i.from("grounds").delete().eq("id",e);if(t)throw t}async function Gt(){const{data:e,error:t}=await i.from("teams").select("*").order("name");if(t)throw t;return e}async function Ut(e,t){const{data:n,error:a}=await i.from("teams").insert({name:e,logo_url:t}).select().single();if(a)throw a;return n}async function Ht(e,t,n){const{error:a}=await i.from("teams").update({name:t,logo_url:n}).eq("id",e);if(a)throw a}async function Yt(e){const{error:t}=await i.from("teams").delete().eq("id",e);if(t)throw t}async function me(e,t){const n=e.name.split(".").pop(),a=`team-logos/${t.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${n}`,{error:r}=await i.storage.from("team-assets").upload(a,e,{upsert:!0});if(r)throw r;const{data:s}=i.storage.from("team-assets").getPublicUrl(a);return s.publicUrl}async function Ie(){const{data:e,error:t}=await i.from("matches").select("*").order("date",{ascending:!1});if(t)throw t;return e}async function Vt(e){const{data:t,error:n}=await i.from("matches").select("*").eq("invite_token",e).single();if(n)throw n;return t}async function Kt({date:e,time_slot:t,ground:n,team:a,team_logo:r,our_team:s,our_team_logo:l,type:d,max_players:c,created_by:u,visibility:p}){const{data:f,error:x}=await i.from("matches").insert({date:e,time_slot:t,ground:n,team:a,team_logo:r,our_team:s||null,our_team_logo:l||null,type:d,max_players:c,created_by:u||null,status:"upcoming",link_active:!1,visibility:p||"private"}).select().single();if(x)throw x;let y="Someone";if(u){const{data:h}=await i.from("players").select("name").eq("id",u).maybeSingle();h!=null&&h.name&&(y=h.name)}const m=s?`${s} vs ${a}`:a;return await ne(u,"match_created",`${y} created ${m}`),f}async function Jt(e){await i.from("match_players").delete().eq("match_id",e),await i.from("expenses").delete().eq("match_id",e),await i.from("payments").delete().eq("match_id",e),await i.from("chat_messages").delete().eq("match_id",e),await i.from("public_responses").delete().eq("match_id",e);const{error:t}=await i.from("matches").delete().eq("id",e);if(t)throw t}async function Zt(e,t){const{error:n}=await i.from("matches").update({status:t}).eq("id",e);if(n)throw n;if(t==="completed"){const{data:a}=await i.from("matches").select("team, our_team").eq("id",e).maybeSingle();a&&await ne(null,"match_completed",`Match completed: ${a.our_team?`${a.our_team} vs ${a.team}`:a.team}`)}}async function Qt(e,t){const{error:n}=await i.from("matches").update({max_players:t}).eq("id",e);if(n)throw n}async function Xt(e,t){const{error:n}=await i.from("matches").update({link_active:t}).eq("id",e);if(n)throw n}async function De(e){const{data:t,error:n}=await i.from("match_players").select("*, players(id, name, phone, role)").eq("match_id",e).order("responded_at",{ascending:!0,nullsFirst:!1});if(n)throw n;return t}async function en(e,t,n){let a=n||"confirmed",r=!1,s=null;if(a==="confirmed"){const{data:d}=await i.from("matches").select("max_players, team, date").eq("id",e).single();s=d;const c=(d==null?void 0:d.max_players)||0;if(c>0){const{data:u}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!u||u.status!=="confirmed"){const{count:p}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(p||0)>=c?a="waitlist":(p||0)+1===c&&(r=!0)}}}const{error:l}=await i.from("match_players").upsert({match_id:e,player_id:t,status:a,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(l)throw l;if(r&&a==="confirmed"&&s)try{const{data:d}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","confirmed"),c=(d||[]).map(p=>p.player_id),u=`🔒 Squad full for ${s.team} on ${s.date}! See you there 🏏[[match:${e}]]`;await Promise.all(c.map(p=>Le(p,"System",u).catch(()=>{})))}catch{}return a}async function tn(e,t){const{error:n}=await i.from("match_players").upsert({match_id:e,player_id:t,status:"pending"},{onConflict:"match_id,player_id"});if(n)throw n}async function nn(e,t){const{error:n}=await i.from("match_players").delete().eq("match_id",e).eq("player_id",t);if(n)throw n;await ge(e)}async function an(e,t,n){let a=n;if(n==="confirmed"){const{data:s}=await i.from("matches").select("max_players").eq("id",e).single(),l=(s==null?void 0:s.max_players)||0;if(l>0){const{data:d}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!d||d.status!=="confirmed"){const{count:c}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(c||0)>=l&&(a="waitlist")}}}const{error:r}=await i.from("match_players").upsert({match_id:e,player_id:t,status:a,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(r)throw r;return n!=="confirmed"&&await ge(e),a}async function rn(e){const{data:t,error:n}=await i.from("public_responses").select("*").eq("match_id",e).order("created_at");if(n)throw n;return t}async function on(e,t,n,a){const{data:r}=await i.from("public_responses").select("id").eq("match_id",e).ilike("name",t.trim()).maybeSingle();if(r){const{error:d}=await i.from("public_responses").update({availability:a,phone:n,approved:null}).eq("id",r.id);if(d)throw d;return{updated:!0}}const{data:s,error:l}=await i.from("public_responses").insert({match_id:e,name:t.trim(),phone:(n==null?void 0:n.trim())||null,availability:a,approved:null}).select().single();if(l)throw l;return s}async function sn(e,t,n,a,r){const{data:s}=await i.from("match_players").select("id").eq("match_id",t).eq("status","confirmed"),d=((s==null?void 0:s.length)||0)>=r;let c=null;const{data:u}=await i.from("players").select("*").ilike("name",n.trim()).maybeSingle();if(u)c=u,a&&!u.phone&&await i.from("players").update({phone:a}).eq("id",u.id);else{const{data:x,error:y}=await i.from("players").insert({name:n.trim(),phone:(a==null?void 0:a.trim())||null,pin:"1234"}).select().single();if(y)throw y;c=x}const p=d?"waitlist":"confirmed";await i.from("match_players").upsert({match_id:t,player_id:c.id,status:p,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});const{error:f}=await i.from("public_responses").update({approved:!0,player_id:c.id}).eq("id",e);if(f)throw f;return{player:c,status:p}}async function ln(e){const{error:t}=await i.from("public_responses").update({approved:!1}).eq("id",e);if(t)throw t}async function cn(e){const{data:t,error:n}=await i.from("expenses").select("*").eq("match_id",e);if(n)throw n;return t}async function dn(e,t,n){const{data:a,error:r}=await i.from("expenses").insert({match_id:e,label:t,amount:n}).select().single();if(r)throw r;return a}async function un(e){const{error:t}=await i.from("expenses").delete().eq("id",e);if(t)throw t}async function pn(e){const{data:t,error:n}=await i.from("payments").select("*").eq("match_id",e);if(n)throw n;return t}async function fn(e,t,n){const{error:a}=await i.from("payments").upsert({match_id:e,player_id:t,paid:n},{onConflict:"match_id,player_id"});if(a)throw a}async function mn(e){const{data:t,error:n}=await i.from("chat_messages").select("*").eq("match_id",e).order("sent_at");if(n)throw n;return t}async function gn(e,t,n){const{data:a,error:r}=await i.from("chat_messages").insert({match_id:e,sender:t,message:n}).select().single();if(r)throw r;return a}function hn(e,t){return i.channel("chat:"+e).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:`match_id=eq.${e}`},n=>t(n.new)).subscribe()}async function ae(){const{data:e,error:t}=await i.from("settings").select("*");if(t)throw t;return Object.fromEntries((e||[]).map(n=>[n.key,n.value]))}async function N(e,t){const{error:n}=await i.from("settings").upsert({key:e,value:t},{onConflict:"key"});if(n)throw n}async function yn(e,t,n,a=null,r=null,s={}){if(await pe(t))throw new Error("This phone number is already registered.");const l=te(a),{data:d,error:c}=await i.from("players").insert({name:e,phone:t,pin:n,approved:!0,birth_date:a||null,profile_image_url:r||null,category:l,city:s.city||null,jersey_number:s.jerseyNumber||null,jersey_size:s.jerseySize||null,registration_source:"direct"}).select().single();if(c)throw c;return d}async function xn(){const{data:e,error:t}=await i.from("players").select("*").eq("approved",!1).order("id",{ascending:!1});if(t)throw t;return e}async function bn(e){const{error:t}=await i.from("players").update({approved:!0}).eq("id",e);if(t)throw t;const{data:n}=await i.from("players").select("name").eq("id",e).maybeSingle();n!=null&&n.name&&await ne(null,"player_approved",`${n.name} was approved`)}async function wn(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function _n(e){const{data:t,error:n}=await i.from("contributions").select("*").eq("player_id",e).order("date",{ascending:!1});if(n)throw n;return t}async function Fn(e,t,n,a,r){const{data:s,error:l}=await i.from("contributions").insert({player_id:e,amount:t,note:n||null,date:a||new Date().toISOString().split("T")[0],match_id:r||null}).select().single();if(l)throw l;return s}async function Sn(e){const{error:t}=await i.from("contributions").delete().eq("id",e);if(t)throw t}async function vn(e,t){if(!t)return!1;const{data:n}=await i.from("contributions").select("id").eq("player_id",e).eq("match_id",t).maybeSingle();return!!n}async function jn(){const[e,t,n]=await Promise.all([i.from("matches").select("id",{count:"exact",head:!0}),i.from("players").select("id",{count:"exact",head:!0}),i.from("grounds").select("id",{count:"exact",head:!0})]);return{matches:e.count||0,players:t.count||0,venues:n.count||0}}async function kn(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),n=(t||[]).map(s=>s.id);let a=0;if(n.length>0){const{data:s}=await i.from("match_players").select("player_id").in("match_id",n);a=new Set((s||[]).map(l=>l.player_id)).size}const{count:r}=await i.from("grounds").select("id",{count:"exact",head:!0});return{matches:n.length,players:a,venues:r||0}}async function Cn(e){const{data:t,error:n}=await i.from("match_players").select("status, matches(id, date, time_slot, ground, team, our_team, status, type)").eq("player_id",e).eq("status","confirmed");if(n)throw n;return(t||[]).map(a=>a.matches).filter(Boolean).sort((a,r)=>new Date(r.date)-new Date(a.date))}async function Pn(e){const{data:t}=await i.from("match_players").select("match_id, status").eq("player_id",e).eq("status","confirmed"),n=(t||[]).map(r=>r.match_id);let a=0;if(n.length>0){const{data:r}=await i.from("matches").select("ground").in("id",n);a=new Set((r||[]).map(s=>s.ground).filter(Boolean)).size}return{matches:n.length,venues:a}}async function An(e){if(!e||e.length===0)return{};const{data:t}=await i.from("match_players").select("match_id, status").in("match_id",e).eq("status","confirmed"),n={};return(t||[]).forEach(a=>{n[a.match_id]=(n[a.match_id]||0)+1}),n}async function ge(e){const{data:t}=await i.from("matches").select("max_players").eq("id",e).single(),n=(t==null?void 0:t.max_players)||0;if(n<=0)return null;const{count:a}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");if((a||0)>=n)return null;const{data:r}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","waitlist").order("responded_at",{ascending:!0,nullsFirst:!1}).limit(1);if(!r||r.length===0)return null;const s=r[0].player_id;return await i.from("match_players").update({status:"confirmed"}).eq("match_id",e).eq("player_id",s),s}async function zn(e){const{data:t}=await i.from("matches").select("id, date").eq("created_by",e),n=(t||[]).map(c=>c.id);if(n.length===0)return[];const a=Object.fromEntries((t||[]).map(c=>[c.id,c.date])),{data:r}=await i.from("match_players").select("match_id, player_id, status, players(id, name, phone, city)").in("match_id",n),{data:s}=await i.from("contributions").select("player_id, amount").in("match_id",n),l={};(s||[]).forEach(c=>{l[c.player_id]=(l[c.player_id]||0)+Number(c.amount)});const d={};return(r||[]).forEach(c=>{const u=c.players;if(u)if(d[u.id]||(d[u.id]={id:u.id,name:u.name,phone:u.phone,city:u.city,played:0,confirmed:0,declined:0,contributed:0,lastPlayedDate:null}),c.status==="confirmed"){d[u.id].confirmed++,d[u.id].played++;const p=a[c.match_id];p&&(!d[u.id].lastPlayedDate||p>d[u.id].lastPlayedDate)&&(d[u.id].lastPlayedDate=p)}else c.status==="declined"&&d[u.id].declined++}),Object.values(d).forEach(c=>{c.contributed=l[c.id]||0}),Object.values(d).sort((c,u)=>u.played-c.played)}async function En(e){const[{data:t,error:n},{data:a,error:r}]=await Promise.all([i.from("match_players").select("status, matches(*)").eq("player_id",e),i.from("matches").select("*").eq("visibility","public").eq("status","upcoming")]);if(n)throw n;if(r)throw r;const s=(t||[]).filter(c=>c.matches).map(c=>({match:c.matches,myStatus:c.status})),l=new Set(s.map(c=>c.match.id)),d=(a||[]).filter(c=>!l.has(c.id)).map(c=>({match:c,myStatus:"pending"}));return[...s,...d]}async function Rn(e,t){const{error:n}=await i.from("players").update({upi_id:t}).eq("id",e);if(n)throw n}async function qn(e){try{if(e!=null&&e.created_by){const{data:t}=await i.from("players").select("upi_id").eq("id",e.created_by).maybeSingle();if(t!=null&&t.upi_id)return t.upi_id}}catch{}try{const t=await ae();return(t==null?void 0:t.upi)||(t==null?void 0:t.upi_id)||""}catch{return""}}async function Le(e,t,n){const{error:a}=await i.from("admin_messages").insert({player_id:e,sender:t,message:n});if(a)throw a}async function $n(){const{data:e,error:t}=await i.from("admin_messages").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Bn(e){const{data:t,error:n}=await i.from("admin_messages").select("*").or(`player_id.eq.${e},player_id.is.null`).order("created_at",{ascending:!1});if(n)throw n;return t}async function Tn(e){const{count:t,error:n}=await i.from("admin_messages").select("id",{count:"exact",head:!0}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(n)throw n;return t||0}async function In(e){const{error:t}=await i.from("admin_messages").update({read_at:new Date().toISOString()}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(t)throw t}async function Oe(){const{data:e,error:t}=await i.from("match_players").select("player_id, status, created_at, players(id, name, city, role, profile_image_url), matches!inner(status, date, team, our_team)").eq("status","confirmed").eq("matches.status","completed");if(t)throw t;return e||[]}async function Ne(e){const{data:t,error:n}=await i.from("pro_requests").insert({player_id:e,status:"pending"}).select().single();if(n)throw n;const{data:a}=await i.from("players").select("name").eq("id",e).maybeSingle();return a!=null&&a.name&&await V("pro_request",`${a.name} requested Pro access`),t}async function Me(e){const{error:t}=await i.from("pro_requests").delete().eq("id",e);if(t)throw t}async function We(e){const{data:t,error:n}=await i.from("pro_requests").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(n)throw n;return t}async function Dn(){const{data:e,error:t}=await i.from("pro_requests").select("*, players(id, name, phone)").eq("status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function Ln(e,t){const n=new Date(Date.now()+5184e6).toISOString().slice(0,10),{error:a}=await i.from("players").update({role:"pro",subscription_expiry:n}).eq("id",t);if(a)throw a;const{error:r}=await i.from("pro_requests").update({status:"approved",decided_at:new Date().toISOString()}).eq("id",e);if(r)throw r}async function On(e){const{error:t}=await i.from("pro_requests").update({status:"rejected",decided_at:new Date().toISOString()}).eq("id",e);if(t)throw t}async function Nn(e=5){const{data:t,error:n}=await i.from("players").select("name, city, id").order("id",{ascending:!1}).limit(e);if(n)throw n;return t}async function Mn(e){const{data:t}=await i.from("match_players").select("match_id").eq("player_id",e).eq("status","confirmed"),n=(t||[]).map(c=>c.match_id);if(n.length===0)return[];const{data:a}=await i.from("matches").select("ground").in("id",n),r=Array.from(new Set((a||[]).map(c=>c.ground).filter(Boolean)));if(r.length===0)return[];const{data:s}=await i.from("grounds").select("id, name, location").in("name",r),l=new Set((s||[]).map(c=>c.name)),d=r.filter(c=>!l.has(c)).map(c=>({id:c,name:c,location:""}));return[...s||[],...d]}async function Ge(e,t,n){const{error:a}=await i.from("direct_messages").insert({sender_id:e,recipient_id:t,message:n});if(a)throw a}async function Wn(e,t){const{data:n,error:a}=await i.from("direct_messages").select("*").or(`and(sender_id.eq.${e},recipient_id.eq.${t}),and(sender_id.eq.${t},recipient_id.eq.${e})`).order("created_at",{ascending:!0});if(a)throw a;return n}async function Gn(e){const{data:t,error:n}=await i.from("direct_messages").select("*, sender:sender_id(id,name), recipient:recipient_id(id,name)").or(`sender_id.eq.${e},recipient_id.eq.${e}`).order("created_at",{ascending:!1});if(n)throw n;const a={};return(t||[]).forEach(r=>{var d,c;const s=r.sender_id===e?r.recipient_id:r.sender_id,l=(r.sender_id===e?(d=r.recipient)==null?void 0:d.name:(c=r.sender)==null?void 0:c.name)||"Player";a[s]||(a[s]={otherId:s,otherName:l,lastMessage:r.message,lastAt:r.created_at,unread:0}),r.recipient_id===e&&!r.read_at&&a[s].unread++}),Object.values(a).sort((r,s)=>new Date(s.lastAt)-new Date(r.lastAt))}async function Un(e,t){const{error:n}=await i.from("direct_messages").update({read_at:new Date().toISOString()}).eq("recipient_id",e).eq("sender_id",t).is("read_at",null);if(n)throw n}async function Hn(e){const{count:t,error:n}=await i.from("direct_messages").select("id",{count:"exact",head:!0}).eq("recipient_id",e).is("read_at",null);if(n)throw n;return t||0}async function Yn(e){const{data:t}=await i.from("players").select("id, name, role").eq("role","admin"),{data:n}=await i.from("match_players").select("status, matches(created_by)").eq("player_id",e).eq("status","confirmed"),a=Array.from(new Set((n||[]).map(l=>{var d;return(d=l.matches)==null?void 0:d.created_by}).filter(Boolean)));let r=[];if(a.length>0){const{data:l}=await i.from("players").select("id, name, role").in("id",a).eq("role","pro");r=l||[]}const s=new Map;return[...t||[],...r].forEach(l=>s.set(l.id,l)),Array.from(s.values())}async function Vn(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),n=(t||[]).map(s=>s.id);if(n.length===0)return[];const{data:a}=await i.from("match_players").select("player_id, status, players(id, name)").in("match_id",n).eq("status","confirmed"),r=new Map;return(a||[]).forEach(s=>{s.players&&!r.has(s.player_id)&&r.set(s.player_id,s.players)}),Array.from(r.values())}async function Ue(){const{count:e,error:t}=await i.from("players").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function He(){const{data:e,error:t}=await i.from("players").select("id").eq("role","admin").limit(1).maybeSingle();if(t)throw t;return(e==null?void 0:e.id)||null}async function Kn(e,t,n){const{error:a}=await i.from("feedback").insert({player_id:e,sender_name:t,message:n});if(a)throw a}async function Jn(){const{data:e,error:t}=await i.from("feedback").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Zn(e){const t=(e||"").trim();if(!t)return{players:[],teams:[],grounds:[],matches:[]};const[n,a,r,s]=await Promise.all([i.from("players").select("id, name, city, role").ilike("name",`%${t}%`).limit(5),i.from("teams").select("id, name").ilike("name",`%${t}%`).limit(5),i.from("grounds").select("id, name, location").ilike("name",`%${t}%`).limit(5),i.from("matches").select("id, team, our_team, ground, date, status").ilike("team",`%${t}%`).limit(5)]);return{players:n.data||[],teams:a.data||[],grounds:r.data||[],matches:s.data||[]}}async function Ye(){const{count:e,error:t}=await i.from("matches").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ve(){const{count:e,error:t}=await i.from("teams").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Qn(e,t){const n=(t.phone||"").replace(/[^0-9]/g,"").slice(-10);if(await Ke(n,e))return null;const r=te(t.birth_date),s=await Q(e),{data:l,error:d}=await i.from("auction_players").insert({name:t.name,phone:n,status:"registered",auction_id:e,birth_date:t.birth_date||null,profile_image_url:t.profile_image_url||null,category:r,city:t.city||null,jersey_number:t.jersey_number||null,jersey_size:t.jersey_size||null,base_price:s}).select().single();if(d)throw d;return l}async function Q(e){if(!e)return null;const{data:t}=await i.from("auctions").select("points_purse").eq("id",e).maybeSingle();return t!=null&&t.points_purse?Math.round(t.points_purse/100):null}async function Xn(e,t,n,a=null,r=null,s=null,l={}){var y,m;const d=te(a),c=await Q(s),u={name:e,phone:t,playing_role:n,status:l.status||"registered",birth_date:a||null,profile_image_url:r||null,category:d,auction_id:s||null,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,base_price:c};l.paymentScreenshotUrl&&(u.payment_screenshot_url=l.paymentScreenshotUrl),l.paymentStatus&&(u.payment_status=l.paymentStatus);let{data:p,error:f}=await i.from("auction_players").insert(u).select().single();if(f&&((y=f.message)!=null&&y.includes("payment_screenshot_url")||(m=f.message)!=null&&m.includes("payment_status"))){console.warn("Retrying registerAuctionPlayer without payment columns:",f.message),delete u.payment_screenshot_url,delete u.payment_status;const h=await i.from("auction_players").insert(u).select().single();if(h.error)throw h.error;p=h.data}else if(f)throw f;const x=l.status==="waitlist"?`${e} joined the waiting list for auction`:`${e} registered for the auction`;await V("auction_registration",x);try{await fe(e,t,"1234",null,a,r,{...l,source:"auction"})}catch(h){console.error("Failed to sync auction registrant into main player roster:",h)}return p}async function ea(e,t){const{error:n}=await i.from("auction_players").update({payment_status:t}).eq("id",e);if(n)throw n}async function ta(e,t,n=null){const a={status:t};n&&(a.payment_status=n);const{error:r}=await i.from("auction_players").update(a).eq("id",e);if(r)throw r}async function he(e=null){let t=i.from("auction_players").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:n,error:a}=await t;if(a)throw a;return n}async function Ke(e,t=null){const n=(e||"").replace(/[^0-9]/g,"").slice(-10);let a=i.from("auction_players").select("id, phone");a=t?a.eq("auction_id",t):a.is("auction_id",null);const{data:r,error:s}=await a;if(s)throw s;return(r||[]).some(l=>(l.phone||"").replace(/[^0-9]/g,"").slice(-10)===n)}async function Je(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10);if(t.length!==10)return null;const{data:n,error:a}=await i.from("players").select("id, name, playing_role, birth_date, profile_image_url, category, city, jersey_number, jersey_size").ilike("phone",`%${t}`);if(a)throw a;return n&&n[0]||null}async function na(e=null){if(e){const{data:n,error:a}=await i.from("auctions").select("registration_open").eq("id",e).maybeSingle();if(a)throw a;return(n==null?void 0:n.registration_open)!==!1}const t=await ae();return(t==null?void 0:t.auction_registration_open)!=="false"}async function aa(e,t){if(typeof e=="boolean"){await N("auction_registration_open",e?"true":"false");return}const{error:n}=await i.from("auctions").update({registration_open:t}).eq("id",e);if(n)throw n}async function ra(e,t){const{error:n}=await i.from("players").update({playing_role:t}).eq("id",e);if(n)throw n;try{const{data:a}=await i.from("players").select("phone").eq("id",e).maybeSingle(),r=((a==null?void 0:a.phone)||"").replace(/[^0-9]/g,"").slice(-10);r&&await i.from("auction_players").update({playing_role:t}).ilike("phone",`%${r}`)}catch(a){console.warn("Could not sync auction_players role:",a)}}async function oa(e,t){const{error:n}=await i.from("auction_players").update({base_price:t}).eq("id",e);if(n)throw n}async function ia(e,t){const{error:n}=await i.from("auction_players").update({category:t}).eq("id",e);if(n)throw n}async function sa(e){const{error:t}=await i.from("auction_players").delete().eq("id",e);if(t)throw t}async function la(e){const{error:t}=await i.from("auction_players").update({status:"dropped",payment_status:"refunded"}).eq("id",e);if(t)throw t}async function ca(e){const{error:t}=await i.from("auction_players").update({status:"registered",payment_status:"paid"}).eq("id",e);if(t)throw t}async function da(e=null){let t=i.from("auction_teams").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:n,error:a}=await t;if(a)throw a;if(!n||n.length===0)return[];try{const r=n.map(d=>`auction_team_logo_${d.id}`),{data:s}=await i.from("settings").select("key, value").in("key",r),l={};return s&&s.forEach(d=>{l[d.key]=d.value}),n.map(d=>({...d,logo_url:d.logo_url||l[`auction_team_logo_${d.id}`]||null}))}catch(r){return console.warn("Could not load team logos:",r),n}}async function ye(e,t,{captainPlayerId:n,captainPhone:a,captainName:r}){var l,d,c,u,p;const s=(a||"").replace(/[^0-9]/g,"").slice(-10);if(n){const f={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(f.name=r.trim());let x=await i.from("auction_players").update(f).eq("id",n);x.error&&((l=x.error.message)!=null&&l.includes("is_captain"))&&(delete f.is_captain,await i.from("auction_players").update(f).eq("id",n));return}if(s&&s.length===10){let f=i.from("auction_players").select("id, name, phone");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:x}=await f,y=(x||[]).find(A=>(A.phone||"").replace(/[^0-9]/g,"").slice(-10)===s);if(y){const A={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};r&&(A.name=r.trim());let R=await i.from("auction_players").update(A).eq("id",y.id);R.error&&((d=R.error.message)!=null&&d.includes("is_captain"))&&(delete A.is_captain,await i.from("auction_players").update(A).eq("id",y.id));return}let m=null,h=null,w=null,k=null,_=null,b=null,S=r?r.trim():"Captain";try{const A=await Je(s);A&&(!r&&A.name&&(S=A.name),m=A.profile_image_url||null,h=A.playing_role||null,w=A.city||null,k=A.birth_date||null,_=A.jersey_number||null,b=A.jersey_size||null)}catch{}const z=await Q(t),P={name:S,phone:s,playing_role:h||"All-rounder",status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,profile_image_url:m,city:w,birth_date:k,jersey_number:_,jersey_size:b,base_price:z||0};let E=await i.from("auction_players").insert(P);E.error&&((c=E.error.message)!=null&&c.includes("is_captain"))&&(delete P.is_captain,await i.from("auction_players").insert(P));return}if(r&&r.trim()){let f=i.from("auction_players").select("id, name");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:x}=await f,y=(x||[]).find(m=>(m.name||"").trim().toLowerCase()===r.trim().toLowerCase());if(y){const m={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};let h=await i.from("auction_players").update(m).eq("id",y.id);h.error&&((u=h.error.message)!=null&&u.includes("is_captain"))&&(delete m.is_captain,await i.from("auction_players").update(m).eq("id",y.id))}else{const m=await Q(t),h={name:r.trim(),status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,base_price:m||0};let w=await i.from("auction_players").insert(h);w.error&&((p=w.error.message)!=null&&p.includes("is_captain"))&&(delete h.is_captain,await i.from("auction_players").insert(h))}}}async function ua(e,t,n,a=null,r=null,s=null,l=null,d=null,c=null,u=null){var m,h;const p={name:e,owner_name:t||null,captain_name:r||null,purse_total:n,purse_remaining:n,auction_id:a||null};s&&(p.captain_phone=s),l&&(p.owner_phone=l);let f,{data:x,error:y}=await i.from("auction_teams").insert(p).select().single();if(y&&((m=y.message)!=null&&m.includes("captain_phone")||(h=y.message)!=null&&h.includes("owner_phone"))){delete p.captain_phone,delete p.owner_phone;const w=await i.from("auction_teams").insert(p).select().single();if(w.error)throw w.error;f=w.data}else{if(y)throw y;f=x}if(f!=null&&f.id&&(d||s||r))try{await ye(f.id,a,{captainPlayerId:d,captainPhone:s,captainName:r})}catch(w){console.warn("Could not pre-assign captain:",w)}if(f!=null&&f.id)try{let w=u||null;c&&(w=await me(c,e)),w&&(await N(`auction_team_logo_${f.id}`,w),f.logo_url=w)}catch(w){console.warn("Could not save team logo:",w)}return f}async function pa(e,{name:t,ownerName:n,purseTotal:a,captainName:r,captainPhone:s,ownerPhone:l,captainPlayerId:d,auctionId:c,logoFile:u,logoUrl:p}){var y,m;const f={name:t,owner_name:n||null,captain_name:r||null,purse_total:a,purse_remaining:a};s&&(f.captain_phone=s),l&&(f.owner_phone=l);let{error:x}=await i.from("auction_teams").update(f).eq("id",e);if(x&&((y=x.message)!=null&&y.includes("captain_phone")||(m=x.message)!=null&&m.includes("owner_phone"))){delete f.captain_phone,delete f.owner_phone;const h=await i.from("auction_teams").update(f).eq("id",e);if(h.error)throw h.error}else if(x)throw x;if(e&&(d||s||r))try{await ye(e,c,{captainPlayerId:d,captainPhone:s,captainName:r})}catch(h){console.warn("Could not update pre-assigned captain:",h)}try{if(u){const h=await me(u,t);await N(`auction_team_logo_${e}`,h)}else p!==void 0&&(p?await N(`auction_team_logo_${e}`,p):await i.from("settings").delete().eq("key",`auction_team_logo_${e}`))}catch(h){console.warn("Could not update team logo:",h)}}async function fa(e){const{error:t}=await i.from("auction_players").update({status:"registered",sold_team_id:null,sold_price:null,sold_at:null}).eq("sold_team_id",e);if(t)throw t;try{await i.from("auction_bids").delete().eq("team_id",e)}catch(a){console.warn("Could not delete bids for team:",a)}try{await i.from("auctions").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("auction_state").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("settings").delete().eq("key",`auction_team_logo_${e}`)}catch{}const{error:n}=await i.from("auction_teams").delete().eq("id",e);if(n)throw n}async function ma(e=null){if(e)return await Xe(e);const{data:t,error:n}=await i.from("auction_state").select("*").eq("id",1).single();if(n)throw n;return t}function Ze(e,t){const n=e.filter(r=>r.id!==t&&r.status==="registered"&&!r.is_captain&&r.status!=="captain");if(n.length===0)return null;const a=Math.floor(Math.random()*n.length);return n[a]}async function ga(e,t=null){const n=await he(t),a=Ze(n,null);if(!a)throw new Error("No players in the pool yet — add players before starting.");const r=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(r).update({status:"live",bid_increment:e,current_player_id:a.id,current_bid:a.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function ha(e,t,n,a=null){const{error:r}=await i.from("auction_bids").insert({player_id:e,team_id:t,amount:n,auction_id:a||null});if(r)throw r;const s=a?"auctions":"auction_state",l=a||1,{error:d}=await i.from(s).update({current_bid:n,current_team_id:t}).eq("id",l);if(d)throw d}async function ya(e,t=null){const{data:n,error:a}=await i.from("auction_bids").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(2);if(a)throw a;if(!n||n.length===0)return;const{error:r}=await i.from("auction_bids").delete().eq("id",n[0].id);if(r)throw r;const s=n[1],{data:l}=await i.from("auction_players").select("base_price").eq("id",e).single(),d=t?"auctions":"auction_state",c=t||1,{error:u}=await i.from(d).update({current_bid:s?s.amount:(l==null?void 0:l.base_price)||0,current_team_id:s?s.team_id:null}).eq("id",c);if(u)throw u}async function xa(e,t,n,a=null){const{error:r}=await i.from("auction_players").update({status:"sold",sold_price:n,sold_team_id:t,sold_at:new Date().toISOString()}).eq("id",e);if(r)throw r;const{data:s,error:l}=await i.from("auction_teams").select("purse_remaining, name").eq("id",t).single();if(l)throw l;const{error:d}=await i.from("auction_teams").update({purse_remaining:s.purse_remaining-n}).eq("id",t);if(d)throw d;const{data:c}=await i.from("auction_players").select("name").eq("id",e).maybeSingle();c!=null&&c.name&&await ne(null,"auction_sold",`${c.name} sold to ${s.name} for ₹${n}`),await Qe(e,a)}async function ba(e,t=null){const{error:n}=await i.from("auction_players").update({status:"unsold"}).eq("id",e);if(n)throw n;await Qe(e,t)}async function Qe(e,t=null){const n=await he(t),a=Ze(n,e),r=t?"auctions":"auction_state",s=t||1;if(!a){const{error:d}=await i.from(r).update({status:"completed",current_player_id:null,current_bid:0,current_team_id:null}).eq("id",s);if(d)throw d;return}const{error:l}=await i.from(r).update({current_player_id:a.id,current_bid:a.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function wa(e,t=null){const{data:n,error:a}=await i.from("auction_players").select("base_price").eq("id",e).single();if(a)throw a;const r=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(r).update({current_player_id:e,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function _a(e,t=null){let n=i.from("auction_bids").select("*, auction_teams(name)").eq("player_id",e).order("created_at",{ascending:!1});t&&(n=n.eq("auction_id",t));const{data:a,error:r}=await n;if(r)throw r;return a}async function Fa(){const e=await ae(),t=e==null?void 0:e.platform_upi_id;return t&&t!=="9897439743@okbizaxis"?t:"9897439743@pz"}async function Sa(e){await N("platform_upi_id",e)}function U(e){var t;return e&&(e.organized_by||(e.logo_url&&e.logo_url.startsWith("org:")?e.organized_by=e.logo_url.replace(/^org:/,"").trim():(t=e.players)!=null&&t.name&&(e.organized_by=e.players.name)),e)}async function va({name:e,organizerId:t,location:n,auctionDate:a,auctionTime:r,planTier:s,maxTeams:l,pointsPurse:d,amountDue:c,playerEntryFee:u=0,organizerUpiId:p=null,organizerPaymentPhone:f=null,organizedBy:x=null}){var _,b,S,z;const y=c>0?"pending":"free",m=x?x.trim():null,h={name:e,organizer_id:t||null,location:n||null,auction_date:a||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:d||null,amount_due:c||0,payment_status:y};u!==void 0&&(h.player_entry_fee=u?Number(u):0),p&&(h.organizer_upi_id=p.trim()),f&&(h.organizer_payment_phone=f.trim()),m&&(h.organized_by=m,h.logo_url=`org:${m}`);let{data:w,error:k}=await i.from("auctions").insert(h).select().single();if(k&&((_=k.message)!=null&&_.includes("player_entry_fee")||(b=k.message)!=null&&b.includes("organizer_upi_id")||(S=k.message)!=null&&S.includes("organizer_payment_phone")||(z=k.message)!=null&&z.includes("organized_by"))){console.warn("Retrying createAuction without unrecognized columns:",k.message);const P={name:e,organizer_id:t||null,location:n||null,auction_date:a||null,auction_time:r||null,plan_tier:s,max_teams:l,points_purse:d||null,amount_due:c||0,payment_status:y,logo_url:m?`org:${m}`:null},E=await i.from("auctions").insert(P).select().single();if(E.error)throw E.error;w=E.data}else if(k)throw k;return m&&(w!=null&&w.id)&&(N(`auction_org_${w.id}`,m).catch(()=>{}),w.auction_code&&N(`auction_org_${w.auction_code}`,m).catch(()=>{})),c>0&&await V("auction_payment_pending",`New auction "${e}" awaiting payment confirmation (₹${c})`),U(w)}async function ja(e,t={}){var l;const n={};t.auctionDate!==void 0&&(n.auction_date=t.auctionDate||null),t.auction_date!==void 0&&(n.auction_date=t.auction_date||null),t.auctionTime!==void 0&&(n.auction_time=t.auctionTime||null),t.auction_time!==void 0&&(n.auction_time=t.auction_time||null),t.name!==void 0&&(n.name=t.name.trim()),t.location!==void 0&&(n.location=t.location?t.location.trim():null),t.pointsPurse!==void 0&&(n.points_purse=t.pointsPurse?Number(t.pointsPurse):null),t.points_purse!==void 0&&(n.points_purse=t.points_purse?Number(t.points_purse):null),t.bidIncrement!==void 0&&(n.bid_increment=t.bidIncrement?Number(t.bidIncrement):1e3),t.bid_increment!==void 0&&(n.bid_increment=t.bid_increment?Number(t.bid_increment):1e3);const a=t.organizedBy?t.organizedBy.trim():t.organized_by?t.organized_by.trim():null;a!==null&&(n.organized_by=a,n.logo_url=`org:${a}`);let{data:r,error:s}=await i.from("auctions").update(n).eq("id",e).select().single();if(s&&((l=s.message)!=null&&l.includes("organized_by"))){delete n.organized_by;const d=await i.from("auctions").update(n).eq("id",e).select().single();if(d.error)throw d.error;r=d.data}else if(s)throw s;return a&&e&&(N(`auction_org_${e}`,a).catch(()=>{}),r!=null&&r.auction_code&&N(`auction_org_${r.auction_code}`,a).catch(()=>{})),U(r)}async function ka(e){const{data:t,error:n}=await i.from("auctions").select("*").eq("organizer_id",e).order("created_at",{ascending:!1});if(n)throw n;return t}async function Ca(){const{data:e,error:t}=await i.from("auction_teams").select("auction_id");if(t)throw t;const n={};return(e||[]).forEach(a=>{a.auction_id&&(n[a.auction_id]=(n[a.auction_id]||0)+1)}),n}async function Pa(){const{data:e,error:t}=await i.from("auction_players").select("auction_id");if(t)throw t;const n={};return(e||[]).forEach(a=>{a.auction_id&&(n[a.auction_id]=(n[a.auction_id]||0)+1)}),n}async function Aa(e){if(!e)return[];const t=e.replace(/[^0-9]/g,"").slice(-10);try{const{data:n,error:a}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time), auction_teams!sold_team_id(id, name, owner_name, captain_name)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(!a&&n){const r=n.filter(p=>p.auctions),s=r.filter(p=>p.sold_team_id).map(p=>p.sold_team_id),l=[...new Set(r.map(p=>p.auction_id).filter(Boolean))];let d=[],c=[];try{const[p,f]=await Promise.all([s.length>0?i.from("settings").select("key, value").in("key",s.map(x=>`auction_team_logo_${x}`)):Promise.resolve({data:[]}),l.length>0?i.from("auction_teams").select("id, name, owner_name, captain_name, purse_total, auction_id").in("auction_id",l):Promise.resolve({data:[]})]);d=(p==null?void 0:p.data)||[],c=(f==null?void 0:f.data)||[]}catch{}let u={};return d.forEach(p=>{u[p.key]=p.value}),r.map(p=>{var k;const f=p.auctions||{};let x=null;(k=f.logo_url)!=null&&k.startsWith("org:")&&(x=f.logo_url.replace(/^org:/,""));let y=p.auction_teams||null;const m=(p.name||"").toLowerCase().trim();if(!y&&p.auction_id&&m){const _=c.find(b=>b.auction_id===p.auction_id&&(b.captain_name&&b.captain_name.toLowerCase().trim()===m||b.owner_name&&b.owner_name.toLowerCase().trim()===m));_&&(y=_)}const h=p.status==="captain"||y&&(y.captain_name&&y.captain_name.toLowerCase().trim()===m||y.owner_name&&y.owner_name.toLowerCase().trim()===m);let w=null;return y!=null&&y.id&&(w=u[`auction_team_logo_${y.id}`]||null),{...p,status:h?"captain":p.status,is_captain:!!h,sold_team_id:(y==null?void 0:y.id)||p.sold_team_id,auctions:{...f,organized_by:x||null},auction_teams:y?{...y,logo_url:w}:null}})}}catch(n){console.warn("fetchPlayerAuctionHistory main query failed:",n)}try{const{data:n,error:a}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(a)throw a;return(n||[]).filter(r=>r.auctions).map(r=>{var s;return{...r,auctions:{...r.auctions,organized_by:(s=r.auctions.logo_url)!=null&&s.startsWith("org:")?r.auctions.logo_url.replace(/^org:/,""):null}}})}catch(n){return console.warn("fetchPlayerAuctionHistory fallback failed:",n),[]}}async function za(){const e=c=>(c||"").replace(/[^0-9]/g,"").slice(-10),[{data:t,error:n},{data:a,error:r}]=await Promise.all([i.from("auction_players").select("name, phone, birth_date, profile_image_url, city, jersey_number, jersey_size"),i.from("players").select("phone")]);if(n)throw n;if(r)throw r;const s=new Set((a||[]).map(c=>e(c.phone)));let l=0,d=0;for(const c of t||[]){const u=e(c.phone);if(!u||s.has(u)){d++;continue}try{await fe(c.name,u,"1234",null,c.birth_date,c.profile_image_url,{city:c.city,jerseyNumber:c.jersey_number,jerseySize:c.jersey_size,source:"auction"}),s.add(u),l++}catch(p){console.error(`Failed to sync ${c.name} (${u}):`,p),d++}}return{synced:l,skipped:d}}async function Ea(e){const{data:t,error:n}=await i.from("auction_sponsors").select("*").eq("auction_id",e).order("created_at",{ascending:!0});if(n)throw n;return t||[]}async function Ra(e,t,n){const{data:a,error:r}=await i.from("auction_sponsors").insert({auction_id:e,name:t,logo_url:n||null}).select().single();if(r)throw r;return a}async function qa(e){const{error:t}=await i.from("auction_sponsors").delete().eq("id",e);if(t)throw t}async function $a(e,t){const n=e.name.split(".").pop(),a=`sponsor-logos/${(t||"sponsor").toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${n}`,{error:r}=await i.storage.from("team-assets").upload(a,e,{upsert:!0});if(r)throw r;const{data:s}=i.storage.from("team-assets").getPublicUrl(a);return s.publicUrl}async function Ba(){const{data:e,error:t}=await i.from("auctions").select("*, players(name)").order("created_at",{ascending:!1});if(t)throw t;return(e||[]).map(U)}async function Ta(e){const{data:t,error:n}=await i.from("auctions").select("*").eq("auction_code",e).maybeSingle();if(n)throw n;if(!t)return null;if(U(t),!t.organized_by)try{const{data:a}=await i.from("settings").select("value").eq("key",`auction_org_${t.id}`).maybeSingle();if(a!=null&&a.value)t.organized_by=a.value;else{const{data:r}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();r!=null&&r.value&&(t.organized_by=r.value)}}catch{}return t}async function Xe(e){const{data:t,error:n}=await i.from("auctions").select("*").eq("id",e).single();if(n)throw n;if(!t)return null;if(U(t),!t.organized_by)try{const{data:a}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();a!=null&&a.value&&(t.organized_by=a.value)}catch{}return t}async function Ia(){const{data:e,error:t}=await i.from("auctions").select("*, players(name, phone)").eq("payment_status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function Da(e){await V("auction_payment_claimed","An organizer marked auction payment as sent — please verify and approve.")}async function La(e){const{error:t}=await i.from("auctions").update({payment_status:"paid"}).eq("id",e);if(t)throw t}async function Oa(e){const{error:t}=await i.from("auctions").update({payment_status:"rejected"}).eq("id",e);if(t)throw t}async function Na(e){await i.from("auction_bids").delete().eq("auction_id",e),await i.from("auction_players").delete().eq("auction_id",e),await i.from("auction_teams").delete().eq("auction_id",e);const{error:t}=await i.from("auctions").delete().eq("id",e);if(t)throw t}async function Ma(e,t){const{error:n}=await i.from("players").update({role:t}).eq("id",e);if(n)throw n}const X="selected_ground_bookings_cache";async function re(){try{const{data:e,error:t}=await i.from("settings").select("value").eq("key","ground_bookings").maybeSingle();if(!t&&(e!=null&&e.value)){const n=JSON.parse(e.value);if(Array.isArray(n)){try{localStorage.setItem(X,e.value)}catch{}return n}}}catch(e){console.warn("fetchGroundBookings error:",e)}try{const e=localStorage.getItem(X);if(e){const t=JSON.parse(e);if(Array.isArray(t))return t}}catch{}return[]}function et(){const e=new Date,t=String(e.getFullYear()).slice(-2),n=String(e.getMonth()+1).padStart(2,"0"),a=Math.floor(1e3+Math.random()*9e3);return`BK-${t}${n}-${a}`}async function tt(e){const t=await re(),n=new Date().toISOString(),a=e.id||"gb_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),r=e.booking_id||et(),s=Number(e.rate||0),l=Number(e.advance_paid||0),d=Math.max(0,s-l);let c=e.payment_status;(!c||c==="auto")&&(s>0&&l>=s?c="paid":l>0?c="advance":c="pending");const u={...e,id:a,booking_id:r,rate:s,advance_paid:l,balance_due:d,payment_status:c,status:e.status||"confirmed",updated_at:n,created_at:e.created_at||n},p=t.findIndex(m=>m.id===a);let f;p>=0?(f=[...t],f[p]=u):f=[u,...t],f.sort((m,h)=>(m.date||"").localeCompare(h.date||""));const x=JSON.stringify(f);try{localStorage.setItem(X,x)}catch{}const{error:y}=await i.from("settings").upsert({key:"ground_bookings",value:x});return y&&console.warn("Supabase ground_bookings upsert error, cached locally:",y),u}async function Wa(e){const n=(await re()).filter(s=>s.id!==e),a=JSON.stringify(n);try{localStorage.setItem(X,a)}catch{}const{error:r}=await i.from("settings").upsert({key:"ground_bookings",value:a});return r&&console.warn("Supabase ground_bookings delete error, cached locally:",r),!0}async function Ga(e,{advance_paid:t,payment_status:n,payment_method:a}){const s=(await re()).find(d=>d.id===e);if(!s)throw new Error("Booking not found");const l={...s};return t!==void 0&&(l.advance_paid=Number(t),l.balance_due=Math.max(0,Number(l.rate||0)-Number(t)),l.balance_due===0&&l.rate>0?l.payment_status="paid":l.advance_paid>0?l.payment_status="advance":l.payment_status="pending"),n&&(l.payment_status=n),a&&(l.payment_method=a),await tt(l)}const ee="selected_ground_owners_cache";async function oe(){try{const{data:e,error:t}=await i.from("settings").select("value").eq("key","ground_owners").maybeSingle();if(!t&&(e!=null&&e.value)){const n=JSON.parse(e.value);if(Array.isArray(n)){try{localStorage.setItem(ee,e.value)}catch{}return n}}}catch(e){console.warn("fetchGroundOwners error:",e)}try{const e=localStorage.getItem(ee);if(e){const t=JSON.parse(e);if(Array.isArray(t))return t}}catch{}return[]}async function Ua(e){var p;const t=await oe(),n=new Date().toISOString(),a=e.id||"go_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),r=(e.phone||"").replace(/[^0-9]/g,"").slice(-10),s={...e,id:a,phone:r,pin:String(e.pin||"").trim(),name:((p=e.name)==null?void 0:p.trim())||"Ground Manager",ground_id:e.ground_id||"all",ground_name:e.ground_name||"All Grounds",active:e.active!==!1,role:"ground_owner",updated_at:n,created_at:e.created_at||n},l=t.findIndex(f=>f.id===a);let d;l>=0?(d=[...t],d[l]=s):d=[s,...t];const c=JSON.stringify(d);try{localStorage.setItem(ee,c)}catch{}const{error:u}=await i.from("settings").upsert({key:"ground_owners",value:c});return u&&console.warn("Supabase ground_owners upsert error:",u),s}async function Ha(e){const n=(await oe()).filter(s=>s.id!==e),a=JSON.stringify(n);try{localStorage.setItem(ee,a)}catch{}const{error:r}=await i.from("settings").upsert({key:"ground_owners",value:a});return r&&console.warn("Supabase ground_owners delete error:",r),!0}async function Ya(e,t){const n=(e||"").replace(/[^0-9]/g,"").slice(-10),a=String(t||"").trim();if(n.length!==10||a.length!==4)return null;const s=(await oe()).find(l=>(l.phone||"").replace(/[^0-9]/g,"").slice(-10)===n&&String(l.pin).trim()===a&&l.active!==!1);if(s)return{...s,role:"ground_owner"};try{const d=(await Te()).find(c=>(c.phone||"").replace(/[^0-9]/g,"").slice(-10)===n&&String(c.pin).trim()===a&&c.role==="ground_owner");if(d)return{id:d.id,name:d.name,phone:d.phone,pin:d.pin,ground_id:d.ground_id||"all",ground_name:d.ground_name||"All Grounds",role:"ground_owner"}}catch(l){console.warn("authenticateGroundOwner player check error:",l)}return null}const jr=Object.freeze(Object.defineProperty({__proto__:null,addAuctionSponsor:Ra,addContribution:Fn,addExpense:dn,addGround:Nt,addPlayer:fe,addRosterPlayerToAuction:Qn,addTeam:Ut,approveAuctionPayment:La,approvePlayer:bn,approveProRequest:Ln,approvePublicResponse:sn,assignCaptainToTeam:ye,authenticateGroundOwner:Ya,cancelProRequest:Me,checkAuctionPhoneExists:Ke,checkPlayerPhoneExists:pe,confirmPlayerToMatch:en,contributionExists:vn,countUnreadDirectMessages:Hn,countUnreadMessages:Tn,createAuction:va,createAuctionTeam:ua,createMatch:Kt,deleteAuctionEvent:Na,deleteAuctionPlayer:sa,deleteAuctionSponsor:qa,deleteAuctionTeam:fa,deleteContribution:Sn,deleteExpense:un,deleteGround:Wt,deleteGroundBooking:Wa,deleteGroundOwner:Ha,deleteMatch:Jt,deletePlayer:Lt,deleteTeam:Yt,fetchAdminPlayerId:He,fetchAllAuctionPlayerCounts:Pa,fetchAllAuctionTeamCounts:Ca,fetchAllAuctions:Ba,fetchAuctionBidHistory:_a,fetchAuctionByCode:Ta,fetchAuctionById:Xe,fetchAuctionPlayers:he,fetchAuctionRegistrationOpen:na,fetchAuctionSponsors:Ea,fetchAuctionState:ma,fetchAuctionTeams:da,fetchChat:mn,fetchContributions:_n,fetchConversation:Wn,fetchExpenses:cn,fetchFeedback:Jn,fetchGroundBookings:re,fetchGroundOwners:oe,fetchGrounds:Ot,fetchInboxMessages:Bn,fetchLeaderboard:Oe,fetchMatchByToken:Vt,fetchMatchCount:Ye,fetchMatchCounts:An,fetchMatchPlayers:De,fetchMatches:Ie,fetchMyAuctions:ka,fetchMyConfirmedPlayers:Vn,fetchMyConversations:Gn,fetchMyInvites:En,fetchMyOrganizers:Yn,fetchMyProRequest:We,fetchNotifications:qt,fetchOrganizerUpi:qn,fetchPayments:pn,fetchPendingAuctionPayments:Ia,fetchPendingPlayers:xn,fetchPendingProRequests:Dn,fetchPlatformUpi:Fa,fetchPlayerAuctionHistory:Aa,fetchPlayerCount:Ue,fetchPlayerGrounds:Mn,fetchPlayerMatchHistory:Cn,fetchPlayerStats:Pn,fetchPlayers:Te,fetchPlayersByCreator:It,fetchProGroupPlayers:zn,fetchProStats:kn,fetchPublicResponses:rn,fetchRecentActivity:Rt,fetchRecentlyRegistered:Nn,fetchSentMessages:$n,fetchSettings:ae,fetchStats:jn,fetchTeamCount:Ve,fetchTeams:Gt,fetchUnreadNotificationCount:$t,findPlayerByPhone:Je,generateBookingId:et,globalSearch:Zn,jumpToAuctionPlayer:wa,markAllNotificationsRead:Tt,markAuctionPaidByOrganizer:Da,markConversationRead:Un,markMessagesRead:In,markNotificationRead:Bt,markPlayerSold:xa,markPlayerUnsold:ba,normalizeAuctionOrganizedBy:U,notifyPlayer:tn,placeBid:ha,promoteFromWaitlist:ge,registerAuctionPlayer:Xn,registerPlayer:yn,rejectAuctionPayment:Oa,rejectPlayer:wn,rejectProRequest:On,rejectPublicResponse:ln,removePlayerFromMatch:nn,requestProAccess:Ne,restoreAuctionPlayer:ca,saveGroundBooking:tt,saveGroundOwner:Ua,sendAdminMessage:Le,sendDirectMessage:Ge,sendFeedback:Kn,sendMessage:gn,setAuctionRegistrationOpen:aa,setPlatformUpi:Sa,setPlayerAccountRole:Ma,setPlayerStatus:an,startAuction:ga,submitPublicResponse:on,subscribeToChat:hn,syncAuctionPlayersToRoster:za,tagAuctionPlayerDropped:la,toggleMatchLink:Xt,togglePayment:fn,undoLastBid:ya,updateAuction:ja,updateAuctionPlayerBasePrice:oa,updateAuctionPlayerCategory:ia,updateAuctionPlayerPaymentStatus:ea,updateAuctionPlayerStatus:ta,updateAuctionTeam:pa,updateBookingPaymentStatus:Ga,updateGround:Mt,updateMatchMaxPlayers:Qt,updateMatchStatus:Zt,updatePlayer:Dt,updatePlayerRole:ra,updatePlayerUpi:Rn,updateTeam:Ht,uploadPaymentReceipt:Et,uploadProfilePhoto:zt,uploadSponsorLogo:$a,uploadTeamLogo:me,upsertSetting:N},Symbol.toStringTag,{value:"Module"})),nt="ss_home_stats_v2";function Va(){try{const e=localStorage.getItem(nt);if(e)return JSON.parse(e)}catch{}return{p:80,m:43,t:24}}function Ka({onLogin:e,onRegister:t,onGroundOwnerLogin:n}){const a=Ct(),r=F.useMemo(()=>Va(),[]),[s,l]=F.useState(r.p),[d,c]=F.useState(r.m),[u,p]=F.useState(r.t),[f,x]=F.useState({p:r.p,m:r.m,t:r.t}),[y,m]=F.useState(!1),[h,w]=F.useState(!1);F.useEffect(()=>{m(!0);let b=!1;return Promise.all([Ue().catch(()=>null),Ye().catch(()=>null),Ve().catch(()=>null)]).then(([S,z,P])=>{if(b)return;const E={p:typeof S=="number"&&S>0?S:r.p,m:typeof z=="number"&&z>0?z:r.m,t:typeof P=="number"&&P>0?P:r.t};l(E.p),c(E.m),p(E.t),x(E);try{localStorage.setItem(nt,JSON.stringify(E))}catch{}}),()=>{b=!0}},[r]);const k=[{icon:st,v:f.p,label:"Active Players",sub:"Registered Pool",color:"#166534"},{icon:ze,v:f.m,label:"Matches Played",sub:"Games & Fixtures",color:"#B8860B"},{icon:Ee,v:f.t,label:"Cricket Teams",sub:"Franchises",color:"#0F766E"}],_=[{label:"Digital Player Pass",icon:lt},{label:"Live Auction Console",icon:Re},{label:"Grounds on Google Maps",icon:ct},{label:"Season MVP Leaderboard",icon:qe}];return o.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 40%, #F8FAF8 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-body)",position:"relative",overflow:"hidden",padding:a?"24px 16px 36px":"40px 20px"},children:[o.jsx("div",{style:{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:a?400:700,height:a?400:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0) 70%)",pointerEvents:"none"}}),o.jsx("div",{style:{position:"fixed",bottom:"-10%",right:"-10%",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle, rgba(246,196,83,0.06) 0%, rgba(246,196,83,0) 70%)",pointerEvents:"none"}}),o.jsxs("div",{style:{width:"100%",maxWidth:520,textAlign:"center",position:"relative",zIndex:1,opacity:y?1:0,transform:y?"translateY(0)":"translateY(-8px)",transition:"opacity 300ms ease-out, transform 300ms ease-out"},children:[o.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"#FFFFFF",border:"1px solid rgba(22,101,52,0.25)",padding:"5px 14px",borderRadius:999,fontSize:11,fontWeight:800,color:"#166534",boxShadow:"0 2px 8px rgba(22,101,52,0.06)",marginBottom:16,letterSpacing:.5,textTransform:"uppercase"},children:[o.jsx("span",{style:{width:7,height:7,borderRadius:"50%",background:"#22C55E",animation:"pulse 2s infinite"}}),"Selected Sports • Cricket Platform"]}),o.jsx("div",{style:{position:"relative",display:"inline-block",margin:"0 auto 12px"},children:o.jsx("img",{src:"/logo-full.png",alt:"Selected Sports",width:a?180:210,height:a?180:210,style:{height:a?180:210,width:"auto",display:"block",margin:"0 auto",filter:"drop-shadow(0 10px 24px rgba(22,101,52,0.12))",userSelect:"none"}})}),o.jsxs("div",{style:{fontSize:a?22:25,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",letterSpacing:"-0.5px",lineHeight:1.25,marginBottom:8},children:["PLAY. COMPETE."," ",o.jsx("span",{style:{background:"linear-gradient(135deg, #166534 0%, #15803D 50%, #0F766E 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"GET RECOGNISED."})]}),o.jsx("p",{style:{color:"#64748B",fontSize:a?13:14,lineHeight:1.5,maxWidth:420,margin:"0 auto 22px"},children:"India's premier cricket community for live auction tournaments, match scheduling, digital player passes, and official player leaderboards."}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20},children:k.map((b,S)=>o.jsxs("div",{style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,padding:"14px 6px",boxShadow:"0 4px 14px rgba(15,23,42,0.04)",transition:"transform 150ms ease, box-shadow 150ms ease"},children:[o.jsx("div",{style:{width:34,height:34,borderRadius:10,background:`${b.color}12`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"},children:o.jsx(b.icon,{size:17,color:b.color})}),o.jsxs("div",{style:{fontSize:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.1},children:[b.v,"+"]}),o.jsx("div",{style:{fontSize:11,fontWeight:800,color:"#0F172A",marginTop:3},children:b.label}),o.jsx("div",{style:{fontSize:9,color:"#94A3B8",marginTop:1},children:b.sub})]},S))}),o.jsx("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginBottom:24},children:_.map((b,S)=>o.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(22,101,52,0.06)",border:"1px solid rgba(22,101,52,0.18)",color:"#166534",padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:700},children:[o.jsx(b.icon,{size:13,color:"#166534"}),b.label]},S))}),o.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:18},children:[o.jsxs("button",{onClick:e,style:{width:"100%",height:54,borderRadius:15,background:"linear-gradient(135deg, #166534 0%, #15803D 100%)",border:"none",color:"#FFFFFF",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",boxShadow:"0 8px 22px rgba(22,101,52,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 150ms ease, box-shadow 150ms ease"},onMouseEnter:b=>{b.currentTarget.style.transform="translateY(-2px)",b.currentTarget.style.boxShadow="0 12px 28px rgba(22,101,52,0.45)"},onMouseLeave:b=>{b.currentTarget.style.transform="translateY(0)",b.currentTarget.style.boxShadow="0 8px 22px rgba(22,101,52,0.35)"},children:[o.jsx("span",{children:"Login to Selected Sports"}),o.jsx(dt,{size:17})]}),o.jsxs("button",{onClick:t,style:{width:"100%",padding:"14px 18px",borderRadius:15,background:"#FFFFFF",border:"1.5px solid #166534",color:"#166534",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(15,23,42,0.03)",transition:"background 150ms ease"},onMouseEnter:b=>{b.currentTarget.style.background="rgba(22,101,52,0.06)"},onMouseLeave:b=>{b.currentTarget.style.background="#FFFFFF"},children:[o.jsx(ut,{size:16,color:"#166534"}),o.jsx("span",{children:"Create New Player Account"})]}),o.jsxs("button",{onClick:()=>n?n():e("ground_owner"),style:{width:"100%",padding:"13px 18px",borderRadius:15,background:"#F0FDF4",border:"1.5px solid #86EFAC",color:"#166534",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 8px rgba(22,101,52,0.06)",transition:"all 150ms ease"},onMouseEnter:b=>{b.currentTarget.style.background="#DCFCE7"},onMouseLeave:b=>{b.currentTarget.style.background="#F0FDF4"},children:[o.jsx("span",{children:"🏟️ Ground Owner Login"}),o.jsx("span",{style:{fontSize:11,background:"rgba(22,101,52,0.12)",padding:"2px 7px",borderRadius:6},children:"Slot Diary ➔"})]})]}),o.jsxs("div",{style:{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:"#64748B",marginTop:6},children:[o.jsx("span",{style:{display:"flex",alignItems:"center",gap:6},children:o.jsx("span",{children:"Want to organize an auction?"})}),o.jsx("button",{onClick:()=>w(!0),style:{background:"none",border:"none",color:"#166534",fontWeight:800,cursor:"pointer",padding:0,textDecoration:"underline"},children:"Contact Md Zeeshan ↗"})]}),o.jsx("div",{style:{fontSize:11,color:"#94A3B8",fontWeight:700,marginTop:20,letterSpacing:.5,textTransform:"uppercase"},children:"Selected Sports • Play • Compete • Get Recognised"})]}),h&&o.jsx("div",{onClick:()=>w(!1),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:b=>b.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:20,maxWidth:420,width:"100%",padding:24,boxShadow:"0 25px 60px rgba(15,23,42,0.3)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[o.jsx("div",{style:{fontWeight:800,fontSize:17,fontFamily:"var(--font-head)",color:"#0F172A"},children:"Tournament Organizer Support"}),o.jsx("button",{onClick:()=>w(!1),style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"✕"})]}),o.jsx("p",{style:{fontSize:13,color:"#64748B",margin:"0 0 16px",lineHeight:1.5},children:"Want to organize an auction for your tournament, schedule matches, or need account help? Contact Md Zeeshan:"}),o.jsxs("div",{style:{background:"#F8FAF8",borderRadius:12,padding:"14px",border:"1px solid #E2E8F0",marginBottom:16},children:[o.jsx("div",{style:{fontWeight:800,fontSize:16,color:"#0F172A"},children:"Md Zeeshan"}),o.jsx("div",{style:{fontSize:12,color:"#64748B",marginTop:2},children:"Head of Tournament Operations"}),o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:15,fontWeight:800,color:"#166534"},children:[o.jsx(pt,{size:15})," 9897439743"]})]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[o.jsx("a",{href:"tel:9897439743",style:{padding:"12px",borderRadius:11,background:"#166534",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"📞 Call Now"}),o.jsx("a",{href:"https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20interested%20in%20organizing%20an%20auction%20tournament%20with%20Selected%20Sports",target:"_blank",rel:"noreferrer",style:{padding:"12px",borderRadius:11,background:"#25D366",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"WhatsApp ↗"})]})]})})]})}const Ja="9897439743",kr="9897439743@pz",je=["#1D9E75","#8B1E2E","#BA7517","#0F6E56","#7A4F13","#3B6D11","#A6192E","#5B7C4A"],Za=e=>je[e%je.length],Qa=e=>e.split(" ").map(t=>t[0]).join("").slice(0,2).toUpperCase(),at=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}),Cr=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"}),Pr=e=>e.our_team?`${e.our_team} vs ${e.team}`:e.team,Ar=[{id:"free",label:"Free",maxTeams:3,price:0},{id:"plan2",label:"Plan 2",maxTeams:4,price:1999},{id:"plan2b",label:"Plan 2B",maxTeams:5,price:2249},{id:"plan3",label:"Plan 3",maxTeams:6,price:2499},{id:"plan4",label:"Plan 4",maxTeams:8,price:2999},{id:"plan5",label:"Plan 5",maxTeams:12,price:3999},{id:"plan6",label:"Plan 6",maxTeams:16,price:4999}],ue=15,Xa=9,er=1e3;function zr(e,t,n=Xa,a=er){if(t>=n)return 0;const r=Math.max(0,n-t),l=Math.max(0,r-1)*a;return Math.max(0,(e||0)-l)}function Er(){const e=new Date;return e.setFullYear(e.getFullYear()-ue),e.toISOString().split("T")[0]}const Rr=e=>/^[A-Za-z\s'.-]+$/.test((e||"").trim())&&(e||"").trim().length>0;function qr(e){if(!e)return"Please enter a date of birth.";const t=new Date(e+"T00:00:00");if(isNaN(t.getTime()))return"Please enter a valid date of birth.";const n=new Date;if(n.setHours(0,0,0,0),t>n)return"Date of birth can't be in the future.";let a=n.getFullYear()-t.getFullYear();const r=n.getMonth()-t.getMonth();return(r<0||r===0&&n.getDate()<t.getDate())&&a--,a<ue?`Players must be at least ${ue} years old to register.`:null}function $r(e,t,n="Cricket Tournament"){if(!e)return;const a=(t||[]).filter(m=>m.sold_team_id===e.id).sort((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id?1:0;return(h.is_captain||h.status==="captain"||e.captain_player_id&&h.id===e.captain_player_id?1:0)-w});if(a.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=m=>m==null?'""':`"${String(m).replace(/"/g,'""')}"`,s=["S.No","Player Name","Team Role","Playing Role","Jersey Number","Jersey Size","City","Date of Birth","Mobile Number","Price Paid (Coins)","Status"],l=a.map((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id,k=w?"Captain":"Squad Member",_=w?"0 (Captain)":`🪙 ${Number(m.sold_price||0).toLocaleString("en-IN")}`;return[h+1,r(m.name||""),r(k),r(m.playing_role||"—"),r(m.jersey_number||"—"),r(m.jersey_size||"—"),r(m.city||"—"),r(m.birth_date||"—"),r(m.phone||"—"),r(_),r(w?"Captain":m.status||"Sold")].join(",")}),d=r(`Tournament: ${n} — Team Roster: ${e.name}`),c=r(`Captain: ${e.captain_name||"—"}${e.captain_phone?` (${e.captain_phone})`:""} | Owner: ${e.owner_name||"—"}${e.owner_phone?` (${e.owner_phone})`:""} | Starting Purse: 🪙 ${Number(e.purse_total||0).toLocaleString("en-IN")} | Remaining Purse: 🪙 ${Number(e.purse_remaining||0).toLocaleString("en-IN")} | Squad: ${a.length}/9`),u=[d,c,"",s.join(","),...l].join(`\r
`),p=new Blob(["\uFEFF"+u],{type:"text/csv;charset=utf-8;"}),f=URL.createObjectURL(p),x=document.createElement("a"),y=`${(e.name||"Team").replace(/[^a-zA-Z0-9_-]/g,"_")}_Roster.csv`;x.href=f,x.download=y,document.body.appendChild(x),x.click(),document.body.removeChild(x),URL.revokeObjectURL(f)}function Br(e,t){if(!e)return;const n=window.location.origin,a=(t==null?void 0:t.auction_code)||"",r=`${n}/team-view/${a}/${e.id}`,s=(e.captain_phone||e.owner_phone||"").replace(/[^0-9]/g,"").slice(-10),l=e.captain_name||e.owner_name||e.name,c=`🏏 *${(t==null?void 0:t.name)||"Selected Sports Cricket Tournament"}*

Hi ${l},
Here is your private team link to view *${e.name}* squad, purse wallet, and live auction roster:
👉 ${r}

Good luck for the auction!`,u=s?`https://wa.me/91${s}?text=${encodeURIComponent(c)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(c)}`;window.open(u,"_blank")}function Tr(e,t,n="Cricket Tournament"){if(!e)return;const a=(t||[]).filter(p=>p.sold_team_id===e.id).sort((p,f)=>{const x=p.is_captain||p.status==="captain"||e.captain_player_id&&p.id===e.captain_player_id?1:0;return(f.is_captain||f.status==="captain"||e.captain_player_id&&f.id===e.captain_player_id?1:0)-x});if(a.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const r=p=>String(p??"").replace(/[&<>"']/g,f=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[f]),s=a.map((p,f)=>{const x=p.is_captain||p.status==="captain"||e.captain_player_id&&p.id===e.captain_player_id,y=x?'<span class="captain-badge">👑 CAPTAIN</span>':'<span class="player-badge">PLAYER</span>',m=x?"🪙 0 (Captain)":`🪙 ${Number(p.sold_price||0).toLocaleString("en-IN")}`,h=p.birth_date?p.birth_date:"—";return`
      <tr>
        <td style="text-align:center;font-weight:700;color:#64748B;">${f+1}</td>
        <td>
          <div style="font-weight:800;color:#0F172A;font-size:13px;">${r(p.name||"")}</div>
        </td>
        <td>${y}</td>
        <td><strong>${r(p.playing_role||"—")}</strong></td>
        <td style="text-align:center;">${r(p.jersey_number?`#${p.jersey_number}`:"—")}${p.jersey_size?` (${r(p.jersey_size)})`:""}</td>
        <td>${r(p.city||"—")}</td>
        <td>${r(h)}</td>
        <td><strong style="color:#166534;">${r(p.phone||"—")}</strong></td>
        <td style="font-weight:800;color:#166534;text-align:right;">${m}</td>
        <td style="text-align:center;"><span class="status-sold">${r(x?"Captain":"Sold")}</span></td>
      </tr>
    `}).join(""),l=(e.purse_total||0)-(e.purse_remaining||0),d=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),c=`<!DOCTYPE html>
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
        <div class="tournament-tag">${r(n||"Selected Sports Cricket Tournament")}</div>
        <h1 class="team-title">${r(e.name)}</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:800;color:#0F172A;">OFFICIAL SQUAD ROSTER</div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${d}</div>
      <div style="font-size:10px;color:#166534;font-weight:700;margin-top:2px;">Squad Size: ${a.length} / 9 Players</div>
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
</html>`,u=window.open("","_blank");if(!u){alert("Please allow pop-ups to open the PDF export.");return}u.document.write(c),u.document.close(),u.onload=()=>{setTimeout(()=>{u.print()},250)}}const tr=[{name:"Shinde High School Cricket Ground",location:"Sahakar Nagar, Pune"},{name:"Poona Club Cricket Ground",location:"Camp, Pune"},{name:"PYC Hindu Gymkhana",location:"Deccan Gymkhana, Pune"},{name:"Law College Cricket Ground",location:"Erandwane, Pune"},{name:"Deccan Gymkhana Cricket Ground",location:"Deccan, Pune"},{name:"Nehru Stadium",location:"Swargate, Pune"},{name:"Fergusson College Ground",location:"FC Road, Pune"},{name:"SP College Ground",location:"Sadashiv Peth, Pune"},{name:"Eagle Turf",location:"Khadi Machine Chowk, Pune"},{name:"MM Turf Play Ground",location:"Parge Nagar, Pune"},{name:"Parge Play On",location:"Parge Nagar, Pune"},{name:"Anfield Turf",location:"Mohammadwadi, Pune"},{name:"Kanade Sports Club - Full Ground",location:"Pisoli, Pune"},{name:"Kanade Sports Club - Single",location:"Undri, Pune"},{name:"Kanade Sports Club - Indoor",location:"Pisoli, Pune"},{name:"Blades Cricket Ground",location:"Bavdhan, Pune"},{name:"Legends Cricket Ground",location:"Hadapsar, Pune"},{name:"Champions Turf & Cricket Ground",location:"Viman Nagar, Pune"},{name:"The Turf",location:"Baner, Pune"},{name:"Oxford Cricket Resort Ground",location:"Bavdhan, Pune"},{name:"Kharadi Sports Complex Cricket Ground",location:"Kharadi, Pune"},{name:"Wakad Cricket Ground",location:"Wakad, Pune"},{name:"DY Patil Cricket Stadium",location:"Akurdi, Pune"},{name:"Telco Cricket Ground",location:"Pimpri-Chinchwad, Pune"}];async function nr(e="",t="Pune",n="Maharashtra"){const a=(e||"").trim(),r=(t||"Pune").trim(),s=(n||"Maharashtra").trim(),l=[],d=new Set;if(!r||r.toLowerCase()==="pune"){const c=tr.filter(u=>{if(!a)return!0;const p=a.toLowerCase();return u.name.toLowerCase().includes(p)||u.location.toLowerCase().includes(p)});for(const u of c)d.has(u.name.toLowerCase())||(d.add(u.name.toLowerCase()),l.push({name:u.name,location:u.location,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name+" "+u.location)}`,isCurated:!0}))}try{const c=a?`${a} cricket ground ${r} ${s}`:`cricket ground in ${r} ${s}`,u=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c)}&limit=10&addressdetails=1`,p=await fetch(u,{headers:{Accept:"application/json"}});if(p.ok){const f=await p.json();for(const x of f||[]){const m=(x.name||(x.display_name?x.display_name.split(",")[0]:"")).replace(/,\s*India$/i,"").trim();if(m&&!d.has(m.toLowerCase())){d.add(m.toLowerCase());const h=x.address||{},k=`${h.suburb||h.neighbourhood||h.residential||h.city_district||r}, ${r}`;l.push({name:m,location:k,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m+" "+r)}`,isMap:!0})}}}}catch(c){console.warn("Map grounds search failed:",c)}return l}async function Ir(e=""){return nr(e,"Pune","Maharashtra")}function Dr(e,t){if(!e)return"";const a=`${t||(typeof window<"u"?window.location.origin:"https://selectedsports.github.io")}/auction-register/${e.auction_code||""}`,r=e.auction_date?at(e.auction_date):"To Be Announced",s=e.auction_time||"To Be Announced",l=e.location||"Ground / Venue to be confirmed",d=e.organized_by?`
🛡️ *Organized By:* ${e.organized_by}`:"",u=`₹${Number(e.player_entry_fee)>0?Number(e.player_entry_fee):180}`;return`🏏 *PLAYER REGISTRATION OPEN — ${(e.name||"CRICKET TOURNAMENT").toUpperCase()}* 🏏${d}

📅 *Auction Date:* ${r}
⏰ *Auction Time:* ${s}
📍 *Venue:* ${l}
💰 *Player Entry Fee:* ${u} (Mandatory for player registration)

📢 *ATTENTION CRICKET PLAYERS:*
Official player registrations are now LIVE! All players must register before the auction deadline to enter the player pool and get picked by franchise teams.

📝 *How to Register:*
1️⃣ Click the official registration link below
2️⃣ Enter your Mobile Number (existing player details will auto-fill)
3️⃣ Review & edit your Name, Playing Role, City, Jersey # & Profile Photo
4️⃣ Pay the ${u} registration fee via Google Pay / UPI & attach payment screenshot
5️⃣ Submit your registration — the organizer will verify your payment and approve you into the live auction pool!

👉 *REGISTER NOW VIA OFFICIAL LINK:*
🔗 ${a}

⚡ _Register and transfer the entry fee before the deadline to ensure your spot in the auction!_
🏆 *Selected Sports Cricket Platform*`}function Lr(e,t){if(!t||t.length===0){alert("No players in the auction pool to export.");return}const n=["Lot No","Player Name","Player Type / Role","City","Base Price (Coins)","Category"],a=t.map((c,u)=>{const p=f=>`"${String(f??"").replace(/"/g,'""')}"`;return[u+1,p(c.name||""),p(c.playing_role||"—"),p(c.city||"—"),c.base_price??0,p(c.category||"—")].join(",")}),r="data:text/csv;charset=utf-8,\uFEFF"+[n.join(","),...a].join(`\r
`),s=encodeURI(r),l=document.createElement("a"),d=`${((e==null?void 0:e.name)||"Auction").replace(/[^a-zA-Z0-9_-]/g,"_")}_Player_Pool_${t.length}_Players.csv`;l.setAttribute("href",s),l.setAttribute("download",d),document.body.appendChild(l),l.click(),document.body.removeChild(l)}function ar(e,t){if(!t||t.length===0)return"";const n=(e==null?void 0:e.name)||"Cricket Tournament Auction",a=e!=null&&e.auction_date?at(e.auction_date):"Upcoming",r=(e==null?void 0:e.auction_time)||"8:00 PM IST",s=(e==null?void 0:e.location)||"Venue TBD",l={"All-rounder":[],Batsman:[],Bowler:[],Wicketkeeper:[],Other:[]};t.forEach(p=>{const f=(p.playing_role||"").toLowerCase();f.includes("all")?l["All-rounder"].push(p):f.includes("bat")?l.Batsman.push(p):f.includes("bowl")?l.Bowler.push(p):f.includes("keep")||f.includes("wk")?l.Wicketkeeper.push(p):l.Other.push(p)});let d=`🏏 *OFFICIAL AUCTION PLAYER POOL — FOR CAPTAINS*
`;d+=`🏆 *${n}*
`,d+=`👥 *Total Players in Pool:* ${t.length} Players
`,d+=`📅 *Auction Date:* ${a} · ${r}
`,d+=`📍 *Venue:* ${s}

`,d+=`Dear Captains & Franchise Owners,
`,d+=`Here is the official list of ${t.length} players available in the auction pool for your pre-bidding strategy & purse allocation:

`;let c=1;const u=(p,f)=>{if(f.length===0)return"";let x=`*${p.toUpperCase()} (${f.length}):*
`;return f.forEach(y=>{const m=y.city?` · ${y.city}`:"",h=` · Base: 🪙 ${Number(y.base_price||0).toLocaleString("en-IN")}`;x+=`${c}. *${y.name}*${m}${h}
`,c++}),x+=`
`,x};return d+=u("🏏 All-Rounders",l["All-rounder"]),d+=u("⚡ Batsmen",l.Batsman),d+=u("🎯 Bowlers",l.Bowler),d+=u("🧤 Wicketkeepers",l.Wicketkeeper),l.Other.length>0&&(d+=u("👥 Other Players",l.Other)),d+=`🎯 *Captains, analyze your squad composition & coin reserves before the live auction stage!*
`,d+=`🔒 _Note: Player contact numbers are strictly confidential and withheld for player privacy._
`,d+="🏆 *Selected Sports Auction Platform*",d}function Or(e,t){const n=ar(e,t);if(!n)return;const a=`https://api.whatsapp.com/send?text=${encodeURIComponent(n)}`;window.open(a,"_blank")}function Nr(e,t){if(!t||t.length===0){alert("No players found in the auction pool to export.");return}const n=m=>String(m??"").replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[h]),a=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),r=(e==null?void 0:e.name)||"Selected Sports Cricket Auction",s=t.reduce((m,h)=>m+(Number(h.base_price)||0),0);let l=0,d=0,c=0,u=0;t.forEach(m=>{const h=(m.playing_role||"").toLowerCase();h.includes("all")?l++:h.includes("bat")?d++:h.includes("bowl")?c++:(h.includes("keep")||h.includes("wk"))&&u++});const p=t.map((m,h)=>{const w=h+1,k=m.playing_role||"Player",_=k.toLowerCase();let b="role-other",S="🏏";_.includes("all")?(b="role-all",S="🏏"):_.includes("bat")?(b="role-bat",S="⚡"):_.includes("bowl")?(b="role-bowl",S="🎯"):(_.includes("keep")||_.includes("wk"))&&(b="role-keep",S="🧤");const z=(m.name||"?").slice(0,1).toUpperCase(),P=m.profile_image_url?`<img src="${n(m.profile_image_url)}" alt="${n(m.name)}" class="player-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="player-initials-fallback" style="display:none;">${n(z)}</div>`:`<div class="player-initials-fallback">${n(z)}</div>`;return`
      <div class="player-card">
        <div class="card-top">
          <span class="lot-badge">#${w<10?"0"+w:w}</span>
          <span class="role-badge ${b}">${S} ${n(k)}</span>
        </div>
        <div class="photo-container">
          ${P}
        </div>
        <div class="player-name">${n(m.name)}</div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">📍 City</span>
            <span class="detail-val">${n(m.city||"—")}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🪙 Base Price</span>
            <span class="detail-val base-price">🪙 ₹${Number(m.base_price||0).toLocaleString("en-IN")}</span>
          </div>
          ${m.category?`
          <div class="detail-row">
            <span class="detail-label">🏷️ Category</span>
            <span class="detail-val">${n(m.category)}</span>
          </div>`:""}
        </div>
      </div>
    `}).join(""),f=t.map((m,h)=>{const w=h+1,k=(m.name||"?").slice(0,1).toUpperCase(),_=m.profile_image_url?`<img src="${n(m.profile_image_url)}" alt="${n(m.name)}" class="table-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" /><span class="table-thumb-fallback" style="display:none;">${n(k)}</span>`:`<span class="table-thumb-fallback">${n(k)}</span>`;return`
      <tr>
        <td style="text-align:center;font-weight:800;color:#64748B;">#${w<10?"0"+w:w}</td>
        <td style="width:40px;text-align:center;">${_}</td>
        <td><strong style="color:#0F172A;font-size:13px;">${n(m.name)}</strong></td>
        <td><span class="table-role">${n(m.playing_role||"—")}</span></td>
        <td>${n(m.city||"—")}</td>
        <td style="font-weight:800;color:#166534;text-align:right;">🪙 ₹${Number(m.base_price||0).toLocaleString("en-IN")}</td>
        <td>${n(m.category||"—")}</td>
      </tr>
    `}).join(""),x=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${n(r)} — Official Auction Player Pool (${t.length} Players)</title>
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
        <div class="tour-tag">${n(r)}</div>
        <h1 class="doc-title">Auction Player Pool Catalog</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:900;color:#0F172A;letter-spacing:0.5px;">OFFICIAL SCOUTING DOSSIER</div>
      <div style="font-size:10.5px;color:#64748B;margin-top:2px;">Pool Size: <strong>${t.length} Players</strong></div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${a}</div>
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
      <span class="stat-val">${d}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Bowlers</span>
      <span class="stat-val">${c}</span>
    </div>
    <div class="stat-box">
      <span class="stat-label">Wicketkeepers</span>
      <span class="stat-val">${u}</span>
    </div>
  </div>

  <div class="section-title">
    <span>📸</span> Player Scouting Cards (Visual Roster)
  </div>
  <div class="cards-grid">
    ${p}
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
</html>`,y=window.open("","_blank");if(!y){alert("Please allow pop-ups to open the PDF export.");return}y.document.write(x),y.document.close(),y.onload=()=>{setTimeout(()=>{try{y.print()}catch{}},350)}}function Mr(e,t=1e3){const n=Number(e)||0;return n<t?t:n<2e4?Math.floor(n/1e3)*1e3+1e3:n<6e4?Math.floor(n/2e3)*2e3+2e3:Math.floor(n/3e3)*3e3+3e3}function Wr(e,t=1e3){const n=Number(e)||0;let a;return n>6e4?(a=Math.ceil(n/3e3)*3e3-3e3,a<6e4&&(a=6e4)):n>2e4?(a=Math.ceil(n/2e3)*2e3-2e3,a<2e4&&(a=2e4)):a=Math.ceil(n/1e3)*1e3-1e3,Math.max(t,a)}function rr({size:e=36}){return o.jsx("img",{src:"/logo-icon-v4.png",alt:"Selected Sports",style:{height:e,width:"auto",display:"block"}})}function Gr({size:e=40}){return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[o.jsx(rr,{size:e}),o.jsxs("div",{children:[o.jsx("div",{style:{color:"#0F172A",fontFamily:"var(--font-head)",fontWeight:700,fontSize:e*.44,letterSpacing:"-0.5px",lineHeight:1.1},children:"Selected"}),o.jsx("div",{style:{color:"#B8860B",fontFamily:"var(--font-head)",fontWeight:600,fontSize:e*.27,letterSpacing:"2.5px",textTransform:"uppercase",lineHeight:1.1},children:"Sports"})]})]})}function H({name:e,id:t,sz:n=34}){return o.jsx("div",{style:{width:n,height:n,borderRadius:"50%",background:Za(t),display:"flex",alignItems:"center",justifyContent:"center",fontSize:n*.3,fontWeight:700,color:"#0F172A",flexShrink:0,letterSpacing:"-0.5px",fontFamily:"var(--font-head)"},children:Qa(e)})}const ke={green:{bg:"rgba(25,182,106,0.12)",tx:"rgba(34,197,94,0.15)"},lime:{bg:"rgba(132,204,22,0.12)",tx:"#4D7C0F"},yellow:{bg:"rgba(244,180,0,0.12)",tx:"rgba(246,196,83,0.15)"},red:{bg:"rgba(229,57,53,0.1)",tx:"rgba(231,76,60,0.15)"},blue:{bg:"rgba(37,95,184,0.1)",tx:"#FFFFFF"},teal:{bg:"rgba(20,184,166,0.12)",tx:"#0F766E"},orange:{bg:"rgba(251,146,60,0.12)",tx:"rgba(251,146,60,0.15)"},purple:{bg:"rgba(167,139,250,0.12)",tx:"rgba(91,33,182,0.12)"},gray:{bg:"#F8FAF8",tx:"#F8FAF8"}},Ce={founder:{label:"Founder",icon:Be,bg:"linear-gradient(135deg,#FBBF24,#D4A017)",color:"#FFFFFF"},organizer:{label:"Organizer",icon:bt,bg:"#166534",color:"#FFFFFF"},pro:{label:"PRO",icon:xt,bg:"#FFFFFF",color:"#2563EB",border:"1.5px solid #2563EB"},player:{label:"Player",icon:ze,bg:"#22C55E",color:"#FFFFFF"},guest:{label:"Guest",icon:yt,bg:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0"}};function Pe({role:e="player",size:t="md"}){const[n,a]=F.useState(!1);F.useEffect(()=>{const l=setTimeout(()=>a(!0),10);return()=>clearTimeout(l)},[]);const r=Ce[e]||Ce.player,s=t==="sm";return o.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:s?4:6,padding:s?"3px 9px":"5px 13px",borderRadius:999,background:r.bg,color:r.color,border:r.border||"none",fontSize:s?10:12,fontWeight:700,fontFamily:"var(--font-body)",boxShadow:"0 2px 6px rgba(15,23,42,0.12)",whiteSpace:"nowrap",opacity:n?1:0,transform:n?"scale(1)":"scale(0.95)",transition:"opacity 250ms, transform 250ms"},children:[o.jsx(r.icon,{size:s?11:13}),r.label]})}function Ur({children:e,col:t="gray"}){const n=ke[t]||ke.gray;return o.jsx("span",{style:{background:n.bg,color:n.tx,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-block",fontFamily:"var(--font-head)"},children:e})}function Hr({children:e,onClick:t,variant:n="primary",size:a="md",disabled:r=!1,style:s={}}){const l={border:"none",borderRadius:10,cursor:r?"not-allowed":"pointer",fontWeight:600,fontFamily:"var(--font-body)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,opacity:r?.55:1},d={primary:{background:"linear-gradient(135deg,#166534,#FFFFFF)",color:"#0F172A"},green:{background:"#166534",color:"#0F172A"},danger:{background:"rgba(229,57,53,0.1)",color:"#DC2626",border:"1px solid rgba(229,57,53,0.3)"},ghost:{background:"#F8FAF8",color:"#0F172A"},wa:{background:"rgba(25,182,106,0.12)",color:"#166534",border:"1px solid rgba(25,182,106,0.3)"},outline:{background:"transparent",color:"#166534",border:"1.5px solid #166534"},dark:{background:"#FFFFFF",color:"#0F172A",border:"none"}},c={sm:{padding:"5px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};return o.jsx("button",{onClick:r?void 0:t,style:{...l,...d[n],...c[a],...s},children:e})}function Y(){return o.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:48},children:[o.jsx("div",{style:{width:32,height:32,borderRadius:"50%",border:"3px solid #E2E8F0",borderTopColor:"#166534",animation:"spin 0.7s linear infinite"}}),o.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})}function Z({children:e,style:t={},onClick:n}){return o.jsx("div",{onClick:n,style:{background:"#FFFFFF",borderRadius:16,border:"1px solid #E2E8F0",boxShadow:"0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)",...t},children:e})}function Yr({messages:e,onClose:t,player:n}){const[a,r]=F.useState(""),[s,l]=F.useState(!1),[d,c]=F.useState(!1),[u,p]=F.useState(null),[f,x]=F.useState([]),[y,m]=F.useState(!1),h=async()=>{if(!(!a.trim()||!n)){l(!0);try{const _=await He();_&&(await Ge(n.id,_,a.trim()),c(!0),r(""))}catch(_){alert(_.message)}l(!1)}},w=_=>{const b=_.match(/\[\[match:([a-zA-Z0-9-]+)\]\]/);return{clean:_.replace(/\[\[match:[a-zA-Z0-9-]+\]\]/,"").trim(),matchId:b?b[1]:null}},k=async _=>{p(_),m(!0);try{x(await De(_))}catch(b){alert(b.message)}m(!1)};if(u){const _=f.filter(S=>S.status==="confirmed"),b=f.filter(S=>S.status==="waitlist");return o.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:S=>S.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[o.jsxs("button",{onClick:()=>p(null),style:{background:"transparent",border:"none",fontSize:13,fontWeight:700,color:"#166534",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0},children:[o.jsx(wt,{size:15})," Back"]}),o.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),y?o.jsx(Y,{}):o.jsxs(o.Fragment,{children:[o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:10,fontFamily:"var(--font-head)"},children:["Confirmed (",_.length,")"]}),o.jsx("div",{style:{marginBottom:18},children:_.length===0?o.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one confirmed yet."}):_.map(S=>{var z,P;return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[o.jsx(H,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),o.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((P=S.players)==null?void 0:P.name)||"Player"})]},S.id)})}),o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#B8860B",marginBottom:10,fontFamily:"var(--font-head)"},children:["Waitlist (",b.length,")"]}),o.jsx("div",{children:b.length===0?o.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one on the waitlist."}):b.map(S=>{var z,P;return o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[o.jsx(H,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),o.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((P=S.players)==null?void 0:P.name)||"Player"})]},S.id)})})]})]})})}return o.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:o.jsxs("div",{onClick:_=>_.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[o.jsxs("div",{style:{fontWeight:700,fontSize:16,fontFamily:"var(--font-head)",color:"#0F172A",display:"flex",alignItems:"center",gap:8},children:[o.jsx(_t,{size:18})," Messages"]}),o.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),e.length===0&&o.jsx("div",{style:{color:"#64748B",fontSize:13,textAlign:"center",padding:"20px 0"},children:"No messages yet."}),e.map(_=>{const{clean:b,matchId:S}=w(_.message);return o.jsxs("div",{onClick:S?()=>k(S):void 0,style:{padding:"12px 0",borderBottom:"1px solid #E2E8F0",cursor:S?"pointer":"default"},children:[o.jsx("div",{style:{fontSize:13,color:"#0F172A",lineHeight:1.5},children:b}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:5,display:"flex",alignItems:"center",gap:6},children:["From ",_.sender," · ",_.created_at?new Date(_.created_at).toLocaleString():"",S&&o.jsxs("span",{style:{color:"#166534",fontWeight:700,display:"flex",alignItems:"center",gap:2},children:["· View squad ",o.jsx($e,{size:11})]})]})]},_.id)}),n&&o.jsxs("div",{style:{marginTop:14,paddingTop:14,borderTop:"1.5px solid #E2E8F0"},children:[o.jsx("div",{style:{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:8},children:"Reply to Admin"}),d&&o.jsx("div",{style:{fontSize:12,color:"#166534",marginBottom:8},children:"✓ Sent! Full conversation is in Direct Messages."}),o.jsxs("div",{style:{display:"flex",gap:8},children:[o.jsx("input",{value:a,onChange:_=>r(_.target.value),onKeyDown:_=>_.key==="Enter"&&h(),placeholder:"Type a reply...",style:{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#F8FAF8",color:"#0F172A",fontSize:13,outline:"none",fontFamily:"var(--font-body)"}}),o.jsx("button",{onClick:h,disabled:s,style:{padding:"9px 14px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:600},children:s?"...":"Send"})]})]})]})})}function Vr({isMobile:e,myId:t}){var we;const[a,r]=F.useState([]),[s,l]=F.useState(!0),[d,c]=F.useState(null),[u,p]=F.useState(!1),[f,x]=F.useState(!1),[y,m]=F.useState("points"),[h,w]=F.useState("all"),[k,_]=F.useState(!1),[b,S]=F.useState("all"),[z,P]=F.useState(!1),[E,A]=F.useState(""),[R,O]=F.useState(null);if(F.useEffect(()=>{Oe().then(g=>{r(g),setTimeout(()=>p(!0),50),g.length>0&&(x(!0),setTimeout(()=>x(!1),2200))}).catch(g=>c(g.message||String(g))).finally(()=>l(!1))},[]),s)return o.jsx(Y,{});const K=Array.from(new Set(a.map(g=>{var v;return(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)}).filter(Boolean))).sort().reverse(),se=a.filter(g=>{var v,$;return!(h!=="all"&&(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)!==h||b!=="all"&&((($=g.players)==null?void 0:$.role)||"player")!==b)}),B={};se.forEach(g=>{const v=g.players;v&&(B[v.id]||(B[v.id]={id:v.id,name:v.name,city:v.city,role:v.role,profile_image_url:v.profile_image_url,matchesPlayed:0,matches:[],earliestConfirmedAt:g.created_at}),B[v.id].matchesPlayed++,g.matches&&B[v.id].matches.push({...g.matches,confirmedAt:g.created_at}),g.created_at&&(!B[v.id].earliestConfirmedAt||g.created_at<B[v.id].earliestConfirmedAt)&&(B[v.id].earliestConfirmedAt=g.created_at))});const C=Object.values(B).map(g=>({...g,points:g.matchesPlayed*20})).sort((g,v)=>v.points!==g.points?v.points-g.points:g.earliestConfirmedAt?v.earliestConfirmedAt?new Date(g.earliestConfirmedAt)-new Date(v.earliestConfirmedAt):-1:1),T=E.trim().toLowerCase(),W=C.filter(g=>!T||g.name.toLowerCase().includes(T)||(g.city||"").toLowerCase().includes(T)),I=C.slice(0,3),j=T?W:C.slice(3),M=t?C.findIndex(g=>g.id===t):-1,J={1:{title:"👑 MVP · CHAMPION",border:"2px solid #F59E0B",bg:"linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.03) 100%)",badgeBg:"linear-gradient(135deg, #F59E0B, #D97706)",glow:"0 10px 28px rgba(245,158,11,0.28)",avatarBorder:"#F59E0B",avatarGlow:"0 0 20px rgba(245,158,11,0.4)"},2:{title:"🥈 2ND PLACE",border:"1.5px solid #CBD5E1",bg:"linear-gradient(180deg, rgba(241,245,249,0.9) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #94A3B8, #64748B)",glow:"0 8px 20px rgba(100,116,139,0.15)",avatarBorder:"#94A3B8",avatarGlow:"none"},3:{title:"🥉 3RD PLACE",border:"1.5px solid #FDE68A",bg:"linear-gradient(180deg, rgba(254,243,199,0.5) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #D97706, #B45309)",glow:"0 8px 20px rgba(180,83,9,0.15)",avatarBorder:"#D97706",avatarGlow:"none"}},le=({p:g,rank:v})=>{if(!g)return o.jsx("div",{style:{flex:1}});const $=J[v],q=v===1;return o.jsxs("div",{onClick:()=>O(g),style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:u?1:0,transform:u?q?"translateY(-6px) scale(1.02)":"translateY(0) scale(1)":"translateY(24px) scale(0.95)",transition:`all 350ms cubic-bezier(0.16, 1, 0.3, 1) ${v===1?200:v===2?100:0}ms`,zIndex:q?3:2},children:[q&&o.jsxs("div",{style:{background:$.badgeBg,color:"#FFFFFF",fontSize:10,fontWeight:900,padding:"4px 12px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:5,marginBottom:8,boxShadow:"0 4px 12px rgba(245,158,11,0.4)",letterSpacing:.5,fontFamily:"var(--font-head)"},children:[o.jsx(Be,{size:12,fill:"#FFFFFF"})," MVP · RANK 1"]}),o.jsxs("div",{style:{position:"relative",padding:q?e?"18px 10px 16px":"24px 16px 20px":e?"14px 8px 12px":"18px 12px 16px",borderRadius:20,background:$.bg,border:$.border,width:"100%",textAlign:"center",boxShadow:$.glow,boxSizing:"border-box"},children:[o.jsxs("div",{style:{position:"relative",display:"inline-block",marginBottom:10},children:[o.jsx("div",{style:{borderRadius:"50%",boxShadow:$.avatarGlow,padding:2,background:"#FFFFFF",border:`2px solid ${$.avatarBorder}`},children:g.profile_image_url?o.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:q?e?54:68:e?42:52,height:q?e?54:68:e?42:52,borderRadius:"50%",objectFit:"cover",display:"block"}}):o.jsx(H,{name:g.name,id:g.id,sz:q?e?54:68:e?42:52})}),o.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:q?24:20,height:q?24:20,borderRadius:"50%",background:$.badgeBg,color:"#FFFFFF",fontSize:q?12:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #FFFFFF",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"},children:v})]}),o.jsx("div",{style:{fontWeight:800,fontSize:q?e?13:15:e?12:13,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:g.name}),o.jsxs("div",{style:{marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:4},children:[g.role&&g.role!=="player"?o.jsx(Pe,{role:g.role,size:"sm"}):o.jsx("span",{style:{fontSize:9.5,fontWeight:800,background:"rgba(22,101,52,0.1)",color:"#166534",padding:"1px 6px",borderRadius:4},children:"PLAYER"}),g.city&&!e&&o.jsxs("span",{style:{fontSize:10,color:"#94A3B8"},children:["· ",g.city]})]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:4,fontWeight:600},children:[g.matchesPlayed," Matches"]}),o.jsxs("div",{style:{fontSize:q?e?18:22:e?15:18,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3},children:[o.jsx("span",{children:g.points}),o.jsx("span",{style:{fontSize:10,fontWeight:800,color:"#94A3B8"},children:"PTS"})]})]})]})},ot=({i:g})=>{const v=["#F59E0B","#166534","#22C55E","#FBBF24","#3B82F6"],$=Math.random()*100,q=Math.random()*300,de=1200+Math.random()*600,G=Math.random()*360,it=v[g%v.length];return o.jsx("div",{style:{position:"absolute",top:-10,left:$+"%",width:8,height:8,background:it,borderRadius:g%2===0?"50%":2,animation:`confettiFall ${de}ms ease-in ${q}ms forwards`,transform:`rotate(${G}deg)`}})},ce=({label:g,desc:v})=>o.jsxs(Z,{style:{padding:"44px 20px",textAlign:"center",borderRadius:16},children:[o.jsx("div",{style:{width:56,height:56,borderRadius:"50%",background:"#F8FAF8",border:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"},children:o.jsx(Fe,{size:26,color:"#94A3B8"})}),o.jsxs("div",{style:{fontWeight:900,fontSize:16,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)"},children:[g," Leaderboard Coming Soon"]}),o.jsx("div",{style:{color:"#64748B",fontSize:13,maxWidth:360,margin:"0 auto",lineHeight:1.5},children:v||"Individual batting and bowling statistics will populate automatically once ball-by-ball live match scoring is active."})]});return o.jsxs("div",{style:{position:"relative"},children:[o.jsx("style",{children:`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(260px) rotate(320deg); }
        }
      `}),f&&o.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:260,overflow:"hidden",pointerEvents:"none",zIndex:10},children:Array.from({length:36}).map((g,v)=>o.jsx(ot,{i:v},v))}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:e?"flex-start":"center",marginBottom:16,gap:12,flexDirection:e?"column":"row",flexWrap:"wrap"},children:[o.jsx("div",{children:o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[o.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg, rgba(245,158,11,0.15), rgba(22,101,52,0.1))",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(Ee,{size:20,color:"#D97706"})}),o.jsxs("div",{children:[o.jsx("h2",{style:{fontFamily:"var(--font-head)",color:"#0F172A",fontSize:e?19:22,margin:0,fontWeight:900,letterSpacing:"-0.4px"},children:"Player Leaderboard"}),o.jsx("div",{style:{fontSize:11.5,color:"#64748B",marginTop:2},children:"Official community rankings calculated from verified match appearances (20 PTS / Match)"})]})]})}),o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,width:e?"100%":"auto",flexWrap:"wrap"},children:[o.jsxs("div",{style:{position:"relative"},children:[o.jsxs("button",{type:"button",onClick:()=>{_(g=>!g),P(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[o.jsx(ft,{size:13,color:"#166534"}),o.jsx("span",{children:h==="all"?"All Seasons":`Season ${h}`}),o.jsx(_e,{size:13,color:"#94A3B8"})]}),k&&o.jsxs("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[o.jsx("button",{type:"button",onClick:()=>{w("all"),_(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h==="all"?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h==="all"?800:500},children:"All Seasons"}),K.map(g=>o.jsxs("button",{type:"button",onClick:()=>{w(g),_(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h===g?800:500},children:["Season ",g]},g))]})]}),o.jsxs("div",{style:{position:"relative"},children:[o.jsxs("button",{type:"button",onClick:()=>{P(g=>!g),_(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[o.jsx("span",{children:b==="all"?"All Players":b==="pro"?"PRO Only":"Players Only"}),o.jsx(_e,{size:13,color:"#94A3B8"})]}),z&&o.jsx("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[["all","All Players"],["player","Players Only"],["pro","PRO Only"]].map(([g,v])=>o.jsx("button",{type:"button",onClick:()=>{S(g),P(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:b===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:b===g?800:500},children:v},g))})]})]})]}),o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:18,flexDirection:e?"column":"row"},children:[o.jsx("div",{style:{display:"flex",gap:8,overflowX:"auto",width:e?"100%":"auto",paddingBottom:2},children:[["points","Points Table",mt],["runs","Most Runs",Fe],["wickets","Most Wickets",gt],["sixes","Most 6s",Re]].map(([g,v,$])=>o.jsxs("button",{type:"button",onClick:()=>m(g),style:{padding:"8px 14px",borderRadius:999,border:y===g?"none":"1.5px solid #E2E8F0",background:y===g?"#166534":"#FFFFFF",color:y===g?"#FFFFFF":"#64748B",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0,boxShadow:y===g?"0 2px 8px rgba(22,101,52,0.25)":"none",transition:"all 150ms ease"},children:[o.jsx($,{size:13}),o.jsx("span",{children:v})]},g))}),y==="points"&&o.jsxs("div",{style:{width:e?"100%":240,position:"relative"},children:[o.jsx(ht,{size:14,color:"#94A3B8",style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}),o.jsx("input",{type:"text",value:E,onChange:g=>A(g.target.value),placeholder:"Search ranked player...",style:{width:"100%",padding:"8px 12px 8px 32px",borderRadius:999,border:"1.5px solid #E2E8F0",fontSize:12,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}})]})]}),y==="runs"&&o.jsx(ce,{label:"Most Runs",desc:"Track top batsmen across tournaments once live match scoring is recorded."}),y==="wickets"&&o.jsx(ce,{label:"Most Wickets",desc:"Track top wicket-takers across matches once match scorecards are submitted."}),y==="sixes"&&o.jsx(ce,{label:"Most 6s",desc:"Track maximum sixes hit per season once live innings balls are captured."}),y==="points"&&(d?o.jsxs("div",{style:{color:"#EF4444",fontSize:13,textAlign:"center",padding:"30px 0",background:"rgba(239,68,68,0.06)",borderRadius:12,border:"1px solid rgba(239,68,68,0.25)"},children:["⚠️ Couldn't load the leaderboard: ",d]}):C.length===0?o.jsx(Z,{style:{padding:"40px 20px",textAlign:"center",borderRadius:16},children:o.jsxs("div",{style:{fontSize:14,color:"#64748B"},children:["No completed matches recorded yet",h!=="all"?` for Season ${h}`:"","."]})}):o.jsxs(o.Fragment,{children:[!T&&I.length>0&&o.jsxs("div",{style:{display:"flex",alignItems:"stretch",gap:e?8:14,marginBottom:22,padding:"0 2px"},children:[o.jsx(le,{p:I[1],rank:2}),o.jsx(le,{p:I[0],rank:1}),o.jsx(le,{p:I[2],rank:3})]}),j.length>0?o.jsxs("div",{style:{borderRadius:16,overflow:"hidden",border:"1px solid #E2E8F0",background:"#FFFFFF",marginBottom:20,boxShadow:"0 4px 16px rgba(15,23,42,0.03)"},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",padding:e?"12px 14px":"12px 20px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",color:"#64748B",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:[o.jsx("div",{style:{width:34},children:"#"}),o.jsx("div",{style:{flex:1},children:"Player"}),o.jsx("div",{style:{width:80,textAlign:"center"},children:"Role"}),o.jsx("div",{style:{width:70,textAlign:"center"},children:"Matches"}),o.jsx("div",{style:{width:80,textAlign:"right"},children:"Points"}),o.jsx("div",{style:{width:24}})]}),j.map((g,v)=>{const $=T?C.findIndex(G=>G.id===g.id)+1:v+4,q=g.id===t,de=$<=10;return o.jsxs("div",{onClick:()=>O(g),style:{display:"flex",alignItems:"center",padding:e?"11px 14px":"12px 20px",background:q?"rgba(34,197,94,0.07)":"#FFFFFF",borderTop:"1px solid #F1F5F9",cursor:"pointer",transition:"background 150ms ease",position:"relative"},onMouseEnter:G=>{q||(G.currentTarget.style.background="#F8FAF8")},onMouseLeave:G=>{q||(G.currentTarget.style.background="#FFFFFF")},children:[o.jsx("div",{style:{width:34,flexShrink:0},children:de?o.jsx("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:6,background:"#F1F5F9",color:"#0F172A",fontSize:11,fontWeight:900,fontFamily:"var(--font-head)"},children:$}):o.jsx("span",{style:{fontSize:13,fontWeight:700,color:"#94A3B8",fontFamily:"var(--font-head)"},children:$})}),o.jsxs("div",{style:{flex:1,display:"flex",alignItems:"center",gap:10,minWidth:0},children:[g.profile_image_url?o.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"1.5px solid #E2E8F0"}}):o.jsx(H,{name:g.name,id:g.id,sz:34}),o.jsxs("div",{style:{minWidth:0},children:[o.jsxs("div",{style:{fontWeight:800,fontSize:13.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6},children:[o.jsx("span",{children:g.name}),q&&o.jsx("span",{style:{background:"#166534",color:"#FFFFFF",fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:4},children:"YOU"})]}),g.city&&o.jsxs("div",{style:{fontSize:11,color:"#94A3B8",marginTop:1},children:["📍 ",g.city]})]})]}),o.jsx("div",{style:{width:80,textAlign:"center",flexShrink:0},children:g.role&&g.role!=="player"?o.jsx(Pe,{role:g.role,size:"sm"}):o.jsx("span",{style:{fontSize:10,fontWeight:800,background:"rgba(22,101,52,0.08)",color:"#166534",padding:"2px 7px",borderRadius:4},children:"Player"})}),o.jsx("div",{style:{width:70,textAlign:"center",fontSize:13,fontWeight:800,color:"#0F172A",flexShrink:0},children:g.matchesPlayed}),o.jsxs("div",{style:{width:80,textAlign:"right",fontSize:14,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",flexShrink:0},children:[g.points," ",o.jsx("span",{style:{fontSize:9.5,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),o.jsx("div",{style:{width:24,display:"flex",justifyContent:"flex-end",flexShrink:0},children:o.jsx($e,{size:15,color:"#CBD5E1"})})]},g.id)})]}):T?o.jsx(Z,{style:{padding:"32px 16px",textAlign:"center",borderRadius:14},children:o.jsxs("div",{style:{fontSize:13.5,color:"#64748B"},children:['No ranked players match "',E,'".']})}):null,M>=0&&o.jsxs("div",{style:{padding:"14px 18px",display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg, rgba(22,101,52,0.08), rgba(22,101,52,0.02))",border:"1.5px solid rgba(22,101,52,0.3)",borderRadius:16,boxShadow:"0 4px 14px rgba(22,101,52,0.08)"},children:[o.jsx("div",{style:{width:42,height:42,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(22,101,52,0.3)"},children:o.jsx(qe,{size:20,color:"#FFFFFF"})}),o.jsxs("div",{style:{flex:1,minWidth:0},children:[o.jsx("div",{style:{fontSize:12,color:"#166534",fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:"Your Season Ranking"}),o.jsxs("div",{style:{fontSize:17,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["Rank #",M+1," ",o.jsxs("span",{style:{fontSize:12,fontWeight:600,color:"#64748B"},children:["of ",C.length," players"]})]})]}),o.jsxs("div",{style:{textAlign:"right",flexShrink:0},children:[o.jsxs("div",{style:{fontSize:20,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)"},children:[C[M].points," ",o.jsx("span",{style:{fontSize:11,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:[C[M].matchesPlayed," matches played"]})]})]})]})),R&&o.jsx("div",{onClick:()=>O(null),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16},children:o.jsxs("div",{onClick:g=>g.stopPropagation(),style:{background:"#FFFFFF",borderRadius:20,maxWidth:440,width:"100%",padding:22,boxShadow:"0 24px 60px rgba(15,23,42,0.3)",maxHeight:"90vh",display:"flex",flexDirection:"column"},children:[o.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14},children:[o.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[R.profile_image_url?o.jsx("img",{src:R.profile_image_url,alt:R.name,style:{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:"2px solid #166534"}}):o.jsx(H,{name:R.name,id:R.id,sz:50}),o.jsxs("div",{children:[o.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)"},children:R.name}),o.jsxs("div",{style:{fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:6,marginTop:2},children:[o.jsx("span",{children:R.city||"Pune"}),o.jsx("span",{children:"·"}),o.jsx("span",{style:{fontWeight:700,color:"#166534"},children:R.role||"Player"})]})]})]}),o.jsx("button",{onClick:()=>O(null),style:{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94A3B8",padding:0},children:"×"})]}),o.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16,background:"#F8FAF8",padding:12,borderRadius:12,border:"1px solid #E2E8F0",textAlign:"center"},children:[o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Rank"}),o.jsxs("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["#",C.findIndex(g=>g.id===R.id)+1]})]}),o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Matches"}),o.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:R.matchesPlayed})]}),o.jsxs("div",{children:[o.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Points"}),o.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:2},children:R.points})]})]}),o.jsxs("div",{style:{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:8,textTransform:"uppercase",letterSpacing:.3},children:["Verified Completed Matches (",((we=R.matches)==null?void 0:we.length)||0,")"]}),o.jsx("div",{style:{flex:1,overflowY:"auto",display:"grid",gap:8,paddingRight:2,maxHeight:240},children:(R.matches||[]).map((g,v)=>o.jsxs("div",{style:{padding:"9px 12px",background:"#F8FAF8",borderRadius:10,border:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[o.jsxs("div",{style:{minWidth:0},children:[o.jsxs("div",{style:{fontSize:12.5,fontWeight:800,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[g.our_team||"Team"," vs ",g.team||"Opponent"]}),o.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:["📅 ",g.date||"Completed"]})]}),o.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#166534",background:"#DCFCE7",padding:"2px 7px",borderRadius:6,flexShrink:0},children:"+20 PTS"})]},v))}),o.jsx("button",{onClick:()=>O(null),style:{width:"100%",padding:"11px",borderRadius:10,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",marginTop:16},children:"Close"})]})})]})}function Kr({player:e}){const[t,n]=F.useState(null),[a,r]=F.useState(!0),[s,l]=F.useState(!1),[d,c]=F.useState(!1);F.useEffect(()=>{We(e.id).then(n).catch(()=>{}).finally(()=>r(!1))},[e.id]);const u=async()=>{l(!0);try{const x=await Ne(e.id);n(x)}catch(x){alert(x.message)}l(!1)},p=async()=>{if(t!=null&&t.id){c(!0);try{await Me(t.id),n(null)}catch(x){alert(x.message)}c(!1)}};if(e.role==="pro"||a)return null;const f=t==null?void 0:t.status;return o.jsxs(Z,{style:{padding:"16px",marginTop:16},children:[o.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:8,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:8},children:[o.jsx(Se,{size:17,color:"#166534"})," Schedule Your Own Matches"]}),o.jsx("div",{style:{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.5},children:"Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days."}),f==="pending"?o.jsxs(o.Fragment,{children:[o.jsx("div",{style:{padding:"10px 12px",background:"rgba(216,176,91,0.1)",borderRadius:10,color:"#B8860B",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:10},children:"⏳ Your request is pending admin approval"}),o.jsx("button",{onClick:p,disabled:d,style:{width:"100%",padding:"9px",borderRadius:10,background:"transparent",border:"1.5px solid #E2E8F0",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)"},children:d?"Cancelling...":"Cancel Request"})]}):o.jsx("button",{onClick:u,disabled:s,style:{width:"100%",padding:"11px",borderRadius:10,background:"linear-gradient(135deg,#166534,#FFFFFF)",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:s?"Sending...":f==="rejected"?"Request Again":o.jsxs(o.Fragment,{children:[o.jsx(Se,{size:15})," Request to Schedule Matches"]})})]})}const xe="ss_session";function Ae(e,t=null){try{localStorage.setItem(xe,JSON.stringify({role:e,player:t}))}catch{}}function or(){try{return JSON.parse(localStorage.getItem(xe)||"null")}catch{return null}}function rt(){try{localStorage.removeItem(xe)}catch{}}class ir extends F.Component{constructor(t){super(t),this.state={hasError:!1,isChunkError:!1}}static getDerivedStateFromError(t){const n=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();return{hasError:!0,isChunkError:/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(n)}}componentDidCatch(t,n){console.error("SelectedSports App Error caught by boundary:",t,n);const a=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();if(/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(a)){const r=parseInt(sessionStorage.getItem("boundary_reload_ts")||"0",10);if(Date.now()-r>6e3){sessionStorage.setItem("boundary_reload_ts",String(Date.now()));const s=new URL(window.location.href);s.searchParams.set("_v",String(Date.now())),window.location.replace(s.toString())}}}render(){return this.state.hasError?this.state.isChunkError?o.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"},children:[o.jsx(Y,{}),o.jsx("p",{style:{marginTop:16,fontSize:13,color:"#64748B",fontWeight:600,fontFamily:"var(--font-head)"},children:"Updating application..."})]}):o.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",fontFamily:"var(--font-body)"},children:[o.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"rgba(22,101,52,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16},children:"🏏"}),o.jsx("h2",{style:{fontSize:20,fontWeight:900,color:"#0F172A",margin:"0 0 8px",fontFamily:"var(--font-head)"},children:"Selected Sports"}),o.jsx("p",{style:{fontSize:13,color:"#64748B",maxWidth:360,margin:"0 0 20px",lineHeight:1.5},children:"Something unexpected happened. Tap below to reload."}),o.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"},children:[o.jsx("button",{onClick:()=>window.location.reload(),style:{padding:"12px 22px",borderRadius:12,background:"#166534",color:"#FFFFFF",border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)"},children:"🔄 Reload App"}),o.jsx("button",{onClick:()=>{rt(),localStorage.clear(),window.location.href="/"},style:{padding:"12px 18px",borderRadius:12,background:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0",fontSize:13,fontWeight:700,cursor:"pointer"},children:"Return to Home"})]})]}):this.props.children}}function L(e){return F.lazy(async()=>{try{return await e()}catch(t){console.warn("Chunk load failed, auto-reloading to fetch new version:",t);const n=parseInt(sessionStorage.getItem("chunk_reload_ts")||"0",10),a=Date.now();if(a-n>8e3){sessionStorage.setItem("chunk_reload_ts",String(a));const r=new URL(window.location.href);return r.searchParams.set("_v",String(a)),window.location.replace(r.toString()),new Promise(()=>{})}throw t}})}const sr=L(()=>D(()=>import("./LoginScreens-Cep1xH6u.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.UnifiedLoginScreen}))),lr=L(()=>D(()=>import("./LoginScreens-Cep1xH6u.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegisterScreen}))),cr=L(()=>D(()=>import("./LoginScreens-Cep1xH6u.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegistrationSubmittedScreen}))),dr=L(()=>D(()=>import("./AdminPortal-DuS9t30j.js").then(e=>e.A),__vite__mapDeps([4,1,5,6,2,7,3]))),ur=L(()=>D(()=>import("./PlayerPortal-C9a05wTR.js"),__vite__mapDeps([7,1,2,3]))),pr=L(()=>D(()=>import("./ProPortal-CrPb_c8M.js"),__vite__mapDeps([8,1,2,4,5,6,7,3]))),fr=L(()=>D(()=>import("./GroundOwnerPortal-tzYgPl8_.js"),__vite__mapDeps([9,1,6,3]))),mr=L(()=>D(()=>import("./PublicInvitePage-BrQnTBwG.js"),__vite__mapDeps([10,1,3]))),gr=L(()=>D(()=>import("./PublicAuctionView-tlZxFQN0.js"),__vite__mapDeps([11,1,3]))),hr=L(()=>D(()=>import("./PublicAuctionRegister-CS_nmZhX.js"),__vite__mapDeps([12,1,2,5,3]))),yr=L(()=>D(()=>import("./TeamOwnerView-C-_YgfNL.js"),__vite__mapDeps([13,1,3])));function ie(){const t=new URLSearchParams(window.location.search).get("p");t&&window.history.replaceState(null,"",t)}function xr(){ie();const t=window.location.pathname.match(/\/join\/([a-zA-Z0-9\-]+)/);return t?t[1]:null}function br(){ie();const e=window.location.pathname.match(/\/live-auction(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function wr(){ie();const e=window.location.pathname.match(/\/auction-register(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function _r(){ie();const e=window.location.pathname.match(/\/team-view\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/?$/);return e?{auctionCode:e[1],teamId:e[2]}:null}function Fr(){const[e,t]=F.useState("home"),[n,a]=F.useState(null),[r,s]=F.useState(!1),[l,d]=F.useState(!1),[c,u]=F.useState("player"),[p,f]=F.useState([]),[x,y]=F.useState(!1),[m,h]=F.useState(null),[w,k]=F.useState(null),[_,b]=F.useState(null),[S,z]=F.useState(null);F.useEffect(()=>{const C=_r();if(C){z(C),t("teamView");return}const T=br();if(T!==void 0){k(T),t("liveAuction");return}const W=wr();if(W!==void 0){b(W),t("auctionRegister");return}const I=xr();if(I){h(I),t("publicInvite");return}const j=or();(j==null?void 0:j.role)==="admin"||(j==null?void 0:j.role)==="founder"?(s(!0),a(j.player),t("portal")):(j==null?void 0:j.role)==="organizer"&&(j!=null&&j.player)?(s(!0),O(!0),a(j.player),t("portal")):(j==null?void 0:j.role)==="pro"&&(j!=null&&j.player)?(s(!1),A(!0),a(j.player),t("portal")):(j==null?void 0:j.role)==="ground_owner"&&(j!=null&&j.player)?(s(!1),d(!0),a(j.player),t("portal")):(j==null?void 0:j.role)==="player"&&(j!=null&&j.player)&&(s(!1),a(j.player),P().then(()=>t("portal")))},[]);const P=async()=>{y(!0);try{f(await Ie())}catch{}y(!1)},[E,A]=F.useState(!1),[R,O]=F.useState(!1),K=async C=>{const T=(C.phone||"").replace(/[^0-9]/g,"").slice(-10),W=Ja.replace(/[^0-9]/g,"").slice(-10);console.log("phone:",T,"adminPhone:",W);const I=T===W||C.role==="founder",j=!I&&C.role==="organizer",M=I||j,J=!M&&C.role==="pro";s(M),O(j),A(J),d(!1),a(C),M||await P(),Ae(I?"founder":j?"organizer":J?"pro":"player",C),t("portal")},se=C=>{d(!0),s(!1),O(!1),A(!1),a(C),Ae("ground_owner",C),t("portal")},B=()=>{rt(),a(null),s(!1),A(!1),O(!1),d(!1),f([]),t("home")};return o.jsx(ir,{children:o.jsxs(F.Suspense,{fallback:o.jsx("div",{style:{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(Y,{})}),children:[e==="publicInvite"&&o.jsx(mr,{token:m}),e==="liveAuction"&&o.jsx(gr,{auctionCode:w}),e==="teamView"&&o.jsx(yr,{auctionCode:S==null?void 0:S.auctionCode,teamId:S==null?void 0:S.teamId}),e==="auctionRegister"&&o.jsx(hr,{auctionCode:_}),e==="home"&&o.jsx(Ka,{onLogin:C=>{u(C==="ground_owner"?"ground_owner":"player"),t("login")},onRegister:()=>t("register"),onGroundOwnerLogin:()=>{u("ground_owner"),t("login")}}),e==="register"&&o.jsx(lr,{onSuccess:()=>t("registered"),onBack:()=>t("home")}),e==="registered"&&o.jsx(cr,{onBack:()=>t("home")}),e==="login"&&o.jsx(sr,{initialMode:c,onAdminSuccess:K,onPlayerSuccess:K,onGroundOwnerSuccess:se,onBack:()=>t("home"),onRegister:()=>t("register")}),e==="portal"&&r&&o.jsx(dr,{player:n,onLogout:B,isFounder:!R}),e==="portal"&&!r&&l&&o.jsx(fr,{owner:n,onLogout:B}),e==="portal"&&!r&&!l&&E&&o.jsx(pr,{player:n,onLogout:B}),e==="portal"&&!r&&!l&&!E&&(x||!n?o.jsx("div",{style:{minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center"},children:o.jsx(Y,{})}):o.jsx(ur,{player:n,matches:p,onLogout:B}))]})})}"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(e=>{e.forEach(t=>t.unregister())}).catch(()=>{});"caches"in window&&caches.keys().then(e=>{e.forEach(t=>caches.delete(t))}).catch(()=>{});async function be(){try{const e=await fetch("/version.json?_cb="+Date.now(),{cache:"no-store"});if(!e.ok)return;const t=await e.json();if(t!=null&&t.v&&t.v>1789164392344){console.warn("New build detected on server. Reloading to latest:",t.v,">",1789164392344);const n=new URL(window.location.href);n.searchParams.set("_v",String(t.v)),window.location.replace(n.toString())}}catch{}}be();setInterval(be,3e4);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&be()});window.addEventListener("vite:preloadError",e=>{e.preventDefault(),console.warn("Dynamic import preload error, fetching fresh bundle:",e);const t=parseInt(sessionStorage.getItem("vite_preload_ts")||"0",10);if(Date.now()-t>6e3){sessionStorage.setItem("vite_preload_ts",String(Date.now()));const n=new URL(window.location.href);n.searchParams.set("_v",String(Date.now())),window.location.replace(n.toString())}});window.addEventListener("unhandledrejection",e=>{var n;const t=((n=e.reason)==null?void 0:n.message)||String(e.reason||"");if(/dynamically imported|loading chunk|failed to fetch/i.test(t)){e.preventDefault();const a=parseInt(sessionStorage.getItem("unhandled_chunk_ts")||"0",10);if(Date.now()-a>6e3){sessionStorage.setItem("unhandled_chunk_ts",String(Date.now()));const r=new URL(window.location.href);r.searchParams.set("_v",String(Date.now())),window.location.replace(r.toString())}}});Ft.createRoot(document.getElementById("root")).render(o.jsx(St.StrictMode,{children:o.jsx(Fr,{})}));export{$r as $,Ja as A,Hr as B,Z as C,Xa as D,Kt as E,Cr as F,jr as G,Na as H,sa as I,qa as J,fa as K,Vr as L,er as M,Sn as N,un as O,je as P,Wt as Q,Pe as R,Y as S,Ur as T,Wa as U,Ha as V,Jt as W,Yt as X,Lr as Y,Nr as Z,D as _,kr as a,ln as a$,Tr as a0,Pa as a1,Ca as a2,Ba as a3,_a as a4,Ta as a5,he as a6,na as a7,Ea as a8,ma as a9,zn as aA,kn as aB,rn as aC,Rt as aD,ae as aE,Gt as aF,$t as aG,Je as aH,at as aI,Dr as aJ,ar as aK,Zn as aL,Rr as aM,wa as aN,Tt as aO,Da as aP,In as aQ,xa as aR,ba as aS,Pr as aT,Er as aU,tn as aV,ha as aW,Xn as aX,yn as aY,Oa as aZ,On as a_,da as aa,mn as ab,_n as ac,cn as ad,re as ae,oe as af,Ot as ag,Bn as ah,Oe as ai,Vt as aj,An as ak,De as al,Ie as am,ka as an,En as ao,qt as ap,qn as aq,pn as ar,Ia as as,Dn as at,Fa as au,Aa as av,Mn as aw,Cn as ax,Pn as ay,Te as az,Ar as b,nn as b0,ca as b1,tt as b2,Ua as b3,Ae as b4,nr as b5,Ir as b6,gn as b7,aa as b8,an as b9,zt as bA,$a as bB,Ct as bC,Or as ba,Br as bb,ga as bc,Wr as bd,Mr as be,hn as bf,i as bg,za as bh,la as bi,Xt as bj,fn as bk,ya as bl,ja as bm,oa as bn,ea as bo,ta as bp,pa as bq,Ga as br,Mt as bs,Qt as bt,Zt as bu,Dt as bv,ra as bw,Rn as bx,Ht as by,Et as bz,H as c,rr as d,Gr as e,Yr as f,tr as g,Kr as h,Ra as i,Fn as j,dn as k,Nt as l,fe as m,Qn as n,Ut as o,La as p,Ln as q,sn as r,Ya as s,qr as t,zr as u,Ke as v,en as w,Tn as x,va as y,ua as z};
