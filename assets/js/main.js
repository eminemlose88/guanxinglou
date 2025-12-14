const qs=s=>document.querySelector(s)
const qsa=s=>Array.from(document.querySelectorAll(s))
const setYear=()=>{const y=qs('#year');if(y)y.textContent=new Date().getFullYear()}
const requireAuth=()=>{if(window.__auth)window.__auth.requireAuthAsync()}
const handleContact=()=>{const f=qs('#contactForm');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const msg=qs('#contactMsg');msg.textContent='已收到信息，秘书将尽快联系你';f.reset()})}
const unique=v=>Array.from(new Set(v))
let profiles=[
{name:'Amber',city:'上海',age:23,tags:['学生','清新','音乐'],bio:'商学院在读，钢琴十级，周末可约'},
{name:'Mika',city:'北京',age:24,tags:['职场','成熟','健身'],bio:'产品助理，作息稳定，偏长期'},
{name:'Luna',city:'深圳',age:22,tags:['元气','摄影','潮流'],bio:'短视频拍摄，乐于探索新店'},
{name:'Qiqi',city:'杭州',age:21,tags:['学生','二次元','文艺'],bio:'日语N1，喜欢电影与展览'},
{name:'Rhea',city:'上海',age:25,tags:['模特','气质','时尚'],bio:'平面模特，时间弹性，可短期试约'},
{name:'Nora',city:'广州',age:23,tags:['开朗','美食','旅行'],bio:'城市打卡，轻松交流，节奏适中'},
{name:'Iris',city:'成都',age:24,tags:['文静','阅读','咖啡'],bio:'独立思考，重视边界与稳定'},
{name:'Ella',city:'南京',age:22,tags:['学生','舞蹈','元气'],bio:'舞蹈社团，热爱运动，积极乐观'}]
const renderFilters=()=>{const c=qs('#filterCity');const t=qs('#filterTag');if(!c||!t)return;c.innerHTML='<option value="">全部城市</option>';
  t.innerHTML='<option value="">全部标签</option>';
  unique(profiles.map(p=>p.city)).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;c.appendChild(o)});
  unique(profiles.flatMap(p=>p.tags||[])).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;t.appendChild(o)})}
const matchProfile=(p,{city,tag,search})=>{if(city&&p.city!==city)return false;if(tag&&!p.tags.includes(tag))return false;if(search){const s=search.toLowerCase();if(!p.name.toLowerCase().includes(s)&&!p.bio.toLowerCase().includes(s))return false}return true}
const renderProfiles=()=>{const wrap=qs('#profiles');if(!wrap)return;const city=qs('#filterCity').value;const tag=qs('#filterTag').value;const search=qs('#filterSearch').value.trim();wrap.innerHTML='';profiles.filter(p=>matchProfile(p,{city,tag,search})).forEach(p=>{const el=document.createElement('div');el.className='card';const tags=document.createElement('div');tags.className='tags';p.tags.forEach(t=>{const s=document.createElement('span');s.className='tag';s.textContent=t;tags.appendChild(s)});el.innerHTML=`<div class="profile-row"><h3>${p.name}</h3><span>${p.city} · ${p.age}</span></div><p>${p.bio}</p>`;el.appendChild(tags);wrap.appendChild(el)})}
const wireFilters=()=>{['#filterCity','#filterTag','#filterSearch'].forEach(s=>{const el=qs(s);if(el)el.addEventListener('input',renderProfiles)})}
const loadProfiles=async()=>{
  const wrap=qs('#profiles');if(!wrap)return
  try{
    let headers={}
    if(window.__auth){const sb=__auth.initSupabase();if(sb){const {data:{session}}=await sb.auth.getSession();if(session) headers={Authorization:`Bearer ${session.access_token}`}}}
    const res=await fetch('/api/profiles',{headers})
    if(res.ok){const json=await res.json();profiles=(json.data||[]).map(p=>({name:p.name,city:p.city,age:p.age,tags:p.tags,bio:p.bio}))}
  }catch(e){/* keep demo data */}
  renderFilters();renderProfiles()
}
setYear();requireAuth();handleContact();wireFilters();loadProfiles()
