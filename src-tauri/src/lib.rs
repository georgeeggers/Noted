// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE data (id TEXT PRIMARY KEY, boardID TEXT, x INTEGER, y INTEGER, type TEXT, title TEXT, content TEXT, file TEXT, editing INTEGER);",
            kind: MigrationKind::Up
        },
        Migration {
            version: 2,
            description: "create_boards",
            sql: " CREATE TABLE boards (id TEXT PRIMARY KEY, boardType TEXT, boardName TEXT);",
            kind: MigrationKind::Up
        }
    ];

    tauri::Builder::default()

        .setup(|app| {
            let main_webview = app.get_webview_window("main").unwrap();
            main_webview.with_webview(|webview| {

                #[cfg(target_os = "linux")]
                {
                    // see <https://docs.rs/webkit2gtk/2.0.0/webkit2gtk/struct.WebView.html>
                    // and <https://docs.rs/webkit2gtk/2.0.0/webkit2gtk/trait.WebViewExt.html>
                    use webkit2gtk::WebViewExt;
                    webview.connect_context_menu(|_, _, _| {
                        true // TRUE = stop menu
                    });
                }

            });
            Ok(())
        })


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
