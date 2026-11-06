'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='tirahanhub_v2',SIM=new URLSearchParams(location.search).get('simulate');
// Approximate centers. Replace with exact coordinates and add more barangays here.
const B={'Anilao':[13.905,121.13],'Antipolo del Norte':[13.97,121.19],'Balintawak':[13.95,121.178],'Banaybanay':[13.978,121.15],'Latag':[13.9334,121.1722],'Lodlod':[13.955,121.155],'Marawoy':[13.9625,121.163],'Mataas na Lupa':[13.96,121.173],'Pinagkawitan':[13.925,121.185],'Poblacion':[13.9411,121.1631],'Sabang':[13.944,121.157],'Tambo':[13.93,121.142]};
const SC={'BatStateU Lipa':[13.9625,121.163],'De La Salle Lipa':[13.957,121.1715],'NU Lipa':[13.942,121.164],'Lipa City Colleges':[13.94,121.162]};
const STAFF={'owner@tirahanhub.ph':{pw:'owner123',role:'owner',name:'Aling Nena Reyes'},'owner2@tirahanhub.ph':{pw:'owner123',role:'owner',name:"Ma'am Liza Ramos"},'admin@tirahanhub.ph':{pw:'admin123',role:'admin',name:'City Admin'}};
const ago=d=>new Date(Date.now()-d*864e5).toISOString(),days=i=>Math.floor((Date.now()-new Date(i))/864e5);
const fd=i=>new Date(i).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),peso=n=>'₱'+Number(n).toLocaleString('en-PH');
const km=(a,b)=>{const r=Math.PI/180,x=(b[0]-a[0])*r,y=(b[1]-a[1])*r,h=Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const mk=(id,name,type,brgy,addr,price,total,avail,own,rules,cf,up=[],st='approved')=>({id,name,type,brgy,addr,price,total,avail,own,ownN:(STAFF[own]||{}).name||own,ph:'0917000'+String(1000+id),rules,lat:B[brgy][0]+((id*37%100)-50)/10000,lng:B[brgy][1]+((id*53%100)-50)/10000,st,cf:ago(cf),up,rp:0});
const O1='owner@tirahanhub.ph',O2='owner2@tirahanhub.ph';
const seed=()=>({L:[
 mk(1,'Casa Marawoy Dormitory','Dormitory','Marawoy','Near BatStateU Lipa gate',3200,20,6,O2,'Female only. Curfew 10 PM. No cooking.',1),
 mk(2,'Reyes Apartments','Apartment','Marawoy','Purok 3, Marawoy',5500,8,0,O1,'1-month deposit. No pets.',3,[{id:'u1',d:'2027-03-15',s:'open',by:''}]),
 mk(3,'Kapitbahay Rooms','Bedspace','Marawoy','Along Tanco Drive',1800,12,2,O1,'Mixed. Shared bathroom. Visitors until 8 PM.',20),
 mk(4,'Sabang Student Lodge','Dormitory','Sabang','Near the public market',2800,16,9,O2,'Male only. Wi-Fi included.',2),
 mk(5,'Villa Dalisay Apartments','Apartment','Sabang','Dalisay St.',6500,6,1,O2,'2-month deposit. Parking available.',5),
 mk(6,'Lipa Scholars Bedspace','Bedspace','Mataas na Lupa','Near De La Salle Lipa',1500,10,4,O1,'Shared kitchen. Curfew 11 PM.',4),
 mk(7,'Plaza Residences','Apartment','Poblacion','Beside the city plaza',7200,10,3,O2,'Aircon units. 1-year contract.',6),
 mk(8,'Tambo Family Apartments','Apartment','Tambo','Tambo main road',4800,5,0,O1,'Family-friendly. 2-month deposit.',9),
 mk(9,'Antipolo Student Haven','Dormitory','Antipolo del Norte','Antipolo del Norte',2200,14,5,O2,'Mixed floors. Study room.',2),
 mk(10,'Balintawak Boarding House','Bedspace','Balintawak','Balintawak',1700,8,3,O1,'Shared bathroom.',0,[],'pending')],
 O:[{email:'jun@tirahanhub.ph',name:'Mr. Jun Dela Cruz',pw:'owner123',ph:'09171110000',status:'pending',reason:'',docs:[{k:'Valid ID',n:'jun-id.jpg'},{k:'Proof of ownership',n:'tax-declaration.pdf'}],ts:ago(1)}],N:[],C:[],T:[],F:[],R:[{id:4,name:'Kim D.',rt:5,tx:'Strong water and quiet at night.',ts:ago(30)}]});
let D=JSON.parse(localStorage[KEY]||'null')||seed(),S=JSON.parse(localStorage[KEY+'_s']||'null');
if(!D.O)D.O=seed().O;
const save=()=>{localStorage[KEY]=JSON.stringify(D);localStorage[KEY+'_s']=JSON.stringify(S)};
let ST='loading',F={brgy:'',type:'',max:'',av:false,sch:'',km:'',q:''},map,layer,pend=null;
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2400)};
const note=(to,text)=>D.N.push({to,text,ts:new Date().toISOString(),r:0});
const stt=l=>l.avail<=0?['full','Full']:l.avail/l.total<=.25?['few','Few units left']:['ok','Available'];
const chip=l=>`<span class="chip ${stt(l)[0]}">${stt(l)[1]}</span>`;
const stateBox=(i,t,x,a='')=>`<div class="card state"><div class="big">${i}</div><h3>${t}</h3><p class="mute">${x}</p>${a}</div>`;
const dlg=h=>{const d=$('#dlg');d.innerHTML=`<div class="dl"><button class="btn sec sm x" data-act="close">Close</button>${h}</div>`;if(!d.open)d.showModal()};
const done=(t,x,a='')=>dlg(`<div class="state"><div class="big">✅</div><h3>${t}</h3><p>${x}</p>${a}</div>`);
const fe=(el,m)=>{el.setAttribute('aria-invalid','true');el.insertAdjacentHTML('afterend',`<div class="err" role="alert">${m}</div>`)};
function check(f,rules){let ok=true;$$('.err',f).forEach(e=>e.remove());$$('[aria-invalid]',f).forEach(e=>e.removeAttribute('aria-invalid'));
 for(const[n,fn]of Object.entries(rules)){const el=f.elements[n],m=fn(el.value.trim());if(m){ok=false;fe(el,m)}}return ok}
