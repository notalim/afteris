import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="protocol"
        options={{
          title: 'Protocol',
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      {/* Hide the calendar tab — it's merged into Protocol */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
