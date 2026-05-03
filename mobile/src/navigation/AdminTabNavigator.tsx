import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, Settings, Activity, Shield } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import UserManagementScreen from '../screens/Management/UserManagementScreen';
import AddUserScreen from '../screens/Management/AddUserScreen';
import SecurityLogsScreen from '../screens/Management/SecurityLogsScreen';

import EditUserScreen from '../screens/Management/EditUserScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ManagementStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserList" component={UserManagementScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
    </Stack.Navigator>
  );
}

function SecurityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LogList" component={SecurityLogsScreen} />
    </Stack.Navigator>
  );
}

export default function AdminTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Dashboard') return <Activity size={size} color={color} />;
          if (route.name === 'Security') return <Shield size={size} color={color} />;
          if (route.name === 'Users') return <Users size={size} color={color} />;
          if (route.name === 'Profile') return <Settings size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.text + '40' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 15,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminHomeScreen} />
      <Tab.Screen name="Users" component={ManagementStack} />
      <Tab.Screen name="Security" component={SecurityStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
