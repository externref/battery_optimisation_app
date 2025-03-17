import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CallProps {
  callerName: string;
  phoneNumber: string;
  batteryLevel: number;
  temperature: number;
  onAnswer?: () => void;
  onDecline?: () => void;
  onClose?: () => void;
}

const Call = ({ 
  callerName, 
  phoneNumber, 
  batteryLevel, 
  temperature,
  onAnswer,
  onDecline,
  onClose
}: CallProps) => {
  const slideAnim = new Animated.Value(-300);
  
  // Determine if conditions are optimal for taking a call
  const isBatteryLow = batteryLevel < 15;
  const isTemperatureHigh = temperature > 35;
  const shouldTakeCall = !isBatteryLow && !isTemperatureHigh;
  
  // Get recommendation message based on device status
  const getRecommendation = () => {
    if (isBatteryLow && isTemperatureHigh) {
      return "Critical device status! Consider declining";
    } else if (isBatteryLow) {
      return "Low battery! Keep call brief";
    } else if (isTemperatureHigh) {
      return "Device temperature high! Consider declining";
    } else {
      return "Device status optimal for call";
    }
  };

  // Get color for recommendation text
  const getRecommendationColor = () => {
    if (isBatteryLow && isTemperatureHigh) {
      return "#FF3B30"; // Red for critical
    } else if (isBatteryLow || isTemperatureHigh) {
      return "#FF9500"; // Orange for warning
    } else {
      return "#4CD964"; // Green for good
    }
  };

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <FontAwesome name="times" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.callerInfo}>
          <View style={styles.callerIconContainer}>
            <FontAwesome name="user-circle" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>

        <View style={styles.deviceInfo}>
          <View style={styles.infoRow}>
            <FontAwesome name="battery" size={16} color="#fff" />
            <Text style={styles.infoLabel}>Battery:</Text>
            <View style={[styles.progressBar, { backgroundColor: '#242333' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${batteryLevel}%`,
                    backgroundColor: batteryLevel < 15 ? '#FF3B30' : 
                                      batteryLevel < 30 ? '#FF9500' : '#4CD964'
                  }
                ]} 
              />
            </View>
            <Text style={styles.infoValue}>{batteryLevel.toFixed(1)}%</Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name="thermometer-half" size={16} color="#fff" />
            <Text style={styles.infoLabel}>Temperature:</Text>
            <View style={[styles.progressBar, { backgroundColor: '#242333' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(100, (temperature / 50) * 100)}%`,
                    backgroundColor: temperature > 35 ? '#FF3B30' : 
                                      temperature > 30 ? '#FF9500' : '#4CD964'
                  }
                ]} 
              />
            </View>
            <Text style={styles.infoValue}>{temperature.toFixed(1)}°C</Text>
          </View>
        </View>

        <Text style={[styles.recommendation, { color: getRecommendationColor() }]}>
          {getRecommendation()}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]} 
            onPress={onDecline}
          >
            <FontAwesome name="phone" size={24} color="#fff" style={styles.rotatedPhone} />
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.answerButton, 
              !shouldTakeCall && styles.cautionButton
            ]} 
            onPress={onAnswer}
          >
            <FontAwesome name="phone" size={24} color="#fff" />
            <Text style={styles.buttonText}>Answer</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#1A1818',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  callerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phoneNumber: {
    color: '#aaa',
    fontSize: 16,
  },
  deviceInfo: {
    backgroundColor: '#242333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#fff',
    marginLeft: 8,
    marginRight: 8,
    width: 90,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoValue: {
    color: '#fff',
    marginLeft: 8,
    width: 45,
    textAlign: 'right',
  },
  recommendation: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: '45%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  cautionButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rotatedPhone: {
    transform: [{ rotate: '135deg' }],
  },
});

export default Call;