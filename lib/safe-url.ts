const MAX_URL_LENGTH = 2048

export function isSafeHttpUrl(value: unknown, { httpsOnly = false } = {}): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_URL_LENGTH) return false
  try {
    const url = new URL(value)
    if (url.username || url.password) return false
    return httpsOnly ? url.protocol === "https:" : url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

// Blocks javascript:, data:, vbscript: and other script-capable schemes from reaching href/src.
export function safeHref(value: string | null | undefined): string {
  return isSafeHttpUrl(value) ? value : "#"
}

const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i

export function isValidHostname(value: unknown): value is string {
  return typeof value === "string" && HOSTNAME_PATTERN.test(value)
}

// Strips control characters and caps length for free-text fields stored from user input.
export function sanitizeText(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return ""
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength)
}

// JSON.stringify does not escape "</script>", so escape "<" before embedding in a script tag.
export function serializeJsonForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
