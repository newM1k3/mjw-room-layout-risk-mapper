import {
  LayoutProject,
  LayoutZone,
  LayoutElement,
  RiskReport,
  RiskIssue,
  Severity,
} from '../types';

function rectOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function rectProximity(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  threshold: number,
): boolean {
  const ax2 = ax + aw, ay2 = ay + ah;
  const bx2 = bx + bw, by2 = by + bh;
  const dx = Math.max(0, Math.max(ax, bx) - Math.min(ax2, bx2));
  const dy = Math.max(0, Math.max(ay, by) - Math.min(ay2, by2));
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Low Layout Risk';
  if (score >= 70) return 'Usable With Revisions';
  if (score >= 40) return 'High Risk Layout';
  return 'Not Ready for Build Review';
}

export function runLayoutRiskAudit(
  project: LayoutProject,
  zones: LayoutZone[],
  elements: LayoutElement[],
): RiskReport {
  const issues: RiskIssue[] = [];
  const cleanChecks: string[] = [];
  let idCounter = 0;
  const nextId = () => `risk_${++idCounter}`;

  const PROX = 2; // feet/meters proximity threshold

  // -- 1. Overcrowded zone --
  zones.forEach((zone) => {
    const area = zone.width * zone.height;
    const sqPerPlayer = area / Math.max(zone.expectedPlayerLoad, 1);
    const highIntensityCount = elements.filter(
      (e) => e.zoneId === zone.id && e.interactionIntensity === 'high' && e.type === 'puzzle_station',
    ).length;

    if (zone.expectedPlayerLoad >= project.targetPlayerCount && sqPerPlayer < 10) {
      issues.push({
        id: nextId(),
        severity: 'critical',
        category: 'Crowding',
        title: `Overcrowded zone: ${zone.label}`,
        affectedZoneIds: [zone.id],
        affectedElementIds: [],
        explanation: `Zone "${zone.label}" expects ${zone.expectedPlayerLoad} players but only has ${area.toFixed(0)} sq ${project.unit} (${sqPerPlayer.toFixed(1)} per player). Practical minimum is ~10 sq ${project.unit} per player.`,
        suggestedFix: 'Reduce expected player load, enlarge the zone, or split puzzle interactions across multiple areas.',
      });
    } else if (sqPerPlayer < 14 && zone.expectedPlayerLoad > 2) {
      issues.push({
        id: nextId(),
        severity: 'warning',
        category: 'Crowding',
        title: `Tight spacing in zone: ${zone.label}`,
        affectedZoneIds: [zone.id],
        affectedElementIds: [],
        explanation: `Zone "${zone.label}" has ${sqPerPlayer.toFixed(1)} sq ${project.unit} per expected player, which may feel cramped.`,
        suggestedFix: 'Consider widening the zone or staggering player interactions across sub-areas.',
      });
    }

    if (highIntensityCount >= 3) {
      issues.push({
        id: nextId(),
        severity: 'warning',
        category: 'Prop Density',
        title: `High-intensity station concentration in: ${zone.label}`,
        affectedZoneIds: [zone.id],
        affectedElementIds: elements.filter((e) => e.zoneId === zone.id && e.interactionIntensity === 'high').map((e) => e.id),
        explanation: `Zone "${zone.label}" has ${highIntensityCount} high-intensity puzzle stations. Players will compete for access.`,
        suggestedFix: 'Distribute puzzle stations across different zones or reduce the interaction intensity of secondary stations.',
      });
    }
  });
  if (!issues.some((i) => i.category === 'Crowding')) {
    cleanChecks.push('No critically overcrowded zones detected.');
  }

  // -- 2. Doorway congestion --
  const doors = elements.filter((e) => e.type === 'door' || e.type === 'exit');
  const highElements = elements.filter((e) => e.interactionIntensity === 'high');
  doors.forEach((door) => {
    highElements.forEach((he) => {
      if (he.id === door.id) return;
      if (rectProximity(door.x, door.y, door.width, door.height, he.x, he.y, he.width, he.height, PROX)) {
        issues.push({
          id: nextId(),
          severity: 'warning',
          category: 'Doorway Congestion',
          title: `High-interaction element near door: ${he.label}`,
          affectedZoneIds: [he.zoneId, door.zoneId].filter(Boolean) as string[],
          affectedElementIds: [door.id, he.id],
          explanation: `"${he.label}" (high interaction) is very close to "${door.label}". Players will crowd around the interaction point while others try to move through the doorway.`,
          suggestedFix: `Move "${he.label}" at least 3 ${project.unit} away from the doorway, or relocate the puzzle to a corner with clear circulation space.`,
        });
      }
    });
  });
  if (!issues.some((i) => i.category === 'Doorway Congestion')) {
    cleanChecks.push('No doorway congestion risks detected.');
  }

  // -- 3. Exit obstruction --
  const exits = elements.filter((e) => e.type === 'exit');
  const blockers = elements.filter((e) =>
    ['prop', 'puzzle_station', 'scenic_blocker', 'lock'].includes(e.type),
  );
  exits.forEach((exit) => {
    blockers.forEach((blocker) => {
      if (rectOverlap(exit.x, exit.y, exit.width, exit.height, blocker.x, blocker.y, blocker.width, blocker.height)) {
        issues.push({
          id: nextId(),
          severity: 'critical',
          category: 'Exit Obstruction',
          title: `Exit obstructed by: ${blocker.label}`,
          affectedZoneIds: [exit.zoneId, blocker.zoneId].filter(Boolean) as string[],
          affectedElementIds: [exit.id, blocker.id],
          explanation: `"${blocker.label}" overlaps or directly blocks exit "${exit.label}". This is a safety concern that must be resolved.`,
          suggestedFix: `Remove or reposition "${blocker.label}" so the exit path is fully clear at all times. Exits must remain unobstructed.`,
        });
      } else if (rectProximity(exit.x, exit.y, exit.width, exit.height, blocker.x, blocker.y, blocker.width, blocker.height, PROX)) {
        issues.push({
          id: nextId(),
          severity: 'warning',
          category: 'Exit Obstruction',
          title: `Element crowding exit: ${blocker.label}`,
          affectedZoneIds: [exit.zoneId, blocker.zoneId].filter(Boolean) as string[],
          affectedElementIds: [exit.id, blocker.id],
          explanation: `"${blocker.label}" is positioned very close to exit "${exit.label}", which may impede egress during high-stress moments.`,
          suggestedFix: `Increase clearance around "${exit.label}" to at least 3 ${project.unit}.`,
        });
      }
    });
  });
  if (exits.length === 0) {
    issues.push({
      id: nextId(),
      severity: 'critical',
      category: 'Exit Obstruction',
      title: 'No exit element placed on canvas',
      affectedZoneIds: [],
      affectedElementIds: [],
      explanation: 'No exit has been added to the layout. Every escape room must have at least one clearly marked emergency exit.',
      suggestedFix: 'Add an exit element and ensure it is unobstructed.',
    });
  } else if (!issues.some((i) => i.category === 'Exit Obstruction')) {
    cleanChecks.push('Exit path appears clear of direct obstructions.');
  }

  // -- 4. Staff access conflict --
  const staffElements = elements.filter((e) => e.type === 'staff_access' || e.type === 'reset_path');
  const playerHigh = elements.filter((e) =>
    ['puzzle_station', 'lock', 'clue'].includes(e.type) && e.interactionIntensity !== 'low',
  );
  staffElements.forEach((staff) => {
    playerHigh.forEach((pe) => {
      if (rectOverlap(staff.x, staff.y, staff.width, staff.height, pe.x, pe.y, pe.width, pe.height)) {
        issues.push({
          id: nextId(),
          severity: 'warning',
          category: 'Staff Access Conflict',
          title: `Reset path conflicts with: ${pe.label}`,
          affectedZoneIds: [staff.zoneId, pe.zoneId].filter(Boolean) as string[],
          affectedElementIds: [staff.id, pe.id],
          explanation: `"${staff.label}" overlaps with "${pe.label}". Staff reset operations will require moving through an active player interaction zone.`,
          suggestedFix: 'Reroute the staff access path around player puzzle stations, or add a separate service corridor.',
        });
      }
    });
  });
  if (staffElements.length === 0) {
    issues.push({
      id: nextId(),
      severity: 'improvement',
      category: 'Staff Access Conflict',
      title: 'No staff access or reset path defined',
      affectedZoneIds: [],
      affectedElementIds: [],
      explanation: 'No staff access or reset path has been placed. Without a defined path, reset time and service logistics cannot be reviewed.',
      suggestedFix: 'Add staff access and reset path elements to model how staff will enter, reset, and service the room.',
    });
  } else if (!issues.some((i) => i.category === 'Staff Access Conflict')) {
    cleanChecks.push('Staff access paths do not visibly conflict with player elements.');
  }

  // -- 5. Sightline risk --
  const criticalClues = elements.filter((e) =>
    ['clue', 'reveal'].includes(e.type) && ['high', 'critical'].includes(e.importance),
  );
  const scenicBlockers = elements.filter((e) => e.type === 'scenic_blocker');
  criticalClues.forEach((clue) => {
    scenicBlockers.forEach((blocker) => {
      if (rectProximity(clue.x, clue.y, clue.width, clue.height, blocker.x, blocker.y, blocker.width, blocker.height, 1.5)) {
        issues.push({
          id: nextId(),
          severity: 'warning',
          category: 'Sightline Risk',
          title: `Critical clue near scenic blocker: ${clue.label}`,
          affectedZoneIds: [clue.zoneId, blocker.zoneId].filter(Boolean) as string[],
          affectedElementIds: [clue.id, blocker.id],
          explanation: `"${clue.label}" (critical importance) is placed very close to scenic blocker "${blocker.label}". Players approaching from most angles may not see it clearly.`,
          suggestedFix: `Reposition "${clue.label}" to an open, visible location, or adjust the scenic blocker so it does not obstruct the key clue sightline.`,
        });
      }
    });
    // Corner check: clue in far corner of room
    const roomW = project.roomWidth, roomH = project.roomHeight;
    const inCorner =
      (clue.x < roomW * 0.15 || clue.x > roomW * 0.85) &&
      (clue.y < roomH * 0.15 || clue.y > roomH * 0.85);
    if (inCorner) {
      issues.push({
        id: nextId(),
        severity: 'improvement',
        category: 'Sightline Risk',
        title: `Critical clue in corner dead zone: ${clue.label}`,
        affectedZoneIds: clue.zoneId ? [clue.zoneId] : [],
        affectedElementIds: [clue.id],
        explanation: `"${clue.label}" is placed in a room corner. Corner placements often have weak natural sightlines and may require extra lighting or directional guidance.`,
        suggestedFix: 'Consider moving important clues to central or high-traffic areas, or use lighting to draw attention.',
      });
    }
  });
  if (!issues.some((i) => i.category === 'Sightline Risk')) {
    cleanChecks.push('No obvious sightline risks detected for critical clue elements.');
  }

  // -- 6. Low-use dead zone --
  zones.forEach((zone) => {
    const zoneElements = elements.filter((e) => e.zoneId === zone.id);
    const area = zone.width * zone.height;
    const hasInteraction = zoneElements.some((e) =>
      ['puzzle_station', 'lock', 'clue', 'prop', 'door', 'exit', 'staff_access', 'reset_path'].includes(e.type),
    );
    const isPurposeful = ['staff_reset', 'storage', 'atmosphere'].includes(zone.purpose);
    if (!hasInteraction && !isPurposeful && area > 20) {
      issues.push({
        id: nextId(),
        severity: 'improvement',
        category: 'Dead Zone',
        title: `Low-use dead zone: ${zone.label}`,
        affectedZoneIds: [zone.id],
        affectedElementIds: [],
        explanation: `Zone "${zone.label}" has ${area.toFixed(0)} sq ${project.unit} but no placed interactive or functional elements. This space may weaken immersion and waste build budget.`,
        suggestedFix: 'Add atmosphere elements, props, or circulation features, or repurpose the zone for staff access or storage.',
      });
    }
  });
  if (!issues.some((i) => i.category === 'Dead Zone')) {
    cleanChecks.push('No obvious low-use dead zones detected.');
  }

  // -- 7. Finale compression --
  const finaleZone = zones.find((z) => z.purpose === 'finale');
  if (finaleZone) {
    const area = finaleZone.width * finaleZone.height;
    const sqPerPlayer = area / project.targetPlayerCount;
    if (sqPerPlayer < 8) {
      issues.push({
        id: nextId(),
        severity: 'critical',
        category: 'Finale Compression',
        title: 'Finale zone too small for full player group',
        affectedZoneIds: [finaleZone.id],
        affectedElementIds: [],
        explanation: `The finale zone "${finaleZone.label}" provides only ${sqPerPlayer.toFixed(1)} sq ${project.unit} per player for ${project.targetPlayerCount} players. Finale moments require generous space for physical and emotional payoff.`,
        suggestedFix: 'Expand the finale zone or reduce the number of elements competing for space in the final area.',
      });
    } else if (sqPerPlayer < 14) {
      issues.push({
        id: nextId(),
        severity: 'warning',
        category: 'Finale Compression',
        title: 'Finale zone may feel cramped at full capacity',
        affectedZoneIds: [finaleZone.id],
        affectedElementIds: [],
        explanation: `The finale zone "${finaleZone.label}" has ${sqPerPlayer.toFixed(1)} sq ${project.unit} per player. At full capacity the finale moment may lack the spaciousness the experience deserves.`,
        suggestedFix: 'Consider enlarging the finale zone or designing the finale sequence to use adjacent space.',
      });
    } else {
      cleanChecks.push('Finale zone has adequate space per player.');
    }
  }

  // -- 8. Prop density risk --
  zones.forEach((zone) => {
    const largeElements = elements.filter(
      (e) =>
        e.zoneId === zone.id &&
        ['prop', 'puzzle_station', 'scenic_blocker'].includes(e.type) &&
        e.width * e.height > 4,
    );
    if (largeElements.length >= 4) {
      issues.push({
        id: nextId(),
        severity: 'warning',
        category: 'Prop Density',
        title: `High prop density in zone: ${zone.label}`,
        affectedZoneIds: [zone.id],
        affectedElementIds: largeElements.map((e) => e.id),
        explanation: `Zone "${zone.label}" has ${largeElements.length} large props or puzzle stations. Physical congestion and restricted circulation are likely.`,
        suggestedFix: 'Reduce the number of large elements per zone, or redistribute props to adjacent zones.',
      });
    }
  });
  if (!issues.some((i) => i.category === 'Prop Density')) {
    cleanChecks.push('Prop density is manageable across all zones.');
  }

  // -- 9. Cross-traffic conflict --
  const resetPaths = elements.filter((e) => e.type === 'reset_path');
  const puzzleStations = elements.filter((e) => e.type === 'puzzle_station' && e.interactionIntensity === 'high');
  resetPaths.forEach((path) => {
    puzzleStations.forEach((station) => {
      if (rectOverlap(path.x, path.y, path.width, path.height, station.x, station.y, station.width, station.height)) {
        issues.push({
          id: nextId(),
          severity: 'warning',
          category: 'Cross-Traffic Conflict',
          title: `Reset path crosses puzzle station: ${station.label}`,
          affectedZoneIds: [path.zoneId, station.zoneId].filter(Boolean) as string[],
          affectedElementIds: [path.id, station.id],
          explanation: `The reset path "${path.label}" crosses directly through "${station.label}" (high-interaction puzzle station). Staff will need to move through active player space during resets.`,
          suggestedFix: 'Reroute the reset path around puzzle stations, or create a backstage corridor.',
        });
      }
    });
  });
  if (!issues.some((i) => i.category === 'Cross-Traffic Conflict')) {
    cleanChecks.push('No cross-traffic conflicts between reset paths and player zones.');
  }

  // -- 10. Accessibility review prompt --
  const tightElements = elements.filter(
    (e) =>
      (e.type === 'door' || e.type === 'reset_path' || e.type === 'staff_access') &&
      (e.width < 1.5 || e.height < 1.5),
  );
  tightElements.forEach((el) => {
    issues.push({
      id: nextId(),
      severity: 'improvement',
      category: 'Accessibility',
      title: `Narrow pathway may need review: ${el.label}`,
      affectedZoneIds: el.zoneId ? [el.zoneId] : [],
      affectedElementIds: [el.id],
      explanation: `"${el.label}" has a very narrow width or height (${el.width} x ${el.height} ${project.unit}). This may restrict access for some players or violate local accessibility standards.`,
      suggestedFix: 'Widen to at least 3 feet / 0.9m minimum where possible. Consult local building codes for ADA or accessibility requirements.',
    });
  });
  if (!issues.some((i) => i.category === 'Accessibility')) {
    cleanChecks.push('No obviously narrow pathways detected.');
  }

  // Score
  const critCount = issues.filter((i) => i.severity === 'critical').length;
  const warnCount = issues.filter((i) => i.severity === 'warning').length;
  const improvCount = issues.filter((i) => i.severity === 'improvement').length;
  const raw = 100 - critCount * 20 - warnCount * 7 - improvCount * 3;
  const score = Math.max(0, raw);

  // Zone risk levels
  const zoneRiskLevels: Record<string, Severity> = {};
  zones.forEach((z) => {
    const zoneIssues = issues.filter((i) => i.affectedZoneIds.includes(z.id));
    if (zoneIssues.some((i) => i.severity === 'critical')) {
      zoneRiskLevels[z.id] = 'critical';
    } else if (zoneIssues.some((i) => i.severity === 'warning')) {
      zoneRiskLevels[z.id] = 'warning';
    } else if (zoneIssues.some((i) => i.severity === 'improvement')) {
      zoneRiskLevels[z.id] = 'improvement';
    } else {
      zoneRiskLevels[z.id] = 'clean';
    }
  });

  return {
    score,
    label: scoreLabel(score),
    criticalCount: critCount,
    warningCount: warnCount,
    improvementCount: improvCount,
    issues,
    cleanChecks,
    zoneRiskLevels,
  };
}