const req=m=>v=>v?'':m,mail=v=>/^\S+@\S+\.\S+$/.test(v)?'':'Enter a valid email, like name@email.com.',num=(m,lo=0,hi=1e9)=>v=>v===''||isNaN(v)||+v<lo||+v>hi?m:'';
const vis=()=>D.L.filter(l=>l.st==='approved'),org=()=>F.me||(F.sch?SC[F.sch]:null),dist=l=>org()?km(org(),[l.lat,l.lng]):null;
const match=l=>(!F.brgy||l.brgy===F.brgy)&&(!F.type||l.type===F.type)&&(!F.max||l.price<=+F.max)&&(!F.av||l.avail>0)&&(!F.q||(l.name+l.addr+l.brgy).toLowerCase().includes(F.q.toLowerCase()))&&(!F.km||!org()||dist(l)<=+F.km);
const UP={open:'Open for reservation',requested:'Reservation pending',reserved:'Reserved'};

// ---------- data loading (loading, slow, error, offline states) ----------
const api=f=>new Promise((ok,no)=>{if(!navigator.onLine)return no('offline');setTimeout(()=>SIM==='error'?no('error'):ok(f()),SIM==='slow'?5000:600)});
function load(){ST='loading';drawRes();const t=setTimeout(()=>{if(ST==='loading'){ST='slow';drawRes()}},2000);
 api(vis).then(()=>ST='ready').catch(e=>ST=e==='offline'?'offline':'error').finally(()=>{clearTimeout(t);drawRes()})}
const card=l=>{const d=dist(l);return `<div class="card item"><div class="ph" style="background:hsl(${l.id*53%360} 45% 40%)">${l.type[0]}</div>
 <div><h3 style="margin:0">${esc(l.name)}</h3><div class="mute">${l.type} · ${esc(l.brgy)} · ${esc(l.addr)}${d!=null?` · ${d.toFixed(1)} km away`:''}</div>
 <p style="margin:6px 0">${chip(l)} ${vo(l)?'<span class="chip ok">✔ Verified owner</span> ':''}<span class="mute">${l.avail} of ${l.total} units free · confirmed ${fd(l.cf)}</span>${days(l.cf)>14?' <span class="chip few">Not recently updated</span>':''}${l.rp>=2?' <span class="chip full">Reported unavailable</span>':''}</p>
 ${l.up.length?`<div class="mute">Upcoming: ${l.up.map(u=>fd(u.d)+' ('+UP[u.s]+')').join(', ')}</div>`:''}</div>
 <div class="price"><b>${peso(l.price)}</b><div class="mute">per month</div><button class="btn sm" data-act="view" data-id="${l.id}">View details</button></div></div>`};
function drawRes(){const el=$('#res');if(!el)return;let h='';
 if(ST==='loading'||ST==='slow')h='<div class="skel"></div>'.repeat(3)+(ST==='slow'?'<div class="card"><b>Still loading…</b><div class="prog"><i></i></div><span class="mute">Your connection looks slow. Listings will show as soon as they arrive. You can keep this page open.</span></div>':'');
 else if(ST==='error')h=stateBox('⚠️','We couldn’t load the listings','Something went wrong on our side. Check your connection, then try again.','<button class="btn" data-act="retry">Try again</button>');
 else{const all=vis(),L=all.filter(match);
  if(ST==='offline')h='<div class="card" style="border-color:var(--bad)">You’re offline. Showing saved listings. Availability may be out of date.</div>';
  if(!all.length)h+=stateBox('🏠','No listings yet','Be the first to add a place. Owners can post a listing for free.','<a class="btn" href="#/owner">List your property</a>');
  else if(!L.length)h+=stateBox('🔍','No places match your search','Try one of these instead:','<button class="btn sec" data-act="clear">Clear filters</button> <button class="btn sec" data-act="more">Add ₱1,000 to budget</button> <button class="btn sec" data-act="allb">Search all barangays</button>');
  else h+=`<p class="mute">${L.length} place(s) found</p>`+L.map(card).join('');
  drawMap(L)}
 el.innerHTML=h}
