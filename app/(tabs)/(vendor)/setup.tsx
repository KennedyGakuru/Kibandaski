import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../../../contexts/AuthContext';

export default function VendorSetupScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    latitude: -1.2921,
    longitude: 36.8219,
  });

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to set up your business location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: fullAddress || prev.address,
        }));

        Alert.alert('Location Found', 'Your current location has been set as your business location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please enter your address manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Error', 'Business address is required');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Business description is required');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          user_id: user?.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim() || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          is_open: true,
          rating: 0,
          total_reviews: 0,
        })
        .select()
        .single();

      if (error) throw error;
      
      Alert.alert(
        'Success!', 
        'Your business profile has been created successfully.',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)/(vendor)')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating vendor profile:', error);
      Alert.alert('Error', error.message || 'Failed to create business profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`pt-12 pb-6 px-6 items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="items-center">
          <Ionicons name="storefront" size={32} color="#f97316" />
          <Text className={`text-2xl font-bold mt-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Set Up Your Business
          </Text>
          <Text className={`text-base mt-2 text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            Let's get your street food business online
          </Text>
        </View>
      </View>

      <View className="px-6 pt-6">
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Business Information
          </Text>
          
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Business Name *
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="storefront" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="e.g., Mama Jane's Kitchen"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Description *
            </Text>
            <View className="flex-row items-start">
              <Ionicons name="document-text" size={20} color={isDark ? '#9ca3af' : '#6b7280'} className="mt-3" />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded h-24 ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Describe your food and what makes it special..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Phone Number
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="call" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="e.g., +254 700 123 456"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <Text className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Business Location
          </Text>
          
          <View className="mb-5">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Address *
            </Text>
            <View className="flex-row items-start">
              <Ionicons name="location" size={20} color={isDark ? '#9ca3af' : '#6b7280'} className="mt-3" />
              <TextInput
                className={`flex-1 text-base py-3 pl-3 rounded h-20 ${isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'}`}
                placeholder="Enter your business address..."
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            className={`flex-row items-center justify-center py-3 rounded-xl mb-3 gap-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            <Ionicons name="navigate" size={20} color="#f97316" />
            <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {locationLoading ? 'Getting Location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>

          <Text className={`text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
            Your location helps customers find you on the map. You can always update this later.
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-xl mb-6 gap-2 bg-orange-500"
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="storefront" size={20} color="white" />
          <Text className="text-lg font-bold text-white">
            {loading ? 'Creating Business...' : 'Create My Business'}
          </Text>
        </TouchableOpacity>

        <Text className={`text-sm text-center mb-8 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          By creating your business profile, you agree to our terms of service and can start accepting customers immediately.
        </Text>
      </View>
    </ScrollView>
  );
}