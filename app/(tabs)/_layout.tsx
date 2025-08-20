import { useContext } from "react";
import { Tabs } from "expo-router";
import FAIcons from "@expo/vector-icons/FontAwesome";
import { ThemeContext } from "../ThemeContext";

export default function TabLayout() {
  const theme = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { color: theme.colors.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <FAIcons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <FAIcons size={28} name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <FAIcons size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
