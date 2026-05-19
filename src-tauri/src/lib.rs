use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LogEntry {
    timestamp: String,
    message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Note {
    id: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Contact {
    name: String,
    #[serde(default)]
    notes: Vec<Note>,
    #[serde(default)]
    log: Vec<LogEntry>,
    #[serde(rename = "lastEditedAt", skip_serializing_if = "Option::is_none")]
    last_edited_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Settings {
    #[serde(rename = "dataFolder")]
    data_folder: Option<String>,
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

#[tauri::command]
fn get_data_folder(app: AppHandle) -> Result<Option<String>, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let contents = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let settings: Settings = serde_json::from_str(&contents).map_err(|e| e.to_string())?;
    Ok(settings.data_folder)
}

#[tauri::command]
fn set_data_folder(app: AppHandle, path: String) -> Result<(), String> {
    let settings_file = settings_path(&app)?;
    let settings = Settings {
        data_folder: Some(path),
    };
    let contents = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&settings_file, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_contacts(folder: String) -> Result<Vec<String>, String> {
    let dir = PathBuf::from(&folder);
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    let mut names = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                names.push(stem.to_string());
            }
        }
    }
    names.sort();
    Ok(names)
}

#[tauri::command]
fn load_contact(folder: String, name: String) -> Result<Contact, String> {
    let path = PathBuf::from(&folder).join(format!("{}.json", name));
    let contents = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let contact: Contact = serde_json::from_str(&contents).map_err(|e| e.to_string())?;
    Ok(contact)
}

#[tauri::command]
fn save_contact(folder: String, contact: Contact, old_name: Option<String>) -> Result<(), String> {
    let dir = PathBuf::from(&folder);
    // If name changed, delete the old file
    if let Some(old) = old_name {
        if old != contact.name {
            let old_path = dir.join(format!("{}.json", old));
            if old_path.exists() {
                fs::remove_file(&old_path).map_err(|e| e.to_string())?;
            }
        }
    }
    let path = dir.join(format!("{}.json", contact.name));
    let contact = Contact {
        last_edited_at: Some(chrono::Local::now().to_rfc3339()),
        ..contact
    };
    let contents = serde_json::to_string_pretty(&contact).map_err(|e| e.to_string())?;
    fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_contact(folder: String, name: String) -> Result<(), String> {
    let path = PathBuf::from(&folder).join(format!("{}.json", name));
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_data_folder,
            set_data_folder,
            list_contacts,
            load_contact,
            save_contact,
            delete_contact,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
