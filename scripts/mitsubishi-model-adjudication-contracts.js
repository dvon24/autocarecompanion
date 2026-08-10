/* eslint-disable @typescript-eslint/no-require-imports */
const threeThousandGtContract = require('./mitsubishi-3000gt-adjudication-contract');
const eclipseContract = require('./mitsubishi-eclipse-adjudication-contract');
const eclipseCrossContract = require('./mitsubishi-eclipse-cross-adjudication-contract');
const endeavorContract = require('./mitsubishi-endeavor-adjudication-contract');
const galantContract = require('./mitsubishi-galant-adjudication-contract');
const lancerContract = require('./mitsubishi-lancer-adjudication-contract');

const CONTRACTS = Object.freeze({
  '3000GT': threeThousandGtContract,
  Eclipse: eclipseContract,
  'Eclipse Cross': eclipseCrossContract,
  Endeavor: endeavorContract,
  Galant: galantContract,
  Lancer: lancerContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unknown Mitsubishi model contract: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
