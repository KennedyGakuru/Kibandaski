import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      await signIn(email, password);
      console.log('Login successful, navigating to tabs');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c', '#c2410c']}
      className="flex-1"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12 justify-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 z-10 p-2"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-white mb-2 text-center">
              Welcome Back
            </Text>
            <Text className="text-white/90 text-base text-center leading-6">
              Sign in to discover amazing street food
            </Text>
          </View>

          <View className="mb-8">
            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                Email
              </Text>
              <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 py-1 border-2 ${
                emailFocused ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name="mail" size={20} color={emailFocused ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                Password
              </Text>
              <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 py-1 border-2 ${
                passwordFocused ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name="lock-closed" size={20} color={passwordFocused ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                  testID="password-toggle"
                >
                  {showPassword ? (
                    <Ionicons name="eye-off" size={20} color="rgba(255,255,255,0.7)" />
                  ) : (
                    <Ionicons name="eye" size={20} color="rgba(255,255,255,0.7)" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end mb-6"
            >
              <Text className="text-white/90 text-sm font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`bg-white py-5 rounded-2xl items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-orange-500 text-lg font-bold">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-white/30" />
            <Text className="text-white/80 px-4 text-sm font-medium">
              or continue with
            </Text>
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

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="items-center mt-4"
          >
            <Text className="text-white/90 text-base">
              Don't have an account? <Text className="font-bold text-white">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}