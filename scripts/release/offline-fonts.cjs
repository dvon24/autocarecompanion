// Offline use of the real Geist fonts bundled with this exact Next dependency.
const path=require('node:path');
module.exports=new Proxy({}, {get(_target,url){
 const mono=String(url).includes('Geist+Mono');
 const file=path.resolve(__dirname,'../../node_modules/next/dist/next-devtools/server/font/'+(mono?'geist-mono-latin.woff2':'geist-latin.woff2')).replaceAll('\\','/').replace(/^[A-Za-z]:/,'');
 return "/* latin */\n@font-face { font-family: '"+(mono?'Geist Mono':'Geist')+"'; font-style: normal; font-weight: 100 900; font-display: swap; src: url("+file+") format('woff2'); unicode-range: U+0000-00FF; }";
}});
