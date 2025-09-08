import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryFile = path.join(__dirname, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));

/** Default Configuration **/
const DEFAULT_CONFIG = {
  urls: {
    development: 'https://raw.githubusercontent.com/prompt-registry/core/develop/registry.json',
    production: 'https://cdn.jsdelivr.net/gh/prompt-registry/core@main/registry.json'
  },
  policies: {
    autoSync: false,
    backgroundSync: false,
    syncInterval: 86400000, // 24 hours in ms
    timeout: 30000,
    retryAttempts: 3
  },
  security: {
    trustedDomains: [
      'githubusercontent.com',
      'github.com',
      'cdn.jsdelivr.net',
      'raw.githubusercontent.com',
      'unpkg.com',
      'jsdelivr.net'
    ],
    requireHttps: true,
    certificateValidation: true,
    maxPayloadSize: 104857600 // 100MB
  },
  cache: {
    directory: path.join(__dirname, '.cache'),
    ttl: 3600000, // 1 hour in ms
    maxSize: 104857600 // 100MB
  }
};

/**
 * Loads configuration from environment variables and config files
 * @returns {object} Merged configuration object
 */
function loadConfig() {
  const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep clone

  // Load from environment variables
  const envUrl = process.env.PROMPT_REGISTRY_SYNC_URL ||
                 process.env.PROMPT_SYNC_URL ||
                 process.env.PROMPT_REGISTRY_URL;

  if (envUrl) {
    const envType = (process.env.NODE_ENV === 'production') ? 'production' : 'development';
    config.urls[envType] = envUrl;
  }

  // Try to load from home directory config
  const homeConfigPath = path.join(os.homedir(), '.config', 'prompt-registry.json');
  try {
    if (fs.existsSync(homeConfigPath)) {
      const homeConfig = JSON.parse(fs.readFileSync(homeConfigPath, 'utf8'));
      mergeConfigs(config, homeConfig);
    }
  } catch (error) {
    // Silently ignore config parsing errors
  }

  // Try to load from current working directory
  const cwdConfigPath = path.join(process.cwd(), 'prompt-registry.config.json');
  try {
    if (fs.existsSync(cwdConfigPath)) {
      const cwdConfig = JSON.parse(fs.readFileSync(cwdConfigPath, 'utf8'));
      mergeConfigs(config, cwdConfig);
    }
  } catch (error) {
    // Silently ignore config parsing errors
  }

  return config;
}

/**
 * Deep merges source config into target config
 * @param {object} target - Target configuration object
 * @param {object} source - Source configuration object
 */
function mergeConfigs(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && typeof target[key] === 'object') {
        mergeConfigs(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

// Load configuration
const config = loadConfig();

/** Registry Metadata Tracking **/
let registryMetadata = {
 localVersion: '1.0.0', // Initial version
 lastSync: null,
 lastModified: new Date(fs.statSync(registryFile).mtime),
 syncUrl: null,
 schemaVersion: '1.0'
};

/** Cache Management **/
/**
* Reports progress with optional callback
* @param {SyncOptions} options - Sync options
* @param {string} stage - Current sync stage
* @param {number} progress - Progress percentage
*/
function reportProgress(options, stage, progress) {
 if (options.progressCallback) {
   options.progressCallback(stage, progress);
 }
}

/**
* Checks if cache directory exists and creates it if needed
*/
function ensureCacheDirectory() {
 if (!fs.existsSync(config.cache.directory)) {
   fs.mkdirSync(config.cache.directory, { recursive: true });
 }
}

/**
* Gets cache file path for a URL
* @param {string} url - Cache URL
* @returns {string} Cache file path
*/
function getCacheFilePath(url) {
 const urlHash = Buffer.from(url).toString('base64url');
 return path.join(config.cache.directory, `${urlHash}.cache.json`);
}

/**
* Loads cached remote registry if available and valid
* @param {string} url - Remote URL
* @returns {object|null} Cached registry data
*/
function loadFromCache(url) {
 try {
   const cacheFile = getCacheFilePath(url);
   if (fs.existsSync(cacheFile)) {
     const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
     const cacheAge = Date.now() - cacheData.timestamp;

     if (cacheAge < config.cache.ttl) {
       return cacheData.data;
     }
   }
 } catch (error) {
   // Cache corruption - ignore and fetch fresh
 }
 return null;
}

/**
 * Saves remote registry to cache
 * @param {string} url - Remote URL
 * @param {object} data - Registry data to cache
 */
function saveToCache(url, data) {
  try {
    ensureCacheDirectory();
    const cacheFile = getCacheFilePath(url);
    const cacheEntry = {
      timestamp: Date.now(),
      url: url,
      data: data
    };

    fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry), 'utf8');
  } catch (error) {
    // Cache write failure - non-critical
  }
}

