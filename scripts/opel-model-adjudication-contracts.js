/* eslint-disable @typescript-eslint/no-require-imports */
const astraContract = require('./opel-astra-adjudication-contract');
const comboContract = require('./opel-combo-adjudication-contract');
const corsaContract = require('./opel-corsa-adjudication-contract');
const crosslandContract = require('./opel-crossland-adjudication-contract');
const grandlandContract = require('./opel-grandland-adjudication-contract');

const CONTRACTS = Object.freeze({ Astra: astraContract, Combo: comboContract, Corsa: corsaContract, Crossland: crosslandContract, Grandland: grandlandContract });

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Opel model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
