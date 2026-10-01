/**
 * Penanda "intro udah diputar" — disimpan di sessionStorage supaya
 * loading screen cuma muncul sekali per sesi browser.
 * Dipisah dari komponennya biar Fast Refresh tetap jalan mulus.
 */
const INTRO_SESSION_KEY = 'gabzdev_intro_seen';

/** Total durasi intro (ms) sebelum onDone dipanggil. */
export const INTRO_DURATION = 3600;

export function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    /* private mode / storage diblokir — abaikan saja */
  }
}
