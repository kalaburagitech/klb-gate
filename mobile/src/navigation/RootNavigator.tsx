import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators
import ResidentTabNavigator from './ResidentTabNavigator';
import GuardTabNavigator from './GuardTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

// Screens
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import AddVisitorScreen from '../screens/Visitor/AddVisitorScreen';
import PreApprovedListScreen from '../screens/Visitor/PreApprovedListScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isLoading } = useAuth();

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const isAdmin = user && ['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT_ADMIN'].includes(user.role);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isAdmin ? (
          <Stack.Group>
            <Stack.Screen name="AdminApp" component={AdminTabNavigator} />
          </Stack.Group>
        ) : user.role === 'RESIDENT' ? (
          <Stack.Group>
            <Stack.Screen name="ResidentApp" component={ResidentTabNavigator} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="GuardApp" component={GuardTabNavigator} />
            <Stack.Screen name="AddVisitor" component={AddVisitorScreen} />
            <Stack.Screen name="PreApprovedList" component={PreApprovedListScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
