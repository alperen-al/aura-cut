// Release'te arka planda konsol penceresi açılmasın
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    aura_cut_lib::run()
}
