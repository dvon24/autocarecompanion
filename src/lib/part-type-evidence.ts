const NON_IDENTIFYING_PART_TYPE_WORDS = new Set([
  'engine', 'assembly', 'kit', 'set', 'system', 'auto', 'automatic', 'vehicle',
  'and', 'with', 'for', 'the', 'of', 'universal', 'direct', 'genuine',
]);

/** Require side, position, and emissions qualifiers to exist in the article. */
export function candidateQualifiersAppearInArticle(partType: string, article: string): boolean {
  if (!article) return false;
  const haystack = article.toLowerCase();
  return String(partType || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !NON_IDENTIFYING_PART_TYPE_WORDS.has(word))
    .every((word) => haystack.includes(word));
}
