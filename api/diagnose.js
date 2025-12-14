import { Client } from 'pg'

const pick=(...keys)=>{for(const k of keys){const v=process.env[k];if(v) return v}return ''}
export default async function handler(req,res){
  const conn=pick('POSTGRES_URL_NON_POOLING','POSTGRES_PRISMA_URL','POSTGRES_URL')
  if(!conn){res.status(500).json({error:'POSTGRES connection string not configured'});return}
  const client=new Client({connectionString:conn, ssl:{ rejectUnauthorized:false }})
  const started=Date.now()
  let connectMs=0
  try{
    await client.connect()
    connectMs=Date.now()-started
    const sel1=await client.query('SELECT 1 as ok')
    const tables=await client.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('profiles','users','business_owners','female_users') order by table_name")
    const counts=await client.query("select 'profiles' as t, count(*) as c from public.profiles union all select 'users', count(*) from public.users union all select 'business_owners', count(*) from public.business_owners union all select 'female_users', count(*) from public.female_users")
    const rls=await client.query("select c.relname as table, c.relrowsecurity as rls_enabled from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('profiles','users','business_owners','female_users') order by c.relname")
    const policies=await client.query("select schemaname, tablename, policyname from pg_policies where tablename in ('profiles','users','business_owners','female_users') order by tablename, policyname")
    const indexes=await client.query("select tablename, indexname from pg_indexes where schemaname='public' and tablename in ('users','profiles','business_owners','female_users') order by tablename, indexname")
    const constraints=await client.query("select table_name, constraint_name, constraint_type from information_schema.table_constraints where table_schema='public' and table_name in ('users','profiles','business_owners','female_users') order by table_name, constraint_type")
    await client.end()
    res.status(200).json({
      connection:{ok:sel1?.rows?.[0]?.ok===1, ms:connectMs},
      tables:tables.rows,
      counts:counts.rows,
      rls:rls.rows,
      policies:policies.rows,
      indexes:indexes.rows,
      constraints:constraints.rows
    })
  }catch(e){
    try{await client.end()}catch{}
    res.status(500).json({error:String(e&&e.message||e)})
  }
}
