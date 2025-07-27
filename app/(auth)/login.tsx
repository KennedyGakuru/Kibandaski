import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, 
  Platform,Animated,Dimensions,StatusBar} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
//import { FloatingLabelInputProps } from '@/types';
import AlertBox from '../../components/AlertBox';
import FloatingLabelInput from '@/components/FloatingLabelInput';


const { width, height } = Dimensions.get('window');




export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);


  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    const isValidEmail = /^\S+@\S+\.\S+$/.test(email);
    if (!isValidEmail) {
    setAlert({ type: 'error', message: 'Please enter a valid email address' });
    return;
    }

    setLoading(true);
    try {
      const user = await signIn(email, password); 

      if (user.user_type === 'vendor') {
        router.replace('/(tabs)/(vendor)');
      } else {
        router.replace('/(tabs)/(customer)');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      console.log('Google login successful');

      if (user?.user_type === 'vendor') {
        router.replace('/(tabs)/(vendor)');
      } else {
        router.replace('/(tabs)/(customer)');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Please try again.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
  if (alert) {
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }
}, [alert]);


  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />
      <LinearGradient
        colors={['#f97316', '#ea580c', '#c2410c']}
        className="flex-1"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 px-6 pt-16">
            {/* AlertBox goes here */}
            {alert && (
            <AlertBox
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            />
            )}
            {/* Header */}
            <View className="mb-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-0 left-0 z-10 p-2"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              
              <View className="items-center mt-10">
                <Text className="text-4xl font-bold text-white mb-2 text-center">
                  Welcome Back
                </Text>
                <Text className="text-white/90 text-base text-center leading-6 px-5">
                  Sign in to discover amazing street food
                </Text>
              </View>
            </View>

            {/* Form */}
            <View className="mb-8">
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

              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                icon="lock-closed"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                focused={passwordFocused}
                testID="password-toggle"
              />

              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end mb-6 py-2"
              >
                <Text className="text-white/90 text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`rounded-2xl overflow-hidden shadow-lg ${loading ? 'opacity-70' : ''}`}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8f9fa']}
                  className="py-5 items-center justify-center"
                >
                  <Text className="text-orange-500 text-lg font-bold">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-white/30" />
              <Text className="text-white/80 px-4 text-sm font-medium">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-white/30" />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              className={`flex-row items-center justify-center bg-white py-5 rounded-2xl mb-6 shadow-md ${googleLoading ? 'opacity-70' : ''}`}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3">
                <Text className="text-white text-sm font-bold">G</Text>
              </View>
              <Text className="text-gray-700 text-base font-semibold">
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="items-center mt-4 py-4"
            >
              <Text className="text-white/90 text-base">
                Don't have an account? <Text className="font-bold text-white">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}