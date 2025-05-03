import { Tabs } from "expo-router";
import FAIcons from "@expo/vector-icons/FontAwesome";
import { StyleSheet } from "react-native";

const style = StyleSheet.create({
  container: {
    backgroundColor: "#1A1818",
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: style.container,
        headerStyle: style.container,
        headerTitleStyle: {
          color: "white",
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",

          tabBarIcon: ({ color }) => (
            <FAIcons size={28} name="home" color={color} />
          ),
        }}
      />
      
      
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <FAIcons size={28} name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FAIcons size={28} name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
