import{bI as $,c4 as l,bw as c,ai as m}from"./index-mm9TPxMT.js";function y(n,a){const t=`${a}/join/${n.invite_token||n.id}`;return`🏏 *Selected Sports | Match Details*
🆔 *Match ID:* ${n.match_code||$(n)}
⚔️ *${l(n)}*
📅 *Date:* ${c(n.date)} (${m(n.date)})
⏰ *Time:* ${n.time_slot||"TBA"}
📍 *Ground:* ${n.ground||"Match Ground"}

👉 Confirm your availability & view squad:
${t}

⚡ *Selected Sports* • Play Cricket in Your City
https://selectedsports.in`}function S(n,a,t){const r=a.filter(e=>e.status==="confirmed"),o=t.reduce((e,d)=>e+Number(d.amount),0),s=r.length>0?Math.round(o/r.length):0,i=t.map(e=>`• ${e.label}: ₹${e.amount} / ${r.length} = ₹${Math.round(e.amount/(r.length||1))}`).join(`
`);return`💰 *Payment Request*
${l(n)} - ${m(n.date)}

${i}

*Your share: ₹${s}*

Pay: cricketclub@upi`}function f(n,a=[]){const t=a.filter(s=>s.status==="confirmed"),r=t.length>0?t.map((s,i)=>{var e;return`${i+1}. ${((e=s.players)==null?void 0:e.name)||"Player"}`}).join(`
`):"No one confirmed yet.",o=n.match_code||$(n);return`⏰ *Match Reminder - ${l(n)}*
🆔 *Match ID:* ${o}
📅 ${c(n.date)}
⏰ ${n.time_slot}
📍 ${n.ground}

✅ *Confirmed Squad (${t.length}):*
${r}

Match starts soon! Please be on time 🏏`}function _(n,a){const t=`${a}/join/${n.invite_token||n.id}?team=a`;return`🏏 *Selected Sports | Match Details*
🆔 *Match ID:* ${n.match_code||$(n)}
⚔️ *${l(n)}*
📅 *Date:* ${c(n.date)} (${m(n.date)})
⏰ *Time:* ${n.time_slot||"TBA"}
📍 *Ground:* ${n.ground||"Match Ground"}

👉 Confirm your availability & view squad:
${t}

⚡ *Selected Sports* • Play Cricket in Your City
https://selectedsports.in`}function h(n,a=[]){const t=a.filter(e=>e.status==="confirmed"),r=a.filter(e=>e.status==="waitlist"),o=t.length>0?t.map((e,d)=>{var u;return`${d+1}. ${((u=e.players)==null?void 0:u.name)||"Player"}`}).join(`
`):"",s=r.length>0?`

*Waiting List (${r.length}):*
${r.map((e,d)=>{var u;return`${d+1}. ${((u=e.players)==null?void 0:u.name)||"Player"}`}).join(`
`)}`:"",i=n.match_code||$(n);return`🔒 *Squad Full - ${l(n)}*
🆔 *Match ID:* ${i}
📅 ${c(n.date)}
⏰ ${n.time_slot}
📍 ${n.ground}

The squad is now full! ✅

*Confirmed Squad (${t.length}):*
${o}${s}

See you on the field 🏏`}function D(n){const a=n.booking_id||n.id||"CONFIRMED",t=n.turf_unit?` • *${n.turf_unit}*`:"",r=n.payment_option==="venue"||n.payment_method==="Pay at Venue",o=r?`💵 *Payment Mode:* Pay at Venue (Pay on Arrival)
`:`💳 *Payment Mode:* Prepaid Online (${n.payment_method||"UPI"})
`,s=Number(n.balance_due||0)>0?`⚠️ *Balance Due: ₹${Number(n.balance_due).toLocaleString("en-IN")}* (To be settled at turf desk)
`:`✅ *Payment: Fully Paid & Confirmed*
`,i=Number(n.advance_paid||0)>0?`💵 *Advance Paid:* ₹${Number(n.advance_paid).toLocaleString("en-IN")}
`:r?`💵 *Advance Paid:* ₹0 (Pay on Arrival)
`:"",e=n.amenities&&n.amenities.length>0?`✨ *Amenities:* ${n.amenities.join(", ")}
`:"",d=n.customer_team?` (${n.customer_team})`:"";return`🏏 *GROUND BOOKING CONFIRMATION*
🆔 *Booking ID: ${a}*
━━━━━━━━━━━━━━━━━━━━
🏟️ *Ground:* ${n.ground_name||"Match Ground"}${t}
📅 *Date:* ${c(n.date)}
⏰ *Slot Timing:* ${n.time_slot||"Full Slot"}
🏏 *Slot Type:* ${n.slot_type||"Cricket Match"}
👤 *Booked By:* ${n.customer_name}${d}
💰 *Total Rent:* ₹${Number(n.rate||0).toLocaleString("en-IN")}
`+(n.rate_breakdown?`⚡ *Rate Tier:* ${n.rate_breakdown}
`:"")+(n.coupon_code?`🏷️ *Coupon Code:* ${n.coupon_code}
`:"")+o+i+s+e+(n.notes?`📝 *Notes:* ${n.notes}
`:"")+`━━━━━━━━━━━━━━━━━━━━
📌 *Please present this Booking ID (${a}) upon arrival at the ground entry.*
_Issued by Selected Sports Ground Desk_`}function I(n,a="https://selectedsports.in/#/ground-login"){return`🏟️ *SELECTED SPORTS - GROUND DESK ACCESS*

Hello *${n.name}*,
Here are your official login credentials for the *${n.ground_name||"Ground"}* Desk & Slot Diary:

👤 *Username:* ${n.username||n.phone}
🔑 *Password:* ${n.password||n.pin}
📱 *Registered Mobile:* +91 ${n.phone}
🏟️ *Assigned Venue:* ${n.ground_name||"All Grounds"}

👉 *Dedicated Ground Desk Login Link:*
${a}

_Log in with your username and password to manage turf slots, generate unique Booking IDs, and track advance & balance payments. You can also change your password anytime inside the Ground Desk._`}export{I as a,_ as b,S as c,y as d,f as e,h as f,D as w};
