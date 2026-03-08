// ModuMark Tauri 앱 진입점
// Tauri 2.0 플러그인 초기화 + .md 파일 연결 처리

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 단일 인스턴스: .md 파일 더블클릭 시 기존 창에 포커스
        .plugin(
            tauri_plugin_single_instance::Builder::new()
                .callback(|app, argv, _cwd| {
                    // .md 파일 경로가 인자로 전달된 경우 프론트엔드로 전달
                    let md_files: Vec<String> = argv
                        .iter()
                        .skip(1) // 첫 번째 인자(앱 경로) 제외
                        .filter(|arg| {
                            arg.ends_with(".md") || arg.ends_with(".markdown")
                        })
                        .cloned()
                        .collect();

                    if !md_files.is_empty() {
                        // 메인 창에 파일 열기 이벤트 전송
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("app:open-files", &md_files);
                            let _ = window.set_focus();
                        }
                    } else {
                        // 파일 없이 앱 재실행 시 기존 창 포커스
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(),
        )
        // 파일 시스템 플러그인: .md 파일 읽기/쓰기
        .plugin(tauri_plugin_fs::init())
        // 파일/폴더 열기 다이얼로그
        .plugin(tauri_plugin_dialog::init())
        // 외부 URL 열기 (브라우저)
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 앱 시작 시 커맨드라인 인자에서 .md 파일 경로 처리
            let args: Vec<String> = std::env::args().skip(1).collect();
            let md_files: Vec<String> = args
                .iter()
                .filter(|arg| arg.ends_with(".md") || arg.ends_with(".markdown"))
                .cloned()
                .collect();

            if !md_files.is_empty() {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    // 창이 로드될 때까지 잠시 대기
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.emit("app:open-files", &md_files);
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Tauri 앱 실행 중 오류 발생");
}
