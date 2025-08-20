import { useContext } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeContext } from "../ThemeContext";
import { useState } from "react";

export default function Settings() {
  const theme = useContext(ThemeContext);
   const [darkMode, setDarkMode] = useState(true);
  const [batteryAlerts, setBatteryAlerts] = useState(false);
  const [memoryMonitor, setMemoryMonitor] = useState(true);


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Settings</Text>

      <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.settingText, { color: theme.colors.text }]}>
          <FontAwesome name="moon-o" /> Dark Mode
        </Text>
        <Switch
          value={theme.darkMode}
          onValueChange={theme.toggleTheme}
          thumbColor={theme.darkMode ? theme.colors.toggleActive : theme.colors.toggleInactive}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.settingText, { color: theme.colors.text }]}>
          <FontAwesome name="battery" /> Battery Alerts
        </Text>
        <Switch
          value={batteryAlerts}
          onValueChange={setBatteryAlerts}
          thumbColor={batteryAlerts ? "#4CAF50" : "#ccc"}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.settingText, { color: theme.colors.text }]}>
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