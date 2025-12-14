import { put } from '@vercel/blob'

export const config = { api: { bodyParser: false } }

export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');res.status(405).end('Method Not Allowed');return}
  try{
    const chunks=[]
    req.on('data',c=>chunks.push(c))
    await new Promise(r=>req.on('end',r))
    const buf=Buffer.concat(chunks)
    const boundary=(req.headers['content-type']||'').match(/boundary=(.*)$/)?.[1]
    if(!boundary){res.status(400).json({error:'Invalid multipart form'});return}
    const parts=buf.toString('binary').split(`--${boundary}`)
    const filePart=parts.find(p=>p.includes('filename='))||''
    const nameMatch=filePart.match(/filename="([^"]+)"/)
    const filename=nameMatch?.[1]||`file_${Date.now()}`
    const contentStart=filePart.indexOf('\r\n\r\n')+4
    const contentEnd=filePart.lastIndexOf('\r\n')
    const fileBuf=Buffer.from(filePart.substring(contentStart,contentEnd),'binary')
    const pathname=`images/${Date.now()}_${filename}`
    const blob=await put(pathname, fileBuf, { access:'public', addRandomSuffix:true, contentType: req.headers['x-file-type']||undefined })
    res.status(200).json({ url: blob.url, pathname: blob.pathname, size: blob.size, uploadedAt: blob.uploadedAt })
  }catch(e){res.status(500).json({error:String(e&&e.message||e)})}
}
