/* eslint-disable @typescript-eslint/no-require-imports */
const twoFortySxContract = require('./nissan-240sx-adjudication-contract');
const threeHundredZxContract = require('./nissan-300zx-adjudication-contract');
const threeFiftyZContract = require('./nissan-350z-adjudication-contract');
const threeSeventyZContract = require('./nissan-370z-adjudication-contract');
const altimaContract = require('./nissan-altima-adjudication-contract');
const ariyaContract = require('./nissan-ariya-adjudication-contract');
const armadaContract = require('./nissan-armada-adjudication-contract');
const cubeContract = require('./nissan-cube-adjudication-contract');
const frontierContract = require('./nissan-frontier-adjudication-contract');
const gtrContract = require('./nissan-gtr-adjudication-contract');

const CONTRACTS = Object.freeze({
  '240SX': twoFortySxContract,
  '300ZX': threeHundredZxContract,
  '350Z': threeFiftyZContract,
  '370Z': threeSeventyZContract,
  Altima: altimaContract,
  Ariya: ariyaContract,
  Armada: armadaContract,
  Cube: cubeContract,
  Frontier: frontierContract,
  'GT-R': gtrContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Nissan model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