function drawMap(L){if(!map)return;layer.clearLayers();const c={ok:'#1b8a4b',few:'#b97a00',full:'#b3342f'};
 L.forEach(l=>L&&window.L.circleMarker([l.lat,l.lng],{radius:10,color:'#fff',weight:2,fillColor:c[stt(l)[0]],fillOpacity:1}).addTo(layer).bindPopup(`<b>${esc(l.name)}</b><br>${stt(l)[1]}: ${l.avail} of ${l.total} free<br>${peso(l.price)}/month`))}
function sync(){const f=$('#sf');if(!f)return;F={...F,brgy:f.brgy.value,type:f.type.value,max:f.max.value,sch:f.sch.value,km:f.km.value,av:$('#av').checked,q:$('#fq').value};if(F.sch)delete F.me;drawRes()}

// ---------- pages ----------
function header(){const n=S?D.N.filter(x=>x.to===S.email&&!x.r).length:0;
 $('#hd').innerHTML=`<div class="bar"><a class="logo" href="#/">Tirahan<span>Hub</span></a><nav><a class="nl" href="#/">Find a place</a><a class="nl" href="#/owner">List your property</a>
 ${S?`<button class="nl bell" data-act="bell" aria-label="Notifications">🔔${n?`<b>${n}</b>`:''}</button><span>${esc(S.name)}</span><button class="nl" data-act="out">Sign out</button>`:'<button class="nl" data-act="in">Sign in</button>'}</nav></div>`}
function home(){const o=k=>Object.keys(k).sort().map(b=>`<option>${b}</option>`).join('');
 $('#app').innerHTML=`<section class="hero"><h1>Find an apartment or dorm in Lipa City</h1><p>See which places still have rooms before you go.</p></section>
 <div class="wrap"><form class="search" id="sf"><div><label>Barangay</label><select name="brgy"><option value="">All of Lipa City</option>${o(B)}</select></div>
 <div><label>Type</label><select name="type"><option value="">Any</option><option>Apartment</option><option>Dormitory</option><option>Bedspace</option></select></div>
 <div><label>Max budget (₱/month)</label><input name="max" type="number" min="0" placeholder="e.g. 4000"></div>
 <div><label>Near school or work</label><select name="sch"><option value="">Anywhere</option>${o(SC)}</select></div>
 <div><label>Within</label><select name="km"><option value="">Any distance</option><option value="1">1 km</option><option value="2">2 km</option><option value="3">3 km</option><option value="5">5 km</option></select></div>
 <button class="btn">Search</button></form>
 <div class="layout"><aside><div class="card"><b>Refine</b><label style="margin-top:8px"><input type="checkbox" id="av" style="width:auto"> Only places with vacancy</label>
 <label style="margin-top:8px">Name or address</label><input id="fq"><p><button class="btn sec sm" data-act="geo">📍 Use my location</button></p><div id="geo"></div><p class="mute">Distances are straight-line estimates.</p></div></aside>
 <section><button class="btn sec sm" data-act="map" style="margin-bottom:10px">Show map</button><div id="map"></div><div id="res"></div></section></div></div>`;
 const f=$('#sf');f.brgy.value=F.brgy;f.type.value=F.type;f.max.value=F.max;f.sch.value=F.sch;f.km.value=F.km;$('#av').checked=F.av;$('#fq').value=F.q;map=null}
const loginCard=r=>`<div class="wrap" style="max-width:420px;padding-top:40px"><div class="card"><h2 style="margin-top:0">${r==='admin'?'Administrator':'Owner'} sign in</h2>
 <form id="lg" data-r="${r}" novalidate><label>Email</label><input name="email" type="email" autocomplete="username"><label style="margin-top:8px">Password</label><input name="pw" type="password" autocomplete="current-password"><p><button class="btn">Sign in</button></p></form>${r==='owner'?'<p class="mute">New owner? <button class="btn sec sm" type="button" data-act="reg">Create an account</button></p>':''}</div></div>`;
