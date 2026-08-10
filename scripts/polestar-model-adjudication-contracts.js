/* eslint-disable @typescript-eslint/no-require-imports */
const polestar1Contract = require('./polestar-1-adjudication-contract');
const polestar2Contract = require('./polestar-2-adjudication-contract');
const polestar3Contract = require('./polestar-3-adjudication-contract');
const polestar4Contract = require('./polestar-4-adjudication-contract');
const CONTRACTS = Object.freeze({ 'Polestar 1': polestar1Contract, 'Polestar 2': polestar2Contract, 'Polestar 3': polestar3Contract, 'Polestar 4': polestar4Contract });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unsupported Polestar model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
