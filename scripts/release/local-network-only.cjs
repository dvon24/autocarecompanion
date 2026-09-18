// Node-process guard for validation. Only the owned PostgreSQL TCP endpoint is allowed.
// This is defense in depth, not an OS-wide network sandbox.
const net=require('node:net'),tls=require('node:tls');
function options(args){
 const first=Array.isArray(args[0])?args[0]:args;
 return typeof first[0]==='object'?first[0]:{port:first[0],host:typeof first[1]==='string'?first[1]:'localhost'};
}
function assertTarget(args){
 const o=options(args);
 if(!o||o.path||o.host!=='127.0.0.1'||Number(o.port)!==55438)throw Error('Launch validation blocked non-fixture network connection');
}
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){assertTarget(args);return connect.apply(this,args)};
tls.connect=function(){throw Error('Launch validation blocked TLS connection')};
globalThis.fetch=()=>Promise.reject(Error('Launch validation blocked HTTP fetch'));
module.exports={options,assertTarget};
