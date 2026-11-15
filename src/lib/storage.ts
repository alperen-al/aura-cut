import { invoke } from "@tauri-apps/api/core";

/** Tauri içinde mi (yoksa tarayıcı önizlemesi mi) */
export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const LS_KEY = "aura-cut:v1";
let timer: ReturnType<typeof setTimeout> | undefined;
let pending: string | null = null;

/**
 * Tauri: %APPDATA%/com.alp.auracut/aura-state.json (Rust tarafında atomik yazım).
 * Tarayıcı: localStorage.
 */
export async function loadRaw(): Promise<string | null> {
  if (isTauri) {
    try {
      return await invoke<string | null>("load_state");
    } catch (e) {
      console.error("[aura] load_state", e);
    }
  }
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

/** Ardışık değişiklikleri birleştirir: tıklama fırtınasında tek disk yazımı */
export function scheduleSave(json: string) {
  pending = json;
  clearTimeout(timer);
  timer = setTimeout(flush, 250);
}

export async function flush() {
  clearTimeout(timer);
  if (pending === null) return;
  const data = pending;
  pending = null;
  if (isTauri) {
    try {
      await invoke("save_state", { data });
      return;
    } catch (e) {
      console.error("[aura] save_state", e);
    }
  }
  try {
    localStorage.setItem(LS_KEY, data);
  } catch {
    /* depolama kapalı */
  }
}
