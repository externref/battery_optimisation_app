import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { getBatteryLogs } from "../../utils/database";

export default function Stats() {
    const [stats, setStats] = useState([{time: new Date(), battery_percentage: 0}]);

    useEffect(()=>{

        const generateSampleData = () => {
            const sampleData = [];
            const now = new Date();
            
            for (let i = 0; i < 100; i++) {
                const time = new Date(now.getTime() - (i * 5 * 60 * 1000));
                const battery_percentage = Math.floor(Math.random() * 80) + 20;
                sampleData.push({ time, battery_percentage });
            }
            
            setStats(sampleData);
        };

        generateSampleData()
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>
                <FontAwesome name="battery" size={18} /> Battery Statistics
            </Text>
            
            {stats.length > 0 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Recent Battery Levels</Text>
                    <View style={styles.customChart}>
                        {stats.slice(0, 12).reverse().map((item, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View 
                                    style={[
                                        styles.bar, 
                                        {height: item.battery_percentage * 1.5},
                                        item.battery_percentage < 20 ? styles.criticalBattery :
                                        item.battery_percentage < 50 ? styles.warningBattery : 
                                        styles.goodBattery
                                    ]}
                                />
                                <Text style={styles.barLabel}>
                                    {`${item.time.getHours()}:${item.time.getMinutes().toString().padStart(2, '0')}`}
                                </Text>
                                <Text style={styles.barValue}>
                                    {item.battery_percentage}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
            
            <View style={styles.dataContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome name="history" size={14} /> Battery History
                </Text>
                {stats.slice(0, 20).map((item, index) => (
                    <View key={index} style={styles.dataRow}>
                        <Text style={styles.timeText}>
                            <FontAwesome name="clock-o" size={12} /> {item.time.toLocaleTimeString()} - {item.time.toLocaleDateString()}
                        </Text>
                        <Text style={[
                            styles.batteryText,
                            item.battery_percentage < 20 ? styles.criticalText :
                            item.battery_percentage < 50 ? styles.warningText : 
                            styles.goodText
                        ]}>
                            {item.battery_percentage}%
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#1A1818',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: 'white',
        marginTop: 10,
    },
    chartContainer: {
        marginBottom: 20,
        backgroundColor: '#242333',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    sectionTitle: {
        color: '#8a8a8a',
        fontSize: 14,
        marginBottom: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    customChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 220,
        marginVertical: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 15,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    goodBattery: {
        backgroundColor: 'green',
    },
    warningBattery: {
        backgroundColor: '#fb8c00',
    },
    criticalBattery: {
        backgroundColor: 'red',
    },
    barLabel: {
        fontSize: 10,
        marginTop: 5,
        transform: [{rotate: '-45deg'}],
        color: '#8a8a8a',
    },
    barValue: {
        position: 'absolute',
        top: -20,
        fontSize: 10,
        color: 'white',
    },
    dataContainer: {
        backgroundColor: '#242333',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    timeText: {
        fontSize: 14,
        color: 'white',
    },
    batteryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    goodText: {
        color: 'green',
    },
    warningText: {
        color: '#fb8c00',
    },
    criticalText: {
        color: 'red',
    },
});