/** Custom Error Class **/
export class SyncError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'SyncError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Compares semantic versions
 * @param {string} a - Version string A
 * @param {string} b - Version string B
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }

  return 0;
}

/**
 * Generates GUID for background sync
 * @returns {string} Unique identifier
 */
function generateSyncId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/** Network Layer **/
/**
 * Validates if a URL is from trusted domain
 * @param {string} url - URL to validate
 * @returns {boolean} True if domain is trusted
 */
function isTrustedDomain(url) {
  try {
    const parsedUrl = new URL(url);

    if (config.security.requireHttps && parsedUrl.protocol !== 'https:') {
      return false;
    }

    const hostname = parsedUrl.hostname;
    return config.security.trustedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    return false; // Invalid URL
  }
}

/**
 * Fetches remote registry with retry logic and timeout
 * @param {string} url - Remote URL
 * @param {SyncOptions} options - Sync options
 * @returns {Promise<object>} Remote registry data
 */
async function fetchRemoteRegistry(url, options) {
  if (!isTrustedDomain(url)) {
    throw new SyncError('CERTIFICATE_ERROR', `Untrusted domain: ${new URL(url).hostname}`, { url });
  }

  const abortController = new AbortController();
  const timeout = options.timeout || config.policies.timeout;

  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  let lastError;

  for (let attempt = 1; attempt <= config.policies.retryAttempts; attempt++) {
    try {
      reportProgress(options, 'fetching', Math.round((attempt - 1) / config.policies.retryAttempts * 20));

      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PromptRegistry/2.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new SyncError('NETWORK_ERROR',
          `HTTP ${response.status}: ${response.statusText}`, { url, status: response.status });
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new SyncError('INVALID_SCHEMA',
          `Invalid content type: ${contentType}`, { url, contentType });
      }

      const data = await response.json();

      // Validate payload size
      const dataSize = JSON.stringify(data).length;
      if (dataSize > config.security.maxPayloadSize) {
        throw new SyncError('QUOTA_EXCEEDED',
          `Payload too large: ${dataSize} bytes`, { url, size: dataSize });
      }

      return data;

    } catch (error) {
      lastError = error;

      if (attempt < config.policies.retryAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        clearTimeout(timeoutId);
      }
    }
  }

  const error = lastError instanceof SyncError ? lastError :
                new SyncError('NETWORK_ERROR', lastError.message || 'Network request failed', { url, lastError });

  throw error;
}

/**
 * Validates remote registry schema
 * @param {object} data - Remote registry data
 * @returns {boolean} True if schema is valid
 */
function validateRemoteSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new SyncError('INVALID_SCHEMA', 'Registry must be an object', { data });
  }

  if (!data.prompts || typeof data.prompts !== 'object') {
    throw new SyncError('INVALID_SCHEMA', 'Registry must contain "prompts" object', { data });
  }

  // Validate each prompt entry
  for (const [promptId, entry] of Object.entries(data.prompts)) {
    if (!entry.latest || typeof entry.latest !== 'string') {
      throw new SyncError('INVALID_SCHEMA', `Prompt ${promptId} missing valid "latest" version`, { promptId, entry });
    }

    if (!entry.versions || typeof entry.versions !== 'object') {
      throw new SyncError('INVALID_SCHEMA', `Prompt ${promptId} missing "versions" object`, { promptId, entry });
    }

    // Validate at least one version exists
    const latestVersionData = entry.versions[entry.latest];
    if (!latestVersionData || typeof latestVersionData !== 'object') {
      throw new SyncError('INVALID_SCHEMA', `Prompt ${promptId} latest version "${entry.latest}" not found`, { promptId, entry });
    }

    // Validate required fields for latest version
    const requiredFields = ['description', 'prompt', 'category', 'tags', 'version'];
    for (const field of requiredFields) {
      if (!(field in latestVersionData)) {
        throw new SyncError('INVALID_SCHEMA',
          `Prompt ${promptId}@${entry.latest} missing required field: ${field}`, { promptId, entry });
      }
    }
  }

  return true;
}

/** Version-Aware Merger **/
/**
 * Merges remote registry into local registry with local priority
 * @param {object} remoteRegistry - Remote registry data
 * @param {object} remoteMetadata - Remote registry metadata
 * @param {SyncOptions} options - Sync options
 * @returns {object} Merge result with statistics
 */
