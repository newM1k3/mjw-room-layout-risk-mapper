import { LayoutProject, LayoutZone, LayoutElement, RiskReport } from '../types';

export function buildExportJson(
  project: LayoutProject,
  zones: LayoutZone[],
  elements: LayoutElement[],
  report: RiskReport | null,
): string {
  const payload = {
    version: '1.0',
    project,
    layout: {
      width: project.roomWidth,
      height: project.roomHeight,
      unit: project.unit,
      zones,
      elements,
    },
    riskReport: report,
    integrationHints: {
      puzzleFlowVisualizer: 'Import zones and risk levels to overlay physical risk warnings onto the flow diagram.',
      lockMapStudio: 'Import elements of type "lock" to cross-reference lock placement density and reset logistics.',
      puzzleDependencyAuditor: 'Import high-importance puzzle_station elements to flag physical risk at critical dependency nodes.',
      maintenanceLog: 'Import staff_access conflict issues to create recurring pre-game reset checklist items.',
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function buildMarkdownReport(
  project: LayoutProject,
  zones: LayoutZone[],
  elements: LayoutElement[],
  report: RiskReport,
): string {
  const lines: string[] = [];
  lines.push(`# Room Layout Risk Report: ${project.title}`);
  lines.push('');
  lines.push(`**Theme:** ${project.theme}  `);
  lines.push(`**Room Type:** ${project.roomType.replace('_', ' ')}  `);
  lines.push(`**Players:** ${project.targetPlayerCount}  `);
  lines.push(`**Duration:** ${project.durationMinutes} min  `);
  lines.push(`**Build Stage:** ${project.buildStage.replace('_', ' ')}  `);
  lines.push(`**Room Size:** ${project.roomWidth} x ${project.roomHeight} ${project.unit}  `);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`## Risk Score: ${report.score} / 100 — ${report.label}`);
  lines.push('');
  lines.push(`- Critical issues: ${report.criticalCount}`);
  lines.push(`- Warnings: ${report.warningCount}`);
  lines.push(`- Improvements: ${report.improvementCount}`);
  lines.push('');

  if (elements.length > 0) {
    lines.push('## Layout Inventory');
    lines.push('');
    lines.push(`- Total mapped elements: ${elements.length}`);
    const elementTypeCounts = elements.reduce<Record<string, number>>((counts, element) => {
      counts[element.type] = (counts[element.type] ?? 0) + 1;
      return counts;
    }, {});
    Object.entries(elementTypeCounts).forEach(([type, count]) => {
      lines.push(`- ${type.replace('_', ' ')}: ${count}`);
    });
    lines.push('');
  }

  if (report.issues.length > 0) {
    lines.push('## Issues');
    lines.push('');
    report.issues.forEach((issue) => {
      const badge = issue.severity.toUpperCase();
      lines.push(`### [${badge}] ${issue.title}`);
      lines.push(`**Category:** ${issue.category}  `);
      if (issue.affectedZoneIds.length > 0) {
        const zoneLabels = issue.affectedZoneIds
          .map((id) => zones.find((z) => z.id === id)?.label || id)
          .join(', ');
        lines.push(`**Affected Zones:** ${zoneLabels}  `);
      }
      lines.push('');
      lines.push(issue.explanation);
      lines.push('');
      lines.push(`**Suggested Fix:** ${issue.suggestedFix}`);
      lines.push('');
    });
  }

  if (report.cleanChecks.length > 0) {
    lines.push('## Clean Checks');
    lines.push('');
    report.cleanChecks.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('> **Disclaimer:** This report provides design-risk guidance only. It is not a substitute for local safety codes, accessibility review, professional inspection, insurance requirements, or emergency planning.');
  lines.push('');
  lines.push(`*Generated: ${new Date().toLocaleString()}*`);

  return lines.join('\n');
}
