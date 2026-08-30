import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getReviewedTransmissionChoices, getTransmissionOptions, getTransmissionPatchCompanionFields, hasValidReviewedTransmissionState, matchesVehicleRevision, resolveVehicleTransmissionUpdate } from '../src/lib/transmission-options';
import { isPrismaWriteConflict } from '../src/lib/prisma-conflict';
import { claimTransmissionMatchesVehicle, parseMaintenanceCreate, parseVehiclePatch } from '../src/lib/twin-route-contracts';
import { isLoggableMaintenanceType, maintenanceTypeIsReadableForVehicle, resolveMaintenanceReadTypes, resolveMaintenanceWriteType, resolveReadableTransmissionMaintenanceTypes } from '../src/lib/maintenance';
import { createMaintenancePostHandler } from '../src/lib/maintenance-post-handler';
import { createMaintenanceGetHandler } from '../src/lib/maintenance-get-handler';
import { createVehiclePatchHandler } from '../src/lib/vehicle-patch-handler';
import { createTwinClaimPostHandler } from '../src/lib/twin-claim-post-handler';
import { canEnterTwinReadyState } from '../src/lib/twin-reservation-ready';
import { createAdminReservationPostHandler } from '../src/lib/admin-reservation-post-handler';
import { loadTwinClaimPageOutcome } from '../src/lib/twin-claim-page-loader';
import { createMaintenancePatchHandler } from '../src/lib/maintenance-patch-handler';
import { createGarageAssistantMaintenanceExecutor, createGarageAssistantMileageExecutor, executeGarageAssistantMaintenanceInTransaction, executeGarageAssistantMileageInTransaction } from '../src/lib/garage-assistant-maintenance';
import { createGarageAssistantToolBatchExecutor } from '../src/lib/garage-assistant-tool-batch';
import { executeGarageAssistantProductionTool } from '../src/lib/garage-assistant-production-tool';
import { nextMonotonicRevision, parseMaintenancePatch } from '../src/lib/maintenance-mutation';
import { transmissionSelectionFitsReviewedOptions } from '../src/lib/twin-fulfillment';

const require = createRequire(import.meta.url);
const { validateVehicleTransmissionColumn } = require('./apply-vehicle-transmission.js') as {
  validateVehicleTransmissionColumn: (rows: unknown[]) => boolean;
};

test('asks only reviewed dual-transmission YMMTs', () => {
  assert.deepEqual(
    getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' }).map((o) => o.value),
    ['automatic', 'manual'],
  );
  assert.deepEqual(
    getTransmissionOptions({ year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1' }).map((o) => o.value),
    ['automatic', 'manual'],
  );
});

test('does not burden automatic-only, incomplete, or unreviewed vehicles', () => {
  assert.deepEqual(getTransmissionOptions({ year: 2019, make: 'Lincoln', model: 'Nautilus', trim: 'Reserve' }), []);
  assert.deepEqual(getReviewedTransmissionChoices({ year: 2019, make: 'Lincoln', model: 'Nautilus', trim: 'Reserve' }), ['automatic']);
  assert.deepEqual(getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SXT' }), []);
  assert.deepEqual(getTransmissionOptions({ year: 2015, make: 'Dodge', model: 'Challenger', trim: null }), []);
});

test('vehicle edits clear stale choices and reject choices outside reviewed dual fitment', () => {
  const challenger = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', transmission: 'automatic' };
  assert.deepEqual(resolveVehicleTransmissionUpdate(challenger, {}), {
    ok: true, transmission: 'automatic', shouldWrite: false,
  });
  assert.deepEqual(resolveVehicleTransmissionUpdate(challenger, { trim: 'SXT' }), {
    ok: true, transmission: null, shouldWrite: true,
  });
  assert.deepEqual(resolveVehicleTransmissionUpdate(challenger, { trim: 'SXT', transmission: 'manual' }), {
    ok: false, reason: 'unsupported-transmission-fitment',
  });
  assert.deepEqual(resolveVehicleTransmissionUpdate(challenger, { transmission: null }), {
    ok: true, transmission: null, shouldWrite: true,
  });
  const nautilus = { year: 2019, make: 'Lincoln', model: 'Nautilus', trim: 'Reserve', transmission: 'automatic' };
  assert.deepEqual(resolveVehicleTransmissionUpdate(nautilus, {}), {
    ok: true, transmission: 'automatic', shouldWrite: false,
  });
  assert.deepEqual(resolveVehicleTransmissionUpdate(nautilus, { transmission: 'automatic' }), {
    ok: false, reason: 'unsupported-transmission-fitment',
  });
});

test('DDL is additive, has no backfill, and validates an existing column shape', () => {
  const source = readFileSync('scripts/apply-vehicle-transmission.js', 'utf8');
  assert.match(source, /ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "transmission"/);
  assert.doesNotMatch(source, /UPDATE\s+"Vehicle"/i);
  const valid = { dataType: 'text', isNullable: 'YES', columnDefault: null, isGenerated: 'NEVER', isIdentity: 'NO' };
  assert.equal(validateVehicleTransmissionColumn([valid]), true);
  assert.throws(() => validateVehicleTransmissionColumn([]), /not found/i);
  assert.throws(() => validateVehicleTransmissionColumn([{ ...valid, dataType: 'character varying' }]), /unsafe schema shape/i);
  assert.throws(() => validateVehicleTransmissionColumn([{ ...valid, isNullable: 'NO' }]), /unsafe schema shape/i);
  assert.throws(() => validateVehicleTransmissionColumn([{ ...valid, columnDefault: "'automatic'::text" }]), /unsafe schema shape/i);
  assert.throws(() => validateVehicleTransmissionColumn([{ ...valid, isGenerated: 'ALWAYS' }]), /unsafe schema shape/i);
  assert.throws(() => validateVehicleTransmissionColumn([{ ...valid, isIdentity: 'YES' }]), /unsafe schema shape/i);
});

test('transmission PATCH rejects companion fields and recognizes retryable Prisma conflicts', () => {
  assert.deepEqual(getTransmissionPatchCompanionFields({ transmission: 'manual', expectedUpdatedAt: 'x' }), []);
  assert.deepEqual(
    getTransmissionPatchCompanionFields({ transmission: 'manual', currentMileage: 12000, nickname: 'Track car' }),
    ['currentMileage', 'nickname'],
  );
  assert.deepEqual(getTransmissionPatchCompanionFields({ nickname: 'Track car' }), []);
  assert.equal(isPrismaWriteConflict({ code: 'P2034' }), true);
  assert.equal(isPrismaWriteConflict({ code: 'P2002' }), false);
  assert.equal(isPrismaWriteConflict(new Error('P2034')), false);
});

test('transmission writes require the exact vehicle revision and guarded transactions', () => {
  const revision = new Date('2026-08-26T10:00:00.000Z');
  assert.equal(matchesVehicleRevision(revision.toISOString(), revision), true);
  assert.equal(matchesVehicleRevision('2026-08-26T10:00:00.001Z', revision), false);
  assert.equal(matchesVehicleRevision(undefined, revision), false);
  const route = readFileSync('src/lib/vehicle-patch-handler.ts', 'utf8');
  assert.match(route, /expectedUpdatedAt/);
  assert.match(route, /updatedAt:\s*existing\.updatedAt/);
  assert.match(route, /isolationLevel:\s*'Serializable'/);
  assert.match(route, /getTransmissionPatchCompanionFields/);
  assert.match(route, /isPrismaWriteConflict/);
  const claim = readFileSync('src/lib/twin-claim-post-handler.ts', 'utf8');
  assert.match(claim, /vehicleVerified:\s*true/);
  assert.match(claim, /tx\.reservation\.updateMany/);
  assert.match(claim, /tx\.vehicle\.updateMany/);
  assert.match(claim, /SELECT CURRENT_TIMESTAMP/);
  assert.match(claim, /isPrismaWriteConflict/);
});

test('route contracts execute strict PATCH/maintenance validation and dual-only claim equality', () => {
  assert.equal(parseVehiclePatch({ transmission: 'manual', expectedUpdatedAt: '2026-08-26T10:00:00.000Z' }).success, true);
  assert.equal(parseVehiclePatch({ transmission: 'manual', unexpected: true }).success, false);
  assert.equal(parseVehiclePatch({ year: 2015.5 }).success, false);
  assert.equal(parseVehiclePatch({ currentMileage: 10.5 }).success, false);
  assert.equal(parseVehiclePatch({ currentMileage: 2_147_483_648 }).success, false);
  assert.equal(parseVehiclePatch({ annualMileage: Number.POSITIVE_INFINITY }).success, false);
  assert.equal(parseVehiclePatch({}).success,false);
  assert.equal(parseVehiclePatch({expectedUpdatedAt:'2026-08-26T10:00:00.000Z'}).success,false);
  assert.equal(parseVehiclePatch({make:'   '}).success,false);
  assert.equal(parseVehiclePatch({model:'\t'}).success,false);
  assert.equal(parseVehiclePatch({trim:' '}).success,false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26' }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', nextDueMileage: null, nextDueDate: null }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: '__proto__', mileage: 10, date: '2026-08-26' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', unexpected: true }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-02-30' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', nextDueMileage: 9 }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', nextDueDate: '2026-08-25' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2024-02-29', nextDueDate: '2024-03-01' }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: '   ', type: 'oil_change', mileage: 10, date: '2026-08-26' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: ' v1 ', type: ' oil_change ', mileage: 10, date: '2026-08-26' }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10.5, date: '2026-08-26' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 2_147_483_648, date: '2026-08-26' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26T10:30:00+02:00' }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26T10:30:00.123+02:00' }, isLoggableMaintenanceType).success, true);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26T10:30:00.1234+02:00' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26T10:30:00-00:00' }, isLoggableMaintenanceType).success, false);
  for(const date of ['2026-08-26T10:30:00','2026-08-26T24:00:00Z','2026-08-26 10:30:00Z','2026-02-29T10:30:00Z']){
    assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date }, isLoggableMaintenanceType).success, false);
  }
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', nextDueMileage: 10 }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({ vehicleId: 'v1', type: 'oil_change', mileage: 10, date: '2026-08-26', nextDueDate: '2026-08-26' }, isLoggableMaintenanceType).success, false);
  assert.equal(parseMaintenanceCreate({vehicleId:'v1',type:'oil_change',mileage:10,date:'2026-08-26T23:30:00-05:00',nextDueDate:'2026-08-27'},isLoggableMaintenanceType).success,true);
  assert.equal(parseMaintenanceCreate({vehicleId:'v1',type:'oil_change',mileage:10,date:'2026-08-26',nextDueDate:'2026-08-26T23:30:00-05:00'},isLoggableMaintenanceType).success,false);

  assert.equal(claimTransmissionMatchesVehicle({ requiresChoice: true, branch: 'automatic' }, 'manual'), false);
  assert.equal(claimTransmissionMatchesVehicle({ requiresChoice: true, branch: 'automatic' }, 'automatic'), true);
  assert.equal(claimTransmissionMatchesVehicle({ requiresChoice: false, branch: 'automatic' }, null), true);
});

