import * as Notifications from 'expo-notifications';
import { Linking, Platform, Alert } from 'react-native';

export async function requestNotificationPermissions() {
  // Standard notification permissions (for sending)
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert(
      "Notification Permission Required",
      "This app needs notification permissions to function properly.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Settings", 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
    return false;
  }
  
  // For Android: additionally request notification listener access (for reading)
  if (Platform.OS === 'android') {
    Alert.alert(
      "Notification Access Required",
      "This app needs permission to read notifications. Please enable 'Notification Access' for this app in the next screen.",
      [
        { text: "OK", style: "cancel" },
        { 
          text: "Open Notification Settings", 
          onPress: () => {
            try {
              // This opens the system's notification listener settings
              Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
            } catch (error) {
              console.error("Could not open notification listener settings:", error);
              // Fallback to general settings
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }
  
  return true;
}