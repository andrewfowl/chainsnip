"use server"

import {
  getArchives as dbGetArchives,
  getArchiveById as dbGetArchiveById,
  saveArchive as dbSaveArchive,
  updateArchive as dbUpdateArchive,
  deleteArchive as dbDeleteArchive,
  getCustomExplorers as dbGetCustomExplorers,
  saveCustomExplorer as dbSaveCustomExplorer,
  deleteCustomExplorer as dbDeleteCustomExplorer,
  getAllExplorers as dbGetAllExplorers,
  getUserUsageStats as dbGetUserUsageStats,
} from "@/lib/archives"
import type { Archive, CustomExplorer } from "@/lib/chains"
import { getCurrentUserFromSession } from "@/lib/auth"

// Server Action wrappers so Client Components can invoke database logic
// without bundling the Postgres driver into the browser.
//
// SECURITY: These actions are a public network boundary. Any `userId` sent by
// the client is untrusted and ignored — every action derives the acting user
// from the httpOnly session cookie, and every id-scoped mutation verifies that
// the target row belongs to that session user before touching it. Signatures
// stay backwards-compatible so existing call sites are unaffected.

async function requireUserId(): Promise<string> {
  const user = await getCurrentUserFromSession()
  if (!user) {
    throw new Error("Not authenticated")
  }
  return user.id
}

async function getSessionUserId(): Promise<string | null> {
  const user = await getCurrentUserFromSession()
  return user?.id ?? null
}

export async function getArchives(_userId?: string): Promise<Archive[]> {
  const userId = await getSessionUserId()
  if (!userId) return []
  return dbGetArchives(userId)
}

export async function getArchiveById(id: string): Promise<Archive | null> {
  const userId = await getSessionUserId()
  if (!userId) return null
  const archive = await dbGetArchiveById(id)
  // Only expose the archive if it belongs to the session user.
  if (!archive || archive.userId !== userId) return null
  return archive
}

export async function saveArchive(
  archive: Omit<
    Archive,
    "id" | "archivedAt" | "lastUpdated" | "status" | "chain" | "explorer" | "walletAddress" | "captureStatus"
  >,
): Promise<Archive> {
  const userId = await requireUserId()
  // Force ownership to the session user regardless of what the client sent.
  return dbSaveArchive({ ...archive, userId })
}

export async function updateArchive(id: string, updates: Partial<Archive>): Promise<void> {
  const userId = await requireUserId()
  const existing = await dbGetArchiveById(id)
  if (!existing || existing.userId !== userId) {
    throw new Error("Archive not found")
  }
  // Never let the client reassign ownership through an update.
  const { userId: _ignoredUserId, ...safeUpdates } = updates
  return dbUpdateArchive(id, safeUpdates)
}

export async function deleteArchive(id: string): Promise<void> {
  const userId = await requireUserId()
  const existing = await dbGetArchiveById(id)
  if (!existing || existing.userId !== userId) {
    throw new Error("Archive not found")
  }
  return dbDeleteArchive(id)
}

export async function getCustomExplorers(_userId?: string): Promise<CustomExplorer[]> {
  const userId = await getSessionUserId()
  if (!userId) return []
  return dbGetCustomExplorers(userId)
}

export async function saveCustomExplorer(explorer: Omit<CustomExplorer, "id">): Promise<CustomExplorer> {
  const userId = await requireUserId()
  // Force ownership to the session user regardless of what the client sent.
  return dbSaveCustomExplorer({ ...explorer, userId })
}

export async function deleteCustomExplorer(id: string): Promise<void> {
  const userId = await requireUserId()
  // No getById exists for explorers, so scope the ownership check to the
  // session user's own explorers before deleting.
  const owned = await dbGetCustomExplorers(userId)
  if (!owned.some((e) => e.id === id)) {
    throw new Error("Explorer not found")
  }
  return dbDeleteCustomExplorer(id)
}

export async function getAllExplorers(_userId?: string) {
  const userId = await getSessionUserId()
  return dbGetAllExplorers(userId ?? undefined)
}

export async function getUserUsageStats(_userId?: string) {
  const userId = await getSessionUserId()
  if (!userId) return { userId: "", totalCapturesEver: 0 }
  return dbGetUserUsageStats(userId)
}
