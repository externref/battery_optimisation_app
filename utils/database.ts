import { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

let db: SQLiteDatabase;

const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('batteryStats.db');
  }
  return db;
};

export const initDatabase = async () => {
  try {
    const database = await getDatabase();
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS battery_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        time_saved TEXT, 
        battery_percentage INTEGER
      );
    `);
    console.log('Database and table initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const saveBatteryPercentage = async (percentage: number) => {
  try {
    const currentTime = new Date().toISOString();
    const database = await getDatabase();
    
    const result = await database.runAsync(
      'INSERT INTO battery_logs (time_saved, battery_percentage) VALUES (?, ?)',
      [currentTime, percentage]
    );
    
    console.log('Battery percentage saved:', percentage);
    return result;
  } catch (error) {
    console.error('Error saving battery percentage:', error);
    throw error;
  }
};

export const getBatteryLogs = async () => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM battery_logs ORDER BY time_saved DESC'
    );
    return result;
  } catch (error) {
    console.error('Error fetching battery logs:', error);
    throw error;
  }
};
