const pick=(...keys)=>{for(const k of keys){const v=process.env[k];if(v) return v}return ''}
const sanitize=s=>String(s||'').trim().replace(/`/g,'')

const baseUrl=()=>{
  const raw=sanitize(pick('SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL'))
  return raw.endsWith('/')?raw.slice(0,-1):raw
}

const mask=(t)=>t?`${t.slice(0,6)}...${t.slice(-6)}`:''

export default async function handler(req,res){
  const url=baseUrl()
  if(!url){res.status(500).json({error:'SUPABASE_URL not configured'});return}
  const rest=`${url}/rest/v1`
  const service=pick('SUPABASE_SERVICE_ROLE_KEY')
  const testerToken=(req.query?.token||'').toString().trim()

  const report={ endpoint: rest, tests: [] }
  const doFetch=async (path,opts)=>{
    const r=await fetch(`${rest}${path}`,opts)
    let body
    try{body=await r.json()}catch{body=await r.text()}
    return { status:r.status, headers:Object.fromEntries(r.headers), body }
  }

  // Basic GET using tester token (anon) if provided
  if(testerToken){
    const headers={ 'apikey': testerToken, 'Authorization': `Bearer ${testerToken}` }
    const r=await doFetch('/profiles?select=id&limit=1',{ headers })
    report.tests.push({ name:'GET /profiles (anon token)', token:mask(testerToken), result:r })
  } else {
    report.tests.push({ name:'GET /profiles (anon token)', warning:'no tester token provided in ?token=' })
  }

  // CRUD using service role (server-side only)
  if(service){
    const headers={ 'apikey': service, 'Authorization': `Bearer ${service}`, 'Content-Type':'application/json', 'Prefer': 'return=representation' }
    const marker=`test_${Date.now()}`
    const create=await doFetch('/profiles',{ method:'POST', headers, body: JSON.stringify({ name:marker, city:'测试城', age:18, tags:['测试'], bio:'REST测试', published:false }) })
    report.tests.push({ name:'POST /profiles (service role)', result:create })
    const id=create?.body?.[0]?.id
    if(id){
      const update=await doFetch(`/profiles?id=eq.${id}`,{ method:'PATCH', headers, body: JSON.stringify({ bio:'REST测试-更新', published:true }) })
      report.tests.push({ name:'PATCH /profiles (service role)', result:update })
      const read=await doFetch(`/profiles?id=eq.${id}&select=id,name,city,age,tags,bio,published`,{ headers })
      report.tests.push({ name:'GET /profiles by id (service role)', result:read })
      const del=await doFetch(`/profiles?id=eq.${id}`,{ method:'DELETE', headers })
      report.tests.push({ name:'DELETE /profiles (service role)', result:del })
    } else {
      report.tests.push({ name:'CRUD flow', error:'create failed, no id returned' })
    }
  } else {
    report.tests.push({ name:'Service role CRUD', warning:'SUPABASE_SERVICE_ROLE_KEY not configured' })
  }

  res.status(200).json(report)
}
