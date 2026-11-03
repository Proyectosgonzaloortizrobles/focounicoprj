const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='foco-unico-mindmap-v2';
let data=JSON.parse(localStorage.getItem(KEY)||'null')||{cards:[],brainDump:''};
let dragged=null, selected=null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const uid=()=>crypto.randomUUID();
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusName=s=>({active:'En marcha',waiting:'En espera',done:'Completada'}[s]||s);
const typeName=s=>({project:'Proyecto',idea:'Idea',task:'Pendiente'}[s]||s);
function defaultPosition(i){const angle=(i*137.5-90)*Math.PI/180,r=300+(i%3)*70;return{x:750+Math.cos(angle)*r-110,y:517+Math.sin(angle)*r-65}}
function cardById(id){return data.cards.find(c=>c.id===id)}
function render(){
 $('#allCount').textContent=data.cards.length;
 $('#activeCount').textContent=data.cards.filter(c=>c.status==='active').length;
 $('#waitingCount').textContent=data.cards.filter(c=>c.status==='waiting').length;
 $('#doneCount').textContent=data.cards.filter(c=>c.status==='done').length;
 renderMap();renderList();
}
function renderMap(){
 const q=($('#mapSearch').value||'').toLowerCase();
 const visible=data.cards.filter(c=>(c.title+' '+c.description).toLowerCase().includes(q));
 $('#mapCards').innerHTML=visible.map(c=>`<article class="mind-card tone-${c.color||'purple'} ${selected===c.id?'selected':''}" data-id="${c.id}" style="left:${c.x}px;top:${c.y}px"><div class="card-meta"><span class="type-label">${typeName(c.type)}</span><span class="card-status">${statusName(c.status)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.description||'Sin descripción. Edita la tarjeta para añadir contexto.')}</p><div class="card-tools"><button data-action="child" data-id="${c.id}">＋ Relacionada</button><button data-action="edit" data-id="${c.id}">Editar</button></div></article>`).join('');
 drawConnections(visible);
}
function drawConnections(visible){
 const svg=$('#connections');svg.innerHTML='';
 const root={x:750,y:517};
 visible.forEach(c=>{
  if(!c.parent)return;
  const p=cardById(c.parent);if(!p||!visible.some(v=>v.id===p.id))return;
  const x1=p.x+110,y1=p.y+60,x2=c.x+110,y2=c.y+60,dx=(x2-x1)*.45;
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',`M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`);svg.appendChild(path);
 });
 // Conecta las tarjetas raíz con el nodo central.
 visible.filter(c=>!c.parent).forEach(c=>{
  const x1=root.x,y1=root.y,x2=c.x+110,y2=c.y+60,dx=(x2-x1)*.45;
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',`M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`);svg.appendChild(path);
 });
}
function renderList(){
 const q=($('#listSearch')?.value||'').toLowerCase(),f=$('#listFilter')?.value||'all';
 const list=data.cards.filter(c=>(f==='all'||c.status===f)&&(c.title+' '+c.description).toLowerCase().includes(q));
 $('#cardGrid').innerHTML=list.map(c=>`<article class="list-card tone-${c.color||'purple'}"><span class="tag ${c.status}">${statusName(c.status)} · ${typeName(c.type)}</span><h3>${esc(c.title)}</h3><p>${esc(c.description||'Sin descripción')}</p><div class="actions"><button class="primary mini" data-action="locate" data-id="${c.id}">Ver en mapa</button><button class="secondary mini" data-action="edit" data-id="${c.id}">Editar</button><button class="secondary mini" data-action="delete" data-id="${c.id}">Eliminar</button></div></article>`).join('')||'<div class="empty">No hay tarjetas que coincidan. Añade una nueva para empezar.</div>';
}
function showView(v){$$('.view').forEach(x=>x.classList.add('hidden'));$('#'+v+'View').classList.remove('hidden');$$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#pageTitle').textContent={map:'Tu cabeza, fuera de tu cabeza.',all:'Todas tus tarjetas.',notes:'Vacía la cabeza.'}[v];$('#pageSub').textContent={map:'Ordena tus ideas en un mapa visual. Arrastra las tarjetas para organizarte.',all:'Todos tus proyectos, ideas y pendientes en una sola lista.',notes:'Captura todo lo que ronda por tu cabeza; ya lo organizarás después.'}[v]}
function openCard(c,parentId=''){
 $('#dialogTitle').textContent=c?'Editar tarjeta':parentId?'Nueva tarjeta relacionada':'Nueva tarjeta';
 $('#cardId').value=c?.id||'';$('#cardTitle').value=c?.title||'';$('#cardDescription').value=c?.description||'';
 $('#cardType').value=c?.type||'project';$('#cardStatus').value=c?.status||'active';$('#cardColor').value=c?.color||'purple';
 $('#cardParent').innerHTML='<option value="">Mi universo (sin conexión)</option>'+data.cards.filter(x=>x.id!==(c?.id||'')).map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join('');
 $('#cardParent').value=c?.parent||parentId||'';$('#cardDialog').showModal();setTimeout(()=>$('#cardTitle').focus(),50);
}
$('#addCard').onclick=()=>openCard();
$('#cardForm').onsubmit=e=>{
 if(e.submitter?.id!=='saveCard')return;e.preventDefault();
 const id=$('#cardId').value||uid(),old=cardById(id),pos=old?{x:old.x,y:old.y}:defaultPosition(data.cards.length);
 const c={id,title:$('#cardTitle').value.trim(),description:$('#cardDescription').value.trim(),type:$('#cardType').value,status:$('#cardStatus').value,color:$('#cardColor').value,parent:$('#cardParent').value,x:pos.x,y:pos.y};
 if(!c.title)return;if(old)Object.assign(old,c);else data.cards.push(c);
 // Evita relaciones circulares directas e indirectas.
 if(c.parent===id)c.parent='';
 let ancestor=c.parent,seen=new Set([id]);while(ancestor){if(seen.has(ancestor)){c.parent='';break}seen.add(ancestor);ancestor=cardById(ancestor)?.parent||''}
 selected=id;save();$('#cardDialog').close();render();
};
function handleAction(action,id){
 const c=cardById(id);if(!c)return;
 if(action==='edit')openCard(c);
 if(action==='child')openCard(null,id);
 if(action==='delete'&&confirm(`¿Eliminar la tarjeta "${c.title}"? Las tarjetas relacionadas quedarán conectadas al universo.`)){
  data.cards=data.cards.filter(x=>x.id!==id);data.cards.forEach(x=>{if(x.parent===id)x.parent=''});if(selected===id)selected=null;save();render()
 }
 if(action==='locate'){showView('map');selected=id;renderMap();const viewport=$('#mapViewport');viewport.scrollTo({left:Math.max(0,c.x-viewport.clientWidth/2),top:Math.max(0,c.y-viewport.clientHeight/2),behavior:'smooth'})}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.stopPropagation();handleAction(b.dataset.action,b.dataset.id)}});
