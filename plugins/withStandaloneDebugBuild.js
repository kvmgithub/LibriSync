const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withStandaloneDebugBuild(config) {
  if (process.env.EXPO_SIDE_BY_SIDE_DEBUG !== 'true') {
    return config;
  }

  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    if (!buildGradle.includes('debuggableVariants = []')) {
      buildGradle = buildGradle.replace(
        '    bundleCommand = "export:embed"',
        '    bundleCommand = "export:embed"\n    debuggableVariants = []'
      );
    }

    config.modResults.contents = buildGradle;
    return config;
  });
};
