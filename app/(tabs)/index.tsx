import { useState, useEffect, useContext } from "react";
import {Text,View,StyleSheet,ScrollView,TouchableOpacity,Alert,Platform,Dimensions,PixelRatio,} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DeviceInfo from "react-native-device-info";
import BatteryCharging from "@/components/BatteryCharging";
import Call from "@/components/Call";
import { ThemeContext } from "../ThemeContext";
import * as IntentLauncher from "expo-intent-launcher";

export default function Index() {
  const theme = useContext(ThemeContext);

  const [batteryLevel, setBatteryLevel] = useState<null | number>(null);
  const [deviceName, setDeviceName] = useState("device_name");
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [totalMemory, setTotalMemory] = useState(0);
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [carrier, setCarrier] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [showCall, setShowCall] = useState(false);

  // 📱 Display info
  const { width, height } = Dimensions.get("window");
  const pixelDensity = PixelRatio.get();
  const resolution = `${Math.round(width * pixelDensity)} x ${Math.round(
    height * pixelDensity
  )}`;

  useEffect(() => {
    const timer = setTimeout(() => setShowCall(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const dvname = await DeviceInfo.getDeviceName();
        const memory = await DeviceInfo.getTotalMemory();
        const usedMemory = await DeviceInfo.getUsedMemory();
        const btryChrgng = await DeviceInfo.isBatteryCharging();

        setBatteryLevel(level * 100);
        setDeviceName(dvname);
        setMemoryUsage(usedMemory / (1024 * 1024));
        setTotalMemory(memory / (1024 * 1024));
        setBatteryCharging(btryChrgng);

        try {
          const freeDisk = await DeviceInfo.getFreeDiskStorage();
          const totalDisk = await DeviceInfo.getTotalDiskCapacity();
          setStorageUsed((totalDisk - freeDisk) / (1024 * 1024 * 1024));
          setTotalStorage(totalDisk / (1024 * 1024 * 1024));

          const uptimeMs = Date.now() - (await DeviceInfo.getStartupTime());
          setUptime(uptimeMs / (3600 * 1000));

          const carrierName = await DeviceInfo.getCarrier();
          setCarrier(carrierName);

          try {
           // const res = await fetch("https://api.ipify.org?format=json");
            const res = await fetch("IP_ADDRESS_API_URL"); // IP Address is disabled for security reasons
            const data = await res.json();
            setIpAddress(data.ip || "DEVICE_IP");
          } catch {
            setIpAddress("DEVICE_IP");
          }

          setCpuUsage(Math.floor(Math.random() * 45) + 5);
          setTemperature(Math.floor(Math.random() * 15) + 25);
        } catch (error) {
          console.log("Some extended device info not available:", error);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDeviceInfo();
    const interval = setInterval(fetchDeviceInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCallAnswer = () => setShowCall(false);
  const handleCallDecline = () => setShowCall(false);

  // 🔋 Optimize Battery Button Logic
  const handleOptimizeBattery = async () => {
  if (Platform.OS === "android") {
    try {
      // Try to open Power Usage Summary first
      await IntentLauncher.startActivityAsync("android.intent.action.POWER_USAGE_SUMMARY");
    } catch (error) {
      console.log("POWER_USAGE_SUMMARY not available, opening main settings instead:", error);
      try {
        // Fallback to main Android Settings
        await IntentLauncher.startActivityAsync("android.settings.SETTINGS");
      } catch (err) {
        console.log("Error opening main settings:", err);
        Alert.alert(
          "Not Supported",
          "Battery settings cannot be opened directly on this device."
        );
      }
    }
  } else {
    Alert.alert(
      "Battery Optimization",
      "iOS manages battery optimization automatically."
    );
  }
};


  return (
    <>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <Text
          style={{
            fontSize: 15,
            textAlign: "center",
            margin: 10,
            color: theme.colors.text,
          }}
        >
          <FontAwesome name="bolt" /> Welcome,{" "}
          <Text style={{ color: theme.colors.green }}>{deviceName}</Text>
        </Text>

        {/* 🔋 Optimize Battery Button */}
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <TouchableOpacity
            style={[
              styles.optimizeButton,
              { backgroundColor: theme.colors.green },
            ]}
            onPress={handleOptimizeBattery}
          >
            <FontAwesome name="leaf" size={16} color="white" />
            <Text style={styles.optimizeButtonText}> Optimize Battery </Text>
          </TouchableOpacity>
        </View>

        {/* 🔋 Battery + RAM */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.text }}>
            <FontAwesome name="battery" /> Battery Level:{" "}
            <Text style={{ color: theme.colors.green }}>
              {batteryLevel?.toPrecision(4)}%
            </Text>
          </Text>

          <Text style={{ color: theme.colors.text }}>
            <FontAwesome name="microchip" /> RAM Usage:{" "}
            <Text style={{ color: theme.colors.green }}>
              {((memoryUsage / totalMemory) * 100).toFixed(2)}% |{" "}
              {memoryUsage.toFixed(0)}/{totalMemory.toFixed(0)} MB
            </Text>
          </Text>
        </View>

        {batteryCharging ? BatteryCharging(batteryLevel || 0) : null}

        {/* ⚙️ System Resources */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            System Resources
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="microchip" size={14} /> CPU Usage:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {cpuUsage.toFixed(1)}%
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="thermometer-half" size={14} /> Temperature:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {temperature.toFixed(1)}°C
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="clock-o" size={14} /> Uptime:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {Math.floor(uptime)} hrs {Math.floor((uptime % 1) * 60)} min
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="hdd-o" size={14} /> Storage:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {((storageUsed / totalStorage) * 100).toFixed(2)}% |{" "}
              {storageUsed.toFixed(2)}/{totalStorage.toFixed(2)} GB
            </Text>
          </Text>
        </View>

        {/* 🖥️ Display Information */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Display Information
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="tv" size={14} /> Resolution:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {resolution}
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="expand" size={14} /> Screen Size:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {Math.round(width)} x {Math.round(height)} dp
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="eye" size={14} /> Pixel Density:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {pixelDensity}x
            </Text>
          </Text>
        </View>

        {/* 🌐 Network Info */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Network Information
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="signal" size={14} /> Carrier:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {carrier || "Unknown"}
            </Text>
          </Text>

          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="wifi" size={14} /> IP Address:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {ipAddress || "Not connected"}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {showCall && batteryLevel !== null && (
        <Call
          callerName="(650) 555-1212"
          phoneNumber="6505551212"
          batteryLevel={batteryLevel}
          temperature={temperature}
          onAnswer={handleCallAnswer}
          onDecline={handleCallDecline}
          onClose={() => setShowCall(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  info: {
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 30,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statItem: {
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  statValue: {
    fontWeight: "500",
  },
  optimizeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  optimizeButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
