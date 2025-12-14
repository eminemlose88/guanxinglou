const pick=(...keys)=>{
  for(const k of keys){const v=process.env[k];if(v) return v}
  return ''
}
const sanitize=s=>String(s||'').trim().replace(/`/g,'')
export default function handler(req,res){
  const url=sanitize(pick('SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL'))
  const anon=sanitize(pick('SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'))
  res.setHeader('Content-Type','application/javascript; charset=utf-8')
  res.setHeader('Cache-Control','no-store')
  res.status(200).send(`window.SUPABASE_URL=${JSON.stringify(url)};window.SUPABASE_ANON_KEY=${JSON.stringify(anon)};`)
}
