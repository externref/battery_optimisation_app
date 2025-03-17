import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DeviceInfo from "react-native-device-info";
import BatteryCharging from "@/components/BatteryCharging";
import Call from "@/components/Call";

export default function Index() {
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

  useEffect(() => {
    // Show call popup after 10 seconds
    const timer = setTimeout(() => {
      setShowCall(true);
    }, 10000);

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
          
          const uptimeMs = Date.now()-(await DeviceInfo.getStartupTime())
          setUptime(uptimeMs /( 3600*1000));
          
          const carrierName = await DeviceInfo.getCarrier();
          setCarrier(carrierName);
          
          const ip = await DeviceInfo.getIpAddress();
          setIpAddress(ip);
          
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
  
  const handleCallAnswer = () => {
    console.log("Call answered");
    setShowCall(false);
  };

  const handleCallDecline = () => {
    console.log("Call declined");
    setShowCall(false);
  };

  return (
    <>
      <ScrollView style={style.container}>
        <Text
          style={{
            fontSize: 15,
            textAlign: "center",
            margin: 10,
            color: "white",
          }}
        >
          <FontAwesome name="bolt"></FontAwesome> Welcome,{" "}
          <Text style={{ color: "green" }}>{deviceName}</Text>
        </Text>

        <View style={style.info}>
          <Text style={{ color: "white" }}>
            {" "}
            <FontAwesome name="battery"></FontAwesome> Battery Level: &nbsp;
            <Text style={{ color: "green" }}>{batteryLevel?.toPrecision(4)}%</Text>
          </Text>
          <Text style={{ color: "white" }}>
            {" "}
            <FontAwesome name="bolt"></FontAwesome>&nbsp; Memory Usage:{" "}
            <Text style={{ color: "green" }}>
              &nbsp;{((memoryUsage / totalMemory) * 100).toFixed(2)}% |{" "}
              {memoryUsage.toFixed(2)}/{totalMemory.toFixed(2)} MiB
            </Text>
          </Text>
        </View>
        {batteryCharging ? BatteryCharging(batteryLevel || 0) : ""}
        <View style={style.info}>
          <Text style={style.sectionTitle}>System Resources</Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="microchip" size={14} />&nbsp; CPU Usage:{" "}
            <Text style={style.statValue}>{cpuUsage.toFixed(1)}%</Text>
          </Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="thermometer-half" size={14} />&nbsp; Temperature:{" "}
            <Text style={style.statValue}>{temperature.toFixed(1)}°C</Text>
          </Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="clock-o" size={14} />&nbsp; Uptime:{" "}
            <Text style={style.statValue}>
              {Math.floor(uptime)} hrs {Math.floor((uptime % 1) * 60)} min
            </Text>
          </Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="hdd-o" size={14} />&nbsp; Storage:{" "}
            <Text style={style.statValue}>
              {((storageUsed / totalStorage) * 100).toFixed(2)}% | {storageUsed.toFixed(2)}/{totalStorage.toFixed(2)} GB
            </Text>
          </Text>
        </View>

        <View style={style.info}>
          <Text style={style.sectionTitle}>Network Information</Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="signal" size={14} />&nbsp; Carrier:{" "}
            <Text style={style.statValue}>{carrier || "Unknown"}</Text>
          </Text>
          
          <Text style={style.statItem}>
            <FontAwesome name="wifi" size={14} />&nbsp; IP Address:{" "}
            <Text style={style.statValue}>{ipAddress || "Not connected"}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Call popup that appears after 10 seconds */}
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

const style = StyleSheet.create({
  container: {
    backgroundColor: "#1A1818",
    flex: 1,
  },
  info: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#242333",
    marginHorizontal: 30,
    marginVertical: 15,
  },
  sectionTitle: {
    color: "#8a8a8a",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statItem: {
    color: "white",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  statValue: {
    color: "green",
    fontWeight: "500",
  },
});
