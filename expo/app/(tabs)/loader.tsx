import { useGym } from "@/contexts/GymContext";
import { calculatePlateLoad } from "@/utils/plateCalculator";
import { Unit } from "@/types/gym";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Scale, Edit3 } from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";

export default function LoaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ targetWeight?: string; unit?: Unit }>();
  const { selectedProfile, settings } = useGym();

  const [targetWeight, setTargetWeight] = useState(params.targetWeight || "");
  const [unit, setUnit] = useState<Unit>(params.unit || selectedProfile.defaultUnit);
  const [selectedBarId, setSelectedBarId] = useState(selectedProfile.bars[0]?.id || "");
  const [useCollars, setUseCollars] = useState(false);
  const [collarWeight, setCollarWeight] = useState("0");

  useEffect(() => {
    if (params.targetWeight) {
      setTargetWeight(params.targetWeight);
    }
    if (params.unit) {
      setUnit(params.unit);
    }
  }, [params.targetWeight, params.unit]);

  const selectedBar = selectedProfile.bars.find((b) => b.id === selectedBarId) || selectedProfile.bars[0];

  const result = useMemo(() => {
    const target = parseFloat(targetWeight) || 0;
    const collar = useCollars ? parseFloat(collarWeight) || 0 : 0;
    if (target <= 0) return null;
    return calculatePlateLoad(target, selectedBar.weight, collar, selectedProfile.plates, settings.roundingMode);
  }, [targetWeight, selectedBar.weight, useCollars, collarWeight, selectedProfile.plates, settings.roundingMode]);

  const resultAbove = useMemo(() => {
    if (!settings.showAboveOption || !result || "error" in result || result.isExact) return null;
    const target = parseFloat(targetWeight) || 0;
    const collar = useCollars ? parseFloat(collarWeight) || 0 : 0;
    return calculatePlateLoad(target, selectedBar.weight, collar, selectedProfile.plates, "closestAbove");
  }, [settings.showAboveOption, result, targetWeight, selectedBar.weight, useCollars, collarWeight, selectedProfile.plates]);

  const toggleUnit = () => {
    setUnit(unit === "lb" ? "kg" : "lb");
  };

  const formatPlateList = (plates: number[]) => {
    if (plates.length === 0) return "Bar only";
    const plateCounts = new Map<number, number>();
    plates.forEach((p) => {
      plateCounts.set(p, (plateCounts.get(p) || 0) + 1);
    });
    return Array.from(plateCounts.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([weight, count]) => (count > 1 ? `${count}x${weight}` : `${weight}`))
      .join(" + ");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Plate Loader", headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Target Weight</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              style={styles.weightInput}
              value={targetWeight}
              onChangeText={setTargetWeight}
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
          <Text style={styles.label}>Bar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barScroll}>
            {selectedProfile.bars.map((bar) => (
              <TouchableOpacity
                key={bar.id}
                style={[styles.barOption, selectedBarId === bar.id && styles.barOptionSelected]}
                onPress={() => setSelectedBarId(bar.id)}
              >
                <Text style={[styles.barOptionText, selectedBarId === bar.id && styles.barOptionTextSelected]}>
                  {bar.name}
                </Text>
                <Text style={[styles.barWeight, selectedBarId === bar.id && styles.barWeightSelected]}>
                  {bar.weight} {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.collarsRow}>
            <Text style={styles.label}>Collars/Clips</Text>
            <Switch value={useCollars} onValueChange={setUseCollars} />
          </View>
          {useCollars && (
            <TextInput
              style={styles.collarInput}
              value={collarWeight}
              onChangeText={setCollarWeight}
              keyboardType="decimal-pad"
              placeholder="Total collar weight"
              placeholderTextColor="#999"
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.editPlatesButton}
          onPress={() => router.push("/settings")}
        >
          <Edit3 size={18} color="#007AFF" />
          <Text style={styles.editPlatesText}>Edit Available Plates</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.results}>
            {"error" in result ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{result.error}</Text>
              </View>
            ) : (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Per Side:</Text>
                  <Text style={styles.plateList}>{formatPlateList(result.plates)}</Text>
                  <View style={styles.divider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      {result.totalWeight.toFixed(1)} {unit}
                    </Text>
                  </View>
                  {!result.isExact && (
                    <Text style={styles.deltaText}>
                      {result.delta > 0 ? "+" : ""}{result.delta.toFixed(1)} {unit} from target
                    </Text>
                  )}
                </View>

                {resultAbove && !("error" in resultAbove) && (
                  <View style={styles.alternativeCard}>
                    <Text style={styles.alternativeLabel}>Above Target Alternative:</Text>
                    <Text style={styles.plateList}>{formatPlateList(resultAbove.plates)}</Text>
                    <Text style={styles.alternativeTotal}>
                      {resultAbove.totalWeight.toFixed(1)} {unit} (+{resultAbove.delta.toFixed(1)} {unit})
                    </Text>
                  </View>
                )}
              </>
            )}
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
  barScroll: {
    flexGrow: 0,
  },
  barOption: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  barOptionSelected: {
    backgroundColor: "#007AFF",
  },
  barOptionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  barOptionTextSelected: {
    color: "#fff",
  },
  barWeight: {
    fontSize: 13,
    color: "#999",
  },
  barWeightSelected: {
    color: "rgba(255,255,255,0.8)",
  },
  collarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  collarInput: {
    height: 48,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#fff",
  },
  editPlatesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 24,
  },
  editPlatesText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  results: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
  },
  errorCard: {
    backgroundColor: "#3A1F1F",
    borderRadius: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 17,
    color: "#FF453A",
    textAlign: "center",
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#999",
    marginBottom: 8,
  },
  plateList: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2C2C2E",
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#999",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#fff",
  },
  deltaText: {
    fontSize: 15,
    color: "#FF9F0A",
    marginTop: 12,
    textAlign: "center",
  },
  alternativeCard: {
    backgroundColor: "#1F2A1F",
    borderRadius: 16,
    padding: 20,
  },
  alternativeLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#30D158",
    marginBottom: 8,
  },
  alternativeTotal: {
    fontSize: 15,
    color: "#30D158",
    marginTop: 8,
  },
});
