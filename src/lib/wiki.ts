/**
 * Wikipedia REST özet API'si (CORS açık, anahtar gerektirmez).
 * Önce Türkçe, yoksa İngilizce sayfa. Sonuç 7 gün tarayıcı önbelleğinde tutulur;
 * çevrimdışıyken uygulama fotoğrafsız/biyografisiz ama sorunsuz çalışır.
 */
export interface WikiSummary {
  title: string;
  extract: string;
  image?: string;
  url: string;
  lang: "tr" | "en";
}

const TTL = 7 * 24 * 3600 * 1000;
const key = (t: string) => `aura-wiki:${t}`;

function readCache(title: string): WikiSummary | null {
  try {
    const raw = localStorage.getItem(key(title));
    if (!raw) return null;
    const { at, v } = JSON.parse(raw) as { at: number; v: WikiSummary };
    return Date.now() - at < TTL ? v : null;
  } catch {
    return null;
  }
}

function writeCache(title: string, v: WikiSummary) {
  try {
    localStorage.setItem(key(title), JSON.stringify({ at: Date.now(), v }));
  } catch {
    /* önbellek opsiyonel */
  }
}

async function fetchLang(lang: "tr" | "en", title: string, signal?: AbortSignal): Promise<WikiSummary | null> {
  const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`, {
    signal,
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (j.type === "disambiguation" || !j.extract) return null;
  return {
    title: j.title,
    extract: j.extract,
    image: j.originalimage?.source ?? j.thumbnail?.source,
    url: j.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    lang,
  };
}

export async function fetchWiki(title: string, signal?: AbortSignal): Promise<WikiSummary | null> {
  const cached = readCache(title);
  if (cached) return cached;
  const v = (await fetchLang("tr", title, signal)) ?? (await fetchLang("en", title, signal));
  if (v) writeCache(title, v);
  return v;
}
