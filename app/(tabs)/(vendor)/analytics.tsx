import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Star, 
  ShoppingBag,
  Calendar,
  Clock,
  Award
} from 'lucide-react-native';
import { supabase } from '../../../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  orders: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  customers: {
    total: number;
    returning: number;
    growth: number;
  };
  rating: {
    average: number;
    total_reviews: number;
    recent_change: number;
  };
  popularItems: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  weeklyRevenue: Array<{
    day: string;
    revenue: number;
  }>;
  peakHours: Array<{
    hour: string;
    orders: number;
  }>;
}

export default function VendorAnalyticsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchVendorAndAnalytics();
    }
  }, [user]);

  const fetchVendorAndAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        return;
      }

      setVendor(vendorData);
      
      // Fetch analytics data from database
      const [reviewsResult, favoritesResult, foodsResult] = await Promise.all([
        supabase
          .from('reviews')
          .select('rating, created_at')
          .eq('vendor_id', vendorData.id),
        supabase
          .from('favorites')
          .select('created_at')
          .eq('vendor_id', vendorData.id),
        supabase
          .from('foods')
          .select('name, price, category')
          .eq('vendor_id', vendorData.id)
      ]);

      // Calculate analytics from real data
      const reviews = reviewsResult.data || [];
      const favorites = favoritesResult.data || [];
      const foods = foodsResult.data || [];

      // Mock some data for demonstration (in real app, you'd have orders table)
      const mockOrders = Math.floor(Math.random() * 100) + 50;
      const mockRevenue = mockOrders * 150; // Average order value

      // Calculate popular items based on foods
      const popularItems = foods.slice(0, 5).map((food, index) => ({
        id: food.name,
        name: food.name,
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }));

      // Generate weekly revenue data
      const weeklyRevenue = [
        { day: 'Mon', revenue: Math.floor(Math.random() * 3000) + 1000 },
        { day: 'Tue', revenue: Math.floor(Math.random() * 3000) + 1000 },
        { day: 'Wed', revenue: Math.floor(Math.random() * 3000) + 1000 },
        { day: 'Thu', revenue: Math.floor(Math.random() * 3000) + 1000 },
        { day: 'Fri', revenue: Math.floor(Math.random() * 4000) + 2000 },
        { day: 'Sat', revenue: Math.floor(Math.random() * 4000) + 2000 },
        { day: 'Sun', revenue: Math.floor(Math.random() * 3000) + 1500 }
      ];

      // Generate peak hours data
      const peakHours = [
        { hour: '11AM', orders: Math.floor(Math.random() * 10) + 5 },
        { hour: '12PM', orders: Math.floor(Math.random() * 20) + 10 },
        { hour: '1PM', orders: Math.floor(Math.random() * 25) + 15 },
        { hour: '2PM', orders: Math.floor(Math.random() * 20) + 10 },
        { hour: '6PM', orders: Math.floor(Math.random() * 15) + 8 },
        { hour: '7PM', orders: Math.floor(Math.random() * 18) + 10 },
        { hour: '8PM', orders: Math.floor(Math.random() * 15) + 8 }
      ];

      setAnalytics({
        revenue: {
          today: Math.floor(mockRevenue * 0.1),
          week: mockRevenue,
          month: mockRevenue * 4,
          growth: Math.random() * 20 + 5
        },
        orders: {
          today: Math.floor(mockOrders * 0.1),
          week: mockOrders,
          month: mockOrders * 4,
          growth: Math.random() * 15 + 3
        },
        customers: {
          total: favorites.length + Math.floor(Math.random() * 100) + 20,
          returning: Math.floor(favorites.length * 0.6),
          growth: Math.random() * 25 + 5
        },
        rating: {
          average: vendorData.rating || 0,
          total_reviews: vendorData.total_reviews || 0,
          recent_change: Math.random() * 0.5
        },
        popularItems,
        weeklyRevenue,
        peakHours
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPeriodData = () => {
    if (!analytics) return { revenue: 0, orders: 0 };
    
    switch (selectedPeriod) {
      case 'today':
        return {
          revenue: analytics.revenue.today,
          orders: analytics.orders.today
        };
      case 'week':
        return {
          revenue: analytics.revenue.week,
          orders: analytics.orders.week
        };
      case 'month':
        return {
          revenue: analytics.revenue.month,
          orders: analytics.orders.month
        };
      default:
        return {
          revenue: analytics.revenue.week,
          orders: analytics.orders.week
        };
    }
  };

  const renderChart = (data: Array<{ day?: string; hour?: string; revenue?: number; orders?: number }>, type: 'revenue' | 'orders') => {
    const maxValue = Math.max(...data.map(item => type === 'revenue' ? (item.revenue || 0) : (item.orders || 0)));
    
    return (
      <View className="h-[140px]">
        <View className="flex-row items-end justify-between h-[120px] gap-2">
          {data.map((item, index) => {
            const value = type === 'revenue' ? (item.revenue || 0) : (item.orders || 0);
            const height = (value / maxValue) * 120;
            
            return (
              <View key={index} className="flex-1 items-center">
                <View 
                  className={`w-full min-h-[4px] rounded-sm mb-2 ${
                    type === 'revenue' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ height: height || 4 }}
                />
                <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.day || item.hour}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className={`flex-1 justify-center items-center px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Unable to load analytics
        </Text>
      </View>
    );
  }

  const currentData = getCurrentPeriodData();

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`pt-12 pb-4 px-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDark ? '#ffffff' : '#374151'} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Analytics
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="px-6 pt-6">
        {/* Period Selector */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row gap-2">
            {(['today', 'week', 'month'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                className={`flex-1 py-3 px-4 rounded-lg items-center ${
                  selectedPeriod === period ? 'bg-orange-500' : ''
                }`}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text className={`text-sm font-medium ${
                  selectedPeriod === period ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-500')
                }`}>
                  {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row justify-between items-center mb-2">
              <DollarSign size={20} color="#22c55e" />
              <View className="flex-row items-center gap-1">
                <TrendingUp size={16} color="#22c55e" />
                <Text className="text-xs font-medium text-green-500">
                  +{analytics.revenue.growth.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ksh {currentData.revenue.toLocaleString()}
            </Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Revenue
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row justify-between items-center mb-2">
              <ShoppingBag size={20} color="#3b82f6" />
              <View className="flex-row items-center gap-1">
                <TrendingUp size={16} color="#22c55e" />
                <Text className="text-xs font-medium text-green-500">
                  +{analytics.orders.growth.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentData.orders}
            </Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Orders
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row justify-between items-center mb-2">
              <Users size={20} color="#8b5cf6" />
              <View className="flex-row items-center gap-1">
                <TrendingUp size={16} color="#22c55e" />
                <Text className="text-xs font-medium text-green-500">
                  +{analytics.customers.growth.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {analytics.customers.total}
            </Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Customers
            </Text>
          </View>

          <View className={`flex-1 min-w-[45%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <View className="flex-row justify-between items-center mb-2">
              <Star size={20} color="#f59e0b" />
              <View className="flex-row items-center gap-1">
                <TrendingUp size={16} color="#22c55e" />
                <Text className="text-xs font-medium text-green-500">
                  +{analytics.rating.recent_change.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {analytics.rating.average.toFixed(1)}
            </Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Rating
            </Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center mb-5">
            <TrendingUp size={24} color="#22c55e" />
            <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Weekly Revenue
            </Text>
          </View>
          {renderChart(analytics.weeklyRevenue, 'revenue')}
        </View>

        {/* Peak Hours */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center mb-5">
            <Clock size={24} color="#3b82f6" />
            <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Peak Hours
            </Text>
          </View>
          {renderChart(analytics.peakHours, 'orders')}
        </View>

        {/* Popular Items */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center mb-5">
            <Award size={24} color="#f59e0b" />
            <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Popular Items
            </Text>
          </View>
          
          <View className="gap-4">
            {analytics.popularItems.map((item, index) => (
              <View key={item.id} className="flex-row items-center gap-4">
                <View className="w-8 h-8 rounded-full bg-orange-500 justify-center items-center">
                  <Text className="text-sm font-bold text-white">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.orders} orders • Ksh {item.revenue.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Insights */}
        <View className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <View className="flex-row items-center mb-5">
            <Users size={24} color="#8b5cf6" />
            <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Customer Insights
            </Text>
          </View>
          
          <View className="flex-row justify-between gap-4">
            <View className="flex-1 items-center">
              <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.customers.returning}
              </Text>
              <Text className={`text-sm font-medium text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Returning Customers
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.rating.total_reviews}
              </Text>
              <Text className={`text-sm font-medium text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Reviews
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round((analytics.customers.returning / analytics.customers.total) * 100)}%
              </Text>
              <Text className={`text-sm font-medium text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Return Rate
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}