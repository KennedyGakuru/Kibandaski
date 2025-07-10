import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../contexts/AuthContext';
import { SkeletonLoader } from './SkeletonLoader';

// Enhanced emoji map with more food categories
const emojiMap: { [key: string]: string } = {
  'Main Course': '🍽️',
  'Snacks': '🍿',
  'Drinks': '🥤',
  'Desserts': '🍰',
  'Breakfast': '🥞',
  'Lunch': '🍱',
  'Dinner': '🍖',
  'Fast Food': '🍔',
  'Street Food': '🌮',
  'Traditional': '🍲',
  'Vegetarian': '🥗',
  'Seafood': '🐟',
  'Grilled': '🔥',
  'Fried': '🍟',
  'Soup': '🍜',
  'Rice': '🍚',
  'Noodles': '🍝',
  'Bread': '🍞',
  'Chicken': '🍗',
  'Beef': '🥩',
  'Pork': '🥓',
  'Pizza': '🍕',
  'Burger': '🍔',
  'Sandwich': '🥪',
  'Salad': '🥗',
  'Fruit': '🍎',
  'Juice': '🧃',
  'Coffee': '☕',
  'Tea': '🍵',
  'Default': '🍽️',
};

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoriesProps {
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
}

export default function Categories({ onCategorySelect, selectedCategory }: CategoriesProps) {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with vendor count
      const { data, error } = await supabase
        .from('foods')
        .select(`
          category,
          vendor_id,
          vendors!inner (
            id,
            is_open
          )
        `)
        .eq('is_available', true)
        .eq('vendors.is_open', true);

      if (error) throw error;

      // Group by category and count unique vendors
      const categoryMap = new Map<string, Set<string>>();
      
      data?.forEach(item => {
        const category = item.category.trim();
        if (!categoryMap.has(category)) {
          categoryMap.set(category, new Set());
        }
        categoryMap.get(category)?.add(item.vendor_id);
      });

      // Convert to array and sort by vendor count
      const categoriesArray = Array.from(categoryMap.entries())
        .map(([name, vendorIds]) => ({
          id: name,
          name,
          count: vendorIds.size,
        }))
        .sort((a, b) => b.count - a.count);

      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          Categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={styles.categoryItemSkeleton}>
              <SkeletonLoader width={60} height={60} borderRadius={30} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={50} height={14} borderRadius={4} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
        Categories
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories Button */}
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === null && styles.categoryItemActive,
            { backgroundColor: selectedCategory === null ? '#f97316' : (isDark ? '#374151' : '#f3f4f6') }
          ]}
          onPress={() => onCategorySelect(null)}
        >
          <View style={[
            styles.categoryIcon,
            { backgroundColor: selectedCategory === null ? 'rgba(255,255,255,0.2)' : (isDark ? '#4b5563' : '#e5e7eb') }
          ]}>
            <Text style={styles.categoryEmoji}>🍽️</Text>
          </View>
          <Text style={[
            styles.categoryText,
            { color: selectedCategory === null ? '#ffffff' : (isDark ? '#ffffff' : '#111827') }
          ]}>
            All
          </Text>
          <Text style={[
            styles.categoryCount,
            { color: selectedCategory === null ? 'rgba(255,255,255,0.8)' : (isDark ? '#9ca3af' : '#6b7280') }
          ]}>
            {categories.reduce((sum, cat) => sum + cat.count, 0)}
          </Text>
        </TouchableOpacity>

        {/* Category Items */}
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          const emoji = emojiMap[category.name] || emojiMap.Default;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                isActive && styles.categoryItemActive,
                { backgroundColor: isActive ? '#f97316' : (isDark ? '#374151' : '#f3f4f6') }
              ]}
              onPress={() => onCategorySelect(category.id)}
            >
              <View style={[
                styles.categoryIcon,
                { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : (isDark ? '#4b5563' : '#e5e7eb') }
              ]}>
                <Text style={styles.categoryEmoji}>{emoji}</Text>
              </View>
              <Text style={[
                styles.categoryText,
                { color: isActive ? '#ffffff' : (isDark ? '#ffffff' : '#111827') }
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                { color: isActive ? 'rgba(255,255,255,0.8)' : (isDark ? '#9ca3af' : '#6b7280') }
              ]}>
                {category.count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItemActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryItemSkeleton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 10,
    fontWeight: '500',
  },
});