/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.jsx']);

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [absolute] : [];
  });
}

test('public source exposes no signup route or signup CTA', () => {
  const files = sourceFiles(path.join(ROOT, 'src'));
  const forbidden = [
    '/auth/signup',
    'signupHref(',
    'Create free account',
    'Create account',
    'Join free',
    'Sign up free',
    'Get Started Free',
    'Already have an account',
    'creating a free account',
    'Your free account includes',
    'accounts work today',
    'Start free.',
    'm-signup-cta',
    'isSignupGate',
  ];

  const findings = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      if (source.includes(pattern)) {
        findings.push(`${path.relative(ROOT, file)} contains ${JSON.stringify(pattern)}`);
      }
    }
  }
  assert.deepEqual(findings, []);
});

test('public components expose no existing-user signin destination', () => {
  const files = sourceFiles(path.join(ROOT, 'src', 'components'));
  const findings = files
    .filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return source.includes('/auth/signin') || source.includes('signinHref(');
    })
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(findings, []);
});

test('auth configuration enforces the owner predicate for providers and JWTs', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src', 'lib', 'auth.ts'), 'utf8');
  assert.match(source, /async signIn\(\{ user \}\)[\s\S]*isAccountAccessEmail\(user\.email\)/);
  assert.match(source, /async jwt\([\s\S]*if \(!isAccountAccessEmail\(user\?\.email \?\? token\.email\)\) return null/);

  const checkoutSigninSource = fs.readFileSync(
    path.join(ROOT, 'src', 'app', 'api', 'auth', 'checkout-signin', 'route.ts'),
    'utf8',
  );
  assert.match(checkoutSigninSource, /status: 410/);
  assert.doesNotMatch(checkoutSigninSource, /getStripe|prisma|encode|cookies/);

  const createCheckoutSource = fs.readFileSync(
    path.join(ROOT, 'src', 'app', 'api', 'stripe', 'create-checkout', 'route.ts'),
    'utf8',
  );
  assert.match(
    createCheckoutSource,
    /if \(!session\?\.user\?\.id \|\| !isAccountAccessEmail\(session\.user\.email\)\)/,
  );
  assert.ok(
    createCheckoutSource.indexOf('isAccountAccessEmail(session.user.email)')
      < createCheckoutSource.indexOf('request.json()'),
  );
});

test('known-issue alert capture remains account-free', () => {
  const source = fs.readFileSync(
    path.join(ROOT, 'src', 'components', 'known-issues', 'KnownIssueAlertSignup.tsx'),
    'utf8',
  );
  assert.match(source, /fetch\('\/api\/interest'/);
  assert.match(source, /Free, no account needed/);
});

test('client components do not import the private owner allowlist', () => {
  const findings = sourceFiles(path.join(ROOT, 'src', 'components'))
    .filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return source.startsWith("'use client';") && source.includes("@/lib/founder");
    })
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(findings, []);
});
