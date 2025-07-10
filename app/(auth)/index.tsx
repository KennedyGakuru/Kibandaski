import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AuthHome() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-lg font-medium text-gray-800 dark:text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c', '#c2410c']}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center px-8">
        <View className="bg-white/20 p-6 rounded-full mb-8">
          <Ionicons name="location" size={64} color="white" />
        </View>
        
        <Text className="text-4xl font-bold text-white text-center mb-4">
          Kibandaski
        </Text>
        <Text className="text-xl text-white/90 text-center mb-12">
          Discover the best street food in your neighborhood
        </Text>

        <View className="flex-row justify-around w-full mb-12">
          <View className="items-center">
            <View className="bg-white/20 p-4 rounded-full mb-2">
              <Ionicons name="location" size={24} color="white" />
            </View>
            <Text className="text-white text-sm font-medium">Find Vendors</Text>
          </View>
          <View className="items-center">
            <View className="bg-white/20 p-4 rounded-full mb-2">
              <Ionicons name="star" size={24} color="white" />
            </View>
            <Text className="text-white text-sm font-medium">Rate & Review</Text>
          </View>
          <View className="items-center">
            <View className="bg-white/20 p-4 rounded-full mb-2">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <Text className="text-white text-sm font-medium">Community</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-white w-full py-4 rounded-xl mb-4"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-primary-600 text-lg font-bold text-center">
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-white w-full py-4 rounded-xl"
          onPress={() => router.push('/(auth)/register')}
        >
          <Text className="text-white text-lg font-bold text-center">
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}