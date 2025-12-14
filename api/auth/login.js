import { createClient } from '@supabase/supabase-js'

const pick=(...keys)=>{for(const k of keys){const v=process.env[k];if(v) return v}return ''}
const sanitize=s=>String(s||'').trim().replace(/`/g,'')
const buildCookie=(name,value,opts={})=>{
  const parts=[`${name}=${encodeURIComponent(value)}`]
  if(opts.maxAge!=null) parts.push(`Max-Age=${opts.maxAge}`)
  if(opts.path) parts.push(`Path=${opts.path}`)
  if(opts.httpOnly) parts.push('HttpOnly')
  if(opts.secure) parts.push('Secure')
  if(opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  if(opts.domain) parts.push(`Domain=${opts.domain}`)
  return parts.join('; ')
}
const domainFromReq=(req)=>{const h=(req.headers.host||'').toLowerCase().split(':')[0];return h.replace(/^www\./,'')||'all-hands-ai.org'}
const buildAllDomainCookies=(name,value,req,baseOpts={})=>{
  const host=(req.headers.host||'').toLowerCase().split(':')[0]
  const apex='all-hands-ai.org'
  const core={ httpOnly:true, secure:true, path:'/', maxAge:7*24*60*60, sameSite:'Lax' }
  const a=buildCookie(name,value,{...core, ...baseOpts, domain: apex})
  const b=buildCookie(name,value,{...core, ...baseOpts})
  const c=host?buildCookie(name,value,{...core, ...baseOpts, domain: host.replace(/^www\./,'') }):b
  return [a,b,c]
}

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

  const allow=(process.env.SUPABASE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  const role=allow.includes(String(email||'').toLowerCase())?'admin':'user'
  const sessionToken=(req.headers.authorization||'').replace(/^Bearer\s+/,'')
  const cookies=buildAllDomainCookies('sb_token', sessionToken, req)
  res.setHeader('Set-Cookie', cookies)
  res.status(200).json({ user_name: email, role })
}
