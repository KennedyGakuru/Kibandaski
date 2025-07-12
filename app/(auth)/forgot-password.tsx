import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AlertBox from '../../components/AlertBox';
import FloatingLabelInput from '@/components/FloatingLabelInput';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResetPassword = async () => {
    if (!email) {
      setAlert({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAlert({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'kibandaski://reset-password',
      });

      if (error) throw error;

      setAlert({
        type: 'success',
        message: 'Reset link sent! Check your email.',
      });

      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (error: any) {
      console.error('Reset error:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to send reset email',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  return (
    <LinearGradient colors={['#f97316', '#ea580c']} className="flex-1">
      <View className="flex-1 px-8 pt-16 items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="self-start mb-8"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        {alert && (
          <View className="mb-4 w-full">
            <AlertBox
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </View>
        )}

        <View className="bg-white/20 p-6 rounded-full mb-8">
          <Ionicons name="mail" size={64} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white mb-4 text-center">
          Forgot Password?
        </Text>

        <Text className="text-white/80 text-base text-center leading-6 mb-12">
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View className="w-full mb-6">
          <FloatingLabelInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            icon="mail"
            focused={emailFocused}
          />
        </View>

        <TouchableOpacity
          className={`bg-white py-4 rounded-xl w-full shadow-md ${loading ? 'opacity-70' : ''}`}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text className="text-orange-500 text-lg font-bold text-center">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="mt-6"
        >
          <Text className="text-white text-base text-center">
            Remember your password? <Text className="font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
