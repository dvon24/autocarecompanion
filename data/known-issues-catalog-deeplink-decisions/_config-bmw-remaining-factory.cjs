const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');
const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const recallCorpus =
  'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip';

function array(value) {
  return Array.isArray(value) ? value : [];
}

function rawClaims(record) {
  const commerceUrlFields = [
    'affiliateUrl',
    'affiliateLink',
    'amazonLink',
  ];
  const claims = array(record.fixParts).map((part, index) => ({
    claimId: `fixParts:${index}`,
    urls: array(part && part.buyLinks).map((link) => link.url || ''),
  }));
  array(record.communityRecommendations).forEach(
    (recommendation, index) => {
      if (
        !recommendation ||
        (recommendation.type !== 'part' &&
          !commerceUrlFields.some(
            (field) =>
              typeof recommendation[field] === 'string' &&
              recommendation[field].trim(),
          ))
      ) {
        return;
      }
      claims.push({
        claimId: `communityRecommendations:${index}`,
        urls: commerceUrlFields.flatMap((field) =>
          typeof recommendation[field] === 'string' &&
          recommendation[field].trim()
            ? [recommendation[field]]
            : [],
        ),
      });
    },
  );
  return claims;
}

function archiveRecord(label, record, reason) {
  const claims = rawClaims(record);
  const claimCount = claims.length;
  const urlCount = claims.reduce(
    (sum, claim) => sum + claim.urls.length,
    0,
  );
  const auditReason =
    reason ||
    'Current BMW/NHTSA primary-source research does not establish the frozen card\'s complete year population, single failure mechanism, diagnosis and remedy. The prior citations and owner/aftermarket material cannot support a universal parts recommendation.';
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${record.title}" aggregation. ${auditReason} Remove all ${claimCount} commerce claims and ${urlCount} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Data Corpus',
        url: communicationsCorpus,
      },
    ],
    after: {
      years: record.years,
      trims: [],
      engines: [],
      category: record.category,
      title: `Archived - ${record.title}`,
      description: `The former ${label} card asserted "${record.title}" across the listed population. ${auditReason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the VIN, model year, production date, engine, drivetrain, equipment, symptoms, DTCs, software level, modifications, open recalls and current BMW service information before diagnosis.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Data Corpus',
          url: communicationsCorpus,
        },
      ],
      summary: `Archived the unsupported ${label} "${record.title}" aggregation and removed ${claimCount} commerce claims with ${urlCount} URLs.`,
    },
  };
}

function assertKnownOverrideIds(expectedIds, overrides, overrideLabel) {
  const expected = new Set(expectedIds);
  const unknown = Object.keys(overrides || {}).filter((id) => !expected.has(id));
  if (unknown.length > 0) {
    throw new Error(
      `${overrideLabel} contains unknown packet IDs: ${unknown.sort().join(', ')}`,
    );
  }
}

function buildConfig(options) {
  const packetPath = path.join(projectRoot, options.packetRelativePath);
  const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
  const expectedIds = packet.records.map((record) => record.id);
  assertKnownOverrideIds(expectedIds, options.published, `${options.label} published overrides`);
  assertKnownOverrideIds(expectedIds, options.reasons, `${options.label} archive reasons`);
  const records = Object.fromEntries(
    packet.records.map((record) => [
      record.id,
      options.published && options.published[record.id]
        ? options.published[record.id]
        : archiveRecord(
            options.label,
            record,
            options.reasons && options.reasons[record.id],
          ),
    ]),
  );
  const expectedPerRecord = Object.fromEntries(
    packet.records.map((record) => {
      const claims = rawClaims(record);
      return [
        record.id,
        {
          claimIds: claims.map((claim) => claim.claimId),
          urls: claims.flatMap((claim) => claim.urls),
          claimClicks: array(record.claims).reduce(
            (sum, claim) => sum + (Number(claim.clicks) || 0),
            0,
          ),
          recordClicks: Number(record.clicks) || 0,
          priorityClicks: Number(record.priorityClicks) || 0,
        },
      ];
    }),
  );
  const expectedTelemetry = {
    claimCount: packet.records.reduce(
      (sum, record) => sum + rawClaims(record).length,
      0,
    ),
    urlCount: packet.records.reduce(
      (sum, record) =>
        sum +
        rawClaims(record).reduce(
          (claimSum, claim) => claimSum + claim.urls.length,
          0,
        ),
      0,
    ),
    claimClickCount: packet.records.reduce(
      (sum, record) =>
        sum +
        array(record.claims).reduce(
          (claimSum, claim) =>
            claimSum + (Number(claim.clicks) || 0),
          0,
        ),
      0,
    ),
    recordClickCount: packet.records.reduce(
      (sum, record) => sum + (Number(record.clicks) || 0),
      0,
    ),
    priorityClickCount: packet.records.reduce(
      (sum, record) => sum + (Number(record.priorityClicks) || 0),
      0,
    ),
  };
  const dispositionOrder = [
    'keep',
    'replace',
    'remove',
    'recall-dealer',
    'diagnosis-hold',
    'no-commerce',
  ];
  const expectedDispositionCounts = Object.fromEntries(
    dispositionOrder.flatMap((disposition) => {
      const count = Object.values(records).filter(
        (record) => record.disposition === disposition,
      ).length;
      return count > 0 ? [[disposition, count]] : [];
    }),
  );
  const controlledDeltaProposals = array(
    options.proposalCampaigns,
  ).map((campaign) => ({
    disposition: 'proposal-only',
    insert: false,
    title: `${options.slug}-recall-${campaign.toLowerCase()}`,
    sources: [recallCorpus],
  }));
  const config = {
    label: options.label,
    make: 'BMW',
    model: options.model,
    batchId: options.batchId,
    auditDate: options.auditDate,
    snapshotHash: options.snapshotHash,
    sourceSnapshotFileHash: options.sourceSnapshotFileHash,
    packetFileHash: options.packetFileHash,
    packetRelativePath: options.packetRelativePath,
    reviewTokens: options.reviewTokens,
    expectedIds,
    expectedPerRecord,
    records,
    expectedTelemetry,
    expectedDispositionCounts,
    expectedPublished: Object.values(records).filter(
      (record) => record.disposition !== 'remove',
    ).length,
    expectedArchived: Object.values(records).filter(
      (record) => record.disposition === 'remove',
    ).length,
    controlledDeltaProposals,
    expectedProposalIdentities: controlledDeltaProposals.map(
      (proposal) =>
        `${proposal.title}::${proposal.sources.join('|')}`,
    ),
  };
  config.assertReviewedAfterState = function assertReviewedAfterState(
    issues,
  ) {
    if (
      issues.length !== expectedIds.length ||
      issues.some(
        (issue) =>
          issue.after.status !==
            (records[issue.id].disposition === 'remove'
              ? 'archived'
              : 'published') ||
          issue.after.fixParts.length !== 0 ||
          issue.after.communityRecommendations.length !== 0,
      )
    ) {
      throw new Error(
        `${options.label} reviewed status or zero-commerce outcome drifted.`,
      );
    }
  };
  return config;
}

module.exports = { assertKnownOverrideIds, buildConfig };
