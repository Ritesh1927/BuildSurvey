'use client'

const DB_NAME = 'ConstructionSurveyDB'
const DB_VERSION = 1

const STORES = {
  surveys: 'surveys',
  photos: 'photos',
  measurements: 'measurements',
  syncQueue: 'syncQueue',
} as const

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available in server environment'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORES.surveys)) {
        const surveyStore = db.createObjectStore(STORES.surveys, { keyPath: 'id' })
        surveyStore.createIndex('status', 'status', { unique: false })
        surveyStore.createIndex('projectId', 'projectId', { unique: false })
        surveyStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.photos)) {
        const photoStore = db.createObjectStore(STORES.photos, { keyPath: 'id' })
        photoStore.createIndex('surveyId', 'surveyId', { unique: false })
        photoStore.createIndex('synced', 'synced', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.measurements)) {
        const measurementStore = db.createObjectStore(STORES.measurements, { keyPath: 'id' })
        measurementStore.createIndex('surveyId', 'surveyId', { unique: false })
        measurementStore.createIndex('synced', 'synced', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' })
        syncStore.createIndex('entityType', 'entityType', { unique: false })
        syncStore.createIndex('status', 'status', { unique: false })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Survey operations
export async function saveSurvey(data: Record<string, unknown>): Promise<string> {
  const db = await openDB()
  const id = (data.id as string) || generateId()
  const record = {
    ...data,
    id,
    synced: false,
    updatedAt: new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.surveys, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.surveys).put(record)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'survey',
      entityId: id,
      action: data.id ? 'update' : 'create',
      status: 'pending',
      timestamp: new Date().toISOString(),
      data: record,
    })
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getSurveys(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.surveys, 'readonly')
    const request = tx.objectStore(STORES.surveys).getAll()
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function getSurveyById(id: string): Promise<Record<string, unknown> | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.surveys, 'readonly')
    const request = tx.objectStore(STORES.surveys).get(id)
    request.onsuccess = () => resolve((request.result as Record<string, unknown>) || null)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteSurvey(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.surveys, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.surveys).delete(id)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'survey',
      entityId: id,
      action: 'delete',
      status: 'pending',
      timestamp: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Photo operations
export async function savePhoto(data: {
  id?: string
  surveyId: string
  blob: Blob
  name: string
  type: string
  metadata?: Record<string, unknown>
}): Promise<string> {
  const db = await openDB()
  const id = data.id || generateId()
  const record = {
    id,
    surveyId: data.surveyId,
    blob: data.blob,
    name: data.name,
    type: data.type,
    metadata: data.metadata || {},
    synced: false,
    createdAt: new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.photos, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.photos).put(record)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'photo',
      entityId: id,
      action: 'create',
      status: 'pending',
      timestamp: new Date().toISOString(),
      data: { ...record, blob: '(binary)' },
    })
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPhotos(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.photos, 'readonly')
    const request = tx.objectStore(STORES.photos).getAll()
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function getPhotosBySurvey(surveyId: string): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.photos, 'readonly')
    const index = tx.objectStore(STORES.photos).index('surveyId')
    const request = index.getAll(surveyId)
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.photos, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.photos).delete(id)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'photo',
      entityId: id,
      action: 'delete',
      status: 'pending',
      timestamp: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Measurement operations
export async function saveMeasurement(data: Record<string, unknown>): Promise<string> {
  const db = await openDB()
  const id = (data.id as string) || generateId()
  const record = {
    ...data,
    id,
    synced: false,
    updatedAt: new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.measurements, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.measurements).put(record)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'measurement',
      entityId: id,
      action: data.id ? 'update' : 'create',
      status: 'pending',
      timestamp: new Date().toISOString(),
      data: record,
    })
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getMeasurements(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.measurements, 'readonly')
    const request = tx.objectStore(STORES.measurements).getAll()
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function getMeasurementsBySurvey(surveyId: string): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.measurements, 'readonly')
    const index = tx.objectStore(STORES.measurements).index('surveyId')
    const request = index.getAll(surveyId)
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteMeasurement(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.measurements, STORES.syncQueue], 'readwrite')
    tx.objectStore(STORES.measurements).delete(id)
    tx.objectStore(STORES.syncQueue).put({
      id: generateId(),
      entityType: 'measurement',
      entityId: id,
      action: 'delete',
      status: 'pending',
      timestamp: new Date().toISOString(),
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Sync queue operations
export async function getPendingSync(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.syncQueue, 'readonly')
    const index = tx.objectStore(STORES.syncQueue).index('status')
    const request = index.getAll('pending')
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAllSyncItems(): Promise<Record<string, unknown>[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.syncQueue, 'readonly')
    const request = tx.objectStore(STORES.syncQueue).getAll()
    request.onsuccess = () => resolve(request.result as Record<string, unknown>[])
    request.onerror = () => reject(request.error)
  })
}

export async function markSynced(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.syncQueue, 'readwrite')
    const store = tx.objectStore(STORES.syncQueue)
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const item = getReq.result
      if (item) {
        item.status = 'synced'
        item.syncedAt = new Date().toISOString()
        store.put(item)
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function markSyncFailed(id: string, error: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.syncQueue, 'readwrite')
    const store = tx.objectStore(STORES.syncQueue)
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const item = getReq.result
      if (item) {
        item.status = 'failed'
        item.error = error
        item.failedAt = new Date().toISOString()
        store.put(item)
      }
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function clearSynced(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.syncQueue, 'readwrite')
    const store = tx.objectStore(STORES.syncQueue)
    const index = store.index('status')
    const request = index.openCursor('synced')
    let count = 0
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        count++
        cursor.delete()
        cursor.continue()
      }
    }
    tx.oncomplete = () => resolve(count)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getSyncStats(): Promise<{
  pending: number
  synced: number
  failed: number
  total: number
}> {
  const items = await getAllSyncItems()
  return {
    pending: items.filter((i) => i.status === 'pending').length,
    synced: items.filter((i) => i.status === 'synced').length,
    failed: items.filter((i) => i.status === 'failed').length,
    total: items.length,
  }
}

export async function clearAllData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.surveys, STORES.photos, STORES.measurements, STORES.syncQueue],
      'readwrite'
    )
    tx.objectStore(STORES.surveys).clear()
    tx.objectStore(STORES.photos).clear()
    tx.objectStore(STORES.measurements).clear()
    tx.objectStore(STORES.syncQueue).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getStorageEstimate(): Promise<{
  usage: number
  quota: number
  usagePercent: number
} | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null
  }
  const estimate = await navigator.storage.estimate()
  const usage = estimate.usage || 0
  const quota = estimate.quota || 0
  return {
    usage,
    quota,
    usagePercent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
  }
}
