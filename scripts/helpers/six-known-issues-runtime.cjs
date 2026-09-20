/* Real stage, TechTree and written cards; only framework/provider/marketing leaves replaced. */
const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const postcss=require('postcss'),tailwind=require('@tailwindcss/postcss');
const root=path.resolve(__dirname,'../..');
const leaves={
  'next/link':'export default function Link({prefetch,replace,scroll,...props}){return <a {...props}/>}',
  'next/image':'export default function Image({fill,priority,unoptimized,style,...props}){return <img {...props} style={{...style,...(fill?{position:"absolute",inset:0,width:"100%",height:"100%"}:{})}}/>}',
  'next/navigation':'export function useRouter(){return {push:()=>{},refresh:()=>{}}}export function usePathname(){return location.pathname}export function useSearchParams(){return new URLSearchParams(location.search)}',
  'next-auth/react':'export function useSession(){return {status:"unauthenticated",data:null}}',
  '@/contexts/AppContext':'export function useVehicleContext(){return {selectedVehicle:null}}',
  '@/components/ads/AdSlot':'export function AdSlot(){return null}',
  '@/components/marketing/LiveHubDemo':'export function LiveHubDemo(){return null}',
  './KnownIssueAlertSignup':'export function KnownIssueAlertSignup(){return null}',
  './KnownIssuesCaptureSplit':'export function KnownIssuesCaptureSplit(){return null}',
};
async function build(entry){
  const bundle=await esbuild.build({stdin:{contents:entry,resolveDir:root,loader:'tsx'},bundle:true,write:false,jsx:'automatic',platform:'browser',tsconfig:path.join(root,'tsconfig.json'),define:{'process.env.NODE_ENV':'"development"','process.env':'{}'},plugins:[{name:'offline-six-known-issues',setup(build){
    build.onResolve({filter:/.*/},args=>{
      if(leaves[args.path])return{path:args.path,namespace:'fixture'};
      if(args.path==='@/lib/db'||args.path==='@/lib/auth'||args.path.startsWith('node:'))throw Error('Forbidden provider dependency '+args.path);
    });
    build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:leaves[args.path],loader:'tsx',resolveDir:root}));
    build.onLoad({filter:/\.[jt]sx?$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace(/<style jsx(?: global)?>/g,'<style>'),loader:path.extname(args.path).slice(1)}));
  }}]});
  const css=(await postcss([tailwind({base:root})]).process(fs.readFileSync(path.join(root,'src/app/globals.css'),'utf8'),{from:path.join(root,'src/app/globals.css')})).css+['src/styles/au7o-tokens.css','src/styles/au7o-utilities.css','src/styles/twin-stage.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');
  return{js:bundle.outputFiles[0].text,css};
}
module.exports={build,root,interceptedLeaves:Object.keys(leaves)};
