import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import AlertBox from '@/components/AlertBox';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) throw sessionError;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setAlert({ type: 'success', message: 'Password updated successfully' });

      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (error: any) {
      console.error('Reset error:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to update password' });
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
          <Ionicons name="lock-closed" size={64} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white mb-4 text-center">
          Reset Password
        </Text>

        <Text className="text-white/80 text-base text-center mb-10">
          Enter your new password below
        </Text>

        <View className="w-full mb-4">
          <FloatingLabelInput
            label="New Password"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            secureTextEntry={!showPassword}
            icon="lock-closed"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            focused={focusedField === 'password'}
            autoComplete="new-password"
          />
        </View>

        <View className="w-full mb-6">
          <FloatingLabelInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            secureTextEntry={!showConfirmPassword}
            icon="lock-closed"
            rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            focused={focusedField === 'confirmPassword'}
            autoComplete="new-password"
          />
        </View>

        <TouchableOpacity
          className={`bg-white py-4 rounded-xl w-full shadow-md ${loading ? 'opacity-70' : ''}`}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text className="text-orange-500 text-lg font-bold text-center">
            {loading ? 'Updating...' : 'Update Password'}
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
