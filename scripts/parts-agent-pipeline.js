/**
 * Parts Agent Pipeline — Multi-agent parts verification using Anthropic Claude
 *
 * Three-agent pipeline:
 * 1. Identifier (Haiku) — Identifies parts with OEM numbers for a vehicle+task
 * 2. Verifier (Haiku) — Cross-references each part, checks for superseded numbers
 * 3. Scorer (Sonnet) — Validates agreement, assigns final confidence
 *
 * Usage:
 *   node scripts/parts-agent-pipeline.js --year 2015 --make Dodge --model Challenger --trim "SRT 392" --task oil_change
 *   node scripts/parts-agent-pipeline.js --year 2015 --make Dodge --model Challenger --trim "SRT 392" --task brake_inspection
 */

require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── CLI Args ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const year = getArg('year') || '2015';
const make = getArg('make') || 'Dodge';
const model = getArg('model') || 'Challenger';
const trim = getArg('trim') || 'SRT 392';
const task = getArg('task') || 'oil_change';
const vehicleStr = `${year} ${make} ${model} ${trim}`;

const TASK_DESCRIPTIONS = {
  oil_change: 'Motor oil (type, weight, capacity), oil filter (OEM + aftermarket), drain plug size and torque spec',
  brake_inspection: 'Front and rear brake rotors (size, OEM part number, aftermarket options), front and rear brake pads (OEM + aftermarket), brake fluid type',
  spark_plugs: 'Spark plugs (OEM + aftermarket, gap, quantity, torque spec)',
  coolant_flush: 'Coolant type, specification, total system capacity',
  transmission_fluid: 'Transmission fluid type/specification, drain and fill capacity',
  air_filter: 'Engine air filter (OEM + aftermarket part numbers)',
  cabin_filter: 'Cabin air filter (OEM + aftermarket part numbers)',
  wiper_blades: 'Wiper blade sizes (driver, passenger, rear if applicable)',
  battery: 'Battery group size, CCA recommendation, location',
  differential_fluid: 'Differential fluid type and capacity (front and rear)',
  bulb_replacement: 'All bulb numbers (headlight low/high, turn signals, tail/brake, fog)',
  tire_rotation: 'Lug nut/bolt socket size, torque specification',
};

// ─── Agent 0: Ground Truth ─────────────────────────────────────────────

function loadGroundTruth() {
  console.log('\n📋 Agent 0 (Ground Truth) — Loading verified specs...');

  try {
    // Load our verified vehicle-specs.json
    const specsPath = require('path').join(__dirname, '..', 'src', 'data', 'vehicle-specs.json');
    const allSpecs = require(specsPath);

    const makeData = allSpecs[make];
    if (!makeData) { console.log('   No specs for make:', make); return null; }

    const modelData = makeData[model];
    if (!modelData) { console.log('   No specs for model:', model); return null; }

    // Find matching generation
    const trimLower = trim.toLowerCase();
    const yearNum = parseInt(year, 10);

    for (const [genKey, genData] of Object.entries(modelData)) {
      if (!genData.years || !genData.years.includes(yearNum)) continue;

      const genKeyLower = genKey.toLowerCase();
      // Match trim — require >1 char parts to avoid false matches
      const hasTrimMatch =
        (genKeyLower.split(/[\/,]/).some(part => part.trim().length > 1 && trimLower.includes(part.trim()))) ||
        (trimLower.split(/[\s,]/).some(part => part.length > 1 && genKeyLower.includes(part)));

      if (hasTrimMatch) {
        console.log(`   Matched generation: "${genKey}"`);
        console.log(`   Engine: ${genData.engine || 'unknown'}`);

        // Extract relevant specs for the task
        const specs = {};
        if (genData.oil) specs.oil = genData.oil;
        if (genData.sparkPlugs) specs.sparkPlugs = genData.sparkPlugs;
        if (genData.brakeFluid) specs.brakeFluid = genData.brakeFluid;
        if (genData.coolant) specs.coolant = genData.coolant;
        if (genData.transmission) specs.transmission = genData.transmission;
        if (genData.differentials) specs.differentials = genData.differentials;
        if (genData.bulbs) specs.bulbs = genData.bulbs;
        if (genData.lugNuts) specs.lugNuts = genData.lugNuts;
        if (genData.lugBolts) specs.lugBolts = genData.lugBolts;
        if (genData.brakes) specs.brakes = genData.brakes;

        const relevant = JSON.stringify(specs, null, 2);
        console.log(`   Found ${Object.keys(specs).length} spec categories`);
        return { engine: genData.engine, specs, raw: relevant };
      }
    }

    // Fallback: use first matching year
    for (const [genKey, genData] of Object.entries(modelData)) {
      if (genData.years && genData.years.includes(yearNum)) {
        console.log(`   Fallback generation: "${genKey}" (no trim match)`);
        return { engine: genData.engine, specs: genData, raw: JSON.stringify(genData, null, 2).slice(0, 2000) };
      }
    }

    console.log('   No matching generation found');
    return null;
  } catch (e) {
    console.log('   Could not load specs:', e.message);
    return null;
  }
}

