const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to add background/download services and receivers to AndroidManifest.xml
 *
 * This ensures that when running `npx expo prebuild`, the service and receiver are properly
 * declared in the generated AndroidManifest.xml.
 */
const withDownloadService = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;
    const application = androidManifest.manifest.application[0];

    const ensurePermission = (name) => {
      if (!manifest['uses-permission']) {
        manifest['uses-permission'] = [];
      }

      const exists = manifest['uses-permission'].some(
        (permission) => permission.$['android:name'] === name
      );

      if (!exists) {
        manifest['uses-permission'].push({
          $: {
            'android:name': name,
          },
        });
      }
    };

    const ensureService = (name, attrs) => {
      if (!application.service) {
        application.service = [];
      }

      const existing = application.service.find(
        (service) => service.$['android:name'] === name
      );

      if (existing) {
        existing.$ = {
          ...existing.$,
          ...attrs,
        };
      } else {
        application.service.push({
          $: {
            'android:name': name,
            ...attrs,
          },
        });
      }
    };

    const ensureReceiver = (name, attrs, actions) => {
      if (!application.receiver) {
        application.receiver = [];
      }

      const existing = application.receiver.find(
        (receiver) => receiver.$['android:name'] === name
      );

      const intentFilter = {
        action: actions.map((action) => ({
          $: { 'android:name': action },
        })),
      };

      if (existing) {
        existing.$ = {
          ...existing.$,
          ...attrs,
        };
        existing['intent-filter'] = [intentFilter];
      } else {
        application.receiver.push({
          $: {
            'android:name': name,
            ...attrs,
          },
          'intent-filter': [intentFilter],
        });
      }
    };

    ensurePermission('android.permission.RECEIVE_BOOT_COMPLETED');

    // Add DownloadService
    ensureService('expo.modules.rustbridge.DownloadService', {
      'android:exported': 'false',
      'android:foregroundServiceType': 'dataSync',
    });

    // Add BackgroundTaskService
    ensureService('expo.modules.rustbridge.tasks.BackgroundTaskService', {
      'android:exported': 'false',
      'android:foregroundServiceType': 'dataSync',
    });

    // Add DownloadActionReceiver
    ensureReceiver(
      'expo.modules.rustbridge.DownloadActionReceiver',
      { 'android:exported': 'false' },
      [
        'expo.modules.rustbridge.PAUSE_DOWNLOAD',
        'expo.modules.rustbridge.RESUME_DOWNLOAD',
        'expo.modules.rustbridge.CANCEL_DOWNLOAD',
      ]
    );

    // Add BootReceiver
    ensureReceiver(
      'expo.modules.rustbridge.tasks.BootReceiver',
      { 'android:exported': 'false' },
      [
        'android.intent.action.BOOT_COMPLETED',
        'android.intent.action.MY_PACKAGE_REPLACED',
      ]
    );

    return config;
  });
};

module.exports = withDownloadService;
