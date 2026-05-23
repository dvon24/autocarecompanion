/**
 * Shared helper for adding new KnownIssue rows to the DB.
 *
 * Forces status='pending_review' so nothing ships to production until
 * explicit verification via scripts/audit-pending-issues.js +
 * scripts/publish-verified-issues.js.
 *
 * This is the audit-before-publish gate — see commit history around
 * 2026-05-23 for why this pattern was introduced (Skoda was published
 * directly, then audited reactively, repeating the same gap that
 * created the original corpus-wide cleanup work).
 *
 * Usage from any add-{make}-issues.js script:
 *
 *   const { insertPendingIssue } = require('./lib/insert-known-issue');
 *   for (const draft of issues) {
 *     await insertPendingIssue(pool, draft);
 *   }
 */

/**
 * Insert a KnownIssue draft with status='pending_review'.
 * Throws on duplicate id (caller should check first).
 *
 * @param {Pool} pool - pg.Pool instance
 * @param {object} draft - issue object matching KnownIssue schema
 *   Required: id, make, model, years (array), category, title, description, solution, severity
 *   Optional: trims, engines, confidence, symptoms, affectedSystems, dtcCodes,
 *             estimatedCostLow/High, typicalMileageLow/High, source
 *   Forced: status='pending_review' (gate)
 */
async function insertPendingIssue(pool, draft) {
  // Validation — fail fast on missing required fields rather than letting
  // the DB throw a less helpful error.
  const required = ['id', 'make', 'model', 'years', 'category', 'title', 'description', 'solution', 'severity'];
  for (const k of required) {
    if (draft[k] === undefined || draft[k] === null) {
      throw new Error(`insertPendingIssue: missing required field "${k}" on draft ${draft.id ?? '(no id)'}`);
    }
  }
  if (!Array.isArray(draft.years) || draft.years.length === 0) {
    throw new Error(`insertPendingIssue: years must be a non-empty array on ${draft.id}`);
  }

  // Defaults — caller can override but most are sensible.
  const row = {
    trims: [],
    engines: [],
    confidence: 'medium',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    source: 'manual',
    ...draft,
    // Force the gate:
    status: 'pending_review',
  };

  await pool.query(
    `INSERT INTO "KnownIssue" (
      id, make, model, years, trims, engines, category, title, description, solution,
      severity, confidence, symptoms, "affectedSystems", "dtcCodes",
      "estimatedCostLow", "estimatedCostHigh", "typicalMileageLow", "typicalMileageHigh",
      citations, "communityRecommendations", "humanApproved", "reportCount", status,
      source, "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19,
      '[]'::jsonb, '[]'::jsonb, false, 0, $20,
      $21, NOW(), NOW()
    )`,
    [
      row.id, row.make, row.model, row.years, row.trims, row.engines, row.category, row.title, row.description, row.solution,
      row.severity, row.confidence, row.symptoms, row.affectedSystems, row.dtcCodes,
      row.estimatedCostLow, row.estimatedCostHigh, row.typicalMileageLow, row.typicalMileageHigh,
      row.status, row.source,
    ],
  );

  return row.id;
}

/**
 * Check if an ID already exists in the DB (any status).
 * @returns {Promise<boolean>}
 */
async function issueExists(pool, id) {
  const r = await pool.query(`SELECT 1 FROM "KnownIssue" WHERE id = $1 LIMIT 1`, [id]);
  return r.rows.length > 0;
}

module.exports = { insertPendingIssue, issueExists };
