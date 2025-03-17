import { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [batteryAlerts, setBatteryAlerts] = useState(false);
  const [memoryMonitor, setMemoryMonitor] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>
          <FontAwesome name="moon-o" /> Dark Mode
        </Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? "#4CAF50" : "#ccc"}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>
          <FontAwesome name="battery" /> Battery Alerts
        </Text>
        <Switch
          value={batteryAlerts}
          onValueChange={setBatteryAlerts}
          thumbColor={batteryAlerts ? "#4CAF50" : "#ccc"}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>
          <FontAwesome name="microchip" /> Memory Monitoring
        </Text>
        <Switch
          value={memoryMonitor}
          onValueChange={setMemoryMonitor}
          thumbColor={memoryMonitor ? "#4CAF50" : "#ccc"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1818",
    padding: 20,
  },
  header: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#242333",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  settingText: {
    color: "white",
    fontSize: 16,
  },
});
