import { app } from "electron";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import type { Host, KeychainEntry, Snippet, AppData } from "../shared/types";

const dataPath = join(app.getPath("userData"), "data.json");

function readData(): AppData {
  if (!existsSync(dataPath)) {
    return { hosts: [], keychain: [], snippets: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(dataPath, "utf-8"));
    const data: AppData = { hosts: [], keychain: [], snippets: [], ...raw };
    // Migrate: ensure every host has a tunnels array
    data.hosts = data.hosts.map((h) =>
      h.tunnels ? h : { ...h, tunnels: [] }
    );
    return data;
  } catch {
    return { hosts: [], keychain: [], snippets: [] };
  }
}

function writeData(data: AppData): void {
  writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Hosts CRUD

export function getHosts(): Host[] {
  return readData().hosts;
}

export function createHost(
  input: Omit<Host, "id" | "createdAt" | "updatedAt">,
): Host {
  const data = readData();
  const now = new Date().toISOString();
  const host: Host = { ...input, id: uuidv4(), createdAt: now, updatedAt: now };
  data.hosts.push(host);
  writeData(data);
  return host;
}

export function updateHost(
  id: string,
  input: Partial<Omit<Host, "id" | "createdAt" | "updatedAt">>,
): Host | null {
  const data = readData();
  const index = data.hosts.findIndex((h) => h.id === id);
  if (index === -1) return null;
  data.hosts[index] = {
    ...data.hosts[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.hosts[index];
}

export function deleteHost(id: string): boolean {
  const data = readData();
  const before = data.hosts.length;
  data.hosts = data.hosts.filter((h) => h.id !== id);
  if (data.hosts.length === before) return false;
  writeData(data);
  return true;
}

// Keychain CRUD

export function getKeychain(): KeychainEntry[] {
  return readData().keychain;
}

export function createKeychainEntry(
  input: Omit<KeychainEntry, "id" | "createdAt" | "updatedAt">,
): KeychainEntry {
  const data = readData();
  const now = new Date().toISOString();
  const entry: KeychainEntry = {
    ...input,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  data.keychain.push(entry);
  writeData(data);
  return entry;
}

export function updateKeychainEntry(
  id: string,
  input: Partial<Omit<KeychainEntry, "id" | "createdAt" | "updatedAt">>,
): KeychainEntry | null {
  const data = readData();
  const index = data.keychain.findIndex((k) => k.id === id);
  if (index === -1) return null;
  data.keychain[index] = {
    ...data.keychain[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.keychain[index];
}

export function deleteKeychainEntry(id: string): boolean {
  const data = readData();
  const before = data.keychain.length;
  data.keychain = data.keychain.filter((k) => k.id !== id);
  if (data.keychain.length === before) return false;
  // Cascade: null out keychainId on hosts referencing this entry
  data.hosts = data.hosts.map((h) =>
    h.keychainId === id
      ? { ...h, keychainId: null, updatedAt: new Date().toISOString() }
      : h,
  );
  writeData(data);
  return true;
}

// Snippets CRUD

export function getSnippets(): Snippet[] {
  return readData().snippets;
}

export function createSnippet(
  input: Omit<Snippet, "id" | "createdAt" | "updatedAt">,
): Snippet {
  const data = readData();
  const now = new Date().toISOString();
  const snippet: Snippet = { ...input, id: uuidv4(), createdAt: now, updatedAt: now };
  data.snippets.push(snippet);
  writeData(data);
  return snippet;
}

export function updateSnippet(
  id: string,
  input: Partial<Omit<Snippet, "id" | "createdAt" | "updatedAt">>,
): Snippet | null {
  const data = readData();
  const index = data.snippets.findIndex((s) => s.id === id);
  if (index === -1) return null;
  data.snippets[index] = {
    ...data.snippets[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.snippets[index];
}

export function deleteSnippet(id: string): boolean {
  const data = readData();
  const before = data.snippets.length;
  data.snippets = data.snippets.filter((s) => s.id !== id);
  if (data.snippets.length === before) return false;
  writeData(data);
  return true;
}
