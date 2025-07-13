import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Modal, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AlertBox from '@/components/AlertBox';

interface UserStats {
  reviewsCount: number;
  favoritesCount: number;
  visitsCount: number;
}

export default function CustomerProfileScreen() {
  const { user, signOut, uploadAvatar, updateProfile } = useAuth();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState<UserStats>({
    reviewsCount: 0,
    favoritesCount: 0,
    visitsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
  if (alert) {
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }
}, [alert]);


  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user statistics
      const [reviewsResult, favoritesResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
      ]);

      setStats({
        reviewsCount: reviewsResult.data?.length || 0,
        favoritesCount: favoritesResult.data?.length || 0,
        visitsCount: Math.floor(Math.random() * 20) + 5, // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const handleAvatarPress = async () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
      ]
    );
  }; 

  const pickImage = async (source: 'camera' | 'gallery') => {
  try {
    let result;
    
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setAlert({ type: 'error', message: 'Camera permission is required to take photos' });
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use proper enum
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlert({ type: 'error', message: 'Gallery permission is required to select photos' });
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Use proper enum
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      //console.log('📸 Selected image URI:', imageUri);
      
      // Add loading state
      setAlert({ type: 'success', message: 'Uploading profile picture...' });
      
      try {
        await uploadAvatar(imageUri);
        setAlert({ type: 'success', message: 'Profile picture updated successfully!' });
      } catch (error) {
        console.error('Upload failed:', error);
        setAlert({ type: 'error', message: 'Failed to update profile picture. Please try again.' });
      }
    }
  } catch (error) {
    console.error('Error picking image:', error);
    setAlert({ type: 'error', message: 'Failed to select image. Please try again.' });
  }
};


  const handleSaveProfile = async () => {
  if (!formData.name.trim()) {
    setAlert({ type: 'error', message: 'Name is required' });
    return;
  }

  if (!formData.email.trim()) {
    setAlert({ type: 'error', message: 'Email is required' });
    return;
  }

  setEditLoading(true);
  try {
    await updateProfile({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    });
    
    setShowEditModal(false);
    setAlert({ type: 'success', message: 'Profile updated successfully!' });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    setAlert({ type: 'error', message: 'Failed to update profile' });
  } finally {
    setEditLoading(false);
  }
};


  const navigateToFavorites = () => {
    router.push('/(tabs)/(customer)/favorites');
  };

  const navigateToSettings = () => {
    router.push('/(customer)/settings');
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`pt-12 pb-6 px-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {alert && (
          <AlertBox
           type={alert.type}
           message={alert.message}
           onClose={() => setAlert(null)}
           />
           )}

        <View className="items-center">
          <View className="relative mb-4">
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} className="w-40 h-40 rounded-full" />
            ) : (
              <View className="w-40 h-40 bg-orange-500 rounded-full items-center justify-center">
                <Ionicons name='person' size={40} color="white" />
              </View>
            )}
          </View>
          
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user?.name}
          </Text>
          <Text className={`text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {user?.email}
          </Text>
          <View className={`px-4 py-1.5 rounded-full mt-3 ${isDark ? 'bg-orange-600' : 'bg-orange-100'}`}>
            <Text className={`font-semibold text-sm ${isDark ? 'text-orange-100' : 'text-orange-600'}`}>
              Food Explorer
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 pt-6">
        {/* Stats for customers */}
        <View className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Food Journey
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <View className={`p-4 rounded-3xl mb-3 ${isDark ? 'bg-orange-600' : 'bg-orange-100'}`}>
                <Ionicons name='star' size={20} color="#f97316" />
              </View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.reviewsCount}
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Reviews
              </Text>
            </View>
            <View className="items-center">
              <View className={`p-4 rounded-3xl mb-3 ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                <Ionicons name='locate' size={20} color="#22c55e" />
              </View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.favoritesCount}
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Favorites
              </Text>
            </View>
            <View className="items-center">
              <View className={`p-4 rounded-3xl mb-3 ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
                <Ionicons name='locate' size={20} color="#3b82f6" />
              </View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '...' : stats.visitsCount}
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Visits
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className={`rounded-2xl mb-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className={`px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </Text>
          </View>
          
          <TouchableOpacity
            className={`flex-row items-center px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            onPress={navigateToFavorites}
          >
            <View className={`p-3 rounded-3xl mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Ionicons name="heart" size={20} color="#ef4444" />
            </View>
            <Text className={`flex-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            onPress={() => setShowEditModal(true)}
          >
            <View className={`p-3 rounded-3xl mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Ionicons name="card" size={20} color="#6b7280" />
            </View>
            <Text className={`flex-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-6 py-5"
            onPress={toggleTheme}
          >
            <View className={`p-3 rounded-3xl mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {isDark ? (
                <Ionicons name='sunny' size={20} color="#f59e0b" />
              ) : (
                <Ionicons name='moon' size={20} color="#6b7280" />
              )}
            </View>
            <Text className={`flex-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View className={`rounded-2xl mb-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className={`px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Account
            </Text>
          </View>

          <TouchableOpacity 
            className={`flex-row items-center px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            onPress={navigateToSettings}
          >
            <View className={`p-3 rounded-3xl mr-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Ionicons name='settings' size={20} color="#6b7280" />
            </View>
            <Text className={`flex-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Account Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-6 py-5"
            onPress={handleSignOut}
          >
            <View className={`p-3 rounded-3xl mr-4 ${isDark ? 'bg-red-900' : 'bg-red-100'}`}>
              <Ionicons name='log-out' size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 text-base font-medium text-red-500">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className={`flex-row items-center justify-between p-6 pt-12 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#374151'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Avatar Section */}
            <View className="items-center mb-8">
              <TouchableOpacity onPress={handleAvatarPress} className="relative mb-3">
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} className="w-40 h-40 rounded-full" />
                ) : (
                  <View className="w-40 h-40 bg-orange-500 rounded-full items-center justify-center">
                    <Ionicons name="person" size={50} color="white" />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2.5 border-3 border-white">
                  <Ionicons name="camera" size={20} color="white" />
                </View>
              </TouchableOpacity>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tap to change profile picture
              </Text>
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Full Name
              </Text>
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View className="mb-6">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Email Address
              </Text>
              <TextInput
                className={`border rounded-xl p-4 text-base ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your email"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-orange-500 py-4 rounded-xl mt-4 gap-2"
              onPress={handleSaveProfile}
              disabled={editLoading}
            >
              <Ionicons name="bookmark" size={20} color="white" />
              <Text className="text-white text-lg font-bold">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}