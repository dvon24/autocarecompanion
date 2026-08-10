/* eslint-disable @typescript-eslint/no-require-imports */
const astraContract = require('./opel-astra-adjudication-contract');
const comboContract = require('./opel-combo-adjudication-contract');
const corsaContract = require('./opel-corsa-adjudication-contract');
const crosslandContract = require('./opel-crossland-adjudication-contract');
const grandlandContract = require('./opel-grandland-adjudication-contract');
const insigniaContract = require('./opel-insignia-adjudication-contract');
const mokkaContract = require('./opel-mokka-adjudication-contract');
const vivaroContract = require('./opel-vivaro-adjudication-contract');
const zafiraContract = require('./opel-zafira-adjudication-contract');

const CONTRACTS = Object.freeze({ Astra: astraContract, Combo: comboContract, Corsa: corsaContract, Crossland: crosslandContract, Grandland: grandlandContract, Insignia: insigniaContract, Mokka: mokkaContract, Vivaro: vivaroContract, Zafira: zafiraContract });

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Opel model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
