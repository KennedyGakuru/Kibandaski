import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { supabase, useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Vendor, Food } from '@/types';
import Loader from '@/components/Loader';
import AlertBox from '@/components/AlertBox'; // Add this import

interface VendorCardProps {
  vendor: Vendor;
  onClose: () => void;
}

export function VendorCard({ vendor, onClose }: VendorCardProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  } | null>(null);

  useEffect(() => {
    fetchFoods();
    checkFavoriteStatus();
  }, [vendor.id]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlert({ type, message, visible: true });
    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const fetchFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('is_available', true)
        .order('category');

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('vendor_id', vendor.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showAlert('warning', 'Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vendor_id', vendor.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            vendor_id: vendor.id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showAlert('error', 'Failed to update favorite');
    }
  };

  const submitReview = async () => {
    if (!user) {
      showAlert('warning', 'Please login to submit a review');
      return;
    }

    if (!comment.trim()) {
      showAlert('error', 'Please add a comment to your review');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          vendor_id: vendor.id,
          rating,
          comment: comment.trim(),
        });

      if (error) throw error;

      showAlert('success', 'Thank you for your review!');
      setShowRatingModal(false);
      setComment('');
      setRating(5);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      if (error.code === '23505') {
        showAlert('error', 'You have already reviewed this vendor');
      } else {
        showAlert('error', 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const groupedFoods = foods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as Record<string, Food[]>);

  return (
    <>
      <View className={`absolute bottom-0 left-0 right-0 max-h-[70%] rounded-t-3xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Alert Box */}
        {alert?.visible && (
          <View className="absolute top-4 left-4 right-4 z-50">
            <AlertBox
              type={alert.type}
              message={alert.message}
              onClose={hideAlert}
            />
          </View>
        )}

        <View className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {vendor.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={toggleFavorite} className="p-2">
                <Ionicons name="heart" 
                  size={24} 
                  color={isFavorite ? '#ef4444' : (isDark ? '#9ca3af' : '#6b7280')} 
                  fill={isFavorite ? '#ef4444' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="p-2" testID="close-button">
                <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#374151'} />
              </TouchableOpacity>
            </View>
          </View>

          <Text className={`text-base mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {vendor.description}
          </Text>

          <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#f59e0b" fill="#f59e0b" />
              <Text className={`text-sm font-medium ml-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {vendor.rating.toFixed(1)}
              </Text>
              <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ({vendor.total_reviews} reviews)
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-xl ${
              vendor.is_open 
                ? (isDark ? 'bg-green-800' : 'bg-green-100') 
                : (isDark ? 'bg-red-800' : 'bg-red-100')
            }`}>
              <Text className={`text-sm font-medium ${
                vendor.is_open 
                  ? (isDark ? 'text-green-100' : 'text-green-800') 
                  : (isDark ? 'text-red-100' : 'text-red-800')
              }`}>
                {vendor.is_open ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <Ionicons name="locate" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {vendor.address}
              </Text>
            </View>
            {vendor.phone && (
              <View className="flex-row items-center">
                <Ionicons name="call" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {vendor.phone}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Menu
          </Text>
          
          {loading ? (
            <View className="items-center py-8">
              <Loader size={32} />
            </View>
          ) : foods.length === 0 ? (
            <Text className={`text-base text-center py-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No menu items available
            </Text>
          ) : (
            Object.entries(groupedFoods).map(([category, categoryFoods]) => (
              <View key={category} className="mb-6">
                <Text className={`text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {category}
                </Text>
                {categoryFoods.map((food) => (
                  <View key={food.id} className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className="flex-1">
                      <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {food.name}
                      </Text>
                      {food.description && (
                        <Text className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {food.description}
                        </Text>
                      )}
                      <View className="flex-row items-center mt-1">
                        <Text className="text-sm font-bold text-orange-500">
                          Ksh {food.price}
                        </Text>
                        <Text className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {food.preparation_time} min
                        </Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1 rounded-xl ${
                      food.is_available 
                        ? (isDark ? 'bg-green-800' : 'bg-green-100') 
                        : (isDark ? 'bg-gray-700' : 'bg-gray-100')
                    }`}>
                      <Text className={`text-xs font-medium ${
                        food.is_available 
                          ? (isDark ? 'text-green-100' : 'text-green-800') 
                          : (isDark ? 'text-gray-400' : 'text-gray-600')
                      }`}>
                        {food.is_available ? 'Available' : 'Sold Out'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        <View className={`p-6 border-t flex-row gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <TouchableOpacity 
            className={`flex-1 py-4 rounded-xl items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            onPress={() => setShowRatingModal(true)}
          >
            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Rate & Review
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-orange-500 py-4 rounded-xl items-center">
            <Text className="text-white text-base font-bold">
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} animationType="slide" presentationStyle="pageSheet">
        <View className={`flex-1 pt-12 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Alert Box for Modal */}
          {alert?.visible && (
            <View className="mb-4">
              <AlertBox
                type={alert.type}
                message={alert.message}
                onClose={hideAlert}
              />
            </View>
          )}

          <View className="flex-row items-center justify-between mb-8">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Rate {vendor.name}
            </Text>
            <TouchableOpacity onPress={() => setShowRatingModal(false)} testID="favorite-button">
              <Ionicons name='close' size={24} color={isDark ? '#ffffff' : '#374151'} />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-8">
            <Text className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How was your experience?
            </Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name="star" 
                    size={40} 
                    color="#f59e0b" 
                    fill={star <= rating ? "#f59e0b" : "none"} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-8">
            <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tell us more about your experience
            </Text>
            <TextInput
              className={`border rounded-xl p-4 h-30 ${
                isDark 
                  ? 'border-gray-700 bg-gray-800 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="Share your thoughts about the food, service, and overall experience..."
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            className="bg-orange-500 py-4 rounded-xl items-center"
            onPress={submitReview}
            disabled={submittingReview}
          >
            <Text className="text-white text-lg font-bold">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}