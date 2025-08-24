import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as Battery from "expo-battery";
import { requestNotificationPermissions } from "../utils/permissions";
import { initDatabase } from "../utils/database";
import { recordBatteryLevel } from "../utils/battery";
import { ThemeProvider } from "./ThemeContext";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const BATTERY_MONITORING_TASK = "BATTERY-MONITORING-TASK";

TaskManager.defineTask(BATTERY_MONITORING_TASK, async () => {
  try {
    console.log(" Background battery monitoring task running");
    const percentage = await recordBatteryLevel();
    if (percentage !== null) {
      console.log(` Recorded battery level: ${percentage}%`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error(" Error in background battery monitoring task:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const registerBatteryMonitoringTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BATTERY_MONITORING_TASK, {
      minimumInterval: 300, // 5 min
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log(" Battery monitoring background task registered");
  } catch (error) {
    console.error(" Error registering battery monitoring task:", error);
  }
};

export default function RootLayout() {
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    // Init DB
    initDatabase()
      .then(() => console.log(" Database initialized"))
      .catch((err) => console.error(" Database initialization error:", err));

    // Background battery monitoring
    registerBatteryMonitoringTask();

    // Ask for notification permission
    requestNotificationPermissions();

    //  Listen for charger connect/disconnect
    const batterySub = Battery.addBatteryStateListener(({ batteryState }) => {
      console.log("Battery state changed:", batteryState);
    
      if (batteryState === Battery.BatteryState.CHARGING) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: " Your Device is Charging!Check the temperature",
            body: "Your device is now charging.Be Careful while using the device.",
            
          },
          trigger: null,
        });
      } else if (batteryState === Battery.BatteryState.UNPLUGGED) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Charging Stopped",
            body: "Device is not charging.",
          },
          trigger: null,
        });
      }
    });

    // ⚡ Notification listener for calls
    console.log(" Setting up notification listener");
    const subscription = Notifications.addNotificationReceivedListener((notif) => {
      console.log(" Notification Received:", notif);

      if (notif.request.content.title === "Incoming Call") {
        console.log(" Incoming Call detected");
        setIsCallActive(true);
      }
    });

    return () => {
      subscription.remove();
      batterySub.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
