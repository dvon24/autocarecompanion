import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildTwinAssistantVehicle,
  normalizeTwinNodeContext,
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

test('normalizes reviewed selected-node evidence without copying nested instructions', () => {
  assert.deepEqual(normalizeTwinNodeContext({
    id:'rearDiffFluid',
    label:'Rear differential fluid',
    spec:'75W-85 GL-5',
    where:'Rear axle fill plug',
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
