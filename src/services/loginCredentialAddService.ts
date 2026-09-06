import { invoke } from '@tauri-apps/api/core';
import { exportDataTransferJson } from './dataTransferService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CredentialMergePlatformResult {
  /** Platform ID, e.g. "kiro", "windsurf", "trae" */
  platform: string;
  /** Number of accounts successfully imported / merged */
  imported: number;
  /** Error message if this platform failed, null on success */
  error: string | null;
}

export interface MergeCredentialsSummary {
  total_imported: number;
  platform_success_count: number;
  platform_failed_count: number;
  platform_skipped_count: number;
  results: CredentialMergePlatformResult[];
}

// ─── Named Backup ─────────────────────────────────────────────────────────────

/**
 * Export all current accounts + config into a named JSON backup file.
 * The file is written to the app's backup directory as `<name>.json`
 * (plus a companion `.zip` archive).
 *
 * @param name  Alphanumeric + underscore/dash only (e.g. "Rajkumar_Laptop")
 * @returns     Full path of the saved file
 */
export async function saveNamedBackup(name: string): Promise<string> {
  // Build the full data-transfer bundle (accounts + config) the same way
  // the auto-backup scheduler does.
  const jsonContent = await exportDataTransferJson({
    includeAccounts: true,
    includeConfig: true,
  });

  return invoke<string>('save_named_backup', { name, content: jsonContent });
}

// ─── Credential Merge ─────────────────────────────────────────────────────────

/**
 * Load a backup JSON string (from another device) and merge every platform's
 * accounts into the current machine — without creating duplicates.
 * Each platform's existing import_from_json + upsert logic handles dedup.
 *
 * @param content  Raw JSON string from a cockpit-tools backup file
 */
export async function mergeCredentialsFromJson(
  content: string,
): Promise<MergeCredentialsSummary> {
  const results = await invoke<CredentialMergePlatformResult[]>(
    'merge_credentials_from_json',
    { content },
  );

  const total_imported = results.reduce((s, r) => s + r.imported, 0);
  const platform_success_count = results.filter(
    (r) => r.error == null && r.imported > 0,
  ).length;
  const platform_skipped_count = results.filter(
    (r) => r.error == null && r.imported === 0,
  ).length;
  const platform_failed_count = results.filter((r) => r.error != null).length;

  return {
    total_imported,
    platform_success_count,
    platform_failed_count,
    platform_skipped_count,
    results,
  };
}
