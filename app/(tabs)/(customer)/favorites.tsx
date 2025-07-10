import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../contexts/AuthContext';
import { SkeletonCard } from '../../../components/SkeletonCard';
import { Ionicons } from '@expo/vector-icons';

interface Vendor {
  id: string;
  user_id: string;
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
  created_at: string;
}

export default function CustomerFavoritesScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterFavorites();
  }, [favorites, searchQuery]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          vendor_id,
          vendors (
            id,
            user_id,
            name,
            description,
            latitude,
            longitude,
            address,
            phone,
            is_open,
            rating,
            total_reviews,
            image_url,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteVendors = data?.map(item => item.vendors).filter(Boolean) || [];
      setFavorites(favoriteVendors.flat());
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites);
      return;
    }

    const filtered = favorites.filter(vendor =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredFavorites(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const removeFavorite = async (vendorId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('vendor_id', vendorId);

      if (error) throw error;
      
      setFavorites(favorites.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  const renderFavoriteItem = ({ item }: { item: Vendor }) => (
    <View className={`mx-4 mb-4 rounded-xl shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <Image 
        source={{ 
          uri: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
        }} 
        className="h-48 w-full"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name='locate' size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.address}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => removeFavorite(item.id)}
            className="p-2"
            testID="remove-favorite-button"
          >
            <Ionicons name='heart' size={20} color="#ef4444" fill="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <Text className={`text-base mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {item.description}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name='search' size={16} color="#f59e0b" fill="#f59e0b" />
            <Text className={`text-sm font-medium ml-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.rating.toFixed(1)}
            </Text>
            <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ({item.total_reviews} reviews)
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-xl ${
            item.is_open 
              ? (isDark ? 'bg-green-800' : 'bg-green-100') 
              : (isDark ? 'bg-red-800' : 'bg-red-100')
          }`}>
            <Text className={`text-sm font-medium ${
              item.is_open 
                ? (isDark ? 'text-green-100' : 'text-green-800') 
                : (isDark ? 'text-red-100' : 'text-red-800')
            }`}>
              {item.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSkeletonItem = ({ item }: { item: number }) => (
    <SkeletonCard key={item} />
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`pt-12 pb-4 px-6 flex-row items-center justify-between shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="flex-1">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Favorites
          </Text>
          <Text className={`text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredFavorites.length} saved vendor{filteredFavorites.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity 
          className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          onPress={() => setShowSearch(!showSearch)}
          testID="search-button"
        >
          <Ionicons name="search" size={20} color={isDark ? '#ffffff' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View className={`px-6 py-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className={`flex-row items-center px-4 py-3 rounded-xl gap-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Ionicons name='search' size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            <TextInput
              className={`flex-1 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
              placeholder="Search your favorites..."
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name='close' size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : filteredFavorites.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name='heart' size={64} color={isDark ? '#4b5563' : '#d1d5db'} />
          <Text className={`text-xl font-bold mt-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {searchQuery ? 'No favorites found' : 'No favorites yet'}
          </Text>
          <Text className={`text-base mt-2 text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Start exploring and add your favorite vendors to see them here'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#ffffff' : '#000000'}
            />
          }
        />
      )}
    </View>
  );
}
