import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../contexts/AuthContext';

interface Vendor {
  id: string;
  name: string;
}

interface Food {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
}

export default function VendorMenuScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparation_time: '10',
    is_available: true,
  });

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [user]);

  const fetchVendorData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (vendorError) throw vendorError;

      if (vendorData) {
        setVendor(vendorData);

        const { data: foodsData, error: foodsError } = await supabase
          .from('foods')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });

        if (foodsError) throw foodsError;

        setFoods(foodsData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      Alert.alert('Error', 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const addFood = async () => {
    if (!vendor) return;

    if (!foodForm.name.trim() || !foodForm.price.trim() || !foodForm.category.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          vendor_id: vendor.id,
          name: foodForm.name.trim(),
          description: foodForm.description.trim(),
          price: parseFloat(foodForm.price),
          category: foodForm.category.trim(),
          preparation_time: parseInt(foodForm.preparation_time) || 10,
          is_available: foodForm.is_available,
        })
        .select()
        .single();

      if (error) throw error;

      setFoods(prev => [data, ...prev]);
      setShowAddFood(false);
      resetFoodForm();
      Alert.alert('Success', 'Food item added!');
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food item');
    }
  };

  const updateFood = async () => {
    if (!editingFood) return;

    if (!foodForm.name.trim() || !foodForm.price.trim() || !foodForm.category.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .update({
          name: foodForm.name.trim(),
          description: foodForm.description.trim(),
          price: parseFloat(foodForm.price),
          category: foodForm.category.trim(),
          preparation_time: parseInt(foodForm.preparation_time) || 10,
          is_available: foodForm.is_available,
        })
        .eq('id', editingFood.id)
        .select()
        .single();

      if (error) throw error;

      setFoods(prev => prev.map(food => (food.id === editingFood.id ? data : food)));
      setEditingFood(null);
      setShowAddFood(false);
      resetFoodForm();
      Alert.alert('Success', 'Food item updated!');
    } catch (error) {
      console.error('Error updating food:', error);
      Alert.alert('Error', 'Failed to update food item');
    }
  };

  const deleteFood = async (foodId: string) => {
    Alert.alert('Delete Food Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('foods').delete().eq('id', foodId);

            if (error) throw error;

            setFoods(prev => prev.filter(food => food.id !== foodId));
            Alert.alert('Success', 'Food item deleted!');
          } catch (error) {
            console.error('Error deleting food:', error);
            Alert.alert('Error', 'Failed to delete food item');
          }
        },
      },
    ]);
  };

  const toggleFoodAvailability = async (foodId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('foods')
        .update({ is_available: isAvailable })
        .eq('id', foodId);

      if (error) throw error;

      setFoods(prev =>
        prev.map(food => (food.id === foodId ? { ...food, is_available: isAvailable } : food))
      );
    } catch (error) {
      console.error('Error updating food availability:', error);
      Alert.alert('Error', 'Failed to update food availability');
    }
  };

  const startEditFood = (food: Food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description || '',
      price: food.price.toString(),
      category: food.category,
      preparation_time: food.preparation_time.toString(),
      is_available: food.is_available,
    });
    setShowAddFood(true);
  };

  const resetFoodForm = () => {
    setFoodForm({
      name: '',
      description: '',
      price: '',
      category: '',
      preparation_time: '10',
      is_available: true,
    });
  };

  const closeAddFoodModal = () => {
    setShowAddFood(false);
    setEditingFood(null);
    resetFoodForm();
  };

  const groupedFoods = foods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as Record<string, Food[]>);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className={`flex-row items-center justify-between pt-12 pb-4 px-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#374151'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 text-center mx-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Menu Management
        </Text>
        <TouchableOpacity className="bg-orange-500 p-2 rounded-full" onPress={() => setShowAddFood(true)}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {loading ? (
          <View className="flex-1 justify-center items-center py-16">
            <Text className={`text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading menu...</Text>
          </View>
        ) : foods.length === 0 ? (
          <View className="flex-1 justify-center items-center py-16">
            <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>No menu items yet</Text>
            <Text className={`text-base mt-2 text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add your first menu item to get started
            </Text>
          </View>
        ) : (
          Object.entries(groupedFoods).map(([category, categoryFoods]) => (
            <View
              key={category}
              className={`rounded-xl p-4 mb-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {category} ({categoryFoods.length})
              </Text>
              {categoryFoods.map(food => (
                <View
                  key={food.id}
                  className={`flex-row items-center justify-between p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <View className="flex-1">
                    <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{food.name}</Text>
                    {food.description && (
                      <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {food.description}
                      </Text>
                    )}
                    <Text className="text-sm font-bold mt-1 text-orange-500">
                      Ksh {food.price} • {food.preparation_time} min
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="p-1" onPress={() => startEditFood(food)}>
                      <Ionicons name="create" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1" onPress={() => deleteFood(food.id)}>
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                    <Switch
                      value={food.is_available}
                      onValueChange={value => toggleFoodAvailability(food.id, value)}
                      thumbColor={food.is_available ? '#f97316' : '#f4f3f4'}
                      trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddFood} animationType="slide" presentationStyle="pageSheet">
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className={`flex-row items-center justify-between p-6 pt-12 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingFood ? 'Edit Food Item' : 'Add Food Item'}
            </Text>
            <TouchableOpacity onPress={closeAddFoodModal}>
              <Ionicons name="close" size={24} color={isDark ? '#ffffff' : '#374151'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="mb-5">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Food Name *</Text>
              <TextInput
                className={`border rounded-lg p-3 text-base ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder="Enter food name"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={foodForm.name}
                onChangeText={text => setFoodForm(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View className="mb-5">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</Text>
              <TextInput
                className={`border rounded-lg p-3 text-base h-20 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                style={{ textAlignVertical: 'top' }}
                placeholder="Describe your food"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={foodForm.description}
                onChangeText={text => setFoodForm(prev => ({ ...prev, description: text }))}
                multiline
              />
            </View>

            <View className="flex-row gap-4 mb-5">
              <View className="flex-1">
                <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Price (Ksh) *</Text>
                <TextInput
                  className={`border rounded-lg p-3 text-base ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="50"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                  value={foodForm.price}
                  onChangeText={text => setFoodForm(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Prep Time (min)</Text>
                <TextInput
                  className={`border rounded-lg p-3 text-base ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="10"
                  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                  value={foodForm.preparation_time}
                  onChangeText={text => setFoodForm(prev => ({ ...prev, preparation_time: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Category *</Text>
              <TextInput
                className={`border rounded-lg p-3 text-base ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., Main Course, Snacks, Drinks"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={foodForm.category}
                onChangeText={text => setFoodForm(prev => ({ ...prev, category: text }))}
              />
            </View>

            <View className="flex-row items-center justify-between mb-8">
              <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Available</Text>
              <Switch
                value={foodForm.is_available}
                onValueChange={value => setFoodForm(prev => ({ ...prev, is_available: value }))}
                thumbColor={foodForm.is_available ? '#f97316' : '#f4f3f4'}
                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
              />
            </View>

            <TouchableOpacity className="bg-orange-500 p-4 rounded-xl items-center mb-6" onPress={editingFood ? updateFood : addFood}>
              <Text className="text-white text-lg font-bold">{editingFood ? 'Update Item' : 'Add Item'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}