const NON_IDENTIFYING_PART_TYPE_WORDS = new Set([
  'engine', 'assembly', 'kit', 'set', 'system', 'auto', 'automatic', 'vehicle',
  'and', 'with', 'for', 'the', 'of', 'universal', 'direct', 'genuine',
]);

/** Require side, position, and emissions qualifiers to exist in the article. */
export function candidateQualifiersAppearInArticle(partType: string, article: string): boolean {
  if (!article) return false;
  const normalizeToken = (word: string) => word.length > 3 && word.endsWith('s') && !word.endsWith('ss')
    ? word.slice(0, -1)
    : word;
  const haystack = new Set(
    article.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean).map(normalizeToken),
  );
  return String(partType || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !NON_IDENTIFYING_PART_TYPE_WORDS.has(word))
    .map(normalizeToken)
    .every((word) => haystack.has(word));
}
