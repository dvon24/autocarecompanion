function normalizeSuzukiMake(value) {
  return String(value || '')
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isSuzukiMake(value) {
  return normalizeSuzukiMake(value) === 'suzuki';
}

function codePoints(value) {
  return [...String(value || '')].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

module.exports = { codePoints, isSuzukiMake, normalizeSuzukiMake };
