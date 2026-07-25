use tauri::Manager;

const AI_CREDENTIAL_SERVICE: &str = "com.zili.writing.ai";
const AI_SETTINGS_ACCOUNT: &str = "settings-v1";

fn ai_settings_entry() -> Result<keyring::Entry, String> {
  keyring::Entry::new(AI_CREDENTIAL_SERVICE, AI_SETTINGS_ACCOUNT)
    .map_err(|error| error.to_string())
}

fn ai_credential_entry(provider_id: &str, base_url: &str) -> Result<keyring::Entry, String> {
  let provider = provider_id.trim();
  let endpoint = base_url.trim().trim_end_matches('/').to_ascii_lowercase();
  if !matches!(provider, "agnes" | "openai-compatible") {
    return Err("unsupported AI provider".into());
  }
  if endpoint.is_empty() || endpoint.len() > 1000 || (!endpoint.starts_with("http://") && !endpoint.starts_with("https://")) {
    return Err("invalid AI endpoint".into());
  }
  keyring::Entry::new(AI_CREDENTIAL_SERVICE, &format!("{provider}|{endpoint}"))
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_ai_api_key(provider_id: String, base_url: String, api_key: String) -> Result<(), String> {
  let secret = api_key.trim();
  if secret.is_empty() || secret.len() > 64 * 1024 {
    return Err("invalid API key length".into());
  }
  ai_credential_entry(&provider_id, &base_url)?
    .set_password(secret)
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn load_ai_api_key(provider_id: String, base_url: String) -> Result<Option<String>, String> {
  match ai_credential_entry(&provider_id, &base_url)?.get_password() {
    Ok(secret) => Ok(Some(secret)),
    Err(keyring::Error::NoEntry) => Ok(None),
    Err(error) => Err(error.to_string()),
  }
}

#[tauri::command]
fn delete_ai_api_key(provider_id: String, base_url: String) -> Result<(), String> {
  match ai_credential_entry(&provider_id, &base_url)?.delete_credential() {
    Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
    Err(error) => Err(error.to_string()),
  }
}

#[tauri::command]
fn save_ai_settings(settings_json: String) -> Result<(), String> {
  if settings_json.is_empty() || settings_json.len() > 16 * 1024 {
    return Err("invalid AI settings length".into());
  }
  let settings: serde_json::Value = serde_json::from_str(&settings_json)
    .map_err(|_| "invalid AI settings JSON".to_string())?;
  if !settings.is_object() {
    return Err("AI settings must be a JSON object".into());
  }
  ai_settings_entry()?
    .set_password(&settings_json)
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn load_ai_settings() -> Result<Option<String>, String> {
  match ai_settings_entry()?.get_password() {
    Ok(settings) => Ok(Some(settings)),
    Err(keyring::Error::NoEntry) => Ok(None),
    Err(error) => Err(error.to_string()),
  }
}

#[cfg(test)]
mod credential_tests {
  use super::{delete_ai_api_key, load_ai_api_key, save_ai_api_key};

  #[test]
  fn api_key_round_trip_uses_system_credential_store() {
    let provider = "openai-compatible".to_string();
    let endpoint = format!("https://credential-test-{}.invalid/v1/", std::process::id());
    let normalized_endpoint = endpoint.trim_end_matches('/').to_ascii_uppercase();
    let secret = format!("temporary-test-key-{}", std::process::id());

    delete_ai_api_key(provider.clone(), endpoint.clone()).expect("clean stale test credential");
    save_ai_api_key(provider.clone(), endpoint.clone(), secret.clone()).expect("save credential");
    assert_eq!(load_ai_api_key(provider.clone(), normalized_endpoint).expect("load credential"), Some(secret));
    delete_ai_api_key(provider.clone(), endpoint.clone()).expect("delete credential");
    assert_eq!(load_ai_api_key(provider, endpoint).expect("verify deletion"), None);
  }
}

fn image_extension(extension: &str) -> Result<&str, String> {
  match extension.to_ascii_lowercase().as_str() {
    "png" => Ok("png"),
    "jpg" | "jpeg" => Ok("jpg"),
    "webp" => Ok("webp"),
    "gif" => Ok("gif"),
    _ => Err("unsupported image format".into()),
  }
}

fn attachment_extension(extension: &str) -> Result<String, String> {
  let normalized = extension.to_ascii_lowercase();
  let allowed = ["pdf", "docx", "txt", "md", "json", "epub", "csv", "rtf"];
  if allowed.contains(&normalized.as_str()) {
    Ok(normalized)
  } else {
    Err("unsupported attachment format".into())
  }
}

fn reference_extension(extension: &str) -> Result<String, String> {
  let normalized = extension.to_ascii_lowercase();
  let allowed = ["txt", "md", "docx", "epub"];
  if allowed.contains(&normalized.as_str()) {
    Ok(normalized)
  } else {
    Err("unsupported reference text format".into())
  }
}

#[tauri::command]
fn save_image_asset(
  app: tauri::AppHandle,
  project_id: String,
  asset_id: String,
  extension: String,
  bytes: Vec<u8>,
) -> Result<String, String> {
  let extension = image_extension(&extension)?;
  if bytes.is_empty() || bytes.len() > 20 * 1024 * 1024 {
    return Err("image size must be between 1 byte and 20 MB".into());
  }
  let directory = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("assets").join(&project_id);
  std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
  let path = directory.join(format!("{asset_id}.{extension}"));
  std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
  Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_image_asset(
  app: tauri::AppHandle,
  project_id: String,
  asset_id: String,
  extension: String,
) -> Result<(), String> {
  let extension = image_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("assets").join(project_id).join(format!("{asset_id}.{extension}"));
  if path.exists() {
    std::fs::remove_file(path).map_err(|error| error.to_string())?;
  }
  Ok(())
}

#[tauri::command]
fn read_image_asset(
  app: tauri::AppHandle,
  project_id: String,
  asset_id: String,
  extension: String,
) -> Result<Vec<u8>, String> {
  let extension = image_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("assets").join(project_id).join(format!("{asset_id}.{extension}"));
  std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_attachment(
  app: tauri::AppHandle,
  project_id: String,
  attachment_id: String,
  extension: String,
  bytes: Vec<u8>,
) -> Result<String, String> {
  let extension = attachment_extension(&extension)?;
  if bytes.is_empty() || bytes.len() > 50 * 1024 * 1024 {
    return Err("attachment size must be between 1 byte and 50 MB".into());
  }
  let directory = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("attachments").join(&project_id);
  std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
  let path = directory.join(format!("{attachment_id}.{extension}"));
  std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
  Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_attachment(
  app: tauri::AppHandle,
  project_id: String,
  attachment_id: String,
  extension: String,
) -> Result<(), String> {
  let extension = attachment_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("attachments").join(project_id).join(format!("{attachment_id}.{extension}"));
  if path.exists() {
    std::fs::remove_file(path).map_err(|error| error.to_string())?;
  }
  Ok(())
}

#[tauri::command]
fn read_attachment(
  app: tauri::AppHandle,
  project_id: String,
  attachment_id: String,
  extension: String,
) -> Result<Vec<u8>, String> {
  let extension = attachment_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("attachments").join(project_id).join(format!("{attachment_id}.{extension}"));
  std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_reference_text(
  app: tauri::AppHandle,
  project_id: String,
  reference_id: String,
  extension: String,
  bytes: Vec<u8>,
) -> Result<String, String> {
  let extension = reference_extension(&extension)?;
  if bytes.is_empty() || bytes.len() > 50 * 1024 * 1024 {
    return Err("reference text size must be between 1 byte and 50 MB".into());
  }
  let directory = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("references").join(&project_id);
  std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
  let path = directory.join(format!("{reference_id}.{extension}"));
  std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
  Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn delete_reference_text(
  app: tauri::AppHandle,
  project_id: String,
  reference_id: String,
  extension: String,
) -> Result<(), String> {
  let extension = reference_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("references").join(project_id).join(format!("{reference_id}.{extension}"));
  if path.exists() {
    std::fs::remove_file(path).map_err(|error| error.to_string())?;
  }
  Ok(())
}

#[tauri::command]
fn read_reference_text(
  app: tauri::AppHandle,
  project_id: String,
  reference_id: String,
  extension: String,
) -> Result<Vec<u8>, String> {
  let extension = reference_extension(&extension)?;
  let path = app.path().app_data_dir().map_err(|error| error.to_string())?
    .join("references").join(project_id).join(format!("{reference_id}.{extension}"));
  std::fs::read(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn save_project_backup(directory: String, file_name: String, bytes: Vec<u8>) -> Result<String, String> {
  let directory = directory.trim();
  if directory.is_empty() {
    return Err("save directory is empty".into());
  }
  if bytes.is_empty() || bytes.len() > 500 * 1024 * 1024 {
    return Err("backup size must be between 1 byte and 500 MB".into());
  }
  let name = std::path::Path::new(file_name.trim())
    .file_name()
    .and_then(|value| value.to_str())
    .filter(|value| !value.is_empty() && value.to_ascii_lowercase().ends_with(".zili"))
    .ok_or_else(|| "invalid backup file name".to_string())?;
  let safe_name: String = name
    .chars()
    .map(|character| {
      if character.is_control() || matches!(character, '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*') {
        '_'
      } else {
        character
      }
    })
    .collect();
  let path = std::path::Path::new(directory).join(safe_name);
  if let Some(parent) = path.parent() {
    std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }
  std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
  Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  use tauri_plugin_sql::{Migration, MigrationKind};

  let migrations = vec![
    Migration {
      version: 1,
      description: "create_projects_and_chapters",
      sql: r#"
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        active_chapter_id TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_chapters_project_order
        ON chapters(project_id, sort_order);
    "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "add_volumes_and_revisions",
      sql: r#"
        CREATE TABLE IF NOT EXISTS volumes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          sort_order INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        ALTER TABLE chapters ADD COLUMN volume_id TEXT;
        INSERT INTO volumes (id, project_id, title, sort_order, created_at)
          SELECT id || '-default-volume', id, '第一卷', 0, updated_at FROM projects;
        UPDATE chapters
          SET volume_id = project_id || '-default-volume'
          WHERE volume_id IS NULL;
        CREATE INDEX IF NOT EXISTS idx_volumes_project_order
          ON volumes(project_id, sort_order);
        CREATE TABLE IF NOT EXISTS revisions (
          id TEXT PRIMARY KEY NOT NULL,
          chapter_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_revisions_chapter_created
          ON revisions(chapter_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 3,
      description: "add_deleted_chapters",
      sql: r#"
        CREATE TABLE IF NOT EXISTS deleted_chapters (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          original_volume_id TEXT NOT NULL,
          volume_title TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          deleted_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_deleted_chapters_project_time
          ON deleted_chapters(project_id, deleted_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 4,
      description: "add_project_assets",
      sql: r#"
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_assets_project_created
          ON assets(project_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 5,
      description: "add_project_attachments",
      sql: r#"
        CREATE TABLE IF NOT EXISTS attachments (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_attachments_project_created
          ON attachments(project_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 6,
      description: "add_attachment_scope",
      sql: r#"
        ALTER TABLE attachments ADD COLUMN scope_type TEXT NOT NULL DEFAULT 'project';
        ALTER TABLE attachments ADD COLUMN scope_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_attachments_project_scope
          ON attachments(project_id, scope_type, scope_id);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 7,
      description: "add_scenes",
      sql: r#"
        ALTER TABLE projects ADD COLUMN active_scene_id TEXT;
        CREATE TABLE IF NOT EXISTS scenes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          title TEXT NOT NULL,
          goal TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        INSERT INTO scenes (id, project_id, chapter_id, title, goal, notes, sort_order, updated_at)
          SELECT id || '-default-scene', project_id, id, '场景 1', '', '', 0, updated_at
          FROM chapters;
        UPDATE projects
          SET active_scene_id = active_chapter_id || '-default-scene'
          WHERE active_scene_id IS NULL;
        CREATE INDEX IF NOT EXISTS idx_scenes_project_chapter_order
          ON scenes(project_id, chapter_id, sort_order);
        ALTER TABLE deleted_chapters ADD COLUMN scenes_json TEXT NOT NULL DEFAULT '[]';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 8,
      description: "add_structured_chapter_content",
      sql: r#"
        ALTER TABLE chapters ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE chapters ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE chapters ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE chapters ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 9,
      description: "add_reference_texts",
      sql: r#"
        CREATE TABLE IF NOT EXISTS reference_texts (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          extension TEXT NOT NULL,
          media_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          local_path TEXT NOT NULL,
          rights_confirmed_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_reference_texts_project_created
          ON reference_texts(project_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 10,
      description: "add_project_soft_delete",
      sql: r#"
        ALTER TABLE projects ADD COLUMN deleted_at INTEGER;
        CREATE INDEX IF NOT EXISTS idx_projects_deleted_updated
          ON projects(deleted_at, updated_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 11,
      description: "add_structured_deleted_content_and_revisions",
      sql: r#"
        ALTER TABLE deleted_chapters ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE deleted_chapters ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE deleted_chapters ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE deleted_chapters ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN content_json TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN plain_text TEXT NOT NULL DEFAULT '';
        ALTER TABLE revisions ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE revisions ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 12,
      description: "add_story_memory",
      sql: r#"
        CREATE TABLE IF NOT EXISTS chapter_memories (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          summary TEXT NOT NULL,
          revision_number INTEGER NOT NULL,
          content_hash TEXT NOT NULL,
          analyzed_at INTEGER NOT NULL,
          UNIQUE(project_id, chapter_id),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_chapter_memories_project
          ON chapter_memories(project_id, analyzed_at DESC);
        CREATE TABLE IF NOT EXISTS story_memory_candidates (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'candidate',
          confidence REAL NOT NULL DEFAULT 0,
          evidence_node_id TEXT NOT NULL,
          evidence_quote TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_story_memory_candidates_project_status
          ON story_memory_candidates(project_id, status, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_story_memory_candidates_chapter
          ON story_memory_candidates(chapter_id, created_at ASC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 13,
      description: "add_creative_advisor",
      sql: r#"
        CREATE TABLE IF NOT EXISTS creative_briefs (
          project_id TEXT PRIMARY KEY NOT NULL,
          premise TEXT NOT NULL DEFAULT '',
          genre TEXT NOT NULL DEFAULT '',
          core_experience TEXT NOT NULL DEFAULT '',
          theme TEXT NOT NULL DEFAULT '',
          protagonist_desire TEXT NOT NULL DEFAULT '',
          stakes TEXT NOT NULL DEFAULT '',
          central_conflict TEXT NOT NULL DEFAULT '',
          length_target TEXT NOT NULL DEFAULT '',
          ending_tendency TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS outline_nodes (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          parent_id TEXT,
          level TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          locked INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT 'author',
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_outline_nodes_project_level
          ON outline_nodes(project_id, level, sort_order ASC);
        CREATE TABLE IF NOT EXISTS advisor_sessions (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          scene_id TEXT,
          situation TEXT NOT NULL,
          obstacle TEXT NOT NULL,
          directions_json TEXT NOT NULL,
          user_note TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_advisor_sessions_project_created
          ON advisor_sessions(project_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 14,
      description: "add_ai_text_candidates",
      sql: r#"
        CREATE TABLE IF NOT EXISTS ai_text_candidates (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT NOT NULL,
          mode TEXT NOT NULL,
          title TEXT NOT NULL,
          text TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'candidate',
          anchor_from INTEGER NOT NULL,
          anchor_to INTEGER NOT NULL,
          source_text TEXT NOT NULL DEFAULT '',
          task_json TEXT NOT NULL,
          validation_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_text_candidates_chapter_created
          ON ai_text_candidates(chapter_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 15,
      description: "add_review_issues",
      sql: r#"
        CREATE TABLE IF NOT EXISTS review_issues (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          chapter_id TEXT,
          category TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          source TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          suggestion TEXT NOT NULL DEFAULT '',
          evidence_json TEXT NOT NULL,
          content_hash TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_review_issues_project_status
          ON review_issues(project_id, status, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_review_issues_chapter
          ON review_issues(chapter_id, updated_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 16,
      description: "add_style_profiles",
      sql: r#"
        CREATE TABLE IF NOT EXISTS style_profiles (
          project_id TEXT PRIMARY KEY NOT NULL,
          profile_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 17,
      description: "add_ai_usage_logs",
      sql: r#"
        CREATE TABLE IF NOT EXISTS ai_usage_logs (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT,
          task_type TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt_tokens INTEGER,
          completion_tokens INTEGER,
          latency_ms INTEGER NOT NULL,
          success INTEGER NOT NULL,
          error_code INTEGER,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_project_created
          ON ai_usage_logs(project_id, created_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 18,
      description: "add_ai_conversations",
      sql: r#"
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          UNIQUE(project_id, kind),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_project_updated
          ON ai_conversations(project_id, updated_at DESC);
        CREATE TABLE IF NOT EXISTS ai_conversation_messages (
          id TEXT PRIMARY KEY NOT NULL,
          conversation_id TEXT NOT NULL,
          request_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL DEFAULT '',
          payload_json TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          error TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_conversation_created
          ON ai_conversation_messages(conversation_id, created_at ASC);
        CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_request
          ON ai_conversation_messages(request_id);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 19,
      description: "add_advanced_ai_tools",
      sql: r#"
        CREATE TABLE IF NOT EXISTS advanced_ai_records (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          title TEXT NOT NULL,
          input_json TEXT NOT NULL,
          output_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_advanced_ai_records_project_kind
          ON advanced_ai_records(project_id, kind, updated_at DESC);
        CREATE TABLE IF NOT EXISTS research_source_cards (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL DEFAULT '',
          excerpt TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          verified INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_research_source_cards_project_updated
          ON research_source_cards(project_id, updated_at DESC);
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 20,
      description: "add_story_memory_metadata",
      sql: r#"
        ALTER TABLE story_memory_candidates ADD COLUMN metadata_json TEXT NOT NULL DEFAULT '{}';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 21,
      description: "add_ai_usage_prompt_version",
      sql: r#"
        ALTER TABLE ai_usage_logs ADD COLUMN prompt_version TEXT NOT NULL DEFAULT '';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 22,
      description: "add_scene_document_anchors",
      sql: r#"
        ALTER TABLE scenes ADD COLUMN summary TEXT NOT NULL DEFAULT '';
        ALTER TABLE scenes ADD COLUMN start_node_id TEXT NOT NULL DEFAULT '';
        ALTER TABLE scenes ADD COLUMN end_node_id TEXT NOT NULL DEFAULT '';
      "#,
      kind: MigrationKind::Up,
    },
    Migration {
      version: 23,
      description: "allow_multiple_ai_conversations",
      sql: r#"
        CREATE TABLE ai_conversations_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          project_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          title TEXT NOT NULL,
          chapter_id TEXT,
          scene_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        INSERT INTO ai_conversations_v2
          SELECT id, project_id, kind, title, chapter_id, scene_id, created_at, updated_at FROM ai_conversations;
        CREATE TABLE ai_conversation_messages_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          conversation_id TEXT NOT NULL,
          request_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL DEFAULT '',
          payload_json TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          error TEXT NOT NULL DEFAULT '',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES ai_conversations_v2(id) ON DELETE CASCADE
        );
        INSERT INTO ai_conversation_messages_v2
          SELECT id, conversation_id, request_id, role, content, payload_json, status, error, created_at FROM ai_conversation_messages;
        DROP TABLE ai_conversation_messages;
        DROP TABLE ai_conversations;
        ALTER TABLE ai_conversations_v2 RENAME TO ai_conversations;
        ALTER TABLE ai_conversation_messages_v2 RENAME TO ai_conversation_messages;
        CREATE INDEX idx_ai_conversations_project_updated
          ON ai_conversations(project_id, updated_at DESC);
        CREATE INDEX idx_ai_conversation_messages_conversation_created
          ON ai_conversation_messages(conversation_id, created_at ASC);
        CREATE INDEX idx_ai_conversation_messages_request
          ON ai_conversation_messages(request_id);
      "#,
      kind: MigrationKind::Up,
    },
  ];

  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      save_image_asset,
      delete_image_asset,
      read_image_asset,
      save_attachment,
      delete_attachment,
      read_attachment,
      save_reference_text,
      delete_reference_text,
      read_reference_text,
      save_ai_api_key,
      load_ai_api_key,
      delete_ai_api_key,
      save_ai_settings,
      load_ai_settings,
      save_project_backup,
    ])
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:zili.db", migrations)
        .build(),
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
