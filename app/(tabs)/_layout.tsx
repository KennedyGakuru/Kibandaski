import { Tabs, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { router, useSegments } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [redirecting, setRedirecting] = useState(true); // ⏳ New state

  useEffect(() => {
    if (!loading && user) {
      const currentTab = segments[1];

      if (user.user_type === 'vendor' && !currentTab?.includes('vendor')) {
        console.log('🏪 Redirecting vendor to business tab');
        router.replace('/(tabs)/(vendor)');
      } else if (user.user_type === 'customer' && currentTab?.includes('vendor')) {
        console.log('🛍️ Redirecting customer away from vendor tab');
        router.replace('/(tabs)/(customer)');
      } else {
        setRedirecting(false); // ✅ Only show layout once valid segment
      }
    }
  }, [user, loading, segments]);

  if (loading || redirecting) return null; // ❌ Prevent premature rendering

  if (user?.user_type === 'vendor') {
    return (
      <Stack screenOptions={{ headerShown: false }} />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="(customer)"
        options={{
          href: null,
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
