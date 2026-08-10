/* eslint-disable @typescript-eslint/no-require-imports */
const aztek = require('./pontiac-aztek-adjudication-contract');
const bonneville = require('./pontiac-bonneville-adjudication-contract');
const firebird = require('./pontiac-firebird-adjudication-contract');
const CONTRACTS = Object.freeze({ Aztek: aztek, Bonneville: bonneville, Firebird: firebird });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unknown Pontiac model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
