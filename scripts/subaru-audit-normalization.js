function normalizeSubaruMake(value) {
  return String(value || '')
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isSubaruMake(value) {
  return normalizeSubaruMake(value) === 'subaru';
}

function codePoints(value) {
  return [...String(value || '')].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

module.exports = { codePoints, isSubaruMake, normalizeSubaruMake };
