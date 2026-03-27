import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";
import { GymProfile, UserSettings, BarOption, PlateOption } from "@/types/gym";

const STORAGE_KEY_PROFILES = "gym_profiles";
const STORAGE_KEY_SETTINGS = "gym_settings";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultProfiles(): GymProfile[] {
  return [
    {
      id: generateId(),
      name: "Default Gym",
      defaultUnit: "lb",
      bars: [
        { id: generateId(), name: "Standard Bar", weight: 45 },
        { id: generateId(), name: "Women's Bar", weight: 35 },
      ],
      plates: [
        { id: generateId(), weight: 45, enabled: true },
        { id: generateId(), weight: 35, enabled: true },
        { id: generateId(), weight: 25, enabled: true },
        { id: generateId(), weight: 10, enabled: true },
        { id: generateId(), weight: 5, enabled: true },
        { id: generateId(), weight: 2.5, enabled: true },
      ],
    },
  ];
}

export const [GymProvider, useGym] = createContextHook(() => {
  const [profiles, setProfiles] = useState<GymProfile[]>(createDefaultProfiles());
  const [settings, setSettings] = useState<UserSettings>({
    selectedGymProfileId: "",
    roundingMode: "closestBelow",
    showAboveOption: true,
    warmupPresetDefault: "powerlifting",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const saveData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles)),
        AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings)),
      ]);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  }, [profiles, settings]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [profiles, settings, isLoaded, saveData]);

  const loadData = async () => {
    try {
      const [profilesJson, settingsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_PROFILES),
        AsyncStorage.getItem(STORAGE_KEY_SETTINGS),
      ]);

      if (profilesJson) {
        const loadedProfiles = JSON.parse(profilesJson);
        setProfiles(loadedProfiles);
        
        if (settingsJson) {
          const loadedSettings = JSON.parse(settingsJson);
          setSettings(loadedSettings);
        } else {
          setSettings((prev) => ({
            ...prev,
            selectedGymProfileId: loadedProfiles[0]?.id || "",
          }));
        }
      } else {
        const defaultProfiles = createDefaultProfiles();
        setProfiles(defaultProfiles);
        setSettings((prev) => ({
          ...prev,
          selectedGymProfileId: defaultProfiles[0].id,
        }));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === settings.selectedGymProfileId) || profiles[0];

  const addProfile = (name: string, unit: "lb" | "kg") => {
    const newProfile: GymProfile = {
      id: generateId(),
      name,
      defaultUnit: unit,
      bars: unit === "lb" 
        ? [{ id: generateId(), name: "Standard Bar", weight: 45 }]
        : [{ id: generateId(), name: "Standard Bar", weight: 20 }],
      plates: unit === "lb"
        ? [
            { id: generateId(), weight: 45, enabled: true },
            { id: generateId(), weight: 35, enabled: true },
            { id: generateId(), weight: 25, enabled: true },
            { id: generateId(), weight: 10, enabled: true },
            { id: generateId(), weight: 5, enabled: true },
            { id: generateId(), weight: 2.5, enabled: true },
          ]
        : [
            { id: generateId(), weight: 25, enabled: true },
            { id: generateId(), weight: 20, enabled: true },
            { id: generateId(), weight: 15, enabled: true },
            { id: generateId(), weight: 10, enabled: true },
            { id: generateId(), weight: 5, enabled: true },
            { id: generateId(), weight: 2.5, enabled: true },
            { id: generateId(), weight: 1.25, enabled: true },
            { id: generateId(), weight: 0.5, enabled: true },
          ],
    };
    setProfiles([...profiles, newProfile]);
  };

  const updateProfile = (id: string, updates: Partial<GymProfile>) => {
    setProfiles(profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProfile = (id: string) => {
    if (profiles.length === 1) return;
    const newProfiles = profiles.filter((p) => p.id !== id);
    setProfiles(newProfiles);
    if (settings.selectedGymProfileId === id) {
      setSettings({ ...settings, selectedGymProfileId: newProfiles[0].id });
    }
  };

  const addBar = (profileId: string, name: string, weight: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const newBar: BarOption = { id: generateId(), name, weight };
    updateProfile(profileId, { bars: [...profile.bars, newBar] });
  };

  const updateBar = (profileId: string, barId: string, updates: Partial<BarOption>) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const newBars = profile.bars.map((b) => (b.id === barId ? { ...b, ...updates } : b));
    updateProfile(profileId, { bars: newBars });
  };

  const deleteBar = (profileId: string, barId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile || profile.bars.length === 1) return;
    const newBars = profile.bars.filter((b) => b.id !== barId);
    updateProfile(profileId, { bars: newBars });
  };

  const addPlate = (profileId: string, weight: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const newPlate: PlateOption = { id: generateId(), weight, enabled: true };
    updateProfile(profileId, { plates: [...profile.plates, newPlate] });
  };

  const updatePlate = (profileId: string, plateId: string, updates: Partial<PlateOption>) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const newPlates = profile.plates.map((p) => (p.id === plateId ? { ...p, ...updates } : p));
    updateProfile(profileId, { plates: newPlates });
  };

  const deletePlate = (profileId: string, plateId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    const newPlates = profile.plates.filter((p) => p.id !== plateId);
    updateProfile(profileId, { plates: newPlates });
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  const resetToDefaults = () => {
    const defaultProfiles = createDefaultProfiles();
    setProfiles(defaultProfiles);
    setSettings({
      selectedGymProfileId: defaultProfiles[0].id,
      roundingMode: "closestBelow",
      showAboveOption: true,
      warmupPresetDefault: "powerlifting",
    });
  };

  return {
    profiles,
    selectedProfile,
    settings,
    isLoaded,
    addProfile,
    updateProfile,
    deleteProfile,
    addBar,
    updateBar,
    deleteBar,
    addPlate,
    updatePlate,
    deletePlate,
    updateSettings,
    resetToDefaults,
  };
});
