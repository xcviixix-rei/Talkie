import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {NotificationService} from '../../services/notificationService';
import * as Notifications from 'expo-notifications';
import {router} from 'expo-router';
import {messageNotificationService} from "../../config/firebaseConfig";
import {sendMessage} from "../../api/message";

export default function NotificationsSettings() {
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState({
    messages: false,
    calls: true,
    updates: true,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === 'granted');
        setLoading(false);
      } catch (error) {
        console.error('Error checking notification permissions:', error);
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const handleToggleSetting = (key) => {
    setSettings(prev => {
      return {...prev, [key]: !prev[key]};
        // Here you would typically save these settings to your backend or local storage
    });
    setTimeout(() => {
      messageNotificationService.triggerNotification(
          "manh4",
          "hello manh2, thong bao duoc chua",
          {
            conversationId: "abc123",
            message: { /* message object */ }
          }
      );
    }, 6000);
    const message = {
      conversation_id: "8BQ4wthHSAwDEbV1tUk8",
      text: "hello dat, thong bao duoc chua",
      sender: "HPBfuadfSBelrChAfcl5VtsWuyh2",
      timestamp: new Date().toISOString(),
    }
    sendMessage(message);
  };

  const sendTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'You need to enable notifications to receive them.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: requestPermissions }
        ]
      );
      return;
    }

    try {
      await NotificationService.scheduleLocalNotification(
        'Test Notification',
        'This is a test notification from your settings',
        { screen: 'notifications-settings' }
      );
      Alert.alert('Notification Sent', 'Check your notifications!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text>Loading settings...</Text>
        </View>
      ) : !hasPermission ? (
        <View style={styles.permissionContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={styles.permissionTitle}>Notifications are disabled</Text>
          <Text style={styles.permissionText}>
            Enable notifications to stay updated with messages, calls and app updates.
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={requestPermissions}
          >
            <Text style={styles.enableButtonText}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Messages</Text>
              </View>
              <Switch
                value={settings.messages}
                onValueChange={() => handleToggleSetting('messages')}
                trackColor={{ false: '#ccc', true: '#bcdeff' }}
                thumbColor={settings.messages ? '#1E90FF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="call-outline" size={24} color="#666" />
                <Text style={styles.settingText}>Calls</Text>
              </View>
              <Switch
                value={settings.calls}
                onValueChange={() => handleToggleSetting('calls')}
                trackColor={{ false: '#ccc', true: '#bcdeff' }}
                thumbColor={settings.calls ? '#1E90FF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="refresh-outline" size={24} color="#666" />
                <Text style={styles.settingText}>App Updates</Text>
              </View>
              <Switch
                value={settings.updates}
                onValueChange={() => handleToggleSetting('updates')}
                trackColor={{ false: '#ccc', true: '#bcdeff' }}
                thumbColor={settings.updates ? '#1E90FF' : '#f4f3f4'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={sendTestNotification}
          >
            <Ionicons name="paper-plane-outline" size={20} color="white" />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  enableButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enableButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E90FF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});