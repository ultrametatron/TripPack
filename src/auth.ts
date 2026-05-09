const PIN_KEY = "trippack:pin_hash";

export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export function hasPin(): boolean {
  try {
    return !!localStorage.getItem(PIN_KEY);
  } catch {
    return false;
  }
}

export async function setPin(pin: string): Promise<void> {
  const h = await hashPin(pin);
  localStorage.setItem(PIN_KEY, h);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return true;
  const h = await hashPin(pin);
  return h === stored;
}

export function clearPin(): void {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {
    // ignore
  }
}
