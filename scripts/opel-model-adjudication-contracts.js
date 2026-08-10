/* eslint-disable @typescript-eslint/no-require-imports */
const astraContract = require('./opel-astra-adjudication-contract');

const CONTRACTS = Object.freeze({ Astra: astraContract });

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Opel model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
