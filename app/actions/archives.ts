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

// Server Action wrappers so Client Components can invoke database logic
// without bundling the Postgres driver into the browser.

export async function getArchives(userId: string): Promise<Archive[]> {
  return dbGetArchives(userId)
}

export async function getArchiveById(id: string): Promise<Archive | null> {
  return dbGetArchiveById(id)
}

export async function saveArchive(
  archive: Omit<
    Archive,
    "id" | "archivedAt" | "lastUpdated" | "status" | "chain" | "explorer" | "walletAddress" | "captureStatus"
  >,
): Promise<Archive> {
  return dbSaveArchive(archive)
}

export async function updateArchive(id: string, updates: Partial<Archive>): Promise<void> {
  return dbUpdateArchive(id, updates)
}

export async function deleteArchive(id: string): Promise<void> {
  return dbDeleteArchive(id)
}

export async function getCustomExplorers(userId: string): Promise<CustomExplorer[]> {
  return dbGetCustomExplorers(userId)
}

export async function saveCustomExplorer(explorer: Omit<CustomExplorer, "id">): Promise<CustomExplorer> {
  return dbSaveCustomExplorer(explorer)
}

export async function deleteCustomExplorer(id: string): Promise<void> {
  return dbDeleteCustomExplorer(id)
}

export async function getAllExplorers(userId?: string) {
  return dbGetAllExplorers(userId)
}

export async function getUserUsageStats(userId: string) {
  return dbGetUserUsageStats(userId)
}