function mergeRegistries(remoteRegistry, remoteMetadata, options) {
  const result = {
    newPrompts: 0,
    updatedPrompts: 0,
    conflicts: [],
    warnings: []
  };

  for (const [promptId, remoteEntry] of Object.entries(remoteRegistry.prompts)) {
    if (!registry[promptId]) {
      // New prompt from remote
      registry[promptId] = { ...remoteEntry };
      result.newPrompts++;
      continue;
    }

    const localEntry = registry[promptId];
    const localLatestVersion = localEntry.versions[localEntry.latest];
    const remoteLatestVersion = remoteEntry.versions[remoteEntry.latest];

    const versionComparison = compareVersions(localEntry.latest, remoteEntry.latest);
    const localNewer = versionComparison > 0;
    const remoteNewer = versionComparison < 0;

    if (localNewer) {
      // Local is newer - keep local but add remote versions if they don't exist
      for (const [version, versionData] of Object.entries(remoteEntry.versions)) {
        if (!localEntry.versions[version]) {
          localEntry.versions[version] = { ...versionData };
        }
      }
    } else if (remoteNewer) {
      // Remote is newer - update based on merge strategy
      if (options.mergeStrategy === 'prefer-remote') {
        // Update latest pointer and add all remote versions
        localEntry.latest = remoteEntry.latest;
        for (const [version, versionData] of Object.entries(remoteEntry.versions)) {
          localEntry.versions[version] = { ...versionData };
        }
        result.updatedPrompts++;
      } else {
        // prefer-local or interactive - only add missing versions
        for (const [version, versionData] of Object.entries(remoteEntry.versions)) {
          if (!localEntry.versions[version] && compareVersions(version, localEntry.latest) === 1) {
            // This version is newer than local latest, add it
            localEntry.versions[version] = { ...versionData };
            result.warnings.push(`Added newer version ${version} to local prompt ${promptId}`);
          }
        }
      }
    } else {
      // Same version - merge other versions if missing
      for (const [version, versionData] of Object.entries(remoteEntry.versions)) {
        if (!localEntry.versions[version]) {
          localEntry.versions[version] = { ...versionData };
        }
      }
    }

    // Update schema version if remote is newer
    if (remoteMetadata.schemaVersion) {
      const schemaComparison = compareVersions(remoteMetadata.schemaVersion, registryMetadata.schemaVersion);
      if (schemaComparison > 0) {
        registryMetadata.schemaVersion = remoteMetadata.schemaVersion;
      }
    }
  }

  return result;
}

/**
 * Saves updated local registry to disk
 */
function saveLocalRegistry() {
  try {
    fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2), 'utf8');
    registryMetadata.lastModified = new Date();
  } catch (error) {
    throw new SyncError('QUOTA_EXCEEDED', `Failed to save registry: ${error.message}`, { error });
  }
}

/** Core Sync Function **/
/**
 * Synchronizes with remote prompt registry
 * @param {SyncOptions} options - Sync options
 * @returns {Promise<SyncResult>} Sync result
 */
