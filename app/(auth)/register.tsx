import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AlertBox from '@/components/AlertBox';
import FloatingLabelInput from '@/components/FloatingLabelInput';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !name || !confirmPassword) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setAlert({ type: 'error', message: 'Please enter a valid email address' });
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

    if (name.trim().length < 2) {
      setAlert({ type: 'error', message: 'Name must be at least 2 characters' });
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), userType);

      router.push({
        pathname: '/(auth)/email-verification',
        params: { email: email.trim().toLowerCase() }
      });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();

      if (user?.user_type === 'vendor') {
        router.replace('/(tabs)/(vendor)');
      } else {
        router.replace('/(tabs)/(customer)');
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Google sign-in failed. Please try again.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f97316', '#ea580c', '#c2410c']} className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6 pt-12 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 z-10 p-2">
            <Ionicons name='chevron-back' size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center mb-10 mt-8">
            <Text className="text-3xl font-bold text-white mb-2 text-center">Join Kibandaski</Text>
            <Text className="text-white/90 text-base text-center leading-6">Create your account to get started</Text>
          </View>

          {alert && (
            <AlertBox
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <View className="mb-8">
            <FloatingLabelInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="person"
              autoCapitalize="words"
              autoComplete="name"
              focused={false}
            />

            <FloatingLabelInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              icon="mail"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              focused={false}
            />

            <FloatingLabelInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              focused={false}
            />

            <FloatingLabelInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="lock-closed"
              rightIcon={showConfirmPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              focused={false}
            />

            <Text className="text-white mt-5 mb-2 font-semibold text-base">I am a</Text>
            <View className="flex-row gap-3">
              {['customer', 'vendor'].map(type => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl gap-2 border-2 ${
                    userType === type ? 'bg-white border-white/30' : 'bg-white/15 border-transparent'
                  }`}
                  onPress={() => setUserType(type as 'customer' | 'vendor')}
                >
                  <Ionicons name={type === 'customer' ? 'person' : 'storefront'} size={20} color={userType === type ? '#f97316' : 'white'} />
                  <Text className={`text-center font-semibold text-base ${userType === type ? 'text-orange-500' : 'text-white'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className={`bg-white py-5 rounded-2xl items-center mt-5 shadow-lg ${loading ? 'opacity-70' : ''}`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-orange-500 text-lg font-bold">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-white/30" />
            <Text className="text-white/80 px-4 text-sm font-medium">or continue with</Text>
            <View className="flex-1 h-px bg-white/30" />
          </View>

          <TouchableOpacity
            className={`flex-row items-center justify-center bg-white py-5 rounded-2xl mb-6 shadow ${googleLoading ? 'opacity-70' : ''}`}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <View className="w-6 h-6 rounded-xl bg-blue-500 items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">G</Text>
            </View>
            <Text className="text-gray-700 text-base font-semibold">
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="items-center mt-4">
            <Text className="text-white/90 text-base">
              Already have an account? <Text className="font-bold text-white">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
