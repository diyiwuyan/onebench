const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function deriveKey(passphrase, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export async function encryptWorkspaceBackup(workspace, passphrase) {
  if (!passphrase || passphrase.length < 8) throw new Error('加密口令至少需要 8 位。')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(passphrase, salt)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(workspace)))
  return { format: 'onebench-encrypted-backup/v1', createdAt: new Date().toISOString(), salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) }
}

export async function decryptWorkspaceBackup(backup, passphrase) {
  if (backup?.format !== 'onebench-encrypted-backup/v1') throw new Error('不是一句工作台加密备份。')
  try {
    const key = await deriveKey(passphrase, base64ToBytes(backup.salt))
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(backup.iv) }, key, base64ToBytes(backup.ciphertext))
    return JSON.parse(decoder.decode(plaintext))
  } catch {
    throw new Error('无法解密备份：请检查口令。')
  }
}
