import assert from 'node:assert/strict';
import test from 'node:test';
import { allowReconciledHubVehicleRetry, createHubVehicle, HubVehicleSaveUnconfirmedError, hubVehiclePayload, reconcileHubVehicleSave, type HubVehicleFields } from '../src/components/twin/hub/hub-add-vehicle';

const fields: HubVehicleFields = { year: '2020', make: ' Cadillac ', model: ' XT6 ', trim: '', vin: '', currentMileage: '1000' };

test('normalizes owner input without inventing optional values or changing the primary car', () => {
  assert.deepEqual(hubVehiclePayload(fields), { year: 2020, make: 'Cadillac', model: 'XT6', currentMileage:1000,hubSetup:true,isPrimary: false });
  assert.deepEqual(hubVehiclePayload({ ...fields, currentMileage: '1', trim: ' Premium Luxury ', vin: '1gkknxlsxlz100001' }), {
    year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Premium Luxury', vin: '1GKKNXLSXLZ100001', currentMileage: 1,hubSetup:true,isPrimary: false,
  });
});

test('rejects empty, fractional, out-of-range and nonfinite values before posting', async () => {
  for (const invalid of [
    { year: '' }, { year: '1899' }, { year: '2020.5' }, { year: 'Infinity' }, { year: '2099' },
    { make: ' ' }, { model: ' ' }, { make: 'a'.repeat(101) }, { trim: 'a'.repeat(101) },
    { vin: '123' }, { vin: 'IIIIIIIIIIIIIIIII' }, { currentMileage: '-1' },
    { currentMileage: '12.5' }, { currentMileage: 'Infinity' },
    {currentMileage:''},{currentMileage:'0'},{currentMileage:'2147483648'},
  ]) {
    let requested = false;
    await assert.rejects(createHubVehicle({ ...fields, ...invalid }, async () => { requested = true; return new Response(); }));
    assert.equal(requested, false, JSON.stringify(invalid));
  }
});

test('posts once to the existing authenticated vehicle API and requires the returned record', async () => {
  let calls = 0;
  const created = { id: 'vehicle-123', year: 2020, make: 'Cadillac', model: 'XT6',currentMileage:1000 };
  assert.deepEqual(await createHubVehicle(fields, async (url, init) => {
    calls++;
    assert.equal(url, '/api/vehicles');
    assert.equal(init?.method, 'POST');
    assert.deepEqual(init?.headers, { 'Content-Type': 'application/json' });
    assert.deepEqual(JSON.parse(String(init?.body)), hubVehiclePayload(fields));
    return Response.json({ vehicle: created }, { status: 201 });
  }), created);
  assert.equal(calls, 1);
});

test('surfaces server quota and expired-session errors without retries or input mutation', async () => {
  const original = { ...fields };
  const quotaMessage = "You've reached the 1-vehicle limit on the free plan. Upgrade to plus to add more.";
  let calls = 0;
  await assert.rejects(createHubVehicle(fields, async () => {
    calls++;
    return Response.json({ error: 'vehicle_limit_reached', message: quotaMessage }, { status: 403 });
  }), { message: quotaMessage });
  assert.equal(calls, 1);
  await assert.rejects(createHubVehicle(fields, async () => Response.json({ error: 'Unauthorized' }, { status: 401 })), /session has expired/);
  assert.deepEqual(fields, original);
});

test('does not report success for failed, missing or malformed server responses', async () => {
  for (const response of [
    Response.json({ error: 'Failed to create vehicle' }, { status: 500 }),
    new Response('Bad gateway', { status: 502 }),
    Response.json({ success: true }, { status: 201 }),
    Response.json({ vehicle: { id: '', year: 2020, make: 'Cadillac', model: 'XT6' } }, { status: 201 }),
    Response.json({ vehicle: { id: 'v1', year: 2020, make: 'Cadillac' } }, { status: 201 }),
  ]) {
    await assert.rejects(createHubVehicle(fields, async () => response), /Check your saved vehicles/);
  }
  await assert.rejects(createHubVehicle(fields, async () => { throw new TypeError('Failed to fetch'); }), /Check your saved vehicles/);
});

test('times out a stalled POST or response body without retrying or claiming nothing was saved', async () => {
  for (const stalledBody of [false, true]) {
    let calls = 0;
    await assert.rejects(createHubVehicle(fields, async () => {
      calls++;
      if (!stalledBody) return new Promise<Response>(() => {});
      return new Response(new ReadableStream({ start() {} }), { status:201 });
    }, 10), HubVehicleSaveUnconfirmedError);
    assert.equal(calls, 1);
  }
});

test('reconciliation reads saved cars without a second POST and preserves trim identity', async () => {
  const matches = await reconcileHubVehicleSave(fields, async (url, init) => {
    assert.equal(url, '/api/vehicles?view=switcher');
    assert.equal(init?.method, undefined);
    return Response.json({ vehicles:[{ id:'new', year:2020, make:'Cadillac', model:'XT6', trim:null }, { id:'other-trim', year:2020, make:'Cadillac', model:'XT6', trim:'Sport' }] });
  });
  assert.deepEqual(matches.map((vehicle) => vehicle.id), ['new']);
  await assert.rejects(reconcileHubVehicleSave(fields, async () => Response.json({ error:'Unauthorized' }, { status:401 })), /could not be checked/);
});

