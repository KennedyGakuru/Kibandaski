import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { supabase } from '../contexts/AuthContext';
import { SkeletonCard } from './SkeletonCard';
import { FeaturedVendor } from '@/types';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85;



interface FeaturedHiddenGemsProps {
  onVendorPress: (vendor: any) => void;
}

export function FeaturedHiddenGems({ onVendorPress }: FeaturedHiddenGemsProps) {
  const { isDark } = useTheme();
  const [featuredVendors, setFeaturedVendors] = useState<FeaturedVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVendors();
  }, []);

  const fetchFeaturedVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('featured_vendors')
        .select(`
          *,
          vendors (
            id,
            name,
            address,
            rating,
            total_reviews,
            is_open,
            latitude,
            longitude
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFeaturedVendors(data || []);
    } catch (error) {
      console.error('Error fetching featured vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorPress = (featuredVendor: FeaturedVendor) => {
    const vendor = {
      ...featuredVendor.vendors,
      description: featuredVendor.description,
      image_url: featuredVendor.image_url,
    };
    onVendorPress(vendor);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          ✨ Hidden Gems
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3].map((index) => (
            <View key={index} style={[styles.skeletonCard, { width: cardWidth }]}>
              <SkeletonCard />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (featuredVendors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
        ✨ Hidden Gems
      </Text>
      <Text style={[styles.sectionSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
        Discover amazing local spots curated just for you
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={cardWidth + 16}
        snapToAlignment="start"
      >
        {featuredVendors.map((featuredVendor, index) => (
          <TouchableOpacity
            key={featuredVendor.id}
            style={[
              styles.featuredCard,
              { 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                width: cardWidth,
                marginLeft: index === 0 ? 24 : 8,
                marginRight: index === featuredVendors.length - 1 ? 24 : 8,
              }
            ]}
            onPress={() => handleVendorPress(featuredVendor)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: featuredVendor.image_url }} 
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.gemBadge}>
                <Text style={styles.gemBadgeText}>💎 Hidden Gem</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: featuredVendor.vendors.is_open ? '#22c55e' : '#ef4444' }
              ]}>
                <Text style={styles.statusText}>
                  {featuredVendor.vendors.is_open ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={[styles.featuredTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                {featuredVendor.vendors.name}
              </Text>
              
              <View style={styles.locationRow}>
                <MapPin size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.locationText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  {featuredVendor.vendors.address}
                </Text>
              </View>
              
              <Text style={[styles.featuredDescription, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                {featuredVendor.description}
              </Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <Text style={[styles.ratingText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    {featuredVendor.vendors.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.reviewsText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                    ({featuredVendor.vendors.total_reviews})
                  </Text>
                </View>
                
                <View style={styles.timeContainer}>
                  <Clock size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <Text style={[styles.timeText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                    15-20 min
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  skeletonCard: {
    marginHorizontal: 8,
  },
  featuredCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  gemBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gemBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  featuredDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
  },
});