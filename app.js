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
let D=JSON.parse(localStorage[KEY]||'null')||seed(),S=JSON.parse(sessionStorage[KEY+'_s']||localStorage[KEY+'_s']||'null');
if(!D.O)D.O=seed().O;D.U=D.U||[];D.Q=D.Q||[];D.A=D.A||{};
const save=()=>{localStorage[KEY]=JSON.stringify(D);const j=JSON.stringify(S);if(S&&S.rm){localStorage[KEY+'_s']=j;sessionStorage.removeItem(KEY+'_s')}else{if(S)sessionStorage[KEY+'_s']=j;else sessionStorage.removeItem(KEY+'_s');localStorage.removeItem(KEY+'_s')}};
let FB='',ST='loading',F={brgy:'',type:'',max:'',av:false,sch:'',km:'',q:''},map,layer,pend=null;
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
const match=l=>(!F.brgy||l.brgy===F.brgy)&&(!F.type||l.type===F.type)&&(!F.max||l.price<=+F.max)&&(!F.av||l.avail>0)&&(!F.up||l.up.length>0)&&(!F.q||(l.name+l.addr+l.brgy).toLowerCase().includes(F.q.toLowerCase()))&&(!F.km||!org()||dist(l)<=+F.km);
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
function header(){const n=S?D.N.filter(x=>x.to===S.email&&!x.r).length:0,h=location.hash||'#/';
 $('#hd').innerHTML=`<div class="bar"><a class="logo" href="#/">Tirahan<span>Hub</span></a><nav>${S?`<button class="nl bell" data-act="bell" aria-label="Notifications">🔔${n?`<b>${n}</b>`:''}</button>`:'<button class="nl" data-act="in">Sign in</button>'}</nav></div>`;
 $('#bn').innerHTML=[['#/','🏠','Home'],['#/stays','🔖','My Stays'],['#/ai','✨','AI Assistant'],['#/budget','🧮','Budget'],['#/more','👤','More']].map(([k,i,t])=>`<a href="${k}" class="${h===k?'on':''}"><i>${i}</i>${t}</a>`).join('')}
