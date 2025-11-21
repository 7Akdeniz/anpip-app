module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated - muss das letzte Plugin sein!
      'react-native-reanimated/plugin',
    ],
  };
};
