'use client';

import type { CSSProperties } from 'react';
import type { TwinEvidenceStatus } from '@/lib/vehicle-twin-catalog';
import { Icon, type IconName } from './Icon';

export type TwinMarkerEvidence = {
  status?: TwinEvidenceStatus;
  risk?: boolean;
  knownIssue?: boolean;
  unavailable?: boolean;
  unlogged?: boolean;
};

export type TwinMarkerVisual = {
  icon: IconName;
  edge: string;
  fill: string;
  glow: string;
  ink: string;
  sub: string;
  line: string;
};

export const TWIN_MARKER_VISUALS: Record<TwinEvidenceStatus, TwinMarkerVisual> = {
  'known-issue': {icon:'shield-alert',edge:'#A78BFA',fill:'rgba(139,92,246,.2)',glow:'rgba(139,92,246,.7)',ink:'#EDE4FF',sub:'#C9B6FF',line:'rgba(167,139,250,.5)'},
  overdue: {icon:'alert',edge:'#FF6B63',fill:'rgba(255,107,99,.16)',glow:'rgba(255,107,99,.7)',ink:'#FFD9D6',sub:'#FF9C96',line:'rgba(255,107,99,.5)'},
  'on-track': {icon:'check',edge:'#35D69B',fill:'rgba(53,214,155,.16)',glow:'rgba(53,214,155,.6)',ink:'#D8FFF0',sub:'#7FE9C4',line:'rgba(53,214,155,.45)'},
  unavailable: {icon:'minus',edge:'#94A3B8',fill:'rgba(148,163,184,.14)',glow:'rgba(148,163,184,.3)',ink:'#E2E8F0',sub:'#CBD5E1',line:'rgba(148,163,184,.4)'},
  unlogged: {icon:'minus',edge:'#94A3B8',fill:'rgba(148,163,184,.14)',glow:'rgba(148,163,184,.3)',ink:'#E2E8F0',sub:'#CBD5E1',line:'rgba(148,163,184,.4)'},
};

export function resolveTwinMarkerVisual(evidence: TwinMarkerEvidence): TwinMarkerVisual {
  if (evidence.knownIssue || evidence.status === 'known-issue') return TWIN_MARKER_VISUALS['known-issue'];
  if (evidence.risk || evidence.status === 'overdue') return TWIN_MARKER_VISUALS.overdue;
  if (evidence.unavailable || evidence.status === 'unavailable') return TWIN_MARKER_VISUALS.unavailable;
  if (evidence.unlogged || evidence.status === 'unlogged') return TWIN_MARKER_VISUALS.unlogged;
  return TWIN_MARKER_VISUALS['on-track'];
}

export function TwinMarkerDot({evidence,size=44,active=false,className,style}:{evidence:TwinMarkerEvidence;size?:number;active?:boolean;className?:string;style?:CSSProperties}) {
  const visual = resolveTwinMarkerVisual(evidence);
  return <span className={className} data-marker-status={evidence.knownIssue || evidence.status === 'known-issue' ? 'known-issue' : evidence.risk || evidence.status === 'overdue' ? 'overdue' : evidence.status || 'on-track'} style={{display:'grid',placeItems:'center',width:size,height:size,borderRadius:'50%',border:`2px solid ${visual.edge}`,background:visual.fill,boxShadow:`0 0 ${active?26:14}px ${visual.glow}`,transform:active?'scale(1.14)':'scale(1)',transition:'transform .22s ease, background-color .22s ease, border-color .22s ease',color:visual.ink,...style}}>
    <Icon name={visual.icon} size={Math.round(size*.43)} stroke={visual.icon==='check'?2.6:2}/>
  </span>;
}