export async function sync(options = {}) {
  const syncId = generateSyncId();
  const startTime = Date.now();

  const result = {
    success: false,
    localVersion: registryMetadata.localVersion,
    remoteVersion: null,
    newPrompts: 0,
    updatedPrompts: 0,
    errors: [],
    warnings: [],
    lastSync: null
  };

  const syncOptions = {
    url: options.url,
    force: options.force || false,
    timeout: options.timeout || config.policies.timeout,
    progressCallback: options.progressCallback,
    errorPolicy: options.errorPolicy || 'throw',
    mergeStrategy: options.mergeStrategy || 'prefer-local',
    silent: options.silent || false,
    background: options.background || false
  };

  // Set default URL based on environment
  if (!syncOptions.url) {
    const envType = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    syncOptions.url = config.urls[envType];
  }

  registryMetadata.syncUrl = syncOptions.url;

  try {
    reportProgress(syncOptions, 'initializing', 0);

    // Check if we need to sync (unless forced)
    if (!syncOptions.force) {
      const cached = loadFromCache(syncOptions.url);
      if (cached) {
        reportProgress(syncOptions, 'fetching', 100);
        // Use cached data but still validate and merge
        const mergeResult = mergeRegistries(cached, { schemaVersion: '2.0' }, syncOptions);
        result.newPrompts = mergeResult.newPrompts;
        result.updatedPrompts = mergeResult.updatedPrompts;
        result.warnings = mergeResult.warnings;
      }
    }

    if (!loadFromCache(syncOptions.url) || syncOptions.force) {
      reportProgress(syncOptions, 'fetching', 25);

      const remoteData = await fetchRemoteRegistry(syncOptions.url, syncOptions);

      reportProgress(syncOptions, 'validating', 50);

      validateRemoteSchema(remoteData);

      reportProgress(syncOptions, 'comparing', 60);

      saveToCache(syncOptions.url, remoteData);

      result.remoteVersion = remoteData.schemaVersion || '2.0';

      reportProgress(syncOptions, 'merging', 75);

      const mergeResult = mergeRegistries(remoteData, {
        schemaVersion: result.remoteVersion
      }, syncOptions);

      result.newPrompts = mergeResult.newPrompts;
      result.updatedPrompts = mergeResult.updatedPrompts;
      result.warnings = mergeResult.warnings;

      reportProgress(syncOptions, 'updating', 90);

      if (result.newPrompts > 0 || result.updatedPrompts > 0) {
        saveLocalRegistry();
      }
    }

    reportProgress(syncOptions, 'finalizing', 100);

    result.success = true;
    result.lastSync = new Date().toISOString();

    // Update metadata
    registryMetadata.lastSync = new Date();
    registryMetadata.localVersion = result.remoteVersion || registryMetadata.localVersion;

  } catch (error) {
    const syncError = error instanceof SyncError ? error :
                     new SyncError('UNKNOWN', error.message || 'Unknown error occurred', { error });

    result.errors.push(syncError);

    if (syncOptions.errorPolicy === 'throw') {
      throw syncError;
    } else if (syncOptions.errorPolicy === 'warn') {
      console.warn('Sync warning:', syncError.message);
    }
    // 'silent' means continue without throwing
  }

  return result;
}

/**
 * Background sync operation (non-blocking)
 * @param {SyncOptions} options - Sync options
 * @returns {Promise<string>} Sync operation ID
 */
export function backgroundSync(options = {}) {
  const syncId = generateSyncId();

  // Non-blocking execution
  setImmediate(async () => {
    try {
      const result = await sync({ ...options, silent: true });
      if (result.success && !options.silent) {
        console.log(`Background sync completed: +${result.newPrompts} new, +${result.updatedPrompts} updated prompts`);
      }
    } catch (error) {
      if (!options.silent) {
        console.error('Background sync failed:', error.message);
      }
    }
  });

  return syncId;
}

/** Registry Metadata Functions **/
/**
 * Returns registry information
 * @returns {RegistryMetadata} Registry metadata
 */
export function getRegistryInfo() {
  return {
    localVersion: registryMetadata.localVersion,
    lastSync: registryMetadata.lastSync,
    lastModified: registryMetadata.lastModified,
    syncUrl: registryMetadata.syncUrl,
    schemaVersion: registryMetadata.schemaVersion
  };
}

/**
 * Checks if registry is stale based on maximum age
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} True if registry is stale
 */
export function isRegistryStale(maxAge) {
  if (!registryMetadata.lastSync) return true;

  const age = Date.now() - registryMetadata.lastSync.getTime();
  return age > maxAge;
}

/**
 * Initialize the registry library with optional auto-sync
 * @param {object} options - Initialization options
 * @returns {Promise<RegistryMetadata>} Registry metadata
 */
export async function init(options = {}) {
  // Ensure cache directory exists
  ensureCacheDirectory();

  // Load local registry (already done during module load)

  // Optional auto-sync on initialization
  if (options.autoSync) {
    await sync({
      url: options.syncUrl,
      silent: options.silent || false,
      errorPolicy: options.errorPolicy || 'warn'
    });
  }

  return getRegistryInfo();
}

/**
 * Periodic sync scheduler for background mode
 * @param {number} interval - Sync interval in milliseconds
 */
function startPeriodicSync(interval = config.policies.syncInterval) {
  if (config.policies.backgroundSync) {
    setInterval(() => {
      backgroundSync({ silent: true });
    }, interval);
  }
}

// Start periodic sync if enabled
startPeriodicSync();

/**
 * Retrieves a prompt by ID (with optional version) and interpolates variables.
 * Enhanced with optional auto-sync functionality
 * @param {string} id - The unique ID of the prompt, optionally with @version suffix.
 * @param {Object} variables - An object with variable names as keys and their values for substitution.
 * @param {GetOptions} options - Additional options for sync behavior
 * @returns {Object} The version-aware prompt metadata with interpolated prompt.
 * @throws {Error} If the prompt ID or version is not found.
 */
