import assert from 'node:assert/strict';
import test from 'node:test';
import {
  exactProductResultsFromAnthropic,
  knownIssuePartSearchPrompt,
} from './discover-known-issue-part-search-results';

test('retains exact product results and removes categories, year pages and duplicates', () => {
  const results = exactProductResultsFromAnthropic([{ type: 'web_search_tool_result', content: [
    {
      type: 'web_search_result', title: 'Genuine Acura mount 50810-SK7-A01',
      url: 'https://www.acurapartswarehouse.com/oem/acura~mount~engine~50810-sk7-a01.html',
    },
    {
      type: 'web_search_result', title: 'Duplicate',
      url: 'https://www.acurapartswarehouse.com/oem/acura~mount~engine~50810-sk7-a01.html?campaign=duplicate',
    },
    {
      type: 'web_search_result', title: '2000 Integra parts',
      url: 'https://www.acurapartswarehouse.com/oem/acura~integra~2000.html',
    },
    {
      type: 'web_search_result', title: 'Search',
      url: 'https://www.ebay.com/sch/i.html?_nkw=Acura+mount',
    },
  ] }]);
  assert.deepEqual(results, [{
    title: 'Genuine Acura mount 50810-SK7-A01',
    url: 'https://www.acurapartswarehouse.com/oem/acura~mount~engine~50810-sk7-a01.html',
    host: 'acurapartswarehouse.com',
  }]);
});

test('prompt preserves frozen query, component, issue and repair-role evidence', () => {
  const prompt = knownIssuePartSearchPrompt({
    workItemId: 'work-1', issueId: 'issue-1', lane: 'repair-part',
    searchDecision: 'find-primary', searchReasonCode: 'catalog-gap-needs-primary', catalogVerdict: 'unmapped',
    searchEligibility: 'eligible',
    component: 'mounts', searchComponent: 'motor mounts',
    queries: {
      devon: '1990-2001 Acura Integra — RS, LS motor mounts us',
      precision: '1990-2001 Acura Integra — RS, LS 1.7L B17A1 motor mounts us',
    },
    title: 'Motor mounts crack', repairRoleEvidence: 'Replace failed mounts.', diagnosisDependent: false,
    articleScope: { make: 'Acura', model: 'Integra', years: [1990, 2001], trims: [], engines: [], drivetrains: [], transmissions: [] },
  }, 'devon');
  assert.match(prompt, /1990-2001 Acura Integra — RS, LS motor mounts us/);
  assert.match(prompt, /Motor mounts crack/);
  assert.match(prompt, /Replace failed mounts/);
  assert.match(prompt, /Do not claim fitment/);
});
