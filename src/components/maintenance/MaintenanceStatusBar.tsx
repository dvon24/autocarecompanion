'use client';

import { MAINTENANCE_SCHEDULES, MaintenanceStatusResult, MaintenanceType, VehicleContext, getApplicableSchedules, type ResolvedSchedule } from '@/lib/maintenance';

interface MaintenanceStatusBarProps {
  type: MaintenanceType;
  status: MaintenanceStatusResult;
  compact?: boolean;
  onGenerateGuide?: () => void;
  isGeneratingGuide?: boolean;
}

/**
 * Visual progress bar showing maintenance status
 * Shows REMAINING life - starts full green, depletes toward red as service approaches
 * Like a fuel gauge: full = just serviced, empty = due now
 */
export function MaintenanceStatusBar({
  type,
  status,
  compact = false,
  onGenerateGuide,
  isGeneratingGuide = false,
}: MaintenanceStatusBarProps) {
  // Calculate REMAINING percentage (100 = just serviced, 0 = due now, <0 = overdue)
  // This creates a "fuel gauge" effect - bar depletes as maintenance approaches
  let remaining = 100;

  if (status.status === 'unknown') {
    remaining = 100; // Show full when unknown
  } else if (status.status === 'overdue') {
    // Overdue: show a small red sliver (10% minimum so it's visible)
    remaining = Math.max(5, 10 - Math.min(10, Math.abs(status.milesUntilDue || 0) / 500));
  } else {
    // Calculate mileage-based remaining
    let mileageRemaining = 100;
    if (status.milesUntilDue !== undefined && status.milesSinceService !== undefined) {
      const totalInterval = (type as ResolvedSchedule).intervalMiles ?? type.defaultIntervalMiles;
      const used = status.milesSinceService;
      mileageRemaining = Math.max(0, 100 - (used / totalInterval) * 100);
    }

    // Calculate time-based remaining
    let timeRemaining = 100;
    if (status.daysSinceService !== undefined) {
      const totalDays = ((type as ResolvedSchedule).intervalMonths ?? type.defaultIntervalMonths) * 30;
      timeRemaining = Math.max(0, 100 - (status.daysSinceService / totalDays) * 100);
    }

    // Use the LOWER remaining (whichever is closer to due)
    remaining = Math.min(mileageRemaining, timeRemaining);
  }

  // Determine color based on remaining: green (plenty left) → orange (running low) → red (empty/overdue)
  const getBarColor = () => {
    if (status.status === 'unknown') return 'bg-gray-300';
    if (status.status === 'overdue') return 'bg-red-500';
    if (remaining >= 30) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const getTextColor = () => {
    if (status.status === 'unknown') return 'text-gray-500';
    if (status.status === 'overdue') return 'text-red-700';
    if (remaining >= 30) return 'text-green-700';
    return 'text-orange-700';
  };

  const getBgColor = () => {
    if (status.status === 'unknown') return 'bg-gray-50';
    if (status.status === 'overdue') return 'bg-red-50';
    if (remaining >= 30) return 'bg-green-50';
    return 'bg-orange-50';
  };

  // Format the status message to include both mileage and time
  const getStatusMessage = () => {
    if (status.status === 'unknown') return status.message;

    const parts: string[] = [];

    if (status.milesSinceService !== undefined) {
      parts.push(`${status.milesSinceService.toLocaleString()} mi`);
    }
    if (status.daysSinceService !== undefined && status.daysSinceService > 0) {
      const months = Math.floor(status.daysSinceService / 30);
      if (months >= 1) {
        parts.push(`${months} mo`);
      } else {
        parts.push(`${status.daysSinceService} days`);
      }
    }

    return parts.length > 0 ? `${parts.join(' / ')} since service` : status.message;
  };

  // Format the due info
  const getDueInfo = () => {
    const parts: string[] = [];

    if (status.milesUntilDue !== undefined && status.milesUntilDue > 0) {
      parts.push(`${status.milesUntilDue.toLocaleString()} mi`);
    }
    if (status.daysUntilDue !== undefined && status.daysUntilDue > 0) {
      const months = Math.floor(status.daysUntilDue / 30);
      if (months >= 1) {
        parts.push(`${months} mo`);
      } else {
        parts.push(`${status.daysUntilDue} days`);
      }
    }

    if (parts.length === 0) {
      if (status.status === 'overdue') return 'Overdue';
      return 'Due';
    }

    return parts.join(' or ');
  };

  if (compact) {
    // Format due at mileage for compact view
    const getDueAtText = () => {
      if (status.status === 'overdue') {
        return `Overdue${status.milesUntilDue ? ` by ${Math.abs(status.milesUntilDue).toLocaleString()} mi` : ''}`;
      }
      if (status.dueAtMileage) {
        return `Due @ ${status.dueAtMileage.toLocaleString()} mi`;
      }
      if (status.milesUntilDue !== undefined && status.milesUntilDue > 0) {
        return `${status.milesUntilDue.toLocaleString()} mi left`;
      }
      return 'Unknown';
    };

    return (
      <div className={`p-2.5 rounded-lg ${getBgColor()} border ${
        status.status === 'overdue' ? 'border-red-200' :
        status.status === 'due_soon' ? 'border-orange-200' :
        'border-gray-100'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs font-medium text-gray-900 truncate">{type.name}</span>
            {status.status === 'overdue' && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 rounded">
                !
              </span>
            )}
          </div>
          {onGenerateGuide && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isGeneratingGuide) onGenerateGuide();
              }}
              disabled={isGeneratingGuide}
              className={`flex-shrink-0 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                isGeneratingGuide
                  ? 'bg-blue-100 text-blue-400 cursor-wait'
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              {isGeneratingGuide ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              ) : (
                'Guide'
              )}
            </button>
          )}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.max(5, remaining)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-medium ${getTextColor()}`}>
            {getDueAtText()}
          </span>
          {status.dueAtDate && status.status !== 'overdue' && (() => {
            const dueDate = new Date(status.dueAtDate);
            const monthsUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
            return monthsUntilDue > 0 ? (
              <span className="text-[10px] text-gray-400">
                or {monthsUntilDue} mo
              </span>
            ) : null;
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl ${getBgColor()} border border-opacity-50 ${
      status.status === 'overdue' ? 'border-red-200' :
      status.status === 'due_soon' ? 'border-orange-200' :
      'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{type.name}</span>
          {status.status === 'overdue' && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
              Overdue
            </span>
          )}
          {status.status === 'due_soon' && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
              Due Soon
            </span>
          )}
        </div>
        {onGenerateGuide && (
          <button
            onClick={() => !isGeneratingGuide && onGenerateGuide()}
            disabled={isGeneratingGuide}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              isGeneratingGuide
                ? 'bg-blue-400 text-white cursor-wait'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isGeneratingGuide ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Get Guide'
            )}
          </button>
        )}
      </div>

      {/* Remaining life bar - depletes as service approaches */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${Math.max(5, remaining)}%` }}
        />
      </div>

      {/* Status text with due at mileage */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{getStatusMessage()}</span>
        <span className={`font-medium ${getTextColor()}`}>
          {status.status === 'overdue'
            ? (status.milesUntilDue ? `Overdue by ${Math.abs(status.milesUntilDue).toLocaleString()} mi` : 'Overdue')
            : status.dueAtMileage
              ? `Due @ ${status.dueAtMileage.toLocaleString()} mi`
              : getDueInfo()
          }
        </span>
      </div>
    </div>
  );
}

