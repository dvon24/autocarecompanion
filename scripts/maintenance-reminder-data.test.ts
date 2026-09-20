import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMaintenanceReminders, maintenanceEmailDeliveryKey, type ReminderRecord } from '../src/lib/maintenance-reminder-data';
import { maintenanceEmailArtwork, maintenanceEmailVehicleLinks, renderMaintenanceAlertEmail } from '../src/lib/maintenance-alert-email';
import { applyOwnerMaintenanceIntervals } from '../src/lib/vehicle-maintenance-intervals';
import { safeInternalCallback } from '../src/lib/auth-callback';

const now = new Date('2026-09-13T12:00:00Z');
const xt6 = { id:'saved-xt6',year:2020,make:'Cadillac',model:'XT6',trim:'Sport',transmission:null,currentMileage:160000 };
const challenger = { id:'saved-challenger',year:2015,make:'Dodge',model:'Challenger',trim:'SRT 392',color:'Granite Crystal Metallic',transmission:'manual',currentMileage:65000 };
const row = (type:string, mileage=10000, date='2026-01-01T12:00:00Z', extra:Partial<ReminderRecord> = {}):ReminderRecord => ({id:type+date,type,mileage,date:new Date(date),...extra});

test('unknown history never manufactures model-year overdue notices',()=>{
  assert.deepEqual(buildMaintenanceReminders(xt6,[],now),[]);
  assert.deepEqual(buildMaintenanceReminders(challenger,[],now),[]);
});
test('exact gearcase milestone agrees with actual Hub interval projection',()=>{
  const record=row('rear_axle_fluid');
  const reminder=buildMaintenanceReminders(xt6,[record],now)[0];
  const node={maintenanceType:record.type,servicedAt:record.mileage,servicedDate:record.date.toISOString(),dueMileage:null,dueDate:null};
  applyOwnerMaintenanceIntervals({car:{nodes:{node}}},[{...record,date:record.date.toISOString(),nextDueDate:null}],xt6,xt6.currentMileage,now.toISOString());
  assert.equal(reminder.status.dueAtMileage,160000);
  assert.equal(reminder.status.dueAtMileage,node.dueMileage);
  assert.equal(reminder.status.dueAtDate,undefined);
});
test('new service supersedes old alerts; future and duplicate records do not',()=>{
  const old=row('rear_axle_fluid');
  const fresh=row('rear_axle_fluid',160000,'2026-09-12T12:00:00Z');
  assert.deepEqual(buildMaintenanceReminders(xt6,[old,fresh,old],now),[]);
  assert.equal(buildMaintenanceReminders(xt6,[old,row('rear_axle_fluid',160000,'2027-01-01')],now).length,1);
  assert.deepEqual(buildMaintenanceReminders(xt6,[row('rear_axle_fluid',170000)],now),[]);
});
test('separate clutch circuit cannot complete gearcase and has no fabricated clock',()=>{
  const reminders=buildMaintenanceReminders(xt6,[row('rear_axle_fluid'),row('awd_clutch_fluid',160000,'2026-09-12')],now);
  assert.deepEqual(reminders.map(r=>r.maintenanceType),['rear_axle_fluid']);
  const saved=buildMaintenanceReminders(xt6,[row('awd_clutch_fluid',10000,'2026-01-01',{nextDueMileage:150000})],now)[0];
  assert.equal(saved.status.dueAtMileage,150000);
  assert.match(saved.deadlineNote!,/Saved service-record deadline/);
});
test('calendar-only work survives unknown odometer without a invented mileage fact',()=>{
  const reminders=buildMaintenanceReminders({...xt6,currentMileage:null},[row('brake_fluid',10000,'2021-09-01')],now);
  assert.equal(reminders.length,1);
  assert.equal(reminders[0].status.dueAtMileage,undefined);
  assert.equal(reminders[0].status.dueAtDate?.toISOString(),'2026-09-01T00:00:00.000Z');
  assert.doesNotMatch(reminders[0].status.message,/mi\b/);
});
test('unknown odometer does not trigger saved mileage deadline',()=>{
  assert.deepEqual(buildMaintenanceReminders({...xt6,currentMileage:null},[row('rear_axle_fluid',10000,'2026-01-01',{nextDueMileage:5000})],now),[]);
});
test('manual and automatic records cannot cross branches or map unassigned legacy work',()=>{
  const records=[row('transmission_fluid_auto',10000,'2026-01-01',{nextDueMileage:50000}),row('transmission_fluid',10000,'2026-01-01',{nextDueMileage:50000}),row('transmission_fluid_manual',10000,'2026-01-01',{nextDueMileage:50000})];
  assert.deepEqual(buildMaintenanceReminders(challenger,records,now).map(r=>r.maintenanceType),['transmission_fluid_manual']);
  assert.deepEqual(buildMaintenanceReminders({...challenger,transmission:null},records,now),[]);
});
test('no automatic wear-item replacement deadline and rotation does not complete replacement',()=>{
  assert.deepEqual(buildMaintenanceReminders(challenger,[row('tire_replacement'),row('front_brake_rotors')],now),[]);
  const alerts=buildMaintenanceReminders(challenger,[row('tire_replacement',10000,'2026-01-01',{nextDueMileage:60000}),row('tire_rotation',65000,'2026-09-12')],now);
  assert.deepEqual(alerts.map(r=>r.maintenanceType),['tire_replacement']);
});
test('actual vehicle links survive auth callbacks and never use another saved ID',()=>{
  const reminder=buildMaintenanceReminders(xt6,[row('rear_axle_fluid')],now)[0];
  const links=maintenanceEmailVehicleLinks({...reminder,destination:'hub'},'https://preview.invalid');
  assert.equal(links.schedule,'https://preview.invalid/maintenance/reminder?vehicleId=saved-xt6&view=schedule');
  assert.equal(safeInternalCallback(new URL(links.schedule).pathname+new URL(links.schedule).search),'/maintenance/reminder?vehicleId=saved-xt6&view=schedule');
  assert.match(maintenanceEmailVehicleLinks({...reminder,vehicle:{...xt6,id:'another'}},'https://preview.invalid').schedule,/vehicleId=saved-xt6&view=records$/);
});
test('artwork requires exact supported identity AND saved paint',()=>{
  assert.match(maintenanceEmailArtwork(challenger)!,/challenger-granite-crystal-600.jpg$/);
  assert.equal(maintenanceEmailArtwork({...challenger,color:'TorRed'}),null);
  assert.equal(maintenanceEmailArtwork({...challenger,trim:'Hellcat'}),null);
  assert.equal(maintenanceEmailArtwork({...challenger,color:null}),null);
});
test('multi-vehicle layout uses each Hub, warm design, real facts and no sample price',()=>{
  const alerts=[...buildMaintenanceReminders(challenger,[row('oil_change',60000,'2025-01-01',{nextDueMileage:64000})],now),...buildMaintenanceReminders(xt6,[row('rear_axle_fluid')],now)];
  const html=renderMaintenanceAlertEmail({userName:'Owner <script>',alerts:alerts.map(a=>({...a,destination:'hub' as const})),appUrl:'https://preview.invalid'});
  assert.match(html,/Owner &lt;script&gt;/);
  assert.match(html,/vehicleId=saved-challenger&amp;view=schedule/);
  assert.match(html,/vehicleId=saved-xt6&amp;view=schedule/);
  assert.match(html,/table-layout:fixed/);
  assert.match(html,/<td data-maintenance-artwork[^>]*><img[^>]* width="542"/);
  assert.match(html,/width:100%!important;max-width:100%!important;height:auto!important/);
  assert.match(html,/#FAF7F0/);
  assert.doesNotMatch(html,/\$44|\$69|Pennzoil|65,000.*last logged Aug 22|content-disposition/i);
  assert.equal((html.match(/data-maintenance-artwork/g)||[]).length,1);
});
test('same UTC daily key across retries, different next day; recipient not in key',()=>{
  assert.equal(maintenanceEmailDeliveryKey('id',now),maintenanceEmailDeliveryKey('id',new Date('2026-09-13T22:00:00Z')));
  assert.notEqual(maintenanceEmailDeliveryKey('id',now),maintenanceEmailDeliveryKey('id',new Date('2026-09-14T01:00:00Z')));
  assert.notEqual(maintenanceEmailDeliveryKey('id',now),maintenanceEmailDeliveryKey('other',now));
});
