import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>

        <Link href="/(tabs)/loader" style={styles.link}>
          <Text style={styles.linkText}>Go to Loader</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#999",
    marginBottom: 32,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
