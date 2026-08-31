import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTwinAssistantVehicle,
  guardUncommittedMutationMessage,
  isTwinMutationIntent,
  isMutationFollowUpMessage,
  normalizeTwinNodeContext,
  sendTwinAssistantMessage,
  streamTwinAssistant,
} from './twin-assistant-client';

test('builds exact demo and owner vehicle context including transmission', () => {
  assert.deepEqual(buildTwinAssistantVehicle({
    vehicle:{ year:2015, make:'Dodge', model:'Challenger', trim:'SRT 392' },
    catalogIdentity:{ year:2015, make:'Dodge', model:'Challenger', engine:'6.4L V8 HEMI' },
    transmission:'manual',
    mileage:65000,
  }), {
    year:2015,
    make:'Dodge',
    model:'Challenger',
    trim:'SRT 392',
    engine:'6.4L V8 HEMI',
    transmission:'manual',
    drivetrain:undefined,
    currentMileage:65000,
  });
});

test('routes only clear owner write intent to authenticated garage tools', async () => {
  assert.equal(isTwinMutationIntent('Mileage is 156000 and I changed the oil today'), true);
  assert.equal(isTwinMutationIntent('Log my rear differential service at 65,000 miles'), true);
  assert.equal(isTwinMutationIntent('When should I change the oil?'), false);
  assert.equal(isTwinMutationIntent('What does the odometer measure?'), false);
  assert.equal(isTwinMutationIntent('Log this at 65,000 miles'), false);
  assert.equal(isTwinMutationIntent('Log this at 65,000 miles', true), true);

  let endpoint = '';
  let sentBody: Record<string, unknown> | null = null;
  const fetcher: typeof fetch = async (input, init) => {
    endpoint = String(input);
    sentBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      message:'Updated mileage and logged the oil change.',
      actions:[
        { tool:'update_mileage', result:'Updated mileage to 156,000 miles.' },
        { tool:'log_maintenance', result:'Logged Oil Change at 156,000 miles.' },
        { tool:'get_vehicle_info', result:'read-only result' },
      ],
    }), { status:200, headers:{ 'Content-Type':'application/json' } });
  };
  const result = await sendTwinAssistantMessage({
    ownerVehicleId:'vehicle-owner-1',
    vehicle:{ year:2015, make:'Dodge', model:'Challenger', trim:'SRT 392' },
    messages:[
      { role:'assistant', content:'What changed?' },
      { role:'user', content:'Mileage is 156000 and I changed the oil today' },
    ],
    selectedNode:{ label:'Engine oil', maintenanceType:'oil_change' },
    fetcher,
  });
  assert.equal(endpoint, '/api/garage/assistant');
  assert.equal(result.route, 'mutation');
  assert.deepEqual(result.committedActions.map((action) => action.tool), ['update_mileage', 'log_maintenance']);
  const body = sentBody as unknown as { message:string; conversationHistory:unknown[]; vehicleContext:{vehicleId:string; selectedMaintenanceType:string} };
  assert.equal(body.message, 'Mileage is 156000 and I changed the oil today');
  assert.equal(body.conversationHistory.length, 1);
  assert.equal(body.vehicleContext.vehicleId, 'vehicle-owner-1');
  assert.equal(body.vehicleContext.selectedMaintenanceType, 'oil_change');
  assert.equal(result.awaitingMutationDetails, false);
  assert.match(result.text, /Updated mileage/);
});

