import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { buildCookie } from '../_lib/secure'

const pick=(...keys)=>{for(const k of keys){const v=process.env[k];if(v) return v}return ''}
const sanitize=s=>String(s||'').trim().replace(/`/g,'')

const getClient=()=>{
  const url=sanitize(pick('SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL'))
  const key=pick('SUPABASE_SERVICE_ROLE_KEY')
  if(!url||!key) return null
  return createClient(url,key)
}

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}

  const sb=getClient();if(!sb){res.status(500).json({error:'Service not configured'});return}
  const body=req.body||{}
  const username=sanitize(body.username)
  const email=sanitize(body.email).toLowerCase()
  const password=String(body.password||'')
  const supabase_uid=sanitize(body.supabase_uid)
  const user_agent=String(body.user_agent||'')
  const ip=(req.headers['x-forwarded-for']||'').toString().split(',')[0]||req.socket.remoteAddress||''

  if(!/^[A-Za-z0-9]{4,}$/.test(username)){res.status(400).json({error:'Invalid username'});return}
  if(!/^\S+@\S+\.\S+$/.test(email)){res.status(400).json({error:'Invalid email'});return}
  if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)){res.status(400).json({error:'Weak password'});return}

  const { data:existsByName } = await sb.from('users').select('user_id').eq('username',username).limit(1)
  if(existsByName && existsByName.length){res.status(409).json({error:'用户名已存在'});return}
  const { data:existsByEmail } = await sb.from('users').select('user_id').eq('email',email).limit(1)
  if(existsByEmail && existsByEmail.length){res.status(409).json({error:'邮箱已存在'});return}

  const salt=bcrypt.genSaltSync(10)
  const hash=bcrypt.hashSync(password,salt)
  const now=new Date().toISOString()

  const { data, error } = await sb.from('users').insert({
    username,
    email,
    password_hash: hash,
    role: 'user',
    created_at: now,
    updated_at: now,
    status: 'active',
    supabase_uid,
    register_ip: ip,
    device_info: { user_agent }
  }).select('user_id').single()
  if(error){res.status(400).json({error:error.message});return}

  res.setHeader('Set-Cookie', buildCookie('csrf_token', csrfHeader, { path:'/', maxAge:86400, sameSite:'Lax' }))
  res.status(201).json({ user_id: data.user_id })
}
