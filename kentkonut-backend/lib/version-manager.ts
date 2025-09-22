import fs from 'fs';
import path from 'path';

export interface VersionInfo {
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  changes: string[];
  type: 'initial' | 'feature' | 'bugfix' | 'infrastructure' | 'security';
  author: string;
}

export interface VersionHistory {
  currentVersion: string;
  versions: VersionInfo[];
}

const VERSION_HISTORY_PATH = path.join(process.cwd(), 'data', 'version-history.json');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

/**
 * Get version from package.json
 */
export function getPackageVersion(): string {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '1.0.0';
  }
}

/**
 * Get version history from JSON file
 */
export function getVersionHistory(): VersionHistory {
  try {
    const data = fs.readFileSync(VERSION_HISTORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading version history:', error);
    // Return default version history if file doesn't exist
    return {
      currentVersion: getPackageVersion(),
      versions: [{
        version: getPackageVersion(),
        title: 'Current Version',
        description: 'Kent Konut Admin Panel',
        releaseDate: new Date().toISOString(),
        changes: ['Initial setup'],
        type: 'initial',
        author: 'Kent Konut Dev Team'
      }]
    };
  }
}

/**
 * Get current version info
 */
export function getCurrentVersionInfo(): VersionInfo | null {
  const history = getVersionHistory();
  const currentVersion = history.currentVersion || getPackageVersion();
  
  return history.versions.find(v => v.version === currentVersion) || null;
}

/**
 * Get latest version info (first in the list)
 */
export function getLatestVersionInfo(): VersionInfo | null {
  const history = getVersionHistory();
  return history.versions[0] || null;
}

/**
 * Save version history to JSON file
 */
export function saveVersionHistory(history: VersionHistory): boolean {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(VERSION_HISTORY_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(VERSION_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving version history:', error);
    return false;
  }
}

/**
 * Add new version to history
 */
export function addNewVersion(versionInfo: Omit<VersionInfo, 'releaseDate'>): boolean {
  try {
    const history = getVersionHistory();
    
    const newVersion: VersionInfo = {
      ...versionInfo,
      releaseDate: new Date().toISOString()
    };

    // Add to beginning of versions array
    history.versions.unshift(newVersion);
    
    // Update current version
    history.currentVersion = versionInfo.version;

    return saveVersionHistory(history);
  } catch (error) {
    console.error('Error adding new version:', error);
    return false;
  }
}

/**
 * Update current version info
 */
export function updateCurrentVersion(updates: Partial<Omit<VersionInfo, 'version' | 'releaseDate'>>): boolean {
  try {
    const history = getVersionHistory();
    const currentVersionIndex = history.versions.findIndex(v => v.version === history.currentVersion);
    
    if (currentVersionIndex === -1) {
      return false;
    }

    // Update the current version info
    history.versions[currentVersionIndex] = {
      ...history.versions[currentVersionIndex],
      ...updates
    };

    return saveVersionHistory(history);
  } catch (error) {
    console.error('Error updating current version:', error);
    return false;
  }
}

/**
 * Get version type badge color
 */
export function getVersionTypeBadgeColor(type: VersionInfo['type']): string {
  switch (type) {
    case 'initial':
      return 'bg-blue-500';
    case 'feature':
      return 'bg-green-500';
    case 'bugfix':
      return 'bg-yellow-500';
    case 'infrastructure':
      return 'bg-purple-500';
    case 'security':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Format version for display
 */
export function formatVersion(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}

/**
 * Format release date for display
 */
export function formatReleaseDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}
