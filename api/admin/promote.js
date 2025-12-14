import { createClient } from '@supabase/supabase-js'

const canPromote=(email)=>{
  const defaultAllow='eminemlose88@gmail.com'
  const allow=(process.env.SUPABASE_ADMIN_EMAILS||defaultAllow).split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  return allow.includes(String(email||'').toLowerCase())
}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const token=req.headers['x-csrf-token']
  const cookie=(req.headers.cookie||'').includes(`csrf_token=${token}`)
  if(!token||!cookie){res.status(403).json({error:'CSRF token invalid'});return}

  const sbUser=createClient(process.env.SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY)
  const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sb_token='))?.split('=')[1]
  if(!raw){res.status(401).json({error:'Unauthorized'});return}
  const { data, error } = await sbUser.auth.getUser(raw)
  if(error||!data?.user){res.status(401).json({error:'Unauthorized'});return}
  const email=data.user.email||''
  if(!canPromote(email)){res.status(403).json({error:'Not allowed'});return}

  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key){res.status(500).json({error:'Service not configured'});return}
  const sb=createClient(url,key)
  const { error } = await sb.from('users').update({ role:'admin' }).eq('supabase_uid',data.user.id)
  if(error){res.status(400).json({error:error.message});return}
  res.status(200).json({ ok:true })
}
