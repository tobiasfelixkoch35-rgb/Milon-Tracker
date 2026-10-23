'use strict';
const KEY='milon_tracker_v1';
const defaults={
 'Bein-Progression':['Beinpresse','Latzug','Beinpresse','Rückenstrecker','Beinbeuger','Bauch','Beinbeuger','Adduktor','Abduktor','Beinstrecker','Rotator','Reverse Butterfly','Rudern','Bankdrücken','Adduktor','Abduktor','Beinstrecker','Wadenheben stehend','Wadenheben (Ersatzsatz)'],
 'Oberkörper-Progression':['Latzug','Rotator','Latzug','Reverse Butterfly','Rückenstrecker','Rudern','Bauch','Rudern','Reverse Butterfly','Bankdrücken','Adduktor','Abduktor','Beinpresse','Beinstrecker','Beinbeuger','Seitheben','Hammer-Curls','Trizeps über Kopf','Kurzhantel-Curls','Reverse Curls','Farmer’s Walk'],
 'Volumentag':['Latzug','Rückenstrecker','Bauch','Rotator','Reverse Butterfly','Rudern','Bankdrücken','Adduktor','Abduktor','Beinpresse','Beinstrecker','Beinbeuger','Latzug','Reverse Butterfly','Rudern','Beinbeuger','Seitheben','Hammer-Curls','Trizeps über Kopf','Kurzhantel-Curls','Reverse Curls']
};
const oldDefaults={
 'Bein-Progression':['Beinpresse','Beinbeuger','Beinstrecker','Adduktor','Abduktor'],
 'Oberkörper-Progression':['Latzug','Rotator','Latzug','Reverse Butterfly','Rückenstrecker','Rudern','Bauch','Rudern','Reverse Butterfly','Bankdrücken'],
 'Volumentag':['Latzug','Rudern','Reverse Butterfly','Bankdrücken']
};
let data;try{data=JSON.parse(localStorage.getItem(KEY))}catch{};
if(!data||!data.programs||!Array.isArray(data.sessions))data={programs:structuredClone(defaults),sessions:[],draft:null};
else {
 // Only upgrade unchanged original templates. Never overwrite custom programs or an active workout.
 for(const name of Object.keys(defaults)){
   if(!Array.isArray(data.programs[name]))data.programs[name]=[...defaults[name]];
   else if(JSON.stringify(data.programs[name])===JSON.stringify(oldDefaults[name]))data.programs[name]=[...defaults[name]];
 }
}
let page='train',program=Object.keys(data.programs)[0];
try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn('Speichern nicht möglich',e)}
const app=document.getElementById('app');
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notice(s){document.getElementById('notice').textContent=s;setTimeout(()=>document.getElementById('notice').textContent='',3500)}
function last(name,p,position){for(const s of [...data.sessions].reverse()){if(s.program!==p)continue;const candidate=s.exercises[position];const e=(candidate&&candidate.name===name&&candidate.sets.some(z=>z.reps))?candidate:s.exercises.find(x=>x.name===name&&x.sets.some(z=>z.reps));if(e)return e.sets.filter(z=>z.reps).map(z=>`${z.kg} kg × ${z.reps}`).join(' · ')}return 'Noch kein Eintrag'}
function newDraft(){data.draft={id:Date.now(),date:new Date().toISOString(),program,exercises:data.programs[program].map((name,i)=>({name,order:i,sets:[{kg:'',reps:'',rir:''}]}))};save()}
function changeProgram(v){program=v;render()}
function start(){newDraft();render()}
function field(i,j,k,v){data.draft.exercises[i].sets[j][k]=v;save()}
function addSet(i){data.draft.exercises[i].sets.push({kg:'',reps:'',rir:''});save();render()}
function removeSet(i,j){data.draft.exercises[i].sets.splice(j,1);save();render()}
function finish(){const d=data.draft;if(!d)return;const valid=d.exercises.some(e=>e.sets.some(s=>s.reps!==''&&s.kg!==''));if(!valid){notice('Bitte mindestens einen vollständigen Satz erfassen.');return}if(!confirm('Training abschließen und speichern?'))return;d.exercises.forEach(e=>e.sets=e.sets.filter(s=>s.reps!==''&&s.kg!==''));data.sessions.push(d);data.draft=null;save();notice('Training gespeichert');page='history';render()}
function discard(){if(confirm('Laufendes Training wirklich verwerfen?')){data.draft=null;save();render()}}
function train(){let h='<h2>Training</h2>';if(!data.draft){h+=`<div class="card"><label>Trainingsprogramm</label><select onchange="changeProgram(this.value)">${Object.keys(data.programs).map(p=>`<option ${p===program?'selected':''}>${esc(p)}</option>`).join('')}</select><p class="muted">${data.programs[program].length} Übungsstationen</p><button class="wide" onclick="start()">Training starten</button></div>`;h+=data.programs[program].map((e,i)=>`<div class="card"><strong>${i+1}. ${esc(e)}</strong><p class="muted">Zuletzt: ${esc(last(e,program,i))}</p></div>`).join('');return h}let d=data.draft;h+=`<div class="card"><span class="pill">Aktives Training</span><h2>${esc(d.program)}</h2><small>Begonnen: ${new Date(d.date).toLocaleString('de-DE')}</small></div>`;h+=d.exercises.map((e,i)=>`<section class="card"><strong>${i+1}. ${esc(e.name)}</strong><p class="muted">Zuletzt: ${esc(last(e.name,d.program,i))}</p><div class="set"><small>Satz</small><small>kg</small><small>Wdh.</small><small>RIR</small><small></small></div>${e.sets.map((s,j)=>`<div class="set"><small>${j+1}</small>${['kg','reps','rir'].map(k=>`<input aria-label="${k} Satz ${j+1}" type="number" inputmode="decimal" min="0" step="any" value="${esc(s[k])}" oninput="field(${i},${j},'${k}',this.value)">`).join('')}<button class="danger" aria-label="Satz entfernen" onclick="removeSet(${i},${j})">×</button></div>`).join('')}<button class="secondary" onclick="addSet(${i})">+ Satz</button></section>`).join('');h+='<button class="wide" onclick="finish()">✓ Training abschließen</button><p><button class="danger wide" onclick="discard()">Training verwerfen</button></p>';return h}
function history(){let h='<h2>Trainingsverlauf</h2>';if(!data.sessions.length)return h+'<div class="card">Noch keine gespeicherten Trainings.</div>';h+=`<div class="card"><strong>${data.sessions.length}</strong> Trainings gespeichert</div>`;return h+[...data.sessions].reverse().map(s=>`<details class="card"><summary>${new Date(s.date).toLocaleDateString('de-DE')} · ${esc(s.program)}</summary>${s.exercises.map(e=>`<p><strong>${esc(e.name)}</strong><br><small>${e.sets.map(z=>`${esc(z.kg)} kg × ${esc(z.reps)} Wdh.${z.rir!==''?' · RIR '+esc(z.rir):''}`).join(' | ')||'–'}</small></p>`).join('')}</details>`).join('')}
function renameExercise(p,i,v){data.programs[p][i]=v.trim()||data.programs[p][i];save()}
function addExercise(p){let v=prompt('Name der neuen Übung');if(v&&v.trim()){data.programs[p].push(v.trim());save();render()}}
function deleteExercise(p,i){if(confirm('Übung aus Vorlage entfernen?')){data.programs[p].splice(i,1);save();render()}}
function moveExercise(p,i,d){let a=data.programs[p],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save();render()}
function exportData(){let b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='milon-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importData(el){let f=el.files[0];if(!f)return;f.text().then(t=>{try{let v=JSON.parse(t);if(!v.programs||!Array.isArray(v.sessions))throw Error();if(!confirm('Alle aktuellen Daten durch dieses Backup ersetzen?'))return;data=v;save();render();notice('Backup importiert')}catch{notice('Ungültige Backup-Datei')}})}
function settings(){let h='<h2>Trainingsprogramme bearbeiten</h2><p class="muted">Änderungen betreffen nur zukünftige Trainings.</p>';for(let p of Object.keys(data.programs)){h+=`<details class="card"><summary>${esc(p)}</summary>${data.programs[p].map((e,i)=>`<div class="row" style="margin:9px 0"><input aria-label="Übung" value="${esc(e)}" onchange="renameExercise('${p}',${i},this.value)"><button class="secondary" onclick="moveExercise('${p}',${i},-1)">↑</button><button class="secondary" onclick="moveExercise('${p}',${i},1)">↓</button><button class="danger" onclick="deleteExercise('${p}',${i})">×</button></div>`).join('')}<button onclick="addExercise('${p}')">+ Übung</button></details>`}h+='<h2>Datensicherung</h2><div class="card"><button class="wide" onclick="exportData()">Backup herunterladen (JSON)</button><label for="backup">Backup wiederherstellen</label><input id="backup" type="file" accept="application/json,.json" onchange="importData(this)"><p class="muted">Deine Daten liegen ausschließlich im Browser auf diesem Gerät. Erstelle regelmäßig ein Backup, bevor du Browserdaten löschst oder das Handy wechselst.</p></div>';return h}
function render(){app.innerHTML=page==='train'?train():page==='history'?history():settings()}
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>notice('Offline-Installation erfordert HTTPS oder localhost'));
