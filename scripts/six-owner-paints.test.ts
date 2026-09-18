import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { VEHICLE_TWIN_CATALOG, getTwinPaintOptions, validateVehicleTwinCatalog } from '../src/lib/vehicle-twin-catalog';
import { resolveTwinPaintArtwork } from '../src/components/twin/stage/paint-art';

const expected = { nautilus:10, murano:7, xt6:9, kicks:12, mdx:8, aviator:6 };
test('catalog structural checks remain clean', () => assert.deepEqual(validateVehicleTwinCatalog(), []));
for (const [id,count] of Object.entries(expected)) test(`${id}: every reviewed trim color resolves all five assets`, async () => {
  const twin=VEHICLE_TWIN_CATALOG.find(t=>t.id===id)!;
  const options=getTwinPaintOptions(twin,twin.identity.trim);
  assert.equal(options.length,count);
  const bases=new Set();
  for(const paint of options){
    assert.equal(paint.artStatus,'rendered',paint.name);
    const result=resolveTwinPaintArtwork(twin,{choice:paint.name,options});
    assert.equal(result.pending,false);assert(result.art);
    assert(!bases.has(result.art.base),'different paints must not reuse a base');bases.add(result.art.base);
    const assets=[result.art.base,...['wheel','rearwheel','hood','rad'].map(key=>result.art.effects[key])];
    assert.equal(new Set(assets).size,5);
    const dimensions=[];
    for(const asset of assets){assert(asset.startsWith('/twin-stage/'));const meta=await sharp(path.join(process.cwd(),'public',asset)).metadata();dimensions.push([meta.width,meta.height]);assert(meta.width!>=1500);}
    for(const d of dimensions)assert.deepEqual(d,dimensions[0],`${paint.name} layer registration canvas`);
  }
});
test('Kicks brochure trim columns: five SV/SR two-tone combinations, two SR-only alternatives',()=>{
  const twin=VEHICLE_TWIN_CATALOG.find(t=>t.id==='kicks')!;
  const names=(trim?:string)=>getTwinPaintOptions(twin,trim).map(p=>p.name);
  assert(names('SV').includes('Two-tone Scarlet Ember Tintcoat/Super Black'));
  assert(names('SV').includes('Two-tone Aspen White TriCoat/Super Black'));
  for(const trim of ['SV','SR'])for(const name of ['Two-tone Aspen White TriCoat/Super Black','Two-tone Gun Metallic/Scarlet Ember Tintcoat','Two-tone Gun Metallic/Super Black','Two-tone Scarlet Ember Tintcoat/Super Black','Two-tone Deep Blue Pearl/Gun Metallic'])assert(names(trim).includes(name));
  for(const trim of ['S','SV',undefined,'unknown'])for(const name of ['Two-tone Yuzu Yellow Metallic/Super Black','Two-tone Arctic Ice Blue Metallic/Super Black'])assert(!names(trim).includes(name));
  assert(!names().some(n=>n.startsWith('Two-tone')));
  assert.equal(resolveTwinPaintArtwork(twin,{choice:'Two-tone Yuzu Yellow Metallic/Super Black',options:getTwinPaintOptions(twin,'SV')}).art,null);
});
test('75 new assets match accepted candidate evidence, with no hidden local repaint',()=>{
  const records=JSON.parse(fs.readFileSync('scripts/fixtures/accepted-paint-hashes.json','utf8')).records;
  assert.equal(records.length,75);
  for(const record of records){
    assert.equal(record.qc,'visually-reviewed');
    const file=path.join('public/twin-stage',record.vehicle,path.basename(record.destination));
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),record.sha256,file);
  }
});
