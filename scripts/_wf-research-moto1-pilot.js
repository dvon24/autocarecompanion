/**
 * MOTORCYCLE PILOT - WAVE 1. A deliberately SMALL first subset of a new vehicle class.
 *
 * This is the first non-automotive research in the catalog, so it is scoped as a pilot: 6 nameplates,
 * not 12, and everything it produces lands as vehicleType='motorcycle' so it can never be mixed into
 * an automotive count. The KnownIssue.vehicleType column added 2026-08-25 is what makes that a real
 * guarantee rather than a naming convention.
 *
 * WHY A COLUMN AND NOT A NAMING RULE: make names COLLIDE across vehicle classes. Two of the six
 * targets below are deliberately chosen to exercise that collision -
 *   Triumph Bonneville (motorcycle) vs Triumph TR6  (car, 6 issues already published)
 *   Suzuki V-Strom 650 (motorcycle) vs Suzuki Vitara/Swift/Jimny (cars, 20 issues published)
 * A `make`-based filter would silently merge these. Only the discriminator separates them.
 *
 * SIX TARGETS, chosen for large, long-lived owner communities with genuinely documented failures
 * rather than for sales volume - a pilot needs evidence density, not reach:
 *   Harley-Davidson Sportster   Honda Gold Wing   Yamaha MT-07
 *   BMW R1200GS                 Triumph Bonneville   Suzuki V-Strom 650
 *
 * ENUM DISCIPLINE: category and severity use the SAME closed sets as the automotive catalog. The
 * renderer knows 17 categories and high/medium/low only, and a wider enum from a research workflow
 * has previously crashed article pages for 39 models. Motorcycle-shaped concepts must map INTO the
 * existing set (final drive/chain/belt -> drivetrain; fairing/bodywork -> exterior), never extend it.
 *
 * DTC NOTE: motorcycles largely do NOT use OBD-II. Codes here are manufacturer-specific (Harley
 * P-codes and B-codes, Honda/Yamaha/Suzuki FI blink codes, BMW-specific codes). The prompt asks for
 * them only where genuinely documented, and the DTC tagging pass is NOT run over this class - a bike
 * code that collides numerically with an OBD-II code must not mint an automotive /dtc page.
 *
 * Carries every prompt fix from auto waves 3-8: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned as a
 * citation, and per-target generation/engine traps flagged in the notes.
 */
export const meta = {
  name: 'research-moto1-pilot',
  description: 'Motorcycle pilot wave 1: 6 nameplates, kept separate from the automotive catalog via vehicleType. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    make: 'Harley-Davidson', model: 'Sportster', yearsHint: '2004-2022',
    note: 'Evolution 883/1200 air-cooled V-twin, rubber-mounted frame from 2004. Long-documented themes: cam chain tensioner and cam bearing wear, primary chain adjuster, stator and voltage regulator failure, oil weep from the cam cover, and the 2014+ ABS/ECU electrical faults. The 2021+ Sportster S is a COMPLETELY different bike (liquid-cooled Revolution Max 1250T) - do NOT carry Evolution issues onto it.',
    forums: 'xlforum.net, hdforums.com, thesportsterandbuellmotorcycleforum.com, r/Harley',
  },
  {
    make: 'Honda', model: 'Gold Wing', yearsHint: '2001-2025',
    note: 'GL1800 flat-six. Two eras: 2001-2017 (the long-running chassis, subject of a major NHTSA recall for the secondary fuel-pump/fuel-feed hose and a separate steering-stem bearing issue) and 2018+ (all-new chassis, 7-speed DCT option). Recurring: final drive splines and dry spline wear, rear brake caliper corrosion, alternator/stator failure, and airbag/electrical complaints. Distinguish the two generations - they share almost nothing structurally.',
    forums: 'goldwingfacts.com, gl1800riders.com, wingstuff forums, r/goldwing',
  },
  {
    make: 'Yamaha', model: 'MT-07', yearsHint: '2015-2025',
    note: 'CP2 689cc parallel-twin with a 270-degree crank. Known themes: soft/underdamped stock suspension (a real documented complaint, not just preference), fuel-pump and FI recalls on early units, cam chain tensioner noise, regulator/rectifier heat failure, and rear shock linkage wear. The CP2 engine is SHARED with the XSR700, Tenere 700 and R7 - a failure documented on a Tenere 700 is not automatically an MT-07 issue unless it is the shared engine component.',
    forums: 'mt07forum.com, fz07.org, r/MT07, r/motorcycles',
  },
  {
    make: 'BMW', model: 'R1200GS', yearsHint: '2005-2018',
    note: 'Air/oil-cooled hexhead 2005-2009, camhead 2010-2012, liquid-cooled wethead 2013-2018. THESE ARE MECHANICALLY DIFFERENT ENGINES - do not carry an issue across them. Heavily documented: final drive bearing failure (hexhead especially), fuel pump/fuel strip failure and the associated recalls, driveshaft splines, servo-assisted (whizzy) ABS unit failure on 2005-2008, and the 2013+ wethead water pump. BMW is also a car make in this catalog - the vehicleType column is what keeps this off the BMW car pages.',
    forums: 'advrider.com, ukgser.com, bmwmoa.org forums, r/bmwmotorrad',
  },
  {
    make: 'Triumph', model: 'Bonneville', yearsHint: '2001-2025',
    note: 'MAKE COLLISION - this catalog also holds Triumph TR6 (a car). Two distinct engine families: air-cooled 790cc/865cc 2001-2016 and liquid-cooled 900/1200 High Torque and High Power from 2016. Recurring: sprag/starter clutch failure, regulator-rectifier and charging faults, carb-era vs EFI-era running issues, cam chain tensioner, and fork seal/steering head bearing wear. Keep the two engine families separate.',
    forums: 'triumphrat.net, newbonneville.com, bonnevilleamerica forums, r/triumph',
  },
  {
    make: 'Suzuki', model: 'V-Strom 650', yearsHint: '2004-2025',
    note: 'MAKE COLLISION - this catalog also holds Suzuki Vitara, Swift, Jimny, SX4 (cars). DL650 with the SV650-derived 645cc 90-degree V-twin. Recurring: regulator/rectifier and stator failure (the signature electrical complaint), fuel pump and FI issues, second-gear and clutch basket wear, cam chain tensioner, and rear shock linkage bearing seizure from lack of grease. 2012+ got a revised engine and 2017+ another revision - note which applies.',
    forums: 'stromtrooper.com, vstrom.info, wee-strom forums, r/Vstrom, r/SuzukiMotorcycles',
  },
]

