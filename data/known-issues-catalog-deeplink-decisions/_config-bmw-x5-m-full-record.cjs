const { buildConfig } = require('./_config-bmw-remaining-factory.cjs');

module.exports = buildConfig({
  label: "BMW X5 M",
  model: "X5 M",
  slug: "bmw-x5-m",
  batchId: "bmw-x5-m-full-record-cohort-31-2026-07-31",
  auditDate: "2026-07-31",
  snapshotHash: "67719c2badacd3c12ed2b6926d4cec9553de12ca479dfdfa21249e179df0f537",
  sourceSnapshotFileHash: "2cd48c6a60fa0a6cdb40a797dd31baab5ae843ca6e1774667b60cd62d74ad831",
  packetFileHash: "b316e84a94669876f9aae7a8314ce688545de654e8de4a9b703f5dea633a6138",
  packetRelativePath: "data/known-issues-catalog-deeplink-work/bmw-x5-m/67719c2badac/all-0001.json",
  reviewTokens: { blind: "bmwx5m_blind:self-no-blocker", edge: "bmwx5m_edge:self-no-blocker" },
  reasons: {
    "bmw-x5m-brake-system-2010":
      "The card combines three generations, driver use and fixed wear intervals, prices and upgrade brands without a BMW-defined defect or measurement threshold.",
    "bmw-x5m-s63-rod-bearing-2010":
      "M5 and owner-forum discussions do not establish an X5 M production-bounded rod-bearing defect, preventive interval or universal repair.",
    "bmw-x5m-s63-turbo-coolant-line-2010":
      "The card assigns a single plastic fitting and aftermarket upgrade to a broad owner-reported leak condition without an exact BMW E70 bulletin or repair boundary.",
    "bmw-x5m-s63-wastegate-rattle-2010":
      "A forum cannot distinguish vacuum control, actuator, turbocharger or exhaust noise or support universal turbo replacement across E70 and F85.",
    "bmw-x5m-transfer-case-actuator-2010":
      "The card spans three different transfer-case generations and converts warning symptoms into actuator failure and named-parts advice without primary evidence.",
  },
  proposalCampaigns: [
  "19V017000",
  "18V248000",
  "20V016000",
  "20V017000",
  "16V364000",
  "18V030000",
  "16V746000",
  "17V138000",
  "16V311000",
  "17V020000",
  "17V327000",
  "21V096000",
  "21V062000",
  "22V267000",
  "20V528000",
  "20V678000",
  "21V031000",
  "23V253000",
  "23V821000"
],
});
