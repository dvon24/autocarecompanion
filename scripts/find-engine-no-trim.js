const data = JSON.parse(require('fs').readFileSync('src/data/known-issues.json','utf8'));
const issues = data.issues;

const enginePatterns = [
  /\b1\.[0-9]l?\b/i, /\b1\.[0-9][\s-]?liter/i,
  /\b2\.0[lt\s]/i, /\b2\.4[lt\s]/i, /\b2\.5[lt\s]/i, /\b2\.7[lt\s]/i,
  /\b3\.0[lt\s]/i, /\b3\.3[lt\s]/i, /\b3\.5[lt\s]/i, /\b3\.6[lt\s]/i, /\b3\.8[lt\s]/i,
  /\b4\.0[lt\s]/i, /\b4\.6[lt\s]/i, /\b4\.8[lt\s]/i,
  /\b5\.0[lt\s]/i, /\b5\.3[lt\s]/i, /\b5\.4[lt\s]/i, /\b5\.7[lt\s]/i,
  /\b6\.0[lt\s]/i, /\b6\.2[lt\s]/i, /\b6\.4[lt\s]/i, /\b6\.7[lt\s]/i,
  /\b7\.0[lt\s]/i, /\b7\.3[lt\s]/i,
  /\bLT1\b/, /\bLT4\b/, /\bLTG\b/, /\bLT5\b/, /\bLS1\b/, /\bLS3\b/, /\bLS7\b/, /\bLFX\b/,
  /\bL86\b/, /\bL84\b/, /\bL83\b/, /\bLM7\b/, /\bLQ4\b/, /\bLQ9\b/,
  /\bEcoTec3\b/i, /\bVortec\b/i, /\bDuramax\b/i, /\bCummins\b/i,
  /\bEcoBoost\b/i, /\bCoyote\b/i, /\bVoodoo\b/i, /\bPower\s*Stroke\b/i, /\bTriton\b/i,
  /\bDuratec\b/i, /\bTi-VCT\b/i,
  /\bHemi\b/i, /\bPentastar\b/i, /\bHellcat\b/i, /\bSRT\b/i, /\bDemon\b/i,
  /\bVTEC\b/i, /\bSkyActiv\b/i, /\bFA20\b/i, /\bEJ25\b/i, /\bFB20\b/i, /\bFB25\b/i,
  /\b2GR\b/i, /\b1GR\b/i, /\b2JZ\b/i, /\b2AR\b/i, /\bVQ35\b/i, /\bVQ37\b/i, /\bQR25\b/i, /\bMR20\b/i,
  /\bTFSI\b/i, /\bTSI\b/i, /\bTDI\b/i, /\bN54\b/i, /\bN55\b/i, /\bN20\b/i, /\bN63\b/i, /\bS63\b/i,
  /\bB58\b/i, /\bB48\b/i, /\bS58\b/i, /\bM54\b/i, /\bM52\b/i,
  /\bOM642\b/i, /\bOM651\b/i, /\bM274\b/i, /\bM276\b/i, /\bM278\b/i, /\bM157\b/i,
  /\bturbo\b/i, /\bsupercharg/i, /\bdiesel\b/i,
  /\bV6\b/, /\bV8\b/, /\bI4\b/, /\bI6\b/, /\binline.?4\b/i, /\binline.?6\b/i,
  /\b4[\s-]?cyl/i, /\b6[\s-]?cyl/i, /\b8[\s-]?cyl/i,
];

const multiEngineModels = {
  'Chevrolet': ['Camaro', 'Corvette', 'Silverado', 'Silverado 1500', 'Tahoe', 'Suburban', 'Colorado', 'Traverse'],
  'Ford': ['Mustang', 'F-150', 'F-250', 'F-350', 'Explorer', 'Ranger', 'Bronco', 'Edge', 'Escape', 'Expedition', 'Transit'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'RAM 1500', 'RAM 2500', 'RAM 3500'],
  'RAM': ['1500', '2500', '3500'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Gladiator'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X6', 'M3', 'M4', 'M5'],
  'Toyota': ['Tacoma', 'Tundra', '4Runner', 'Camry', 'Supra'],
  'Honda': ['Civic', 'Accord'],
  'Hyundai': ['Sonata', 'Santa Fe', 'Tucson', 'Genesis Coupe'],
  'Kia': ['Optima', 'Sorento', 'Sportage', 'Stinger'],
  'Nissan': ['370Z', 'Altima', 'Frontier', 'Pathfinder', 'Titan'],
  'Subaru': ['WRX', 'Forester', 'Outback', 'Legacy', 'Impreza'],
  'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas'],
  'Audi': ['A4', 'A5', 'A6', 'Q5', 'Q7'],
  'GMC': ['Sierra', 'Sierra 1500', 'Yukon', 'Canyon', 'Terrain'],
  'Cadillac': ['CTS', 'CT5', 'CT4', 'Escalade', 'XT5'],
};

const problems = [];

issues.forEach(i => {
  const title = i.title || '';
  const desc = (i.description || '').slice(0, 300);
  const text = title + ' ' + desc;
  const make = i.make || (i.vehicleMatch ? i.vehicleMatch.make : undefined);
  const model = i.model || (i.vehicleMatch ? i.vehicleMatch.model : undefined);
  const trims = i.trims || (i.vehicleMatch ? i.vehicleMatch.trims : undefined);
  
  if (trims && trims.length > 0) return;
  
  const matchedPattern = enginePatterns.find(p => p.test(text));
  if (matchedPattern === undefined) return;
  
  const makeModels = multiEngineModels[make];
  if (makeModels === undefined) return;
  if (model === undefined) return;
  
  const hasMatch = makeModels.some(m => 
    m.toLowerCase() === model.toLowerCase() || 
    model.toLowerCase().includes(m.toLowerCase())
  );
  if (hasMatch === false) return;
  
  problems.push({
    id: i.id,
    make,
    model,
    title,
    matched: matchedPattern.toString(),
    engineMention: text.match(matchedPattern) ? text.match(matchedPattern)[0] : '',
  });
});

console.log('Found ' + problems.length + ' engine-specific issues WITHOUT trim restriction on multi-engine models:');
console.log('');
problems.forEach(p => {
  console.log(p.make + ' ' + p.model + ': ' + p.title);
  console.log('  ID: ' + p.id);
  console.log('  Engine ref: ' + p.engineMention);
  console.log('');
});
