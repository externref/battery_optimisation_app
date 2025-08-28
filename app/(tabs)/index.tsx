import { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  PixelRatio,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DeviceInfo from "react-native-device-info";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import BatteryCharging from "@/components/BatteryCharging";
import Call from "@/components/Call";
import { ThemeContext } from "../ThemeContext";
import * as IntentLauncher from "expo-intent-launcher";

const BATTERY_TASK = "BATTERY_TASK";

// 🔧 Background task (runs periodically in background)
TaskManager.defineTask(BATTERY_TASK, async () => {
  try {
    const charging = (await DeviceInfo.isBatteryCharging()) ?? false;
    const level = (await DeviceInfo.getBatteryLevel()) ?? 0;
    const tempApprox = 25 + (1 - level) * 10;

    const todayStr = new Date().toISOString().split("T")[0];
    const lastNotified = await AsyncStorage.getItem("HIGH_TEMP_NOTIFIED");
    const lastCharging = await AsyncStorage.getItem("LAST_CHARGING_STATE");

    // 🔔 Charger connect/disconnect (background)
    if (lastCharging !== null) {
      const prev = lastCharging === "true";
      if (prev !== charging) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: charging ? "🔌 Charger Connected" : "⚡ Charger Disconnected",
            body: charging
              ? "Your device is now charging."
              : "Your device stopped charging.",
          },
          trigger: null,
        });
      }
    }
    await AsyncStorage.setItem("LAST_CHARGING_STATE", charging.toString());

    // 🔔 High temp alert
    if (charging && tempApprox >= 45 && lastNotified !== todayStr) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ High Temperature",
          body: `Device temperature is ${tempApprox.toFixed(
            1
          )}°C while charging!`,
        },
        trigger: null,
      });
      await AsyncStorage.setItem("HIGH_TEMP_NOTIFIED", todayStr);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.log("Background task error:", e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function Index() {
  const theme = useContext(ThemeContext);

  const [deviceInfo, setDeviceInfo] = useState({
    batteryLevel: 0,
    deviceName: "device_name",
    memoryUsage: 0,
    totalMemory: 0,
    batteryCharging: false,
    cpuUsage: 0,
    uptime: 0,
    temperature: 0,
    storageUsed: 0,
    totalStorage: 0,
    carrier: "",
    ipAddress: "",
  });
  const [showCall, setShowCall] = useState(false);

  const { width, height } = Dimensions.get("window");
  const pixelDensity = PixelRatio.get();
  const resolution = `${Math.round(width * pixelDensity)} x ${Math.round(
    height * pixelDensity
  )}`;

  // ✅ Daily uptime persistence
  const updateDailyUptime = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = await AsyncStorage.getItem("LAST_UPTIME_DATE");
      const lastTimestampStr = await AsyncStorage.getItem("LAST_UPTIME_TS");
      const accumulatedStr = await AsyncStorage.getItem("ACCUMULATED_UPTIME");
      const now = Date.now();
      let accumulated = accumulatedStr ? parseFloat(accumulatedStr) : 0;

      if (lastDate === todayStr && lastTimestampStr) {
        const lastTimestamp = parseInt(lastTimestampStr, 10);
        const elapsed = (now - lastTimestamp) / 3600_000; // hrs
        accumulated += elapsed;
      } else {
        accumulated = 0;
      }

      setDeviceInfo((prev) => ({ ...prev, uptime: accumulated }));
      await AsyncStorage.setItem("LAST_UPTIME_DATE", todayStr);
      await AsyncStorage.setItem("LAST_UPTIME_TS", now.toString());
      await AsyncStorage.setItem("ACCUMULATED_UPTIME", accumulated.toString());
    } catch (err) {
      console.log("Error updating uptime:", err);
    }
  };

  // ✅ Fetch device info
  const fetchDeviceInfo = async () => {
    try {
      const level = (await DeviceInfo.getBatteryLevel()) ?? 0;
      const dvname = (await DeviceInfo.getDeviceName()) ?? "Unknown";
      const totalMem = (await DeviceInfo.getTotalMemory()) ?? 1;
      let usedMem = 0;
      try {
        usedMem = (await DeviceInfo.getUsedMemory()) ?? 0;
      } catch {}
      const charging = (await DeviceInfo.isBatteryCharging()) ?? false;
      const freeDisk = (await DeviceInfo.getFreeDiskStorage()) ?? 0;
      const totalDisk = (await DeviceInfo.getTotalDiskCapacity()) ?? 1;
      const carrierName = (await DeviceInfo.getCarrier()) ?? "";

      const cpuLoad = (usedMem / totalMem) * 100;
      //const temp =25 + (cpuLoad / 100) * 20 + (1 - level) * 10 + deviceInfo.uptime * 0.5;// Formula for approx temp
      const temp = Math.floor(Math.random() * 15) + 25; // Simulated temp
        

      // 🌍 Get public IP
      let ip = "DEVICE_IP";
      try {
        //const res = await fetch("https://api.ipify.org?format=json");
         const res = await fetch("DEVICE_IP_API_URL");
        const data = await res.json();
        ip = data.ip || "DEVICE_IP";
      } catch {}

      const updatedInfo = {
        batteryLevel: level * 100,
        deviceName: dvname,
        memoryUsage: usedMem / 1024 / 1024,
        totalMemory: totalMem / 1024 / 1024,
        batteryCharging: charging,
        cpuUsage: cpuLoad,
        temperature: temp,
        storageUsed: (totalDisk - freeDisk) / 1024 / 1024 / 1024,
        totalStorage: totalDisk / 1024 / 1024 / 1024,
        carrier: carrierName,
        ipAddress: ip,
        uptime: deviceInfo.uptime,
      };

      setDeviceInfo(updatedInfo);

      // 📊 Store battery history
      try {
        const historyRaw = await AsyncStorage.getItem("BATTERY_STATS_HISTORY");
        let history = historyRaw ? JSON.parse(historyRaw) : [];
        history.push({
          time: new Date().toISOString(),
          battery_percentage: updatedInfo.batteryLevel,
          battery_temperature: updatedInfo.temperature,
        });
        if (history.length > 200) history = history.slice(-200);
        await AsyncStorage.setItem(
          "BATTERY_STATS_HISTORY",
          JSON.stringify(history)
        );
      } catch (err) {
        console.log("Error saving history:", err);
      }

      // 🔔 High temp notification (foreground check)
      if (charging && temp >= 45) {
        const todayStr = new Date().toISOString().split("T")[0];
        const lastNotified = await AsyncStorage.getItem("HIGH_TEMP_NOTIFIED");
        if (lastNotified !== todayStr) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ High Temperature",
              body: `Device temperature is ${temp.toFixed(
                1
              )}°C while charging!`,
            },
            trigger: null,
          });
          await AsyncStorage.setItem("HIGH_TEMP_NOTIFIED", todayStr);
        }
      }

      await updateDailyUptime();
    } catch (e) {
      console.log("Device info error:", e);
    }
  };

  // ⏳ Periodic refresh
  useEffect(() => {
    fetchDeviceInfo();
    const interval = setInterval(fetchDeviceInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  // 📞 Fake call after 10s
  useEffect(() => {
    const timer = setTimeout(() => setShowCall(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  // 🔔 Instant charger connect/disconnect (foreground)
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.DeviceInfo);
    const subscription = eventEmitter.addListener(
      "RNDeviceInfo_powerStateDidChange",
      async (state) => {
        if (state?.batteryState) {
          const charging = state.batteryState === "charging";
          const lastCharging = await AsyncStorage.getItem("LAST_CHARGING_STATE");
          if (lastCharging !== null) {
            const prev = lastCharging === "true";
            if (prev !== charging) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: charging
                    ? "🔌 Charger Connected"
                    : "⚡ Charger Disconnected",
                  body: charging
                    ? "Your device is now charging. Please check the temperature in the app."
                    : "Your device stopped charging.",
                },
                trigger: null,
              });
            }
          }
          await AsyncStorage.setItem("LAST_CHARGING_STATE", charging.toString());
        }
      }
    );
    return () => subscription.remove();
  }, []);

  // 🔧 Background fetch setup
  useEffect(() => {
    Notifications.requestPermissionsAsync();

    (async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BATTERY_TASK, {
          minimumInterval: 5 * 60, // every 5 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });

        // ⏰ Hourly reminder notification
        await Notifications.cancelAllScheduledNotificationsAsync(); // clear old
       await Notifications.scheduleNotificationAsync({
  content: {
    title: "⏰ Hourly Reminder",
    body: "Open the app to continue monitoring battery & uptime.",
  },
  trigger: {
    seconds: 3600,
    repeats: true,
  } as Notifications.TimeIntervalTriggerInput, // ✅ cast to the correct type
});
      } catch (e) {
        console.log("Background fetch / notification registration failed:", e);
      }
    })();
  }, []);

  const handleOptimizeBattery = async () => {
    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync(
          "android.intent.action.POWER_USAGE_SUMMARY"
        );
      } catch {
        console.log("Cannot open battery settings");
      }
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
          <Text style={{ color: theme.colors.green }}>
            {deviceInfo.deviceName}
          </Text>
        </Text>

        {/* Optimize button */}
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

        {/* Battery + RAM */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.text }}>
            <FontAwesome name="battery" /> Battery Level:{" "}
            <Text style={{ color: theme.colors.green }}>
              {deviceInfo.batteryLevel.toPrecision(4)}%
            </Text>
          </Text>
          <Text style={{ color: theme.colors.text }}>
            <FontAwesome name="microchip" /> RAM Usage:{" "}
            <Text style={{ color: theme.colors.green }}>
              {(
                (deviceInfo.memoryUsage / deviceInfo.totalMemory) *
                100
              ).toFixed(2)}
              % | {deviceInfo.memoryUsage.toFixed(0)}/
              {deviceInfo.totalMemory.toFixed(0)} MB
            </Text>
          </Text>
        </View>

        {deviceInfo.batteryCharging && (
          <BatteryCharging batteryLevel={deviceInfo.batteryLevel} />
        )}

        {/* System Resources */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            System Resources
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="microchip" /> CPU Usage:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {deviceInfo.cpuUsage.toFixed(1)}%
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="thermometer-half" /> Temperature:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {deviceInfo.temperature.toFixed(1)}°C
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="clock-o" /> Uptime:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {Math.floor(deviceInfo.uptime)} hrs{" "}
              {Math.floor((deviceInfo.uptime % 1) * 60)} min
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="hdd-o" /> Storage:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {(
                (deviceInfo.storageUsed / deviceInfo.totalStorage) *
                100
              ).toFixed(2)}
              % | {deviceInfo.storageUsed.toFixed(2)}/
              {deviceInfo.totalStorage.toFixed(2)} GB
            </Text>
          </Text>
        </View>

        {/* Display Info */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Display Information
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="tv" /> Resolution:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {resolution}
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="expand" /> Screen Size:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {Math.round(width)} x {Math.round(height)} dp
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="eye" /> Pixel Density:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {pixelDensity}x
            </Text>
          </Text>
        </View>

        {/* Network Info */}
        <View style={[styles.info, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
            Network Information
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="signal" /> Carrier:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {deviceInfo.carrier || "Unknown"}
            </Text>
          </Text>
          <Text style={[styles.statItem, { color: theme.colors.text }]}>
            <FontAwesome name="wifi" /> IP Address:{" "}
            <Text style={[styles.statValue, { color: theme.colors.green }]}>
              {deviceInfo.ipAddress || "Not connected"}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Fake call */}
      {showCall && (
        <Call
          callerName="(650) 555-1212"
          phoneNumber="6505551212"
          batteryLevel={deviceInfo.batteryLevel}
          temperature={deviceInfo.temperature}
          onAnswer={() => setShowCall(false)}
          onDecline={() => setShowCall(false)}
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
  statValue: { fontWeight: "500" },
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
