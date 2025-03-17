import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Linking, Platform, Alert } from 'react-native';
import { requestNotificationPermissions } from '../utils/permissions';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
//   console.log('Received a notification in the background!');
//   // Do something with the notification data
// });

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default function RootLayout() {
  const [isCallActive, setIsCallActive] = useState(false);
  
  useEffect(() => {
    // Request notification permissions including read access
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
