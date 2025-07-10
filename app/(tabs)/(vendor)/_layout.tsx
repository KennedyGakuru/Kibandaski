import { Stack } from 'expo-router';

export default function VendorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}