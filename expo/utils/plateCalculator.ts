import { PlateOption, PlateLoadResult } from "@/types/gym";

export function calculatePlatesPerSide(
  targetPerSide: number,
  availablePlates: PlateOption[]
): number[] | null {
  const enabledPlates = availablePlates
    .filter((p) => p.enabled)
    .sort((a, b) => b.weight - a.weight);

  if (enabledPlates.length === 0) return null;

  const plateInventory = new Map<number, number>();
  enabledPlates.forEach((p) => {
    const existing = plateInventory.get(p.weight) || 0;
    plateInventory.set(p.weight, existing + (p.quantity || Infinity));
  });

  const uniqueWeights = Array.from(plateInventory.keys()).sort((a, b) => b - a);

  function backtrack(
    remaining: number,
    index: number,
    current: number[],
    used: Map<number, number>
  ): number[] | null {
    if (Math.abs(remaining) < 0.01) {
      return [...current];
    }

    if (remaining < 0 || index >= uniqueWeights.length) {
      return null;
    }

    const weight = uniqueWeights[index];
    const maxQuantity = plateInventory.get(weight) || 0;
    const usedQuantity = used.get(weight) || 0;

    for (let count = 0; count <= maxQuantity - usedQuantity; count++) {
      if (count * weight > remaining + 0.01) break;

      const newUsed = new Map(used);
      newUsed.set(weight, usedQuantity + count);

      for (let i = 0; i < count; i++) {
        current.push(weight);
      }

      const result = backtrack(remaining - count * weight, index + 1, current, newUsed);
      if (result) return result;

      for (let i = 0; i < count; i++) {
        current.pop();
      }
    }

    return backtrack(remaining, index + 1, current, used);
  }

  return backtrack(targetPerSide, 0, [], new Map());
}

export function findClosestBelow(
  targetPerSide: number,
  availablePlates: PlateOption[]
): number[] {
  for (let offset = 0; offset <= targetPerSide; offset += 0.5) {
    const result = calculatePlatesPerSide(targetPerSide - offset, availablePlates);
    if (result) return result;
  }
  return [];
}

export function findClosestAbove(
  targetPerSide: number,
  availablePlates: PlateOption[]
): number[] {
  const maxPlate = Math.max(
    ...availablePlates.filter((p) => p.enabled).map((p) => p.weight),
    0
  );
  for (let offset = 0; offset <= maxPlate * 10; offset += 0.5) {
    const result = calculatePlatesPerSide(targetPerSide + offset, availablePlates);
    if (result) return result;
  }
  return [];
}

export function findClosest(
  targetPerSide: number,
  availablePlates: PlateOption[]
): number[] {
  const below = findClosestBelow(targetPerSide, availablePlates);
  const above = findClosestAbove(targetPerSide, availablePlates);

  const belowSum = below.reduce((sum, w) => sum + w, 0);
  const aboveSum = above.reduce((sum, w) => sum + w, 0);

  const belowDiff = Math.abs(targetPerSide - belowSum);
  const aboveDiff = Math.abs(targetPerSide - aboveSum);

  return belowDiff <= aboveDiff ? below : above;
}

export function calculatePlateLoad(
  targetWeight: number,
  barWeight: number,
  collarWeight: number,
  availablePlates: PlateOption[],
  roundingMode: "closestBelow" | "closest" | "closestAbove"
): PlateLoadResult | { error: string } {
  const plateWeightNeededTotal = targetWeight - barWeight - collarWeight;

  if (plateWeightNeededTotal < -0.01) {
    return { error: "Target is below bar + collars" };
  }

  if (plateWeightNeededTotal < 0.01) {
    return {
      plates: [],
      totalWeight: barWeight + collarWeight,
      delta: 0,
      isExact: true,
    };
  }

  const plateWeightNeededPerSide = plateWeightNeededTotal / 2;

  let plates: number[];
  if (roundingMode === "closestBelow") {
    plates = findClosestBelow(plateWeightNeededPerSide, availablePlates);
  } else if (roundingMode === "closestAbove") {
    plates = findClosestAbove(plateWeightNeededPerSide, availablePlates);
  } else {
    plates = findClosest(plateWeightNeededPerSide, availablePlates);
  }

  const actualPerSide = plates.reduce((sum, w) => sum + w, 0);
  const totalWeight = barWeight + collarWeight + actualPerSide * 2;
  const delta = targetWeight - totalWeight;
  const isExact = Math.abs(delta) < 0.01;

  return {
    plates: plates.sort((a, b) => b - a),
    totalWeight,
    delta,
    isExact,
  };
}
