import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../contexts/AuthContext';

export default function ResetPasswordScreen() {
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
  }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Set the session using the tokens from the URL
      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c']}
      className="flex-1"
    >
      <View className="flex-1 px-8 pt-16 items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="self-start mb-8"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="bg-white/20 p-6 rounded-full mb-8">
          <Lock size={64} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white mb-4 text-center">
          Reset Password
        </Text>
        
        <Text className="text-white/80 text-base text-center mb-12">
          Enter your new password below
        </Text>

        <View className="bg-white/10 rounded-xl p-6 mb-8 w-full">
          <View className="mb-4">
            <Text className="text-white font-medium text-base mb-2">New Password</Text>
            <View className="flex-row items-center bg-white/20 rounded-xl">
              <TextInput
                className="flex-1 py-4 px-4 text-white text-base"
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-4"
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Eye size={20} color="rgba(255,255,255,0.7)" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-white font-medium text-base mb-2">Confirm New Password</Text>
            <View className="flex-row items-center bg-white/20 rounded-xl">
              <TextInput
                className="flex-1 py-4 px-4 text-white text-base"
                placeholder="Confirm your new password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-4"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Eye size={20} color="rgba(255,255,255,0.7)" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-white py-4 rounded-xl mt-2"
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text className="text-orange-500 text-lg font-bold text-center">
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-base text-center">
            Remember your password? <Text className="font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}