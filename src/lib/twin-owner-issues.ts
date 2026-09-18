import { buildTwinIssueSummary, type TwinIssueRow } from './twin-known-issues';
import { confirmedOwnerEquipment, type EquipmentVehicle } from './twin-owner-equipment';
import { XT6_OWNER_ISSUE_NODES } from './twin-owner-issue-nodes';
import { reviewedKnownIssueTwinCopy } from './known-issue-twin-copy';
import { KNOWN_ISSUE_TWIN_VISUALS } from './known-issue-twin-visuals';
import { siblingDiagnosticFluid } from './known-issue-twin-reviewed-parts';
import { getKnownIssueCommerce } from './known-issue-commerce';

/** A bounded owner view, not a rewrite of the published historical record. */
export function buildOwnerTwinIssueSummary(issue:TwinIssueRow, vehicle:EquipmentVehicle) {
  const summary=buildTwinIssueSummary(issue);
  const source = {...issue, vehicleMatch: Array.isArray(issue.years) && Array.isArray(issue.trims) && Array.isArray(issue.engines)
    ? {years:issue.years,trims:issue.trims,engines:issue.engines} : undefined};
  if(confirmedOwnerEquipment(vehicle)?.id==='xt6-2020-36l-awd-20-v1'&&XT6_OWNER_ISSUE_NODES.some(node=>node.id===issue.id)){
    const copy=reviewedKnownIssueTwinCopy(source);
    return {...summary,description:copy?.reviewedMechanism||'This published record changed after the exact XT6 diagnostic review. Confirm VIN, build and optional equipment with a qualified technician before applying it.',
      solution:copy?.reviewedAction?copy.reviewedAction+' Sources: '+copy.sourceCitations?.join(' '):'The full published record remains linked for context; a current equipment-specific diagnostic review is required before recommending work.',fixParts:[]};
  }
  const profile=confirmedOwnerEquipment(vehicle);
  const qualifiedIds=[
    'acura-mdx-auto-idle-stop-failure-to-restart','acura-mdx-torque-converter-shudder-2014',
    'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',
    'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',
    'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne',
  ];
  if(!profile || !qualifiedIds.includes(issue.id)) return summary;
  const definition=KNOWN_ISSUE_TWIN_VISUALS.find(row=>row.equipmentId===profile.id && row.mappings[issue.id]);
  if(!definition || issue.make.toLowerCase()!==profile.make.toLowerCase() || issue.model.toLowerCase()!==profile.model.toLowerCase()) return summary;
  const copy=reviewedKnownIssueTwinCopy(source);
  const fluid=copy&&siblingDiagnosticFluid(source,definition);
  return {...summary,
    description:copy?.reviewedMechanism || 'This published record changed after the equipment-specific review. Confirm the current source and exact vehicle before applying its advice.',
    solution:copy?.reviewedAction || 'The full published record remains linked for context; a current equipment-specific diagnostic review is required before recommending work.',
    fixParts:fluid?getKnownIssueCommerce({fixParts:[fluid],communityRecommendations:[]}).fixParts:[],
  };
}
