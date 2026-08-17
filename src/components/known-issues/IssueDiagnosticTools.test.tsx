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

test('renders OBD1 guidance without an AD310 purchase link for a 1994 Integra', () => {
  const html = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Pull DTCs before replacement."
      dtcCodes={['P0300']}
      make="Acura"
      years={[1994]}
    />,
  );
  assert.match(html, /vehicle-specific OBD1 code-retrieval procedure/);
  assert.doesNotMatch(html, /ANCEL AD310/);
  assert.doesNotMatch(html, />View</);
});

test('renders OBD1 guidance when the pre-1996 article calls for retrieval without naming a code', () => {
  const html = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Pull DTCs before replacement."
      dtcCodes={[]}
      make="Acura"
      years={[1994]}
    />,
  );
  assert.match(html, /vehicle-specific OBD1 code-retrieval procedure/);
  assert.match(html, /How to retrieve the code/);
  assert.match(html, /article calls for code retrieval/);
  assert.doesNotMatch(html, /issue names stored codes/);
  assert.doesNotMatch(html, /ANCEL AD310/);
});

test('renders explicit VCDS guidance without a named DTC only for supported combustion context', () => {
  const supported = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Scan with VCDS before repair."
      dtcCodes={[]}
      make="Audi"
      years={[2016]}
      engines={['2.0T']}
    />,
  );
  assert.match(supported, /Ross-Tech VCDS/);
  assert.match(supported, />View</);

  const hybrid = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Scan with VCDS before repair."
      dtcCodes={[]}
      make="Audi"
      years={[2022]}
      engines={['2.0L PHEV']}
    />,
  );
  assert.equal(hybrid, '');
});

test('renders mixed-era guidance without universal scanner commerce when no year is selected', () => {
  const html = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Pull DTCs before replacement."
      dtcCodes={['P0300']}
      make="Acura"
      years={[1994, 1995, 1996, 1997, 1998, 1999]}
    />,
  );
  assert.match(html, /spans pre-1996 OBD1 and 1996\+ OBD-II vehicles/);
  assert.doesNotMatch(html, /ANCEL AD310/);
  assert.doesNotMatch(html, />View</);
});

test('renders capability guidance without commerce for the 1996 Integra manufacturer codes', () => {
  const html = renderToStaticMarkup(
    <IssueDiagnosticTools
      solution="Pull DTCs first — codes P1381 and Code 22 commonly originate inside the distributor."
      dtcCodes={['P1361', 'P1362', 'P1381', 'P1382']}
      make="Acura"
      years={[1996]}
    />,
  );
  assert.match(html, /manufacturer-specific/);
  assert.doesNotMatch(html, /ANCEL AD310/);
  assert.doesNotMatch(html, />View</);
});