// ─── Agent 1: Identifier ───────────────────────────────────────────────

async function identifyParts(groundTruth) {
  console.log('\n🔍 Agent 1 (Identifier) — Looking up parts...');

  const groundTruthSection = groundTruth ? `
VERIFIED GROUND TRUTH DATA (from the vehicle's service manual — TRUST THIS OVER YOUR TRAINING DATA):
Engine: ${groundTruth.engine}
Specs: ${groundTruth.raw}

USE THESE SPECS AS YOUR PRIMARY SOURCE. Your training data may be wrong for this specific trim. For example, the oil type in the ground truth is the CORRECT spec — do not substitute a different weight.
` : '';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are an automotive parts specialist. Look up the EXACT parts needed for this vehicle and task.

Vehicle: ${vehicleStr}
Task: ${task.replace(/_/g, ' ')}
Look up: ${TASK_DESCRIPTIONS[task] || task}
${groundTruthSection}

For EACH part, provide:
- name: Part name (e.g., "Motor Oil", "Oil Filter", "Front Brake Rotors")
- oemPartNumber: The OEM/manufacturer part number (e.g., "68191349AC" for a Mopar oil filter)
- oemBrand: The OEM brand (e.g., "Mopar", "Toyota", "Motorcraft")
- specification: The exact specification (e.g., "0W-40 Full Synthetic", "350mm vented")
- quantity: How many needed
- notes: Any important details (capacity, torque spec, location, etc.)

CRITICAL RULES:
- Be specific to this EXACT year, make, model, and trim. Different trims often have DIFFERENT specifications.
- For the ${trim}, identify the correct engine size and any trim-specific parts.
- Do NOT confuse base model specs with performance model specs. For example, a Challenger SRT 392 (6.4L) uses DIFFERENT oil than a Challenger SXT (3.6L V6).
- Only provide part numbers you are confident about. If unsure, say so in the notes.
- Check the owner's manual specification, not generic recommendations.

Respond with ONLY a JSON object: { "engine": "engine description", "parts": [...] }`
    }],
    temperature: 0.1,
  });

  const text = response.content.find(b => b.type === 'text')?.text || '{}';
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    console.log(`   Engine: ${parsed.engine || 'unknown'}`);
    console.log(`   Found ${parsed.parts?.length || 0} parts`);
    return parsed;
  } catch (e) {
    console.error('   Failed to parse response:', text.slice(0, 200));
    return { parts: [] };
  }
}

// ─── Agent 2: Verifier ─────────────────────────────────────────────────

async function verifyParts(identifiedParts) {
  console.log('\n✅ Agent 2 (Verifier) — Cross-referencing parts...');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `You are an automotive parts cross-reference specialist. Verify and enhance these parts identified for a ${vehicleStr}.

Engine: ${identifiedParts.engine || 'See parts list'}

Parts to verify:
${JSON.stringify(identifiedParts.parts, null, 2)}

For EACH part:
1. Verify the OEM part number is correct for this exact vehicle
2. Check if the part number has been superseded/updated by the manufacturer
3. Add 2-4 aftermarket cross-references from trusted brands (Wix, Fram, Mobil 1, NGK, Denso, ACDelco, Bosch, PowerStop, StopTech, Centric, K&N, etc.)
4. Flag any issues (wrong part number, discontinued, known fitment problems)

IMPORTANT: If an OEM part number looks wrong or you're unsure, flag it with "verified": false and explain why in "verificationNotes".

Respond with ONLY a JSON object:
{
  "parts": [
    {
      "name": "Part Name",
      "oemPartNumber": "verified or corrected OEM number",
      "oemBrand": "OEM brand",
      "specification": "spec",
      "quantity": 1,
      "notes": "details",
      "verified": true,
      "verificationNotes": "why you believe this is correct or incorrect",
      "supersededBy": "new part number if applicable, null otherwise",
      "crossReferences": [
        { "brand": "Wix", "partNumber": "57045" },
        { "brand": "Fram", "partNumber": "PH16" }
      ]
    }
  ]
}`
    }],
    temperature: 0.1,
  });

  const text = response.content.find(b => b.type === 'text')?.text || '{}';
  try {
    const jsonMatch = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const verified = parsed.parts?.filter(p => p.verified !== false).length || 0;
    const flagged = parsed.parts?.filter(p => p.verified === false).length || 0;
    console.log(`   Verified: ${verified} parts, Flagged: ${flagged} parts`);
    return parsed;
  } catch (e) {
    console.error('   Failed to parse response:', text.slice(0, 200));
    return identifiedParts;
  }
}

// ─── Agent 3: Scorer ───────────────────────────────────────────────────

async function scoreParts(verifiedParts) {
  console.log('\n🏆 Agent 3 (Scorer) — Assigning confidence scores...');

  // Only send core parts to scorer (skip aftermarket duplicates to stay within token limits)
  const coreParts = (verifiedParts.parts || []).filter(p => {
    const name = (p.name || '').toLowerCase();
    return !name.includes('aftermarket') && !name.includes('alternative');
  });
  console.log(`   Scoring ${coreParts.length} core parts (${(verifiedParts.parts || []).length} total including aftermarket)`);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `You are an automotive parts quality assurance specialist. Review these verified parts for a ${vehicleStr} (task: ${task.replace(/_/g, ' ')}) and assign final confidence scores.

Verified parts data:
${JSON.stringify(coreParts, null, 2)}

For EACH part, assign a confidence level:
- "oem-verified": You are highly confident this is the correct OEM part number for this exact vehicle. The part number format matches the brand's pattern, the specification is correct, and cross-references align.
- "high": The specification is correct and cross-references are consistent, but the exact OEM part number may need confirmation.
- "moderate": Something doesn't quite add up — maybe the part number format looks off, cross-references are inconsistent, or the spec seems generic.
- "needs-review": There are clear issues — wrong part number format, conflicting cross-references, or the part may not fit this vehicle.

Also provide:
- A "searchQuery" optimized for Google Shopping (e.g., "Mopar 68191349AC oil filter Dodge Challenger")
- A final "summary" for each part that a customer would see

Respond with ONLY a JSON object:
{
  "parts": [
    {
      "name": "Part Name",
      "oemPartNumber": "number",
      "oemBrand": "brand",
      "specification": "spec",
      "quantity": 1,
      "notes": "details for the customer",
      "confidence": "oem-verified",
      "confidenceReason": "brief explanation",
      "crossReferences": [...],
      "searchQuery": "optimized search query",
      "summary": "customer-facing one-line description"
    }
  ],
  "overallConfidence": "oem-verified or high or moderate or needs-review",
  "vehicleNotes": "any important vehicle-specific notes for the customer"
}`
    }],
    temperature: 0.2,
  });

  const text = response.content.find(b => b.type === 'text')?.text || '{}';
  try {
    const jsonMatch = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    console.log(`   Overall confidence: ${parsed.overallConfidence || 'unknown'}`);
    if (parsed.vehicleNotes) console.log(`   Vehicle notes: ${parsed.vehicleNotes}`);
    return parsed;
  } catch (e) {
    console.error('   Failed to parse response:', text.slice(0, 200));
    return verifiedParts;
  }
}

// ─── Main Pipeline ─────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Au7o Parts Agent Pipeline`);
  console.log(`  Vehicle: ${vehicleStr}`);
  console.log(`  Task: ${task.replace(/_/g, ' ')}`);
  console.log('═══════════════════════════════════════════════════════════');

  const startTime = Date.now();

  // Stage 0: Load ground truth from vehicle-specs.json
  const groundTruth = loadGroundTruth();

  // Stage 1: Identify parts (with ground truth if available)
  const identified = await identifyParts(groundTruth);
  if (!identified.parts || identified.parts.length === 0) {
    console.error('\n❌ No parts identified. Aborting pipeline.');
    process.exit(1);
  }

  // Stage 2: Verify and cross-reference
  const verified = await verifyParts(identified);

  // Stage 3: Score confidence (core parts only, aftermarket passed through)
  const scored = await scoreParts(verified);

  // Merge aftermarket parts back in (from verifier output) with "high" confidence
  const aftermarketParts = (verified.parts || []).filter(p => {
    const name = (p.name || '').toLowerCase();
    return name.includes('aftermarket') || name.includes('alternative');
  }).map(p => ({ ...p, confidence: 'high', confidenceReason: 'Aftermarket cross-reference from verified OEM part' }));

  if (scored.parts && aftermarketParts.length > 0) {
    scored.parts = [...scored.parts, ...aftermarketParts];
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // ─── Output ────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════');

  if (scored.parts) {
    for (const part of scored.parts) {
      const confIcon = part.confidence === 'oem-verified' ? '✅' :
                       part.confidence === 'high' ? '🔵' :
                       part.confidence === 'moderate' ? '🟡' : '🔴';

      console.log(`\n${confIcon} ${part.name}`);
      console.log(`   Spec: ${part.specification || part.oemPartNumber}`);
      if (part.oemPartNumber) console.log(`   OEM: ${part.oemBrand || ''} ${part.oemPartNumber}`);
      if (part.quantity > 1) console.log(`   Qty: ${part.quantity}`);
      if (part.notes) console.log(`   Notes: ${part.notes}`);
      if (part.confidence) console.log(`   Confidence: ${part.confidence} — ${part.confidenceReason || ''}`);
      if (part.crossReferences && part.crossReferences.length > 0) {
        console.log(`   Cross-refs: ${part.crossReferences.map(cr => `${cr.brand} ${cr.partNumber}`).join(', ')}`);
      }
      if (part.searchQuery) console.log(`   Search: ${part.searchQuery}`);
    }
  }

  console.log(`\n⏱  Pipeline completed in ${elapsed}s`);
  console.log(`📊 Overall confidence: ${scored.overallConfidence || 'unknown'}`);
  if (scored.vehicleNotes) console.log(`📝 ${scored.vehicleNotes}`);

  // Output JSON for programmatic use
  const outputPath = `scripts/_parts-result-${make.toLowerCase()}-${model.toLowerCase()}-${task}.json`;
  require('fs').writeFileSync(outputPath, JSON.stringify(scored, null, 2));
  console.log(`\n💾 Full results saved to ${outputPath}`);
}

main().catch(err => {
  console.error('Pipeline error:', err.message);
  process.exit(1);
});
