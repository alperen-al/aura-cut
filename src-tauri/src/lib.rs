//! AURA CUT — Rust çekirdeği
//!
//! RAM stratejisi ("tepside uyku"):
//!   Pencere kapatıldığında WebView2 süreçleri tamamen yok edilir; uygulama tepside yalnızca
//!   bu küçük Rust süreci olarak (birkaç MB) yaşar. Tepsi simgesine tıklanınca pencere
//!   tauri.conf.json'daki tanımdan yeniden kurulur. Gizlemek yerine yok etmek, arka planda
//!   ~60-100 MB'lık WebView belleğini sıfıra indirir.

use std::{
    fs,
    io::Write,
    path::PathBuf,
    thread,
    time::Duration,
};

use chrono::{Local, NaiveDate, Timelike};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, RunEvent, WebviewWindowBuilder,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_notification::NotificationExt;

const MAIN: &str = "main";
const STATE_FILE: &str = "aura-state.json";

// ── Kalıcılık ────────────────────────────────────────────────────────────

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// %APPDATA%\com.alp.auracut\aura-state.json
#[tauri::command]
fn load_state(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(STATE_FILE);
    match fs::read_to_string(&path) {
        Ok(s) => Ok(Some(s)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Atomik yazım: geçici dosya → fsync → yerine taşı. Elektrik kesilse bile
/// dosya ya eski ya yeni haliyle kalır, asla yarım kalmaz. Bir önceki sürüm .bak olarak tutulur.
#[tauri::command]
fn save_state(app: AppHandle, data: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let dst = dir.join(STATE_FILE);
    let tmp = dir.join(format!("{STATE_FILE}.tmp"));
    {
        let mut f = fs::File::create(&tmp).map_err(|e| e.to_string())?;
        f.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        f.sync_all().map_err(|e| e.to_string())?;
    }
    if dst.exists() {
        let _ = fs::copy(&dst, dir.join(format!("{STATE_FILE}.bak")));
    }
    fs::rename(&tmp, &dst).map_err(|e| e.to_string())
}

// ── Pencere yönetimi ─────────────────────────────────────────────────────

fn show_main(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(MAIN) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    // Pencere "create": false ile tanımlı → ilk ihtiyaçta config'ten kur
    let Some(cfg) = app.config().app.windows.iter().find(|w| w.label == MAIN).cloned() else {
        return;
    };
    match WebviewWindowBuilder::from_config(app, &cfg).and_then(|b| b.build()) {
        Ok(w) => {
            let _ = w.set_focus();
        }
        Err(e) => eprintln!("[aura] pencere oluşturulamadı: {e}"),
    }
}

fn toggle_main(app: &AppHandle) {
    match app.get_webview_window(MAIN) {
        Some(w) if w.is_visible().unwrap_or(false) && !w.is_minimized().unwrap_or(false) => {
            // close → JS tarafı veriyi diske boşaltır → WebView yok edilir
            let _ = w.close();
        }
        _ => show_main(app),
    }
}

// ── Sistem tepsisi ───────────────────────────────────────────────────────

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "AURA CUT'ı aç", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Tamamen çık", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &sep, &quit])?;

    let mut tray = TrayIconBuilder::with_id("aura")
        .tooltip("AURA CUT · Definasyon")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, e| match e.id().as_ref() {
            "open" => show_main(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, e| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = e
            {
                toggle_main(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)?;
    Ok(())
}

// ── Otomatik başlatma (ilk çalıştırmada bir kez) ─────────────────────────

/// Kullanıcı sonradan Ayarlar'dan kapatırsa her açılışta zorla geri açmamak için işaret dosyası.
fn first_run_autostart(app: &AppHandle) {
    let Ok(dir) = data_dir(app) else { return };
    let marker = dir.join("autostart.init");
    if marker.exists() {
        return;
    }
    if app.autolaunch().enable().is_ok() {
        let _ = fs::write(marker, b"1");
    }
}

// ── Hatırlatıcılar (WebView kapalıyken de çalışır) ───────────────────────

fn notify(app: &AppHandle, title: &str, body: &str) {
    let _ = app.notification().builder().title(title).body(body).show();
}

/// Dakikada bir uyanan tek, uykuda bekleyen thread: CPU ~0, RAM ~0.
fn spawn_reminders(app: AppHandle) {
    thread::spawn(move || {
        let mut weigh_done: Option<NaiveDate> = None;
        let mut zma_done: Option<NaiveDate> = None;
        loop {
            let now = Local::now();
            let today = now.date_naive();
            let (h, m) = (now.hour(), now.minute());

            if (7..11).contains(&h) && weigh_done != Some(today) {
                notify(&app, "⚖ Tartı zamanı", "Sabah, tuvalet sonrası, aç karnına, kıyafetsiz.");
                weigh_done = Some(today);
            }
            if (h == 22 && m >= 30 || h == 23) && zma_done != Some(today) {
                notify(&app, "🌙 ZMA zamanı", "Yatmadan önce ZMA — takviye listesini işaretlemeyi unutma.");
                zma_done = Some(today);
            }
            thread::sleep(Duration::from_secs(60));
        }
    });
}

// ── Giriş noktası ────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // İkinci kez açılmaya çalışılırsa mevcut pencereyi öne getir (ilk eklenti olmalı)
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| show_main(app)))
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--minimized"])))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_state, save_state])
        .setup(|app| {
            let handle = app.handle().clone();
            build_tray(&handle)?;
            first_run_autostart(&handle);
            spawn_reminders(handle.clone());
            // Windows açılışında (--minimized) pencere hiç kurulmaz → sıfır WebView belleği
            if !std::env::args().any(|a| a == "--minimized") {
                show_main(&handle);
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("AURA CUT başlatılamadı")
        .run(|_app, event| {
            // Son pencere kapanınca çıkma; tepside yaşamaya devam et.
            // app.exit(0) (tepsi → "Tamamen çık") code=Some(0) getirir ve izin verilir.
            if let RunEvent::ExitRequested { code, api, .. } = event {
                if code.is_none() {
                    api.prevent_exit();
                }
            }
        });
}
