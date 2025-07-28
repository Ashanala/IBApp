const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// ✅ Exclude only deep native source folders — not entire packages
config.resolver.blockList = exclusionList([
  /.*\/node_modules\/react-native\/ReactAndroid\/src\/main\/java\/.*/,
  /.*\/node_modules\/expo-av\/android\/.*/,
  /.*\/node_modules\/react-native-google-mobile-ads\/android\/.*/,
  /.*\/node_modules\/@react-native-firebase\/.*\/android\/.*/,
  /.*\/\.expo\/.*/,
]);

module.exports = config;