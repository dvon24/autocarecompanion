function normalizeTeslaMake(value) {
  return String(value || '')
    .trim()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isTeslaMake(value) {
  return normalizeTeslaMake(value) === 'tesla';
}

function codePoints(value) {
  return [...String(value || '')].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

module.exports = { codePoints, isTeslaMake, normalizeTeslaMake };
