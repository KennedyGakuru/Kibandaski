const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver for react-native-maps
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': require.resolve('react-native-web-maps'),
};

// Ensure web platform is included
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

// Add resolver for native-only modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });