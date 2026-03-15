import { IssueCategory } from '@/schemas/knownIssue.schema';

export const categoryConfig: Record<IssueCategory, { label: string; icon: string }> = {
  engine: { label: 'Engine', icon: '\u2699\uFE0F' },
  transmission: { label: 'Transmission', icon: '\uD83D\uDD04' },
  drivetrain: { label: 'Drivetrain', icon: '\uD83D\uDD17' },
  electrical: { label: 'Electrical', icon: '\u26A1' },
  brakes: { label: 'Brakes', icon: '\uD83D\uDED1' },
  suspension: { label: 'Suspension', icon: '\uD83D\uDD27' },
  cooling: { label: 'Cooling', icon: '\u2744\uFE0F' },
  fuel: { label: 'Fuel System', icon: '\u26FD' },
  interior: { label: 'Interior', icon: '\uD83E\uDE91' },
  exterior: { label: 'Exterior', icon: '\uD83D\uDE97' },
  body: { label: 'Body/Panels', icon: '\uD83D\uDE99' },
  safety: { label: 'Safety/Recalls', icon: '\uD83D\uDEE1\uFE0F' },
  exhaust: { label: 'Exhaust', icon: '\uD83D\uDCA8' },
  steering: { label: 'Steering', icon: '\u2B55' },
  hvac: { label: 'HVAC', icon: '\uD83C\uDF21\uFE0F' },
  emissions: { label: 'Emissions', icon: '\uD83C\uDF3F' },
  other: { label: 'Other', icon: '\uD83D\uDCCB' },
};
