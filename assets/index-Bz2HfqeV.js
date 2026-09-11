const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LoginScreens-ClfY2qoq.js","assets/vendor-react-HFRZk8rN.js","assets/PhotoCropModal-DqKX7MZT.js","assets/vendor-supabase-BUgTx0zs.js","assets/AdminPortal-DYG8krgx.js","assets/indianStatesCities-CBX8Li9T.js","assets/PlayerPortal-D-gC7of_.js","assets/ProPortal-CCr95Pp0.js","assets/PublicInvitePage-Cfgwmyj6.js","assets/PublicAuctionView-CzL6Wun3.js","assets/PublicAuctionRegister-BeWMyFuQ.js","assets/TeamOwnerView-DSgn1g1T.js"])))=>i.map(i=>d[i]);
import{a8 as _,a2 as Xe,X as ve,$ as Se,a7 as r,Q as et,a5 as je,y as tt,d as Ce,b as at,V as nt,P as rt,C as ot,i as ge,g as it,Y as he,B as st,S as lt,j as Pe,s as ct,W as dt,O as ut,r as ke,a as pt,I as ft,f as ye,a6 as mt,R as gt}from"./vendor-react-HFRZk8rN.js";import{c as ht}from"./vendor-supabase-BUgTx0zs.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const yt="modulepreload",xt=function(e){return"/"+e},xe={},D=function(t,a,n){let o=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));o=Promise.allSettled(a.map(c=>{if(c=xt(c),c in xe)return;xe[c]=!0;const u=c.endsWith(".css"),p=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${p}`))return;const f=document.createElement("link");if(f.rel=u?"stylesheet":yt,u||(f.as="script"),f.crossOrigin="",f.href=c,d&&f.setAttribute("nonce",d),document.head.appendChild(f),u)return new Promise((b,y)=>{f.addEventListener("load",b),f.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(l){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=l,window.dispatchEvent(d),!d.defaultPrevented)throw l}return o.then(l=>{for(const d of l||[])d.status==="rejected"&&s(d.reason);return t().catch(s)})};function bt(e=900){const[t,a]=_.useState(()=>window.innerWidth<=e);return _.useEffect(()=>{const n=()=>a(window.innerWidth<=e);return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[e]),t}const wt="https://vsuemsmjbkrciidbvmfj.supabase.co",_t="sb_publishable_CXzyHivaMP9h5IfZYqu7fw_bALpjwuq",i=ht(wt,_t);function J(e){if(!e)return null;const t=new Date(e),a=new Date;let n=a.getFullYear()-t.getFullYear();return a.getMonth()>t.getMonth()||a.getMonth()===t.getMonth()&&a.getDate()>=t.getDate()||n--,n<19?"Under 19":null}async function oe(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10),{data:a,error:n}=await i.from("players").select("id, phone");if(n)throw n;return(a||[]).some(o=>(o.phone||"").replace(/[^0-9]/g,"").slice(-10)===t)}async function Ft(e,t){const a=e.name.split(".").pop(),o=`profile-photos/${(t||"anon").replace(/[^0-9]/g,"")}-${Date.now()}.${a}`,{error:s}=await i.storage.from("team-assets").upload(o,e,{upsert:!0});if(s)throw s;const{data:l}=i.storage.from("team-assets").getPublicUrl(o);return l.publicUrl}async function vt(e,t,a){const n=e.name.split(".").pop(),o=(a||"anon").replace(/[^0-9]/g,""),s=`payment-receipts/${t||"auc"}-${o}-${Date.now()}.${n}`,{error:l}=await i.storage.from("team-assets").upload(s,e,{upsert:!0});if(l)throw l;const{data:d}=i.storage.from("team-assets").getPublicUrl(s);return d.publicUrl}async function Q(e,t,a){try{await i.from("activity_log").insert({actor_player_id:e||null,action:t,summary:a})}catch{}}async function St(e=8){const{data:t,error:a}=await i.from("activity_log").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function H(e,t){try{await i.from("notifications").insert({type:e,message:t})}catch{}}async function jt(e=20){const{data:t,error:a}=await i.from("notifications").select("*").order("created_at",{ascending:!1}).limit(e);if(a)throw a;return t}async function Ct(){const{count:e,error:t}=await i.from("notifications").select("id",{count:"exact",head:!0}).eq("read",!1);if(t)throw t;return e||0}async function Pt(e){const{error:t}=await i.from("notifications").update({read:!0}).eq("id",e);if(t)throw t}async function kt(){const{error:e}=await i.from("notifications").update({read:!0}).eq("read",!1);if(e)throw e}async function At(){const{data:e,error:t}=await i.from("players").select("*").order("name");if(t)throw t;return e}async function ie(e,t,a="1234",n=null,o=null,s=null,l={}){if(await oe(t))throw new Error("This phone number is already registered.");const d=J(o),{data:c,error:u}=await i.from("players").insert({name:e,phone:t,pin:a,created_by:n,birth_date:o||null,profile_image_url:s||null,category:d,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,registration_source:l.source||"direct"}).select().single();if(u)throw u;return c&&c.approved===!1&&await H("player_pending",`${e} registered and is awaiting approval`),c}async function zt(e){const{data:t,error:a}=await i.from("players").select("*").eq("created_by",e).order("name");if(a)throw a;return t}async function Et(e,t,a,n,o,s={}){const l={name:t,phone:a,pin:n,city:o};s.birthDate!==void 0&&(l.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(l.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(l.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(l.jersey_size=s.jerseySize||null);const{error:d}=await i.from("players").update(l).eq("id",e);if(d)throw d;try{const c=(a||"").replace(/[^0-9]/g,"").slice(-10);if(c){const u={};t&&(u.name=t),o&&(u.city=o),s.birthDate!==void 0&&(u.birth_date=s.birthDate||null),s.profileImageUrl!==void 0&&(u.profile_image_url=s.profileImageUrl||null),s.jerseyNumber!==void 0&&(u.jersey_number=s.jerseyNumber||null),s.jerseySize!==void 0&&(u.jersey_size=s.jerseySize||null),Object.keys(u).length>0&&await i.from("auction_players").update(u).ilike("phone",`%${c}`)}}catch(c){console.warn("Could not sync auction_players:",c)}}async function Rt(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function qt(){const{data:e,error:t}=await i.from("grounds").select("*").order("name");if(t)throw t;return e}async function $t(e,t,a,n){const{data:o,error:s}=await i.from("grounds").insert({name:e,location:t,maps_link:a,notes:n}).select().single();if(s)throw s;return o}async function Bt(e,t){const{error:a}=await i.from("grounds").update(t).eq("id",e);if(a)throw a}async function Tt(e){const{error:t}=await i.from("grounds").delete().eq("id",e);if(t)throw t}async function It(){const{data:e,error:t}=await i.from("teams").select("*").order("name");if(t)throw t;return e}async function Dt(e,t){const{data:a,error:n}=await i.from("teams").insert({name:e,logo_url:t}).select().single();if(n)throw n;return a}async function Lt(e,t,a){const{error:n}=await i.from("teams").update({name:t,logo_url:a}).eq("id",e);if(n)throw n}async function Nt(e){const{error:t}=await i.from("teams").delete().eq("id",e);if(t)throw t}async function se(e,t){const a=e.name.split(".").pop(),n=`team-logos/${t.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:o}=await i.storage.from("team-assets").upload(n,e,{upsert:!0});if(o)throw o;const{data:s}=i.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function Ae(){const{data:e,error:t}=await i.from("matches").select("*").order("date",{ascending:!1});if(t)throw t;return e}async function Wt(e){const{data:t,error:a}=await i.from("matches").select("*").eq("invite_token",e).single();if(a)throw a;return t}async function Ot({date:e,time_slot:t,ground:a,team:n,team_logo:o,our_team:s,our_team_logo:l,type:d,max_players:c,created_by:u,visibility:p}){const{data:f,error:b}=await i.from("matches").insert({date:e,time_slot:t,ground:a,team:n,team_logo:o,our_team:s||null,our_team_logo:l||null,type:d,max_players:c,created_by:u||null,status:"upcoming",link_active:!1,visibility:p||"private"}).select().single();if(b)throw b;let y="Someone";if(u){const{data:h}=await i.from("players").select("name").eq("id",u).maybeSingle();h!=null&&h.name&&(y=h.name)}const m=s?`${s} vs ${n}`:n;return await Q(u,"match_created",`${y} created ${m}`),f}async function Mt(e){await i.from("match_players").delete().eq("match_id",e),await i.from("expenses").delete().eq("match_id",e),await i.from("payments").delete().eq("match_id",e),await i.from("chat_messages").delete().eq("match_id",e),await i.from("public_responses").delete().eq("match_id",e);const{error:t}=await i.from("matches").delete().eq("id",e);if(t)throw t}async function Ut(e,t){const{error:a}=await i.from("matches").update({status:t}).eq("id",e);if(a)throw a;if(t==="completed"){const{data:n}=await i.from("matches").select("team, our_team").eq("id",e).maybeSingle();n&&await Q(null,"match_completed",`Match completed: ${n.our_team?`${n.our_team} vs ${n.team}`:n.team}`)}}async function Gt(e,t){const{error:a}=await i.from("matches").update({max_players:t}).eq("id",e);if(a)throw a}async function Ht(e,t){const{error:a}=await i.from("matches").update({link_active:t}).eq("id",e);if(a)throw a}async function ze(e){const{data:t,error:a}=await i.from("match_players").select("*, players(id, name, phone, role)").eq("match_id",e).order("responded_at",{ascending:!0,nullsFirst:!1});if(a)throw a;return t}async function Yt(e,t,a){let n=a||"confirmed",o=!1,s=null;if(n==="confirmed"){const{data:d}=await i.from("matches").select("max_players, team, date").eq("id",e).single();s=d;const c=(d==null?void 0:d.max_players)||0;if(c>0){const{data:u}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!u||u.status!=="confirmed"){const{count:p}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(p||0)>=c?n="waitlist":(p||0)+1===c&&(o=!0)}}}const{error:l}=await i.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(l)throw l;if(o&&n==="confirmed"&&s)try{const{data:d}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","confirmed"),c=(d||[]).map(p=>p.player_id),u=`🔒 Squad full for ${s.team} on ${s.date}! See you there 🏏[[match:${e}]]`;await Promise.all(c.map(p=>Ee(p,"System",u).catch(()=>{})))}catch{}return n}async function Vt(e,t){const{error:a}=await i.from("match_players").upsert({match_id:e,player_id:t,status:"pending"},{onConflict:"match_id,player_id"});if(a)throw a}async function Kt(e,t){const{error:a}=await i.from("match_players").delete().eq("match_id",e).eq("player_id",t);if(a)throw a;await le(e)}async function Zt(e,t,a){let n=a;if(a==="confirmed"){const{data:s}=await i.from("matches").select("max_players").eq("id",e).single(),l=(s==null?void 0:s.max_players)||0;if(l>0){const{data:d}=await i.from("match_players").select("status").eq("match_id",e).eq("player_id",t).maybeSingle();if(!d||d.status!=="confirmed"){const{count:c}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");(c||0)>=l&&(n="waitlist")}}}const{error:o}=await i.from("match_players").upsert({match_id:e,player_id:t,status:n,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});if(o)throw o;return a!=="confirmed"&&await le(e),n}async function Jt(e){const{data:t,error:a}=await i.from("public_responses").select("*").eq("match_id",e).order("created_at");if(a)throw a;return t}async function Qt(e,t,a,n){const{data:o}=await i.from("public_responses").select("id").eq("match_id",e).ilike("name",t.trim()).maybeSingle();if(o){const{error:d}=await i.from("public_responses").update({availability:n,phone:a,approved:null}).eq("id",o.id);if(d)throw d;return{updated:!0}}const{data:s,error:l}=await i.from("public_responses").insert({match_id:e,name:t.trim(),phone:(a==null?void 0:a.trim())||null,availability:n,approved:null}).select().single();if(l)throw l;return s}async function Xt(e,t,a,n,o){const{data:s}=await i.from("match_players").select("id").eq("match_id",t).eq("status","confirmed"),d=((s==null?void 0:s.length)||0)>=o;let c=null;const{data:u}=await i.from("players").select("*").ilike("name",a.trim()).maybeSingle();if(u)c=u,n&&!u.phone&&await i.from("players").update({phone:n}).eq("id",u.id);else{const{data:b,error:y}=await i.from("players").insert({name:a.trim(),phone:(n==null?void 0:n.trim())||null,pin:"1234"}).select().single();if(y)throw y;c=b}const p=d?"waitlist":"confirmed";await i.from("match_players").upsert({match_id:t,player_id:c.id,status:p,responded_at:new Date().toISOString()},{onConflict:"match_id,player_id"});const{error:f}=await i.from("public_responses").update({approved:!0,player_id:c.id}).eq("id",e);if(f)throw f;return{player:c,status:p}}async function ea(e){const{error:t}=await i.from("public_responses").update({approved:!1}).eq("id",e);if(t)throw t}async function ta(e){const{data:t,error:a}=await i.from("expenses").select("*").eq("match_id",e);if(a)throw a;return t}async function aa(e,t,a){const{data:n,error:o}=await i.from("expenses").insert({match_id:e,label:t,amount:a}).select().single();if(o)throw o;return n}async function na(e){const{error:t}=await i.from("expenses").delete().eq("id",e);if(t)throw t}async function ra(e){const{data:t,error:a}=await i.from("payments").select("*").eq("match_id",e);if(a)throw a;return t}async function oa(e,t,a){const{error:n}=await i.from("payments").upsert({match_id:e,player_id:t,paid:a},{onConflict:"match_id,player_id"});if(n)throw n}async function ia(e){const{data:t,error:a}=await i.from("chat_messages").select("*").eq("match_id",e).order("sent_at");if(a)throw a;return t}async function sa(e,t,a){const{data:n,error:o}=await i.from("chat_messages").insert({match_id:e,sender:t,message:a}).select().single();if(o)throw o;return n}function la(e,t){return i.channel("chat:"+e).on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages",filter:`match_id=eq.${e}`},a=>t(a.new)).subscribe()}async function X(){const{data:e,error:t}=await i.from("settings").select("*");if(t)throw t;return Object.fromEntries((e||[]).map(a=>[a.key,a.value]))}async function I(e,t){const{error:a}=await i.from("settings").upsert({key:e,value:t},{onConflict:"key"});if(a)throw a}async function ca(e,t,a,n=null,o=null,s={}){if(await oe(t))throw new Error("This phone number is already registered.");const l=J(n),{data:d,error:c}=await i.from("players").insert({name:e,phone:t,pin:a,approved:!0,birth_date:n||null,profile_image_url:o||null,category:l,city:s.city||null,jersey_number:s.jerseyNumber||null,jersey_size:s.jerseySize||null,registration_source:"direct"}).select().single();if(c)throw c;return d}async function da(){const{data:e,error:t}=await i.from("players").select("*").eq("approved",!1).order("id",{ascending:!1});if(t)throw t;return e}async function ua(e){const{error:t}=await i.from("players").update({approved:!0}).eq("id",e);if(t)throw t;const{data:a}=await i.from("players").select("name").eq("id",e).maybeSingle();a!=null&&a.name&&await Q(null,"player_approved",`${a.name} was approved`)}async function pa(e){const{error:t}=await i.from("players").delete().eq("id",e);if(t)throw t}async function fa(e){const{data:t,error:a}=await i.from("contributions").select("*").eq("player_id",e).order("date",{ascending:!1});if(a)throw a;return t}async function ma(e,t,a,n,o){const{data:s,error:l}=await i.from("contributions").insert({player_id:e,amount:t,note:a||null,date:n||new Date().toISOString().split("T")[0],match_id:o||null}).select().single();if(l)throw l;return s}async function ga(e){const{error:t}=await i.from("contributions").delete().eq("id",e);if(t)throw t}async function ha(e,t){if(!t)return!1;const{data:a}=await i.from("contributions").select("id").eq("player_id",e).eq("match_id",t).maybeSingle();return!!a}async function ya(){const[e,t,a]=await Promise.all([i.from("matches").select("id",{count:"exact",head:!0}),i.from("players").select("id",{count:"exact",head:!0}),i.from("grounds").select("id",{count:"exact",head:!0})]);return{matches:e.count||0,players:t.count||0,venues:a.count||0}}async function xa(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);let n=0;if(a.length>0){const{data:s}=await i.from("match_players").select("player_id").in("match_id",a);n=new Set((s||[]).map(l=>l.player_id)).size}const{count:o}=await i.from("grounds").select("id",{count:"exact",head:!0});return{matches:a.length,players:n,venues:o||0}}async function ba(e){const{data:t,error:a}=await i.from("match_players").select("status, matches(id, date, time_slot, ground, team, our_team, status, type)").eq("player_id",e).eq("status","confirmed");if(a)throw a;return(t||[]).map(n=>n.matches).filter(Boolean).sort((n,o)=>new Date(o.date)-new Date(n.date))}async function wa(e){const{data:t}=await i.from("match_players").select("match_id, status").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(o=>o.match_id);let n=0;if(a.length>0){const{data:o}=await i.from("matches").select("ground").in("id",a);n=new Set((o||[]).map(s=>s.ground).filter(Boolean)).size}return{matches:a.length,venues:n}}async function _a(e){if(!e||e.length===0)return{};const{data:t}=await i.from("match_players").select("match_id, status").in("match_id",e).eq("status","confirmed"),a={};return(t||[]).forEach(n=>{a[n.match_id]=(a[n.match_id]||0)+1}),a}async function le(e){const{data:t}=await i.from("matches").select("max_players").eq("id",e).single(),a=(t==null?void 0:t.max_players)||0;if(a<=0)return null;const{count:n}=await i.from("match_players").select("id",{count:"exact",head:!0}).eq("match_id",e).eq("status","confirmed");if((n||0)>=a)return null;const{data:o}=await i.from("match_players").select("player_id").eq("match_id",e).eq("status","waitlist").order("responded_at",{ascending:!0,nullsFirst:!1}).limit(1);if(!o||o.length===0)return null;const s=o[0].player_id;return await i.from("match_players").update({status:"confirmed"}).eq("match_id",e).eq("player_id",s),s}async function Fa(e){const{data:t}=await i.from("matches").select("id, date").eq("created_by",e),a=(t||[]).map(c=>c.id);if(a.length===0)return[];const n=Object.fromEntries((t||[]).map(c=>[c.id,c.date])),{data:o}=await i.from("match_players").select("match_id, player_id, status, players(id, name, phone, city)").in("match_id",a),{data:s}=await i.from("contributions").select("player_id, amount").in("match_id",a),l={};(s||[]).forEach(c=>{l[c.player_id]=(l[c.player_id]||0)+Number(c.amount)});const d={};return(o||[]).forEach(c=>{const u=c.players;if(u)if(d[u.id]||(d[u.id]={id:u.id,name:u.name,phone:u.phone,city:u.city,played:0,confirmed:0,declined:0,contributed:0,lastPlayedDate:null}),c.status==="confirmed"){d[u.id].confirmed++,d[u.id].played++;const p=n[c.match_id];p&&(!d[u.id].lastPlayedDate||p>d[u.id].lastPlayedDate)&&(d[u.id].lastPlayedDate=p)}else c.status==="declined"&&d[u.id].declined++}),Object.values(d).forEach(c=>{c.contributed=l[c.id]||0}),Object.values(d).sort((c,u)=>u.played-c.played)}async function va(e){const[{data:t,error:a},{data:n,error:o}]=await Promise.all([i.from("match_players").select("status, matches(*)").eq("player_id",e),i.from("matches").select("*").eq("visibility","public").eq("status","upcoming")]);if(a)throw a;if(o)throw o;const s=(t||[]).filter(c=>c.matches).map(c=>({match:c.matches,myStatus:c.status})),l=new Set(s.map(c=>c.match.id)),d=(n||[]).filter(c=>!l.has(c.id)).map(c=>({match:c,myStatus:"pending"}));return[...s,...d]}async function Sa(e,t){const{error:a}=await i.from("players").update({upi_id:t}).eq("id",e);if(a)throw a}async function ja(e){try{if(e!=null&&e.created_by){const{data:t}=await i.from("players").select("upi_id").eq("id",e.created_by).maybeSingle();if(t!=null&&t.upi_id)return t.upi_id}}catch{}try{const t=await X();return(t==null?void 0:t.upi)||(t==null?void 0:t.upi_id)||""}catch{return""}}async function Ee(e,t,a){const{error:n}=await i.from("admin_messages").insert({player_id:e,sender:t,message:a});if(n)throw n}async function Ca(){const{data:e,error:t}=await i.from("admin_messages").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Pa(e){const{data:t,error:a}=await i.from("admin_messages").select("*").or(`player_id.eq.${e},player_id.is.null`).order("created_at",{ascending:!1});if(a)throw a;return t}async function ka(e){const{count:t,error:a}=await i.from("admin_messages").select("id",{count:"exact",head:!0}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(a)throw a;return t||0}async function Aa(e){const{error:t}=await i.from("admin_messages").update({read_at:new Date().toISOString()}).is("read_at",null).or(`player_id.eq.${e},player_id.is.null`);if(t)throw t}async function Re(){const{data:e,error:t}=await i.from("match_players").select("player_id, status, created_at, players(id, name, city, role, profile_image_url), matches!inner(status, date, team, our_team)").eq("status","confirmed").eq("matches.status","completed");if(t)throw t;return e||[]}async function qe(e){const{data:t,error:a}=await i.from("pro_requests").insert({player_id:e,status:"pending"}).select().single();if(a)throw a;const{data:n}=await i.from("players").select("name").eq("id",e).maybeSingle();return n!=null&&n.name&&await H("pro_request",`${n.name} requested Pro access`),t}async function $e(e){const{error:t}=await i.from("pro_requests").delete().eq("id",e);if(t)throw t}async function Be(e){const{data:t,error:a}=await i.from("pro_requests").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(a)throw a;return t}async function za(){const{data:e,error:t}=await i.from("pro_requests").select("*, players(id, name, phone)").eq("status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function Ea(e,t){const a=new Date(Date.now()+5184e6).toISOString().slice(0,10),{error:n}=await i.from("players").update({role:"pro",subscription_expiry:a}).eq("id",t);if(n)throw n;const{error:o}=await i.from("pro_requests").update({status:"approved",decided_at:new Date().toISOString()}).eq("id",e);if(o)throw o}async function Ra(e){const{error:t}=await i.from("pro_requests").update({status:"rejected",decided_at:new Date().toISOString()}).eq("id",e);if(t)throw t}async function qa(e=5){const{data:t,error:a}=await i.from("players").select("name, city, id").order("id",{ascending:!1}).limit(e);if(a)throw a;return t}async function $a(e){const{data:t}=await i.from("match_players").select("match_id").eq("player_id",e).eq("status","confirmed"),a=(t||[]).map(c=>c.match_id);if(a.length===0)return[];const{data:n}=await i.from("matches").select("ground").in("id",a),o=Array.from(new Set((n||[]).map(c=>c.ground).filter(Boolean)));if(o.length===0)return[];const{data:s}=await i.from("grounds").select("id, name, location").in("name",o),l=new Set((s||[]).map(c=>c.name)),d=o.filter(c=>!l.has(c)).map(c=>({id:c,name:c,location:""}));return[...s||[],...d]}async function Te(e,t,a){const{error:n}=await i.from("direct_messages").insert({sender_id:e,recipient_id:t,message:a});if(n)throw n}async function Ba(e,t){const{data:a,error:n}=await i.from("direct_messages").select("*").or(`and(sender_id.eq.${e},recipient_id.eq.${t}),and(sender_id.eq.${t},recipient_id.eq.${e})`).order("created_at",{ascending:!0});if(n)throw n;return a}async function Ta(e){const{data:t,error:a}=await i.from("direct_messages").select("*, sender:sender_id(id,name), recipient:recipient_id(id,name)").or(`sender_id.eq.${e},recipient_id.eq.${e}`).order("created_at",{ascending:!1});if(a)throw a;const n={};return(t||[]).forEach(o=>{var d,c;const s=o.sender_id===e?o.recipient_id:o.sender_id,l=(o.sender_id===e?(d=o.recipient)==null?void 0:d.name:(c=o.sender)==null?void 0:c.name)||"Player";n[s]||(n[s]={otherId:s,otherName:l,lastMessage:o.message,lastAt:o.created_at,unread:0}),o.recipient_id===e&&!o.read_at&&n[s].unread++}),Object.values(n).sort((o,s)=>new Date(s.lastAt)-new Date(o.lastAt))}async function Ia(e,t){const{error:a}=await i.from("direct_messages").update({read_at:new Date().toISOString()}).eq("recipient_id",e).eq("sender_id",t).is("read_at",null);if(a)throw a}async function Da(e){const{count:t,error:a}=await i.from("direct_messages").select("id",{count:"exact",head:!0}).eq("recipient_id",e).is("read_at",null);if(a)throw a;return t||0}async function La(e){const{data:t}=await i.from("players").select("id, name, role").eq("role","admin"),{data:a}=await i.from("match_players").select("status, matches(created_by)").eq("player_id",e).eq("status","confirmed"),n=Array.from(new Set((a||[]).map(l=>{var d;return(d=l.matches)==null?void 0:d.created_by}).filter(Boolean)));let o=[];if(n.length>0){const{data:l}=await i.from("players").select("id, name, role").in("id",n).eq("role","pro");o=l||[]}const s=new Map;return[...t||[],...o].forEach(l=>s.set(l.id,l)),Array.from(s.values())}async function Na(e){const{data:t}=await i.from("matches").select("id").eq("created_by",e),a=(t||[]).map(s=>s.id);if(a.length===0)return[];const{data:n}=await i.from("match_players").select("player_id, status, players(id, name)").in("match_id",a).eq("status","confirmed"),o=new Map;return(n||[]).forEach(s=>{s.players&&!o.has(s.player_id)&&o.set(s.player_id,s.players)}),Array.from(o.values())}async function Ie(){const{count:e,error:t}=await i.from("players").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function De(){const{data:e,error:t}=await i.from("players").select("id").eq("role","admin").limit(1).maybeSingle();if(t)throw t;return(e==null?void 0:e.id)||null}async function Wa(e,t,a){const{error:n}=await i.from("feedback").insert({player_id:e,sender_name:t,message:a});if(n)throw n}async function Oa(){const{data:e,error:t}=await i.from("feedback").select("*").order("created_at",{ascending:!1});if(t)throw t;return e}async function Ma(e){const t=(e||"").trim();if(!t)return{players:[],teams:[],grounds:[],matches:[]};const[a,n,o,s]=await Promise.all([i.from("players").select("id, name, city, role").ilike("name",`%${t}%`).limit(5),i.from("teams").select("id, name").ilike("name",`%${t}%`).limit(5),i.from("grounds").select("id, name, location").ilike("name",`%${t}%`).limit(5),i.from("matches").select("id, team, our_team, ground, date, status").ilike("team",`%${t}%`).limit(5)]);return{players:a.data||[],teams:n.data||[],grounds:o.data||[],matches:s.data||[]}}async function Le(){const{count:e,error:t}=await i.from("matches").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ne(){const{count:e,error:t}=await i.from("teams").select("id",{count:"exact",head:!0});if(t)throw t;return e||0}async function Ua(e,t){const a=(t.phone||"").replace(/[^0-9]/g,"").slice(-10);if(await We(a,e))return null;const o=J(t.birth_date),s=await Z(e),{data:l,error:d}=await i.from("auction_players").insert({name:t.name,phone:a,status:"registered",auction_id:e,birth_date:t.birth_date||null,profile_image_url:t.profile_image_url||null,category:o,city:t.city||null,jersey_number:t.jersey_number||null,jersey_size:t.jersey_size||null,base_price:s}).select().single();if(d)throw d;return l}async function Z(e){if(!e)return null;const{data:t}=await i.from("auctions").select("points_purse").eq("id",e).maybeSingle();return t!=null&&t.points_purse?Math.round(t.points_purse/100):null}async function Ga(e,t,a,n=null,o=null,s=null,l={}){var y,m;const d=J(n),c=await Z(s),u={name:e,phone:t,playing_role:a,status:l.status||"registered",birth_date:n||null,profile_image_url:o||null,category:d,auction_id:s||null,city:l.city||null,jersey_number:l.jerseyNumber||null,jersey_size:l.jerseySize||null,base_price:c};l.paymentScreenshotUrl&&(u.payment_screenshot_url=l.paymentScreenshotUrl),l.paymentStatus&&(u.payment_status=l.paymentStatus);let{data:p,error:f}=await i.from("auction_players").insert(u).select().single();if(f&&((y=f.message)!=null&&y.includes("payment_screenshot_url")||(m=f.message)!=null&&m.includes("payment_status"))){console.warn("Retrying registerAuctionPlayer without payment columns:",f.message),delete u.payment_screenshot_url,delete u.payment_status;const h=await i.from("auction_players").insert(u).select().single();if(h.error)throw h.error;p=h.data}else if(f)throw f;const b=l.status==="waitlist"?`${e} joined the waiting list for auction`:`${e} registered for the auction`;await H("auction_registration",b);try{await ie(e,t,"1234",null,n,o,{...l,source:"auction"})}catch(h){console.error("Failed to sync auction registrant into main player roster:",h)}return p}async function Ha(e,t){const{error:a}=await i.from("auction_players").update({payment_status:t}).eq("id",e);if(a)throw a}async function Ya(e,t,a=null){const n={status:t};a&&(n.payment_status=a);const{error:o}=await i.from("auction_players").update(n).eq("id",e);if(o)throw o}async function ce(e=null){let t=i.from("auction_players").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;return a}async function We(e,t=null){const a=(e||"").replace(/[^0-9]/g,"").slice(-10);let n=i.from("auction_players").select("id, phone");n=t?n.eq("auction_id",t):n.is("auction_id",null);const{data:o,error:s}=await n;if(s)throw s;return(o||[]).some(l=>(l.phone||"").replace(/[^0-9]/g,"").slice(-10)===a)}async function Oe(e){const t=(e||"").replace(/[^0-9]/g,"").slice(-10);if(t.length!==10)return null;const{data:a,error:n}=await i.from("players").select("id, name, playing_role, birth_date, profile_image_url, category, city, jersey_number, jersey_size").ilike("phone",`%${t}`);if(n)throw n;return a&&a[0]||null}async function Va(e=null){if(e){const{data:a,error:n}=await i.from("auctions").select("registration_open").eq("id",e).maybeSingle();if(n)throw n;return(a==null?void 0:a.registration_open)!==!1}const t=await X();return(t==null?void 0:t.auction_registration_open)!=="false"}async function Ka(e,t){if(typeof e=="boolean"){await I("auction_registration_open",e?"true":"false");return}const{error:a}=await i.from("auctions").update({registration_open:t}).eq("id",e);if(a)throw a}async function Za(e,t){const{error:a}=await i.from("players").update({playing_role:t}).eq("id",e);if(a)throw a;try{const{data:n}=await i.from("players").select("phone").eq("id",e).maybeSingle(),o=((n==null?void 0:n.phone)||"").replace(/[^0-9]/g,"").slice(-10);o&&await i.from("auction_players").update({playing_role:t}).ilike("phone",`%${o}`)}catch(n){console.warn("Could not sync auction_players role:",n)}}async function Ja(e,t){const{error:a}=await i.from("auction_players").update({base_price:t}).eq("id",e);if(a)throw a}async function Qa(e,t){const{error:a}=await i.from("auction_players").update({category:t}).eq("id",e);if(a)throw a}async function Xa(e){const{error:t}=await i.from("auction_players").delete().eq("id",e);if(t)throw t}async function en(e){const{error:t}=await i.from("auction_players").update({status:"dropped",payment_status:"refunded"}).eq("id",e);if(t)throw t}async function tn(e){const{error:t}=await i.from("auction_players").update({status:"registered",payment_status:"paid"}).eq("id",e);if(t)throw t}async function an(e=null){let t=i.from("auction_teams").select("*").order("created_at",{ascending:!0});t=e?t.eq("auction_id",e):t.is("auction_id",null);const{data:a,error:n}=await t;if(n)throw n;if(!a||a.length===0)return[];try{const o=a.map(d=>`auction_team_logo_${d.id}`),{data:s}=await i.from("settings").select("key, value").in("key",o),l={};return s&&s.forEach(d=>{l[d.key]=d.value}),a.map(d=>({...d,logo_url:d.logo_url||l[`auction_team_logo_${d.id}`]||null}))}catch(o){return console.warn("Could not load team logos:",o),a}}async function de(e,t,{captainPlayerId:a,captainPhone:n,captainName:o}){var l,d,c,u,p;const s=(n||"").replace(/[^0-9]/g,"").slice(-10);if(a){const f={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};o&&(f.name=o.trim());let b=await i.from("auction_players").update(f).eq("id",a);b.error&&((l=b.error.message)!=null&&l.includes("is_captain"))&&(delete f.is_captain,await i.from("auction_players").update(f).eq("id",a));return}if(s&&s.length===10){let f=i.from("auction_players").select("id, name, phone");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:b}=await f,y=(b||[]).find(A=>(A.phone||"").replace(/[^0-9]/g,"").slice(-10)===s);if(y){const A={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};o&&(A.name=o.trim());let k=await i.from("auction_players").update(A).eq("id",y.id);k.error&&((d=k.error.message)!=null&&d.includes("is_captain"))&&(delete A.is_captain,await i.from("auction_players").update(A).eq("id",y.id));return}let m=null,h=null,w=null,C=null,x=null,F=null,S=o?o.trim():"Captain";try{const A=await Oe(s);A&&(!o&&A.name&&(S=A.name),m=A.profile_image_url||null,h=A.playing_role||null,w=A.city||null,C=A.birth_date||null,x=A.jersey_number||null,F=A.jersey_size||null)}catch{}const z=await Z(t),P={name:S,phone:s,playing_role:h||"All-rounder",status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,profile_image_url:m,city:w,birth_date:C,jersey_number:x,jersey_size:F,base_price:z||0};let $=await i.from("auction_players").insert(P);$.error&&((c=$.error.message)!=null&&c.includes("is_captain"))&&(delete P.is_captain,await i.from("auction_players").insert(P));return}if(o&&o.trim()){let f=i.from("auction_players").select("id, name");f=t?f.eq("auction_id",t):f.is("auction_id",null);const{data:b}=await f,y=(b||[]).find(m=>(m.name||"").trim().toLowerCase()===o.trim().toLowerCase());if(y){const m={sold_team_id:e,status:"captain",is_captain:!0,sold_price:0,sold_at:new Date().toISOString()};let h=await i.from("auction_players").update(m).eq("id",y.id);h.error&&((u=h.error.message)!=null&&u.includes("is_captain"))&&(delete m.is_captain,await i.from("auction_players").update(m).eq("id",y.id))}else{const m=await Z(t),h={name:o.trim(),status:"captain",is_captain:!0,sold_team_id:e,sold_price:0,sold_at:new Date().toISOString(),auction_id:t||null,base_price:m||0};let w=await i.from("auction_players").insert(h);w.error&&((p=w.error.message)!=null&&p.includes("is_captain"))&&(delete h.is_captain,await i.from("auction_players").insert(h))}}}async function nn(e,t,a,n=null,o=null,s=null,l=null,d=null,c=null,u=null){var m,h;const p={name:e,owner_name:t||null,captain_name:o||null,purse_total:a,purse_remaining:a,auction_id:n||null};s&&(p.captain_phone=s),l&&(p.owner_phone=l);let f,{data:b,error:y}=await i.from("auction_teams").insert(p).select().single();if(y&&((m=y.message)!=null&&m.includes("captain_phone")||(h=y.message)!=null&&h.includes("owner_phone"))){delete p.captain_phone,delete p.owner_phone;const w=await i.from("auction_teams").insert(p).select().single();if(w.error)throw w.error;f=w.data}else{if(y)throw y;f=b}if(f!=null&&f.id&&(d||s||o))try{await de(f.id,n,{captainPlayerId:d,captainPhone:s,captainName:o})}catch(w){console.warn("Could not pre-assign captain:",w)}if(f!=null&&f.id)try{let w=u||null;c&&(w=await se(c,e)),w&&(await I(`auction_team_logo_${f.id}`,w),f.logo_url=w)}catch(w){console.warn("Could not save team logo:",w)}return f}async function rn(e,{name:t,ownerName:a,purseTotal:n,captainName:o,captainPhone:s,ownerPhone:l,captainPlayerId:d,auctionId:c,logoFile:u,logoUrl:p}){var y,m;const f={name:t,owner_name:a||null,captain_name:o||null,purse_total:n,purse_remaining:n};s&&(f.captain_phone=s),l&&(f.owner_phone=l);let{error:b}=await i.from("auction_teams").update(f).eq("id",e);if(b&&((y=b.message)!=null&&y.includes("captain_phone")||(m=b.message)!=null&&m.includes("owner_phone"))){delete f.captain_phone,delete f.owner_phone;const h=await i.from("auction_teams").update(f).eq("id",e);if(h.error)throw h.error}else if(b)throw b;if(e&&(d||s||o))try{await de(e,c,{captainPlayerId:d,captainPhone:s,captainName:o})}catch(h){console.warn("Could not update pre-assigned captain:",h)}try{if(u){const h=await se(u,t);await I(`auction_team_logo_${e}`,h)}else p!==void 0&&(p?await I(`auction_team_logo_${e}`,p):await i.from("settings").delete().eq("key",`auction_team_logo_${e}`))}catch(h){console.warn("Could not update team logo:",h)}}async function on(e){const{error:t}=await i.from("auction_players").update({status:"registered",sold_team_id:null,sold_price:null,sold_at:null}).eq("sold_team_id",e);if(t)throw t;try{await i.from("auction_bids").delete().eq("team_id",e)}catch(n){console.warn("Could not delete bids for team:",n)}try{await i.from("auctions").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("auction_state").update({current_team_id:null}).eq("current_team_id",e)}catch{}try{await i.from("settings").delete().eq("key",`auction_team_logo_${e}`)}catch{}const{error:a}=await i.from("auction_teams").delete().eq("id",e);if(a)throw a}async function sn(e=null){if(e)return await Ge(e);const{data:t,error:a}=await i.from("auction_state").select("*").eq("id",1).single();if(a)throw a;return t}function Me(e,t){const a=e.filter(o=>o.id!==t&&o.status==="registered"&&!o.is_captain&&o.status!=="captain");if(a.length===0)return null;const n=Math.floor(Math.random()*a.length);return a[n]}async function ln(e,t=null){const a=await ce(t),n=Me(a,null);if(!n)throw new Error("No players in the pool yet — add players before starting.");const o=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(o).update({status:"live",bid_increment:e,current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function cn(e,t,a,n=null){const{error:o}=await i.from("auction_bids").insert({player_id:e,team_id:t,amount:a,auction_id:n||null});if(o)throw o;const s=n?"auctions":"auction_state",l=n||1,{error:d}=await i.from(s).update({current_bid:a,current_team_id:t}).eq("id",l);if(d)throw d}async function dn(e,t=null){const{data:a,error:n}=await i.from("auction_bids").select("*").eq("player_id",e).order("created_at",{ascending:!1}).limit(2);if(n)throw n;if(!a||a.length===0)return;const{error:o}=await i.from("auction_bids").delete().eq("id",a[0].id);if(o)throw o;const s=a[1],{data:l}=await i.from("auction_players").select("base_price").eq("id",e).single(),d=t?"auctions":"auction_state",c=t||1,{error:u}=await i.from(d).update({current_bid:s?s.amount:(l==null?void 0:l.base_price)||0,current_team_id:s?s.team_id:null}).eq("id",c);if(u)throw u}async function un(e,t,a,n=null){const{error:o}=await i.from("auction_players").update({status:"sold",sold_price:a,sold_team_id:t,sold_at:new Date().toISOString()}).eq("id",e);if(o)throw o;const{data:s,error:l}=await i.from("auction_teams").select("purse_remaining, name").eq("id",t).single();if(l)throw l;const{error:d}=await i.from("auction_teams").update({purse_remaining:s.purse_remaining-a}).eq("id",t);if(d)throw d;const{data:c}=await i.from("auction_players").select("name").eq("id",e).maybeSingle();c!=null&&c.name&&await Q(null,"auction_sold",`${c.name} sold to ${s.name} for ₹${a}`),await Ue(e,n)}async function pn(e,t=null){const{error:a}=await i.from("auction_players").update({status:"unsold"}).eq("id",e);if(a)throw a;await Ue(e,t)}async function Ue(e,t=null){const a=await ce(t),n=Me(a,e),o=t?"auctions":"auction_state",s=t||1;if(!n){const{error:d}=await i.from(o).update({status:"completed",current_player_id:null,current_bid:0,current_team_id:null}).eq("id",s);if(d)throw d;return}const{error:l}=await i.from(o).update({current_player_id:n.id,current_bid:n.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function fn(e,t=null){const{data:a,error:n}=await i.from("auction_players").select("base_price").eq("id",e).single();if(n)throw n;const o=t?"auctions":"auction_state",s=t||1,{error:l}=await i.from(o).update({current_player_id:e,current_bid:a.base_price||0,current_team_id:null}).eq("id",s);if(l)throw l}async function mn(e,t=null){let a=i.from("auction_bids").select("*, auction_teams(name)").eq("player_id",e).order("created_at",{ascending:!1});t&&(a=a.eq("auction_id",t));const{data:n,error:o}=await a;if(o)throw o;return n}async function gn(){const e=await X(),t=e==null?void 0:e.platform_upi_id;return t&&t!=="9897439743@okbizaxis"?t:"9897439743@pz"}async function hn(e){await I("platform_upi_id",e)}function M(e){var t;return e&&(e.organized_by||(e.logo_url&&e.logo_url.startsWith("org:")?e.organized_by=e.logo_url.replace(/^org:/,"").trim():(t=e.players)!=null&&t.name&&(e.organized_by=e.players.name)),e)}async function yn({name:e,organizerId:t,location:a,auctionDate:n,auctionTime:o,planTier:s,maxTeams:l,pointsPurse:d,amountDue:c,playerEntryFee:u=0,organizerUpiId:p=null,organizerPaymentPhone:f=null,organizedBy:b=null}){var x,F,S,z;const y=c>0?"pending":"free",m=b?b.trim():null,h={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:o||null,plan_tier:s,max_teams:l,points_purse:d||null,amount_due:c||0,payment_status:y};u!==void 0&&(h.player_entry_fee=u?Number(u):0),p&&(h.organizer_upi_id=p.trim()),f&&(h.organizer_payment_phone=f.trim()),m&&(h.organized_by=m,h.logo_url=`org:${m}`);let{data:w,error:C}=await i.from("auctions").insert(h).select().single();if(C&&((x=C.message)!=null&&x.includes("player_entry_fee")||(F=C.message)!=null&&F.includes("organizer_upi_id")||(S=C.message)!=null&&S.includes("organizer_payment_phone")||(z=C.message)!=null&&z.includes("organized_by"))){console.warn("Retrying createAuction without unrecognized columns:",C.message);const P={name:e,organizer_id:t||null,location:a||null,auction_date:n||null,auction_time:o||null,plan_tier:s,max_teams:l,points_purse:d||null,amount_due:c||0,payment_status:y,logo_url:m?`org:${m}`:null},$=await i.from("auctions").insert(P).select().single();if($.error)throw $.error;w=$.data}else if(C)throw C;return m&&(w!=null&&w.id)&&(I(`auction_org_${w.id}`,m).catch(()=>{}),w.auction_code&&I(`auction_org_${w.auction_code}`,m).catch(()=>{})),c>0&&await H("auction_payment_pending",`New auction "${e}" awaiting payment confirmation (₹${c})`),M(w)}async function xn(e,t={}){var l;const a={};t.auctionDate!==void 0&&(a.auction_date=t.auctionDate||null),t.auction_date!==void 0&&(a.auction_date=t.auction_date||null),t.auctionTime!==void 0&&(a.auction_time=t.auctionTime||null),t.auction_time!==void 0&&(a.auction_time=t.auction_time||null),t.name!==void 0&&(a.name=t.name.trim()),t.location!==void 0&&(a.location=t.location?t.location.trim():null),t.pointsPurse!==void 0&&(a.points_purse=t.pointsPurse?Number(t.pointsPurse):null),t.points_purse!==void 0&&(a.points_purse=t.points_purse?Number(t.points_purse):null),t.bidIncrement!==void 0&&(a.bid_increment=t.bidIncrement?Number(t.bidIncrement):1e3),t.bid_increment!==void 0&&(a.bid_increment=t.bid_increment?Number(t.bid_increment):1e3);const n=t.organizedBy?t.organizedBy.trim():t.organized_by?t.organized_by.trim():null;n!==null&&(a.organized_by=n,a.logo_url=`org:${n}`);let{data:o,error:s}=await i.from("auctions").update(a).eq("id",e).select().single();if(s&&((l=s.message)!=null&&l.includes("organized_by"))){delete a.organized_by;const d=await i.from("auctions").update(a).eq("id",e).select().single();if(d.error)throw d.error;o=d.data}else if(s)throw s;return n&&e&&(I(`auction_org_${e}`,n).catch(()=>{}),o!=null&&o.auction_code&&I(`auction_org_${o.auction_code}`,n).catch(()=>{})),M(o)}async function bn(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("organizer_id",e).order("created_at",{ascending:!1});if(a)throw a;return t}async function wn(){const{data:e,error:t}=await i.from("auction_teams").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function _n(){const{data:e,error:t}=await i.from("auction_players").select("auction_id");if(t)throw t;const a={};return(e||[]).forEach(n=>{n.auction_id&&(a[n.auction_id]=(a[n.auction_id]||0)+1)}),a}async function Fn(e){if(!e)return[];const t=e.replace(/[^0-9]/g,"").slice(-10);try{const{data:a,error:n}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time), auction_teams!sold_team_id(id, name, owner_name, captain_name)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(!n&&a){const o=a.filter(p=>p.auctions),s=o.filter(p=>p.sold_team_id).map(p=>p.sold_team_id),l=[...new Set(o.map(p=>p.auction_id).filter(Boolean))];let d=[],c=[];try{const[p,f]=await Promise.all([s.length>0?i.from("settings").select("key, value").in("key",s.map(b=>`auction_team_logo_${b}`)):Promise.resolve({data:[]}),l.length>0?i.from("auction_teams").select("id, name, owner_name, captain_name, purse_total, auction_id").in("auction_id",l):Promise.resolve({data:[]})]);d=(p==null?void 0:p.data)||[],c=(f==null?void 0:f.data)||[]}catch{}let u={};return d.forEach(p=>{u[p.key]=p.value}),o.map(p=>{var C;const f=p.auctions||{};let b=null;(C=f.logo_url)!=null&&C.startsWith("org:")&&(b=f.logo_url.replace(/^org:/,""));let y=p.auction_teams||null;const m=(p.name||"").toLowerCase().trim();if(!y&&p.auction_id&&m){const x=c.find(F=>F.auction_id===p.auction_id&&(F.captain_name&&F.captain_name.toLowerCase().trim()===m||F.owner_name&&F.owner_name.toLowerCase().trim()===m));x&&(y=x)}const h=p.status==="captain"||y&&(y.captain_name&&y.captain_name.toLowerCase().trim()===m||y.owner_name&&y.owner_name.toLowerCase().trim()===m);let w=null;return y!=null&&y.id&&(w=u[`auction_team_logo_${y.id}`]||null),{...p,status:h?"captain":p.status,is_captain:!!h,sold_team_id:(y==null?void 0:y.id)||p.sold_team_id,auctions:{...f,organized_by:b||null},auction_teams:y?{...y,logo_url:w}:null}})}}catch(a){console.warn("fetchPlayerAuctionHistory main query failed:",a)}try{const{data:a,error:n}=await i.from("auction_players").select("*, auctions(id, name, auction_code, auction_date, points_purse, status, logo_url, location, auction_time)").or(`phone.eq.${e},phone.eq.${t},phone.like.%${t}`).order("created_at",{ascending:!1});if(n)throw n;return(a||[]).filter(o=>o.auctions).map(o=>{var s;return{...o,auctions:{...o.auctions,organized_by:(s=o.auctions.logo_url)!=null&&s.startsWith("org:")?o.auctions.logo_url.replace(/^org:/,""):null}}})}catch(a){return console.warn("fetchPlayerAuctionHistory fallback failed:",a),[]}}async function vn(){const e=c=>(c||"").replace(/[^0-9]/g,"").slice(-10),[{data:t,error:a},{data:n,error:o}]=await Promise.all([i.from("auction_players").select("name, phone, birth_date, profile_image_url, city, jersey_number, jersey_size"),i.from("players").select("phone")]);if(a)throw a;if(o)throw o;const s=new Set((n||[]).map(c=>e(c.phone)));let l=0,d=0;for(const c of t||[]){const u=e(c.phone);if(!u||s.has(u)){d++;continue}try{await ie(c.name,u,"1234",null,c.birth_date,c.profile_image_url,{city:c.city,jerseyNumber:c.jersey_number,jerseySize:c.jersey_size,source:"auction"}),s.add(u),l++}catch(p){console.error(`Failed to sync ${c.name} (${u}):`,p),d++}}return{synced:l,skipped:d}}async function Sn(e){const{data:t,error:a}=await i.from("auction_sponsors").select("*").eq("auction_id",e).order("created_at",{ascending:!0});if(a)throw a;return t||[]}async function jn(e,t,a){const{data:n,error:o}=await i.from("auction_sponsors").insert({auction_id:e,name:t,logo_url:a||null}).select().single();if(o)throw o;return n}async function Cn(e){const{error:t}=await i.from("auction_sponsors").delete().eq("id",e);if(t)throw t}async function Pn(e,t){const a=e.name.split(".").pop(),n=`sponsor-logos/${(t||"sponsor").toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${a}`,{error:o}=await i.storage.from("team-assets").upload(n,e,{upsert:!0});if(o)throw o;const{data:s}=i.storage.from("team-assets").getPublicUrl(n);return s.publicUrl}async function kn(){const{data:e,error:t}=await i.from("auctions").select("*, players(name)").order("created_at",{ascending:!1});if(t)throw t;return(e||[]).map(M)}async function An(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("auction_code",e).maybeSingle();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await i.from("settings").select("value").eq("key",`auction_org_${t.id}`).maybeSingle();if(n!=null&&n.value)t.organized_by=n.value;else{const{data:o}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();o!=null&&o.value&&(t.organized_by=o.value)}}catch{}return t}async function Ge(e){const{data:t,error:a}=await i.from("auctions").select("*").eq("id",e).single();if(a)throw a;if(!t)return null;if(M(t),!t.organized_by)try{const{data:n}=await i.from("settings").select("value").eq("key",`auction_org_${e}`).maybeSingle();n!=null&&n.value&&(t.organized_by=n.value)}catch{}return t}async function zn(){const{data:e,error:t}=await i.from("auctions").select("*, players(name, phone)").eq("payment_status","pending").order("created_at",{ascending:!0});if(t)throw t;return e}async function En(e){await H("auction_payment_claimed","An organizer marked auction payment as sent — please verify and approve.")}async function Rn(e){const{error:t}=await i.from("auctions").update({payment_status:"paid"}).eq("id",e);if(t)throw t}async function qn(e){const{error:t}=await i.from("auctions").update({payment_status:"rejected"}).eq("id",e);if(t)throw t}async function $n(e){await i.from("auction_bids").delete().eq("auction_id",e),await i.from("auction_players").delete().eq("auction_id",e),await i.from("auction_teams").delete().eq("auction_id",e);const{error:t}=await i.from("auctions").delete().eq("id",e);if(t)throw t}async function Bn(e,t){const{error:a}=await i.from("players").update({role:t}).eq("id",e);if(a)throw a}const fr=Object.freeze(Object.defineProperty({__proto__:null,addAuctionSponsor:jn,addContribution:ma,addExpense:aa,addGround:$t,addPlayer:ie,addRosterPlayerToAuction:Ua,addTeam:Dt,approveAuctionPayment:Rn,approvePlayer:ua,approveProRequest:Ea,approvePublicResponse:Xt,assignCaptainToTeam:de,cancelProRequest:$e,checkAuctionPhoneExists:We,checkPlayerPhoneExists:oe,confirmPlayerToMatch:Yt,contributionExists:ha,countUnreadDirectMessages:Da,countUnreadMessages:ka,createAuction:yn,createAuctionTeam:nn,createMatch:Ot,deleteAuctionEvent:$n,deleteAuctionPlayer:Xa,deleteAuctionSponsor:Cn,deleteAuctionTeam:on,deleteContribution:ga,deleteExpense:na,deleteGround:Tt,deleteMatch:Mt,deletePlayer:Rt,deleteTeam:Nt,fetchAdminPlayerId:De,fetchAllAuctionPlayerCounts:_n,fetchAllAuctionTeamCounts:wn,fetchAllAuctions:kn,fetchAuctionBidHistory:mn,fetchAuctionByCode:An,fetchAuctionById:Ge,fetchAuctionPlayers:ce,fetchAuctionRegistrationOpen:Va,fetchAuctionSponsors:Sn,fetchAuctionState:sn,fetchAuctionTeams:an,fetchChat:ia,fetchContributions:fa,fetchConversation:Ba,fetchExpenses:ta,fetchFeedback:Oa,fetchGrounds:qt,fetchInboxMessages:Pa,fetchLeaderboard:Re,fetchMatchByToken:Wt,fetchMatchCount:Le,fetchMatchCounts:_a,fetchMatchPlayers:ze,fetchMatches:Ae,fetchMyAuctions:bn,fetchMyConfirmedPlayers:Na,fetchMyConversations:Ta,fetchMyInvites:va,fetchMyOrganizers:La,fetchMyProRequest:Be,fetchNotifications:jt,fetchOrganizerUpi:ja,fetchPayments:ra,fetchPendingAuctionPayments:zn,fetchPendingPlayers:da,fetchPendingProRequests:za,fetchPlatformUpi:gn,fetchPlayerAuctionHistory:Fn,fetchPlayerCount:Ie,fetchPlayerGrounds:$a,fetchPlayerMatchHistory:ba,fetchPlayerStats:wa,fetchPlayers:At,fetchPlayersByCreator:zt,fetchProGroupPlayers:Fa,fetchProStats:xa,fetchPublicResponses:Jt,fetchRecentActivity:St,fetchRecentlyRegistered:qa,fetchSentMessages:Ca,fetchSettings:X,fetchStats:ya,fetchTeamCount:Ne,fetchTeams:It,fetchUnreadNotificationCount:Ct,findPlayerByPhone:Oe,globalSearch:Ma,jumpToAuctionPlayer:fn,markAllNotificationsRead:kt,markAuctionPaidByOrganizer:En,markConversationRead:Ia,markMessagesRead:Aa,markNotificationRead:Pt,markPlayerSold:un,markPlayerUnsold:pn,normalizeAuctionOrganizedBy:M,notifyPlayer:Vt,placeBid:cn,promoteFromWaitlist:le,registerAuctionPlayer:Ga,registerPlayer:ca,rejectAuctionPayment:qn,rejectPlayer:pa,rejectProRequest:Ra,rejectPublicResponse:ea,removePlayerFromMatch:Kt,requestProAccess:qe,restoreAuctionPlayer:tn,sendAdminMessage:Ee,sendDirectMessage:Te,sendFeedback:Wa,sendMessage:sa,setAuctionRegistrationOpen:Ka,setPlatformUpi:hn,setPlayerAccountRole:Bn,setPlayerStatus:Zt,startAuction:ln,submitPublicResponse:Qt,subscribeToChat:la,syncAuctionPlayersToRoster:vn,tagAuctionPlayerDropped:en,toggleMatchLink:Ht,togglePayment:oa,undoLastBid:dn,updateAuction:xn,updateAuctionPlayerBasePrice:Ja,updateAuctionPlayerCategory:Qa,updateAuctionPlayerPaymentStatus:Ha,updateAuctionPlayerStatus:Ya,updateAuctionTeam:rn,updateGround:Bt,updateMatchMaxPlayers:Gt,updateMatchStatus:Ut,updatePlayer:Et,updatePlayerRole:Za,updatePlayerUpi:Sa,updateTeam:Lt,uploadPaymentReceipt:vt,uploadProfilePhoto:Ft,uploadSponsorLogo:Pn,uploadTeamLogo:se,upsertSetting:I},Symbol.toStringTag,{value:"Module"})),He="ss_home_stats_v2";function Tn(){try{const e=localStorage.getItem(He);if(e)return JSON.parse(e)}catch{}return{p:80,m:43,t:24}}function In({onLogin:e,onRegister:t}){const a=bt(),n=_.useMemo(()=>Tn(),[]),[o,s]=_.useState(n.p),[l,d]=_.useState(n.m),[c,u]=_.useState(n.t),[p,f]=_.useState({p:n.p,m:n.m,t:n.t}),[b,y]=_.useState(!1),[m,h]=_.useState(!1);_.useEffect(()=>{y(!0);let x=!1;return Promise.all([Ie().catch(()=>null),Le().catch(()=>null),Ne().catch(()=>null)]).then(([F,S,z])=>{if(x)return;const P={p:typeof F=="number"&&F>0?F:n.p,m:typeof S=="number"&&S>0?S:n.m,t:typeof z=="number"&&z>0?z:n.t};s(P.p),d(P.m),u(P.t),f(P);try{localStorage.setItem(He,JSON.stringify(P))}catch{}}),()=>{x=!0}},[n]);const w=[{icon:Xe,v:p.p,label:"Active Players",sub:"Registered Pool",color:"#166534"},{icon:ve,v:p.m,label:"Matches Played",sub:"Games & Fixtures",color:"#B8860B"},{icon:Se,v:p.t,label:"Cricket Teams",sub:"Franchises",color:"#0F766E"}],C=[{label:"Digital Player Pass",icon:et},{label:"Live Auction Console",icon:je},{label:"Grounds on Google Maps",icon:tt},{label:"Season MVP Leaderboard",icon:Ce}];return r.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 40%, #F8FAF8 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-body)",position:"relative",overflow:"hidden",padding:a?"24px 16px 36px":"40px 20px"},children:[r.jsx("div",{style:{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:a?400:700,height:a?400:700,borderRadius:"50%",background:"radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0) 70%)",pointerEvents:"none"}}),r.jsx("div",{style:{position:"fixed",bottom:"-10%",right:"-10%",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle, rgba(246,196,83,0.06) 0%, rgba(246,196,83,0) 70%)",pointerEvents:"none"}}),r.jsxs("div",{style:{width:"100%",maxWidth:520,textAlign:"center",position:"relative",zIndex:1,opacity:b?1:0,transform:b?"translateY(0)":"translateY(-8px)",transition:"opacity 300ms ease-out, transform 300ms ease-out"},children:[r.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"#FFFFFF",border:"1px solid rgba(22,101,52,0.25)",padding:"5px 14px",borderRadius:999,fontSize:11,fontWeight:800,color:"#166534",boxShadow:"0 2px 8px rgba(22,101,52,0.06)",marginBottom:16,letterSpacing:.5,textTransform:"uppercase"},children:[r.jsx("span",{style:{width:7,height:7,borderRadius:"50%",background:"#22C55E",animation:"pulse 2s infinite"}}),"Selected Sports • Cricket Platform"]}),r.jsx("div",{style:{position:"relative",display:"inline-block",margin:"0 auto 12px"},children:r.jsx("img",{src:"/logo-full.png",alt:"Selected Sports",width:a?180:210,height:a?180:210,style:{height:a?180:210,width:"auto",display:"block",margin:"0 auto",filter:"drop-shadow(0 10px 24px rgba(22,101,52,0.12))",userSelect:"none"}})}),r.jsxs("div",{style:{fontSize:a?22:25,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",letterSpacing:"-0.5px",lineHeight:1.25,marginBottom:8},children:["PLAY. COMPETE."," ",r.jsx("span",{style:{background:"linear-gradient(135deg, #166534 0%, #15803D 50%, #0F766E 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"GET RECOGNISED."})]}),r.jsx("p",{style:{color:"#64748B",fontSize:a?13:14,lineHeight:1.5,maxWidth:420,margin:"0 auto 22px"},children:"India's premier cricket community for live auction tournaments, match scheduling, digital player passes, and official player leaderboards."}),r.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20},children:w.map((x,F)=>r.jsxs("div",{style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,padding:"14px 6px",boxShadow:"0 4px 14px rgba(15,23,42,0.04)",transition:"transform 150ms ease, box-shadow 150ms ease"},children:[r.jsx("div",{style:{width:34,height:34,borderRadius:10,background:`${x.color}12`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"},children:r.jsx(x.icon,{size:17,color:x.color})}),r.jsxs("div",{style:{fontSize:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.1},children:[x.v,"+"]}),r.jsx("div",{style:{fontSize:11,fontWeight:800,color:"#0F172A",marginTop:3},children:x.label}),r.jsx("div",{style:{fontSize:9,color:"#94A3B8",marginTop:1},children:x.sub})]},F))}),r.jsx("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginBottom:24},children:C.map((x,F)=>r.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(22,101,52,0.06)",border:"1px solid rgba(22,101,52,0.18)",color:"#166534",padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:700},children:[r.jsx(x.icon,{size:13,color:"#166534"}),x.label]},F))}),r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:18},children:[r.jsxs("button",{onClick:e,style:{width:"100%",height:54,borderRadius:15,background:"linear-gradient(135deg, #166534 0%, #15803D 100%)",border:"none",color:"#FFFFFF",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",boxShadow:"0 8px 22px rgba(22,101,52,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 150ms ease, box-shadow 150ms ease"},onMouseEnter:x=>{x.currentTarget.style.transform="translateY(-2px)",x.currentTarget.style.boxShadow="0 12px 28px rgba(22,101,52,0.45)"},onMouseLeave:x=>{x.currentTarget.style.transform="translateY(0)",x.currentTarget.style.boxShadow="0 8px 22px rgba(22,101,52,0.35)"},children:[r.jsx("span",{children:"Login to Selected Sports"}),r.jsx(at,{size:17})]}),r.jsxs("button",{onClick:t,style:{width:"100%",padding:"14px 18px",borderRadius:15,background:"#FFFFFF",border:"1.5px solid #166534",color:"#166534",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 2px 8px rgba(15,23,42,0.03)",transition:"background 150ms ease"},onMouseEnter:x=>{x.currentTarget.style.background="rgba(22,101,52,0.06)"},onMouseLeave:x=>{x.currentTarget.style.background="#FFFFFF"},children:[r.jsx(nt,{size:16,color:"#166534"}),r.jsx("span",{children:"Create New Player Account"})]})]}),r.jsxs("div",{style:{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:"#64748B",marginTop:6},children:[r.jsx("span",{style:{display:"flex",alignItems:"center",gap:6},children:r.jsx("span",{children:"Want to organize an auction?"})}),r.jsx("button",{onClick:()=>h(!0),style:{background:"none",border:"none",color:"#166534",fontWeight:800,cursor:"pointer",padding:0,textDecoration:"underline"},children:"Contact Md Zeeshan ↗"})]}),r.jsx("div",{style:{fontSize:11,color:"#94A3B8",fontWeight:700,marginTop:20,letterSpacing:.5,textTransform:"uppercase"},children:"Selected Sports • Play • Compete • Get Recognised"})]}),m&&r.jsx("div",{onClick:()=>h(!1),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:r.jsxs("div",{onClick:x=>x.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:20,maxWidth:420,width:"100%",padding:24,boxShadow:"0 25px 60px rgba(15,23,42,0.3)"},children:[r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},children:[r.jsx("div",{style:{fontWeight:800,fontSize:17,fontFamily:"var(--font-head)",color:"#0F172A"},children:"Tournament Organizer Support"}),r.jsx("button",{onClick:()=>h(!1),style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"✕"})]}),r.jsx("p",{style:{fontSize:13,color:"#64748B",margin:"0 0 16px",lineHeight:1.5},children:"Want to organize an auction for your tournament, schedule matches, or need account help? Contact Md Zeeshan:"}),r.jsxs("div",{style:{background:"#F8FAF8",borderRadius:12,padding:"14px",border:"1px solid #E2E8F0",marginBottom:16},children:[r.jsx("div",{style:{fontWeight:800,fontSize:16,color:"#0F172A"},children:"Md Zeeshan"}),r.jsx("div",{style:{fontSize:12,color:"#64748B",marginTop:2},children:"Head of Tournament Operations"}),r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:15,fontWeight:800,color:"#166534"},children:[r.jsx(rt,{size:15})," 9897439743"]})]}),r.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[r.jsx("a",{href:"tel:9897439743",style:{padding:"12px",borderRadius:11,background:"#166534",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"📞 Call Now"}),r.jsx("a",{href:"https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20interested%20in%20organizing%20an%20auction%20tournament%20with%20Selected%20Sports",target:"_blank",rel:"noreferrer",style:{padding:"12px",borderRadius:11,background:"#25D366",color:"#FFFFFF",textDecoration:"none",textAlign:"center",fontSize:13,fontWeight:800},children:"WhatsApp ↗"})]})]})})]})}const Dn="9897439743",mr="9897439743@pz",be=["#1D9E75","#8B1E2E","#BA7517","#0F6E56","#7A4F13","#3B6D11","#A6192E","#5B7C4A"],Ln=e=>be[e%be.length],Nn=e=>e.split(" ").map(t=>t[0]).join("").slice(0,2).toUpperCase(),Ye=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}),gr=e=>new Date(e+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"}),hr=e=>e.our_team?`${e.our_team} vs ${e.team}`:e.team,yr=[{id:"free",label:"Free",maxTeams:3,price:0},{id:"plan2",label:"Plan 2",maxTeams:4,price:1999},{id:"plan2b",label:"Plan 2B",maxTeams:5,price:2249},{id:"plan3",label:"Plan 3",maxTeams:6,price:2499},{id:"plan4",label:"Plan 4",maxTeams:8,price:2999},{id:"plan5",label:"Plan 5",maxTeams:12,price:3999},{id:"plan6",label:"Plan 6",maxTeams:16,price:4999}],re=15,Wn=9,On=1e3;function xr(e,t,a=Wn,n=On){if(t>=a)return 0;const o=Math.max(0,a-t),l=Math.max(0,o-1)*n;return Math.max(0,(e||0)-l)}function br(){const e=new Date;return e.setFullYear(e.getFullYear()-re),e.toISOString().split("T")[0]}const wr=e=>/^[A-Za-z\s'.-]+$/.test((e||"").trim())&&(e||"").trim().length>0;function _r(e){if(!e)return"Please enter a date of birth.";const t=new Date(e+"T00:00:00");if(isNaN(t.getTime()))return"Please enter a valid date of birth.";const a=new Date;if(a.setHours(0,0,0,0),t>a)return"Date of birth can't be in the future.";let n=a.getFullYear()-t.getFullYear();const o=a.getMonth()-t.getMonth();return(o<0||o===0&&a.getDate()<t.getDate())&&n--,n<re?`Players must be at least ${re} years old to register.`:null}function Fr(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(m=>m.sold_team_id===e.id).sort((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id?1:0;return(h.is_captain||h.status==="captain"||e.captain_player_id&&h.id===e.captain_player_id?1:0)-w});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const o=m=>m==null?'""':`"${String(m).replace(/"/g,'""')}"`,s=["S.No","Player Name","Team Role","Playing Role","Jersey Number","Jersey Size","City","Date of Birth","Mobile Number","Price Paid (Coins)","Status"],l=n.map((m,h)=>{const w=m.is_captain||m.status==="captain"||e.captain_player_id&&m.id===e.captain_player_id,C=w?"Captain":"Squad Member",x=w?"0 (Captain)":`🪙 ${Number(m.sold_price||0).toLocaleString("en-IN")}`;return[h+1,o(m.name||""),o(C),o(m.playing_role||"—"),o(m.jersey_number||"—"),o(m.jersey_size||"—"),o(m.city||"—"),o(m.birth_date||"—"),o(m.phone||"—"),o(x),o(w?"Captain":m.status||"Sold")].join(",")}),d=o(`Tournament: ${a} — Team Roster: ${e.name}`),c=o(`Captain: ${e.captain_name||"—"}${e.captain_phone?` (${e.captain_phone})`:""} | Owner: ${e.owner_name||"—"}${e.owner_phone?` (${e.owner_phone})`:""} | Starting Purse: 🪙 ${Number(e.purse_total||0).toLocaleString("en-IN")} | Remaining Purse: 🪙 ${Number(e.purse_remaining||0).toLocaleString("en-IN")} | Squad: ${n.length}/9`),u=[d,c,"",s.join(","),...l].join(`\r
`),p=new Blob(["\uFEFF"+u],{type:"text/csv;charset=utf-8;"}),f=URL.createObjectURL(p),b=document.createElement("a"),y=`${(e.name||"Team").replace(/[^a-zA-Z0-9_-]/g,"_")}_Roster.csv`;b.href=f,b.download=y,document.body.appendChild(b),b.click(),document.body.removeChild(b),URL.revokeObjectURL(f)}function vr(e,t){if(!e)return;const a=window.location.origin,n=(t==null?void 0:t.auction_code)||"",o=`${a}/team-view/${n}/${e.id}`,s=(e.captain_phone||e.owner_phone||"").replace(/[^0-9]/g,"").slice(-10),l=e.captain_name||e.owner_name||e.name,c=`🏏 *${(t==null?void 0:t.name)||"Selected Sports Cricket Tournament"}*

