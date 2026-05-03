import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Shield, Clock, FileText, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PendingApprovalsScreen from '../screens/Visitor/PendingApprovalsScreen';
import EntryLogsScreen from '../screens/Logs/EntryLogsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function GuardTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Overview') return <Shield size={size} color={color} />;
          if (route.name === 'Pending') return <Clock size={size} color={color} />;
          if (route.name === 'Logs') return <FileText size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: colors.card,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Overview" component={DashboardScreen} />
      <Tab.Screen name="Pending" component={PendingApprovalsScreen} />
      <Tab.Screen name="Logs" component={EntryLogsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