test('does not trust a mutation success sentence without committed write actions', async () => {
  assert.match(guardUncommittedMutationMessage('I updated your mileage.', []), /haven't changed/i);
  assert.match(guardUncommittedMutationMessage('All set—your garage now shows 65,000 miles.', []), /haven't changed/i);
  assert.match(guardUncommittedMutationMessage('Your oil change is now in your service history.', []), /haven't changed/i);
  assert.equal(
    guardUncommittedMutationMessage('What mileage was the service completed at?', []),
    'What mileage was the service completed at?',
  );
  let endpoint = '';
  const fetcher: typeof fetch = async (input) => {
    endpoint = String(input);
    return new Response(JSON.stringify({ message:'I logged your oil service.', actions:null }), {
      status:200,
      headers:{ 'Content-Type':'application/json' },
    });
  };
  const result = await sendTwinAssistantMessage({
    ownerVehicleId:'vehicle-owner-1',
    vehicle:{ year:2015, make:'Dodge', model:'Challenger' },
    messages:[{ role:'user', content:'Log my oil change' }],
    fetcher,
  });
  assert.equal(endpoint, '/api/garage/assistant');
  assert.equal(result.committedActions.length, 0);
  assert.match(result.text, /haven't changed/i);
  assert.equal(result.awaitingMutationDetails, true);
  assert.equal(isMutationFollowUpMessage('What mileage was it completed at?'), true);
});

test('keeps short answers in an authenticated mutation follow-up', async () => {
  let endpoint = '';
  const fetcher: typeof fetch = async (input) => {
    endpoint = String(input);
    return new Response(JSON.stringify({
      message:'Logged.',
      actions:[{ tool:'log_maintenance', result:'Logged Oil Change at 65,000 miles.' }],
    }), { status:200, headers:{ 'Content-Type':'application/json' } });
  };
  const result = await sendTwinAssistantMessage({
    ownerVehicleId:'vehicle-owner-1',
    continueMutation:true,
    vehicle:{ year:2015, make:'Dodge', model:'Challenger' },
    messages:[
      { role:'user', content:'Log this service' },
      { role:'assistant', content:'What mileage was it completed at?' },
      { role:'user', content:'65000' },
    ],
    selectedNode:{ label:'Engine oil', maintenanceType:'oil_change' },
    fetcher,
  });
  assert.equal(endpoint, '/api/garage/assistant');
  assert.equal(result.route, 'mutation');
  assert.equal(result.awaitingMutationDetails, false);
  assert.deepEqual(result.committedActions.map((action) => action.tool), ['log_maintenance']);
});

test('normalizes reviewed selected-node evidence without copying nested instructions', () => {
  assert.deepEqual(normalizeTwinNodeContext({
    id:'rearDiffFluid',
    label:'Rear differential fluid',
    spec:'75W-85 GL-5',
    where:'Rear axle fill plug',
    maintenanceType:'differential_fluid',
    knownIssue:{ title:'Differential whine' },
  }), {
    id:'rearDiffFluid',
    label:'Rear differential fluid',
    where:'Rear axle fill plug',
    spec:'75W-85 GL-5',
    life:undefined,
    brand:undefined,
    partNo:undefined,
    price:undefined,
    dueNote:undefined,
    sourceLabel:undefined,
    knownIssueTitle:'Differential whine',
    maintenanceType:'differential_fluid',
  });
});

test('streams the shared mechanic response and sends fitment plus selected component', async () => {
  let sentBody: Record<string, unknown> | null = null;
  const encoder = new TextEncoder();
  const fetcher: typeof fetch = async (_input, init) => {
    sentBody = JSON.parse(String(init?.body));
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"session","sessionId":"session-1"}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"token","text":"Use the fill plug first. "}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"token","text":"Modifier counts toward capacity."}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
        controller.close();
      },
    }), { status:200, headers:{ 'Content-Type':'text/event-stream' } });
  };
  const tokens: string[] = [];
  const sessions: string[] = [];
  const vehicle = { year:2015, make:'Dodge', model:'Challenger', trim:'SRT 392', transmission:'manual' };
  const selectedNode = { label:'Rear differential fluid', spec:'75W-85 GL-5' };
  const result = await streamTwinAssistant({
    vehicle,
    messages:[{ role:'user', content:'How much modifier do I add?' }],
    selectedNode,
    fetcher,
    onToken:(token) => tokens.push(token),
    onSession:(id) => sessions.push(id),
  });

  assert.equal(result.text, 'Use the fill plug first. Modifier counts toward capacity.');
  assert.equal(result.sessionId, 'session-1');
  assert.deepEqual(tokens, ['Use the fill plug first. ', 'Modifier counts toward capacity.']);
  assert.deepEqual(sessions, ['session-1']);
  const requestBody = sentBody as unknown as { vehicle: unknown; selectedNode: unknown };
  assert.deepEqual(requestBody.vehicle, vehicle);
  assert.deepEqual(requestBody.selectedNode, selectedNode);
});

test('surfaces a retryable server error instead of falling back to tree-only copy', async () => {
  const fetcher: typeof fetch = async () => new Response(
    JSON.stringify({ message:'Mechanic is temporarily unavailable.' }),
    { status:503, headers:{ 'Content-Type':'application/json' } },
  );
  await assert.rejects(
    streamTwinAssistant({
      vehicle:{ year:2019, make:'Chevrolet', model:'Camaro', trim:'ZL1 1LE' },
      messages:[{ role:'user', content:'Where is the differential fill plug?' }],
      fetcher,
    }),
    /temporarily unavailable/,
  );
});
