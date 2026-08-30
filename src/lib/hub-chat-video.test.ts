import assert from 'node:assert/strict';
import test from 'node:test';
import { buildYouTubeSearchMarkdown, partialGroundingMarkerHold, VIDEO_MARK_OPEN } from './hub-chat-video';

test('builds an exact-vehicle YouTube search without trusting model URLs', () => {
  const markdown = buildYouTubeSearchMarkdown(
    'rear differential fill plug https://bad.example/video',
    { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', engine: '6.4L V8', transmission: 'manual' },
  );
  assert.match(markdown, /^\[Watch vehicle-specific how-to videos on YouTube\]\(https:\/\/www\.youtube\.com\/results\?search_query=/);
  assert.match(decodeURIComponent(markdown), /2015 Dodge Challenger SRT 392 6.4L V8 manual rear differential fill plug how to/);
  assert.doesNotMatch(markdown, /bad\.example/);
});

test('holds partial part and video marker openers across stream chunks', () => {
  assert.equal(partialGroundingMarkerHold('answer [[VID', ['[[PART:', VIDEO_MARK_OPEN]), 5);
  assert.equal(partialGroundingMarkerHold('answer [[PAR', ['[[PART:', VIDEO_MARK_OPEN]), 5);
  assert.equal(partialGroundingMarkerHold('ordinary answer', ['[[PART:', VIDEO_MARK_OPEN]), 0);
});
