// Runs before app-module imports. Unit fixtures cannot fall back to provider or
// production database configuration; all persistence dependencies are injected.
process.env.DATABASE_URL = 'postgresql://au7o_sandbox:synthetic-unusable-password@127.0.0.1:55439/au7o_signup_sandbox';
process.env.DIRECT_URL = process.env.DATABASE_URL;
for (const name of Object.keys(process.env)) {
  if (name.startsWith('STRIPE_') || name.startsWith('RESEND_')) delete process.env[name];
}
process.env.ACCOUNT_ENROLLMENT_ENABLED = 'false';
process.env.TWIN_READY_INVITATIONS_ENABLED = 'false';
globalThis.fetch = async () => { throw new Error('Network is disabled in reservation unit fixtures'); };
