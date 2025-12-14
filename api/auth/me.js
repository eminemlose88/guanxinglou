import { createClient } from '@supabase/supabase-js'

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

const parseCookies=(cookieHeader)=>{
  const out={}
  String(cookieHeader||'').split(';').forEach(p=>{const [k,...rest]=p.trim().split('=');if(!k)return;out[k]=decodeURIComponent(rest.join('='))})
  return out
}

const domainFromReq=(req)=>{const h=(req.headers.host||'').toLowerCase().split(':')[0];return h.replace(/^www\./,'')||'all-hands-ai.org'}
export default async function handler(req,res){
  const cookies=parseCookies(req.headers.cookie)
  const raw=cookies['sb_token']
  const url=process.env.SUPABASE_URL
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY
  if(!raw||!url||!anon){
    res.setHeader('Set-Cookie', buildCookie('sb_token','', { path:'/', maxAge:0, httpOnly:true, secure:true, sameSite:'Lax' }))
    res.status(401).json({ error:'Unauthorized' })
    return
  }
  const sb=createClient(url,anon)
  const { data, error } = await sb.auth.getUser(raw)
  if(error||!data?.user){
    res.setHeader('Set-Cookie', buildCookie('sb_token','', { path:'/', maxAge:0, httpOnly:true, secure:true, sameSite:'Lax' }))
    res.status(401).json({ error:'Unauthorized' })
    return
  }
  const email=data.user.email||''
  const display=(data.user.user_metadata&&data.user.user_metadata.display_name)||email.split('@')[0]||email
  const allow=(process.env.SUPABASE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  const role=allow.includes(String(email||'').toLowerCase())?'admin':'user'
  // refresh cookie TTL scoped to primary domain
  res.setHeader('Set-Cookie', buildCookie('sb_token', raw, { path:'/', maxAge:7*24*60*60, httpOnly:true, secure:true, sameSite:'Lax', domain: domainFromReq(req) }))
  res.status(200).json({ uid: data.user.id, user_name: display, role })
}
