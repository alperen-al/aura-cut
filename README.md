# AURA CUT

Definasyon & beslenme takibi için Windows masaüstü uygulaması. Tauri v2 (Rust) + React + Tailwind + Motion.

## Çalıştırma

```bash
npm install
npm run app:dev     # geliştirme (sıcak yenileme)
npm run app:build   # üretim: .exe + NSIS kurulum dosyası
npm test            # motor + hesaplayıcı testleri
```

Gereksinimler: Node 22+, Rust (rustup), Visual Studio C++ Build Tools. Derleme çıktısı OneDrive dışında:
`C:/Users/alpmr/.cache/aura-cut-target` (bkz. `src-tauri/.cargo/config.toml`).

## Mimari

```
src/
  data/meals.ts         hazır öğünler, kombolar, serbest öğün şablonları
  data/foodDb.ts        gramajlı besin veritabanı (Temel / BİM / Migros, 100 g değerleri)
  lib/engine.ts         saf motor: telafi protokolü, 10 gün döngüsü, açık/yağ, seri, projeksiyon
  lib/derived.tsx       motoru veri değişince tek kez çalıştırır (context)
  lib/storage.ts        Tauri → JSON dosyası, tarayıcı → localStorage; 250 ms birleştirmeli kayıt
  store/useAura.ts      zustand durum + eylemler (geri al dahil)
  components/           arayüz
src-tauri/
  src/lib.rs            tepsi, isteğe bağlı pencere, atomik kayıt, autostart, hatırlatıcılar
  tauri.conf.json       pencere (create:false, frameless, mica) + paket ayarları
```

## Performans

- Pencere kapatılınca WebView **yok edilir**; uygulama tepside yalnızca Rust süreci olarak kalır (~6 MB özel RAM).
- Pencere açıkken ~150 MB özel RAM (WebView2 tabanı dahil).
- Animasyonlar yalnızca transform/opacity → kompozitör katmanı, monitör yenileme hızında (120 Hz+).
- Release profili: tam LTO, `opt-level = "s"`, `panic = "abort"`, strip → 3,7 MB exe, 1,5 MB kurulum.

## Veri

`%APPDATA%\com.alp.auracut\aura-state.json` (+ `.bak` önceki sürüm). Ayarlar → Yedek ile panoya kopyala / geri yükle.

## Kısayollar

`1/2/3` görünümler · `← →` günler · `Ctrl+Z` geri al · `Esc` ayarları kapat
