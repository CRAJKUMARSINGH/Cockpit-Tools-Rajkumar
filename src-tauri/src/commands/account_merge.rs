use crate::models;
use crate::modules;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountMergeResult {
    pub merged_count: u32,
    pub skipped_count: u32,
    pub error_count: u32,
    pub errors: Vec<String>,
    pub merged_accounts: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupAccount {
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupData {
    pub backup_name: String,
    pub backup_date: String,
    pub backup_source: String,
    #[serde(default)]
    pub description: Option<String>,
    pub accounts: Vec<BackupAccount>,
}

#[tauri::command]
pub async fn create_named_backup(backup_name: String) -> Result<String, String> {
    let safe_name = backup_name.trim().replace(|c| !c.is_alphanumeric() && c != '_' && c != '-', "_");
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let file_name = format!("{}_backup_{}.json", safe_name, timestamp);
    
    let backup_dir = modules::backup_storage::get_backup_root_dir()?;
    let backup_path = backup_dir.join(&file_name);
    
    let accounts = modules::list_accounts()?;
    let simplified_accounts: Vec<BackupAccount> = accounts
        .into_iter()
        .map(|account| BackupAccount {
            email: account.email,
            refresh_token: (!account.pending_oauth
                && !account.token.refresh_token.trim().is_empty())
                .then_some(account.token.refresh_token),
            tags: account.tags.unwrap_or_default(),
            notes: account.notes,
        })
        .collect();
    
    let backup_data = BackupData {
        backup_name: backup_name,
        backup_date: timestamp.to_string(),
        backup_source: "Cockpit Tools Desktop - Login_Credential_Add_Tool".to_string(),
        description: None,
        accounts: simplified_accounts,
    };
    
    let json_content = serde_json::to_string_pretty(&backup_data)
        .map_err(|e| format!("序列化备份失败: {}", e))?;
    
    modules::atomic_write::write_string_atomic(&backup_path, &json_content)
        .map_err(|e| format!("写入备份文件失败: {}", e))?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn merge_backup_from_file(backup_path: String) -> Result<AccountMergeResult, String> {
    let path = PathBuf::from(&backup_path);
    if !path.exists() {
        return Err("备份文件不存在".to_string());
    }
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("读取备份文件失败: {}", e))?;
    
    let backup_data: BackupData = serde_json::from_str(&content)
        .map_err(|e| format!("解析备份文件失败: {}", e))?;
    
    let mut merged_count = 0u32;
    let mut skipped_count = 0u32;
    let mut error_count = 0u32;
    let mut errors = Vec::new();
    let mut merged_accounts = Vec::new();
    
    // Try to import using the existing import_from_json function for better platform support
    let json_content = serde_json::to_string(&backup_data.accounts)
        .map_err(|e| format!("序列化账号数据失败: {}", e))?;
    
    match modules::import::import_from_json_logic(json_content).await {
        Ok(imported_accounts) => {
            merged_count = imported_accounts.len() as u32;
            merged_accounts = imported_accounts.iter().map(|acc| acc.email.clone()).collect();
        }
        Err(e) => {
            // Fallback to manual import if JSON import fails
            eprintln!("JSON import failed, trying manual import: {}", e);
            
            // Get existing accounts to check for duplicates
            let existing_accounts = modules::list_accounts()
                .map_err(|e| format!("获取现有账号失败: {}", e))?;
            let existing_emails: std::collections::HashSet<String> = existing_accounts
                .into_iter()
                .map(|acc| acc.email)
                .collect();
            
            for backup_account in backup_data.accounts {
                // Check if account already exists by email
                if existing_emails.contains(&backup_account.email) {
                    skipped_count += 1;
                    continue;
                }
                
                // Create account from backup data
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs() as i64;
                let account = models::Account {
                    id: format!("backup_{}", md5::compute(backup_account.email.as_bytes())),
                    email: backup_account.email.clone(),
                    token: models::AccountToken {
                        access_token: String::new(),
                        refresh_token: backup_account.refresh_token.unwrap_or_default(),
                        token_type: "Bearer".to_string(),
                        expires_at: None,
                    },
                    pending_oauth: backup_account.refresh_token.is_none(),
                    tags: if backup_account.tags.is_empty() { None } else { Some(backup_account.tags) },
                    notes: backup_account.notes,
                    two_factor_secret: None,
                    account_password: None,
                    phone_number: None,
                    mail_url: None,
                    aux_email: None,
                    created_at: now,
                    last_used: None,
                };
                
                // Save the account
                match modules::save_account(&account) {
                    Ok(_) => {
                        merged_count += 1;
                        merged_accounts.push(backup_account.email.clone());
                    }
                    Err(e) => {
                        error_count += 1;
                        errors.push(format!("保存账号 {} 失败: {}", backup_account.email, e));
                    }
                }
            }
        }
    }
    
    Ok(AccountMergeResult {
        merged_count,
        skipped_count,
        error_count,
        errors,
        merged_accounts,
    })
}

#[tauri::command]
pub async fn list_available_backups() -> Result<Vec<String>, String> {
    let backup_dir = modules::backup_storage::get_backup_root_dir()?;
    let mut backups = Vec::new();
    
    if backup_dir.exists() {
        for entry in fs::read_dir(&backup_dir)
            .map_err(|e| format!("读取备份目录失败: {}", e))?
        {
            let entry = entry.map_err(|e| format!("读取备份项失败: {}", e))?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) == Some("json") {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    backups.push(name.to_string());
                }
            }
        }
    }
    
    backups.sort();
    Ok(backups)
}

#[tauri::command]
pub async fn read_backup_file(backup_path: String) -> Result<String, String> {
    let path = PathBuf::from(&backup_path);
    if !path.exists() {
        return Err("备份文件不存在".to_string());
    }
    
    fs::read_to_string(&path)
        .map_err(|e| format!("读取备份文件失败: {}", e))
}