const denied=a=>$('#app').innerHTML=`<div class="wrap" style="padding-top:30px">${stateBox('🔒','You don’t have access to this page',`This page is only for ${a}. You’re signed in as ${esc(S.name)}, so we can’t show it.`,'<a class="btn" href="#/">Back to search</a> <button class="btn sec" data-act="out">Switch account</button>')}</div>`;
const vo=l=>!!STAFF[l.own]||D.O.some(o=>o.email===l.own&&o.status==='verified');
const ownerRec=()=>STAFF[S.email]?{status:'verified',docs:[]}:D.O.find(o=>o.email===S.email)||{status:'pending',docs:[]};
const docFields=()=>[['idf','Valid government ID',0],['own','Proof of ownership (land title, tax declaration, or authorization letter)',0],['perm','Business or barangay permit',1]].map(([n,t,o])=>`<label style="margin-top:8px">${t}${o?' (optional)':''}</label><input name="${n}" type="file" accept=".jpg,.jpeg,.png,.pdf">`).join('')+'<p class="mute">JPG, PNG, or PDF, up to 5 MB each. Only the administrator can see your documents.</p>';
const regCard=()=>`<div class="wrap" style="max-width:480px;padding-top:30px"><div class="card"><h2 style="margin-top:0">Create an owner account</h2><form id="rg" novalidate><label>Full name</label><input name="name"><label style="margin-top:8px">Email</label><input name="email" type="email"><label style="margin-top:8px">Password (at least 6 characters)</label><input name="pw" type="password"><label style="margin-top:8px">Contact number</label><input name="ph" placeholder="09XXXXXXXXX">${docFields()}<p><button class="btn">Create account and send documents</button> <button class="btn sec" type="button" data-act="login">I already have an account</button></p></form></div></div>`;
const verifyPg=me=>`<div class="wrap" style="max-width:560px;padding-top:30px"><div class="card"><h2 style="margin-top:0">${me.status==='rejected'?'Your verification needs changes':'Verification in progress'}</h2>${me.status==='rejected'?`<p class="err" style="font-size:15px">Reason: ${esc(me.reason)}</p><p class="mute">Upload your documents again. An administrator will review them after you submit.</p>`:'<p>We received your documents and an administrator is checking them. You can post listings once you’re verified. We’ll notify you when it’s done.</p>'}<p class="mute">Submitted: ${me.docs.map(d=>esc(d.k)+' ('+esc(d.n)+')').join(', ')||'none'}</p></div>${me.status==='rejected'?`<div class="card"><form id="rs" novalidate>${docFields()}<p><button class="btn">Submit again</button></p></form></div>`:''}</div>`;
const oc=l=>`<div class="card"><b>${esc(l.name)}</b> ${chip(l)} <span class="chip gray">${l.st}</span><p class="mute">${l.avail} of ${l.total} units free · confirmed ${fd(l.cf)}${days(l.cf)>14?' · <b style="color:var(--few)">Please reconfirm</b>':''}${l.rp>=2?' · <b style="color:var(--bad)">Users reported this as unavailable</b>':''}</p>
 <button class="btn sec sm" data-act="dec" data-id="${l.id}">Unit rented (−1)</button> <button class="btn sec sm" data-act="inc" data-id="${l.id}">Unit vacated (+1)</button> <button class="btn sm" data-act="rc" data-id="${l.id}">Details are still accurate</button>
 <h4 style="margin:12px 0 4px">Upcoming vacancies</h4>${l.up.map(u=>`<div>${fd(u.d)} · ${UP[u.s]} ${u.s==='requested'?`<button class="btn sm" data-act="mres" data-id="${l.id}" data-u="${u.id}">Mark as Reserved</button>`:''}${u.s==='reserved'?`<button class="btn sec sm" data-act="rel" data-id="${l.id}" data-u="${u.id}">Release</button>`:''}</div>`).join('')||'<p class="mute">None posted.</p>'}
 <div style="display:flex;gap:6px;margin-top:6px"><input type="date" id="d${l.id}" style="max-width:180px"><button class="btn sec sm" data-act="addup" data-id="${l.id}">Post upcoming vacancy</button></div></div>`;
function ownerPg(){if(!S){$('#app').innerHTML=loginCard('owner');return}if(S.role!=='owner')return denied('property owners');const me=ownerRec();if(me.status!=='verified')return $('#app').innerHTML=verifyPg(me);
 const mine=D.L.filter(l=>l.own===S.email),ids=mine.map(l=>l.id),th=D.C.filter(c=>ids.includes(c.id));
 $('#app').innerHTML=`<div class="wrap" style="padding-top:20px"><h1>Owner dashboard</h1><p class="mute">Signed in as ${esc(S.name)} · <span class="chip ok">✔ Verified owner</span></p>
 ${mine.length?mine.map(oc).join(''):stateBox('🏠','You have no listings yet','Add your first property below. It goes live after an administrator approves it.')}
 <div class="card"><h3 style="margin-top:0">Add a listing</h3><form id="nl" class="g2" novalidate><div class="f"><label>Property name</label><input name="name"></div>
 <div><label>Type</label><select name="type"><option>Apartment</option><option>Dormitory</option><option>Bedspace</option></select></div>
 <div><label>Barangay</label><select name="brgy">${Object.keys(B).sort().map(b=>`<option>${b}</option>`).join('')}</select></div>
 <div class="f"><label>Address</label><input name="addr"></div><div><label>Monthly rate (₱)</label><input name="price" type="number"></div><div><label>Contact number</label><input name="ph" placeholder="09XXXXXXXXX"></div>
 <div><label>Total units</label><input name="total" type="number"></div><div><label>Units available now</label><input name="avail" type="number"></div>
 <div class="f"><label>House rules (curfew, deposit, gender)</label><input name="rules"></div><div class="f"><button class="btn">Submit for approval</button></div></form></div>
 <div class="card"><h3 style="margin-top:0">Verify a tenant</h3><p class="mute">Verified tenants can write reviews for your property.</p><form id="tn" class="g2" novalidate><div><label>Property</label><select name="lid">${mine.map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select></div><div><label>Tenant email</label><input name="email" type="email"></div><div class="f"><button class="btn sec">Verify tenant</button></div></form></div>
 <div class="card"><h3 style="margin-top:0">Messages</h3>${th.length?th.map((c,i)=>`<div><b>${esc(c.n)}</b> about ${esc(D.L.find(l=>l.id===c.id).name)}${c.m.map(m=>`<div class="msg ${m.f==='o'?'me':''}">${esc(m.t)}</div>`).join('')}<form class="rp" data-c="${D.C.indexOf(c)}"><input name="t" placeholder="Write a reply"><button class="btn sm" style="margin-top:4px">Send</button></form></div>`).join('<hr>'):'<p class="mute">No messages yet. When a seeker writes to you, it will show up here.</p>'}</div></div>`}
