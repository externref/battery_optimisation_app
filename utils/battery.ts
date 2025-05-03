import * as Battery from 'expo-battery';
import { saveBatteryPercentage } from './database';

export const getBatteryLevel = async () => {
  try {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    return Math.round(batteryLevel * 100); // Convert to percentage
  } catch (error) {
    console.error('Error getting battery level:', error);
    return null;
  }
};

export const recordBatteryLevel = async () => {
  try {
    const percentage = await getBatteryLevel();
    if (percentage !== null) {
      await saveBatteryPercentage(percentage);
      return percentage;
    }
    return null;
  } catch (error) {
    console.error('Error recording battery level:', error);
    return null;
  }
};
