import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_HUB_FALLBACK_MODEL,
  DEFAULT_HUB_MODEL,
  getHubModelConfig,
  isUsableHubReply,
  requestHubModelWithTransportFallback,
  safeHubChatErrorMessage,
  shouldRetryHubModel,
} from './hub-chat-model';

test('uses an environment-configurable primary and known-working fallback', () => {
  assert.deepEqual(getHubModelConfig({}), {
    primary: DEFAULT_HUB_MODEL,
    fallback: DEFAULT_HUB_FALLBACK_MODEL,
  });
  assert.deepEqual(
    getHubModelConfig({
      OPENAI_HUB_MODEL: ' primary-model ',
      OPENAI_HUB_FALLBACK_MODEL: ' fallback-model ',
    }),
    { primary: 'primary-model', fallback: 'fallback-model' },
  );
});

test('does not retry the same model twice', () => {
  assert.deepEqual(
    getHubModelConfig({
      OPENAI_HUB_MODEL: 'gpt-5.5',
      OPENAI_HUB_FALLBACK_MODEL: 'gpt-5.5',
    }),
    { primary: 'gpt-5.5', fallback: null },
  );
});

test('retries permission and missing-model responses only', () => {
  for (const status of [401, 403, 404, 410]) {
    assert.equal(shouldRetryHubModel(status), true);
  }
  assert.equal(shouldRetryHubModel(400, 'The requested model is unsupported'), true);
  assert.equal(shouldRetryHubModel(400, 'messages is required'), false);
  assert.equal(shouldRetryHubModel(429, 'rate limited'), false);
  assert.equal(shouldRetryHubModel(500, 'server error'), false);
});

test('user-facing errors never expose provider details', () => {
  for (const message of [
    safeHubChatErrorMessage(false),
    safeHubChatErrorMessage(true),
  ]) {
    assert.doesNotMatch(
      message,
      /openai|api|401|403|permission|gpt-|bearer|insufficient/i,
    );
  }
  assert.match(safeHubChatErrorMessage(false), /not counted/i);
});

test('a thrown primary transport request gets one fallback attempt', async () => {
  const calls: string[] = [];
  const result = await requestHubModelWithTransportFallback(
    { primary: 'primary', fallback: 'fallback' },
    async (model) => {
      calls.push(model);
      if (model === 'primary') throw new Error('timeout');
      return 'ok';
    },
  );

  assert.deepEqual(calls, ['primary', 'fallback']);
  assert.deepEqual(result, { model: 'fallback', response: 'ok' });
});

test('only completed non-empty streams count as usable replies', () => {
  assert.equal(isUsableHubReply('complete answer', true), true);
  assert.equal(isUsableHubReply('partial answer', false), false);
  assert.equal(isUsableHubReply('   ', true), false);
});
