/* eslint-disable @typescript-eslint/no-require-imports */
const boxster718 = require('./porsche-718-boxster-adjudication-contract');
const cayman718 = require('./porsche-718-cayman-adjudication-contract');
const porsche911 = require('./porsche-911-adjudication-contract');
const CONTRACTS = Object.freeze({ '718 Boxster': boxster718, '718 Cayman': cayman718, '911': porsche911 });
function getContract(model) { const contract = CONTRACTS[model]; if (!contract) throw new Error(`Unknown Porsche model: ${model}`); return contract; }
module.exports = { CONTRACTS, getContract };
