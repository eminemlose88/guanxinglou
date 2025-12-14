import crypto from 'crypto'

const algorithm='aes-256-gcm'
const ivLen=12

export const deriveKey=(secret)=>crypto.createHash('sha256').update(String(secret||'')).digest()

export const encrypt=(payload,secret)=>{
  const iv=crypto.randomBytes(ivLen)
  const key=deriveKey(secret)
  const cipher=crypto.createCipheriv(algorithm,key,iv)
  const json=Buffer.from(JSON.stringify(payload),'utf8')
  const enc=Buffer.concat([cipher.update(json),cipher.final()])
  const tag=cipher.getAuthTag()
  return `${iv.toString('base64')}.${enc.toString('base64')}.${tag.toString('base64')}`
}

export const decrypt=(token,secret)=>{
  try{
    const [ivB64,encB64,tagB64]=String(token||'').split('.')
    if(!ivB64||!encB64||!tagB64) return null
    const iv=Buffer.from(ivB64,'base64')
    const enc=Buffer.from(encB64,'base64')
    const tag=Buffer.from(tagB64,'base64')
    const key=deriveKey(secret)
    const decipher=crypto.createDecipheriv(algorithm,key,iv)
    decipher.setAuthTag(tag)
    const dec=Buffer.concat([decipher.update(enc),decipher.final()])
    return JSON.parse(dec.toString('utf8'))
  }catch{return null}
}

export const parseCookies=(cookieHeader)=>{
  const out={}
  String(cookieHeader||'').split(';').forEach(p=>{
    const [k,...rest]=p.trim().split('=');if(!k) return;out[k]=decodeURIComponent(rest.join('='))
  })
  return out
}

export const buildCookie=(name,value,opts={})=>{
  const parts=[`${name}=${encodeURIComponent(value)}`]
  if(opts.maxAge!=null) parts.push(`Max-Age=${opts.maxAge}`)
  if(opts.path) parts.push(`Path=${opts.path}`)
  if(opts.httpOnly) parts.push('HttpOnly')
  if(opts.secure) parts.push('Secure')
  if(opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  return parts.join('; ')
}
