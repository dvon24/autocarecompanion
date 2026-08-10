/* eslint-disable @typescript-eslint/no-require-imports */
const peugeot206Contract = require('./peugeot-206-adjudication-contract');
const peugeot207Contract = require('./peugeot-207-adjudication-contract');
const peugeot208Contract = require('./peugeot-208-adjudication-contract');
const peugeot308Contract = require('./peugeot-308-adjudication-contract');
const peugeot508Contract = require('./peugeot-508-adjudication-contract');
const peugeot2008Contract = require('./peugeot-2008-adjudication-contract');
const CONTRACTS = Object.freeze({ '206': peugeot206Contract, '207': peugeot207Contract, '208': peugeot208Contract, '308': peugeot308Contract, '508': peugeot508Contract, '2008': peugeot2008Contract });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unsupported Peugeot model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
