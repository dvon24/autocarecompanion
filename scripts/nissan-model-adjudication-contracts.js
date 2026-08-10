/* eslint-disable @typescript-eslint/no-require-imports */
const twoFortySxContract = require('./nissan-240sx-adjudication-contract');
const threeHundredZxContract = require('./nissan-300zx-adjudication-contract');

const CONTRACTS = Object.freeze({
  '240SX': twoFortySxContract,
  '300ZX': threeHundredZxContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Nissan model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
