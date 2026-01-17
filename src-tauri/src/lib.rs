// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "intialize_database",
            sql: "CREATE TABLE data (id TEXT PRIMARY KEY, boardID TEXT, x INTEGER, y INTEGER, type TEXT, title TEXT, content TEXT, file TEXT, editing INTEGER); CREATE TABLE boards (id TEXT PRIMARY KEY, boardType TEXT, boardName TEXT); CREATE TABLE lines (id TEXT PRIMARY KEY, boardId TEXT, node1 TEXT, node2 TEXT, type INTEGER);",
            kind: MigrationKind::Up
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:data.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
