import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from 'lucide-react-native';

export default function CustomerSettingsScreen() {
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
      {/* Header */}
      <View className={`flex-row items-center justify-between pt-12 pb-4 px-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
        >
          <ArrowLeft size={24} color={isDark ? '#ffffff' : '#374151'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 text-center mx-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Account Settings
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          className="p-2 bg-orange-500 rounded-full"
          disabled={loading}
        >
          <Save size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Personal Information Section */}
        <View className={`rounded-xl p-6 mb-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </Text>
          
          {/* Full Name */}
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Full Name
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <User size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded-lg ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>
          </View>

          {/* Email Address */}
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email Address
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <Mail size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded-lg ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Phone Number
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <Phone size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded-lg ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your phone number"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Address */}
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Address
            </Text>
            <View className="flex-row items-center rounded-xl px-4 py-1">
              <MapPin size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded-lg ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your address"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
              />
            </View>
          </View>
        </View>

        {/* Account Type Section */}
        <View className={`rounded-xl p-6 mb-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account Type
          </Text>
          
          <View className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Account Type
            </Text>
            <Text className={`text-lg font-bold mb-2 capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Customer Account
            </Text>
            <Text className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You can explore vendors and add favorites
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 bg-orange-500 rounded-xl mb-8"
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={20} color="white" />
          <Text className="text-white text-lg font-bold ml-2">
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}