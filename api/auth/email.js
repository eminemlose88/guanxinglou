import { createClient } from '@supabase/supabase-js'

const parseCookies=(cookieHeader)=>{const out={};String(cookieHeader||'').split(';').forEach(p=>{const [k,...rest]=p.trim().split('=');if(!k)return;out[k]=decodeURIComponent(rest.join('='))});return out}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}

  const url=process.env.SUPABASE_URL
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY
  const token=parseCookies(req.headers.cookie)['sb_token']
  if(!url||!anon||!token){res.status(401).json({error:'Unauthorized'});return}

  const body=req.body||{}
  const email=String(body.email||'').trim().toLowerCase()
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){res.status(400).json({error:'Invalid email'});return}
  const sb=createClient(url,anon)
  const { data, error } = await sb.auth.updateUser({ email })
  if(error){res.status(400).json({error:error.message});return}
  res.status(200).json({ ok:true })
}
