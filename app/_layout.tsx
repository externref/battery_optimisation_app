import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import { Linking, Platform, Alert } from 'react-native';
import { requestNotificationPermissions } from '../utils/permissions';
import { initDatabase } from '../utils/database';
import { recordBatteryLevel } from '../utils/battery';
import { ThemeProvider } from "./ThemeContext";


const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
const BATTERY_MONITORING_TASK = 'BATTERY-MONITORING-TASK';



TaskManager.defineTask(BATTERY_MONITORING_TASK, async () => {
  try {
    console.log('Background battery monitoring task running');
    const percentage = await recordBatteryLevel();
    if (percentage !== null) {
      console.log(`Recorded battery level: ${percentage}%`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Error in background battery monitoring task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
//   console.log('Received a notification in the background!');
//   // Do something with the notification data
// });

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

const registerBatteryMonitoringTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BATTERY_MONITORING_TASK, {
      minimumInterval: 5 , // 5 minutes in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Battery monitoring background task registered');
  } catch (error) {
    console.error('Error registering battery monitoring task:', error);
  }
};

export default function RootLayout() {
  const [isCallActive, setIsCallActive] = useState(false);
  
  useEffect(() => {
    initDatabase()
      .then(() => console.log('Database initialized'))
      .catch(err => console.error('Database initialization error:', err));

    registerBatteryMonitoringTask();

    requestNotificationPermissions();
    
    console.log("Setting up notification listener");
    const subscription = Notifications.addNotificationReceivedListener((notif) => {
      console.log("Notification Received:", notif);
    
      if (notif.request.content.title === "Incoming Call") {
        console.log("Incoming Call detected");
        setIsCallActive(true);
      }
    });

    return () => {
      subscription.remove();
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
