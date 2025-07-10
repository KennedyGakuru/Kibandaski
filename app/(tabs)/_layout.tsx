import { Tabs, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { router, useSegments } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (user) {
      hasRedirected.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading && user && !hasRedirected.current) {
      const currentTab = segments[1];

      if (user.user_type === 'vendor' && !currentTab?.includes('vendor')) {
        console.log('🏪 Redirecting vendor to business tab');
        hasRedirected.current = true;
        router.replace('/(tabs)/(vendor)');
      } else if (user.user_type === 'customer' && currentTab?.includes('vendor')) {
        console.log('🛍️ Redirecting customer away from vendor tab');
        hasRedirected.current = true;
        router.replace('/(tabs)/(customer)');
      }
    }
  }, [user, loading, segments]);

  if (loading) return null;

  // 👤 Vendor: No tab bar — use Stack
  if (user?.user_type === 'vendor') {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    );
  }

  // 🛍️ Customer: Let nested (customer)/_layout.tsx handle tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide outer tab bar
      }}
    >
      <Tabs.Screen
        name="(customer)"
        options={{
          href: null, // Don't show as a tab
        }}
      />
      <Tabs.Screen
        name="(vendor)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
