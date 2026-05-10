import Constants from 'expo-constants';

const GITHUB_RELEASES_API = 'https://api.github.com/repos/Promises/LibriSync/releases/latest';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  isUpdateAvailable: boolean;
}

function compareVersions(current: string, latest: string): boolean {
  const currentParts = current.replace(/^v/, '').split('.').map(Number);
  const latestParts = latest.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const c = currentParts[i] || 0;
    const l = latestParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const response = await fetch(GITHUB_RELEASES_API, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    if (!response.ok) return null;

    const release = await response.json();
    const latestVersion = release.tag_name as string;
    const currentVersion = Constants.expoConfig?.version || '0.0.0';

    const apkAsset = release.assets?.find(
      (a: any) => a.name?.endsWith('.apk')
    );
    const downloadUrl = apkAsset?.browser_download_url || release.html_url;

    return {
      currentVersion,
      latestVersion: latestVersion.replace(/^v/, ''),
      downloadUrl,
      isUpdateAvailable: compareVersions(currentVersion, latestVersion),
    };
  } catch {
    return null;
  }
}

export function isGithubReleaseBuild(): boolean {
  return Constants.expoConfig?.extra?.isGithubRelease === true;
}
