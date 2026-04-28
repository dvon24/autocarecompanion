import Anthropic from '@anthropic-ai/sdk';

/**
 * Known-issues research pipeline.
 *
 * Single-call MVP: Claude Sonnet 4.6 with the web_search_20250305 tool.
 * The model researches a specific year+make+model, finds 5-8 verifiable
 * issues, returns structured records with REAL citation URLs from the
 * search results. Designed to be A/B-able against the existing
 * hand-curated KnownIssue records before we trust it at scale.
 *
 * Why single-call (not multi-agent like the parts pipeline)?
 *   - Web-search-augmented reasoning makes verification + extraction one
 *     coherent step. Splitting into Identifier → Verifier → Scorer doesn't
 *     buy us much when the model can iterate on its own searches.
 *   - Fewer round-trips means lower cost (~$0.20 vs ~$0.60 per vehicle).
 *   - If A/B comparison shows quality is shaky, we upgrade to multi-agent
 *     in a v2 — same shape, just split into stages.
 *
 * Output: PipelineKnownIssue[]. Caller decides whether to persist with
 * status='needs-review' (default) or status='published'.
 */

export interface Citation {
  url: string;
  title: string;
  type: 'forum' | 'tsb' | 'recall' | 'review' | 'news' | 'manufacturer' | 'other';
}

export interface PipelineKnownIssue {
  /** Slug we generate from the title — e.g. "ford-f-150-bronze-coolant-2024". */
  id: string;
  title: string;
  description: string;
  solution: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  symptoms: string[];
  affectedSystems: string[];
  dtcCodes: string[];
  citations: Citation[];
  typicalMileageLow: number | null;
  typicalMileageHigh: number | null;
  estimatedCostLow: number | null;
  estimatedCostHigh: number | null;
  /** AI-generated rationale we keep for the human reviewer. Not displayed. */
  reviewerNote?: string;
}

export interface KnownIssuesPipelineResult {
  vehicle: { year: number; make: string; model: string };
  issues: PipelineKnownIssue[];
  webSearchesUsed: number;
  rawResponseTokens: { input: number; output: number };
}

const VALID_CATEGORIES = new Set([
  'engine', 'electrical', 'transmission', 'suspension', 'body', 'cooling',
  'drivetrain', 'brakes', 'fuel', 'safety', 'interior', 'other', 'steering',
  'exhaust', 'emissions', 'hvac', 'exterior',
]);

const SYSTEM_PROMPT = `You are an automotive research analyst. Your job is to identify the most credible, well-documented known issues for a specific year/make/model and return them as structured records WITH real source URLs you find via web_search.

Hard rules:
- Use the web_search tool. EVERY issue you return must cite at least one real URL you found via search.
- DO NOT invent URLs. DO NOT use fabricated citation domains. If web_search doesn't surface a credible source for an issue, omit it.
- Forums (bimmerpost.com, civicx.com, charger-forums, etc.), TSB databases, manufacturer recall pages, established automotive press (Car and Driver, MotorTrend), and YouTube mechanic channels with high view counts are all valid sources.
- Reddit threads count when they have substantial discussion (50+ comments). Single-comment threads do not.
- Issues that are common across the entire industry (e.g. "tire wear" on every vehicle) are not interesting. Focus on issues SPECIFIC to this year/make/model that owners would search for.

Return between 4 and 8 issues. Lean toward fewer/higher-quality over many/weak.

Output: a single JSON object, no other text. Schema:
{
  "issues": [
    {
      "title": "Short, search-friendly title (e.g. 'B58 timing chain rattle on cold start')",
      "description": "2-4 sentence description of the symptom + typical owner experience",
      "solution": "What an owner / mechanic does to fix it. Be concrete.",
      "category": "engine|electrical|transmission|suspension|body|cooling|drivetrain|brakes|fuel|safety|interior|steering|exhaust|emissions|hvac|exterior|other",
      "severity": "critical|high|medium|low",
      "confidence": "high|medium|low",
      "symptoms": ["short phrase", "short phrase"],
      "affectedSystems": ["short component name"],
      "dtcCodes": ["P0301"] /* only if applicable, otherwise [] */,
      "citations": [
        { "url": "<real URL from web_search>", "title": "<page title>", "type": "forum|tsb|recall|review|news|manufacturer|other" }
      ],
      "typicalMileageLow": 60000 /* or null */,
      "typicalMileageHigh": 100000 /* or null */,
      "estimatedCostLow": 800 /* USD, or null */,
      "estimatedCostHigh": 1500 /* USD, or null */,
      "reviewerNote": "Why this issue made the cut + which sources were strongest. 1-2 sentences."
    }
  ]
}

Critical: severity should reflect SAFETY/COST impact, not just frustration. Critical = could cause crash or strand the driver. High = expensive repair (>$1500) or repeat failure. Medium = annoying but driveable. Low = cosmetic/minor.`;

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Run the pipeline for one vehicle. Returns issues + token usage so the
 * caller can compute spend or persist a snapshot.
 */