function adminPg(){if(!S){$('#app').innerHTML=loginCard('admin');return}if(S.role!=='admin')return denied('administrators');
 const ap=vis(),pd=D.L.filter(l=>l.st==='pending'),rest=D.L.filter(l=>l.st!=='pending');
 $('#app').innerHTML=`<div class="wrap" style="padding-top:20px"><h1>Administrator panel</h1><div class="g2">${Object.keys(B).sort().map(b=>{const x=ap.filter(l=>l.brgy===b);return `<div class="card"><b>${b}</b><br>${x.length} listing(s) · ${x.reduce((s,l)=>s+l.avail,0)} vacant unit(s)</div>`}).join('')}</div>
 <h3>Owner verification (${D.O.filter(o=>o.status==='pending').length})</h3>${D.O.filter(o=>o.status==='pending').map(o=>{const i=D.O.indexOf(o);return `<div class="card"><b>${esc(o.name)}</b> <span class="mute">${esc(o.email)} · ${esc(o.ph)}</span><p class="mute">Documents: ${o.docs.map(d=>esc(d.k)+' ('+esc(d.n)+')').join(', ')||'none'}</p><input id="rj${i}" placeholder="Reason (needed to reject)"><p><button class="btn sm" data-act="oa" data-e="${esc(o.email)}">Verify owner</button> <button class="btn bad sm" data-act="or" data-i="${i}">Reject</button></p></div>`}).join('')||'<p class="mute">No owners are waiting.</p>'}
 <h3>Waiting for approval (${pd.length})</h3>${pd.map(l=>`<div class="card"><b>${esc(l.name)}</b> <span class="mute">${l.type}, ${l.brgy}, owner ${esc(l.ownN)}</span><br><button class="btn sm" data-act="ap" data-id="${l.id}">Approve</button> <button class="btn bad sm" data-act="dn" data-id="${l.id}">Reject</button></div>`).join('')||'<p class="mute">Nothing is waiting.</p>'}
 <h3>All listings</h3>${rest.map(l=>`<div class="card"><b>${esc(l.name)}</b> <span class="chip gray">${l.st}</span> <span class="mute">${l.brgy} · ${l.avail}/${l.total} free</span><br>${l.st==='approved'?`<button class="btn bad sm" data-act="dn" data-id="${l.id}">Take down</button>`:`<button class="btn sm" data-act="ap" data-id="${l.id}">Restore</button>`}</div>`).join('')}</div>`}
function route(){const h=location.hash;header();if($('#dlg').open)$('#dlg').close();scrollTo(0,0);
 if(h==='#/owner')ownerPg();else if(h==='#/admin')adminPg();else{home();load()}}

// ---------- listing details, cost, reviews, chat ----------
function calc(){const f=$('#cc');if(!f)return;const l=D.L.find(x=>x.id===+f.dataset.id),v=n=>+f[n].value||0;
 $('#ccr').innerHTML=`Monthly: <b>${peso(l.price+v('u')+v('t'))}</b> · Move-in: <b>${peso(l.price*(v('a')+v('d')))}</b> <span class="mute">(estimate only)</span>`}
