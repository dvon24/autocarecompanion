const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {Client}=require('pg');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'output/launch-rehearsal'),directory=path.join(out,'postgres-data'),markerPath=path.join(out,'cluster-identity.json');
const config={host:'127.0.0.1',port:55438,user:'launch_fixture'};
const normalize=value=>path.resolve(value).toLowerCase();
async function verify(client,marker){
 const r=(await client.query("SELECT host(inet_server_addr()) host,inet_server_port() port,current_user AS username,current_setting('data_directory') directory,system_identifier::text AS identity FROM pg_control_system()")).rows[0];
 assert.equal(r.host,config.host);assert.equal(r.port,config.port);assert.equal(r.username,config.user);assert.equal(normalize(r.directory),normalize(directory));
 if(marker){assert.equal(r.identity,marker.identity);assert.equal(normalize(marker.directory),normalize(directory))}
 return r;
}
async function connect(database){
 assert.match(database,/^(postgres|launch_\d+_[a-z]+)$/);
 const marker=JSON.parse(fs.readFileSync(markerPath,'utf8')),client=new Client({...config,database});
 await client.connect();try{await verify(client,marker);return client}catch(error){await client.end();throw error}
}
async function start(){
 const bin=process.env.AU7O_LOCAL_PG_BIN||path.resolve(root,'../known-issue-twin-pilot/output/hub-review/postgres-runtime/17.11-3/pgsql/bin');
 const exists=fs.existsSync(directory);
 if(exists&&!fs.existsSync(markerPath))throw Error('Unmarked existing data directory; refuse to use it');
 fs.mkdirSync(out,{recursive:true});
 function command(exe,args){const r=cp.spawnSync(path.join(bin,exe+'.exe'),args,{stdio:'ignore',windowsHide:true});if(r.status!==0)throw Error(exe+' failed with '+r.status)}
 if(!exists)command('initdb',['-D',directory,'-U',config.user,'-A','trust','--encoding=UTF8','--locale=C']);
 const status=cp.spawnSync(path.join(bin,'pg_ctl.exe'),['-D',directory,'status'],{stdio:'ignore',windowsHide:true});
 if(status.status!==0)command('pg_ctl',['-D',directory,'-l',path.join(out,'postgres.log'),'-o','-h 127.0.0.1 -p '+config.port,'-w','start']);
 if(!exists){const c=new Client({...config,database:'postgres'});await c.connect();try{fs.writeFileSync(markerPath,JSON.stringify(await verify(c),null,2))}finally{await c.end()}}
 const c=await connect('postgres');await c.end();console.log('Verified owned loopback PostgreSQL cluster.');
}
async function stop(){
 const c=await connect('postgres');await c.end();
 const bin=process.env.AU7O_LOCAL_PG_BIN||path.resolve(root,'../known-issue-twin-pilot/output/hub-review/postgres-runtime/17.11-3/pgsql/bin');
 const r=cp.spawnSync(path.join(bin,'pg_ctl.exe'),['-D',directory,'-m','fast','-w','stop'],{stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('Owned cluster stop failed');
}
module.exports={connect,verify,directory,markerPath,config};
if(require.main===module)(process.argv[2]==='stop'?stop():process.argv[2]==='start'?start():(async()=>{const c=await connect('postgres');await c.end();console.log('Verified exact owned cluster identity.')})()).catch(error=>{console.error(error.message);process.exit(1)});