test('maintenance POST executes normalization inside its serializable transaction and reports races', async () => {
  const created: Array<Record<string, unknown>> = [];
  const revision=new Date('2026-08-26T10:00:00.000Z');let revisionGuards=0;
  const tx = {
    vehicle: {
      findFirst: async () => ({ id: 'v1', userId: 'u1', year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', transmission: 'manual', currentMileage: 2000, updatedAt:revision }),
      updateMany: async () => ({count:++revisionGuards}),
      update: async () => ({}),
    },
    maintenanceRecord: { create: async ({ data }: { data: Record<string, unknown> }) => { created.push(data); return { id: 'r1', ...data }; } },
    mileageLog: { create: async () => ({}) },
  } as unknown as Record<string, unknown>;
  let isolation='';
  const prisma = { $transaction: async (callback:(value:unknown)=>Promise<unknown>,options:{isolationLevel:string}) => { isolation=options.isolationLevel;return callback(tx); } };
  const handler=createMaintenancePostHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:prisma as never});
  const response=await handler(new Request('http://local/api/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:1500,date:'2026-08-26'})}));
  assert.equal(response.status,201);assert.equal(isolation,'Serializable');assert.equal(revisionGuards,1);assert.equal(created[0].type,'transmission_fluid_manual');

  const stale=createMaintenancePostHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:{$transaction:async()=>{throw {code:'P2034'};}} as never});
  const staleResponse=await stale(new Request('http://local/api/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:1500,date:'2026-08-26'})}));
  assert.equal(staleResponse.status,409);
});

test('maintenance POST preserves accepted dates and rejects malformed input without writes',async()=>{
  const stored:Array<Record<string,unknown>>=[];let transactions=0;
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:100,updatedAt:new Date('2026-08-26T00:00:00.000Z')};
  const tx={vehicle:{findFirst:async()=>vehicle,update:async()=>({}),updateMany:async()=>({count:1})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{stored.push(data);return{id:'r1',...data};}},mileageLog:{create:async()=>({})}};
  const handler=createMaintenancePostHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{transactions+=1;return callback(tx);}} as never});
  const malformed=await handler(new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:'{"vehicleId":'}));assert.equal(malformed.status,400);assert.equal(transactions,0);assert.equal(stored.length,0);
  const fractional=await handler(new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:10.5,date:'2026-08-26'})}));assert.equal(fractional.status,400);assert.equal(transactions,0);
  const equalDeadline=await handler(new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:100,date:'2026-08-26',nextDueMileage:100})}));assert.equal(equalDeadline.status,400);assert.equal(transactions,0);
  const dateOnly=await handler(new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:100,date:'2026-08-26',nextDueDate:'2027-02-26'})}));assert.equal(dateOnly.status,201);assert.equal((stored.at(-1)?.date as Date).toISOString(),'2026-08-26T00:00:00.000Z');assert.equal((stored.at(-1)?.nextDueDate as Date).toISOString(),'2027-02-26T00:00:00.000Z');
  const offset=await handler(new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:100,date:'2026-08-26T01:30:00+02:00'})}));assert.equal(offset.status,201);assert.equal((stored.at(-1)?.date as Date).toISOString(),'2026-08-25T23:30:00.000Z');
});

test('transmission service CAS makes either concurrent branch ordering lose without a stale record',async()=>{
  const startRevision=new Date('2026-08-26T10:00:00.000Z');
  const makeRequest=()=>new Request('http://local',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:1500,date:'2026-08-26'})});
  const auth=async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}});

  const serviceFirstState={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as const,currentMileage:2000,updatedAt:startRevision,isPrimary:true};
  const serviceFirstRecords:Array<Record<string,unknown>>=[];
  const serviceFirstTx={vehicle:{findFirst:async()=>({...serviceFirstState}),updateMany:async({where,data}:{where:{updatedAt:Date};data:{updatedAt:Date}})=>{if(where.updatedAt.getTime()!==serviceFirstState.updatedAt.getTime())return{count:0};serviceFirstState.updatedAt=data.updatedAt;return{count:1};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{serviceFirstRecords.push(data);return{id:'r1',...data};}},mileageLog:{create:async()=>({})}};
  const serviceFirst=createMaintenancePostHandler({auth,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(serviceFirstTx)} as never});assert.equal((await serviceFirst(makeRequest())).status,201);assert.equal(serviceFirstRecords[0].type,'transmission_fluid_auto');
  const pickerAfter=createVehiclePatchHandler({auth,prisma:{vehicle:{findFirst:async()=>({...serviceFirstState})}} as never});const pickerAfterResponse=await pickerAfter(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'manual',expectedUpdatedAt:startRevision.toISOString()})}),{params:Promise.resolve({id:'v1'})});assert.equal(pickerAfterResponse.status,409);assert.equal(serviceFirstState.transmission,'automatic');

  const pickerFirstState={...serviceFirstState,transmission:'automatic' as 'automatic'|'manual',updatedAt:startRevision};const pickerFirstRecords:Array<Record<string,unknown>>=[];
  const pickerFirstTx={vehicle:{findFirst:async()=>({...pickerFirstState}),updateMany:async()=>{pickerFirstState.transmission='manual';pickerFirstState.updatedAt=new Date(startRevision.getTime()+1);return{count:0};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{pickerFirstRecords.push(data);return{id:'r2',...data};}},mileageLog:{create:async()=>({})}};
  const serviceLoses=createMaintenancePostHandler({auth,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(pickerFirstTx)} as never});assert.equal((await serviceLoses(makeRequest())).status,409);assert.equal(pickerFirstState.transmission,'manual');assert.equal(pickerFirstRecords.length,0);
});

test('vehicle PATCH executes strict payload and guarded stale-state paths', async () => {
  const revision=new Date('2026-08-26T10:00:00.000Z');let changed=0;let isolation='';let reads=0;
  const existing={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:null,updatedAt:revision,isPrimary:true,currentMileage:1000};
  const prisma={vehicle:{findFirst:async()=>{reads+=1;return existing;}},$transaction:async(callback:(tx:unknown)=>Promise<unknown>,options:{isolationLevel:string})=>{isolation=options.isolationLevel;return callback({vehicle:{updateMany:async()=>({count:++changed}),findUnique:async()=>({...existing,transmission:'manual'})}});}};
  const handler=createVehiclePatchHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:prisma as never});
  const missingToken=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'manual'})}),{params:Promise.resolve({id:'v1'})});assert.equal(missingToken.status,400);assert.equal(reads,0);
  const invalid=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'manual',expectedUpdatedAt:revision.toISOString(),unexpected:true})}),{params:Promise.resolve({id:'v1'})});assert.equal(invalid.status,400);assert.equal(changed,0);
  const malformed=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:'{"transmission":'}),{params:Promise.resolve({id:'v1'})});assert.equal(malformed.status,400);assert.equal(changed,0);
  const saved=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'manual',expectedUpdatedAt:revision.toISOString()})}),{params:Promise.resolve({id:'v1'})});assert.equal(saved.status,200);assert.equal(changed,1);assert.equal(isolation,'Serializable');
  const stale=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'automatic',expectedUpdatedAt:'2026-08-26T10:00:00.001Z'})}),{params:Promise.resolve({id:'v1'})});assert.equal(stale.status,409);assert.equal(changed,1);
});

