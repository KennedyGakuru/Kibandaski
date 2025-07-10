import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signUp, signInWithGoogle } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !name || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
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

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Starting registration process:', { 
        email: email.trim().toLowerCase(), 
        userType,
        name: name.trim()
      });
      
      await signUp(email, password, name, userType);
      
      console.log('✅ Registration completed successfully');
      
      // Navigate to email verification screen
      router.push({
        pathname: '/(auth)/email-verification',
        params: { email: email.trim().toLowerCase() }
      });
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      Alert.alert(
        'Registration Failed', 
        error.message || 'Something went wrong. Please try again.'
      );
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

  return (
    <LinearGradient
      colors={['#f97316', '#ea580c', '#c2410c']}
      className="flex-1"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6 pt-12 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 z-10 p-2"
          >
            <Ionicons name='chevron-back' size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center mb-10 mt-8">
            <Text className="text-3xl font-bold text-white mb-2 text-center">
              Join Kibandaski
            </Text>
            <Text className="text-white/90 text-base text-center leading-6">
              Create your account to get started
            </Text>
          </View>

          <View className="mb-8">
            {/* Name Input */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                Full Name
              </Text>
              <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 py-1 border-2 ${
                focusedField === 'name' ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name='person' size={20} color={focusedField === 'name' ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoCorrect={false}
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                Email
              </Text>
              <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 py-1 border-2 ${
                focusedField === 'email' ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name="mail" size={20} color={focusedField === 'email' ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
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
                focusedField === 'password' ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name="lock-closed" size={20} color={focusedField === 'password' ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Enter your password (min 6 characters)"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  {showPassword ? (
                    <Ionicons name="eye-off" size={20} color="rgba(255,255,255,0.7)" />
                  ) : (
                    <Ionicons name="eye" size={20} color="rgba(255,255,255,0.7)" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                Confirm Password
              </Text>
              <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 py-1 border-2 ${
                focusedField === 'confirmPassword' ? 'bg-white/25 border-white/50' : 'border-transparent'
              }`}>
                <Ionicons name="lock-closed" size={20} color={focusedField === 'confirmPassword' ? '#f97316' : 'rgba(255,255,255,0.7)'} />
                <TextInput
                  className="flex-1 text-white text-base py-4 pl-3"
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  {showConfirmPassword ? (
                    <Ionicons name="eye-off" size={20} color="rgba(255,255,255,0.7)" />
                  ) : (
                    <Ionicons name="eye" size={20} color="rgba(255,255,255,0.7)" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* User Type Selection */}
            <View className="mb-5">
              <Text className="text-white mb-2 font-semibold text-base">
                I am a
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl gap-2 border-2 ${
                    userType === 'customer' 
                      ? 'bg-white border-white/30' 
                      : 'bg-white/15 border-transparent'
                  }`}
                  onPress={() => setUserType('customer')}
                >
                  <Ionicons name="person" size={20} color={userType === 'customer' ? '#f97316' : 'white'} />
                  <Text className={`text-center font-semibold text-base ${
                    userType === 'customer' ? 'text-orange-500' : 'text-white'
                  }`}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl gap-2 border-2 ${
                    userType === 'vendor' 
                      ? 'bg-white border-white/30' 
                      : 'bg-white/15 border-transparent'
                  }`}
                  onPress={() => setUserType('vendor')}
                >
                  <Ionicons name="storefront" size={20} color={userType === 'vendor' ? '#f97316' : 'white'} />
                  <Text className={`text-center font-semibold text-base ${
                    userType === 'vendor' ? 'text-orange-500' : 'text-white'
                  }`}>
                    Vendor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`bg-white py-5 rounded-2xl items-center mt-2 shadow-lg ${loading ? 'opacity-70' : ''}`}
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
            onPress={() => router.push('/(auth)/login')}
            className="items-center mt-4"
          >
            <Text className="text-white/90 text-base">
              Already have an account? <Text className="font-bold text-white">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}