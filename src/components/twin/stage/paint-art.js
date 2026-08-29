function validArtBundle(art) {
  return Boolean(
    art
    && typeof art.base === "string"
    && art.base.length > 0
    && art.effects
    && typeof art.effects === "object"
  );
}

/**
 * Resolve the exact artwork for the selected factory paint.
 *
 * The catalog's top-level art is the identity paint's bundle. Additional
 * rendered colors must carry their own `paintPalette.colors[].art` bundle.
 * A rendered status without that bundle is intentionally treated as pending;
 * retaining the previous image would falsely preview a different color.
 */
export function resolveTwinPaintArtwork(catalog, paintControl) {
  const fallbackArt = validArtBundle(catalog?.art) ? catalog.art : null;
  const choice = paintControl?.choice;
  if (!choice) return { art:fallbackArt, selected:null, pending:false };

  const options = paintControl.options || catalog?.paintPalette?.colors || [];
  const selected = options.find((paint) => paint?.name === choice) || null;
  if (!selected || selected.artStatus !== "rendered") {
    return { art:null, selected, pending:true };
  }
  if (validArtBundle(selected.art)) {
    return { art:selected.art, selected, pending:false };
  }
  if (choice === catalog?.identity?.paint) {
    return { art:fallbackArt, selected, pending:!fallbackArt };
  }
  return { art:null, selected, pending:true };
}
