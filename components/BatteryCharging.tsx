import { FontAwesome } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function BatteryCharging(percent: number) {
  // @ts-ignore
  const icon:
    | "battery-0"
    | "battery-1"
    | "battery-2"
    | "battery-3"
    | "battery-4" = `battery-${Math.floor(percent / 20)}`;
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
          name={percent == 100 ? "battery-full" : icon}
        ></FontAwesome>
        &nbsp;
        {percent == 100
          ? "Battery is fully charged."
          : "Battery is now charging."}
      </Text>
    </View>
  );
}