Hi ${l},
Here is your private team link to view *${e.name}* squad, purse wallet, and live auction roster:
👉 ${o}

Good luck for the auction!`,u=s?`https://wa.me/91${s}?text=${encodeURIComponent(c)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(c)}`;window.open(u,"_blank")}function Sr(e,t,a="Cricket Tournament"){if(!e)return;const n=(t||[]).filter(p=>p.sold_team_id===e.id).sort((p,f)=>{const b=p.is_captain||p.status==="captain"||e.captain_player_id&&p.id===e.captain_player_id?1:0;return(f.is_captain||f.status==="captain"||e.captain_player_id&&f.id===e.captain_player_id?1:0)-b});if(n.length===0){alert(`No players found in ${e.name}'s squad yet. Players will appear here once acquired in the auction.`);return}const o=p=>String(p??"").replace(/[&<>"']/g,f=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[f]),s=n.map((p,f)=>{const b=p.is_captain||p.status==="captain"||e.captain_player_id&&p.id===e.captain_player_id,y=b?'<span class="captain-badge">👑 CAPTAIN</span>':'<span class="player-badge">PLAYER</span>',m=b?"🪙 0 (Captain)":`🪙 ${Number(p.sold_price||0).toLocaleString("en-IN")}`,h=p.birth_date?p.birth_date:"—";return`
      <tr>
        <td style="text-align:center;font-weight:700;color:#64748B;">${f+1}</td>
        <td>
          <div style="font-weight:800;color:#0F172A;font-size:13px;">${o(p.name||"")}</div>
        </td>
        <td>${y}</td>
        <td><strong>${o(p.playing_role||"—")}</strong></td>
        <td style="text-align:center;">${o(p.jersey_number?`#${p.jersey_number}`:"—")}${p.jersey_size?` (${o(p.jersey_size)})`:""}</td>
        <td>${o(p.city||"—")}</td>
        <td>${o(h)}</td>
        <td><strong style="color:#166534;">${o(p.phone||"—")}</strong></td>
        <td style="font-weight:800;color:#166534;text-align:right;">${m}</td>
        <td style="text-align:center;"><span class="status-sold">${o(b?"Captain":"Sold")}</span></td>
      </tr>
    `}).join(""),l=(e.purse_total||0)-(e.purse_remaining||0),d=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),c=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${o(e.name)} — Official Team Roster</title>
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
        <div class="tournament-tag">${o(a||"Selected Sports Cricket Tournament")}</div>
        <h1 class="team-title">${o(e.name)}</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:800;color:#0F172A;">OFFICIAL SQUAD ROSTER</div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${d}</div>
      <div style="font-size:10px;color:#166534;font-weight:700;margin-top:2px;">Squad Size: ${n.length} / 9 Players</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Team Captain</span>
      <span class="meta-val">👑 ${o(e.captain_name||"—")}</span>
      ${e.captain_phone?`<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${o(e.captain_phone)}</span>`:""}
    </div>
    <div class="meta-item">
      <span class="meta-label">Team Owner</span>
      <span class="meta-val">${o(e.owner_name||"—")}</span>
      ${e.owner_phone?`<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${o(e.owner_phone)}</span>`:""}
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
</html>`,u=window.open("","_blank");if(!u){alert("Please allow pop-ups to open the PDF export.");return}u.document.write(c),u.document.close(),u.onload=()=>{setTimeout(()=>{u.print()},250)}}const Mn=[{name:"Shinde High School Cricket Ground",location:"Sahakar Nagar, Pune"},{name:"Poona Club Cricket Ground",location:"Camp, Pune"},{name:"PYC Hindu Gymkhana",location:"Deccan Gymkhana, Pune"},{name:"Law College Cricket Ground",location:"Erandwane, Pune"},{name:"Deccan Gymkhana Cricket Ground",location:"Deccan, Pune"},{name:"Nehru Stadium",location:"Swargate, Pune"},{name:"Fergusson College Ground",location:"FC Road, Pune"},{name:"SP College Ground",location:"Sadashiv Peth, Pune"},{name:"Eagle Turf",location:"Khadi Machine Chowk, Pune"},{name:"MM Turf Play Ground",location:"Parge Nagar, Pune"},{name:"Parge Play On",location:"Parge Nagar, Pune"},{name:"Anfield Turf",location:"Mohammadwadi, Pune"},{name:"Kanade Sports Club - Full Ground",location:"Pisoli, Pune"},{name:"Kanade Sports Club - Single",location:"Undri, Pune"},{name:"Kanade Sports Club - Indoor",location:"Pisoli, Pune"},{name:"Blades Cricket Ground",location:"Bavdhan, Pune"},{name:"Legends Cricket Ground",location:"Hadapsar, Pune"},{name:"Champions Turf & Cricket Ground",location:"Viman Nagar, Pune"},{name:"The Turf",location:"Baner, Pune"},{name:"Oxford Cricket Resort Ground",location:"Bavdhan, Pune"},{name:"Kharadi Sports Complex Cricket Ground",location:"Kharadi, Pune"},{name:"Wakad Cricket Ground",location:"Wakad, Pune"},{name:"DY Patil Cricket Stadium",location:"Akurdi, Pune"},{name:"Telco Cricket Ground",location:"Pimpri-Chinchwad, Pune"}];async function Un(e="",t="Pune",a="Maharashtra"){const n=(e||"").trim(),o=(t||"Pune").trim(),s=(a||"Maharashtra").trim(),l=[],d=new Set;if(!o||o.toLowerCase()==="pune"){const c=Mn.filter(u=>{if(!n)return!0;const p=n.toLowerCase();return u.name.toLowerCase().includes(p)||u.location.toLowerCase().includes(p)});for(const u of c)d.has(u.name.toLowerCase())||(d.add(u.name.toLowerCase()),l.push({name:u.name,location:u.location,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.name+" "+u.location)}`,isCurated:!0}))}try{const c=n?`${n} cricket ground ${o} ${s}`:`cricket ground in ${o} ${s}`,u=`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c)}&limit=10&addressdetails=1`,p=await fetch(u,{headers:{Accept:"application/json"}});if(p.ok){const f=await p.json();for(const b of f||[]){const m=(b.name||(b.display_name?b.display_name.split(",")[0]:"")).replace(/,\s*India$/i,"").trim();if(m&&!d.has(m.toLowerCase())){d.add(m.toLowerCase());const h=b.address||{},C=`${h.suburb||h.neighbourhood||h.residential||h.city_district||o}, ${o}`;l.push({name:m,location:C,maps_link:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m+" "+o)}`,isMap:!0})}}}}catch(c){console.warn("Map grounds search failed:",c)}return l}async function jr(e=""){return Un(e,"Pune","Maharashtra")}function Cr(e,t){if(!e)return"";const n=`${t||(typeof window<"u"?window.location.origin:"https://selectedsports.github.io")}/auction-register/${e.auction_code||""}`,o=e.auction_date?Ye(e.auction_date):"To Be Announced",s=e.auction_time||"To Be Announced",l=e.location||"Ground / Venue to be confirmed",d=e.organized_by?`
🛡️ *Organized By:* ${e.organized_by}`:"",u=`₹${Number(e.player_entry_fee)>0?Number(e.player_entry_fee):180}`;return`🏏 *PLAYER REGISTRATION OPEN — ${(e.name||"CRICKET TOURNAMENT").toUpperCase()}* 🏏${d}

📅 *Auction Date:* ${o}
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
🔗 ${n}

⚡ _Register and transfer the entry fee before the deadline to ensure your spot in the auction!_
🏆 *Selected Sports Cricket Platform*`}function Pr(e,t){if(!t||t.length===0){alert("No players in the auction pool to export.");return}const a=["Lot No","Player Name","Player Type / Role","City","Base Price (Coins)","Category"],n=t.map((c,u)=>{const p=f=>`"${String(f??"").replace(/"/g,'""')}"`;return[u+1,p(c.name||""),p(c.playing_role||"—"),p(c.city||"—"),c.base_price??0,p(c.category||"—")].join(",")}),o="data:text/csv;charset=utf-8,\uFEFF"+[a.join(","),...n].join(`\r
`),s=encodeURI(o),l=document.createElement("a"),d=`${((e==null?void 0:e.name)||"Auction").replace(/[^a-zA-Z0-9_-]/g,"_")}_Player_Pool_${t.length}_Players.csv`;l.setAttribute("href",s),l.setAttribute("download",d),document.body.appendChild(l),l.click(),document.body.removeChild(l)}function Gn(e,t){if(!t||t.length===0)return"";const a=(e==null?void 0:e.name)||"Cricket Tournament Auction",n=e!=null&&e.auction_date?Ye(e.auction_date):"Upcoming",o=(e==null?void 0:e.auction_time)||"8:00 PM IST",s=(e==null?void 0:e.location)||"Venue TBD",l={"All-rounder":[],Batsman:[],Bowler:[],Wicketkeeper:[],Other:[]};t.forEach(p=>{const f=(p.playing_role||"").toLowerCase();f.includes("all")?l["All-rounder"].push(p):f.includes("bat")?l.Batsman.push(p):f.includes("bowl")?l.Bowler.push(p):f.includes("keep")||f.includes("wk")?l.Wicketkeeper.push(p):l.Other.push(p)});let d=`🏏 *OFFICIAL AUCTION PLAYER POOL — FOR CAPTAINS*
`;d+=`🏆 *${a}*
`,d+=`👥 *Total Players in Pool:* ${t.length} Players
`,d+=`📅 *Auction Date:* ${n} · ${o}
`,d+=`📍 *Venue:* ${s}

`,d+=`Dear Captains & Franchise Owners,
`,d+=`Here is the official list of ${t.length} players available in the auction pool for your pre-bidding strategy & purse allocation:

`;let c=1;const u=(p,f)=>{if(f.length===0)return"";let b=`*${p.toUpperCase()} (${f.length}):*
`;return f.forEach(y=>{const m=y.city?` · ${y.city}`:"",h=` · Base: 🪙 ${Number(y.base_price||0).toLocaleString("en-IN")}`;b+=`${c}. *${y.name}*${m}${h}
`,c++}),b+=`
`,b};return d+=u("🏏 All-Rounders",l["All-rounder"]),d+=u("⚡ Batsmen",l.Batsman),d+=u("🎯 Bowlers",l.Bowler),d+=u("🧤 Wicketkeepers",l.Wicketkeeper),l.Other.length>0&&(d+=u("👥 Other Players",l.Other)),d+=`🎯 *Captains, analyze your squad composition & coin reserves before the live auction stage!*
`,d+=`🔒 _Note: Player contact numbers are strictly confidential and withheld for player privacy._
`,d+="🏆 *Selected Sports Auction Platform*",d}function kr(e,t){const a=Gn(e,t);if(!a)return;const n=`https://api.whatsapp.com/send?text=${encodeURIComponent(a)}`;window.open(n,"_blank")}function Ar(e,t){if(!t||t.length===0){alert("No players found in the auction pool to export.");return}const a=m=>String(m??"").replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[h]),n=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),o=(e==null?void 0:e.name)||"Selected Sports Cricket Auction",s=t.reduce((m,h)=>m+(Number(h.base_price)||0),0);let l=0,d=0,c=0,u=0;t.forEach(m=>{const h=(m.playing_role||"").toLowerCase();h.includes("all")?l++:h.includes("bat")?d++:h.includes("bowl")?c++:(h.includes("keep")||h.includes("wk"))&&u++});const p=t.map((m,h)=>{const w=h+1,C=m.playing_role||"Player",x=C.toLowerCase();let F="role-other",S="🏏";x.includes("all")?(F="role-all",S="🏏"):x.includes("bat")?(F="role-bat",S="⚡"):x.includes("bowl")?(F="role-bowl",S="🎯"):(x.includes("keep")||x.includes("wk"))&&(F="role-keep",S="🧤");const z=(m.name||"?").slice(0,1).toUpperCase(),P=m.profile_image_url?`<img src="${a(m.profile_image_url)}" alt="${a(m.name)}" class="player-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="player-initials-fallback" style="display:none;">${a(z)}</div>`:`<div class="player-initials-fallback">${a(z)}</div>`;return`
      <div class="player-card">
        <div class="card-top">
          <span class="lot-badge">#${w<10?"0"+w:w}</span>
          <span class="role-badge ${F}">${S} ${a(C)}</span>
        </div>
        <div class="photo-container">
          ${P}
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
    `}).join(""),f=t.map((m,h)=>{const w=h+1,C=(m.name||"?").slice(0,1).toUpperCase(),x=m.profile_image_url?`<img src="${a(m.profile_image_url)}" alt="${a(m.name)}" class="table-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" /><span class="table-thumb-fallback" style="display:none;">${a(C)}</span>`:`<span class="table-thumb-fallback">${a(C)}</span>`;return`
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
  <title>${a(o)} — Official Auction Player Pool (${t.length} Players)</title>
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
        <div class="tour-tag">${a(o)}</div>
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
</html>`,y=window.open("","_blank");if(!y){alert("Please allow pop-ups to open the PDF export.");return}y.document.write(b),y.document.close(),y.onload=()=>{setTimeout(()=>{try{y.print()}catch{}},350)}}function Hn({size:e=36}){return r.jsx("img",{src:"/logo-icon-v4.png",alt:"Selected Sports",style:{height:e,width:"auto",display:"block"}})}function zr({size:e=40}){return r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[r.jsx(Hn,{size:e}),r.jsxs("div",{children:[r.jsx("div",{style:{color:"#0F172A",fontFamily:"var(--font-head)",fontWeight:700,fontSize:e*.44,letterSpacing:"-0.5px",lineHeight:1.1},children:"Selected"}),r.jsx("div",{style:{color:"#B8860B",fontFamily:"var(--font-head)",fontWeight:600,fontSize:e*.27,letterSpacing:"2.5px",textTransform:"uppercase",lineHeight:1.1},children:"Sports"})]})]})}function U({name:e,id:t,sz:a=34}){return r.jsx("div",{style:{width:a,height:a,borderRadius:"50%",background:Ln(t),display:"flex",alignItems:"center",justifyContent:"center",fontSize:a*.3,fontWeight:700,color:"#0F172A",flexShrink:0,letterSpacing:"-0.5px",fontFamily:"var(--font-head)"},children:Nn(e)})}const we={green:{bg:"rgba(25,182,106,0.12)",tx:"rgba(34,197,94,0.15)"},lime:{bg:"rgba(132,204,22,0.12)",tx:"#4D7C0F"},yellow:{bg:"rgba(244,180,0,0.12)",tx:"rgba(246,196,83,0.15)"},red:{bg:"rgba(229,57,53,0.1)",tx:"rgba(231,76,60,0.15)"},blue:{bg:"rgba(37,95,184,0.1)",tx:"#FFFFFF"},teal:{bg:"rgba(20,184,166,0.12)",tx:"#0F766E"},orange:{bg:"rgba(251,146,60,0.12)",tx:"rgba(251,146,60,0.15)"},purple:{bg:"rgba(167,139,250,0.12)",tx:"rgba(91,33,182,0.12)"},gray:{bg:"#F8FAF8",tx:"#F8FAF8"}},_e={founder:{label:"Founder",icon:ke,bg:"linear-gradient(135deg,#FBBF24,#D4A017)",color:"#FFFFFF"},organizer:{label:"Organizer",icon:ut,bg:"#166534",color:"#FFFFFF"},pro:{label:"PRO",icon:dt,bg:"#FFFFFF",color:"#2563EB",border:"1.5px solid #2563EB"},player:{label:"Player",icon:ve,bg:"#22C55E",color:"#FFFFFF"},guest:{label:"Guest",icon:ct,bg:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0"}};function Fe({role:e="player",size:t="md"}){const[a,n]=_.useState(!1);_.useEffect(()=>{const l=setTimeout(()=>n(!0),10);return()=>clearTimeout(l)},[]);const o=_e[e]||_e.player,s=t==="sm";return r.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:s?4:6,padding:s?"3px 9px":"5px 13px",borderRadius:999,background:o.bg,color:o.color,border:o.border||"none",fontSize:s?10:12,fontWeight:700,fontFamily:"var(--font-body)",boxShadow:"0 2px 6px rgba(15,23,42,0.12)",whiteSpace:"nowrap",opacity:a?1:0,transform:a?"scale(1)":"scale(0.95)",transition:"opacity 250ms, transform 250ms"},children:[r.jsx(o.icon,{size:s?11:13}),o.label]})}function Er({children:e,col:t="gray"}){const a=we[t]||we.gray;return r.jsx("span",{style:{background:a.bg,color:a.tx,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-block",fontFamily:"var(--font-head)"},children:e})}function Rr({children:e,onClick:t,variant:a="primary",size:n="md",disabled:o=!1,style:s={}}){const l={border:"none",borderRadius:10,cursor:o?"not-allowed":"pointer",fontWeight:600,fontFamily:"var(--font-body)",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,opacity:o?.55:1},d={primary:{background:"linear-gradient(135deg,#166534,#FFFFFF)",color:"#0F172A"},green:{background:"#166534",color:"#0F172A"},danger:{background:"rgba(229,57,53,0.1)",color:"#DC2626",border:"1px solid rgba(229,57,53,0.3)"},ghost:{background:"#F8FAF8",color:"#0F172A"},wa:{background:"rgba(25,182,106,0.12)",color:"#166534",border:"1px solid rgba(25,182,106,0.3)"},outline:{background:"transparent",color:"#166534",border:"1.5px solid #166534"},dark:{background:"#FFFFFF",color:"#0F172A",border:"none"}},c={sm:{padding:"5px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};return r.jsx("button",{onClick:o?void 0:t,style:{...l,...d[a],...c[n],...s},children:e})}function G(){return r.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:48},children:[r.jsx("div",{style:{width:32,height:32,borderRadius:"50%",border:"3px solid #E2E8F0",borderTopColor:"#166534",animation:"spin 0.7s linear infinite"}}),r.jsx("style",{children:"@keyframes spin{to{transform:rotate(360deg)}}"})]})}function K({children:e,style:t={},onClick:a}){return r.jsx("div",{onClick:a,style:{background:"#FFFFFF",borderRadius:16,border:"1.5px solid #E2E8F0",boxShadow:"0 1px 4px rgba(37,95,184,0.06)",...t},children:e})}function qr({messages:e,onClose:t,player:a}){const[n,o]=_.useState(""),[s,l]=_.useState(!1),[d,c]=_.useState(!1),[u,p]=_.useState(null),[f,b]=_.useState([]),[y,m]=_.useState(!1),h=async()=>{if(!(!n.trim()||!a)){l(!0);try{const x=await De();x&&(await Te(a.id,x,n.trim()),c(!0),o(""))}catch(x){alert(x.message)}l(!1)}},w=x=>{const F=x.match(/\[\[match:([a-zA-Z0-9-]+)\]\]/);return{clean:x.replace(/\[\[match:[a-zA-Z0-9-]+\]\]/,"").trim(),matchId:F?F[1]:null}},C=async x=>{p(x),m(!0);try{b(await ze(x))}catch(F){alert(F.message)}m(!1)};if(u){const x=f.filter(S=>S.status==="confirmed"),F=f.filter(S=>S.status==="waitlist");return r.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:r.jsxs("div",{onClick:S=>S.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[r.jsxs("button",{onClick:()=>p(null),style:{background:"transparent",border:"none",fontSize:13,fontWeight:700,color:"#166534",cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0},children:[r.jsx(pt,{size:15})," Back"]}),r.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),y?r.jsx(G,{}):r.jsxs(r.Fragment,{children:[r.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:10,fontFamily:"var(--font-head)"},children:["Confirmed (",x.length,")"]}),r.jsx("div",{style:{marginBottom:18},children:x.length===0?r.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one confirmed yet."}):x.map(S=>{var z,P;return r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[r.jsx(U,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),r.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((P=S.players)==null?void 0:P.name)||"Player"})]},S.id)})}),r.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#B8860B",marginBottom:10,fontFamily:"var(--font-head)"},children:["Waitlist (",F.length,")"]}),r.jsx("div",{children:F.length===0?r.jsx("div",{style:{color:"#94A3B8",fontSize:12},children:"No one on the waitlist."}):F.map(S=>{var z,P;return r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"7px 0"},children:[r.jsx(U,{name:((z=S.players)==null?void 0:z.name)||"Player",id:S.player_id,sz:28}),r.jsx("span",{style:{fontSize:13,color:"#0F172A",fontWeight:600},children:((P=S.players)==null?void 0:P.name)||"Player"})]},S.id)})})]})]})})}return r.jsx("div",{onClick:t,style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16},children:r.jsxs("div",{onClick:x=>x.stopPropagation(),style:{background:"#FFFFFF",border:"1.5px solid #E2E8F0",borderRadius:16,maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,boxShadow:"0 24px 60px rgba(15,23,42,0.35)"},children:[r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},children:[r.jsxs("div",{style:{fontWeight:700,fontSize:16,fontFamily:"var(--font-head)",color:"#0F172A",display:"flex",alignItems:"center",gap:8},children:[r.jsx(ft,{size:18})," Messages"]}),r.jsx("button",{onClick:t,style:{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#64748B"},children:"×"})]}),e.length===0&&r.jsx("div",{style:{color:"#64748B",fontSize:13,textAlign:"center",padding:"20px 0"},children:"No messages yet."}),e.map(x=>{const{clean:F,matchId:S}=w(x.message);return r.jsxs("div",{onClick:S?()=>C(S):void 0,style:{padding:"12px 0",borderBottom:"1px solid #E2E8F0",cursor:S?"pointer":"default"},children:[r.jsx("div",{style:{fontSize:13,color:"#0F172A",lineHeight:1.5},children:F}),r.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:5,display:"flex",alignItems:"center",gap:6},children:["From ",x.sender," · ",x.created_at?new Date(x.created_at).toLocaleString():"",S&&r.jsxs("span",{style:{color:"#166534",fontWeight:700,display:"flex",alignItems:"center",gap:2},children:["· View squad ",r.jsx(Pe,{size:11})]})]})]},x.id)}),a&&r.jsxs("div",{style:{marginTop:14,paddingTop:14,borderTop:"1.5px solid #E2E8F0"},children:[r.jsx("div",{style:{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:8},children:"Reply to Admin"}),d&&r.jsx("div",{style:{fontSize:12,color:"#166534",marginBottom:8},children:"✓ Sent! Full conversation is in Direct Messages."}),r.jsxs("div",{style:{display:"flex",gap:8},children:[r.jsx("input",{value:n,onChange:x=>o(x.target.value),onKeyDown:x=>x.key==="Enter"&&h(),placeholder:"Type a reply...",style:{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #E2E8F0",background:"#F8FAF8",color:"#0F172A",fontSize:13,outline:"none",fontFamily:"var(--font-body)"}}),r.jsx("button",{onClick:h,disabled:s,style:{padding:"9px 14px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:600},children:s?"...":"Send"})]})]})]})})}function $r({isMobile:e,myId:t}){var me;const[n,o]=_.useState([]),[s,l]=_.useState(!0),[d,c]=_.useState(null),[u,p]=_.useState(!1),[f,b]=_.useState(!1),[y,m]=_.useState("points"),[h,w]=_.useState("all"),[C,x]=_.useState(!1),[F,S]=_.useState("all"),[z,P]=_.useState(!1),[$,A]=_.useState(""),[k,B]=_.useState(null);if(_.useEffect(()=>{Re().then(g=>{o(g),setTimeout(()=>p(!0),50),g.length>0&&(b(!0),setTimeout(()=>b(!1),2200))}).catch(g=>c(g.message||String(g))).finally(()=>l(!1))},[]),s)return r.jsx(G,{});const W=Array.from(new Set(n.map(g=>{var v;return(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)}).filter(Boolean))).sort().reverse(),N=n.filter(g=>{var v,R;return!(h!=="all"&&(((v=g.matches)==null?void 0:v.date)||"").slice(0,4)!==h||F!=="all"&&(((R=g.players)==null?void 0:R.role)||"player")!==F)}),j={};N.forEach(g=>{const v=g.players;v&&(j[v.id]||(j[v.id]={id:v.id,name:v.name,city:v.city,role:v.role,profile_image_url:v.profile_image_url,matchesPlayed:0,matches:[],earliestConfirmedAt:g.created_at}),j[v.id].matchesPlayed++,g.matches&&j[v.id].matches.push({...g.matches,confirmedAt:g.created_at}),g.created_at&&(!j[v.id].earliestConfirmedAt||g.created_at<j[v.id].earliestConfirmedAt)&&(j[v.id].earliestConfirmedAt=g.created_at))});const q=Object.values(j).map(g=>({...g,points:g.matchesPlayed*20})).sort((g,v)=>v.points!==g.points?v.points-g.points:g.earliestConfirmedAt?v.earliestConfirmedAt?new Date(g.earliestConfirmedAt)-new Date(v.earliestConfirmedAt):-1:1),T=$.trim().toLowerCase(),Ke=q.filter(g=>!T||g.name.toLowerCase().includes(T)||(g.city||"").toLowerCase().includes(T)),Y=q.slice(0,3),fe=T?Ke:q.slice(3),V=t?q.findIndex(g=>g.id===t):-1,Ze={1:{title:"👑 MVP · CHAMPION",border:"2px solid #F59E0B",bg:"linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.03) 100%)",badgeBg:"linear-gradient(135deg, #F59E0B, #D97706)",glow:"0 10px 28px rgba(245,158,11,0.28)",avatarBorder:"#F59E0B",avatarGlow:"0 0 20px rgba(245,158,11,0.4)"},2:{title:"🥈 2ND PLACE",border:"1.5px solid #CBD5E1",bg:"linear-gradient(180deg, rgba(241,245,249,0.9) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #94A3B8, #64748B)",glow:"0 8px 20px rgba(100,116,139,0.15)",avatarBorder:"#94A3B8",avatarGlow:"none"},3:{title:"🥉 3RD PLACE",border:"1.5px solid #FDE68A",bg:"linear-gradient(180deg, rgba(254,243,199,0.5) 0%, rgba(255,255,255,0.8) 100%)",badgeBg:"linear-gradient(135deg, #D97706, #B45309)",glow:"0 8px 20px rgba(180,83,9,0.15)",avatarBorder:"#D97706",avatarGlow:"none"}},te=({p:g,rank:v})=>{if(!g)return r.jsx("div",{style:{flex:1}});const R=Ze[v],E=v===1;return r.jsxs("div",{onClick:()=>B(g),style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",opacity:u?1:0,transform:u?E?"translateY(-6px) scale(1.02)":"translateY(0) scale(1)":"translateY(24px) scale(0.95)",transition:`all 350ms cubic-bezier(0.16, 1, 0.3, 1) ${v===1?200:v===2?100:0}ms`,zIndex:E?3:2},children:[E&&r.jsxs("div",{style:{background:R.badgeBg,color:"#FFFFFF",fontSize:10,fontWeight:900,padding:"4px 12px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:5,marginBottom:8,boxShadow:"0 4px 12px rgba(245,158,11,0.4)",letterSpacing:.5,fontFamily:"var(--font-head)"},children:[r.jsx(ke,{size:12,fill:"#FFFFFF"})," MVP · RANK 1"]}),r.jsxs("div",{style:{position:"relative",padding:E?e?"18px 10px 16px":"24px 16px 20px":e?"14px 8px 12px":"18px 12px 16px",borderRadius:20,background:R.bg,border:R.border,width:"100%",textAlign:"center",boxShadow:R.glow,boxSizing:"border-box"},children:[r.jsxs("div",{style:{position:"relative",display:"inline-block",marginBottom:10},children:[r.jsx("div",{style:{borderRadius:"50%",boxShadow:R.avatarGlow,padding:2,background:"#FFFFFF",border:`2px solid ${R.avatarBorder}`},children:g.profile_image_url?r.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:E?e?54:68:e?42:52,height:E?e?54:68:e?42:52,borderRadius:"50%",objectFit:"cover",display:"block"}}):r.jsx(U,{name:g.name,id:g.id,sz:E?e?54:68:e?42:52})}),r.jsx("div",{style:{position:"absolute",bottom:-4,right:-4,width:E?24:20,height:E?24:20,borderRadius:"50%",background:R.badgeBg,color:"#FFFFFF",fontSize:E?12:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #FFFFFF",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"},children:v})]}),r.jsx("div",{style:{fontWeight:800,fontSize:E?e?13:15:e?12:13,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:g.name}),r.jsxs("div",{style:{marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:4},children:[g.role&&g.role!=="player"?r.jsx(Fe,{role:g.role,size:"sm"}):r.jsx("span",{style:{fontSize:9.5,fontWeight:800,background:"rgba(22,101,52,0.1)",color:"#166534",padding:"1px 6px",borderRadius:4},children:"PLAYER"}),g.city&&!e&&r.jsxs("span",{style:{fontSize:10,color:"#94A3B8"},children:["· ",g.city]})]}),r.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:4,fontWeight:600},children:[g.matchesPlayed," Matches"]}),r.jsxs("div",{style:{fontSize:E?e?18:22:e?15:18,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3},children:[r.jsx("span",{children:g.points}),r.jsx("span",{style:{fontSize:10,fontWeight:800,color:"#94A3B8"},children:"PTS"})]})]})]})},Je=({i:g})=>{const v=["#F59E0B","#166534","#22C55E","#FBBF24","#3B82F6"],R=Math.random()*100,E=Math.random()*300,ne=1200+Math.random()*600,O=Math.random()*360,Qe=v[g%v.length];return r.jsx("div",{style:{position:"absolute",top:-10,left:R+"%",width:8,height:8,background:Qe,borderRadius:g%2===0?"50%":2,animation:`confettiFall ${ne}ms ease-in ${E}ms forwards`,transform:`rotate(${O}deg)`}})},ae=({label:g,desc:v})=>r.jsxs(K,{style:{padding:"44px 20px",textAlign:"center",borderRadius:16},children:[r.jsx("div",{style:{width:56,height:56,borderRadius:"50%",background:"#F8FAF8",border:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"},children:r.jsx(he,{size:26,color:"#94A3B8"})}),r.jsxs("div",{style:{fontWeight:900,fontSize:16,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)"},children:[g," Leaderboard Coming Soon"]}),r.jsx("div",{style:{color:"#64748B",fontSize:13,maxWidth:360,margin:"0 auto",lineHeight:1.5},children:v||"Individual batting and bowling statistics will populate automatically once ball-by-ball live match scoring is active."})]});return r.jsxs("div",{style:{position:"relative"},children:[r.jsx("style",{children:`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(260px) rotate(320deg); }
        }
      `}),f&&r.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:260,overflow:"hidden",pointerEvents:"none",zIndex:10},children:Array.from({length:36}).map((g,v)=>r.jsx(Je,{i:v},v))}),r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:e?"flex-start":"center",marginBottom:16,gap:12,flexDirection:e?"column":"row",flexWrap:"wrap"},children:[r.jsx("div",{children:r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[r.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg, rgba(245,158,11,0.15), rgba(22,101,52,0.1))",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center"},children:r.jsx(Se,{size:20,color:"#D97706"})}),r.jsxs("div",{children:[r.jsx("h2",{style:{fontFamily:"var(--font-head)",color:"#0F172A",fontSize:e?19:22,margin:0,fontWeight:900,letterSpacing:"-0.4px"},children:"Player Leaderboard"}),r.jsx("div",{style:{fontSize:11.5,color:"#64748B",marginTop:2},children:"Official community rankings calculated from verified match appearances (20 PTS / Match)"})]})]})}),r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,width:e?"100%":"auto",flexWrap:"wrap"},children:[r.jsxs("div",{style:{position:"relative"},children:[r.jsxs("button",{type:"button",onClick:()=>{x(g=>!g),P(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[r.jsx(ot,{size:13,color:"#166534"}),r.jsx("span",{children:h==="all"?"All Seasons":`Season ${h}`}),r.jsx(ge,{size:13,color:"#94A3B8"})]}),C&&r.jsxs("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[r.jsx("button",{type:"button",onClick:()=>{w("all"),x(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h==="all"?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h==="all"?800:500},children:"All Seasons"}),W.map(g=>r.jsxs("button",{type:"button",onClick:()=>{w(g),x(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:h===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:h===g?800:500},children:["Season ",g]},g))]})]}),r.jsxs("div",{style:{position:"relative"},children:[r.jsxs("button",{type:"button",onClick:()=>{P(g=>!g),x(!1)},style:{padding:"8px 12px",borderRadius:10,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6},children:[r.jsx("span",{children:F==="all"?"All Players":F==="pro"?"PRO Only":"Players Only"}),r.jsx(ge,{size:13,color:"#94A3B8"})]}),z&&r.jsx("div",{style:{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 10px 30px rgba(15,23,42,0.15)",zIndex:30,minWidth:140,overflow:"hidden"},children:[["all","All Players"],["player","Players Only"],["pro","PRO Only"]].map(([g,v])=>r.jsx("button",{type:"button",onClick:()=>{S(g),P(!1)},style:{width:"100%",padding:"10px 14px",border:"none",background:F===g?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:12.5,color:"#0F172A",cursor:"pointer",fontWeight:F===g?800:500},children:v},g))})]})]})]}),r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:18,flexDirection:e?"column":"row"},children:[r.jsx("div",{style:{display:"flex",gap:8,overflowX:"auto",width:e?"100%":"auto",paddingBottom:2},children:[["points","Points Table",it],["runs","Most Runs",he],["wickets","Most Wickets",st],["sixes","Most 6s",je]].map(([g,v,R])=>r.jsxs("button",{type:"button",onClick:()=>m(g),style:{padding:"8px 14px",borderRadius:999,border:y===g?"none":"1.5px solid #E2E8F0",background:y===g?"#166534":"#FFFFFF",color:y===g?"#FFFFFF":"#64748B",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",flexShrink:0,boxShadow:y===g?"0 2px 8px rgba(22,101,52,0.25)":"none",transition:"all 150ms ease"},children:[r.jsx(R,{size:13}),r.jsx("span",{children:v})]},g))}),y==="points"&&r.jsxs("div",{style:{width:e?"100%":240,position:"relative"},children:[r.jsx(lt,{size:14,color:"#94A3B8",style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}),r.jsx("input",{type:"text",value:$,onChange:g=>A(g.target.value),placeholder:"Search ranked player...",style:{width:"100%",padding:"8px 12px 8px 32px",borderRadius:999,border:"1.5px solid #E2E8F0",fontSize:12,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}})]})]}),y==="runs"&&r.jsx(ae,{label:"Most Runs",desc:"Track top batsmen across tournaments once live match scoring is recorded."}),y==="wickets"&&r.jsx(ae,{label:"Most Wickets",desc:"Track top wicket-takers across matches once match scorecards are submitted."}),y==="sixes"&&r.jsx(ae,{label:"Most 6s",desc:"Track maximum sixes hit per season once live innings balls are captured."}),y==="points"&&(d?r.jsxs("div",{style:{color:"#EF4444",fontSize:13,textAlign:"center",padding:"30px 0",background:"rgba(239,68,68,0.06)",borderRadius:12,border:"1px solid rgba(239,68,68,0.25)"},children:["⚠️ Couldn't load the leaderboard: ",d]}):q.length===0?r.jsx(K,{style:{padding:"40px 20px",textAlign:"center",borderRadius:16},children:r.jsxs("div",{style:{fontSize:14,color:"#64748B"},children:["No completed matches recorded yet",h!=="all"?` for Season ${h}`:"","."]})}):r.jsxs(r.Fragment,{children:[!T&&Y.length>0&&r.jsxs("div",{style:{display:"flex",alignItems:"stretch",gap:e?8:14,marginBottom:22,padding:"0 2px"},children:[r.jsx(te,{p:Y[1],rank:2}),r.jsx(te,{p:Y[0],rank:1}),r.jsx(te,{p:Y[2],rank:3})]}),fe.length>0?r.jsxs("div",{style:{borderRadius:16,overflow:"hidden",border:"1px solid #E2E8F0",background:"#FFFFFF",marginBottom:20,boxShadow:"0 4px 16px rgba(15,23,42,0.03)"},children:[r.jsxs("div",{style:{display:"flex",alignItems:"center",padding:e?"12px 14px":"12px 20px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",color:"#64748B",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:[r.jsx("div",{style:{width:34},children:"#"}),r.jsx("div",{style:{flex:1},children:"Player"}),r.jsx("div",{style:{width:80,textAlign:"center"},children:"Role"}),r.jsx("div",{style:{width:70,textAlign:"center"},children:"Matches"}),r.jsx("div",{style:{width:80,textAlign:"right"},children:"Points"}),r.jsx("div",{style:{width:24}})]}),fe.map((g,v)=>{const R=T?q.findIndex(O=>O.id===g.id)+1:v+4,E=g.id===t,ne=R<=10;return r.jsxs("div",{onClick:()=>B(g),style:{display:"flex",alignItems:"center",padding:e?"11px 14px":"12px 20px",background:E?"rgba(34,197,94,0.07)":"#FFFFFF",borderTop:"1px solid #F1F5F9",cursor:"pointer",transition:"background 150ms ease",position:"relative"},onMouseEnter:O=>{E||(O.currentTarget.style.background="#F8FAF8")},onMouseLeave:O=>{E||(O.currentTarget.style.background="#FFFFFF")},children:[r.jsx("div",{style:{width:34,flexShrink:0},children:ne?r.jsx("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:6,background:"#F1F5F9",color:"#0F172A",fontSize:11,fontWeight:900,fontFamily:"var(--font-head)"},children:R}):r.jsx("span",{style:{fontSize:13,fontWeight:700,color:"#94A3B8",fontFamily:"var(--font-head)"},children:R})}),r.jsxs("div",{style:{flex:1,display:"flex",alignItems:"center",gap:10,minWidth:0},children:[g.profile_image_url?r.jsx("img",{src:g.profile_image_url,alt:g.name,style:{width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"1.5px solid #E2E8F0"}}):r.jsx(U,{name:g.name,id:g.id,sz:34}),r.jsxs("div",{style:{minWidth:0},children:[r.jsxs("div",{style:{fontWeight:800,fontSize:13.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6},children:[r.jsx("span",{children:g.name}),E&&r.jsx("span",{style:{background:"#166534",color:"#FFFFFF",fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:4},children:"YOU"})]}),g.city&&r.jsxs("div",{style:{fontSize:11,color:"#94A3B8",marginTop:1},children:["📍 ",g.city]})]})]}),r.jsx("div",{style:{width:80,textAlign:"center",flexShrink:0},children:g.role&&g.role!=="player"?r.jsx(Fe,{role:g.role,size:"sm"}):r.jsx("span",{style:{fontSize:10,fontWeight:800,background:"rgba(22,101,52,0.08)",color:"#166534",padding:"2px 7px",borderRadius:4},children:"Player"})}),r.jsx("div",{style:{width:70,textAlign:"center",fontSize:13,fontWeight:800,color:"#0F172A",flexShrink:0},children:g.matchesPlayed}),r.jsxs("div",{style:{width:80,textAlign:"right",fontSize:14,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",flexShrink:0},children:[g.points," ",r.jsx("span",{style:{fontSize:9.5,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),r.jsx("div",{style:{width:24,display:"flex",justifyContent:"flex-end",flexShrink:0},children:r.jsx(Pe,{size:15,color:"#CBD5E1"})})]},g.id)})]}):T?r.jsx(K,{style:{padding:"32px 16px",textAlign:"center",borderRadius:14},children:r.jsxs("div",{style:{fontSize:13.5,color:"#64748B"},children:['No ranked players match "',$,'".']})}):null,V>=0&&r.jsxs("div",{style:{padding:"14px 18px",display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg, rgba(22,101,52,0.08), rgba(22,101,52,0.02))",border:"1.5px solid rgba(22,101,52,0.3)",borderRadius:16,boxShadow:"0 4px 14px rgba(22,101,52,0.08)"},children:[r.jsx("div",{style:{width:42,height:42,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(22,101,52,0.3)"},children:r.jsx(Ce,{size:20,color:"#FFFFFF"})}),r.jsxs("div",{style:{flex:1,minWidth:0},children:[r.jsx("div",{style:{fontSize:12,color:"#166534",fontWeight:800,textTransform:"uppercase",letterSpacing:.5},children:"Your Season Ranking"}),r.jsxs("div",{style:{fontSize:17,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["Rank #",V+1," ",r.jsxs("span",{style:{fontSize:12,fontWeight:600,color:"#64748B"},children:["of ",q.length," players"]})]})]}),r.jsxs("div",{style:{textAlign:"right",flexShrink:0},children:[r.jsxs("div",{style:{fontSize:20,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)"},children:[q[V].points," ",r.jsx("span",{style:{fontSize:11,fontWeight:700,color:"#94A3B8"},children:"PTS"})]}),r.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:[q[V].matchesPlayed," matches played"]})]})]})]})),k&&r.jsx("div",{onClick:()=>B(null),style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16},children:r.jsxs("div",{onClick:g=>g.stopPropagation(),style:{background:"#FFFFFF",borderRadius:20,maxWidth:440,width:"100%",padding:22,boxShadow:"0 24px 60px rgba(15,23,42,0.3)",maxHeight:"90vh",display:"flex",flexDirection:"column"},children:[r.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14},children:[r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[k.profile_image_url?r.jsx("img",{src:k.profile_image_url,alt:k.name,style:{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:"2px solid #166534"}}):r.jsx(U,{name:k.name,id:k.id,sz:50}),r.jsxs("div",{children:[r.jsx("h3",{style:{margin:0,fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)"},children:k.name}),r.jsxs("div",{style:{fontSize:12,color:"#64748B",display:"flex",alignItems:"center",gap:6,marginTop:2},children:[r.jsx("span",{children:k.city||"Pune"}),r.jsx("span",{children:"·"}),r.jsx("span",{style:{fontWeight:700,color:"#166534"},children:k.role||"Player"})]})]})]}),r.jsx("button",{onClick:()=>B(null),style:{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94A3B8",padding:0},children:"×"})]}),r.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16,background:"#F8FAF8",padding:12,borderRadius:12,border:"1px solid #E2E8F0",textAlign:"center"},children:[r.jsxs("div",{children:[r.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Rank"}),r.jsxs("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:["#",q.findIndex(g=>g.id===k.id)+1]})]}),r.jsxs("div",{children:[r.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Matches"}),r.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:2},children:k.matchesPlayed})]}),r.jsxs("div",{children:[r.jsx("div",{style:{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"},children:"Points"}),r.jsx("div",{style:{fontSize:16,fontWeight:900,color:"#166534",fontFamily:"var(--font-head)",marginTop:2},children:k.points})]})]}),r.jsxs("div",{style:{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:8,textTransform:"uppercase",letterSpacing:.3},children:["Verified Completed Matches (",((me=k.matches)==null?void 0:me.length)||0,")"]}),r.jsx("div",{style:{flex:1,overflowY:"auto",display:"grid",gap:8,paddingRight:2,maxHeight:240},children:(k.matches||[]).map((g,v)=>r.jsxs("div",{style:{padding:"9px 12px",background:"#F8FAF8",borderRadius:10,border:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[r.jsxs("div",{style:{minWidth:0},children:[r.jsxs("div",{style:{fontSize:12.5,fontWeight:800,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[g.our_team||"Team"," vs ",g.team||"Opponent"]}),r.jsxs("div",{style:{fontSize:11,color:"#64748B",marginTop:1},children:["📅 ",g.date||"Completed"]})]}),r.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#166534",background:"#DCFCE7",padding:"2px 7px",borderRadius:6,flexShrink:0},children:"+20 PTS"})]},v))}),r.jsx("button",{onClick:()=>B(null),style:{width:"100%",padding:"11px",borderRadius:10,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)",marginTop:16},children:"Close"})]})})]})}function Br({player:e}){const[t,a]=_.useState(null),[n,o]=_.useState(!0),[s,l]=_.useState(!1),[d,c]=_.useState(!1);_.useEffect(()=>{Be(e.id).then(a).catch(()=>{}).finally(()=>o(!1))},[e.id]);const u=async()=>{l(!0);try{const b=await qe(e.id);a(b)}catch(b){alert(b.message)}l(!1)},p=async()=>{if(t!=null&&t.id){c(!0);try{await $e(t.id),a(null)}catch(b){alert(b.message)}c(!1)}};if(e.role==="pro"||n)return null;const f=t==null?void 0:t.status;return r.jsxs(K,{style:{padding:"16px",marginTop:16},children:[r.jsxs("div",{style:{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:8,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:8},children:[r.jsx(ye,{size:17,color:"#166534"})," Schedule Your Own Matches"]}),r.jsx("div",{style:{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.5},children:"Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days."}),f==="pending"?r.jsxs(r.Fragment,{children:[r.jsx("div",{style:{padding:"10px 12px",background:"rgba(216,176,91,0.1)",borderRadius:10,color:"#B8860B",fontSize:12,fontWeight:700,textAlign:"center",marginBottom:10},children:"⏳ Your request is pending admin approval"}),r.jsx("button",{onClick:p,disabled:d,style:{width:"100%",padding:"9px",borderRadius:10,background:"transparent",border:"1.5px solid #E2E8F0",color:"#64748B",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)"},children:d?"Cancelling...":"Cancel Request"})]}):r.jsx("button",{onClick:u,disabled:s,style:{width:"100%",padding:"11px",borderRadius:10,background:"linear-gradient(135deg,#166534,#FFFFFF)",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:s?"Sending...":f==="rejected"?"Request Again":r.jsxs(r.Fragment,{children:[r.jsx(ye,{size:15})," Request to Schedule Matches"]})})]})}const ue="ss_session";function Yn(e,t=null){try{localStorage.setItem(ue,JSON.stringify({role:e,player:t}))}catch{}}function Vn(){try{return JSON.parse(localStorage.getItem(ue)||"null")}catch{return null}}function Ve(){try{localStorage.removeItem(ue)}catch{}}class Kn extends _.Component{constructor(t){super(t),this.state={hasError:!1,isChunkError:!1}}static getDerivedStateFromError(t){const a=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();return{hasError:!0,isChunkError:/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(a)}}componentDidCatch(t,a){console.error("SelectedSports App Error caught by boundary:",t,a);const n=((t==null?void 0:t.message)||(t==null?void 0:t.toString())||"").toLowerCase();if(/dynamically imported|loading chunk|failed to fetch|chunkloaderror|import/i.test(n)){const o=parseInt(sessionStorage.getItem("boundary_reload_ts")||"0",10);if(Date.now()-o>6e3){sessionStorage.setItem("boundary_reload_ts",String(Date.now()));const s=new URL(window.location.href);s.searchParams.set("_v",String(Date.now())),window.location.replace(s.toString())}}}render(){return this.state.hasError?this.state.isChunkError?r.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"},children:[r.jsx(G,{}),r.jsx("p",{style:{marginTop:16,fontSize:13,color:"#64748B",fontWeight:600,fontFamily:"var(--font-head)"},children:"Updating application..."})]}):r.jsxs("div",{style:{minHeight:"100vh",background:"#F8FAF8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",fontFamily:"var(--font-body)"},children:[r.jsx("div",{style:{width:64,height:64,borderRadius:"50%",background:"rgba(22,101,52,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16},children:"🏏"}),r.jsx("h2",{style:{fontSize:20,fontWeight:900,color:"#0F172A",margin:"0 0 8px",fontFamily:"var(--font-head)"},children:"Selected Sports"}),r.jsx("p",{style:{fontSize:13,color:"#64748B",maxWidth:360,margin:"0 0 20px",lineHeight:1.5},children:"Something unexpected happened. Tap below to reload."}),r.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"},children:[r.jsx("button",{onClick:()=>window.location.reload(),style:{padding:"12px 22px",borderRadius:12,background:"#166534",color:"#FFFFFF",border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"var(--font-head)"},children:"🔄 Reload App"}),r.jsx("button",{onClick:()=>{Ve(),localStorage.clear(),window.location.href="/"},style:{padding:"12px 18px",borderRadius:12,background:"#FFFFFF",color:"#64748B",border:"1.5px solid #E2E8F0",fontSize:13,fontWeight:700,cursor:"pointer"},children:"Return to Home"})]})]}):this.props.children}}function L(e){return _.lazy(async()=>{try{return await e()}catch(t){console.warn("Chunk load failed, auto-reloading to fetch new version:",t);const a=parseInt(sessionStorage.getItem("chunk_reload_ts")||"0",10),n=Date.now();if(n-a>8e3){sessionStorage.setItem("chunk_reload_ts",String(n));const o=new URL(window.location.href);return o.searchParams.set("_v",String(n)),window.location.replace(o.toString()),new Promise(()=>{})}throw t}})}const Zn=L(()=>D(()=>import("./LoginScreens-ClfY2qoq.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.UnifiedLoginScreen}))),Jn=L(()=>D(()=>import("./LoginScreens-ClfY2qoq.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegisterScreen}))),Qn=L(()=>D(()=>import("./LoginScreens-ClfY2qoq.js"),__vite__mapDeps([0,1,2,3])).then(e=>({default:e.RegistrationSubmittedScreen}))),Xn=L(()=>D(()=>import("./AdminPortal-DYG8krgx.js").then(e=>e.A),__vite__mapDeps([4,1,5,2,6,3]))),er=L(()=>D(()=>import("./PlayerPortal-D-gC7of_.js"),__vite__mapDeps([6,1,2,3]))),tr=L(()=>D(()=>import("./ProPortal-CCr95Pp0.js"),__vite__mapDeps([7,1,2,4,5,6,3]))),ar=L(()=>D(()=>import("./PublicInvitePage-Cfgwmyj6.js"),__vite__mapDeps([8,1,3]))),nr=L(()=>D(()=>import("./PublicAuctionView-CzL6Wun3.js"),__vite__mapDeps([9,1,3]))),rr=L(()=>D(()=>import("./PublicAuctionRegister-BeWMyFuQ.js"),__vite__mapDeps([10,1,2,5,3]))),or=L(()=>D(()=>import("./TeamOwnerView-DSgn1g1T.js"),__vite__mapDeps([11,1,3])));function ee(){const t=new URLSearchParams(window.location.search).get("p");t&&window.history.replaceState(null,"",t)}function ir(){ee();const t=window.location.pathname.match(/\/join\/([a-zA-Z0-9\-]+)/);return t?t[1]:null}function sr(){ee();const e=window.location.pathname.match(/\/live-auction(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function lr(){ee();const e=window.location.pathname.match(/\/auction-register(?:\/([a-zA-Z0-9\-]+))?\/?$/);return e?e[1]||null:void 0}function cr(){ee();const e=window.location.pathname.match(/\/team-view\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/?$/);return e?{auctionCode:e[1],teamId:e[2]}:null}function dr(){const[e,t]=_.useState("home"),[a,n]=_.useState(null),[o,s]=_.useState(!1),[l,d]=_.useState([]),[c,u]=_.useState(!1),[p,f]=_.useState(null),[b,y]=_.useState(null),[m,h]=_.useState(null),[w,C]=_.useState(null);_.useEffect(()=>{const k=cr();if(k){C(k),t("teamView");return}const B=sr();if(B!==void 0){y(B),t("liveAuction");return}const W=lr();if(W!==void 0){h(W),t("auctionRegister");return}const N=ir();if(N){f(N),t("publicInvite");return}const j=Vn();(j==null?void 0:j.role)==="admin"||(j==null?void 0:j.role)==="founder"?(s(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="organizer"&&(j!=null&&j.player)?(s(!0),P(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="pro"&&(j!=null&&j.player)?(s(!1),S(!0),n(j.player),t("portal")):(j==null?void 0:j.role)==="player"&&(j!=null&&j.player)&&(s(!1),n(j.player),x().then(()=>t("portal")))},[]);const x=async()=>{u(!0);try{d(await Ae())}catch{}u(!1)},[F,S]=_.useState(!1),[z,P]=_.useState(!1),$=async k=>{const B=(k.phone||"").replace(/[^0-9]/g,"").slice(-10),W=Dn.replace(/[^0-9]/g,"").slice(-10);console.log("phone:",B,"adminPhone:",W);const N=B===W||k.role==="founder",j=!N&&k.role==="organizer",q=N||j,T=!q&&k.role==="pro";s(q),P(j),S(T),n(k),q||await x(),Yn(N?"founder":j?"organizer":T?"pro":"player",k),t("portal")},A=()=>{Ve(),n(null),s(!1),S(!1),P(!1),d([]),t("home")};return r.jsx(Kn,{children:r.jsxs(_.Suspense,{fallback:r.jsx("div",{style:{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"},children:r.jsx(G,{})}),children:[e==="publicInvite"&&r.jsx(ar,{token:p}),e==="liveAuction"&&r.jsx(nr,{auctionCode:b}),e==="teamView"&&r.jsx(or,{auctionCode:w==null?void 0:w.auctionCode,teamId:w==null?void 0:w.teamId}),e==="auctionRegister"&&r.jsx(rr,{auctionCode:m}),e==="home"&&r.jsx(In,{onLogin:()=>t("login"),onRegister:()=>t("register")}),e==="register"&&r.jsx(Jn,{onSuccess:()=>t("registered"),onBack:()=>t("home")}),e==="registered"&&r.jsx(Qn,{onBack:()=>t("home")}),e==="login"&&r.jsx(Zn,{onAdminSuccess:$,onPlayerSuccess:$,onBack:()=>t("home"),onRegister:()=>t("register")}),e==="portal"&&o&&r.jsx(Xn,{player:a,onLogout:A,isFounder:!z}),e==="portal"&&!o&&F&&r.jsx(tr,{player:a,onLogout:A}),e==="portal"&&!o&&!F&&(c||!a?r.jsx("div",{style:{minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center"},children:r.jsx(G,{})}):r.jsx(er,{player:a,matches:l,onLogout:A}))]})})}document.documentElement.style.setProperty("background","#F8FAF8","important");document.body.style.setProperty("background","#F8FAF8","important");"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(e=>{e.forEach(t=>t.unregister())}).catch(()=>{});"caches"in window&&caches.keys().then(e=>{e.forEach(t=>caches.delete(t))}).catch(()=>{});async function pe(){try{const e=await fetch("/version.json?_cb="+Date.now(),{cache:"no-store"});if(!e.ok)return;const t=await e.json();if(t!=null&&t.v&&t.v>1789159797543){console.warn("New build detected on server. Reloading to latest:",t.v,">",1789159797543);const a=new URL(window.location.href);a.searchParams.set("_v",String(t.v)),window.location.replace(a.toString())}}catch{}}pe();setInterval(pe,3e4);document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&pe()});window.addEventListener("vite:preloadError",e=>{e.preventDefault(),console.warn("Dynamic import preload error, fetching fresh bundle:",e);const t=parseInt(sessionStorage.getItem("vite_preload_ts")||"0",10);if(Date.now()-t>6e3){sessionStorage.setItem("vite_preload_ts",String(Date.now()));const a=new URL(window.location.href);a.searchParams.set("_v",String(Date.now())),window.location.replace(a.toString())}});window.addEventListener("unhandledrejection",e=>{var a;const t=((a=e.reason)==null?void 0:a.message)||String(e.reason||"");if(/dynamically imported|loading chunk|failed to fetch/i.test(t)){e.preventDefault();const n=parseInt(sessionStorage.getItem("unhandled_chunk_ts")||"0",10);if(Date.now()-n>6e3){sessionStorage.setItem("unhandled_chunk_ts",String(Date.now()));const o=new URL(window.location.href);o.searchParams.set("_v",String(Date.now())),window.location.replace(o.toString())}}});mt.createRoot(document.getElementById("root")).render(r.jsx(gt.StrictMode,{children:r.jsx(dr,{})}));export{wn as $,Dn as A,Rr as B,K as C,Wn as D,gr as E,fr as F,$n as G,Xa as H,Cn as I,on as J,ga as K,$r as L,On as M,na as N,Tt as O,be as P,Mt as Q,Fe as R,G as S,Er as T,Nt as U,Pr as V,Ar as W,Fr as X,Sr as Y,_n as Z,D as _,mr as a,jr as a$,kn as a0,mn as a1,An as a2,ce as a3,Va as a4,Sn as a5,sn as a6,an as a7,ia as a8,fa as a9,It as aA,Ct as aB,Oe as aC,Ye as aD,Cr as aE,Gn as aF,Ma as aG,wr as aH,fn as aI,kt as aJ,En as aK,Aa as aL,un as aM,pn as aN,hr as aO,br as aP,Vt as aQ,cn as aR,Ga as aS,ca as aT,qn as aU,Ra as aV,ea as aW,Kt as aX,tn as aY,Yn as aZ,Un as a_,ta as aa,qt as ab,Pa as ac,Re as ad,Wt as ae,_a as af,ze as ag,Ae as ah,bn as ai,va as aj,jt as ak,ja as al,ra as am,zn as an,za as ao,gn as ap,Fn as aq,$a as ar,ba as as,wa as at,At as au,Fa as av,xa as aw,Jt as ax,St as ay,X as az,yr as b,sa as b0,Ka as b1,Zt as b2,kr as b3,vr as b4,ln as b5,la as b6,i as b7,vn as b8,en as b9,Ht as ba,oa as bb,dn as bc,xn as bd,Ja as be,Ha as bf,Ya as bg,rn as bh,Bt as bi,Gt as bj,Ut as bk,Et as bl,Za as bm,Sa as bn,Lt as bo,vt as bp,Ft as bq,Pn as br,bt as bs,U as c,Hn as d,zr as e,qr as f,Mn as g,Br as h,jn as i,ma as j,aa as k,$t as l,ie as m,Ua as n,Dt as o,Rn as p,Ea as q,Xt as r,_r as s,xr as t,We as u,Yt as v,ka as w,yn as x,nn as y,Ot as z};
