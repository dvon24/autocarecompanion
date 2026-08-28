import { isRecordBody } from '@/lib/maintenance-mutation';

export type CommittedGarageAction = { tool: string; result: string };

export function committedGarageActionFallback(actions: readonly CommittedGarageAction[]): string {
  const results = actions.map((action) => action.result.trim()).filter(Boolean);
  return results.length > 0
    ? results.join('\n')
    : 'Your garage updates were saved successfully.';
}

export function resolveCommittedGarageActionMessage(
  followUp: unknown,
  actions: readonly CommittedGarageAction[],
): string {
  if (isRecordBody(followUp) && Array.isArray(followUp.choices)) {
    const first = followUp.choices[0];
    if (isRecordBody(first) && isRecordBody(first.message)
      && typeof first.message.content === 'string' && first.message.content.trim()) {
      return first.message.content;
    }
  }
  return committedGarageActionFallback(actions);
}
