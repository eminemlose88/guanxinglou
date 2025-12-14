export default function handler(req,res){
  const buildCookie=(name,value,opts={})=>{
    const parts=[`${name}=${encodeURIComponent(value)}`]
    if(opts.maxAge!=null) parts.push(`Max-Age=${opts.maxAge}`)
    if(opts.path) parts.push(`Path=${opts.path}`)
    if(opts.httpOnly) parts.push('HttpOnly')
    if(opts.secure) parts.push('Secure')
    if(opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
    return parts.join('; ')
  }
  try{
    const token=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)
    res.setHeader('Content-Type','application/json; charset=utf-8')
    res.setHeader('Cache-Control','no-store')
    res.setHeader('Set-Cookie', buildCookie('csrf_token', token, { path:'/', maxAge:86400, sameSite:'Lax' }))
    res.status(200).end(JSON.stringify({ token }))
  }catch(e){
    res.setHeader('Content-Type','application/json; charset=utf-8')
    res.status(200).end(JSON.stringify({ token:'' }))
  }
}
