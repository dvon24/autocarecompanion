/* eslint-disable @typescript-eslint/no-require-imports */
const contracts = Object.freeze({
  Captur: () => require('./renault-captur-adjudication-contract'),
  Clio: () => require('./renault-clio-adjudication-contract'),
  Kadjar: () => require('./renault-kadjar-adjudication-contract'),
  Koleos: () => require('./renault-koleos-adjudication-contract'),
  Kwid: () => require('./renault-kwid-adjudication-contract'),
  Megane: () => require('./renault-megane-adjudication-contract'),
});

function getContract(model) {
  const load = contracts[model];
  if (!load) throw new Error(`Unsupported Renault model: ${model}`);
  return load();
}

module.exports = { getContract, supportedModels: Object.freeze(Object.keys(contracts)) };
