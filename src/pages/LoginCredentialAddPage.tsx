/**
 * Login_Credential_Add_Tool
 *
 * Two operations in one page:
 *   1. Save Named Backup  — exports all current accounts to a named file
 *      (e.g. "Rajkumar_Laptop.json") in the backup directory.
 *   2. Merge Credentials  — loads a backup JSON from another device and
 *      merges every platform's accounts into this machine without duplicates.
 */

import { useState, useRef, useCallback } from 'react';
import {
  Save,
  FolderOpen,
  GitMerge,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';
import { useTranslation } from 'react-i18next';
import {
  saveNamedBackup,
  mergeCredentialsFromJson,
  type CredentialMergePlatformResult,
  type MergeCredentialsSummary,
} from '../services/loginCredentialAddService';

// ─── Helper ───────────────────────────────────────────────────────────────────

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function formatErr(e: unknown): string {
  return String(e).replace(/^Error:\s*/, '');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PlatformRowProps {
  result: CredentialMergePlatformResult;
}

function PlatformRow({ result }: PlatformRowProps) {
  const isError = result.error != null;
  const isSkipped = !isError && result.imported === 0;

  return (
    <div
      className={`cred-merge-platform-row ${isError ? 'error' : isSkipped ? 'skipped' : 'success'}`}
    >
      <span className="cred-merge-platform-name">{result.platform}</span>
      <span className="cred-merge-platform-count">
        {isError ? (
          <span className="cred-merge-error-msg">{result.error}</span>
        ) : isSkipped ? (
          <span className="cred-merge-skipped">—</span>
        ) : (
          <span className="cred-merge-imported">+{result.imported}</span>
        )}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LoginCredentialAddPage() {
  const { t } = useTranslation();

  // ── Section 1: Named Backup ──────────────────────────────────────────────
  const [backupName, setBackupName] = useState('Rajkumar_Laptop');
  const [savingBackup, setSavingBackup] = useState(false);
  const [backupSavedPath, setBackupSavedPath] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleSaveNamedBackup = useCallback(async () => {
    const name = backupName.trim();
    if (!name) return;
    setSavingBackup(true);
    setBackupSavedPath(null);
    setBackupError(null);
    try {
      const path = await saveNamedBackup(name);
      setBackupSavedPath(path);
    } catch (e) {
      setBackupError(formatErr(e));
    } finally {
      setSavingBackup(false);
    }
  }, [backupName]);

  // ── Section 2: Credential Merge ──────────────────────────────────────────
  const [mergeJson, setMergeJson] = useState<string>('');
  const [mergeFileName, setMergeFileName] = useState<string>('');
  const [merging, setMerging] = useState(false);
  const [mergeSummary, setMergeSummary] = useState<MergeCredentialsSummary | null>(null);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = useCallback(async () => {
    try {
      // Tauri file dialog
      const selected = await openFileDialog({
        multiple: false,
        filters: [
          { name: 'JSON Backup', extensions: ['json'] },
        ],
      });
      if (!selected) return;
      // Tauri open() returns string | string[] | null
      const filePath = Array.isArray(selected) ? selected[0] : selected;

      // Read via Tauri readTextFile for local paths
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const content = await readTextFile(filePath);
      setMergeJson(content);
      setMergeFileName(filePath.split(/[\\/]/).pop() ?? filePath);
      setMergeSummary(null);
      setMergeError(null);
    } catch (e) {
      setMergeError(formatErr(e));
    }
  }, []);

  // Fallback: browser-style hidden <input type="file">
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const content = await readFileAsText(file);
        setMergeJson(content);
        setMergeFileName(file.name);
        setMergeSummary(null);
        setMergeError(null);
      } catch (err) {
        setMergeError(formatErr(err));
      }
      // Reset so same file can be picked again
      e.target.value = '';
    },
    [],
  );

  const handleMerge = useCallback(async () => {
    if (!mergeJson.trim()) {
      setMergeError(t('credTool.merge.emptyContent', 'Please choose a backup file first'));
      return;
    }
    setMerging(true);
    setMergeSummary(null);
    setMergeError(null);
    try {
      const summary = await mergeCredentialsFromJson(mergeJson);
      setMergeSummary(summary);
      setDetailsOpen(true);
    } catch (e) {
      setMergeError(formatErr(e));
    } finally {
      setMerging(false);
    }
  }, [mergeJson, t]);

  const handleClearMerge = useCallback(() => {
    setMergeJson('');
    setMergeFileName('');
    setMergeSummary(null);
    setMergeError(null);
    setDetailsOpen(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="cred-add-page ghcp-accounts-page">
      {/* ── Page header ── */}
      <div className="cred-add-header">
        <div className="cred-add-title-row">
          <GitMerge size={20} className="cred-add-title-icon" />
          <h1 className="cred-add-title">
            {t('credTool.title', 'Login_Credential_Add_Tool')}
          </h1>
        </div>
        <p className="cred-add-subtitle">
          {t(
            'credTool.subtitle',
            "Save a named backup of this machine's logins, or merge a backup file from another PC into this laptop's logins (all dashboard platforms).",
          )}
        </p>
      </div>

      <div className="cred-add-body">
        {/* ═══════════════════════════════════════════════════
            SECTION 1 — Save Named Backup
        ════════════════════════════════════════════════════ */}
        <section className="cred-add-section">
          <div className="cred-add-section-header">
            <Save size={16} />
            <span>{t('credTool.backup.title', 'Save Named Backup')}</span>
          </div>

          <p className="cred-add-section-desc">
            {t(
              'credTool.backup.desc',
              'Export all current accounts and settings from every platform into a named backup file in the backup directory (e.g. Rajkumar_Laptop.json).',
            )}
          </p>

          <div className="cred-add-row">
            <input
              className="cred-add-input"
              type="text"
              value={backupName}
              onChange={(e) => {
                setBackupName(e.target.value);
                setBackupSavedPath(null);
                setBackupError(null);
              }}
              placeholder={t('credTool.backup.namePlaceholder', 'Backup name, e.g. Rajkumar_Laptop')}
              disabled={savingBackup}
              maxLength={64}
            />
            <button
              className="btn btn-primary cred-add-action-btn"
              onClick={() => void handleSaveNamedBackup()}
              disabled={savingBackup || !backupName.trim()}
            >
              {savingBackup ? (
                <RefreshCw size={14} className="loading-spinner" />
              ) : (
                <Save size={14} />
              )}
              {t('credTool.backup.save', 'Save Backup')}
            </button>
          </div>

          <p className="cred-add-hint">
            <Info size={12} />
            {t(
              'credTool.backup.nameHint',
              'Letters, digits, underscore and dash only, up to 64 characters.',
            )}
          </p>

          {backupSavedPath && (
            <div className="cred-add-status success">
              <CheckCircle2 size={14} />
              <span>
                {t('credTool.backup.saved', 'Saved: ')}
                <code className="cred-add-path">{backupSavedPath}</code>
              </span>
            </div>
          )}
          {backupError && (
            <div className="cred-add-status error">
              <AlertCircle size={14} />
              <span>{backupError}</span>
            </div>
          )}
        </section>

        <div className="cred-add-divider" />

        {/* ═══════════════════════════════════════════════════
            SECTION 2 — Merge Credentials from Another Device
        ════════════════════════════════════════════════════ */}
        <section className="cred-add-section">
          <div className="cred-add-section-header">
            <GitMerge size={16} />
            <span>{t('credTool.merge.title', 'Merge Logins From Another Device')}</span>
          </div>

          <p className="cred-add-section-desc">
            {t(
              'credTool.merge.desc',
              'Pick a Cockpit Tools backup file (.json) exported on your PC. Accounts from every platform will be merged into this machine; existing accounts are not duplicated.',
            )}
          </p>

          {/* File picker row */}
          <div className="cred-add-row">
            <div className="cred-add-file-display">
              {mergeFileName ? (
                <span className="cred-add-file-name">{mergeFileName}</span>
              ) : (
                <span className="cred-add-file-placeholder">
                  {t('credTool.merge.noFile', 'No file selected')}
                </span>
              )}
            </div>

            <button
              className="btn btn-secondary cred-add-action-btn"
              onClick={() => void handlePickFile()}
              disabled={merging}
            >
              <FolderOpen size={14} />
              {t('credTool.merge.pick', 'Choose File')}
            </button>

            {/* Hidden fallback file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => void handleFileInputChange(e)}
            />
          </div>

          {/* Action row */}
          <div className="cred-add-row cred-add-row-gap-top">
            <button
              className="btn btn-primary cred-add-action-btn"
              onClick={() => void handleMerge()}
              disabled={merging || !mergeJson.trim()}
            >
              {merging ? (
                <RefreshCw size={14} className="loading-spinner" />
              ) : (
                <GitMerge size={14} />
              )}
              {t('credTool.merge.run', 'Merge Now')}
            </button>

            {(mergeJson || mergeSummary) && (
              <button
                className="btn btn-outline cred-add-action-btn"
                onClick={handleClearMerge}
                disabled={merging}
              >
                {t('credTool.merge.clear', 'Clear')}
              </button>
            )}
          </div>

          {/* Merge error */}
          {mergeError && (
            <div className="cred-add-status error">
              <AlertCircle size={14} />
              <span>{mergeError}</span>
            </div>
          )}

          {/* Merge summary */}
          {mergeSummary && (
            <div className="cred-merge-summary">
              <div className="cred-merge-summary-headline">
                <CheckCircle2 size={16} className="cred-merge-success-icon" />
                <span>
                  {t('credTool.merge.doneMsg', 'Merge complete: {{n}} account(s) imported', {
                    n: mergeSummary.total_imported,
                  })}
                </span>
                <span className="cred-merge-stat">
                  {mergeSummary.platform_success_count > 0 && (
                    <span className="cred-merge-stat-item success">
                      ✓ {mergeSummary.platform_success_count}{' '}
                      {t('credTool.merge.platforms', 'platform(s)')}
                    </span>
                  )}
                  {mergeSummary.platform_failed_count > 0 && (
                    <span className="cred-merge-stat-item error">
                      ✗ {mergeSummary.platform_failed_count}{' '}
                      {t('credTool.merge.failed', 'failed')}
                    </span>
                  )}
                  {mergeSummary.platform_skipped_count > 0 && (
                    <span className="cred-merge-stat-item skipped">
                      — {mergeSummary.platform_skipped_count}{' '}
                      {t('credTool.merge.skipped', 'skipped')}
                    </span>
                  )}
                </span>
              </div>

              {/* Collapsible per-platform detail */}
              <button
                className="cred-merge-toggle"
                onClick={() => setDetailsOpen((v) => !v)}
              >
                {detailsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {t('credTool.merge.details', 'Show per-platform details')}
              </button>

              {detailsOpen && (
                <div className="cred-merge-details">
                  {mergeSummary.results
                    .filter((r) => r.imported > 0 || r.error != null)
                    .sort((a, b) => {
                      // errors first, then by imported count desc
                      if ((a.error != null) !== (b.error != null))
                        return a.error != null ? -1 : 1;
                      return b.imported - a.imported;
                    })
                    .map((r) => (
                      <PlatformRow key={r.platform} result={r} />
                    ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
