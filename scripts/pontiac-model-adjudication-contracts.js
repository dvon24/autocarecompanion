/* eslint-disable @typescript-eslint/no-require-imports */
const aztek = require('./pontiac-aztek-adjudication-contract');
const CONTRACTS = Object.freeze({ Aztek: aztek });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unknown Pontiac model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
