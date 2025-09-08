interface PromptMetadata {
  id: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
}

interface PromptData extends PromptMetadata {
  prompt: string;
}

interface SearchFilters {
  category?: string;
  tags?: string[];
  id?: string;
}

/** Remote Sync Types **/

type SyncStage =
  | 'initializing'
  | 'fetching'
  | 'validating'
  | 'comparing'
  | 'merging'
  | 'updating'
  | 'finalizing';

type SyncErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_SCHEMA'
  | 'SCHEMA_MISMATCH'
  | 'CORS_VIOLATION'
  | 'CERTIFICATE_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'UNKNOWN';

interface SyncOptions {
  url?: string;
  force?: boolean;
  timeout?: number;
  progressCallback?: (stage: SyncStage, progress: number) => void;
  errorPolicy?: 'throw' | 'silent' | 'warn';
  mergeStrategy?: 'prefer-local' | 'prefer-remote' | 'interactive';
  silent?: boolean;
  background?: boolean;
}

interface SyncResult {
  success: boolean;
  localVersion?: string;
  remoteVersion?: string;
  newPrompts?: number;
  updatedPrompts?: number;
  errors?: Error[];
  warnings?: string[];
  lastSync?: string;
}

interface SyncError extends Error {
  code: SyncErrorCode;
  details?: any;
}

interface RegistryMetadata {
  localVersion: string;
  lastSync: Date | null;
  lastModified: Date;
  syncUrl: string | null;
  schemaVersion?: string;
}

interface EnhancedSearchMetadata extends PromptMetadata {
  registryFresh: boolean;
  source: 'local' | 'remote';
  lastSync?: string;
}

interface GetOptions {
  autoSyncTag?: string;
  syncOnMissing?: boolean;
  syncUrl?: string;
  timeout?: number;
}

interface SearchOptions extends SearchFilters {
  syncOnEmpty?: boolean;
  syncUrl?: string;
  timeout?: number;
}

/** Configuration Types **/
interface SyncConfig {
  urls: {
    development: string;
    production: string;
    custom?: string;
  };
  policies: {
    autoSync?: boolean;
    backgroundSync?: boolean;
    syncInterval?: number;
    timeout?: number;
    retryAttempts?: number;
  };
  security: {
    trustedDomains: string[];
    requireHttps: boolean;
    certificateValidation: boolean;
    maxPayloadSize: number;
  };
  cache: {
    directory: string;
    ttl: number;
    maxSize: number;
  };
}

/** Core API Functions **/
export declare function get(id: string, variables?: Record<string, string>, options?: GetOptions): PromptData;

export declare function search(query: string | SearchOptions): EnhancedSearchMetadata[];

export declare function sync(options?: SyncOptions): Promise<SyncResult>;

export declare function getRegistryInfo(): RegistryMetadata;

export declare function isRegistryStale(maxAge: number): boolean;

/** Utility Functions **/
export declare function init(options?: {autoSync?: boolean; syncUrl?: string}): Promise<RegistryMetadata>;

/** Error Classes **/
export declare class SyncError extends Error {
  public code: SyncErrorCode;
  public details?: any;

  constructor(code: SyncErrorCode, message: string, details?: any);
}