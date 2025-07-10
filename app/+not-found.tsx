import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-gray-50 dark:bg-gray-900">
        <Ionicons name="location" size={64} color="#f97316" />
        <Text className="text-xl font-bold text-gray-800 dark:text-white mt-4">
          This screen doesn't exist.
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-2 text-center">
          Looks like you've wandered off the street food map!
        </Text>
        <Link href="/" className="mt-4 px-6 py-3 bg-primary-500 rounded-xl">
          <Text className="text-white font-bold">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}