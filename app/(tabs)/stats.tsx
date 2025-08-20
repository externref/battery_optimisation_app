import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemeContext } from "../ThemeContext";

export default function Stats() {
    const theme = useContext(ThemeContext);

    const [stats, setStats] = useState([
        { time: new Date(), battery_percentage: 0, battery_temperature: 25 }
    ]);

    useEffect(() => {
        const generateSampleData = () => {
            const sampleData = [];
            const now = new Date();

            for (let i = 0; i < 100; i++) {
                const time = new Date(now.getTime() - i * 5 * 60 * 1000);
                const battery_percentage = Math.floor(Math.random() * 80) + 20;
                const battery_temperature = Math.floor(Math.random() * 15) + 25;
                sampleData.push({ time, battery_percentage, battery_temperature });
            }

            setStats(sampleData);
        };

        generateSampleData();
    }, []);

    const getTempTextColor = (temp: number) => {
        if (temp >= 35) return styles.hotText;
        if (temp >= 30) return styles.warmText;
        return styles.coolText;
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                <FontAwesome name="battery" size={18} /> Battery Statistics
            </Text>

            {/* Battery Level Chart */}
            {stats.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
                        Recent Battery Levels
                    </Text>
                    <View style={styles.customChart}>
                        {stats
                            .slice(0, 12)
                            .reverse()
                            .map((item, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: item.battery_percentage * 1.5 },
                                            item.battery_percentage < 20
                                                ? styles.criticalBattery
                                                : item.battery_percentage < 50
                                                ? styles.warningBattery
                                                : styles.goodBattery,
                                        ]}
                                    />
                                    <Text style={[styles.barLabel, { color: theme.colors.grey }]}>
                                        {`${item.time.getHours()}:${item.time
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0")}`}
                                    </Text>
                                    <Text style={[styles.barValue, { color: theme.colors.text }]}>
                                        {item.battery_percentage}%
                                    </Text>
                                </View>
                            ))}
                    </View>
                </View>
            )}

            {/* Battery Level History */}
            <View style={[styles.dataContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
                    <FontAwesome name="history" size={14} /> Battery Level History
                </Text>
                {stats.slice(0, 20).map((item, index) => (
                    <View key={index} style={styles.dataRow}>
                        <Text style={[styles.timeText, { color: theme.colors.text }]}>
                            <FontAwesome name="clock-o" size={12} />{" "}
                            {item.time.toLocaleTimeString()} - {item.time.toLocaleDateString()}
                        </Text>
                        <Text
                            style={[
                                styles.batteryText,
                                item.battery_percentage < 20
                                    ? styles.criticalText
                                    : item.battery_percentage < 50
                                    ? styles.warningText
                                    : styles.goodText,
                            ]}
                        >
                            {item.battery_percentage}%
                        </Text>
                    </View>
                ))}
            </View>

            {/* Battery Temperature Chart */}
            {stats.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
                        Recent Battery Temperatures
                    </Text>
                    <View style={styles.customChart}>
                        {stats
                            .slice(0, 12)
                            .reverse()
                            .map((item, index) => (
                                <View key={index} style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            { height: (item.battery_temperature - 20) * 10 },
                                            item.battery_temperature >= 35
                                                ? styles.hotBattery
                                                : item.battery_temperature >= 30
                                                ? styles.warmBattery
                                                : styles.coolBattery,
                                        ]}
                                    />
                                    <Text style={[styles.barLabel, { color: theme.colors.grey }]}>
                                        {`${item.time.getHours()}:${item.time
                                            .getMinutes()
                                            .toString()
                                            .padStart(2, "0")}`}
                                    </Text>
                                    <Text style={[styles.barValue, { color: theme.colors.text }]}>
                                        {item.battery_temperature}°C
                                    </Text>
                                </View>
                            ))}
                    </View>
                </View>
            )}

            {/* Battery Temperature History */}
            <View style={[styles.dataContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.grey }]}>
                    <FontAwesome name="history" size={14} /> Battery Temperature History
                </Text>
                {stats.slice(0, 20).map((item, index) => (
                    <View key={index} style={styles.dataRow}>
                        <Text style={[styles.timeText, { color: theme.colors.text }]}>
                            <FontAwesome name="clock-o" size={12} />{" "}
                            {item.time.toLocaleTimeString()} - {item.time.toLocaleDateString()}
                        </Text>
                        <Text
                            style={[styles.batteryText, getTempTextColor(item.battery_temperature)]}
                        >
                            {item.battery_temperature}°C
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        marginTop: 10,
    },
    chartContainer: {
        marginBottom: 20,
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    customChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 220,
        marginVertical: 20,
    },
    barContainer: { alignItems: "center", flex: 1 },
    bar: { width: 15, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
    goodBattery: { backgroundColor: "green" },
    warningBattery: { backgroundColor: "#fb8c00" },
    criticalBattery: { backgroundColor: "red" },
    coolBattery: { backgroundColor: "#4fc3f7" },
    warmBattery: { backgroundColor: "#ffb74d" },
    hotBattery: { backgroundColor: "#e57373" },
    barLabel: { fontSize: 10, marginTop: 5, transform: [{ rotate: "-45deg" }] },
    barValue: { position: "absolute", top: -20, fontSize: 10 },
    dataContainer: {
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    timeText: { fontSize: 14 },
    batteryText: { fontSize: 14, fontWeight: "600" },
    goodText: { color: "green" },
    warningText: { color: "#fb8c00" },
    criticalText: { color: "red" },
    coolText: { color: "#4fc3f7" },
    warmText: { color: "#ffb74d" },
    hotText: { color: "#e57373" },
});