export async function runKnownIssuesPipeline(
  year: number,
  make: string,
  model: string,
): Promise<KnownIssuesPipelineResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY missing');
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userPrompt = `Research credible known issues for the ${year} ${make} ${model}.

Use web_search to find:
- Owner forum threads where multiple owners report the same problem
- Manufacturer Technical Service Bulletins (TSBs) and recalls
- Established automotive journalism coverage
- YouTube mechanic channels documenting recurring failures

Return 4-8 highest-confidence issues. Skip generic problems that affect every vehicle in the segment. Focus on what owners of THIS specific year+make+model would find when searching for problems.

Return ONLY the JSON object — no preamble, no markdown fences.`;

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 } as any],
  });

  // Pull the last text block (model emits tool_use blocks first when web_search runs).
  const textBlocks = (res.content || []).filter(
    (b: { type: string }) => b.type === 'text',
  ) as Array<{ type: 'text'; text: string }>;
  const raw = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : '{}';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: { issues?: unknown[] } = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { /* fall through */ }
    }
  }

  const webSearchesUsed = (res.content || []).filter(
    (b: { type: string }) => b.type === 'web_search_tool_use' || b.type === 'server_tool_use',
  ).length;

  const rawIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
  const issues: PipelineKnownIssue[] = [];
  for (const r of rawIssues) {
    if (!r || typeof r !== 'object') continue;
    const obj = r as Record<string, unknown>;
    const title = typeof obj.title === 'string' ? obj.title.trim() : '';
    if (!title) continue;
    const citations = Array.isArray(obj.citations)
      ? (obj.citations as Array<Record<string, unknown>>).filter((c) => c && typeof c.url === 'string').map((c) => ({
          url: String(c.url),
          title: typeof c.title === 'string' ? c.title : '',
          type: (typeof c.type === 'string' ? c.type : 'other') as Citation['type'],
        }))
      : [];
    if (citations.length === 0) continue; // hard rule: no citation = drop

    const category = typeof obj.category === 'string' && VALID_CATEGORIES.has(obj.category) ? obj.category : 'other';
    const sev = (typeof obj.severity === 'string' ? obj.severity : 'medium').toLowerCase();
    const severity = (['critical', 'high', 'medium', 'low'].includes(sev) ? sev : 'medium') as PipelineKnownIssue['severity'];
    const conf = (typeof obj.confidence === 'string' ? obj.confidence : 'medium').toLowerCase();
    const confidence = (['high', 'medium', 'low'].includes(conf) ? conf : 'medium') as PipelineKnownIssue['confidence'];

    issues.push({
      id: `${slugify(make)}-${slugify(model)}-${slugify(title)}-${year}`,
      title,
      description: typeof obj.description === 'string' ? obj.description.trim() : '',
      solution: typeof obj.solution === 'string' ? obj.solution.trim() : '',
      category,
      severity,
      confidence,
      symptoms: Array.isArray(obj.symptoms) ? (obj.symptoms as unknown[]).filter((s) => typeof s === 'string') as string[] : [],
      affectedSystems: Array.isArray(obj.affectedSystems) ? (obj.affectedSystems as unknown[]).filter((s) => typeof s === 'string') as string[] : [],
      dtcCodes: Array.isArray(obj.dtcCodes) ? (obj.dtcCodes as unknown[]).filter((s) => typeof s === 'string') as string[] : [],
      citations,
      typicalMileageLow: typeof obj.typicalMileageLow === 'number' ? obj.typicalMileageLow : null,
      typicalMileageHigh: typeof obj.typicalMileageHigh === 'number' ? obj.typicalMileageHigh : null,
      estimatedCostLow: typeof obj.estimatedCostLow === 'number' ? obj.estimatedCostLow : null,
      estimatedCostHigh: typeof obj.estimatedCostHigh === 'number' ? obj.estimatedCostHigh : null,
      reviewerNote: typeof obj.reviewerNote === 'string' ? obj.reviewerNote : undefined,
    });
  }

  return {
    vehicle: { year, make, model },
    issues,
    webSearchesUsed,
    rawResponseTokens: {
      input: res.usage?.input_tokens || 0,
      output: res.usage?.output_tokens || 0,
    },
  };
}