test('vehicle PATCH persists bounded integer fields unchanged',async()=>{
  const updated:Array<Record<string,unknown>>=[];const mileage:Array<Record<string,unknown>>=[];
  const existing={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:null,updatedAt:new Date('2026-08-26T10:00:00.000Z'),isPrimary:true,currentMileage:1000};
  const prisma={vehicle:{findFirst:async()=>existing,update:async({data}:{data:Record<string,unknown>})=>{updated.push(data);return{...existing,...data};},updateMany:async()=>({count:1})},mileageLog:{create:async({data}:{data:Record<string,unknown>})=>{mileage.push(data);return data;}},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({vehicle:{updateMany:async({data}:{data:Record<string,unknown>})=>{updated.push(data);return{count:1};},findUnique:async()=>({...existing,...updated.at(-1)})},mileageLog:{create:async({data}:{data:Record<string,unknown>})=>{mileage.push(data);return data;}}})};
  const handler=createVehiclePatchHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:prisma as never});
  const response=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({year:2016,currentMileage:12345,annualMileage:12000})}),{params:Promise.resolve({id:'v1'})});
  assert.equal(response.status,200);assert.equal(updated[0].year,2016);assert.equal(updated[0].currentMileage,12345);assert.equal(updated[0].annualMileage,12000);assert.equal(mileage[0].mileage,12345);
});

test('claim POST executes exact garage activation and stale guarded outcomes', async () => {
  const now=new Date('2026-08-26T10:00:00.000Z');const revision=new Date('2026-08-25T10:00:00.000Z');let reservationWrites=0;let vehicleWrites=0;let isolation='';let predicateTrimVerified:unknown;
  const reservation={id:'r1',email:'owner@example.com',vehicle:'2015 Dodge Challenger SRT 392',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true,assignedTwin:'dodge-challenger',transmission:'manual',vehicleVerified:true,twinStatus:'ready',trialDays:7,claimedAt:null,updatedAt:revision};
  const vehicle={id:'v1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',currentMileage:2000,updatedAt:revision};
  const tx={$queryRaw:async()=>[{now}],reservation:{findUnique:async()=>reservation,updateMany:async({where}:{where:Record<string,unknown>})=>{predicateTrimVerified=where.trimVerified;return{count:++reservationWrites};}},vehicle:{findMany:async()=>[vehicle],updateMany:async()=>({count:++vehicleWrites})}};
  const prisma={$transaction:async(callback:(value:unknown)=>Promise<unknown>,options:{isolationLevel:string})=>{isolation=options.isolationLevel;return callback(tx);}};
  const handler=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:prisma as never});const response=await handler();
  assert.equal(response.status,200);assert.equal(isolation,'Serializable');assert.equal(reservationWrites,1);assert.equal(vehicleWrites,1);assert.equal(predicateTrimVerified,true);assert.match((await response.json()).href,/2015-dodge-challenger-srt-392/);
  let blankSessionTransactions=0;const blankSession=createTwinClaimPostHandler({auth:async()=>({user:{id:' ',email:' '}}),prisma:{$transaction:async()=>{blankSessionTransactions+=1;}} as never});assert.equal((await blankSession()).status,401);assert.equal(blankSessionTransactions,0);
  for(const trimVerified of [false,undefined]){reservationWrites=0;vehicleWrites=0;const denied=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({...tx,reservation:{...tx.reservation,findUnique:async()=>({...reservation,trimVerified})}})} as never});assert.equal((await denied()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);}
  reservationWrites=0;vehicleWrites=0;const missingTrim=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({...tx,reservation:{...tx.reservation,findUnique:async()=>({...reservation,trim:null,trimVerified:true})}})} as never});assert.equal((await missingTrim()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);
  reservationWrites=0;vehicleWrites=0;const blankMake=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({...tx,reservation:{...tx.reservation,findUnique:async()=>({...reservation,make:'  '})}})} as never});assert.equal((await blankMake()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);
  reservationWrites=0;vehicleWrites=0;const branchConflict=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({...tx,vehicle:{...tx.vehicle,findMany:async()=>[{...vehicle,transmission:'automatic'}]}})} as never});assert.equal((await branchConflict()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);
  const stale=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async()=>{throw {code:'P2034'};}} as never});assert.equal((await stale()).status,409);
});

test('ready fulfillment requires human-verified non-null trim provenance',()=>{
  const base={reservation:{vehicleVerified:true,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true},hasLiveMatchingTwin:true,trialDays:7,transmissionOptionCount:2,transmission:'automatic' as const};
  assert.equal(canEnterTwinReadyState(base),true);
  assert.equal(canEnterTwinReadyState({...base,transmissionOptionCount:0}),false);
  assert.equal(canEnterTwinReadyState({...base,reservation:{...base.reservation,trimVerified:false}}),false);
  assert.equal(canEnterTwinReadyState({...base,reservation:{...base.reservation,trimVerified:null}}),false);
  assert.equal(canEnterTwinReadyState({...base,reservation:{...base.reservation,trim:null,trimVerified:null}}),false);
  assert.equal(canEnterTwinReadyState({...base,reservation:{...base.reservation,vehicleVerified:false}}),false);
  assert.equal(canEnterTwinReadyState({...base,transmissionOptionCount:1,transmissionOptions:['automatic'],transmission:'manual'}),false);
});

test('admin ready handler rejects non-object JSON and enforces verified trim provenance',async()=>{
  const revision=new Date('2026-08-26T10:00:00.000Z');let reads=0;let writes=0;
  const base={id:'r1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true,vehicleVerified:true,twinStatus:'pending',updatedAt:revision,readyAt:null};
  let current={...base};
  const prisma={reservation:{findUnique:async()=>{reads+=1;return current;},updateMany:async()=>({count:++writes}),findUniqueOrThrow:async()=>({...current,twinStatus:'ready',assignedTwin:'dodge-challenger',trialDays:7,transmission:'automatic',readyAt:revision})}};
  const handler=createAdminReservationPostHandler({requireFounder:async()=>null,prisma:prisma as never});
  const request=(body:string)=>new Request('http://local/admin/reservations',{method:'POST',headers:{'content-type':'application/json'},body});
  assert.equal((await handler(request('null'))).status,400);assert.equal(reads,0);assert.equal(writes,0);
  assert.equal((await handler(request('[]'))).status,400);assert.equal(reads,0);assert.equal(writes,0);
  for(const trimVerified of [false,undefined]){current={...base,trimVerified} as typeof current;const denied=await handler(request(JSON.stringify({id:'r1',status:'ready',assignedTwin:'dodge-challenger',trialDays:7,transmission:'automatic',expectedUpdatedAt:revision.toISOString()})));assert.equal(denied.status,400);}
  assert.equal(writes,0);
  current={...base};const invalidBranch=await handler(request(JSON.stringify({id:'r1',status:'ready',assignedTwin:'dodge-challenger',trialDays:7,transmission:'cvt',expectedUpdatedAt:revision.toISOString()})));assert.equal(invalidBranch.status,400);assert.equal(writes,0);
  current={...base};const missingBranch=await handler(request(JSON.stringify({id:'r1',status:'ready',assignedTwin:'dodge-challenger',trialDays:7,transmission:null,expectedUpdatedAt:revision.toISOString()})));assert.equal(missingBranch.status,400);assert.equal(writes,0);
  current={...base};const ready=await handler(request(JSON.stringify({id:'r1',status:'ready',assignedTwin:'dodge-challenger',trialDays:7,transmission:'automatic',expectedUpdatedAt:revision.toISOString()})));
  assert.equal(ready.status,200);assert.equal(writes,1);
});

test('claim page loader requires a complete session and rejects provenance before garage/catalog work',async()=>{
  let reservationReads=0;let garageReads=0;let catalogReads=0;
  const base={vehicle:'2015 Dodge Challenger SRT 392',twinStatus:'ready',assignedTwin:'dodge-challenger',transmission:'automatic',trialDays:7,claimedAt:null,year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true,vehicleVerified:true};
  let reservation:{trim:string|null;trimVerified:boolean|undefined}&Omit<typeof base,'trim'|'trimVerified'>={...base};
  const prisma={reservation:{findUnique:async()=>{reservationReads+=1;return reservation;}},vehicle:{findMany:async()=>{garageReads+=1;return[];}},$queryRaw:async()=>[{now:new Date('2026-08-26T10:00:00.000Z')}]};
  const deps={prisma:prisma as never,resolveOwnerCatalog:()=>{catalogReads+=1;return null;}};
  assert.equal((await loadTwinClaimPageOutcome({user:{email:'owner@example.com'}},deps)).kind,'sign-in');
  assert.equal((await loadTwinClaimPageOutcome({user:{id:'u1'}},deps)).kind,'sign-in');
  assert.equal((await loadTwinClaimPageOutcome({user:{id:'  ',email:'  '}},deps)).kind,'sign-in');
  assert.equal(reservationReads,0);
  for(const variant of [{trim:'SRT 392',trimVerified:false},{trim:'SRT 392',trimVerified:undefined},{trim:null,trimVerified:true}]){reservation={...base,...variant};const outcome=await loadTwinClaimPageOutcome({user:{id:'u1',email:'owner@example.com'}},deps);assert.equal(outcome.kind,'display');if(outcome.kind==='display')assert.equal(outcome.reason,'trim-unverified');}
  assert.equal(garageReads,0);assert.equal(catalogReads,0);
});

test('maintenance PATCH normalizes exact branch and rejects invalid or stale writes',async()=>{
  const revision=new Date('2026-08-26T10:00:00.000Z');let transactions=0;let guards=0;const updates:Array<Record<string,unknown>>=[];
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as string|null,currentMileage:2000,updatedAt:revision};
  const existing={id:'m1',vehicleId:'v1',type:'oil_change',description:null,mileage:1000,cost:null,date:new Date('2026-01-01T00:00:00.000Z'),nextDueMileage:null,nextDueDate:null,notes:null,receiptUrl:null,shopName:null,vehicle};
  let guardCount=1;
  const tx={maintenanceRecord:{findUnique:async()=>existing,update:async({data}:{data:Record<string,unknown>})=>{updates.push(data);return{id:'m1',...data};}},vehicle:{updateMany:async()=>{guards+=1;return{count:guardCount};}}};
  const prisma={$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{transactions+=1;return callback(tx);}};
  const handler=createMaintenancePatchHandler({auth:async()=>({user:{id:'u1'}}),prisma:prisma as never,now:()=>new Date('2026-08-26T10:00:01.000Z')});
  const request=(value:string)=>new Request('http://local/maintenance/m1',{method:'PATCH',headers:{'content-type':'application/json'},body:value});
  assert.equal((await handler(request('null'),{params:Promise.resolve({id:'m1'})})).status,400);assert.equal(transactions,0);
  assert.equal((await handler(request(JSON.stringify({date:'2026-08-26T10:30:00.1234Z'})),{params:Promise.resolve({id:'m1'})})).status,400);assert.equal(transactions,0);
  const saved=await handler(request(JSON.stringify({type:'transmission_fluid',mileage:1500,date:'2026-08-26',nextDueDate:null})),{params:Promise.resolve({id:'m1'})});assert.equal(saved.status,200);assert.equal(guards,1);assert.equal(updates[0].type,'transmission_fluid_auto');
  existing.type='transmission_fluid';const legacy=await handler(request(JSON.stringify({notes:'receipt added'})),{params:Promise.resolve({id:'m1'})});assert.equal(legacy.status,200);assert.equal(updates.at(-1)?.type,'transmission_fluid');
  vehicle.transmission=null;const branchlessMetadata=await handler(request(JSON.stringify({notes:'branch remains unknown'})),{params:Promise.resolve({id:'m1'})});assert.equal(branchlessMetadata.status,200);assert.equal(guards,3);assert.equal(updates.at(-1)?.type,'transmission_fluid');
  const branchless=await handler(request(JSON.stringify({type:'transmission_fluid',mileage:1500,date:'2026-08-26',nextDueDate:null})),{params:Promise.resolve({id:'m1'})});assert.equal(branchless.status,400);assert.equal(guards,3);assert.equal(updates.length,3);
  vehicle.transmission='automatic';guardCount=0;const stale=await handler(request(JSON.stringify({type:'transmission_fluid',mileage:1500,date:'2026-08-26',nextDueDate:null})),{params:Promise.resolve({id:'m1'})});assert.equal(stale.status,409);assert.equal(updates.length,3);
});

