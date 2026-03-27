export type Unit = "lb" | "kg";

export type RoundingMode = "closestBelow" | "closest" | "closestAbove";

export type WarmupPreset = "powerlifting" | "hypertrophy" | "beginner";

export interface BarOption {
  id: string;
  name: string;
  weight: number;
}

export interface PlateOption {
  id: string;
  weight: number;
  enabled: boolean;
  quantity?: number;
}

export interface GymProfile {
  id: string;
  name: string;
  defaultUnit: Unit;
  bars: BarOption[];
  plates: PlateOption[];
}

export interface UserSettings {
  selectedGymProfileId: string;
  roundingMode: RoundingMode;
  showAboveOption: boolean;
  warmupPresetDefault: WarmupPreset;
}

export interface PlateLoadResult {
  plates: number[];
  totalWeight: number;
  delta: number;
  isExact: boolean;
}
