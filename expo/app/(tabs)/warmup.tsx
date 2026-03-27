import { useGym } from "@/contexts/GymContext";
import { calculatePlateLoad } from "@/utils/plateCalculator";
import { Unit, WarmupPreset } from "@/types/gym";
import { useRouter, Stack } from "expo-router";
import { Scale, ArrowRight } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface WarmupSet {
  setNumber: number;
  weight: number;
  reps: number;
  isBar: boolean;
}

function calculateWarmupSets(
  topSetWeight: number,
  preset: WarmupPreset,
  barWeight: number,
  availablePlates: any[],
  roundingMode: any
): WarmupSet[] {
  const presets: Record<WarmupPreset, { percent: number; reps: number }[]> = {
    powerlifting: [
      { percent: 0, reps: 10 },
      { percent: 0.4, reps: 5 },
      { percent: 0.6, reps: 3 },
      { percent: 0.75, reps: 2 },
      { percent: 0.85, reps: 1 },
      { percent: 0.95, reps: 1 },
    ],
    hypertrophy: [
      { percent: 0, reps: 10 },
      { percent: 0.5, reps: 8 },
      { percent: 0.65, reps: 5 },
      { percent: 0.75, reps: 3 },
      { percent: 0.85, reps: 2 },
    ],
    beginner: [
      { percent: 0, reps: 10 },
      { percent: 0.35, reps: 8 },
      { percent: 0.5, reps: 5 },
      { percent: 0.65, reps: 3 },
      { percent: 0.75, reps: 2 },
    ],
  };

  const sets = presets[preset];
  return sets.map((set, index) => {
    if (set.percent === 0) {
      return {
        setNumber: index + 1,
        weight: barWeight,
        reps: set.reps,
        isBar: true,
      };
    }

    const rawWeight = topSetWeight * set.percent;
    const result = calculatePlateLoad(rawWeight, barWeight, 0, availablePlates, roundingMode);

    return {
      setNumber: index + 1,
      weight: "error" in result ? rawWeight : result.totalWeight,
      reps: set.reps,
      isBar: false,
    };
  });
}

export default function WarmupScreen() {
  const router = useRouter();
  const { selectedProfile, settings } = useGym();

  const [topSetWeight, setTopSetWeight] = useState("");
  const [unit, setUnit] = useState<Unit>(selectedProfile.defaultUnit);
  const [preset, setPreset] = useState<WarmupPreset>(settings.warmupPresetDefault);

  const selectedBar = selectedProfile.bars[0];

  const warmupSets = useMemo(() => {
    const weight = parseFloat(topSetWeight) || 0;
    if (weight <= 0) return [];
    return calculateWarmupSets(weight, preset, selectedBar.weight, selectedProfile.plates, settings.roundingMode);
  }, [topSetWeight, preset, selectedBar.weight, selectedProfile.plates, settings.roundingMode]);

  const toggleUnit = () => {
    setUnit(unit === "lb" ? "kg" : "lb");
  };

  const handleLoadPlates = (weight: number) => {
    router.push(`/loader?targetWeight=${weight}&unit=${unit}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Warmup", headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Top Set Weight</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              style={styles.weightInput}
              value={topSetWeight}
              onChangeText={setTopSetWeight}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.unitButton} onPress={toggleUnit}>
              <Scale size={20} color="#fff" />
              <Text style={styles.unitButtonText}>{unit}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preset</Text>
          <View style={styles.presetRow}>
            {(["powerlifting", "hypertrophy", "beginner"] as WarmupPreset[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.presetButton, preset === p && styles.presetButtonSelected]}
                onPress={() => setPreset(p)}
              >
                <Text style={[styles.presetButtonText, preset === p && styles.presetButtonTextSelected]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {warmupSets.length > 0 && (
          <View style={styles.setsSection}>
            <Text style={styles.setsLabel}>Warmup Sets</Text>
            {warmupSets.map((set) => (
              <View key={set.setNumber} style={styles.setCard}>
                <View style={styles.setInfo}>
                  <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                  <View style={styles.setDetails}>
                    <Text style={styles.setWeight}>
                      {set.weight.toFixed(1)} {unit}
                    </Text>
                    <Text style={styles.setReps}>× {set.reps}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.loadButton}
                  onPress={() => handleLoadPlates(set.weight)}
                >
                  <Text style={styles.loadButtonText}>Load</Text>
                  <ArrowRight size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  inputSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 12,
  },
  weightInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  weightInput: {
    flex: 1,
    height: 80,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingHorizontal: 24,
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#fff",
  },
  unitButton: {
    width: 80,
    height: 80,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
    textTransform: "uppercase",
  },
  presetRow: {
    flexDirection: "row",
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    alignItems: "center",
  },
  presetButtonSelected: {
    backgroundColor: "#007AFF",
  },
  presetButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#999",
  },
  presetButtonTextSelected: {
    color: "#fff",
  },
  setsSection: {
    gap: 12,
  },
  setsLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  setCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#999",
    marginBottom: 8,
  },
  setDetails: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  setWeight: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  setReps: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#999",
  },
  loadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#0A1F33",
    borderRadius: 12,
  },
  loadButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
});
