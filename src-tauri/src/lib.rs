// ModuMark Tauri 앱 진입점
// Tauri 2.0 플러그인 초기화 + .md/.pdf 파일 연결 처리
// Pull 방식으로 레이스 컨디션 및 FS Scope 제한 문제 해결

use std::sync::Mutex;
use tauri::Manager;
use tauri::Emitter;

// 파일 데이터 구조체 (프론트엔드로 직렬화)
#[derive(serde::Serialize, Clone)]
struct MdFileData {
    name: String,
    content: String,
}

#[derive(serde::Serialize, Clone)]
struct PdfFileData {
    name: String,
    bytes: Vec<u8>,
}

#[derive(serde::Serialize)]
struct InitialFileData {
    md_files: Vec<MdFileData>,
    pdf_files: Vec<PdfFileData>,
}

// 앱 시작 시 CLI 인자로 전달된 파일을 저장하는 상태
#[derive(Default)]
struct InitialFiles {
    md_files: Vec<MdFileData>,
    pdf_files: Vec<PdfFileData>,
}

// 프론트엔드가 마운트 후 invoke로 초기 파일 데이터를 가져가는 커맨드
// Pull 방식: 레이스 컨디션 없이 항상 데이터 수신 보장
#[tauri::command]
fn get_initial_files(state: tauri::State<'_, Mutex<InitialFiles>>) -> InitialFileData {
    let mut files = state.lock().unwrap();
    InitialFileData {
        // take()로 소비 → 중복 처리 방지
        md_files: std::mem::take(&mut files.md_files),
        pdf_files: std::mem::take(&mut files.pdf_files),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 단일 인스턴스: 앱 실행 중 파일 더블클릭 시 기존 창에 파일 전달
        .plugin(
            tauri_plugin_single_instance::Builder::new()
                .callback(|app, argv, _cwd| {
                    let args: Vec<String> = argv.iter().skip(1).cloned().collect();

                    // MD 파일: std::fs로 직접 읽기 (FS Scope 제한 우회)
                    let md_files: Vec<MdFileData> = args
                        .iter()
                        .filter(|arg| arg.ends_with(".md") || arg.ends_with(".markdown"))
                        .filter_map(|path| {
                            let content = std::fs::read_to_string(path).ok()?;
                            let name = std::path::Path::new(path)
                                .file_name()?
                                .to_string_lossy()
                                .into_owned();
                            Some(MdFileData { name, content })
                        })
                        .collect();

                    // PDF 파일: std::fs로 직접 읽기 (FS Scope 제한 우회)
                    let pdf_files: Vec<PdfFileData> = args
                        .iter()
                        .filter(|arg| arg.ends_with(".pdf"))
                        .filter_map(|path| {
                            let bytes = std::fs::read(path).ok()?;
                            let name = std::path::Path::new(path)
                                .file_name()?
                                .to_string_lossy()
                                .into_owned();
                            Some(PdfFileData { name, bytes })
                        })
                        .collect();

                    if let Some(window) = app.get_webview_window("main") {
                        // 파일 내용을 이벤트 페이로드에 포함하여 emit
                        if !md_files.is_empty() {
                            let _ = window.emit("app:open-files", &md_files);
                        }
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
        // Pull 방식 커맨드 등록
        .invoke_handler(tauri::generate_handler![get_initial_files])
        .setup(|app| {
            // CLI 인자에서 파일 경로 파싱 → std::fs로 직접 읽기
            let args: Vec<String> = std::env::args().skip(1).collect();

            let md_files: Vec<MdFileData> = args
                .iter()
                .filter(|arg| arg.ends_with(".md") || arg.ends_with(".markdown"))
                .filter_map(|path| {
                    let content = std::fs::read_to_string(path).ok()?;
                    let name = std::path::Path::new(path)
                        .file_name()?
                        .to_string_lossy()
                        .into_owned();
                    Some(MdFileData { name, content })
                })
                .collect();

            let pdf_files: Vec<PdfFileData> = args
                .iter()
                .filter(|arg| arg.ends_with(".pdf"))
                .filter_map(|path| {
                    let bytes = std::fs::read(path).ok()?;
                    let name = std::path::Path::new(path)
                        .file_name()?
                        .to_string_lossy()
                        .into_owned();
                    Some(PdfFileData { name, bytes })
                })
                .collect();

            // 읽은 파일 내용을 앱 상태로 저장
            // 프론트엔드가 마운트 후 invoke('get_initial_files')로 가져감
            app.manage(Mutex::new(InitialFiles { md_files, pdf_files }));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Tauri 앱 실행 중 오류 발생");
}