test('garage assistant maintenance uses strict exact-branch CAS and no-write failures',async()=>{
  const revision=new Date('2026-08-26T10:00:00.000Z');let transactions=0;let guards=0;const records:Array<Record<string,unknown>>=[];
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as string|null,currentMileage:2000,updatedAt:revision};
  let guardCount=1;
  const tx={vehicle:{findFirst:async()=>vehicle,updateMany:async()=>{guards+=1;return{count:guardCount};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{records.push(data);return{...data,cost:null};}}};
  const executor=createGarageAssistantMaintenanceExecutor({prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{transactions+=1;return callback(tx);}} as never,now:()=>new Date('2026-08-26T10:00:01.000Z')});
  const input={vehicleId:'v1',type:'transmission_fluid',mileage:1500,date:'2026-08-26'};
  await executor(input,'u1');assert.equal(records[0].type,'transmission_fluid_auto');assert.equal(guards,1);
  await assert.rejects(()=>executor({...input,date:'2026-08-26T10:30:00-00:00'},'u1'),(error:unknown)=>(error as {status?:number}).status===400);assert.equal(transactions,2);
  vehicle.transmission=null;await assert.rejects(()=>executor(input,'u1'),(error:unknown)=>(error as {status?:number}).status===400);assert.equal(records.length,1);assert.equal(guards,1);
  vehicle.transmission='automatic';guardCount=0;await assert.rejects(()=>executor(input,'u1'),(error:unknown)=>(error as {status?:number}).status===409);assert.equal(records.length,1);
});

test('maintenance PATCH rejects exact transmission evidence on unreviewed fitment',async()=>{
  let guards=0;let writes=0;const vehicle={id:'v1',userId:'u1',year:2018,make:'Toyota',model:'Camry',trim:'SE',transmission:'automatic',currentMileage:2000,updatedAt:new Date('2026-08-26T00:00:00.000Z')};
  const existing={id:'m1',vehicleId:'v1',type:'transmission_fluid_auto',description:null,mileage:1000,cost:null,date:new Date('2026-01-01T00:00:00.000Z'),nextDueMileage:null,nextDueDate:null,notes:null,receiptUrl:null,shopName:null,vehicle};
  const handler=createMaintenancePatchHandler({auth:async()=>({user:{id:'u1'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({maintenanceRecord:{findUnique:async()=>existing,update:async()=>{writes+=1;return existing;}},vehicle:{updateMany:async()=>{guards+=1;return{count:1};}}})} as never});
  const response=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({notes:'receipt reviewed'})}),{params:Promise.resolve({id:'m1'})});assert.equal(response.status,400);assert.equal(guards,0);assert.equal(writes,0);
});

test('actual picker and transmission service handlers resolve an overlapping picker-first race with 409',async()=>{
  const start=new Date('2026-08-26T10:00:00.000Z');const next=new Date(start.getTime()+1);let releaseCas!:()=>void;let signalRead!:()=>void;
  const casReleased=new Promise<void>((resolve)=>{releaseCas=resolve;});const serviceRead=new Promise<void>((resolve)=>{signalRead=resolve;});
  const state={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as 'automatic'|'manual',currentMileage:2000,updatedAt:start,isPrimary:true};let serviceWrites=0;
  const serviceTx={vehicle:{findFirst:async()=>{signalRead();return{...state};},updateMany:async({where}:{where:{updatedAt:Date;transmission:string}})=>{await casReleased;if(where.updatedAt.getTime()!==state.updatedAt.getTime()||where.transmission!==state.transmission)return{count:0};state.updatedAt=next;return{count:1};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{serviceWrites+=1;return{id:'m1',...data};}},mileageLog:{create:async()=>({})}};
  const auth=async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}});
  const service=createMaintenancePostHandler({auth,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(serviceTx)} as never,now:()=>new Date('2026-08-26T10:00:01.000Z')});
  const servicePromise=service(new Request('http://local/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:1500,date:'2026-08-26'})}));await serviceRead;
  const picker=createVehiclePatchHandler({auth,prisma:{vehicle:{findFirst:async()=>({...state})},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({vehicle:{updateMany:async()=>{state.transmission='manual';state.updatedAt=next;return{count:1};},findUnique:async()=>({...state})}})} as never});
  const pickerResponse=await picker(new Request('http://local/vehicle/v1',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'manual',expectedUpdatedAt:start.toISOString()})}),{params:Promise.resolve({id:'v1'})});assert.equal(pickerResponse.status,200);releaseCas();
  assert.equal((await servicePromise).status,409);assert.equal(state.transmission,'manual');assert.equal(serviceWrites,0);
});

test('one reviewed fitment registry covers non-live picker and maintenance normalization',()=>{
  const camaro={year:2019,make:'Chevrolet',model:'Camaro',trim:'ZL1'};
  assert.deepEqual(getReviewedTransmissionChoices(camaro),['automatic','manual']);
  assert.deepEqual(getTransmissionOptions(camaro).map((option)=>option.value),['automatic','manual']);
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{...camaro,transmission:'manual'}),{ok:true,type:'transmission_fluid_manual'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{...camaro,transmission:null}),{ok:false,reason:'transmission-unselected'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',{year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null}),{ok:true,type:'transmission_fluid_auto'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid_auto',{year:2018,make:'Toyota',model:'Camry',trim:'SE',transmission:'automatic'}),{ok:false,reason:'invalid-type'});
});

