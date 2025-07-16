import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function AuthHome() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!loading && user) {
      if (user.user_type === 'vendor') {
        router.replace('/(tabs)/(vendor)');
      } else {
        router.replace('/(tabs)/(customer)');
      }
    }
  }, [user, loading]);

  // Don't render anything while checking auth or redirecting
  if (loading || user) {
    return null;
  }

  type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

  const onboardingScreens: {
    id: number;
    icon: IoniconName;
    title: string;
    subtitle: string;
    description: string;
    colors: [string, string, ...string[]];
  }[] = [
    {
      id: 1,
      icon: "location",
      title: "Discover Street Food",
      subtitle: "Find the best local vendors in your neighborhood",
      description: "Explore authentic street food experiences right around the corner. From traditional favorites to hidden gems, discover what makes your community delicious.",
      colors: ['#f97316', '#ea580c', '#c2410c']
    },
    {
      id: 2,
      icon: "star",
      title: "Rate & Review",
      subtitle: "Share your foodie experiences with the community",
      description: "Help fellow food lovers discover amazing vendors by sharing honest reviews and ratings. Your voice matters in building our food community.",
      colors: ['#f59e0b', '#f97316', '#ea580c']
    },
    {
      id: 3,
      icon: "people",
      title: "Join the Community",
      subtitle: "Connect with food lovers and local vendors",
      description: "Be part of a vibrant community that celebrates local food culture. Share photos, discover new favorites, and support local businesses.",
      colors: ['#ec4899', '#f97316', '#dc2626']
    }
  ];

  const features: { icon: IoniconName; text: string }[] = [
    { icon: "search", text: "Easy Discovery" },
    { icon: "heart", text: "Save Favorites" },
    { icon: "shield-checkmark", text: "Trusted Reviews" },
    { icon: "time", text: "Real-time Updates" }
  ];

  const nextScreen = useCallback(() => {
    console.log('Next button pressed, current screen:', currentScreen);
    
    if (currentScreen < onboardingScreens.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen(prev => prev + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setShowAuth(true);
    }
  }, [currentScreen, fadeAnim, onboardingScreens.length]);

  const skipToAuth = useCallback(() => {
    setShowAuth(true);
  }, []);

  if (showAuth) {
    return (
      <LinearGradient
        colors={['#f97316', '#ea580c', '#c2410c']}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: 24, 
              borderRadius: 50, 
              marginBottom: 24 
            }}>
              <Ionicons name="location" size={64} color="white" />
            </View>
            <Text style={{ 
              fontSize: 32, 
              fontWeight: 'bold', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: 8
            }}>
              Kibandaski
            </Text>
            <Text style={{ 
              fontSize: 18, 
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'center' 
            }}>
              Discover the best street food in your neighborhood
            </Text>
          </View>

          {/* Features Grid */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 48
          }}>
            {features.map((feature, index) => (
              <View key={index} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: 16,
                borderRadius: 16,
                width: '48%',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Ionicons name={feature.icon} size={24} color="white" style={{ marginBottom: 8 }} />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 14, 
                  fontWeight: '500', 
                  textAlign: 'center' 
                }}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ width: '100%', gap: 16 }}>
            <TouchableOpacity 
              style={{
                backgroundColor: 'white',
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8
              }}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ea580c',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Login
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                borderWidth: 2,
                borderColor: 'white',
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
            marginTop: 24
          }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const currentSlide = onboardingScreens[currentScreen];

  return (
    <LinearGradient
      colors={currentSlide.colors}
      style={{ flex: 1 }}
    >
      {/* Skip Button */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        paddingHorizontal: 24, 
        paddingTop: 60,
        paddingBottom: 24
      }}>
        <TouchableOpacity 
          onPress={skipToAuth}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <Animated.View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 64,
        opacity: fadeAnim
      }}>
        {/* Icon */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: 32,
          borderRadius: 50,
          marginBottom: 32
        }}>
          <Ionicons name={currentSlide.icon} size={64} color="white" />
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: 16
        }}>
          {currentSlide.title}
        </Text>

        {/* Subtitle */}
        <Text style={{
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          marginBottom: 32,
          fontWeight: '500'
        }}>
          {currentSlide.subtitle}
        </Text>

        {/* Description */}
        <Text style={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          fontSize: 16,
          lineHeight: 24,
          marginBottom: 48,
          maxWidth: 280
        }}>
          {currentSlide.description}
        </Text>

        {/* Progress Indicators */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          marginBottom: 32,
          gap: 8
        }}>
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: index === currentScreen ? 'white' : 'rgba(255, 255, 255, 0.3)',
                marginHorizontal: 4
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={nextScreen}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: 16,
            borderRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-forward" size={32} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation Helper */}
      <View style={{ paddingBottom: 32, paddingHorizontal: 32 }}>
        <Text style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 12
        }}>
          Tap to continue • {currentScreen + 1} of {onboardingScreens.length}
        </Text>
      </View>
    </LinearGradient>
  );
}