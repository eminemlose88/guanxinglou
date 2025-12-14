export default function handler(req,res){
  const url=process.env.SUPABASE_URL||''
  const anon=process.env.SUPABASE_ANON_KEY||''
  res.setHeader('Content-Type','application/javascript; charset=utf-8')
  res.setHeader('Cache-Control','no-store')
  res.status(200).send(`window.SUPABASE_URL=${JSON.stringify(url)};window.SUPABASE_ANON_KEY=${JSON.stringify(anon)};`)
}