$('#mapCards').addEventListener('pointerdown',e=>{
 if(e.target.closest('button'))return;const el=e.target.closest('.mind-card');if(!el)return;
 dragged={id:el.dataset.id,startX:e.clientX,startY:e.clientY,origX:cardById(el.dataset.id).x,origY:cardById(el.dataset.id).y,moved:false};
 selected=dragged.id;el.classList.add('selected');el.setPointerCapture?.(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 if(!dragged)return;const dx=e.clientX-dragged.startX,dy=e.clientY-dragged.startY;
 if(Math.abs(dx)+Math.abs(dy)>3)dragged.moved=true;
 if(dragged.moved){const c=cardById(dragged.id);c.x=Math.max(10,dragged.origX+dx);c.y=Math.max(10,dragged.origY+dy);const el=$(`.mind-card[data-id="${dragged.id}"]`);if(el){el.style.left=c.x+'px';el.style.top=c.y+'px'}drawConnections(data.cards.filter(c=>(c.title+' '+c.description).toLowerCase().includes(($('#mapSearch').value||'').toLowerCase())));}
});
document.addEventListener('pointerup',()=>{if(dragged?.moved){save();renderMap()}else if(dragged){renderMap()}dragged=null});
$$('.nav').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$$('[data-filter]').forEach(b=>b.onclick=()=>{showView('all');$('#listFilter').value=b.dataset.filter;renderList()});
$('#mapSearch').oninput=renderMap;$('#listSearch').oninput=renderList;$('#listFilter').onchange=renderList;
$('#resetLayout').onclick=()=>{data.cards.forEach((c,i)=>Object.assign(c,defaultPosition(i)));save();renderMap();$('#mapViewport').scrollTo({left:0,top:0,behavior:'smooth'})};
$('#saveNotes').onclick=()=>{data.brainDump=$('#brainDump').value;save();$('#notesSaved').textContent='Notas guardadas en este dispositivo.'};
$('#convertNotes').onclick=()=>{const lines=$('#brainDump').value.split('\n').map(x=>x.trim()).filter(Boolean);if(!lines.length)return;lines.forEach((line,i)=>{const pos=defaultPosition(data.cards.length);data.cards.push({id:uid(),title:line.slice(0,90),description:'',type:'idea',status:'waiting',color:'blue',parent:'',x:pos.x,y:pos.y})});data.brainDump='';$('#brainDump').value='';save();showView('map');render();};
function exportBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='foco-unico-backup.json';a.click();URL.revokeObjectURL(a.href)}
$('#exportData').onclick=exportBackup;$('#settings').onclick=()=>$('#settingsDialog').showModal();
$('#importData').onclick=e=>{e.preventDefault();$('#importFile').click()};
$('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());if(!Array.isArray(incoming.cards))throw Error('Formato inválido');data=incoming;save();render();$('#settingsDialog').close()}catch(err){alert('No se pudo importar la copia. Comprueba que sea un archivo de Foco Único.')}e.target.value=''};
$('#brainDump').value=data.brainDump||'';
$('#today').textContent=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();
render();
