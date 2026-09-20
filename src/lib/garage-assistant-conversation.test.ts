import assert from 'node:assert/strict';
import test from 'node:test';
import { createGarageAssistantToolBatchExecutor } from './garage-assistant-tool-batch';
import { NO_COMMITTED_GARAGE_ACTION_PREFIX } from './garage-assistant-maintenance';
import { runGarageAssistantConversation, GARAGE_ASSISTANT_MAX_PLANNING_ROUNDS } from './garage-assistant-conversation';

const call = (name: string, args: object = { vehicleId: 'v1' }) => ({
  id: `${name}_${'type' in args ? args.type : ''}`, type: 'function', function: { name, arguments: JSON.stringify(args) },
});
const response = (toolCalls?: ReturnType<typeof call>[], content: string | null = null) => ({
  choices: [{ message: { role: 'assistant', content, ...(toolCalls ? { tool_calls: toolCalls } : {}) } }],
});
const oil = call('log_maintenance', { vehicleId: 'v1', type: 'oil_change', mileage: 65000, date: '2026-09-05' });
const plugs = call('log_maintenance', { vehicleId: 'v1', type: 'spark_plugs', mileage: 65000, date: '2026-09-05' });
const mileage = call('update_mileage', { vehicleId: 'v1', mileage: 65000 });

function batchHarness(unchanged = false) {
  const executed: string[][] = [];
  const batch = createGarageAssistantToolBatchExecutor({
    prisma: {
      $transaction: async (callback: (tx: unknown) => Promise<unknown>, options: { isolationLevel: string }) => {
        assert.equal(options.isolationLevel, 'Serializable');
        executed.push([]);
        return callback({});
      },
    } as never,
    executeTool: async (name, args, userId) => {
      assert.equal(userId, 'owner');
      executed.at(-1)!.push(name);
      if (name === 'get_vehicle_info') return 'Vehicle mileage: 64000';
      if (name === 'update_mileage') return unchanged
        ? `${NO_COMMITTED_GARAGE_ACTION_PREFIX}Mileage is already 65,000 miles.`
        : 'Updated mileage to 65,000 miles.';
      return `Logged ${args.type} at 65,000 miles.`;
    },
  });
  return { executed, executeBatch: (calls: unknown) => batch(calls, 'owner') };
}

test('read -> complete multi-service write batch -> tools-free summary', async () => {
  const harness = batchHarness();
  const requests: boolean[] = [];
  const outputs = [response([call('get_vehicle_info')]), response([mileage, oil, plugs]), response(undefined, 'Logged oil and spark plugs.')];
  const result = await runGarageAssistantConversation({
    messages: [{ role: 'user', content: 'Oil and filter and spark plugs today at 65000 miles.' }],
    executeBatch: harness.executeBatch,
    complete: async (messages, allowTools) => {
      requests.push(allowTools);
      if (requests.length === 2) assert.ok(messages.some((message) => message.role === 'tool'));
      return outputs.shift();
    },
  });
  assert.deepEqual(requests, [true, true, false]);
  assert.deepEqual(harness.executed, [['get_vehicle_info'], ['update_mileage', 'log_maintenance', 'log_maintenance']]);
  assert.deepEqual(result.actions.map((action) => action.tool), ['update_mileage', 'log_maintenance', 'log_maintenance']);
});

for (const failure of ['unavailable', 'invalid-json', 'empty', 'unexpected-tools']) {
  test(`committed evidence survives ${failure} summary without write replay`, async () => {
    const harness = batchHarness();
    let requests = 0;
    const result = await runGarageAssistantConversation({
      messages: [], executeBatch: harness.executeBatch,
      complete: async (_messages, allowTools) => {
        requests += 1;
        if (requests === 1) return response([oil]);
        assert.equal(allowTools, false);
        if (failure === 'unavailable') throw new Error('503');
        if (failure === 'invalid-json') throw new SyntaxError('Invalid JSON');
        if (failure === 'unexpected-tools') return response([oil]);
        return { choices: [] };
      },
    });
    assert.equal(requests, 2);
    assert.deepEqual(harness.executed, [['log_maintenance']]);
    assert.match(result.message, /Logged oil_change/);
    assert.equal(result.actions.length, 1);
  });
}

test('read-only round then provider failure never reports a saved change', async () => {
  const harness = batchHarness();
  let requests = 0;
  const result = await runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch,
    complete: async () => {
      if (++requests === 1) return response([call('get_vehicle_info')]);
      throw new Error('Unavailable');
    },
  });
  assert.deepEqual(result.actions, []);
  assert.match(result.message, /No garage changes were saved/);
  assert.match(result.message, /Vehicle mileage/);
});

test('unchanged mileage produces no committed action and cannot reopen writes', async () => {
  const harness = batchHarness(true);
  let requests = 0;
  const result = await runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch,
    complete: async (_messages, allowTools) => {
      if (++requests === 1) return response([mileage]);
      assert.equal(allowTools, false);
      throw new Error('Unavailable');
    },
  });
  assert.equal(requests, 2);
  assert.deepEqual(result.actions, []);
  assert.match(result.message, /No garage changes were saved/);
  assert.match(result.message, /already 65,000/);
});

test('mixed read, unchanged mileage and maintenance batch confirms only the maintenance commit', async () => {
  const harness = batchHarness(true);
  let requests = 0;
  const result = await runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch,
    complete: async () => {
      if (++requests === 1) return response([call('get_vehicle_info'), mileage, oil]);
      throw new Error('Summary unavailable');
    },
  });
  assert.deepEqual(result.actions, [{ tool: 'log_maintenance', result: 'Logged oil_change at 65,000 miles.' }]);
  assert.equal(result.message, 'Logged oil_change at 65,000 miles.');
  assert.equal(harness.executed.length, 1);
});

test('repeated reads stop at maximum planning rounds', async () => {
  const harness = batchHarness();
  let requests = 0;
  const result = await runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch,
    complete: async () => { requests += 1; return response([call('get_vehicle_info')]); },
  });
  assert.equal(requests, GARAGE_ASSISTANT_MAX_PLANNING_ROUNDS);
  assert.equal(harness.executed.length, GARAGE_ASSISTANT_MAX_PLANNING_ROUNDS);
  assert.deepEqual(result.actions, []);
  assert.match(result.message, /No garage changes were saved/);
});

test('provider timeout shares one deadline across planning and summary', async () => {
  const harness = batchHarness();
  let elapsed = 0;
  const timeouts: number[] = [];
  const result = await runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch, now: () => elapsed,
    complete: async (_messages, _allowTools, timeoutMs) => {
      timeouts.push(timeoutMs);
      elapsed += 23000;
      return timeouts.length === 1 ? response([call('get_vehicle_info')]) : response([oil]);
    },
  });
  assert.deepEqual(timeouts, [25000, 22000]);
  assert.equal(result.actions.length, 1);
  assert.match(result.message, /Logged oil_change/);
});

test('batch validation failure aborts without retrying or claiming success', async () => {
  const harness = batchHarness();
  await assert.rejects(runGarageAssistantConversation({
    messages: [], executeBatch: harness.executeBatch,
    complete: async () => response([mileage, call('log_maintenance', { vehicleId: 'v1' })]),
  }), /Invalid assistant tool arguments/);
  assert.deepEqual(harness.executed, []);
});
