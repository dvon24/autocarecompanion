/* eslint-disable @typescript-eslint/no-require-imports */
const peugeot206Contract = require('./peugeot-206-adjudication-contract');
const peugeot207Contract = require('./peugeot-207-adjudication-contract');
const CONTRACTS = Object.freeze({ '206': peugeot206Contract, '207': peugeot207Contract });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unsupported Peugeot model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
