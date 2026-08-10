/* eslint-disable @typescript-eslint/no-require-imports */
const polestar1Contract = require('./polestar-1-adjudication-contract');
const CONTRACTS = Object.freeze({ 'Polestar 1': polestar1Contract });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unsupported Polestar model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