function detail(id){const l=D.L.find(x=>x.id===id),d=dist(l),sk=S&&S.role==='seeker',fl=sk&&D.F.some(f=>f.id===id&&f.e===S.email),tn=sk&&D.T.some(t=>t.id===id&&t.e===S.email),c=sk&&D.C.find(x=>x.id===id&&x.e===S.email),rv=D.R.filter(r=>r.id===id);
 dlg(`<h2 style="margin:0">${esc(l.name)} ${chip(l)}</h2><p class="mute">${l.type} · ${esc(l.brgy)} · ${esc(l.addr)}${d!=null?` · ${d.toFixed(1)} km away`:''}</p>
 <p><b style="font-size:20px;color:var(--acc)">${peso(l.price)}</b> per month · ${l.avail} of ${l.total} units free</p>
 <p class="mute">Last confirmed ${fd(l.cf)}${days(l.cf)>14?' · <b style="color:var(--few)">Not recently updated</b>':''}${l.rp>=2?' · <b style="color:var(--bad)">Users reported this as unavailable</b>':''}</p>
 <p>${esc(l.rules)}</p><p>Owner: ${esc(l.ownN)}${vo(l)?' <span class="chip ok">✔ Verified owner</span>':''} · <a href="tel:${esc(l.ph)}">${esc(l.ph)}</a></p>
 <div class="card"><b>Is this still available?</b> <button class="btn sec sm" data-act="yes" data-id="${id}">Yes</button> <button class="btn sec sm" data-act="no" data-id="${id}">No</button>
 ${l.avail<=0?` <button class="btn sm" data-act="follow" data-id="${id}">${fl?'✓ You’ll be notified':'🔔 Notify me when a unit opens'}</button>`:''}</div>
 ${l.up.length?`<div class="card"><b>Upcoming vacancies</b>${l.up.map(u=>`<div>${fd(u.d)} · ${u.s==='open'?`<button class="btn sm" data-act="resv" data-id="${id}" data-u="${u.id}">Reserve</button>`:u.s==='requested'&&u.by===S?.email?'Your request is waiting for the owner':`<span class="chip ${u.s==='reserved'?'gray':'few'}">${UP[u.s]}</span>`}</div>`).join('')}<p class="mute">Deposit and payment are agreed directly with the owner. No payment is made on this site.</p></div>`:''}
 <div class="card"><b>Estimate your cost</b><form id="cc" data-id="${id}" class="g2"><div><label>Advance (months)</label><input name="a" type="number" min="0" value="1"></div><div><label>Deposit (months)</label><input name="d" type="number" min="0" value="1"></div><div><label>Utilities per month (₱)</label><input name="u" type="number" min="0" value="800"></div><div><label>Transport per month (₱)</label><input name="t" type="number" min="0" value="0"></div></form><p id="ccr"></p></div>
 <div class="card"><b>Reviews from verified tenants</b>${rv.map(r=>`<p>${'★'.repeat(r.rt)} <b>${esc(r.name)}</b> <span class="mute">${fd(r.ts)}</span><br>${esc(r.tx)}</p>`).join('')||'<p class="mute">No reviews yet.</p>'}
 ${tn?`<form id="rv" data-id="${id}" novalidate><label>Rating</label><select name="rt"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><label style="margin-top:6px">Your review</label><textarea name="tx" rows="2"></textarea><p><button class="btn sm">Post review</button></p></form>`:`<p class="mute">Only tenants verified by the owner can write a review. If you live here, ask the owner to verify your email.</p>`}</div>
 <div class="card"><b>Message the owner</b>${sk?`${c?c.m.map(m=>`<div class="msg ${m.f==='s'?'me':''}">${esc(m.t)}</div>`).join(''):'<p class="mute">No messages yet. Ask about rooms, rules, or a viewing.</p>'}<form id="ch" data-id="${id}" novalidate><input name="t" placeholder="Write a message"><button class="btn sm" style="margin-top:4px">Send</button></form>`:'<p class="mute">Sign in to message the owner.</p><button class="btn sm" data-act="in">Sign in</button>'}</div>`);calc()}
const needSeeker=fn=>{if(S&&S.role==='seeker')fn();else{pend=fn;dlg(`<h3>Sign in to continue</h3><form id="sg" novalidate><label>Your name</label><input name="name"><label style="margin-top:6px">Email</label><input name="email" type="email"><p class="mute">We use your email to send alerts and to let owners reply.</p><button class="btn">Continue</button></form>`)}};
const reopen=id=>{if($('#dlg').open)detail(id)};

// ---------- assistant (answers from the listings on this site) ----------
const SK={batstate:'BatStateU Lipa',salle:'De La Salle Lipa','nu lipa':'NU Lipa','city colleges':'Lipa City Colleges'};
function ask(q){q=q.toLowerCase();const b=Object.keys(B).find(x=>q.includes(x.toLowerCase())),m=q.match(/(\d[\d,]*)/),mx=m?+m[1].replace(/,/g,''):0,t=['apartment','dorm','bedspace'].find(x=>q.includes(x)),sc=SK[Object.keys(SK).find(k=>q.includes(k))];
 let r=vis().filter(l=>l.avail>0&&(!b||l.brgy===b)&&(!mx||l.price<=mx)&&(!t||l.type.toLowerCase().startsWith(t)));
 if(sc)r.sort((x,y)=>km(SC[sc],[x.lat,x.lng])-km(SC[sc],[y.lat,y.lng]));else r.sort((x,y)=>x.price-y.price);
 return r.length?`Here are places with vacancies${sc?' closest to '+sc:''}:`+r.slice(0,3).map(l=>`<div class="card" style="margin:6px 0"><b>${esc(l.name)}</b> · ${peso(l.price)} · ${esc(l.brgy)}${sc?` · ${km(SC[sc],[l.lat,l.lng]).toFixed(1)} km`:''}<br><button class="btn sm" data-act="view" data-id="${l.id}">View details</button></div>`).join(''):'I couldn’t find a match. Try a higher budget, another barangay, or ask without a type. Please confirm details with the owner before visiting.'}

