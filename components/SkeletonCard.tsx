import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SkeletonLoader } from './SkeletonLoader';

export const SkeletonCard = () => {
  const { isDark } = useTheme();

  return (
    <View className={`mx-4 mb-4 rounded-xl shadow overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`} testID="skeleton-card">
      {/* Image skeleton */}
      <SkeletonLoader width="100%" height={192} borderRadius={0} />
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            {/* Name skeleton */}
            <SkeletonLoader width="60%" height={20} borderRadius={4} style={{ marginBottom: 8 }} />
            
            {/* Address skeleton */}
            <View className="flex-row items-center mt-1">
              <SkeletonLoader width={14} height={14} borderRadius={2} />
              <SkeletonLoader width="70%" height={14} borderRadius={4} style={{ marginLeft: 8 }} />
            </View>
          </View>
          
          {/* Heart button skeleton */}
          <SkeletonLoader width={36} height={36} borderRadius={18} />
        </View>
        
        {/* Description skeleton */}
        <SkeletonLoader width="90%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="70%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
        
        <View className="flex-row items-center justify-between">
          {/* Rating skeleton */}
          <View className="flex-row items-center">
            <SkeletonLoader width={16} height={16} borderRadius={2} />
            <SkeletonLoader width={30} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
            <SkeletonLoader width={80} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
          </View>
          
          {/* Status badge skeleton */}
          <SkeletonLoader width={60} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};
