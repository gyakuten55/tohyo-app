import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { ShortNewsScreen } from '../screens/ShortNewsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{
          title: '応援',
          headerStyle: {
            backgroundColor: '#6750a4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{
          title: '記事詳細',
          headerStyle: {
            backgroundColor: '#6750a4',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

// ShortNews Stack Navigator
const ShortNewsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShortNewsList"
        component={ShortNewsScreen}
        options={{
          title: 'ショートニュース',
          headerStyle: {
            backgroundColor: '#6750a4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'アカウント',
          headerStyle: {
            backgroundColor: '#6750a4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Admin Stack Navigator
const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: '管理画面',
          headerStyle: {
            backgroundColor: '#6750a4',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6750a4',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: '応援',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ShortNews"
        component={ShortNewsStack}
        options={{
          title: 'ショートニュース',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="article" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'アカウント',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            title: '管理',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

// Main App Navigator
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};