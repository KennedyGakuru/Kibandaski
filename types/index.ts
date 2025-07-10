export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  user_type: 'customer' | 'vendor';
  created_at: string;
}

export interface Vendor {
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

export interface Food {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  vendor_id: string;
  created_at: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface AnalyticsData {
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

export interface FeaturedVendor {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  vendors: {
    id: string;
    name: string;
    address: string;
    rating: number;
    total_reviews: number;
    is_open: boolean;
    latitude: number;
    longitude: number;
  };
}


