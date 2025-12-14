export default function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}
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
  res.setHeader('Set-Cookie', buildCookie('sb_token','', { path:'/', maxAge:0, httpOnly:true, secure:true, sameSite:'Lax', domain: domainFromReq(req) }))
  res.status(200).json({ ok:true })
}
