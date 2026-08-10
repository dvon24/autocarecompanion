/* eslint-disable @typescript-eslint/no-require-imports */
const contracts = Object.freeze({
  '1500 Classic': require('./ram-1500-classic-adjudication-contract'),
  '2500': require('./ram-2500-adjudication-contract'),
  '3500': require('./ram-3500-adjudication-contract'),
  ProMaster: require('./ram-promaster-adjudication-contract'),
});

function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unknown RAM model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS: contracts, getContract };
