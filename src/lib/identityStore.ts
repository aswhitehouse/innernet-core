/**
 * Flat-file store for token-based identity (name + preferences + last session trajectory).
 * No email or private PII — token is opaque; name is display-only.
 */

import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const COOKIE_NAME = "innernet_token";

export type UserPreferences = {
  /** Last chosen mode when they left */
  lastMode?: "explore" | "drift" | "intro";
  /** Optional free-form prefs for future use */
  [key: string]: unknown;
};

export type LastSession = {
  at: string; // ISO
  mode: string;
  /** Short human-readable line e.g. "Explore — video search" */
  summary: string;
};

export type StoredUser = {
  name: string;
  createdAt: string;
  preferences: UserPreferences;
  lastSession: LastSession | null;
};

export type UsersFile = {
  users: Record<string, StoredUser>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "innernet-users.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readUsersFile(): Promise<UsersFile> {
  try {
    const raw = await fs.readFile(USERS_PATH, "utf-8");
    const data = JSON.parse(raw) as UsersFile;
    if (!data.users || typeof data.users !== "object") {
      return { users: {} };
    }
    return data;
  } catch {
    return { users: {} };
  }
}

async function writeUsersFile(data: UsersFile): Promise<void> {
  await ensureDataDir();
  const tmp = USERS_PATH + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, USERS_PATH);
}

export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function createUser(name: string): Promise<{ token: string; user: StoredUser }> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 64) {
    throw new Error("Invalid name");
  }
  const token = generateToken();
  const user: StoredUser = {
    name: trimmed,
    createdAt: new Date().toISOString(),
    preferences: {},
    lastSession: null,
  };
  const file = await readUsersFile();
  file.users[token] = user;
  await writeUsersFile(file);
  return { token, user };
}

export async function getUserByToken(token: string): Promise<StoredUser | null> {
  if (!token || token.length > 128) return null;
  const file = await readUsersFile();
  return file.users[token] ?? null;
}

export async function updateUser(
  token: string,
  patch: Partial<Pick<StoredUser, "preferences" | "lastSession">> & {
    name?: string;
  }
): Promise<StoredUser | null> {
  const file = await readUsersFile();
  const user = file.users[token];
  if (!user) return null;
  if (patch.name != null && patch.name.trim()) {
    user.name = patch.name.trim().slice(0, 64);
  }
  if (patch.preferences) {
    user.preferences = { ...user.preferences, ...patch.preferences };
  }
  if (patch.lastSession) {
    user.lastSession = patch.lastSession;
  }
  file.users[token] = user;
  await writeUsersFile(file);
  return user;
}

export async function recordSessionTrajectory(
  token: string,
  mode: string,
  summary: string
): Promise<void> {
  await updateUser(token, {
    lastSession: {
      at: new Date().toISOString(),
      mode,
      summary,
    },
    preferences: { lastMode: mode as UserPreferences["lastMode"] },
  });
}