test('identity-clearing vehicle edits and transmission service conflict in both overlapping orderings',async()=>{
  const initial=new Date('2026-08-26T10:00:00.000Z');const auth=async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}});
  const serviceRequest=()=>new Request('http://local/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:1500,date:'2026-08-26'})});
  const identityRequest=()=>new Request('http://local/vehicle/v1',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({trim:'SXT'})});

  let releaseIdentity!:()=>void;let signalIdentityCas!:()=>void;const identityReleased=new Promise<void>((resolve)=>{releaseIdentity=resolve;});const identityAtCas=new Promise<void>((resolve)=>{signalIdentityCas=resolve;});
  const serviceWins={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as string|null,currentMileage:2000,updatedAt:initial,isPrimary:true};let serviceWinsRecords=0;
  const identityLoses=createVehiclePatchHandler({auth,prisma:{vehicle:{findFirst:async()=>({...serviceWins})},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({vehicle:{updateMany:async({where,data}:{where:{updatedAt:Date};data:Record<string,unknown>})=>{signalIdentityCas();await identityReleased;if(where.updatedAt.getTime()!==serviceWins.updatedAt.getTime())return{count:0};Object.assign(serviceWins,data);return{count:1};},findUnique:async()=>({...serviceWins})},mileageLog:{create:async()=>({})}})} as never});
  const identityPromise=identityLoses(identityRequest(),{params:Promise.resolve({id:'v1'})});await identityAtCas;
  const serviceFirstTx={vehicle:{findFirst:async()=>({...serviceWins}),updateMany:async({where,data}:{where:{updatedAt:Date};data:{updatedAt:Date}})=>{if(where.updatedAt.getTime()!==serviceWins.updatedAt.getTime())return{count:0};serviceWins.updatedAt=data.updatedAt;return{count:1};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{serviceWinsRecords+=1;return{id:'m1',...data};}},mileageLog:{create:async()=>({})}};
  const serviceFirst=createMaintenancePostHandler({auth,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(serviceFirstTx)} as never,now:()=>new Date(initial.getTime()+1)});assert.equal((await serviceFirst(serviceRequest())).status,201);releaseIdentity();assert.equal((await identityPromise).status,409);assert.equal(serviceWinsRecords,1);assert.equal(serviceWins.trim,'SRT 392');

  let releaseService!:()=>void;let signalServiceRead!:()=>void;const serviceReleased=new Promise<void>((resolve)=>{releaseService=resolve;});const serviceDidRead=new Promise<void>((resolve)=>{signalServiceRead=resolve;});
  const identityWins={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic' as string|null,currentMileage:2000,updatedAt:initial,isPrimary:true};let identityWinsRecords=0;
  const waitingServiceTx={vehicle:{findFirst:async()=>{signalServiceRead();return{...identityWins};},updateMany:async({where,data}:{where:{updatedAt:Date};data:{updatedAt:Date}})=>{await serviceReleased;if(where.updatedAt.getTime()!==identityWins.updatedAt.getTime())return{count:0};identityWins.updatedAt=data.updatedAt;return{count:1};},update:async()=>({})},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{identityWinsRecords+=1;return{id:'m2',...data};}},mileageLog:{create:async()=>({})}};
  const waitingService=createMaintenancePostHandler({auth,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(waitingServiceTx)} as never,now:()=>new Date(initial.getTime()+1)});const waitingServicePromise=waitingService(serviceRequest());await serviceDidRead;
  const winningIdentity=createVehiclePatchHandler({auth,prisma:{vehicle:{findFirst:async()=>({...identityWins})},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({vehicle:{updateMany:async({where,data}:{where:{updatedAt:Date};data:Record<string,unknown>})=>{if(where.updatedAt.getTime()!==identityWins.updatedAt.getTime())return{count:0};Object.assign(identityWins,data,{updatedAt:new Date(initial.getTime()+2)});return{count:1};},findUnique:async()=>({...identityWins})},mileageLog:{create:async()=>({})}})} as never});assert.equal((await winningIdentity(identityRequest(),{params:Promise.resolve({id:'v1'})})).status,200);releaseService();assert.equal((await waitingServicePromise).status,409);assert.equal(identityWinsRecords,0);assert.equal(identityWins.trim,'SXT');assert.equal(identityWins.transmission,null);
});

test('assistant writes reject relative dates, preserve offset-local months, and omit Int overflow',async()=>{
  const records:Array<Record<string,unknown>>=[];let transactions=0;let updates=0;let mileageLogs=0;
  const vehicle={id:'v1',userId:'u1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null,currentMileage:100,updatedAt:new Date('2026-08-26T00:00:00.000Z'),nickname:null};
  const tx={vehicle:{findFirst:async()=>vehicle,updateMany:async()=>({count:1}),update:async()=>{updates+=1;return{};}},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{records.push(data);return{...data,cost:null};}},mileageLog:{create:async()=>{mileageLogs+=1;return{};}}};
  const prisma={$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{transactions+=1;return callback(tx);}};
  const maintenance=createGarageAssistantMaintenanceExecutor({prisma:prisma as never,now:()=>new Date('2026-08-27T00:00:00.000Z')});
  await assert.rejects(()=>maintenance({vehicleId:'v1',type:'oil_change',mileage:100,date:'today'},'u1'),(error:unknown)=>(error as {status?:number}).status===400);assert.equal(records.length,0);
  await maintenance({vehicleId:'v1',type:'oil_change',mileage:100,date:'2025-08-30T23:30:00-05:00'},'u1');assert.equal((records.at(-1)?.nextDueDate as Date).toISOString(),'2026-03-01T04:30:00.000Z');
  await maintenance({vehicleId:'v1',type:'oil_change',mileage:2_147_483_600,date:'2026-08-26'},'u1');assert.equal(records.at(-1)?.mileage,2_147_483_600);assert.equal(records.at(-1)?.nextDueMileage,undefined);
  const mileage=createGarageAssistantMileageExecutor({prisma:prisma as never,now:()=>new Date('2026-08-27T00:00:00.000Z')});const logsBeforeDirect=mileageLogs;
  await assert.rejects(()=>mileage({vehicleId:'v1',mileage:10.5},'u1'),(error:unknown)=>(error as {status?:number}).status===400);assert.equal(mileageLogs,logsBeforeDirect);
  await mileage({vehicleId:'v1',mileage:1234},'u1');assert.equal(updates,2);assert.equal(mileageLogs,logsBeforeDirect+1);assert.ok(transactions>=5);
});

test('stale identity-primary CAS throws so sibling primary state rolls back',async()=>{
  const revision=new Date('2026-08-26T00:00:00.000Z');let siblingPrimary=true;let reads=0;let directWrites=0;
  const existing={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',updatedAt:revision,isPrimary:true,currentMileage:1000};
  const prisma={vehicle:{findFirst:async()=>{reads+=1;return existing;},update:async()=>{directWrites+=1;return existing;}},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{let stagedSibling=siblingPrimary;const tx={vehicle:{updateMany:async({where}:{where:{id?:{not:string}}})=>{if(where.id?.not){stagedSibling=false;return{count:1};}return{count:0};},findUnique:async()=>existing},mileageLog:{create:async()=>({})}};const result=await callback(tx);siblingPrimary=stagedSibling;return result;}};
  const handler=createVehiclePatchHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:prisma as never});
  const stale=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({trim:'SXT',isPrimary:true})}),{params:Promise.resolve({id:'v1'})});assert.equal(stale.status,409);assert.equal(siblingPrimary,true);assert.equal(directWrites,0);
  const empty=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:'{}'}),{params:Promise.resolve({id:'v1'})});assert.equal(empty.status,400);
  const expectedOnly=await handler(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({expectedUpdatedAt:revision.toISOString()})}),{params:Promise.resolve({id:'v1'})});assert.equal(expectedOnly.status,400);assert.equal(reads,1);
});

test('assistant multi-tool batch rolls back earlier writes when a later call is invalid',async()=>{
  const committed:{mileages:number[];logs:number[];records:Record<string,unknown>[]}={mileages:[],logs:[],records:[]};
  const vehicle={id:'v1',userId:'u1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null,currentMileage:100,updatedAt:new Date('2026-08-26T00:00:00.000Z'),nickname:null};
  const prisma={$transaction:async(callback:(tx:unknown)=>Promise<unknown>)=>{const staged:{mileages:number[];logs:number[];records:Record<string,unknown>[]}={mileages:[],logs:[],records:[]};const tx={vehicle:{findFirst:async()=>vehicle,update:async({data}:{data:{currentMileage:number}})=>{staged.mileages.push(data.currentMileage);return{};},updateMany:async()=>({count:1})},mileageLog:{create:async({data}:{data:{mileage:number}})=>{staged.logs.push(data.mileage);return{};}},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>{staged.records.push(data);return{...data,cost:null};}}};const result=await callback(tx);committed.mileages.push(...staged.mileages);committed.logs.push(...staged.logs);committed.records.push(...staged.records);return result;}};
  const batch=createGarageAssistantToolBatchExecutor({prisma:prisma as never,now:()=>new Date('2026-08-27T00:00:00.000Z'),executeTool:async(name,args,userId,tx,now)=>name==='update_mileage'?executeGarageAssistantMileageInTransaction(tx,args,userId,now):executeGarageAssistantMaintenanceInTransaction(tx,args,userId,now)});
  await assert.rejects(()=>batch([{id:'1',type:'function',function:{name:'update_mileage',arguments:JSON.stringify({vehicleId:'v1',mileage:1234})}},{id:'2',type:'function',function:{name:'log_maintenance',arguments:JSON.stringify({vehicleId:'v1',type:'oil_change',mileage:1234,date:'yesterday'})}}],'u1'),(error:unknown)=>(error as {status?:number}).status===400);
  assert.deepEqual(committed,{mileages:[],logs:[],records:[]});
  await assert.rejects(()=>batch([{id:'1',type:'function',function:{name:'update_mileage',arguments:JSON.stringify({vehicleId:'v1',mileage:1234})}},{id:'2',type:'function',function:{name:'delete_vehicle',arguments:'{}'}}],'u1'),(error:unknown)=>(error as {status?:number}).status===400);assert.deepEqual(committed,{mileages:[],logs:[],records:[]});
  const conflict=createGarageAssistantToolBatchExecutor({prisma:{$transaction:async()=>{throw{code:'P2034'};}} as never,executeTool:async()=>''});await assert.rejects(()=>conflict([{id:'1',type:'function',function:{name:'list_vehicles',arguments:'{}'}}],'u1'),(error:unknown)=>(error as {status?:number}).status===409);
});

