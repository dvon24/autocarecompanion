import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { IssueDiagnosticTools, issueHasDiagnosticToolInput } from './IssueDiagnosticTools';

test('renders a scanner for a DTC-only issue whose solution is empty', () => {
  assert.equal(issueHasDiagnosticToolInput('', ['P0128']), true);
  const html = renderToStaticMarkup(
    <IssueDiagnosticTools solution="" dtcCodes={['P0128']} engines={[]} />,
  );
  assert.match(html, /What reads this code/);
  assert.match(html, /ANCEL AD310/);
});

test('renders nothing when neither a solution procedure nor a DTC requires a tool', () => {
  assert.equal(issueHasDiagnosticToolInput('', []), false);
  assert.equal(renderToStaticMarkup(<IssueDiagnosticTools solution="" dtcCodes={[]} />), '');
});
