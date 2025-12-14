import { createClient } from '@supabase/supabase-js'
import { encrypt, buildCookie } from '../_lib/secure'

const pick=(...keys)=>{for(const k of keys){const v=process.env[k];if(v) return v}return ''}
const sanitize=s=>String(s||'').trim().replace(/`/g,'')
const secret=process.env.SUPABASE_JWT_SECRET||process.env.AUTH_COOKIE_SECRET||'changeme'

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}

  const url=sanitize(pick('SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL'))
  const anon=sanitize(pick('SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'))
  const sb=createClient(url,anon)

  const auth=req.headers.authorization||''
  let uid='',email=''
  if(/^Bearer\s+/.test(auth)){
    const token=auth.replace(/^Bearer\s+/,'')
    const { data, error } = await sb.auth.getUser(token)
    if(error||!data?.user){res.status(401).json({error:'Unauthorized'});return}
    uid=data.user.id;email=data.user.email||''
  }else{
    const body=req.body||{}
    const { email:em, password } = body
    if(!em||!password){res.status(400).json({error:'Missing credentials'});return}
    const { data, error } = await sb.auth.signInWithPassword({ email: em, password })
    if(error||!data?.user){res.status(401).json({error:error?.message||'Unauthorized'});return}
    uid=data.user.id;email=data.user.email||em
  }

  const now=Date.now()
  const exp=now+30*24*60*60*1000
  const token=encrypt({ uid, email, ts: now, exp }, secret)
  const cookie=buildCookie('auth_token', token, { httpOnly:true, secure:true, path:'/', maxAge:30*24*60*60, sameSite:'Lax' })
  res.setHeader('Set-Cookie', cookie)
  res.status(200).json({ user_name: email })
}