// ---------- events ----------
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=+b.dataset.id,l=D.L.find(x=>x.id===id),u=l&&l.up.find(x=>x.id===b.dataset.u);
 const go=()=>{save();route()};
 if(a==='close')$('#dlg').close();
 else if(a==='retry')load();
 else if(a==='clear'){F={brgy:'',type:'',max:'',av:false,sch:'',km:'',q:''};home();drawRes()}
 else if(a==='more'){F.max=(+F.max||0)+1000;$('#sf').max.value=F.max;drawRes()}
 else if(a==='allb'){F.brgy='';$('#sf').brgy.value='';drawRes()}
 else if(a==='map'){const m=$('#map');m.style.display=m.style.display==='block'?'none':'block';b.textContent=m.style.display==='block'?'Hide map':'Show map';if(!map){map=window.L.map('map').setView(B.Marawoy,13);window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);layer=window.L.layerGroup().addTo(map)}setTimeout(()=>{map.invalidateSize();drawRes()},50)}
 else if(a==='geo'){const g=$('#geo');if(!navigator.geolocation){g.innerHTML='<div class="err">Your browser can’t share location. Pick a school or workplace above instead.</div>';return}
  navigator.geolocation.getCurrentPosition(p=>{F.me=[p.coords.latitude,p.coords.longitude];g.innerHTML='<span class="mute">Using your location.</span>';drawRes()},er=>{g.innerHTML=`<div class="err">${er.code===1?'Location access is blocked. We only use it to show how far each place is from you. You can allow it in your browser settings, or pick a school or workplace above.':'We couldn’t find your location. Pick a school or workplace above instead.'}</div>`})}
 else if(a==='view')detail(id);
 else if(a==='yes'||a==='no')needSeeker(()=>{if(a==='yes'){l.cf=new Date().toISOString();l.rp=0}else{l.rp++;if(l.rp===2)note(l.own,`Users reported that ${l.name} may no longer have units. Please check your listing.`)}save();toast('Thanks. Your answer helps other seekers.');reopen(id);drawRes()});
 else if(a==='follow')needSeeker(()=>{const i=D.F.findIndex(f=>f.id===id&&f.e===S.email);if(i>=0){D.F.splice(i,1);save();toast('Alert removed.');reopen(id)}else{D.F.push({id,e:S.email});save();done('You’ll be notified',`We’ll alert you when ${esc(l.name)} has a free unit. Next: watch the bell icon at the top of the page.`)}});
 else if(a==='resv')needSeeker(()=>{u.s='requested';u.by=S.email;note(l.own,`${S.name} asked to reserve the unit opening ${fd(u.d)} at ${l.name}.`);save();done('Reservation requested','The owner will review your request. Once confirmed, the unit shows as Reserved so other people know. Next: message the owner to agree on the deposit and payment.',`<button class="btn" data-act="view" data-id="${id}">Message the owner</button>`);drawRes()});
 else if(a==='in')needSeeker(()=>{header();toast('Signed in.')});
 else if(a==='out'){S=null;save();location.hash='#/';route()}
 else if(a==='bell'){const n=D.N.filter(x=>x.to===S.email).reverse();dlg(`<h3>Notifications</h3>${n.length?n.map(x=>`<div class="card">${esc(x.text)}<div class="mute">${fd(x.ts)}</div></div>`).join(''):stateBox('🔔','No notifications yet','Alerts about your follows, reservations, and messages will show up here.')}`);n.forEach(x=>x.r=1);save();header()}
 else if(a==='ai')dlg(`<h3>Ask TirahanHub</h3><p class="mute">Try: “dorm under 3000 near BatStateU” or “apartment in Sabang”. I answer from the listings on this site.</p><div id="ar"></div><form id="af"><input name="q" placeholder="What are you looking for?"><button class="btn sm" style="margin-top:4px">Ask</button></form>`)
 else if(a==='inc'){const was=l.avail;l.avail=Math.min(l.total,l.avail+1);l.cf=new Date().toISOString();if(was===0)D.F.filter(f=>f.id===id).forEach(f=>note(f.e,`Good news: ${l.name} now has a free unit.`));D.F=D.F.filter(f=>!(f.id===id&&was===0));go()}
 else if(a==='dec'){l.avail=Math.max(0,l.avail-1);l.cf=new Date().toISOString();go()}
 else if(a==='rc'){l.cf=new Date().toISOString();l.rp=0;toast('Listing reconfirmed.');go()}
 else if(a==='addup'){const i=$('#d'+id);$$('.err',i.parentNode).forEach(x=>x.remove());if(!i.value||new Date(i.value)<new Date())return fe(i,'Pick a date in the future.');l.up.push({id:'u'+Date.now(),d:i.value,s:'open',by:''});toast('Upcoming vacancy posted.');go()}
 else if(a==='mres'){u.s='reserved';note(u.by,`Your reservation at ${l.name} is confirmed. Contact the owner for the next steps.`);go()}
 else if(a==='rel'){u.s='open';u.by='';go()}
 else if(a==='oa'){const o=D.O.find(x=>x.email===b.dataset.e);o.status='verified';note(o.email,'You’re verified. You can now post listings.');go()}
 else if(a==='or'){const i=$('#rj'+b.dataset.i);$$('.err',i.parentNode).forEach(x=>x.remove());if(!i.value.trim())return fe(i,'Write a reason so the owner knows what to fix.');const o=D.O[+b.dataset.i];o.status='rejected';o.reason=i.value.trim();note(o.email,'Your verification needs changes: '+o.reason);go()}
 else if(a==='reg')$('#app').innerHTML=regCard();
 else if(a==='login')ownerPg();
 else if(a==='ap'||a==='dn'){l.st=a==='ap'?'approved':'down';note(l.own,`${l.name} was ${a==='ap'?'approved and is now live':'removed from public view'}.`);go()}});
