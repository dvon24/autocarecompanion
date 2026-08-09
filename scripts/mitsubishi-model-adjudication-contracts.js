/* eslint-disable @typescript-eslint/no-require-imports */
const threeThousandGtContract = require('./mitsubishi-3000gt-adjudication-contract');

const CONTRACTS = Object.freeze({
  '3000GT': threeThousandGtContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unknown Mitsubishi model contract: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
