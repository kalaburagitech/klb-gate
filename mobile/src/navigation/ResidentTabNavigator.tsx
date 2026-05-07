import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Briefcase, Building } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ResidentHomeScreen from '../screens/Resident/ResidentHomeScreen';
import VisitorManagementScreen from '../screens/Resident/VisitorManagementScreen';
import ServiceManagementScreen from '../screens/Resident/ServiceManagementScreen';
import AmenitiesScreen from '../screens/Resident/AmenitiesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PreApprovedGuestScreen from '../screens/Resident/PreApprovedGuestScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ResidentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResidentHome" component={ResidentHomeScreen} />
      <Stack.Screen name="AddPreApproved" component={PreApprovedGuestScreen} />
    </Stack.Navigator>
  );
}

export default function ResidentTabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Visitors') return <User size={size} color={color} />;
          if (route.name === 'Services') return <Briefcase size={size} color={color} />;
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
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={ResidentStack} />
      <Tab.Screen name="Visitors" component={VisitorManagementScreen} />
      <Tab.Screen name="Services" component={ServiceManagementScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
