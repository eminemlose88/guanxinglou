import { buildCookie } from '../_lib/secure'
export default function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}
  res.setHeader('Set-Cookie', buildCookie('auth_token','', { path:'/', maxAge:0, httpOnly:true, secure:true, sameSite:'Lax' }))
  res.status(200).json({ ok:true })
}
