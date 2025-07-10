import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { Store, MapPin, Star, Settings, Plus, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import { supabase } from '../../../contexts/AuthContext';

interface Vendor {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  is_open: boolean;
  rating: number;
  total_reviews: number;
  image_url?: string;
}

interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  menuItems: number;
  avgRating: number;
  totalReviews: number;
  totalFavorites: number;
}

export default function VendorDashboardScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorStats>({
    totalOrders: 0,
    totalRevenue: 0,
    menuItems: 0,
    avgRating: 0,
    totalReviews: 0,
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [user]);

  const fetchVendorData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching vendor data for user:', user.id);
      
      // Fetch vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        console.error('Vendor fetch error:', vendorError);
        throw vendorError;
      }

      if (vendorData) {
        console.log('Vendor data found:', vendorData);
        setVendor(vendorData);
        
        // Fetch real statistics
        const [foodsResult, reviewsResult, favoritesResult] = await Promise.all([
          supabase
            .from('foods')
            .select('id')
            .eq('vendor_id', vendorData.id),
          supabase
            .from('reviews')
            .select('rating')
            .eq('vendor_id', vendorData.id),
          supabase
            .from('favorites')
            .select('id')
            .eq('vendor_id', vendorData.id)
        ]);

        const menuItems = foodsResult.data?.length || 0;
        const reviews = reviewsResult.data || [];
        const favorites = favoritesResult.data?.length || 0;
        
        // Calculate average rating
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        // Mock orders and revenue based on real data
        const mockOrders = Math.floor(reviews.length * 2.5) + Math.floor(Math.random() * 50);
        const mockRevenue = mockOrders * (Math.floor(Math.random() * 200) + 100);

        setStats({
          totalOrders: mockOrders,
          totalRevenue: mockRevenue,
          menuItems,
          avgRating,
          totalReviews: reviews.length,
          totalFavorites: favorites,
        });
      } else {
        console.log('No vendor found, redirecting to setup');
        router.replace('/(tabs)/(vendor)/setup');
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVendorStatus = async (isOpen: boolean) => {
    if (!vendor) return;

    try {
      console.log('Updating vendor status:', isOpen);
      
      const { error } = await supabase
        .from('vendors')
        .update({ is_open: isOpen })
        .eq('id', vendor.id);

      if (error) {
        console.error('Vendor status update error:', error);
        throw error;
      }
      
      setVendor(prev => prev ? { ...prev, is_open: isOpen } : null);
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</Text>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className={`flex-1 justify-center items-center px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Store size={64} color={isDark ? '#6b7280' : '#d1d5db'} />
        <Text className={`text-2xl font-bold mt-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Set Up Your Business
        </Text>
        <Text className={`text-base mt-2 text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Create your vendor profile to start selling
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
          onPress={() => router.push('/(tabs)/(vendor)/setup')}
        >
          <Text className="text-white text-base font-bold">Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`pt-12 pb-4 px-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Business
          </Text>
          <TouchableOpacity 
            className="p-2"
            onPress={() => router.push('/(tabs)/(vendor)/settings')}
          >
            <Settings size={24} color={isDark ? '#ffffff' : '#374151'} />
          </TouchableOpacity>
        </View>
        <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {vendor.name}
        </Text>
      </View>

      <View className="px-6 pt-6">
        {/* Business Status */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Store size={24} color={isDark ? '#ffffff' : '#374151'} />
              <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Business Status
              </Text>
            </View>
            <Switch
              value={vendor.is_open}
              onValueChange={toggleVendorStatus}
              thumbColor={vendor.is_open ? '#f97316' : '#f4f3f4'}
              trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
            />
          </View>
          <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {vendor.is_open ? 'Your business is currently open and visible to customers' : 'Your business is currently closed'}
          </Text>
        </View>

        {/* Stats Overview */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center mb-2">
              <DollarSign size={20} color="#22c55e" />
              <Text className={`text-sm font-medium ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Revenue
              </Text>
            </View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ksh {stats.totalRevenue.toLocaleString()}
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center mb-2">
              <Users size={20} color="#3b82f6" />
              <Text className={`text-sm font-medium ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Orders
              </Text>
            </View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalOrders}
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center mb-2">
              <Star size={20} color="#f59e0b" />
              <Text className={`text-sm font-medium ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Rating
              </Text>
            </View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.avgRating.toFixed(1)}
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row items-center mb-2">
              <MapPin size={20} color="#8b5cf6" />
              <Text className={`text-sm font-medium ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Menu Items
              </Text>
            </View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.menuItems}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </Text>
          
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 items-center p-4 rounded-xl gap-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
              onPress={() => router.push('/(tabs)/(vendor)/menu')}
            >
              <Plus size={24} color="#f97316" />
              <Text className={`text-sm font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Manage Menu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 items-center p-4 rounded-xl gap-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
              onPress={() => router.push('/(tabs)/(vendor)/analytics')}
            >
              <TrendingUp size={24} color="#3b82f6" />
              <Text className={`text-sm font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                View Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Info */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Business Information
          </Text>
          
          <View className="flex-row items-center mb-2 gap-2">
            <MapPin size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {vendor.address}
            </Text>
          </View>
          
          {vendor.phone && (
            <View className="flex-row items-center mb-2 gap-2">
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                📞 {vendor.phone}
              </Text>
            </View>
          )}
          
          <Text className={`text-sm leading-5 mt-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {vendor.description}
          </Text>

          <View className="flex-row justify-around pt-4 border-t border-gray-200">
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalReviews}
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Reviews
              </Text>
            </View>
            <View className="items-center">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalFavorites}
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Favorites
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}