import { createClient } from '@supabase/supabase-js'

const parseCookies=(cookieHeader)=>{const out={};String(cookieHeader||'').split(';').forEach(p=>{const [k,...rest]=p.trim().split('=');if(!k)return;out[k]=decodeURIComponent(rest.join('='))});return out}
const ok=(v)=>typeof v==='string'&&v.trim().length>0

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  const tokenCookie=parseCookies(req.headers.cookie)['sb_token']
  const url=process.env.SUPABASE_URL
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY
  const sr=process.env.SUPABASE_SERVICE_ROLE_KEY
  const csrfHeader=req.headers['x-csrf-token']
  const csrfCookie=(req.headers.cookie||'').includes(`csrf_token=${csrfHeader}`)
  if(!csrfHeader||!csrfCookie){res.status(403).json({error:'CSRF token invalid'});return}
  if(!tokenCookie||!url||!anon||!sr){res.status(401).json({error:'Unauthorized'});return}

  const sbUser=createClient(url,anon)
  const sbAdmin=createClient(url,sr)
  const { data, error } = await sbUser.auth.getUser(tokenCookie)
  if(error||!data?.user){res.status(401).json({error:'Unauthorized'});return}
  const uid=data.user.id
  const body=req.body||{}
  const updates={}
  if(ok(body.username)) updates.user_metadata={ ...(data.user.user_metadata||{}), display_name: String(body.username).trim() }
  try{
    if(ok(body.password)){
      const pw=String(body.password)
      if(pw.length<8){res.status(400).json({error:'Password too short'});return}
      const { error:pwErr } = await sbAdmin.auth.admin.updateUserById(uid,{ password: pw })
      if(pwErr){res.status(400).json({error:pwErr.message});return}
    }
    if(updates.user_metadata){
      const { error:mdErr } = await sbAdmin.auth.admin.updateUserById(uid,{ user_metadata: updates.user_metadata })
      if(mdErr){res.status(400).json({error:mdErr.message});return}
    }
    res.status(200).json({ ok:true })
  }catch(e){res.status(500).json({error:String(e&&e.message||e)})}
}