test('guarded maintenance mileage keeps a monotonic revision and matching history',async()=>{
  const revision=new Date('2026-08-27T10:00:00.000Z');const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:100,updatedAt:revision,nickname:null};
  const vehicleUpdates:Array<Record<string,unknown>>=[];const logs:Array<Record<string,unknown>>=[];
  const tx={vehicle:{findFirst:async()=>vehicle,updateMany:async({data}:{data:Record<string,unknown>})=>{vehicle.updatedAt=data.updatedAt as Date;return{count:1};},update:async({data}:{data:Record<string,unknown>})=>{vehicleUpdates.push(data);return{};}},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>({...data,id:'m1',cost:null})},mileageLog:{create:async({data}:{data:Record<string,unknown>})=>{logs.push(data);return data;}}};
  const post=createMaintenancePostHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never,now:()=>revision});
  const response=await post(new Request('http://local/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:200,date:'2026-08-27'})}));
  assert.equal(response.status,201);assert.equal((vehicleUpdates[0].updatedAt as Date).getTime(),revision.getTime()+1);assert.deepEqual(logs[0],{vehicleId:'v1',mileage:200,source:'maintenance'});
  vehicle.currentMileage=100;vehicle.updatedAt=revision;vehicleUpdates.length=0;logs.length=0;
  await executeGarageAssistantMaintenanceInTransaction(tx as never,{vehicleId:'v1',type:'transmission_fluid',mileage:250,date:'2026-08-27'},'u1',revision);
  assert.equal((vehicleUpdates[0].updatedAt as Date).getTime(),revision.getTime()+1);assert.deepEqual(logs[0],{vehicleId:'v1',mileage:250,source:'maintenance'});
});

test('maintenance PATCH is nonempty, keeps only narrow legacy metadata, and pairs due dates',async()=>{
  assert.equal(parseMaintenancePatch({}).success,false);
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:null as string|null,currentMileage:1000,updatedAt:new Date('2026-08-27T00:00:00.000Z')};
  const existing={id:'m1',vehicleId:'v1',type:'transmission_fluid',description:null,mileage:1000,cost:null,date:new Date('2026-01-01T00:00:00.000Z'),nextDueMileage:null,nextDueDate:null,notes:null,receiptUrl:null,shopName:null,vehicle};let writes=0;
  const tx={maintenanceRecord:{findUnique:async()=>existing,update:async({data}:{data:Record<string,unknown>})=>{writes+=1;return{...existing,...data};}},vehicle:{updateMany:async()=>({count:1})}};
  const handler=createMaintenancePatchHandler({auth:async()=>({user:{id:'u1'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never});
  const request=(body:unknown)=>new Request('http://local/maintenance/m1',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await handler(request({}),{params:Promise.resolve({id:'m1'})})).status,400);
  assert.equal((await handler(request({mileage:1100}),{params:Promise.resolve({id:'m1'})})).status,400);assert.equal(writes,0);
  assert.equal((await handler(request({notes:'kept generic',receiptUrl:'https://example.com/r'}),{params:Promise.resolve({id:'m1'})})).status,200);assert.equal(writes,1);
  existing.type='oil_change';vehicle.transmission='automatic';
  assert.equal((await handler(request({nextDueDate:'2027-02-01'}),{params:Promise.resolve({id:'m1'})})).status,400);assert.equal(writes,1);
  assert.equal((await handler(request({date:'2026-02-01'}),{params:Promise.resolve({id:'m1'})})).status,400);assert.equal(writes,1);
  assert.equal((await handler(request({date:'2026-02-01T09:00:00-05:00',nextDueDate:'2027-02-01T09:00:00-05:00'}),{params:Promise.resolve({id:'m1'})})).status,200);assert.equal(writes,2);
});

test('admin reservation partial updates preserve omissions and reject malformed branch state',async()=>{
  const revision=new Date('2026-08-27T10:00:00.000Z');let reads=0;const writes:Array<Record<string,unknown>>=[];
  const reservation={id:'r1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',vehicleVerified:true,trimVerified:true,twinStatus:'reserved',assignedTwin:'dodge-challenger',trialDays:7,transmission:'automatic',readyAt:null,updatedAt:revision};
  const prisma={reservation:{findUnique:async()=>{reads+=1;return reservation;},updateMany:async({data}:{data:Record<string,unknown>})=>{writes.push(data);return{count:1};},findUniqueOrThrow:async()=>({...reservation,updatedAt:revision})}};
  const handler=createAdminReservationPostHandler({requireFounder:async()=>null,prisma:prisma as never,now:()=>revision});const request=(body:unknown)=>new Request('http://local/admin/reservations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  for(const body of [{id:'r1',expectedUpdatedAt:revision.toISOString(),unknown:true},{id:'r1',expectedUpdatedAt:revision.toISOString(),trialDays:'7'},{id:'r1',expectedUpdatedAt:'tomorrow',status:'building'},{id:'r1',expectedUpdatedAt:revision.toISOString()}])assert.equal((await handler(request(body))).status,400);
  assert.equal(reads,0);
  assert.equal((await handler(request({id:'r1',expectedUpdatedAt:revision.toISOString(),status:'building'}))).status,200);assert.deepEqual(writes[0],{twinStatus:'building',readyAt:null,updatedAt:new Date(revision.getTime()+1)});
  assert.equal((await handler(request({id:'r1',expectedUpdatedAt:revision.toISOString(),assignedTwin:null}))).status,200);assert.deepEqual(writes[1],{assignedTwin:null,transmission:null,updatedAt:new Date(revision.getTime()+1)});
  assert.equal((await handler(request({id:'r1',expectedUpdatedAt:revision.toISOString(),transmission:'cvt'}))).status,400);
  assert.equal(transmissionSelectionFitsReviewedOptions([], 'automatic'),false);assert.equal(transmissionSelectionFitsReviewedOptions(['automatic'],'manual'),false);assert.equal(transmissionSelectionFitsReviewedOptions(['automatic'],'automatic'),false);assert.equal(transmissionSelectionFitsReviewedOptions(['automatic','manual'],'manual'),true);
});

test('vehicle identifiers normalize and semantic identity or branch saves are no-ops',async()=>{
  const vin=parseVehiclePatch({vin:' 1hgcm82633a004352 '});assert.equal(vin.success,true);if(vin.success)assert.equal(vin.data.vin,'1HGCM82633A004352');
  const slug=parseVehiclePatch({showcaseSlug:' My-Build '});assert.equal(slug.success,true);if(slug.success)assert.equal(slug.data.showcaseSlug,'my-build');
  assert.equal(parseVehiclePatch({vin:'   '}).success,false);assert.equal(parseVehiclePatch({showcaseSlug:'   '}).success,false);assert.equal(parseVehiclePatch({showcaseSlug:'bad slug'}).success,false);
  const revision=new Date('2026-08-27T00:00:00.000Z');const existing={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',updatedAt:revision,isPrimary:true,currentMileage:1000};let directWrites=0;let transactions=0;
  const handler=createVehiclePatchHandler({auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),prisma:{vehicle:{findFirst:async()=>existing,update:async()=>{directWrites+=1;return existing;}},$transaction:async()=>{transactions+=1;return existing;}} as never});
  const call=(body:unknown)=>handler(new Request('http://local/vehicle/v1',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{params:Promise.resolve({id:'v1'})});
  assert.equal((await call({make:' dodge '})).status,200);assert.equal((await call({trim:'srt_392'})).status,200);assert.equal((await call({transmission:'automatic',expectedUpdatedAt:revision.toISOString()})).status,200);assert.equal(directWrites,0);assert.equal(transactions,0);
});

test('generic transmission reads and production assistant status see the reviewed exact branch',async()=>{
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:60000,nickname:null,vin:null,isPrimary:true,maintenanceRecords:[{type:'transmission_fluid_auto',date:new Date('2026-01-01T00:00:00.000Z'),mileage:59000,nextDueMileage:119000,cost:null}]};
  assert.deepEqual(resolveMaintenanceReadTypes('transmission_fluid',vehicle),['transmission_fluid','transmission_fluid_auto']);let where:Record<string,unknown>={};
  const readTx={vehicle:{findFirst:async()=>vehicle},maintenanceRecord:{findMany:async({where:input}:{where:Record<string,unknown>})=>{where=input;return vehicle.maintenanceRecords;}}};let isolation='';
  const get=createMaintenanceGetHandler({auth:async()=>({user:{id:'u1'}}),prisma:{$transaction:async(callback:(tx:typeof readTx)=>Promise<unknown>,options:{isolationLevel:string})=>{isolation=options.isolationLevel;return callback(readTx);}} as never});
  assert.equal((await get(new Request('http://local/maintenance?vehicleId=v1&type=transmission_fluid'))).status,200);assert.deepEqual((where.type as {in:string[]}).in,['transmission_fluid','transmission_fluid_auto']);
  assert.equal((await get(new Request('http://local/maintenance?vehicleId=v1&type=transmission_fluid_manual'))).status,400);assert.deepEqual((where.type as {in:string[]}).in,['transmission_fluid','transmission_fluid_auto']);
  assert.equal(isolation,'Serializable');
  const output=await executeGarageAssistantProductionTool('get_maintenance_status',{vehicleId:'v1'},'u1',{vehicle:{findFirst:async()=>vehicle}} as never,new Date('2026-08-27T00:00:00.000Z'));
  const transmission=(JSON.parse(output) as Array<{type:string;status:string}>).find((item)=>item.type==='Transmission Fluid');assert.ok(transmission);assert.notEqual(transmission?.status,'unknown');
});

test('assistant tool shapes fail before a transaction and production seams execute',async()=>{
  let transactions=0;let executions=0;const batch=createGarageAssistantToolBatchExecutor({prisma:{$transaction:async(callback:(_tx:unknown)=>Promise<unknown>)=>{transactions+=1;return callback({});}} as never,executeTool:async()=>{executions+=1;return'ok';}});
  const invalid:unknown[]=[null,[],[{}],[{id:'',function:{name:'list_vehicles',arguments:'{}'}}],[{id:'1',type:'other',function:{name:'list_vehicles',arguments:'{}'}}],[{id:'1',type:'function',function:{name:'list_vehicles',arguments:'[]'}}],[{id:'1',type:'function',function:{name:'unknown',arguments:'{}'}}],[{id:'1',type:'function',function:{name:'list_vehicles',arguments:'{"extra":true}'}}],[{id:'1',type:'function',function:{name:'update_mileage',arguments:'{"vehicleId":"v1","mileage":1.5}'}}],[{id:'1',type:'function',function:{name:'log_maintenance',arguments:'{"vehicleId":"v1","type":"oil_change","mileage":1,"date":"today"}'}}]];
  for(const calls of invalid)await assert.rejects(()=>batch(calls,'u1'),(error:unknown)=>(error as {status?:number}).status===400);
  assert.equal(transactions,0);assert.equal(executions,0);
  const result=await batch([{id:' 1 ',type:'function',function:{name:' list_vehicles ',arguments:'{}'}}],'u1');assert.equal(transactions,1);assert.equal(executions,1);assert.equal(result.toolResults[0].tool_call_id,'1');
});

test('assistant batch preserves one monotonic vehicle revision across later mileage tools',async()=>{
  const revision=new Date('2026-08-27T10:00:00.000Z');
  const vehicle={id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:100,updatedAt:revision,nickname:null};
  const finalRevisions:Date[]=[];
  const tx={vehicle:{findFirst:async()=>({...vehicle}),updateMany:async({where,data}:{where:{updatedAt:Date};data:{updatedAt:Date}})=>{if(where.updatedAt.getTime()!==vehicle.updatedAt.getTime())return{count:0};vehicle.updatedAt=data.updatedAt;return{count:1};},update:async({data}:{data:{currentMileage:number;updatedAt:Date}})=>{vehicle.currentMileage=data.currentMileage;vehicle.updatedAt=data.updatedAt;finalRevisions.push(data.updatedAt);return{...vehicle};}},maintenanceRecord:{create:async({data}:{data:Record<string,unknown>})=>({...data,id:'m1',cost:null})},mileageLog:{create:async()=>({})}};
  const batch=createGarageAssistantToolBatchExecutor({prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never,now:()=>revision,executeTool:executeGarageAssistantProductionTool});
  const calls=[{id:'1',type:'function',function:{name:'log_maintenance',arguments:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:200,date:'2026-08-27'})}},{id:'2',type:'function',function:{name:'update_mileage',arguments:JSON.stringify({vehicleId:'v1',mileage:300})}}];
  const result=await batch(calls,'u1');assert.equal(result.actions.length,2);assert.deepEqual(finalRevisions.map((value)=>value.getTime()),[revision.getTime()+1,revision.getTime()+2]);assert.equal(vehicle.updatedAt.getTime(),revision.getTime()+2);
});