document.addEventListener('input',e=>{if(e.target.closest('#sf')||e.target.id==='av'||e.target.id==='fq')sync();if(e.target.closest('#cc'))calc()});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,v=n=>f.elements[n].value.trim();
 if(f.id==='sf')sync();
 else if(f.id==='sg'){if(check(f,{name:req('Enter your name.'),email:mail})){S={role:'seeker',name:v('name'),email:v('email').toLowerCase()};save();header();$('#dlg').close();if(pend){const p=pend;pend=null;p()}}}
 else if(f.id==='lg'){if(!check(f,{email:mail,pw:req('Enter your password.')}))return;const em=v('email').toLowerCase(),u=STAFF[em]||(D.O.find(o=>o.email===em)&&{...D.O.find(o=>o.email===em),role:'owner'});
  if(!u||u.pw!==v('pw'))return fe(f.elements.pw,'Wrong email or password. Check them and try again.');S={role:u.role,name:u.name,email:v('email').toLowerCase()};save();route()}
 else if(f.id==='nl'){if(!check(f,{name:req('Enter the property name.'),addr:req('Enter the address.'),price:num('Enter a rate above 0.',1),ph:x=>/^09\d{9}$/.test(x)?'':'Use an 11-digit number starting with 09.',total:num('Enter at least 1 unit.',1),avail:x=>num('Enter a number from 0 up to the total units.',0,+v('total')||0)(x)}))return;
  D.L.push(mk(Date.now()%1e6,v('name'),v('type'),v('brgy'),v('addr'),+v('price'),+v('total'),+v('avail'),S.email,v('rules')||'No rules listed.',0,[],'pending'));D.L.at(-1).ph=v('ph');D.L.at(-1).ownN=S.name;save();ownerPg();
  done('Listing submitted','An administrator will review your listing. Next: once it’s approved, it appears in search and you’ll get a notification.','<button class="btn" data-act="close">Back to dashboard</button>')}
 else if(f.id==='rg'||f.id==='rs'){const fl=(n,m,o)=>x=>!x?(o?'':m):!/\.(jpe?g|png|pdf)$/i.test(x)?'Use a JPG, PNG, or PDF file.':f.elements[n].files[0].size>5e6?'File is too big. Use one under 5 MB.':'';
  const r={idf:fl('idf','Upload your valid ID.'),own:fl('own','Upload a proof of ownership.'),perm:fl('perm','',1)};
  if(f.id==='rg')Object.assign(r,{name:req('Enter your full name.'),email:x=>mail(x)||(STAFF[x.toLowerCase()]||D.O.some(o=>o.email===x.toLowerCase())?'This email already has an account. Sign in instead.':''),pw:x=>x.length<6?'Use at least 6 characters.':'',ph:x=>/^09\d{9}$/.test(x)?'':'Use an 11-digit number starting with 09.'});
  if(!check(f,r))return;
  const docs=[['Valid ID','idf'],['Proof of ownership','own'],['Permit','perm']].filter(([,n])=>f.elements[n].files.length).map(([k,n])=>({k,n:f.elements[n].files[0].name}));
  if(f.id==='rg'){const em=v('email').toLowerCase();D.O.push({email:em,name:v('name'),pw:v('pw'),ph:v('ph'),status:'pending',reason:'',docs,ts:new Date().toISOString()});S={role:'owner',name:v('name'),email:em}}
  else{const o=D.O.find(x=>x.email===S.email);o.docs=docs;o.status='pending';o.reason=''}
  save();header();ownerPg();done('Documents sent','An administrator will check your documents. Next: you’ll get a notification when you’re verified, and then you can post listings.')}
 else if(f.id==='tn'){if(check(f,{email:mail})){D.T.push({id:+v('lid'),e:v('email').toLowerCase()});save();toast('Tenant verified. They can now write a review.');f.reset()}}
 else if(f.id==='rv'){if(check(f,{tx:req('Write a short review first.')})){D.R.push({id:+f.dataset.id,name:S.name,rt:+v('rt'),tx:v('tx'),ts:new Date().toISOString()});save();done('Review posted','Thanks for sharing your experience. Next: other seekers can now see it on the listing page.')}}
 else if(f.id==='ch'){if(check(f,{t:req('Type a message first.')})){const id=+f.dataset.id;let c=D.C.find(x=>x.id===id&&x.e===S.email);if(!c){c={id,e:S.email,n:S.name,m:[]};D.C.push(c)}c.m.push({f:'s',t:v('t')});note(D.L.find(x=>x.id===id).own,`New message from ${S.name}.`);save();detail(id)}}
 else if(f.classList.contains('rp')){if(!v('t'))return;const c=D.C[+f.dataset.c];c.m.push({f:'o',t:v('t')});note(c.e,'The owner replied to your message.');save();ownerPg()}
 else if(f.id==='af'){const q=v('q');if(q)$('#ar').innerHTML=`<div class="msg me">${esc(q)}</div><div class="msg">${ask(q)}</div>`;f.reset()}});
addEventListener('hashchange',route);
const net=()=>{$('#net').style.display=navigator.onLine?'none':'block';if(navigator.onLine&&ST==='offline')load()};
addEventListener('online',net);addEventListener('offline',()=>{net();if($('#res'))load()});
net();route();