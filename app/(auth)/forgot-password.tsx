import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'kibandaski://reset-password',
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      Alert.alert(
        'Reset Link Sent',
        'Check your email for a password reset link. Follow the instructions to create a new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email');
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
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="bg-white/20 p-6 rounded-full mb-8">
          <Ionicons name="mail" size={64} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white mb-4 text-center">
          Forgot Password?
        </Text>
        
        <Text className="text-white/80 text-base text-center leading-6 mb-12">
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View className="bg-white/10 rounded-xl p-6 mb-8 w-full">
          <View className="mb-4">
            <Text className="text-white font-medium text-base mb-2">Email Address</Text>
            <TextInput
              className="bg-white/20 py-4 px-4 rounded-xl text-white text-base"
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          <TouchableOpacity
            className="bg-white py-4 rounded-xl mt-2"
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text className="text-orange-500 text-lg font-bold text-center">
              {loading ? 'Sending...' : 'Send Reset Link'}
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