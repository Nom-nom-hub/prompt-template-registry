import { get, search, sync, getRegistryInfo, isRegistryStale, SyncError, backgroundSync } from './index.mjs';

// Test backward compatibility - all existing functionality should work exactly as before
console.log('=== Testing Backward Compatibility ===');

// Test get with variables (now returns object)
try {
  const result = get('sql_query_generation', { request: 'Show all users' });
  console.log('✓ Get with variables:', result.prompt.slice(0, 50) + '...');
  console.log('✓ ID:', result.id);
  console.log('✓ Version:', result.version);
} catch (e) {
  console.error('✗ Get with variables error:', e.message);
}

// Test get without variables
try {
  const result = get('blog_post_outline', { topic: 'AI Ethics' });
  console.log('✓ Get with all vars:', result.prompt.slice(0, 50) + '...');
} catch (e) {
  console.error('✗ Get error:', e.message);
}

// Test get with missing variables
try {
  const result = get('blog_post_outline');
  console.log('✓ Missing vars prompt:', result.prompt);
} catch (e) {
  console.error('✗ Missing vars error:', e.message);
}

// Test get invalid id
try {
  const result = get('invalid_id');
  console.log('✓ Invalid id prompt:', result);
} catch (e) {
  console.error('✗ Invalid id error:', e.message);
}

// Test get with version
try {
  const result = get('sql_query_generation@2.0.0', { request: 'Show all users' });
  console.log('✓ Get with version:', result.prompt.includes('Ensure the query is optimized') ? 'Yes' : 'No');
  console.log('✓ Version:', result.version);
} catch (e) {
  console.error('✗ Get with version error:', e.message);
}

// Test get default to latest
try {
  const result = get('sql_query_generation', { request: 'Show all users' });
  console.log('✓ Get default latest version:', result.version);
} catch (e) {
  console.error('✗ Get default error:', e.message);
}

console.log('\n=== Testing Search Function (Backward Compatible) ===');

// Test search with string
const results = search('sql');
console.log('✓ Search for sql results:', results.length, 'prompts found');
console.log('✓ First result id:', results[0].id);

// Test search with filters
const devPrompts = search({ category: 'development' });
console.log('✓ Development prompts:', devPrompts.length, 'prompts found');

// Test search with empty query
const allPrompts = search('');
console.log('✓ All prompts:', allPrompts.length, 'prompts total');

// Test search by base id
const sqlResults = search({ id: 'sql_query_generation' });
console.log('✓ Search for sql id:', sqlResults.length, 'results');

// Test get non-existent version
try {
  const result = get('sql_query_generation@3.0.0', { request: 'Show all users' });
  console.log('✓ Invalid version prompt:', result);
} catch (e) {
  console.error('✗ Invalid version error:', e.message);
}

console.log('\n=== Testing Sync Functionality ===');

// Test sync with invalid URL (should handle gracefully)
try {
  const result = await sync({
    url: 'http://invalid-domain.test/registry.json', // Not trusted domain
    errorPolicy: 'warn'
  });
  console.log('✓ Sync with warn policy:', result.success);
} catch (e) {
  console.error('✗ Sync error policy test failed:', e.message);
}

// Test sync with empty registry response
try {
  const result = await sync({
    url: 'https://mock-registry.com/empty.json',
    errorPolicy: 'warn'
  });
  console.log('✓ Sync empty registry:', result.success);
} catch (e) {
  console.error('✗ Sync empty registry error:', e.message);
}

// Test sync with invalid JSON response
try {
  const result = await sync({
    url: 'https://mock-registry.com/invalid.json',
    errorPolicy: 'warn'
  });
  console.log('✓ Sync invalid schema:', result.success);
} catch (e) {
  console.error('✗ Sync invalid schema error:', e.message);
}

// Test normal sync functionality
try {
  const result = await sync({
    url: 'https://mock-registry.com/success.json',
    mergeStrategy: 'prefer-local',
    progressCallback: (stage, progress) => {
      console.log(`  Sync progress: ${stage} (${progress}%)`);
    }
  });
  console.log('✓ Sync success:', result.success);
  console.log('  New prompts:', result.newPrompts);
  console.log('  Updated prompts:', result.updatedPrompts);
} catch (e) {
  console.error('✗ Sync functionality error:', e.message);
}

console.log('\n=== Testing Registry Metadata ===');

// Test registry info
try {
  const info = getRegistryInfo();
  console.log('✓ Registry info:', {
    version: info.localVersion,
    lastSync: info.lastSync,
    schemaVersion: info.schemaVersion
  });
} catch (e) {
  console.error('✗ Registry info error:', e.message);
}

// Test stale checking
try {
  const isStale = isRegistryStale(3600000); // 1 hour
  console.log('✓ Registry stale check:', isStale);
} catch (e) {
  console.error('✗ Registry stale check error:', e.message);
}

console.log('\n=== Testing Background Sync ===');

// Test background sync
try {
  const syncId = backgroundSync({
    url: 'https://mock-registry.com/background.json',
    silent: true
  });
  console.log('✓ Background sync initiated, ID:', syncId);
} catch (e) {
  console.error('✗ Background sync error:', e.message);
}

console.log('\n=== Testing Auto-Sync Features ===');

// Test get with auto-sync (this will fail since we can't actually download)
try {
  const result = await get('nonexistent_prompt', {}, {
    syncOnMissing: true,
    syncUrl: 'https://mock-registry.com/auto-sync.json'
  });
  console.log('✓ Auto-sync get:', result);
} catch (e) {
  console.log('✓ Auto-sync get failure (expected):', e.message);
}

// Test search with auto-sync
try {
  const results = await search('nonexistent', {
    syncOnEmpty: true,
    syncUrl: 'https://mock-registry.com/search-sync.json'
  });
  console.log('✓ Auto-sync search:', results.length, 'results');
} catch (e) {
  console.log('✓ Auto-sync search failure (expected):', e.message);
}

console.log('\n=== Testing Error Handling ===');

// Test SyncError class
try {
  const error = new SyncError('NETWORK_ERROR', 'Test error', { code: 500 });
  console.log('✓ Custom SyncError:', error.code, error.message);
} catch (e) {
  console.error('✗ SyncError class error:', e.message);
}

console.log('\n=== All Tests Completed ===');