test('single-fitment ready and claim handlers reject stored branches and persist null',async()=>{
  const now=new Date('2026-08-27T10:00:00.000Z');
  const singleTwin={id:'dodge-challenger',label:'Lincoln Nautilus',make:'lincoln',model:'nautilus',yearFrom:2019,yearTo:2019,trims:['reserve'],transmissions:['automatic'] as const,live:true};
  const reservation={id:'r1',email:'owner@example.com',vehicle:'2019 Lincoln Nautilus Reserve',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',trimVerified:true,vehicleVerified:true,twinStatus:'building',assignedTwin:'dodge-challenger',trialDays:7,transmission:'automatic' as string|null,readyAt:null,claimedAt:null,updatedAt:now};let adminWrites=0;
  const admin=createAdminReservationPostHandler({requireFounder:async()=>null,now:()=>now,resolveTwinDefinition:()=>singleTwin,prisma:{reservation:{findUnique:async()=>reservation,updateMany:async()=>({count:++adminWrites}),findUniqueOrThrow:async()=>reservation}} as never});
  const adminRequest=(body:unknown)=>new Request('http://local/admin/reservations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await admin(adminRequest({id:'r1',expectedUpdatedAt:now.toISOString(),status:'ready'}))).status,400);assert.equal(adminWrites,0);
  assert.equal((await admin(adminRequest({id:'r1',expectedUpdatedAt:now.toISOString(),transmission:null}))).status,200);assert.equal(adminWrites,1);

  let reservationWrites=0;let vehicleWrites=0;let copiedTransmission:unknown='unset';
  reservation.twinStatus='ready';reservation.transmission='automatic';
  const garage={id:'v1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null as string|null,currentMileage:2000,updatedAt:now};
  const tx={$queryRaw:async()=>[{now}],reservation:{findUnique:async()=>reservation,updateMany:async()=>({count:++reservationWrites})},vehicle:{findMany:async()=>[garage],updateMany:async({data}:{data:{transmission:string|null}})=>{copiedTransmission=data.transmission;return{count:++vehicleWrites};}}};
  const claim=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),resolveTwinDefinition:()=>singleTwin,prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never});
  assert.equal((await claim()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);
  reservation.transmission=null;garage.transmission='automatic';assert.equal((await claim()).status,409);assert.equal(reservationWrites,0);assert.equal(vehicleWrites,0);
  garage.transmission=null;assert.equal((await claim()).status,200);assert.equal(reservationWrites,1);assert.equal(vehicleWrites,1);assert.equal(copiedTransmission,null);
});

test('committed assistant actions always have a nonempty success response',async()=>{
  const responseHelpers=await import('../src/lib/garage-assistant-response');
  const actions=[{tool:'update_mileage',result:'Updated mileage to 1,234 miles.'}];
  assert.equal(responseHelpers.resolveCommittedGarageActionMessage({choices:[{message:{content:'Saved.'}}]},actions),'Saved.');
  assert.match(responseHelpers.resolveCommittedGarageActionMessage(null,actions),/Updated mileage/);
  assert.match(responseHelpers.resolveCommittedGarageActionMessage({choices:[]},actions),/Updated mileage/);
  assert.match(responseHelpers.resolveCommittedGarageActionMessage({choices:[{message:{content:'   '}}]},actions),/Updated mileage/);
});

test('reviewed transmission integrity and readability stay fail-closed across single and dual fitments',async()=>{
  const singleNull={year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null};
  const singleAutomatic={...singleNull,transmission:'automatic'};
  const singleManual={...singleNull,transmission:'manual'};
  assert.equal(hasValidReviewedTransmissionState(singleNull),true);
  assert.equal(hasValidReviewedTransmissionState(singleAutomatic),false);
  assert.equal(hasValidReviewedTransmissionState(singleManual),false);
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',singleNull),{ok:true,type:'transmission_fluid_auto'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid',singleAutomatic),{ok:false,reason:'transmission-mismatch'});
  assert.deepEqual(resolveMaintenanceWriteType('transmission_fluid_manual',singleManual),{ok:false,reason:'transmission-mismatch'});
  assert.deepEqual(resolveReadableTransmissionMaintenanceTypes(singleManual),['transmission_fluid','transmission_fluid_auto']);
  assert.equal(maintenanceTypeIsReadableForVehicle('transmission_fluid_manual',singleManual),false);

  for(const transmission of ['automatic','manual'] as const){
    const dual={year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission};
    const exact=`transmission_fluid_${transmission==='automatic'?'auto':'manual'}`;
    const opposite=`transmission_fluid_${transmission==='automatic'?'manual':'auto'}`;
    assert.equal(hasValidReviewedTransmissionState(dual),true);
    assert.deepEqual(resolveMaintenanceReadTypes('transmission_fluid',dual),['transmission_fluid',exact]);
    assert.equal(maintenanceTypeIsReadableForVehicle(opposite,dual),false);
  }

  let records=0;let guards=0;
  const corruptPost=createMaintenancePostHandler({
    auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),
    prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback({
      vehicle:{findFirst:async()=>({...singleManual,id:'v1',userId:'u1',updatedAt:new Date('2026-08-27T00:00:00.000Z'),currentMileage:1000}),updateMany:async()=>{guards+=1;return{count:1};}},
      maintenanceRecord:{create:async()=>{records+=1;return{};}},mileageLog:{create:async()=>({})},
    })} as never,
  });
  const response=await corruptPost(new Request('http://local/maintenance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({vehicleId:'v1',type:'transmission_fluid',mileage:1000,date:'2026-08-27'})}));
  assert.equal(response.status,400);assert.equal(records,0);assert.equal(guards,0);

  let patchWrites=0;let patchGuards=0;
  const corruptRecord={id:'m1',vehicleId:'v1',type:'transmission_fluid',description:null,mileage:900,cost:null,date:new Date('2026-01-01T00:00:00.000Z'),nextDueMileage:null,nextDueDate:null,notes:null,receiptUrl:null,shopName:null,vehicle:{...singleManual,id:'v1',userId:'u1',updatedAt:new Date('2026-08-27T00:00:00.000Z')}};
  const corruptPatch=createMaintenancePatchHandler({auth:async()=>({user:{id:'u1'}}),prisma:{$transaction:async(callback:(tx:unknown)=>Promise<unknown>)=>callback({maintenanceRecord:{findUnique:async()=>corruptRecord,update:async()=>{patchWrites+=1;return corruptRecord;}},vehicle:{updateMany:async()=>{patchGuards+=1;return{count:1};}}})} as never});
  const patchResponse=await corruptPatch(new Request('http://local/maintenance/m1',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({notes:'receipt reviewed'})}),{params:Promise.resolve({id:'m1'})});
  assert.equal(patchResponse.status,400);assert.equal(patchWrites,0);assert.equal(patchGuards,0);
});

