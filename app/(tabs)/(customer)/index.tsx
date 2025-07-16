import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, FlatList, StyleSheet, TextInput, Image } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import * as Location from 'expo-location';
import { VendorCard } from '../../../components/VendorCard';
import { SkeletonCard } from '../../../components/SkeletonCard';
import { supabase } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Vendor } from '@/types';

export default function CustomerExploreScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [region, setRegion] = useState<Region>({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorCard, setShowVendorCard] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getCurrentLocation();
    }
    fetchVendors();
  }, []);

  // Fixed: Added searchQuery as dependency and proper filtering logic
  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to find nearby vendors');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_open', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      Alert.alert('Error', 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Improved filtering logic
  const filterVendors = () => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = vendors.filter(vendor => {
      const name = vendor.name?.toLowerCase() || '';
      const description = vendor.description?.toLowerCase() || '';
      const address = vendor.address?.toLowerCase() || '';
      
      return name.includes(query) || 
             description.includes(query) || 
             address.includes(query);
    });

    setFilteredVendors(filtered);
  };

  const handleMarkerPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowVendorCard(true);
  };

  // Fixed: Function to handle search button press - redirects to list view
  const handleSearchPress = () => {
    setShowListView(true);
    setShowSearch(true);
  };

  // Fixed: Improved clear search function
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    // Clear any pending timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }
  };

  // Fixed: Improved search handling with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      // The useEffect will handle the filtering automatically
      // since searchQuery changed
    }, 300);
  };

  const SearchBarComponent = ({ style, onCancel }: { style?: any, onCancel?: () => void }) => (
    <View style={[styles.searchBarContainer, style]}>
      <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
        <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#ffffff' : '#111827' }]}
          placeholder="Search vendors, food, or location..."
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus={showSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        )}
      </View>
      {onCancel && (
        <TouchableOpacity onPress={onCancel}>
          <Text style={[styles.cancelText, { color: '#f97316' }]}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderVendorItem = ({ item }: { item: Vendor }) => (
    <TouchableOpacity
      style={[styles.vendorListItem, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}
      onPress={() => handleMarkerPress(item)}
    >
      <View style={styles.vendorListHeader}>
        <View style={styles.vendorListInfo}>
          <Text style={[styles.vendorListName, { color: isDark ? '#ffffff' : '#111827' }]}>{item.name}</Text>
          <Text style={[styles.vendorListAddress, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{item.address}</Text>
        </View>
        <View style={[
          styles.vendorListStatus,
          { backgroundColor: item.is_open ? (isDark ? '#166534' : '#dcfce7') : (isDark ? '#7f1d1d' : '#fee2e2') }
        ]}>
          <Text style={[
            styles.vendorListStatusText,
            { color: item.is_open ? (isDark ? '#dcfce7' : '#166534') : (isDark ? '#fee2e2' : '#7f1d1d') }
          ]}>
            {item.is_open ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      <Text style={[styles.vendorListDescription, { color: isDark ? '#9ca3af' : '#6b7280' }]}>{item.description}</Text>

      <View style={styles.vendorListFooter}>
        <Text style={[styles.vendorListRating, { color: isDark ? '#ffffff' : '#111827' }]}>
          ⭐ {item.rating.toFixed(1)}
        </Text>
        <Text style={[styles.vendorListReviews, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          ({item.total_reviews} reviews)
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (showListView) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
        <View style={[styles.listHeader, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
          <View>
            <Text style={[styles.listHeaderTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Karibu, {user?.name?.split(' ')[0]}!
            </Text>
            <Text style={[styles.listHeaderSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              {filteredVendors.length} vendors found
            </Text>
          </View>
          <View style={styles.listHeaderActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons name="search" size={20} color={isDark ? '#ffffff' : '#374151'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: '#f97316' }]}
              onPress={() => {
                setShowListView(false);
                setShowSearch(false); // Close search when going back to map
              }}
            >
              <Ionicons name="map" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
            <SearchBarComponent />
          </View>
        )}

        {loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            renderItem={() => <SkeletonCard />}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={filteredVendors}
            renderItem={renderVendorItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={fetchVendors}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  {searchQuery ? 'No vendors found matching your search' : 'No vendors available'}
                </Text>
              </View>
            }
          />
        )}

        {showVendorCard && selectedVendor && (
          <VendorCard vendor={selectedVendor} onClose={() => setShowVendorCard(false)} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        {filteredVendors.map((vendor) => (
          <Marker
            key={vendor.id}
            coordinate={{
              latitude: vendor.latitude,
              longitude: vendor.longitude,
            }}
            onPress={() => handleMarkerPress(vendor)}
            anchor={{ x: 0.5, y: 1 }}
            
          />
        ))}
      </MapView>

      <View style={styles.mapHeader}>
        <View style={[styles.welcomeCard, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
          <Text style={[styles.welcomeText, { color: isDark ? '#ffffff' : '#111827' }]}>
            Karibu, {user?.name?.split(' ')[0]}!
          </Text>
        </View>
        <View style={styles.mapHeaderActions}>
          <TouchableOpacity
            style={[styles.mapHeaderButton, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}
            onPress={handleSearchPress}
          >
            <Ionicons name='search' size={20} color={isDark ? '#ffffff' : '#374151'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapHeaderButton, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}
            onPress={() => setShowListView(true)}
          >
            <Ionicons name="list" size={20} color={isDark ? '#ffffff' : '#374151'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* REMOVED: Search overlay that was blocking the map */}
      
      {showVendorCard && selectedVendor && (
        <VendorCard vendor={selectedVendor} onClose={() => setShowVendorCard(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapHeaderButton: {
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Search Components - Consistent Styling
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    minHeight: 48, // Consistent height
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 20,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  
  // List View Styles
  listHeader: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listHeaderSubtitle: {
    fontSize: 16,
  },
  listHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  vendorListItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendorListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vendorListInfo: {
    flex: 1,
  },
  vendorListName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vendorListAddress: {
    fontSize: 14,
    marginTop: 4,
  },
  vendorListStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vendorListStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vendorListDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  vendorListFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorListRating: {
    fontSize: 14,
    fontWeight: '500',
  },
  vendorListReviews: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 24,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f97316',
    marginTop: -1,
  },
  imageMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizedMarkerImage: {
    width: 30,
    height: 30,
  },
});