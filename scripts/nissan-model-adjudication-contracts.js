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
const hardbodyContract = require('./nissan-hardbody-adjudication-contract');
const jukeContract = require('./nissan-juke-adjudication-contract');
const kicksContract = require('./nissan-kicks-adjudication-contract');
const leafContract = require('./nissan-leaf-adjudication-contract');
const maximaContract = require('./nissan-maxima-adjudication-contract');
const muranoContract = require('./nissan-murano-adjudication-contract');
const nvContract = require('./nissan-nv-adjudication-contract');
const nv200Contract = require('./nissan-nv200-adjudication-contract');
const pathfinderContract = require('./nissan-pathfinder-adjudication-contract');
const questContract = require('./nissan-quest-adjudication-contract');
const rogueContract = require('./nissan-rogue-adjudication-contract');
const rogueSportContract = require('./nissan-rogue-sport-adjudication-contract');
const sentraContract = require('./nissan-sentra-adjudication-contract');
const skylineContract = require('./nissan-skyline-adjudication-contract');
const stanzaContract = require('./nissan-stanza-adjudication-contract');
const titanContract = require('./nissan-titan-adjudication-contract');
const versaContract = require('./nissan-versa-adjudication-contract');
const xterraContract = require('./nissan-xterra-adjudication-contract');
const zContract = require('./nissan-z-adjudication-contract');

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
  Hardbody: hardbodyContract,
  Juke: jukeContract,
  Kicks: kicksContract,
  Leaf: leafContract,
  Maxima: maximaContract,
  Murano: muranoContract,
  NV: nvContract,
  NV200: nv200Contract,
  Pathfinder: pathfinderContract,
  Quest: questContract,
  Rogue: rogueContract,
  'Rogue Sport': rogueSportContract,
  Sentra: sentraContract,
  Skyline: skylineContract,
  Stanza: stanzaContract,
  Titan: titanContract,
  Versa: versaContract,
  Xterra: xterraContract,
  Z: zContract,
});

function getContract(model) {
  const contract = CONTRACTS[model];
  if (!contract) throw new Error(`Unsupported Nissan model: ${model}`);
  return contract;
}

module.exports = { CONTRACTS, getContract };
