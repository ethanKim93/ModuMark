// ModuMark Tauri 앱 진입점
// Tauri 2.0 플러그인 초기화 + .md 파일 연결 처리

use tauri::Manager;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 단일 인스턴스: .md 파일 더블클릭 시 기존 창에 포커스
        .plugin(
            tauri_plugin_single_instance::Builder::new()
                .callback(|app, argv, _cwd| {
                    // 파일 경로 인자를 타입별로 분류
                    let args: Vec<String> = argv.iter().skip(1).cloned().collect();
                    let md_files: Vec<String> = args
                        .iter()
                        .filter(|arg| arg.ends_with(".md") || arg.ends_with(".markdown"))
                        .cloned()
                        .collect();
                    let pdf_files: Vec<String> = args
                        .iter()
                        .filter(|arg| arg.ends_with(".pdf"))
                        .cloned()
                        .collect();

                    if let Some(window) = app.get_webview_window("main") {
                        // .md 파일 → 마크다운 에디터 탭으로 열기
                        if !md_files.is_empty() {
                            let _ = window.emit("app:open-files", &md_files);
                        }
                        // .pdf 파일 → PDF 뷰어로 열기
                        if !pdf_files.is_empty() {
                            let _ = window.emit("app:open-pdf-files", &pdf_files);
                        }
                        let _ = window.set_focus();
                    }
                })
                .build(),
        )
        // 창 상태(크기·위치·최대화) 저장/복원
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // 자동 업데이터 (GitHub Releases)
        .plugin(tauri_plugin_updater::Builder::new().build())
        // 프로세스 재시작 (업데이트 설치 후)
        .plugin(tauri_plugin_process::init())
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
            let pdf_files: Vec<String> = args
                .iter()
                .filter(|arg| arg.ends_with(".pdf"))
                .cloned()
                .collect();

            if !md_files.is_empty() || !pdf_files.is_empty() {
                let app_handle = app.handle().clone();
                let md = md_files.clone();
                let pdf = pdf_files.clone();
                tauri::async_runtime::spawn(async move {
                    // 창이 로드될 때까지 잠시 대기
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                    if let Some(window) = app_handle.get_webview_window("main") {
                        // .md 파일 → 마크다운 에디터
                        if !md.is_empty() {
                            let _ = window.emit("app:open-files", &md);
                        }
                        // .pdf 파일 → PDF 뷰어
                        if !pdf.is_empty() {
                            let _ = window.emit("app:open-pdf-files", &pdf);
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Tauri 앱 실행 중 오류 발생");
}
