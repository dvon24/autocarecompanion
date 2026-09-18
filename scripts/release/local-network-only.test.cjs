const test=require('node:test'),assert=require('node:assert/strict');
const {assertTarget}=require('./local-network-only.cjs'),net=require('node:net'),tls=require('node:tls');
test('Node guard accepts only normalized owned PostgreSQL target arguments',()=>{
 for(const args of [[{host:'127.0.0.1',port:55438}],[55438,'127.0.0.1'],[[{host:'127.0.0.1',port:55438},()=>{}]]])assert.doesNotThrow(()=>assertTarget(args));
 for(const args of [[{host:'127.0.0.1',port:55439}],[{host:'127.0.0.1',port:53439}],[{host:'au7o.io',port:443}],[{path:'\\\\.\\pipe\\unrelated'}],[[{host:'localhost',port:55438},()=>{}]],[55438]])assert.throws(()=>assertTarget(args),/blocked/);
 assert.throws(()=>net.connect({host:'au7o.io',port:443}),/blocked/);
 assert.throws(()=>net.connect({host:'127.0.0.1',port:55439}),/blocked/);
 assert.throws(()=>tls.connect({host:'au7o.io',port:443}),/blocked/);
});
test('HTTP fetch is blocked for public and unrelated loopback destinations',async()=>{
 for(const url of ['https://au7o.io','http://127.0.0.1:55439','http://127.0.0.1:53439'])await assert.rejects(fetch(url),/blocked/);
});
