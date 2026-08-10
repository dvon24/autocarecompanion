/* eslint-disable @typescript-eslint/no-require-imports */
const aztek = require('./pontiac-aztek-adjudication-contract');
const bonneville = require('./pontiac-bonneville-adjudication-contract');
const firebird = require('./pontiac-firebird-adjudication-contract');
const g6 = require('./pontiac-g6-adjudication-contract');
const g8 = require('./pontiac-g8-adjudication-contract');
const grandAm = require('./pontiac-grand-am-adjudication-contract');
const grandPrix = require('./pontiac-grand-prix-adjudication-contract');
const gto = require('./pontiac-gto-adjudication-contract');
const CONTRACTS = Object.freeze({ Aztek: aztek, Bonneville: bonneville, Firebird: firebird, G6: g6, G8: g8, 'Grand Am': grandAm, 'Grand Prix': grandPrix, GTO: gto });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unknown Pontiac model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
