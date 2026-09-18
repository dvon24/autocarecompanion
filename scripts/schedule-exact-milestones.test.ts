import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {buildTwinMaintenanceSchedule} from '../src/components/twin/maintenance-schedule';
import {TTSchedule} from '../src/components/twin/stage/TechTree';

const node = (extra:any={}) => ({label:'Rotation',maintenanceType:'tire_rotation',serviceIntervalMiles:7500,unlogged:true,...extra});
const trees = (nodes:any) => ({car:{root:'car',nodes:{car:{group:true},...nodes}}});
const items = (schedule:any) => schedule.columns.flatMap((c:any)=>c.groups.flatMap((g:any)=>g.items));

test('exact 7,500-mile stops, no empty columns or source mutation',()=>{
  const input=trees({rotation:node(),wipers:node({maintenanceType:'wiper_replacement',serviceIntervalMiles:15000})});
  const before=JSON.stringify(input), schedule=buildTwinMaintenanceSchedule(input,60000);
  assert.deepEqual(schedule.columns.map(c=>c.mileage),[60000,67500,75000,82500,90000]);
  for(const column of schedule.columns){assert(column.groups.length);assert(column.groups.flatMap((g:any)=>g.items).every((item:any)=>item.dueMileage===column.mileage));}
  assert.equal(JSON.stringify(input),before);
  const markup=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}}));
  assert.match(markup,/67,500 mi/);assert.doesNotMatch(markup,/68k|No mapped service/);
});

test('unlogged late history stays neutral and mixed intervals remain distinct',()=>{
  const schedule=buildTwinMaintenanceSchedule(trees({rotation:node(),oil:node({maintenanceType:'oil_change',serviceIntervalMiles:10000})}),60001);
  assert.deepEqual(schedule.columns.map(c=>c.mileage),[67500,70000,75000,80000,82500]);
  assert(items(schedule).every((i:any)=>i.status==='never-logged'));
});

test('preserve one actual past deadline, project future cycles without inventing missed completions',()=>{
  const schedule=buildTwinMaintenanceSchedule(trees({rotation:node({unlogged:false,servicedAt:10000,dueMileage:17500})}),60000);
  assert.deepEqual(schedule.columns.map(c=>c.mileage),[17500,62500,70000,77500,85000]);
  assert.equal(items(schedule)[0].status,'overdue');
  assert(items(schedule).slice(1).every((i:any)=>i.status==='scheduled'));
  const zero=buildTwinMaintenanceSchedule(trees({rotation:node({unlogged:false,servicedAt:0,dueMileage:0})}),15000);
  assert.equal(zero.columns[0].mileage,0);
  assert.equal(zero.columns[1].mileage,15000);
});

test('merge canonical oil/filter commerce, count displayed stops only, do not price rotations as new tires',()=>{
  const schedule=buildTwinMaintenanceSchedule(trees({
    rotation:node({price:'$245 per tire',buyUrl:'https://example.test/tire'}),
    inspection:node({maintenanceType:'brake_inspection',serviceAction:'inspect',buyUrl:'https://example.test/pads',price:'$100'}),
    oil:node({maintenanceType:'oil_change',buyUrl:'https://example.test/oil'}),
    filter:node({maintenanceType:'oil_change',buyUrl:'https://example.test/filter'}),
    far:node({maintenanceType:'spark_plugs',serviceIntervalMiles:100000,buyUrl:'https://example.test/plugs'}),
  }),60000);
  assert.equal(schedule.orderCount,2);
  for(const column of schedule.columns){assert.equal(column.groups.flatMap((g:any)=>g.items).filter((i:any)=>i.id==='oil').length,1);}
  assert(items(schedule).filter((i:any)=>i.id==='oil').every((i:any)=>i.purchaseCount===2));
  assert(items(schedule).filter((i:any)=>['rotation','inspection'].includes(i.id)).every((i:any)=>i.price===null&&i.purchaseCount===0));
});

test('bounded counts and invalid intervals; monitor/calendar guidance stays separate',()=>{
  for(const [requested,expected] of [[NaN,5],[Infinity,5],[-3,3],[3.5,3],[1000000,24]]) {
    const schedule=buildTwinMaintenanceSchedule(trees({rotation:node()}),0,requested);
    assert.equal(schedule.columns.length,expected);
  }
  const schedule=buildTwinMaintenanceSchedule(trees({
    bad:node({serviceIntervalMiles:Infinity}),negative:node({unlogged:false,servicedAt:100,dueMileage:-1}),
    fluid:node({maintenanceType:'brake_fluid',serviceIntervalMiles:null,serviceIntervalMonths:60,serviceTiming:'calendar'}),
    oil:node({maintenanceType:'oil_change',serviceTiming:'monitor'}),
  }),60000);
  assert.equal(schedule.columns.length,0);
  assert.equal(schedule.requirements.length,2);
});

test('all real outstanding deadlines survive a short window without hiding the next stop',()=>{
  for(const numberOfJobs of [6,30]) {
    const nodes=Object.fromEntries(Array.from({length:numberOfJobs},(_,index)=>['n'+index,node({
      label:'Job '+index,maintenanceType:'synthetic_job_'+index,unlogged:false,servicedAt:0,
      dueMileage:(index+1)*1000,serviceIntervalMiles:100000,buyUrl:'https://example.test/part/'+index,
    })]));
    const input=trees(nodes), before=JSON.stringify(input);
    const schedule=buildTwinMaintenanceSchedule(input,60000);
    const overdue=items(schedule).filter((item:any)=>item.status==='overdue');
    assert.equal(overdue.length,numberOfJobs);
    assert.equal(new Set(overdue.map((item:any)=>item.id)).size,numberOfJobs);
    assert.deepEqual(schedule.columns.slice(0,numberOfJobs).map(column=>column.mileage),Array.from({length:numberOfJobs},(_,index)=>(index+1)*1000));
    assert.equal(schedule.columns.length,numberOfJobs+1,'one prospective stop beyond the complete outstanding set');
    assert.equal(schedule.columns.at(-1)?.mileage,101000);
    assert.equal(schedule.orderCount,numberOfJobs);
    assert.equal(JSON.stringify(input),before);
    const html=renderToStaticMarkup(React.createElement(TTSchedule,{schedule,miles:60000,onOpenNode:()=>{}}));
    assert.match(html,new RegExp('Job '+(numberOfJobs-1)));
    assert.match(html,/101,000 mi/);
  }
});
