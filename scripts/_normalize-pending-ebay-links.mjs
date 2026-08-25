import fs from 'node:fs';
import path from 'node:path';

const MAKES = [
  'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mercury', 'MG', 'MINI',
  'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche', 'RAM',
  'Renault', 'Rivian', 'Saab', 'Saturn', 'SEAT', 'Subaru', 'Suzuki', 'Tesla', 'Toyota',
  'Triumph', 'Volkswagen', 'Volvo', 'Skoda', 'Alfa Romeo', 'Citroen', 'CUPRA', 'Dacia',
  'Datsun', 'International', 'Lucid',
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let patch = '*** Begin Patch\n';
let changedLinks = 0;
let changedFiles = 0;
const maxFiles = Number.parseInt(process.argv[2] || '', 10) || Number.POSITIVE_INFINITY;

makeLoop: for (const make of MAKES) {
  const directory = path.join('data', `${slugify(make)}-repair-first-review`);
  const files = fs.readdirSync(directory).filter((name) => /^second-pass-.*\.json$/.test(name));
  for (const fileName of files) {
    const file = path.join(directory, fileName);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    let hunks = '';
    for (const line of lines) {
      const match = line.match(/"url"\s*:\s*"(https:\/\/[^"\s]*ebay\.[^"\s]*)"/i);
      if (!match) continue;
      const url = new URL(match[1]);
      for (const key of ['mkevt', 'mkcid', 'mkrid', 'campid', 'customid', 'toolid']) {
        url.searchParams.delete(key);
      }
      url.searchParams.set('mkevt', '1');
      url.searchParams.set('mkcid', '1');
      url.searchParams.set('mkrid', '711-53200-19255-0');
      url.searchParams.set('campid', '5339164204');
      url.searchParams.set('customid', 'known-issue-parts');
      url.searchParams.set('toolid', '10001');
      const nextLine = line.replace(match[1], url.toString());
      if (nextLine === line) continue;
      hunks += `@@\n-${line}\n+${nextLine}\n`;
      changedLinks += 1;
    }
    if (hunks) {
      patch += `*** Update File: ${file.replaceAll('\\', '/')}\n${hunks}`;
      changedFiles += 1;
      if (changedFiles >= maxFiles) break makeLoop;
    }
  }
}

patch += '*** End Patch';
process.stderr.write(`links=${changedLinks} files=${changedFiles}\n`);
process.stdout.write(patch);