test('unfiltered maintenance and assistant vehicle history omit the opposite exact branch',async()=>{
  const rows=[
    {type:'oil_change',date:new Date('2026-08-01T00:00:00.000Z'),mileage:100,cost:null},
    {type:'transmission_fluid',date:new Date('2026-08-02T00:00:00.000Z'),mileage:200,cost:null},
    {type:'transmission_fluid_auto',date:new Date('2026-08-03T00:00:00.000Z'),mileage:300,cost:null},
    {type:'transmission_fluid_manual',date:new Date('2026-08-04T00:00:00.000Z'),mileage:400,cost:null},
  ];
  const states=[
    {vehicle:{id:'v1',userId:'u1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:null,currentMileage:500,nickname:null,vin:null},excluded:'transmission_fluid_manual'},
    {vehicle:{id:'v1',userId:'u1',year:2019,make:'Lincoln',model:'Nautilus',trim:'Reserve',transmission:'manual',currentMileage:500,nickname:null,vin:null},excluded:'transmission_fluid_manual'},
    {vehicle:{id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:500,nickname:null,vin:null},excluded:'transmission_fluid_manual'},
    {vehicle:{id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',currentMileage:500,nickname:null,vin:null},excluded:'transmission_fluid_auto'},
  ];
  for(const state of states){
    let getWhere:Record<string,unknown>={};
    const readTx={vehicle:{findFirst:async()=>state.vehicle},maintenanceRecord:{findMany:async({where}:{where:Record<string,unknown>})=>{getWhere=where;return[];}}};let isolation='';
    const get=createMaintenanceGetHandler({auth:async()=>({user:{id:'u1'}}),prisma:{$transaction:async(callback:(tx:typeof readTx)=>Promise<unknown>,options:{isolationLevel:string})=>{isolation=options.isolationLevel;return callback(readTx);}} as never});
    assert.equal((await get(new Request('http://local/maintenance?vehicleId=v1'))).status,200);
    assert.deepEqual((getWhere.type as {notIn:string[]}).notIn,[state.excluded]);
    assert.equal(isolation,'Serializable');

    let assistantWhere:Record<string,unknown>={};
    const output=await executeGarageAssistantProductionTool('get_vehicle_info',{vehicleId:'v1'},'u1',{
      vehicle:{findFirst:async()=>state.vehicle},
      maintenanceRecord:{findMany:async({where}:{where:Record<string,unknown>})=>{assistantWhere=where;const excluded=(where.type as {notIn?:string[]}|undefined)?.notIn??[];return rows.filter((row)=>!excluded.includes(row.type));}},
    } as never,new Date('2026-08-27T00:00:00.000Z'));
    assert.deepEqual((assistantWhere.type as {notIn:string[]}).notIn,[state.excluded]);
    const recent=(JSON.parse(output) as {recentMaintenance:Array<{type:string}>}).recentMaintenance.map((record)=>record.type);
    assert.equal(recent.includes(state.excluded),false);assert.equal(recent.includes('transmission_fluid'),true);assert.equal(recent.includes('oil_change'),true);
  }
});

test('picker and identity CAS writes advance revisions under same-millisecond and regressed clocks',async()=>{
  const revision=new Date('2026-08-27T10:00:00.000Z');
  const writes:Record<string,unknown>[]=[];
  const makeHandler=(existing:Record<string,unknown>,now:Date,onTransaction:()=>void=()=>{})=>createVehiclePatchHandler({
    auth:async()=>({user:{id:'u1',email:'devonsroberson24@yahoo.com'}}),now:()=>now,
    prisma:{vehicle:{findFirst:async()=>existing},$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>{onTransaction();return callback({vehicle:{updateMany:async({data}:{data:Record<string,unknown>})=>{writes.push(data);return{count:1};},findUnique:async()=>({...existing,...writes.at(-1)})},mileageLog:{create:async()=>({})}});}} as never,
  });
  const picker=makeHandler({id:'v1',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:null,updatedAt:revision,isPrimary:true,currentMileage:1000},revision);
  assert.equal((await picker(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'automatic',expectedUpdatedAt:revision.toISOString()})}),{params:Promise.resolve({id:'v1'})})).status,200);
  assert.equal((writes[0].updatedAt as Date).getTime(),revision.getTime()+1);

  const identity=makeHandler({id:'v2',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'manual',updatedAt:revision,isPrimary:true,currentMileage:1000},new Date(revision.getTime()-10_000));
  assert.equal((await identity(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({trim:'SXT'})}),{params:Promise.resolve({id:'v2'})})).status,200);
  assert.equal((writes[1].updatedAt as Date).getTime(),revision.getTime()+1);

  let transactions=0;
  const invalid=makeHandler({id:'v3',userId:'u1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:null,updatedAt:revision,isPrimary:true,currentMileage:1000},new Date(Number.NaN),()=>{transactions+=1;});
  const invalidResponse=await invalid(new Request('http://local',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({transmission:'automatic',expectedUpdatedAt:revision.toISOString()})}),{params:Promise.resolve({id:'v3'})});
  assert.equal(invalidResponse.status,409);assert.equal(transactions,0);
  assert.throws(
    ()=>nextMonotonicRevision(new Date(8_640_000_000_000_000),revision),
    (error:unknown)=>(error as {status?:number}).status===409,
  );
});

test('claim CAS advances reservation and vehicle revisions with a regressed database clock',async()=>{
  const revision=new Date('2026-08-27T10:00:00.000Z');const now=new Date(revision.getTime()-10_000);
  const reservation={id:'r1',email:'owner@example.com',vehicle:'2015 Dodge Challenger SRT 392',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',trimVerified:true,assignedTwin:'dodge-challenger',transmission:'automatic',vehicleVerified:true,twinStatus:'ready',trialDays:7,claimedAt:null,updatedAt:revision};
  const vehicle={id:'v1',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',transmission:'automatic',currentMileage:2000,updatedAt:revision};
  let reservationData:Record<string,unknown>={};let vehicleData:Record<string,unknown>={};
  const tx={$queryRaw:async()=>[{now}],reservation:{findUnique:async()=>reservation,updateMany:async({data}:{data:Record<string,unknown>})=>{reservationData=data;return{count:1};}},vehicle:{findMany:async()=>[vehicle],updateMany:async({data}:{data:Record<string,unknown>})=>{vehicleData=data;return{count:1};}}};
  const claim=createTwinClaimPostHandler({auth:async()=>({user:{id:'u1',email:'owner@example.com'}}),prisma:{$transaction:async(callback:(value:unknown)=>Promise<unknown>)=>callback(tx)} as never});
  assert.equal((await claim()).status,200);
  assert.equal((reservationData.updatedAt as Date).getTime(),revision.getTime()+1);assert.equal((vehicleData.updatedAt as Date).getTime(),revision.getTime()+1);
});

test('actual API and page modules load while production-independent bindings execute',async()=>{
  const routeModules=await Promise.all([
    import('../src/app/api/vehicles/[id]/route'),
    import('../src/app/api/maintenance/route'),
    import('../src/app/api/maintenance/[id]/route'),
    import('../src/app/api/twin/claim/route'),
    import('../src/app/api/admin/reservations/route'),
    import('../src/app/api/garage/assistant/route'),
  ]);
  const bindings=routeModules.map((value)=>{const record=value as unknown as Record<string,unknown>;return typeof record.default==='object'&&record.default!==null?record.default as Record<string,unknown>:record;});
  assert.equal(typeof bindings[0].PATCH,'function');assert.equal(typeof bindings[1].GET,'function');assert.equal(typeof bindings[1].POST,'function');assert.equal(typeof bindings[2].PATCH,'function');assert.equal(typeof bindings[3].POST,'function');assert.equal(typeof bindings[4].POST,'function');assert.equal(typeof bindings[5].POST,'function');
  const pageModule=await import('../src/app/twin/claim/page');const pageDefault=typeof pageModule.default==='function'?pageModule.default:(pageModule.default as unknown as {default?:unknown})?.default;assert.equal(typeof pageDefault,'function');
  const responseModule=await import('../src/lib/garage-assistant-response');assert.match(responseModule.committedGarageActionFallback([{tool:'list_vehicles',result:'No vehicles found.'}]),/No vehicles/);
});