export function get(id, variables = {}, options = {}) {
  let baseId = id;
  let version = '';
  if (id.includes('@')) {
    [baseId, version] = id.split('@').slice(0, 2);
  }

  // Check if prompt exists locally
  const base = registry[baseId];
  if (!base && options.syncOnMissing) {
    // Auto-sync if prompt not found locally
    return syncAndRetryGet(id, variables, options);
  } else if (!base) {
    throw new Error(`Prompt "${id}" not found`);
  }

  if (!version) {
    version = base.latest;
  }
  const promptData = base.versions[version];
  if (!promptData) {
    throw new Error(`Version "${version}" not available for "${baseId}"`);
  }

  let prompt = promptData.prompt;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }

  // Check for unsubstituted variables
  const unsub = prompt.match(/\{\{([^}]+)\}\}/g);
  if (unsub && unsub.length > 0) {
    throw new Error(`Missing variables: ${unsub.map(v => v.slice(2, -2)).join(', ')}`);
  }

  return {
    id: `${baseId}@${version}`,
    prompt: prompt,
    description: promptData.description,
    category: promptData.category,
    tags: promptData.tags,
    version: promptData.version
  };
}

/**
 * Auto-sync and retry getting a prompt
 * @param {string} id - Prompt ID to get
 * @param {Object} variables - Variables for interpolation
 * @param {GetOptions} options - Options for sync behavior
 * @returns {Object} Prompt data
 */
async function syncAndRetryGet(id, variables, options) {
  try {
    await sync({
      url: options.syncUrl,
      timeout: options.timeout || 10000,
      errorPolicy: 'throw', // We need to fail if sync fails
      silent: true
    });

    return get(id, variables); // Retry without options to avoid infinite loop
  } catch (error) {
    throw new Error(`Prompt "${id}" not found locally and sync failed: ${error.message}`);
  }
}

/**
 * Searches prompts based on a query string or filter object.
 * Enhanced with sync metadata and optional auto-sync for empty results
 * @param {string|SearchOptions} query - A search string or search options filter object
 * @param {SearchOptions} options - Search options (merges with query if it's a SearchOptions type)
 * @returns {Array} An array of enhanced prompt metadata matching the query
 */
export function search(query, options = {}) {
  // Merge query with options if query is an object with search options
  const searchOptions = typeof query === 'object' ?
    { ...query, ...options } : options;

  let allPrompts = Object.entries(registry).map(([baseId, base]) => {
    const latestData = base.versions[base.latest];
    return {
      id: baseId,
      description: latestData.description,
      category: latestData.category,
      tags: latestData.tags,
      version: latestData.version,
      registryFresh: !isRegistryStale(config.cache.ttl),
      source: 'local',
      lastSync: registryMetadata.lastSync ? registryMetadata.lastSync.toISOString() : null
    };
  });

  let filtered = allPrompts;

  // Handle string query
  if (typeof query === 'string') {
    const lowerQuery = query.toLowerCase();
    filtered = allPrompts.filter(p =>
      p.id.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  } else if (typeof query === 'object' && !(options && options.syncOnEmpty)) {
    // Filter object (apply filters)
    filtered = allPrompts.filter(p => {
      if (query.category && p.category !== query.category) return false;
      if (query.tags && query.tags.length > 0) {
        if (!query.tags.every(tag => p.tags.includes(tag))) return false;
      }
      if (query.id && p.id !== query.id) return false;
      // Add additional filters as needed
      return true;
    });
  }

  // Auto-sync if no results and syncOnEmpty is enabled
  if (filtered.length === 0 && searchOptions.syncOnEmpty) {
    return syncAndRetrySearch(query, searchOptions);
  }

  return filtered;
}

/**
 * Auto-sync and retry search for empty results
 * @param {string|SearchOptions} query - Original search query
 * @param {SearchOptions} options - Search options
 * @returns {Array} Enhanced prompt metadata
 */
async function syncAndRetrySearch(query, options) {
  try {
    await sync({
      url: options.syncUrl,
      timeout: options.timeout || 10000,
      errorPolicy: 'throw',
      silent: true
    });

    return search(query, { ...options, syncOnEmpty: false }); // Retry without sync to avoid infinite loop
  } catch (error) {
    console.warn(`Search sync failed: ${error.message}`);
    return []; // Return empty array if sync fails
  }
}

// Export the registry for debugging or direct access
export { registry };