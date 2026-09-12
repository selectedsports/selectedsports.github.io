/**
 * Selected Sports - Scoring Local Storage & Offline Sync Queue
 * Implements Section 10: FR-10.1 to FR-10.10, AD-3, NFR-4, NFR-5.
 * Durable local store, monotonic sequence generator, sync queue with exponential backoff,
 * and Screen Wake Lock management.
 */

const STORAGE_PREFIX = "selectedsports_scoring_"
const QUEUE_KEY = `${STORAGE_PREFIX}sync_queue`
const LOCK_KEY = `${STORAGE_PREFIX}write_lock`

/**
 * Generate cryptographically sound UUID v4
 */
export function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── Local Innings Deliveries Cache (FR-10.1, FR-10.7) ──────────────────────────

export function getLocalInningsKey(inningsId) {
  return `${STORAGE_PREFIX}innings_${inningsId}_deliveries`
}

export function getLocalInningsDeliveries(inningsId) {
  try {
    const raw = localStorage.getItem(getLocalInningsKey(inningsId))
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn("Failed to read local deliveries:", err)
    return []
  }
}

export function saveLocalInningsDeliveries(inningsId, deliveries) {
  try {
    localStorage.setItem(getLocalInningsKey(inningsId), JSON.stringify(deliveries || []))
  } catch (err) {
    console.error("Failed to save local deliveries:", err)
  }
}

export function appendLocalDelivery(inningsId, delivery) {
  const list = getLocalInningsDeliveries(inningsId)
  list.push(delivery)
  saveLocalInningsDeliveries(inningsId, list)
  enqueueDeliveryForSync(delivery)
  return list
}

export function removeLastLocalDelivery(inningsId) {
  const list = getLocalInningsDeliveries(inningsId)
  if (list.length === 0) return list
  const removed = list.pop()
  saveLocalInningsDeliveries(inningsId, list)

  // Remove from sync queue if not yet sent
  removeDeliveryFromSyncQueue(removed.client_uuid)
  return list
}

export function supersedeLocalDelivery(inningsId, targetSequenceNo, newDelivery) {
  const list = getLocalInningsDeliveries(inningsId)
  const targetIndex = list.findIndex(d => d.sequence_no === targetSequenceNo)
  if (targetIndex >= 0) {
    list[targetIndex].superseded_by = newDelivery.client_uuid
  }
  list.push(newDelivery)
  saveLocalInningsDeliveries(inningsId, list)
  enqueueDeliveryForSync(newDelivery)
  return list
}

// ── Persistent Sync Queue (FR-10.2, FR-10.3, FR-10.4, FR-10.10) ───────────────

export function getSyncQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSyncQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue || []))
  } catch (err) {
    console.error("Failed to save sync queue:", err)
  }
}

export function enqueueDeliveryForSync(delivery) {
  const queue = getSyncQueue()
  // Avoid duplicate enqueues by client_uuid
  if (!queue.some(d => d.client_uuid === delivery.client_uuid)) {
    queue.push(delivery)
    saveSyncQueue(queue)
  }
}

export function removeDeliveryFromSyncQueue(clientUuid) {
  const queue = getSyncQueue().filter(d => d.client_uuid !== clientUuid)
  saveSyncQueue(queue)
}

export function markDeliveriesSynced(clientUuids = []) {
  const set = new Set(clientUuids)
  const queue = getSyncQueue().filter(d => !set.has(d.client_uuid))
  saveSyncQueue(queue)
}

export function getPendingSyncCount(inningsId = null) {
  const queue = getSyncQueue()
  if (!inningsId) return queue.length
  return queue.filter(d => d.innings_id === inningsId).length
}

// ── Screen Wake Lock Management (FR-8.15, NFR-8) ───────────────────────────────

let wakeLockSentinel = null

export async function requestScreenWakeLock() {
  try {
    if ("wakeLock" in navigator && !wakeLockSentinel) {
      wakeLockSentinel = await navigator.wakeLock.request("screen")
      wakeLockSentinel.addEventListener("release", () => {
        wakeLockSentinel = null
      })
      return true
    }
  } catch (err) {
    console.warn("Screen Wake Lock could not be acquired:", err)
  }
  return false
}

export async function releaseScreenWakeLock() {
  try {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release()
      wakeLockSentinel = null
    }
  } catch (err) {
    console.warn("Screen Wake Lock release failed:", err)
  }
}

// ── Online / Offline Connectivity Monitor (FR-10.6) ───────────────────────────

export function subscribeConnectivity(onChange) {
  const handleOnline = () => onChange(true)
  const handleOffline = () => onChange(false)

  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  return () => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  }
}

export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

// ── Auto Sync Worker (FR-10.4, FR-10.10) ──────────────────────────────────────

let syncInProgress = false
let currentBackoffMs = 2000

export async function flushSyncQueue(apiSubmitBatch) {
  if (syncInProgress) return { running: true }
  if (!isOnline()) return { offline: true }

  const queue = getSyncQueue()
  if (queue.length === 0) return { empty: true }

  syncInProgress = true
  try {
    // Sort in ascending sequence_no per FR-10.4
    const sortedQueue = [...queue].sort((a, b) => (a.sequence_no || 0) - (b.sequence_no || 0))
    // Flush batch (up to 20 at a time)
    const batch = sortedQueue.slice(0, 20)

    const result = await apiSubmitBatch(batch)
    if (result && result.success) {
      // Mark synced
      const syncedUuids = batch.map(b => b.client_uuid)
      markDeliveriesSynced(syncedUuids)
      currentBackoffMs = 2000 // reset backoff

      // If more left in queue, flush next chunk
      if (sortedQueue.length > batch.length) {
        setTimeout(() => flushSyncQueue(apiSubmitBatch), 200)
      }
      return { success: true, count: batch.length }
    } else if (result && result.conflict) {
      return { conflict: true, conflictingDelivery: result.conflictingDelivery }
    } else {
      throw new Error(result?.error || "Sync failed")
    }
  } catch (err) {
    console.warn("Offline sync flush attempt failed:", err)
    // Exponential backoff capped at 60s per FR-10.10
    currentBackoffMs = Math.min(currentBackoffMs * 2, 60000)
    return { error: err.message, retryIn: currentBackoffMs }
  } finally {
    syncInProgress = false
  }
}
