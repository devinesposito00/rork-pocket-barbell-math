import { Tabs } from "expo-router";
import { Weight, Flame, Settings } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#1C1C1E",
        },
      }}
    >
      <Tabs.Screen
        name="loader"
        options={{
          title: "Loader",
          tabBarIcon: ({ color }) => <Weight size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="warmup"
        options={{
          title: "Warmup",
          tabBarIcon: ({ color }) => <Flame size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