const CITATION = {
  type: 'object', additionalProperties: false,
  properties: { type: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } },
  required: ['type', 'title', 'url'],
}

const CATEGORIES = ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other']

const DISCOVER_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string', enum: CATEGORIES },
          years: { type: 'array', items: { type: 'number' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
          typicalMileageLow: { type: 'number' },
          typicalMileageHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'citations'],
      },
    },
  },
  required: ['candidates'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    isReal: { type: 'boolean' },
    confidence: { type: 'number' },
    hasLiveCitation: { type: 'boolean' },
    hasNonAggregatorSource: { type: 'boolean' },
    hasOwnerCommunitySource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'isDuplicate', 'reason'],
}

function discoverPrompt(t) {
  return [
    `You research REAL, documented known issues for a specific MOTORCYCLE. Machine: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}`,
    ``,
    `This is a motorcycle, not a car. Treat it as one: riders diagnose and document differently, and the failure surface is different - charging systems (stator, regulator/rectifier), final drive (chain, belt or shaft and its splines), fork seals and steering head bearings, cam chain tensioners, fuel pumps, and corrosion on exposed components are the recurring themes across most makes.`,
    ``,
    `Your sources, in priority order:`,
    `  1. OWNER/RIDER COMMUNITIES - go here first and spend real effort: ${t.forums}. This is where the detail lives that never reaches a government summary: exactly which engine family and model years fail, the mileage it happens at, what the dealer tried first, and what actually fixed it.`,
    `  2. OFFICIAL - NHTSA recalls and complaints (NHTSA DOES cover motorcycles), manufacturer service bulletins, and OEM service documentation.`,
    ``,
    `This is a NEW vehicle class for our database, so there are no existing entries to avoid - but the bar for evidence is the same as the automotive catalog, and the pilot is judged on accuracy, not volume.`,
    ``,
    `Use web search to find 6-10 well-documented, RECURRING issues that real owners report.`,
    ``,
    `For EACH issue provide: title (specific - name the component and the failure mode, not a vague symptom), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: ${CATEGORIES.join(', ')}), years (specific model years affected, integers), engines/trims when the issue is specific to an engine family or variant, symptoms[], estimatedCostLow/High in USD when known, typicalMileageLow/High when documented, and citations[].`,
    ``,
    `CATEGORY MAPPING - the category list above is CLOSED and shared with the automotive catalog. Map motorcycle concepts into it; do NOT invent a new category:`,
    `  * final drive, chain, belt, shaft, splines, clutch basket -> drivetrain`,
    `  * stator, regulator/rectifier, charging, ECU, wiring, lighting -> electrical`,
    `  * fairing, bodywork, paint, corrosion on panels -> exterior`,
    `  * fork seals, shocks, linkage bearings, steering head bearings -> suspension (or steering if it is the head/stem itself)`,
    `  * seat, instruments, switchgear -> interior`,
    ``,
    `DTC CODES: motorcycles largely do NOT use OBD-II. Provide dtcCodes[] ONLY where a manufacturer-specific code is genuinely documented for this failure (Harley P/B-codes, Honda/Yamaha/Suzuki FI blink or fault codes, BMW-specific codes). If you are not certain the code is real and documented for THIS machine, return an empty array. Never guess a code by analogy to a car.`,
    ``,
    `CITATION RULES - hard requirements, not preferences:`,
    `  * At least ONE citation per issue must be a rider community thread or an official source. An issue supported ONLY by third-party problem-aggregator sites does not qualify.`,
    `  * NEVER cite a raw api.nhtsa.gov endpoint. Those return JSON a human cannot read. Cite the human-readable nhtsa.gov page instead.`,
    `  * Cite ONLY pages you actually found and opened in search results. Do NOT construct or guess a URL from a pattern - fabricated URLs have polluted this database before.`,
    `  * A forum thread you found in search results counts even if the site blocks automated fetching.`,
    ``,
    `Accuracy over volume: 4 solid issues beat 10 with two invented. A single isolated complaint is an anecdote, not a known issue - look for a recurring pattern across multiple owners. A known WEAKNESS that riders routinely pre-emptively service (for example a regulator/rectifier known to cook) IS a legitimate known issue if it is genuinely recurring. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  return [
    `You are a skeptical MOTORCYCLE fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Machine: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines/variants: ${(c.engines || []).join(', ') || '(unspecified)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Context on this machine's generations: ${t.note}`,
    ``,
    `Use web search to verify:`,
    `(1) Is this a genuine, RECURRING issue for THIS specific motorcycle and THESE years - not carried over from a different engine family, a different generation, or a platform sibling? Motorcycles share engines across models aggressively (the Yamaha CP2 runs in the MT-07, XSR700, Tenere 700 and R7; the Suzuki 645 V-twin in the SV650 and V-Strom 650; Triumph's 865 across the whole modern classic range). A failure documented on a sibling is NOT automatically an issue here unless it is genuinely the shared component. A single isolated complaint is an anecdote - refute it as a "known issue" unless multiple independent owners report the same failure.`,
    `(2) Do the cited URLs actually exist, resolve, and support the claim? A URL that 404s is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(3) Are the model years plausible for this machine and that engine family? Reject year ranges that predate the model or that span an engine change the issue cannot cross.`,
    `(4) If dtcCodes were supplied, are they REAL manufacturer codes documented for this machine - not OBD-II automotive codes applied by analogy? Motorcycles largely do not use OBD-II. Treat an automotive-looking generic code on a bike as a strong signal of invention.`,
    `(5) Is this actually a maintenance ITEM rather than a defect? Chains stretch, fork seals eventually weep, and consumables wear - that alone is not a known issue. It qualifies only if this machine fails notably earlier or more often than its class.`,
    ``,
    `Also classify the sources: hasOwnerCommunitySource (at least one citation is a real rider forum, club, or model-specific community thread), and hasNonAggregatorSource (at least one citation is a rider community OR an official source such as NHTSA/TSB/OEM - as opposed to third-party problem-aggregator sites).`,
    ``,
    `Set isDuplicate=false unless this claim duplicates ANOTHER claim in this same batch for this machine.`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring pattern, isReal=false.`,
  ].join('\n')
}

log(`Motorcycle pilot: ${TARGETS.length} nameplates — Harley/Honda/Yamaha/BMW/Triumph/Suzuki (vehicleType=motorcycle, kept out of automotive counts)`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, found: 0, confirmed: [], forumBacked: 0 }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          // Same gate stack as the automotive waves. Nothing here is motorcycle-specific: an
          // unverified claim is an unverified claim regardless of how many wheels it has.
          if (!v.isReal || !v.hasLiveCitation || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!v.hasNonAggregatorSource) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c,
            make: t.make,
            model: t.model,
            vehicleType: 'motorcycle',
            _verdict: v,
            _forumBacked: !!v.hasOwnerCommunitySource,
          }
        })
    )).then((res) => {
      const kept = res.filter(Boolean)
      return {
        make: t.make, model: t.model,
        found: candidates.length,
        confirmed: kept,
        forumBacked: kept.filter((x) => x._forumBacked).length,
      }
    })
  }
)

const confirmed = []
let totalFound = 0, totalForumBacked = 0
const perModelStats = []
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForumBacked += r.forumBacked
  perModelStats.push({ make: r.make, model: r.model, found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked })
  log(`${r.make} ${r.model}: ${r.confirmed.length}/${r.found} confirmed, ${r.forumBacked} forum-backed`)
  for (const c of r.confirmed) confirmed.push(c)
}
log(`MOTORCYCLE PILOT TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalForumBacked} forum-backed`)

return { result: { confirmed, stats: { vehicleType: 'motorcycle', models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForumBacked, perModel: perModelStats } } }
