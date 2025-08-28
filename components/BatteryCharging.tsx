import { FontAwesome } from "@expo/vector-icons";
import { View, Text } from "react-native";

interface BatteryProps {
  batteryLevel: number;
}

export default function BatteryCharging({ batteryLevel }: BatteryProps) {
  // Determine icon based on battery percentage
  const icon =
    (`battery-${Math.floor(batteryLevel / 20)}` as
      | "battery-0"
      | "battery-1"
      | "battery-2"
      | "battery-3"
      | "battery-4");

  return (
    <View>
      <Text
        style={{
          borderRadius: 15,
          padding: 10,
          color: "white",
          textAlign: "center",
          backgroundColor: "green",
          marginHorizontal: 30,
        }}
      >
        <FontAwesome
          name={batteryLevel === 100 ? "battery-full" : icon}
        />
        &nbsp;
        {batteryLevel === 100
          ? "Battery is fully charged."
          : "Battery is now charging."}
      </Text>
    </View>
  );
}
