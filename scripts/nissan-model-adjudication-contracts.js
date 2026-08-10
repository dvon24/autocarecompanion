/* eslint-disable @typescript-eslint/no-require-imports */
const twoFortySxContract = require('./nissan-240sx-adjudication-contract');

const CONTRACTS = Object.freeze({
  '240SX': twoFortySxContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Nissan model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
