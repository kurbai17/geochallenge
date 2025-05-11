module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: ['react-native-reanimated/plugin'], // 👈 asegúrate de tener esto
    };
  };
  