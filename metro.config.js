const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// ✅ Block native source folders from watching
config.resolver.blockList = exclusionList([
  // React Native core Android folders
  /.*\/node_modules\/react-native\/ReactAndroid\/.*/,
  /.*\/node_modules\/react-native\/ReactCommon\/react\/renderer\/.*/,
  /.*\/node_modules\/react-native\/ReactCommon\/react\/debug\/.*/,
  /.*\/node_modules\/react-native\/ReactCommon\/yoga\/.*/,

  // expo-video native Android
  //.*\/node_modules\/expo-video\/android\/.*/,

  // Any Android native code from Firebase or other libs
  /.*\/node_modules\/@react-native.*\/android\/.*/,

  // Optional: ignore .expo
  ///.*\/\.expo\/.*/,
  
   /.*\/node_modules\/firebase\/.*/,
  /.*\/node_modules\/@firebase\/auth\/dist\/node\/.*/,
]);

module.exports = config;