interface MaintenanceOverviewProps {
  currentMileage: number | null | undefined;
  annualMileage?: number | null;
  maintenanceRecords: Array<{
    id: string;
    type: string;
    mileage: number;
    date: Date | string;
    nextDueMileage?: number | null;
    nextDueDate?: Date | string | null;
  }>;
  onGenerateGuide?: (type: string) => void;
  showAll?: boolean;
  generatingGuideFor?: string | null;
  isGenerating?: boolean;
  vehicleContext?: VehicleContext;
}

/**
 * Shows the top maintenance items for at-a-glance view
 * Calculates status based on both mileage AND time (whichever comes first)
 */
export function MaintenanceOverview({
  currentMileage,
  annualMileage,
  maintenanceRecords,
  onGenerateGuide,
  showAll = false,
  generatingGuideFor,
  isGenerating = false,
  vehicleContext,
}: MaintenanceOverviewProps) {
  // Convert records to the format expected by the status calculation
  const records = maintenanceRecords.map(r => ({
    ...r,
    date: new Date(r.date),
    nextDueDate: r.nextDueDate ? new Date(r.nextDueDate) : null,
  }));

  // Get applicable schedules for this vehicle, or fall back to defaults
  const applicableSchedules = vehicleContext ? getApplicableSchedules(vehicleContext) : null;

  // Get status for key maintenance items (routine ones for quick view)
  const keyTypes = showAll
    ? (applicableSchedules ? applicableSchedules.map(s => s.id) : Object.keys(MAINTENANCE_SCHEDULES))
    : ['oil_change', 'tire_rotation', 'brake_inspection', 'air_filter'].filter(id =>
        applicableSchedules ? applicableSchedules.some(s => s.id === id) : true
      );

  const statuses = keyTypes.map(typeId => {
    const type = (applicableSchedules?.find(s => s.id === typeId) ?? MAINTENANCE_SCHEDULES[typeId]) as MaintenanceType & { intervalMiles?: number; intervalMonths?: number };
    if (!type) return null;
    const typeRecords = records.filter(r => r.type === typeId);

    // Calculate status considering both mileage AND time
    let status: MaintenanceStatusResult;

    if (!currentMileage) {
      status = { status: 'unknown', message: 'Enter mileage to see status' };
    } else if (typeRecords.length === 0) {
      // No service history - assume due at default interval from 0
      const effectiveIntervalMiles = type.intervalMiles ?? type.defaultIntervalMiles;
      const dueAtMileage = effectiveIntervalMiles;
      const milesUntilDue = dueAtMileage - currentMileage;

      // Estimate when due by time if we have annual mileage
      let estimatedDaysUntilDue: number | undefined;
      if (annualMileage && annualMileage > 0 && milesUntilDue > 0) {
        const milesPerDay = annualMileage / 365;
        estimatedDaysUntilDue = Math.round(milesUntilDue / milesPerDay);
      }

      if (milesUntilDue <= 0) {
        status = {
          status: 'overdue',
          message: `Overdue by ${Math.abs(milesUntilDue).toLocaleString()} miles`,
          milesUntilDue,
          dueAtMileage,
        };
      } else if (milesUntilDue < 500 || (estimatedDaysUntilDue !== undefined && estimatedDaysUntilDue < 30)) {
        status = {
          status: 'due_soon',
          message: `Due in ${milesUntilDue.toLocaleString()} miles`,
          milesUntilDue,
          dueAtMileage,
          daysUntilDue: estimatedDaysUntilDue,
        };
      } else {
        status = {
          status: 'ok',
          message: `Due @ ${dueAtMileage.toLocaleString()} mi`,
          milesUntilDue,
          dueAtMileage,
          milesSinceService: currentMileage, // Assume service at 0
          daysUntilDue: estimatedDaysUntilDue,
        };
      }
    } else {
      // Has service history - calculate based on both mileage AND time
      const lastRecord = typeRecords.sort((a, b) => b.mileage - a.mileage)[0];
      const milesSinceService = currentMileage - lastRecord.mileage;
      const daysSinceService = Math.floor(
        (Date.now() - lastRecord.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Due calculations
      const effectiveIntervalMiles = type.intervalMiles ?? type.defaultIntervalMiles;
      const effectiveIntervalMonths = type.intervalMonths ?? type.defaultIntervalMonths;
      const dueAtMileage = lastRecord.nextDueMileage ?? lastRecord.mileage + effectiveIntervalMiles;
      const milesUntilDue = dueAtMileage - currentMileage;

      // Time-based due date
      const dueAtDate = lastRecord.nextDueDate
        ? new Date(lastRecord.nextDueDate)
        : new Date(lastRecord.date.getTime() + effectiveIntervalMonths * 30 * 24 * 60 * 60 * 1000);
      const daysUntilDue = Math.floor((dueAtDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      // Determine status: overdue if EITHER condition is met
      const isMileageOverdue = milesUntilDue <= 0;
      const isTimeOverdue = daysUntilDue <= 0;
      const isMileageDueSoon = milesUntilDue < 500;
      const isTimeDueSoon = daysUntilDue < 30;

      if (isMileageOverdue || isTimeOverdue) {
        const messageParts: string[] = [];
        if (isMileageOverdue) {
          messageParts.push(`${Math.abs(milesUntilDue).toLocaleString()} miles`);
        }
        if (isTimeOverdue) {
          messageParts.push(`${Math.abs(daysUntilDue)} days`);
        }

        status = {
          status: 'overdue',
          message: `Overdue by ${messageParts.join(' and ')}`,
          milesSinceService,
          daysSinceService,
          milesUntilDue,
          daysUntilDue,
          dueAtMileage,
          dueAtDate,
        };
      } else if (isMileageDueSoon || isTimeDueSoon) {
        const messageParts: string[] = [];
        if (isMileageDueSoon) {
          messageParts.push(`${milesUntilDue.toLocaleString()} miles`);
        }
        if (isTimeDueSoon) {
          messageParts.push(`${daysUntilDue} days`);
        }

        status = {
          status: 'due_soon',
          message: `Due in ${messageParts.join(' or ')}`,
          milesSinceService,
          daysSinceService,
          milesUntilDue,
          daysUntilDue,
          dueAtMileage,
          dueAtDate,
        };
      } else {
        status = {
          status: 'ok',
          message: `Due @ ${dueAtMileage.toLocaleString()} mi`,
          milesSinceService,
          daysSinceService,
          milesUntilDue,
          daysUntilDue,
          dueAtMileage,
          dueAtDate,
        };
      }
    }

    return { type, status };
  }).filter((s): s is { type: MaintenanceType & { intervalMiles?: number; intervalMonths?: number }; status: MaintenanceStatusResult } => s !== null);

  // Sort by urgency (overdue first, then due_soon, then by whichever is closer: miles or days)
  const sortedStatuses = [...statuses].sort((a, b) => {
    const statusOrder = { overdue: 0, due_soon: 1, ok: 2, unknown: 3 };
    const aOrder = statusOrder[a.status.status];
    const bOrder = statusOrder[b.status.status];
    if (aOrder !== bOrder) return aOrder - bOrder;

    // For same status, compare by the closer due metric (normalized)
    const aIntervalMiles = a.type.intervalMiles ?? a.type.defaultIntervalMiles;
    const aIntervalMonths = a.type.intervalMonths ?? a.type.defaultIntervalMonths;
    const bIntervalMiles = b.type.intervalMiles ?? b.type.defaultIntervalMiles;
    const bIntervalMonths = b.type.intervalMonths ?? b.type.defaultIntervalMonths;
    const aProgress = Math.max(
      (a.status.milesSinceService ?? 0) / aIntervalMiles,
      (a.status.daysSinceService ?? 0) / (aIntervalMonths * 30)
    );
    const bProgress = Math.max(
      (b.status.milesSinceService ?? 0) / bIntervalMiles,
      (b.status.daysSinceService ?? 0) / (bIntervalMonths * 30)
    );

    return bProgress - aProgress; // Higher progress = more urgent
  });

  if (!currentMileage) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Enter your current mileage to see maintenance status
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedStatuses.map(({ type, status }) => (
        <MaintenanceStatusBar
          key={type.id}
          type={type}
          status={status}
          compact={!showAll}
          onGenerateGuide={onGenerateGuide ? () => onGenerateGuide(type.id) : undefined}
          isGeneratingGuide={isGenerating && generatingGuideFor === type.id}
        />
      ))}
    </div>
  );
}
