import type { TIssue } from '@/lib/i18n';
import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { getBMWAuditedModel } from '@/lib/known-issues-audit-registry';

interface LocalizedAuditView {
  issues: TIssue[];
  intro: string | null;
  auditedOn: string | null;
  usesCurrentEnglishIssueCopy: boolean;
}

const BMW_AUDIT_COPY: Record<string, (vehicle: string, issueCount: number) => string> = {
  'pt-br': (vehicle, issueCount) => issueCount === 0
    ? `A auditoria de evidências mais recente não manteve nenhum cartão de problema verificado para o ${vehicle}. A página continua disponível como referência; confirme recalls pelo VIN e faça um diagnóstico antes de comprar peças.`
    : `Esta página foi conciliada com a auditoria de evidências mais recente do ${vehicle}. Os ${issueCount} registros abaixo usam o texto atual da auditoria em inglês enquanto a tradução é revalidada.`,
  es: (vehicle, issueCount) => issueCount === 0
    ? `La auditoría de evidencias más reciente no conservó ninguna ficha de problema verificada para el ${vehicle}. La página sigue disponible como referencia; comprueba las llamadas a revisión por VIN y realiza un diagnóstico antes de comprar piezas.`
    : `Esta página se concilió con la auditoría de evidencias más reciente del ${vehicle}. Los ${issueCount} registros siguientes usan el texto actual de la auditoría en inglés mientras se revalida la traducción.`,
  de: (vehicle, issueCount) => issueCount === 0
    ? `Die jüngste Evidenzprüfung hat für den ${vehicle} keine verifizierte Problemkarte beibehalten. Diese Seite bleibt als Referenz verfügbar; prüfen Sie Rückrufe anhand der VIN und lassen Sie das Fahrzeug diagnostizieren, bevor Sie Teile kaufen.`
    : `Diese Seite wurde mit der jüngsten Evidenzprüfung des ${vehicle} abgeglichen. Die folgenden ${issueCount} Einträge verwenden den aktuellen englischen Prüftext, während die Übersetzung erneut validiert wird.`,
  fr: (vehicle, issueCount) => issueCount === 0
    ? `Le dernier audit des preuves n'a conservé aucune fiche de problème vérifiée pour la ${vehicle}. Cette page reste disponible comme référence ; vérifiez les rappels avec le VIN et faites établir un diagnostic avant d'acheter des pièces.`
    : `Cette page a été rapprochée du dernier audit des preuves de la ${vehicle}. Les ${issueCount} fiches ci-dessous utilisent le texte d'audit anglais actuel pendant la nouvelle validation de la traduction.`,
  ko: (vehicle, issueCount) => issueCount === 0
    ? `최신 근거 감사에서는 ${vehicle}에 대해 검증된 문제 카드를 유지하지 않았습니다. 이 페이지는 참고용으로 유지되며, 부품을 구매하기 전에 VIN으로 리콜을 확인하고 정확한 진단을 받으세요.`
    : `이 페이지는 ${vehicle}의 최신 근거 감사 결과와 일치하도록 갱신되었습니다. 번역을 다시 검증하는 동안 아래 ${issueCount}개 항목에는 현재 영어 감사 문구가 표시됩니다.`,
};

function canonicalIssueToLocalizedShape(issue: KnownIssue): TIssue {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    solution: issue.solution,
    symptoms: issue.symptoms,
    severity: issue.severity,
    category: issue.category,
    costLow: issue.estimatedCost?.low ?? null,
    costHigh: issue.estimatedCost?.high ?? null,
    dtcCodes: issue.dtcCodes ?? [],
    reportCount: issue.reportCount,
  };
}

export function reconcileLocalizedBMWIssues(
  locale: string,
  slug: string,
  vehicle: string,
  translatedIssues: readonly TIssue[],
  currentPublishedIssues: readonly KnownIssue[],
): LocalizedAuditView {
  const audit = getBMWAuditedModel(slug);
  if (!audit) {
    return {
      issues: [...translatedIssues],
      intro: null,
      auditedOn: null,
      usesCurrentEnglishIssueCopy: false,
    };
  }

  if (audit.expectedPublishedCount > 0 && currentPublishedIssues.length === 0) {
    throw new Error(
      `${slug} audit expected published issue cards but the localized route received none.`,
    );
  }

  const issues = currentPublishedIssues.map(canonicalIssueToLocalizedShape);
  const copy = BMW_AUDIT_COPY[locale] ?? BMW_AUDIT_COPY.es;
  return {
    issues,
    intro: copy(vehicle, issues.length),
    auditedOn: audit.auditedOn,
    usesCurrentEnglishIssueCopy: issues.length > 0,
  };
}
