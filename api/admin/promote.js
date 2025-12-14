import { createClient } from '@supabase/supabase-js'
import { parseCookies, decrypt } from '../_lib/secure'

const canPromote=(email)=>{
  const allow=(process.env.SUPABASE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  return allow.includes(String(email||'').toLowerCase())
}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const token=req.headers['x-csrf-token']
  const cookie=(req.headers.cookie||'').includes(`csrf_token=${token}`)
  if(!token||!cookie){res.status(403).json({error:'CSRF token invalid'});return}

  const cookies=parseCookies(req.headers.cookie)
  const raw=cookies['auth_token']
  const payload=decrypt(raw,process.env.SUPABASE_JWT_SECRET||process.env.AUTH_COOKIE_SECRET||'changeme')
  if(!payload){res.status(401).json({error:'Unauthorized'});return}
  if(!canPromote(payload.email)){res.status(403).json({error:'Not allowed'});return}

  const url=process.env.SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key){res.status(500).json({error:'Service not configured'});return}
  const sb=createClient(url,key)
  const { error } = await sb.from('users').update({ role:'admin' }).eq('supabase_uid',payload.uid)
  if(error){res.status(400).json({error:error.message});return}
  res.status(200).json({ ok:true })
}
