function normalizeSkodaMake(value) {
  return String(value || '')
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isSkodaMake(value) {
  return normalizeSkodaMake(value) === 'skoda';
}

function codePoints(value) {
  return [...String(value || '')].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

module.exports = { codePoints, isSkodaMake, normalizeSkodaMake };
