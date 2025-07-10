import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Updated import
import { useTheme } from '@/contexts/ThemeContext';


export default function  CustomerTabsLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderTopWidth: 0,
          elevation: 2,
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -5 },
          height: 60,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" size={size} color={color} />, // Updated icon
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />, // Updated icon
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />, // Updated icon
        }}
      />
    </Tabs>
  );
}