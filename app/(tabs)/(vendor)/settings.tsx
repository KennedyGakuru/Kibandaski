import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VendorSettingsScreen() {
  const { user, updateProfile } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`flex-row items-center justify-between pt-12 pb-4 px-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name='chevron-back' size={24} color={isDark ? '#ffffff' : '#374151'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 text-center mx-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Business Settings
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          className="p-2 rounded-full bg-orange-500"
          disabled={loading}
        >
          <Ionicons name="save" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Business Information
          </Text>
          
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Business Name
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <Ionicons name="storefront" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your business name"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email Address
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <Ionicons name="mail" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Phone Number
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <Ionicons name='call' size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your phone number"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Business Address
            </Text>
            <View className="flex-row items-start rounded-xl px-4 py-1">
              <Ionicons name="locate" size={20} color={isDark ? '#9ca3af' : '#6b7280'} className="mt-3" />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded min-h-20 ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your business address"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account Type
          </Text>
          
          <View className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              Current Account Type
            </Text>
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Vendor Account
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
              You can manage your business and menu items
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-xl mb-8 gap-2 bg-orange-500"
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text className="text-lg font-bold text-white">
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}