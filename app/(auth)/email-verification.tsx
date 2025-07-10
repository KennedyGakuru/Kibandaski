import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function EmailVerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = () => {
    // TODO: Implement resend email functionality
    setCountdown(60);
    setCanResend(false);
  };

  const handleContinueToLogin = () => {
    router.replace('/(auth)/login');
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
          <Mail size={64} color="white" />
        </View>

        <Text className="text-3xl font-bold text-white mb-4 text-center">
          Check Your Email
        </Text>
        
        <Text className="text-white/80 text-base text-center mb-2">
          We've sent a verification link to:
        </Text>
        
        <Text className="text-white text-lg font-bold text-center mb-6">
          {email}
        </Text>

        <Text className="text-white/80 text-base text-center leading-6 mb-12">
          Click the link in your email to verify your account and complete the registration process.
        </Text>

        <View className="w-full gap-4 mb-8">
          <TouchableOpacity
            className={`flex-row items-center justify-center bg-white/20 py-4 rounded-xl gap-2 ${canResend ? 'opacity-100' : 'opacity-50'}`}
            onPress={handleResendEmail}
            disabled={!canResend}
          >
            <RefreshCw size={20} color="white" />
            <Text className="text-white text-base font-medium">
              {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-4 rounded-xl"
            onPress={handleContinueToLogin}
          >
            <Text className="text-orange-500 text-lg font-bold text-center">
              Continue to Login
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white/70 text-sm text-center leading-5">
          Didn't receive the email? Check your spam folder or try resending.
        </Text>
      </View>
    </LinearGradient>
  );
}