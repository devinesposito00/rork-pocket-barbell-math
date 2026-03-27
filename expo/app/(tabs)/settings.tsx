import { useGym } from "@/contexts/GymContext";
import { Unit, RoundingMode, WarmupPreset } from "@/types/gym";
import { Stack } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Switch,
} from "react-native";

export default function SettingsScreen() {
  const {
    profiles,
    selectedProfile,
    settings,
    addProfile,
    addBar,
    deleteBar,
    addPlate,
    updatePlate,
    deletePlate,
    updateSettings,
    resetToDefaults,
  } = useGym();

  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showAddBar, setShowAddBar] = useState(false);
  const [showAddPlate, setShowAddPlate] = useState(false);

  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileUnit, setNewProfileUnit] = useState<Unit>("lb");
  const [newBarName, setNewBarName] = useState("");
  const [newBarWeight, setNewBarWeight] = useState("");
  const [newPlateWeight, setNewPlateWeight] = useState("");

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim(), newProfileUnit);
      setNewProfileName("");
      setShowAddProfile(false);
    }
  };

  const handleAddBar = () => {
    const weight = parseFloat(newBarWeight);
    if (newBarName.trim() && weight > 0) {
      addBar(selectedProfile.id, newBarName.trim(), weight);
      setNewBarName("");
      setNewBarWeight("");
      setShowAddBar(false);
    }
  };

  const handleAddPlate = () => {
    const weight = parseFloat(newPlateWeight);
    if (weight > 0) {
      addPlate(selectedProfile.id, weight);
      setNewPlateWeight("");
      setShowAddPlate(false);
    }
  };



  const handleResetToDefaults = () => {
    Alert.alert("Reset to Defaults", "This will delete all profiles and settings. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: resetToDefaults },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Gym Profile</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileScroll}>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  profile.id === settings.selectedGymProfileId && styles.profileCardSelected,
                ]}
                onPress={() => updateSettings({ selectedGymProfileId: profile.id })}
              >
                <Text
                  style={[
                    styles.profileName,
                    profile.id === settings.selectedGymProfileId && styles.profileNameSelected,
                  ]}
                >
                  {profile.name}
                </Text>
                <Text
                  style={[
                    styles.profileUnit,
                    profile.id === settings.selectedGymProfileId && styles.profileUnitSelected,
                  ]}
                >
                  {profile.defaultUnit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddProfile(true)}>
            <Plus size={18} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bars</Text>
            <TouchableOpacity onPress={() => setShowAddBar(true)}>
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {selectedProfile.bars.map((bar) => (
            <View key={bar.id} style={styles.listItem}>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{bar.name}</Text>
                <Text style={styles.listItemDetail}>
                  {bar.weight} {selectedProfile.defaultUnit}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteBar(selectedProfile.id, bar.id)}>
                <Trash2 size={20} color="#FF453A" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plates</Text>
            <TouchableOpacity onPress={() => setShowAddPlate(true)}>
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {selectedProfile.plates
            .sort((a, b) => b.weight - a.weight)
            .map((plate) => (
              <View key={plate.id} style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemName}>
                    {plate.weight} {selectedProfile.defaultUnit}
                  </Text>
                  {plate.quantity && (
                    <Text style={styles.listItemDetail}>Qty: {plate.quantity}</Text>
                  )}
                </View>
                <View style={styles.plateActions}>
                  <Switch
                    value={plate.enabled}
                    onValueChange={(enabled) => updatePlate(selectedProfile.id, plate.id, { enabled })}
                  />
                  <TouchableOpacity onPress={() => deletePlate(selectedProfile.id, plate.id)}>
                    <Trash2 size={20} color="#FF453A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rounding Mode</Text>
          {(["closestBelow", "closest", "closestAbove"] as RoundingMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={styles.optionRow}
              onPress={() => updateSettings({ roundingMode: mode })}
            >
              <Text style={styles.optionText}>
                {mode === "closestBelow"
                  ? "Closest Below"
                  : mode === "closest"
                  ? "Closest"
                  : "Closest Above"}
              </Text>
              <View
                style={[styles.radio, settings.roundingMode === mode && styles.radioSelected]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Show Above Target Option</Text>
            <Switch
              value={settings.showAboveOption}
              onValueChange={(value) => updateSettings({ showAboveOption: value })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Warmup Preset</Text>
          {(["powerlifting", "hypertrophy", "beginner"] as WarmupPreset[]).map((preset) => (
            <TouchableOpacity
              key={preset}
              style={styles.optionRow}
              onPress={() => updateSettings({ warmupPresetDefault: preset })}
            >
              <Text style={styles.optionText}>
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </Text>
              <View
                style={[
                  styles.radio,
                  settings.warmupPresetDefault === preset && styles.radioSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAddProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Gym Profile</Text>
            <TextInput
              style={styles.modalInput}
              value={newProfileName}
              onChangeText={setNewProfileName}
              placeholder="Profile name"
              placeholderTextColor="#999"
            />
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitOption, newProfileUnit === "lb" && styles.unitOptionSelected]}
                onPress={() => setNewProfileUnit("lb")}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    newProfileUnit === "lb" && styles.unitOptionTextSelected,
                  ]}
                >
                  lb
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitOption, newProfileUnit === "kg" && styles.unitOptionSelected]}
                onPress={() => setNewProfileUnit("kg")}
              >
                <Text
                  style={[
                    styles.unitOptionText,
                    newProfileUnit === "kg" && styles.unitOptionTextSelected,
                  ]}
                >
                  kg
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddProfile(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleAddProfile}>
                <Text style={styles.modalButtonConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddBar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Bar</Text>
            <TextInput
              style={styles.modalInput}
              value={newBarName}
              onChangeText={setNewBarName}
              placeholder="Bar name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.modalInput}
              value={newBarWeight}
              onChangeText={setNewBarWeight}
              placeholder="Weight"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddBar(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleAddBar}>
                <Text style={styles.modalButtonConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddPlate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Plate</Text>
            <TextInput
              style={styles.modalInput}
              value={newPlateWeight}
              onChangeText={setNewPlateWeight}
              placeholder="Weight"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowAddPlate(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleAddPlate}>
                <Text style={styles.modalButtonConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 16,
  },
  profileScroll: {
    flexGrow: 0,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  profileCardSelected: {
    backgroundColor: "#007AFF",
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  profileNameSelected: {
    color: "#fff",
  },
  profileUnit: {
    fontSize: 13,
    color: "#999",
    textTransform: "uppercase",
  },
  profileUnitSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  listItemDetail: {
    fontSize: 13,
    color: "#999",
  },
  plateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 17,
    color: "#fff",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
  },
  radioSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  resetButton: {
    paddingVertical: 16,
    backgroundColor: "#3A1F1F",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FF453A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 20,
  },
  modalInput: {
    height: 48,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#fff",
    marginBottom: 16,
  },
  unitToggle: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    alignItems: "center",
  },
  unitOptionSelected: {
    backgroundColor: "#007AFF",
  },
  unitOptionText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#999",
    textTransform: "uppercase",
  },
  unitOptionTextSelected: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#fff",
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
