import { decrypt, parseCookies, buildCookie, encrypt } from '../_lib/secure'

const secret=process.env.SUPABASE_JWT_SECRET||process.env.AUTH_COOKIE_SECRET||'changeme'

export default function handler(req,res){
  const cookies=parseCookies(req.headers.cookie)
  const raw=cookies['auth_token']
  const payload=decrypt(raw,secret)
  const now=Date.now()
  if(!payload||!payload.exp||payload.exp<now){
    res.setHeader('Set-Cookie', buildCookie('auth_token','', { path:'/', maxAge:0, httpOnly:true, secure:true, sameSite:'Lax' }))
    res.status(401).json({ error:'Unauthorized' })
    return
  }
  const newExp=now+30*24*60*60*1000
  const next=encrypt({ uid: payload.uid, email: payload.email, ts: payload.ts||now, exp: newExp }, secret)
  const refreshed=buildCookie('auth_token', next, { path:'/', maxAge:30*24*60*60, httpOnly:true, secure:true, sameSite:'Lax' })
  res.setHeader('Set-Cookie', refreshed)
  res.status(200).json({ uid: payload.uid, user_name: payload.email })
}
