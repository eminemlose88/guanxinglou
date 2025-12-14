import { buildCookie } from '../_lib/secure'
export default function handler(req,res){
  const token=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)
  res.setHeader('Set-Cookie', buildCookie('csrf_token', token, { path:'/', maxAge:86400, sameSite:'Lax' }))
  res.status(200).json({ token })
}