test('an uncertain save remains blocked across modal reopen until garage check and explicit retry', async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const stored = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', { configurable:true, value:{ sessionStorage:{
    setItem: (key: string, value: string) => stored.set(key, value),
    getItem: (key: string) => stored.get(key) ?? null,
    removeItem: (key: string) => stored.delete(key),
  } } });
  try {
    let posts = 0;
    const neverRespond: typeof fetch = async () => { posts++; return new Promise<Response>(() => {}); };
    await assert.rejects(createHubVehicle(fields, neverRespond, 10), HubVehicleSaveUnconfirmedError);
    await assert.rejects(createHubVehicle(fields, neverRespond, 10), HubVehicleSaveUnconfirmedError);
    assert.equal(posts, 1);
    assert.deepEqual(await reconcileHubVehicleSave(fields, async () => Response.json({ vehicles:[] })), []);
    await assert.rejects(createHubVehicle(fields, neverRespond, 10), HubVehicleSaveUnconfirmedError);
    assert.equal(posts, 1);
    allowReconciledHubVehicleRetry(fields);
    await createHubVehicle(fields, async () => { posts++; return Response.json({ vehicle:{ id:'confirmed', year:2020, make:'Cadillac', model:'XT6',currentMileage:1000 } }, { status:201 }); });
    assert.equal(posts, 2);
    assert.equal(stored.size, 0);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('confirmed POST must match the submitted exact build and supplied optional details', async () => {
  const entered = {year:'2019',make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE',vin:'1gkknxlsxlz100001',currentMileage:'12345',transmission:'manual'};
  const full = {id:'confirmed',...hubVehiclePayload(entered)};
  for (const mismatch of [{year:2020},{make:'Cadillac'},{model:'XT6'},{trim:'LT'},{trim:null},{trim:undefined},{vin:'1GKKNXLSXLZ100002'},{vin:null},{vin:undefined},{currentMileage:54321},{currentMileage:null},{currentMileage:undefined},{transmission:null},{transmission:'automatic'}]) {
    let posts=0;
    await assert.rejects(createHubVehicle(entered,async()=>{posts++;return Response.json({vehicle:{...full,...mismatch}},{status:201})}),HubVehicleSaveUnconfirmedError,JSON.stringify(mismatch));
    assert.equal(posts,1);
  }
  assert.deepEqual(await createHubVehicle(entered,async()=>Response.json({vehicle:full},{status:201})),full);
  const zero={...entered,currentMileage:'0'};
  await assert.rejects(createHubVehicle(zero,async()=>{throw Error('must not call') }),/greater than zero/);
  assert.throws(()=>hubVehiclePayload({...entered,transmission:''}),/transmission/);
});

test('mismatched success retains the uncertainty lock and never automatically retries', async () => {
  const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  const stored=new Map<string,string>();
  Object.defineProperty(globalThis,'window',{configurable:true,value:{sessionStorage:{setItem:(key:string,value:string)=>stored.set(key,value),getItem:(key:string)=>stored.get(key)??null,removeItem:(key:string)=>stored.delete(key)}}});
  try {
    const entered={...fields,year:'2019',make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE',transmission:'automatic'};
    let posts=0;
    const wrong:typeof fetch=async()=>{posts++;return Response.json({vehicle:{id:'different',year:2020,make:'Cadillac',model:'XT6',trim:'Sport'}},{status:201})};
    await assert.rejects(createHubVehicle(entered,wrong),HubVehicleSaveUnconfirmedError);
    await assert.rejects(createHubVehicle(entered,wrong),HubVehicleSaveUnconfirmedError);
    assert.equal(posts,1);assert.equal(stored.size,1);
    await reconcileHubVehicleSave(entered,async()=>Response.json({vehicles:[]}));
    await assert.rejects(createHubVehicle(entered,wrong),HubVehicleSaveUnconfirmedError);
    assert.equal(posts,1);
    allowReconciledHubVehicleRetry(entered);
    await createHubVehicle(entered,async()=>{posts++;return Response.json({vehicle:{id:'correct',...hubVehiclePayload(entered)}},{status:201})});
    assert.equal(posts,2);assert.equal(stored.size,0);
  } finally {if(originalWindow)Object.defineProperty(globalThis,'window',originalWindow);else Reflect.deleteProperty(globalThis,'window');}
});

test('narrow switcher read supplies candidates without requiring or proving optional POST details',async()=>{
  const entered={...fields,trim:'Sport',vin:'1GKKNXLSXLZ100001',currentMileage:'12345',reviewedEquipmentId:'xt6-2020-36l-awd-20-v1'};
  const candidate={id:'candidate',year:2020,make:'Cadillac',model:'XT6',trim:'Sport',nickname:null};
  assert.deepEqual(await reconcileHubVehicleSave(entered,async()=>Response.json({vehicles:[candidate]})),[candidate]);
});

test('reconciliation skips null/malformed rows and requires a nonblank candidate ID',async()=>{
  const candidate={id:'valid',year:2020,make:'Cadillac',model:'XT6',trim:null};
  const vehicles=[null,[],{},'bad', {...candidate,id:''},{...candidate,id:'   '},{...candidate,make:['Cadillac']},{...candidate,trim:{}},candidate];
  assert.deepEqual(await reconcileHubVehicleSave(fields,async()=>Response.json({vehicles})),[candidate]);
});