function home(){const o=k=>Object.keys(k).sort().map(b=>`<option>${b}</option>`).join('');
 $('#app').innerHTML=`<section class="hero"><h1>Hi${S?', '+esc(S.name.split(' ')[0]):''}, find your next home in Lipa City</h1><div class="tiles"><button data-act="tile" data-v="Apartment" style="background:#ffe3e3">Apartments<i>🏢</i></button><button data-act="tile" data-v="Dormitory" style="background:#efe0ff">Dormitories<i>🏫</i></button><button data-act="tile" data-v="Bedspace" style="background:#dff3ff">Bedspaces<i>🛏️</i></button><button data-act="tile" data-v="up" style="background:#fff3cf">Upcoming<i>📅</i></button></div>
 <div class="quick"><a href="#/ai"><i>✨</i>Ask AI</a><button data-act="tile" data-v="near"><i>📍</i>Near school</button><button data-act="tile" data-v="av"><i>✅</i>With vacancy</button><a href="#/budget"><i>🧮</i>Budget</a><a href="#/owner"><i>🏠</i>List yours</a></div></section>
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
const loginCard=r=>`<div class="authbg">${authCard(r,'in')}</div>`;
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
 ${qBlock(ids)}<div class="card"><h3 style="margin-top:0">Add a listing</h3><form id="nl" class="g2" novalidate><div class="f"><label>Property name</label><input name="name"></div>
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
 const pg={'#/owner':ownerPg,'#/admin':adminPg,'#/stays':staysPg,'#/ai':aiPg,'#/budget':budgetPg,'#/more':morePg}[h];if(pg)pg();else{home();load()}}

// ---------- listing details, cost, reviews, chat ----------
function calc(){const f=$('#cc');if(!f)return;const l=D.L.find(x=>x.id===+f.dataset.id),v=n=>+f[n].value||0;
 $('#ccr').innerHTML=`Monthly: <b>${peso(l.price+v('u')+v('t'))}</b> · Move-in: <b>${peso(l.price*(v('a')+v('d')))}</b> <span class="mute">(estimate only)</span>`}
function detail(id){const fb=FB;FB='';const l=D.L.find(x=>x.id===id),d=dist(l),sk=S&&S.role==='seeker',fl=sk&&D.F.some(f=>f.id===id&&f.e===S.email),tn=sk&&D.T.some(t=>t.id===id&&t.e===S.email),c=sk&&D.C.find(x=>x.id===id&&x.e===S.email),rv=D.R.filter(r=>r.id===id);
 dlg(`<h2 style="margin:0">${esc(l.name)} ${chip(l)}</h2><p class="mute">${l.type} · ${esc(l.brgy)} · ${esc(l.addr)}${d!=null?` · ${d.toFixed(1)} km away`:''}</p>
 <div id="dm" style="height:200px;border-radius:12px;margin:8px 0"></div><p><b style="font-size:20px;color:var(--acc)">${peso(l.price)}</b> per month · ${l.avail} of ${l.total} units free</p>
 <p class="mute">Last confirmed ${fd(l.cf)}${days(l.cf)>14?' · <b style="color:var(--few)">Not recently updated</b>':''}${l.rp>=2?' · <b style="color:var(--bad)">Users reported this as unavailable</b>':''}</p>
 <p>${esc(l.rules)}</p><p>Owner: ${esc(l.ownN)}${vo(l)?' <span class="chip ok">✔ Verified owner</span>':''} · <a href="tel:${esc(l.ph)}">${esc(l.ph)}</a></p>
 <div class="card"><button class="btn sec sm" data-act="ask" data-id="${id}">Is this still available?</button>${qst(id)}
 ${l.avail<=0?` <button class="btn sm" data-act="follow" data-id="${id}">${fl?'✓ You’ll be notified':'🔔 Notify me when a unit opens'}</button>`:''}<p class="mute" role="status" style="margin:6px 0 0">${esc(fb)}</p></div>
 ${l.up.length?`<div class="card"><b>Upcoming vacancies</b>${l.up.map(u=>`<div>${fd(u.d)} · ${u.s==='open'?`<button class="btn sm" data-act="resv" data-id="${id}" data-u="${u.id}">Reserve</button>`:u.s==='requested'&&u.by===S?.email?'Your request is waiting for the owner':`<span class="chip ${u.s==='reserved'?'gray':'few'}">${UP[u.s]}</span>`}</div>`).join('')}<p class="mute">Deposit and payment are agreed directly with the owner. No payment is made on this site.</p></div>`:''}

 <div class="card"><b>Reviews from verified tenants</b>${rv.map(r=>`<p>${'★'.repeat(r.rt)} <b>${esc(r.name)}</b> <span class="mute">${fd(r.ts)}</span><br>${esc(r.tx)}</p>`).join('')||'<p class="mute">No reviews yet.</p>'}
 ${tn?`<form id="rv" data-id="${id}" novalidate><label>Rating</label><select name="rt"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><label style="margin-top:6px">Your review</label><textarea name="tx" rows="2"></textarea><p><button class="btn sm">Post review</button></p></form>`:`<p class="mute">Only tenants verified by the owner can write a review. If you live here, ask the owner to verify your email.</p>`}</div>
 <div class="card"><b>Message the owner</b>${sk?`${c?c.m.map(m=>`<div class="msg ${m.f==='s'?'me':''}">${esc(m.t)}</div>`).join(''):'<p class="mute">No messages yet. Ask about rooms, rules, or a viewing.</p>'}<form id="ch" data-id="${id}" novalidate><input name="t" placeholder="Write a message"><button class="btn sm" style="margin-top:4px">Send</button></form>`:'<p class="mute">Sign in to message the owner.</p><button class="btn sm" data-act="in" data-id="'+id+'">Sign in</button>'}</div>`);dmap(l)}
const needSeeker=fn=>{if(S&&S.role==='seeker')fn();else{pend=fn;dlg(authCard('seeker','in'))}};
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
 else if(a==='ask')needSeeker(()=>{if(!D.Q.some(q=>q.id===id&&q.e===S.email&&q.st==='open')){D.Q.push({id,e:S.email,n:S.name,st:'open',ts:new Date().toISOString()});note(l.own,`${S.name} asked if ${l.name} is still available. Please answer in your dashboard.`)}save();FB='Your question was sent to the owner. You’ll get a notification with the answer.';reopen(id)});
 else if(a==='follow')needSeeker(()=>{const i=D.F.findIndex(f=>f.id===id&&f.e===S.email);if(i>=0){D.F.splice(i,1);save();FB='Alert removed. You won’t be notified.';reopen(id)}else{D.F.push({id,e:S.email});save();done('You’ll be notified',`We’ll alert you when ${esc(l.name)} has a free unit. Next: watch the bell icon at the top of the page.`)}});
 else if(a==='resv')needSeeker(()=>{u.s='requested';u.by=S.email;note(l.own,`${S.name} asked to reserve the unit opening ${fd(u.d)} at ${l.name}.`);save();done('Reservation requested','The owner will review your request. Once confirmed, the unit shows as Reserved so other people know. Next: message the owner to agree on the deposit and payment.',`<button class="btn" data-act="view" data-id="${id}">Message the owner</button>`);drawRes()});
 else if(a==='in')needSeeker(()=>{header();if(isNaN(id)){$('#dlg').close();route();toast('Signed in.')}else detail(id)});
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
 else if(a==='tile'){const w=b.dataset.v;if(w==='up')F.up=true;else if(w==='av')F.av=true;else if(w==='near')F.sch='BatStateU Lipa';else F.type=w;const f=$('#sf');f.type.value=F.type;f.sch.value=F.sch;$('#av').checked=F.av;drawRes();$('#res').scrollIntoView({behavior:'smooth'})}
 else if(a==='qy'||a==='qn'){const x=D.Q[+b.dataset.q],ll=D.L.find(k=>k.id===x.id);x.st=a==='qy'?'yes':'no';if(a==='qy')ll.cf=new Date().toISOString();else ll.avail=0;note(x.e,a==='qy'?`Good news: ${ll.name} is still available.`:`${ll.name} is no longer available. Tap Notify me to be alerted if a unit opens.`);go()}
 else if(a==='fgt'||a==='sin'||a==='sup'){const r=b.dataset.r;if(a==='sup'&&r==='owner')$('#app').innerHTML=regCard();else b.closest('.auth').outerHTML=authCard(r,a==='fgt'?'fg':a==='sup'?'up':'in')}
 else if(a==='nc'){AC=null;aiPg()}
 else if(a==='oc'){AC=D.A[S.email][+b.dataset.i];aiPg()}
 else if(a==='aq')send(b.dataset.q)
 else if(a==='ap'||a==='dn'){l.st=a==='ap'?'approved':'down';note(l.own,`${l.name} was ${a==='ap'?'approved and is now live':'removed from public view'}.`);go()}});
document.addEventListener('input',e=>{if(e.target.closest('#sf')||e.target.id==='av'||e.target.id==='fq')sync();if(e.target.closest('#bc'))bcalc()});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,v=n=>f.elements[n].value.trim();
 if(f.id==='sf')sync();
 else if(f.id==='sg'){if(check(f,{name:req('Enter your name.'),email:mail})){S={role:'seeker',name:v('name'),email:v('email').toLowerCase()};save();header();if(pend){const p=pend;pend=null;p()}else $('#dlg').close();}}
 else if(f.id==='lg'){if(!check(f,{email:mail,pw:req('Enter your password.')}))return;const r=f.dataset.r,em=v('email').toLowerCase(),u=r==='seeker'?(D.U.find(x=>x.email===em)&&{...D.U.find(x=>x.email===em),role:'seeker'}):STAFF[em]||(D.O.find(o=>o.email===em)&&{...D.O.find(o=>o.email===em),role:'owner'});
  if(!u||u.pw!==v('pw'))return fe(f.elements.pw,'Wrong email or password. Check them and try again.');S={role:u.role,name:u.name,email:em,rm:f.elements.rm.checked};save();header();if(r==='seeker'&&pend){const p=pend;pend=null;p()}else{if($('#dlg').open)$('#dlg').close();route()}}
 else if(f.id==='su'){if(check(f,{name:req('Enter your name.'),email:x=>mail(x)||(D.U.some(u=>u.email===x.toLowerCase())?'This email already has an account. Login instead.':''),pw:x=>x.length<6?'Use at least 6 characters.':''})){const em=v('email').toLowerCase();D.U.push({email:em,name:v('name'),pw:v('pw')});S={role:'seeker',name:v('name'),email:em};save();header();if(pend){const p=pend;pend=null;p()}else{if($('#dlg').open)$('#dlg').close();route()}}}
 else if(f.id==='fg'){if(check(f,{email:mail}))f.parentNode.innerHTML='<h2>Check your email</h2><p class="mute">If an account exists for that email, we sent instructions to reset your password.</p>'}
 else if(f.id==='aif'){const q=v('q');if(q)send(q)}
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

// ---------- auth, stays, budget, more, map ----------
const authCard=(r,m='in')=>`<div class="auth"><h2>${m==='up'?'Create account':m==='fg'?'Reset password':'Welcome Back'}</h2><p class="mute">${m==='up'?'Sign up to get started':m==='fg'?'Enter your email and we’ll send reset instructions':`Login to your ${r==='admin'?'administrator ':r==='owner'?'owner ':''}account`}</p>
<form id="${m==='fg'?'fg':m==='up'?'su':'lg'}" data-r="${r}" novalidate>${m==='up'?'<input name="name" placeholder="Full name">':''}<input name="email" type="email" placeholder="Email address" autocomplete="username">${m==='fg'?'':'<input name="pw" type="password" placeholder="Password" autocomplete="current-password">'}
${m==='in'?`<div class="row2"><label class="rm"><input type="checkbox" name="rm"> Remember me</label><button type="button" class="lnk" data-act="fgt" data-r="${r}">Forgot password?</button></div>`:''}<button class="login">${m==='up'?'Sign up':m==='fg'?'Send instructions':'Login'}</button></form>
${r==='admin'?'':`<p class="mute c">${m==='in'?`Don’t have an account? <button type="button" class="lnk" data-act="sup" data-r="${r}">Sign up</button>`:`Already have an account? <button type="button" class="lnk" data-act="sin" data-r="${r}">Login</button>`}</p>`}</div>`;
const qst=id=>{const q=S&&D.Q.filter(x=>x.id===id&&x.e===S.email).pop();return q?` <span class="mute">${q.st==='open'?'Waiting for the owner’s answer.':q.st==='yes'?'✔ Owner: still available.':'✖ Owner: not available.'}</span>`:''};
const qBlock=ids=>{const q=D.Q.filter(x=>ids.includes(x.id)&&x.st==='open');return `<div class="card"><h3 style="margin-top:0">Is this still available? (${q.length})</h3>${q.map(x=>`<div style="margin:6px 0"><b>${esc(x.n)}</b> asks about ${esc(D.L.find(l=>l.id===x.id).name)}<br><button class="btn sm" data-act="qy" data-q="${D.Q.indexOf(x)}">Yes, still available</button> <button class="btn bad sm" data-act="qn" data-q="${D.Q.indexOf(x)}">No, not available</button></div>`).join('')||'<p class="mute">No questions right now.</p>'}</div>`};
function dmap(l){const m=window.L.map('dm',{scrollWheelZoom:false}).setView([l.lat,l.lng],15);window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(m);window.L.marker([l.lat,l.lng]).addTo(m).bindPopup(esc(l.name)).openPopup();setTimeout(()=>m.invalidateSize(),150)}
function staysPg(){if(!S||S.role!=='seeker'){$('#app').innerHTML=`<div class="wrap" style="padding-top:20px">${stateBox('🔖','Sign in to see your stays','Your alerts, reservations, and questions to owners show here.','<button class="btn" data-act="in">Sign in</button>')}</div>`;return}
 const fl=D.F.filter(f=>f.e===S.email).map(f=>D.L.find(l=>l.id===f.id)),rs=[];D.L.forEach(l=>l.up.forEach(u=>{if(u.by===S.email)rs.push([l,u])}));const qs=D.Q.filter(q=>q.e===S.email);
 $('#app').innerHTML=`<div class="wrap" style="padding-top:16px"><h2>My Stays</h2><h3>Notify me alerts</h3>${fl.map(l=>`<div class="card"><b>${esc(l.name)}</b> ${chip(l)}<br><button class="btn sm" data-act="view" data-id="${l.id}">View details</button></div>`).join('')||'<p class="mute">No alerts yet.</p>'}<h3>Reservations</h3>${rs.map(([l,u])=>`<div class="card"><b>${esc(l.name)}</b> · ${fd(u.d)} · ${UP[u.s]}</div>`).join('')||'<p class="mute">No reservations yet.</p>'}<h3>Questions to owners</h3>${qs.map(q=>`<div class="card"><b>${esc(D.L.find(l=>l.id===q.id).name)}</b><br>${q.st==='open'?'Waiting for the owner’s answer':q.st==='yes'?'✔ The owner says it’s still available':'✖ The owner says it’s not available'}</div>`).join('')||'<p class="mute">No questions yet.</p>'}</div>`}
function budgetPg(){$('#app').innerHTML=`<div class="wrap" style="padding-top:16px"><h2>Budget calculator</h2><p class="mute">Estimate your monthly and move-in cost. These are estimates only.</p><div class="card"><form id="bc" class="g2"><div class="f"><label>Choose a place (optional)</label><select name="l"><option value="">Enter the rent myself</option>${vis().map(l=>`<option value="${l.id}">${esc(l.name)} (${peso(l.price)})</option>`).join('')}</select></div><div><label>Monthly rent (₱)</label><input name="r" type="number" min="0" value="0"></div><div><label>Advance (months)</label><input name="a" type="number" min="0" value="1"></div><div><label>Deposit (months)</label><input name="d" type="number" min="0" value="1"></div><div><label>Utilities per month (₱)</label><input name="u" type="number" min="0" value="800"></div><div><label>Transport per month (₱)</label><input name="t" type="number" min="0" value="0"></div><div class="f"><label>Food per month (₱)</label><input name="f" type="number" min="0" value="0"></div></form><p id="bcr" style="font-size:17px"></p></div></div>`;bcalc()}
function bcalc(){const f=$('#bc');if(!f)return;const v=n=>+f[n].value||0;if(f.l.value&&document.activeElement===f.l)f.r.value=D.L.find(x=>x.id===+f.l.value).price;const r=v('r');$('#bcr').innerHTML=`Monthly: <b>${peso(r+v('u')+v('t')+v('f'))}</b><br>Move-in: <b>${peso(r*(v('a')+v('d')))}</b> <span class="mute">(rent × advance + deposit)</span>`}
function morePg(){const s=S;$('#app').innerHTML=`<div class="mh"><h2>${s?'Welcome, '+esc(s.name):'Welcome to TirahanHub'}</h2>${s?`<span class="chip ok">${s.role}</span>`:''}</div><div class="wrap"><div class="card"><b class="mute">My account</b>${s?'':'<p><button class="btn" data-act="in">Login or sign up</button></p>'}${[['#/stays','🔖','My stays'],['#/ai','✨','AI conversations'],['#/budget','🧮','Budget calculator']].map(([h,i,t])=>`<a class="li" href="${h}">${i} ${t}</a>`).join('')}${s?'<button class="li" data-act="bell">🔔 Notifications</button>':''}</div>
 <a class="card li" href="#/owner" style="color:var(--ok);font-weight:700">🏠 List your property on TirahanHub ›</a>
 <div class="card"><b class="mute">Settings</b><div class="li">🌐 Language <span class="mute">English</span></div><div class="li">📍 Distance <span class="mute">km</span></div></div>
 <div class="card"><b class="mute">Help and info</b><div class="li">ℹ️ About TirahanHub: a rental finder for Lipa City</div><div class="li">🎧 Need help? Ask the AI Assistant</div></div>${s?'<div class="card"><b class="mute">Manage your account</b><button class="li" data-act="out">↪ Sign out</button></div>':''}</div>`}

// ---------- AI assistant page ----------
let AC=null;const AI_URL='';// set to your back-end chat endpoint to use a real AI model
const AI_SYSTEM='You are the TirahanHub assistant. Only help with finding apartments, dormitories and bedspaces in Lipa City, renting tips, costs, and how to use TirahanHub. Politely decline other topics. Say when you are not sure.';
function kb(q,x){const t=q.toLowerCase(),has=(...w)=>w.some(k=>t.includes(k)),avg=ty=>{const a=vis().filter(l=>l.type===ty);return a.length?peso(Math.round(a.reduce((s,l)=>s+l.price,0)/a.length)):'no data yet'};
 const b=Object.keys(B).find(k=>t.includes(k.toLowerCase())),m=t.match(/(\d[\d,]{2,})/),ty=['apartment','dorm','bedspace'].find(k=>t.includes(k)),sc=SK[Object.keys(SK).find(k=>t.includes(k))];
 if(b)x.b=b;if(m)x.mx=+m[1].replace(/,/g,'');if(ty)x.t=ty;if(sc)x.sc=sc;if(has('cheaper'))x.mx=(x.mx||5000)-500;
 if((has('hello','hi','hey'))&&t.length<18)return 'Hi! I can help you find an apartment, dorm, or bedspace in Lipa City, compare costs, and explain how TirahanHub works. What do you need?';
 if(has('thank'))return 'You’re welcome! Ask me anything else about renting in Lipa City.';
 if(has('how much','average','typical','cost')&&!m)return `In TirahanHub listings, rent averages about <b>${avg('Bedspace')}</b> for a bedspace, <b>${avg('Dormitory')}</b> for a dorm, and <b>${avg('Apartment')}</b> for an apartment per month. Add advance and deposit (each owner sets these, often 1 to 2 months), plus utilities and transport. Use the <a href="#/budget">Budget tab</a> to compute your total.`;
 if(has('reserve','reservation','upcoming'))return 'Some places post <b>upcoming vacancies</b>, units that will open on a set date. Open the listing and tap <b>Reserve</b>. The owner reviews your request, and once confirmed the unit shows as <b>Reserved</b> so others know. TirahanHub takes no payments. Agree on the deposit directly with the owner and ask for a receipt.';
 if(has('notify','alert'))return 'If a place is full, open it and tap <b>Notify me when a unit opens</b>. When the owner marks a unit vacant, you get a notification (bell icon). Sign in is needed so we know where to send it.';
 if(has('still available','is it available'))return 'On a listing, tap <b>Is this still available?</b>. Your question goes to the owner, who answers Yes or No. You’ll get a notification with the answer, and it also shows under My Stays.';
 if(has('verified','legit','scam','permit','fake','trust'))return 'Owners must submit a valid ID and proof of ownership (a permit if they have one), and an administrator reviews them. The <b>✔ Verified owner</b> badge means that check passed. Still, visit the place first and never send money before you’ve seen it and met the owner.';
 if(has('payment','pay ','gcash'))return 'TirahanHub does not process payments. You contact the owner through the site’s chat or phone number and agree on payment directly. Always ask for a receipt and a written note of what the deposit covers.';
 if(has('contract','refund','deposit'))return 'Ask for a written agreement that lists the rent and due date, the advance and deposit, when and how the deposit is refunded, the notice needed before leaving, and who pays for repairs. Keep every receipt. I’m not a lawyer, so for disputes ask your barangay or a legal adviser.';
 if(has('check','tips','before renting','inspect','what should'))return 'Before renting: <br>• Visit in daytime and ask for a viewing.<br>• Check water pressure, drainage, outlets, and ventilation.<br>• Ask about curfew, visitors, cooking, pets, and Wi-Fi.<br>• Look at security: gate, locks, and street lighting.<br>• Test the commute to your school or work.<br>• Ask the total move-in cost and the refund rules.<br>• Get the rules in writing and confirm the owner is verified.';
 if(has('safe','security'))return 'Check for a gate or guard, working locks, good lighting on the street, and a clear curfew. Visit at night once if you can, and read tenant reviews. Only verified tenants can review, so those are more reliable.';
 if(has('review'))return 'Only tenants verified by the owner can write reviews, so you can trust them more than random comments. You’ll find them on each listing page.';
 if(has('chat','message','contact'))return 'Open a listing and use <b>Message the owner</b> (you need to sign in). You can also call the number shown on the listing.';
 if(has('owner','list my','post my','document'))return 'To list a place, go to <b>More → List your property</b> and create an owner account. Upload a valid ID and proof of ownership (a permit is optional). After an administrator verifies you, you can post listings and keep availability updated.';
 if(has('how do i use','how does','how to','what is tirahan'))return 'TirahanHub shows apartments, dorms, and bedspaces in Lipa City and which ones still have rooms. Search or filter by barangay, type, budget, and distance to your school. Open a listing for the map, rules, and owner. Use Notify me, Reserve, chat, and the Budget tab to plan your move.';
 if(b||ty||sc||m||has('find','looking','recommend','suggest','show','cheaper','another','near')){let r=vis().filter(l=>l.avail>0&&(!x.b||l.brgy===x.b)&&(!x.mx||l.price<=x.mx)&&(!x.t||l.type.toLowerCase().startsWith(x.t)));
  if(x.sc)r.sort((p,q)=>km(SC[x.sc],[p.lat,p.lng])-km(SC[x.sc],[q.lat,q.lng]));else r.sort((p,q)=>p.price-q.price);
  const tag=[x.t,x.b&&'in '+x.b,x.mx&&'under '+peso(x.mx),x.sc&&'near '+x.sc].filter(Boolean).join(' ');
  return r.length?`Here ${r.length>3?'are 3 of '+r.length:'are '+r.length} option(s) with vacancies${tag?' ('+esc(tag)+')':''}:`+r.slice(0,3).map(l=>`<div class="card" style="margin:6px 0"><b>${esc(l.name)}</b> · ${peso(l.price)} · ${esc(l.brgy)}${x.sc?` · ${km(SC[x.sc],[l.lat,l.lng]).toFixed(1)} km`:''}<br><button class="btn sm" data-act="view" data-id="${l.id}">View details</button></div>`).join('')+'Want me to narrow it down? Tell me your budget, barangay, or school.':'I couldn’t find a place with vacancies for that. Try a higher budget, another barangay, or ask for upcoming vacancies.'}
 return 'I can help with finding apartments, dorms, and bedspaces in Lipa City, costs, renting tips, and using TirahanHub. Try: “Bedspace under ₱2,000 in Sabang.”'}
function aiPg(){const sk=S&&S.role==='seeker',cs=sk?(D.A[S.email]=D.A[S.email]||[]):[];if(sk&&AC&&!AC.g&&!cs.includes(AC))AC=cs[0]||null;if(!AC)AC={g:!sk,id:Date.now(),t:'New chat',m:[],x:{}};
 $('#app').innerHTML=`<div class="wrap ai"><div class="chatbar"><b>✨ AI Assistant</b><span class="chip gray">Beta</span>${sk?'<button class="btn sec sm" data-act="nc">+ New chat</button>':''}</div>
 ${sk?`<div class="convs">${cs.map((c,i)=>`<button class="btn sm ${c===AC?'':'sec'}" data-act="oc" data-i="${i}">${esc(c.t)}</button>`).join('')}</div>`:'<div class="card mute">You’re chatting as a guest. <button class="lnk" data-act="in">Sign in</button> to save your conversations.</div>'}
 <div id="thr">${AC.m.length?AC.m.map(m=>`<div class="msg ${m.r==='u'?'me':''}">${m.r==='u'?esc(m.t):m.t}</div>`).join(''):`<div class="state"><div class="big">✨</div><h3>Hi${S?', '+esc(S.name.split(' ')[0]):''}! Where do you want to live?</h3><div>${['Dorm under ₱3,000 near BatStateU','How do reservations work?','What should I check before renting?','How much should I budget?'].map(q=>`<button class="btn sec sm" style="margin:3px" data-act="aq" data-q="${q}">${q}</button>`).join('')}</div></div>`}</div>
 <form id="aif" class="aib" novalidate><input name="q" placeholder="Ask about renting in Lipa City" autocomplete="off"><button class="btn">Send</button></form><p class="mute c">I answer only about renting in Lipa City and using TirahanHub. I can make mistakes, so confirm details with the owner.</p></div>`;const t=$('#thr');t.scrollTop=t.scrollHeight}
async function send(q){const sk=S&&S.role==='seeker';if(sk&&!D.A[S.email].includes(AC))D.A[S.email].unshift(AC);if(!AC.m.length)AC.t=q.slice(0,28);AC.m.push({r:'u',t:q});aiPg();let a;
 try{a=AI_URL?await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:AI_SYSTEM,messages:AC.m.map(m=>({role:m.r==='u'?'user':'assistant',content:m.t})),listings:vis().map(l=>({name:l.name,type:l.type,brgy:l.brgy,price:l.price,avail:l.avail}))})}).then(r=>r.json()).then(j=>esc(j.reply).replace(/\n/g,'<br>')):kb(q,AC.x)}catch(e){a=kb(q,AC.x)}
 AC.m.push({r:'a',t:a});if(sk)save();aiPg()}
addEventListener('hashchange',route);
const net=()=>{$('#net').style.display=navigator.onLine?'none':'block';if(navigator.onLine&&ST==='offline')load()};
addEventListener('online',net);addEventListener('offline',()=>{net();if($('#res'))load()});
net();route();
