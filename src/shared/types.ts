export interface Host {
  id: string;
  name: string;
  address: string;
  port: number;
  username: string;
  keychainId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeychainEntry {
  id: string;
  label: string;
  username: string;
  authType: "password" | "key";
  password: string;
  sshKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  hosts: Host[];
  keychain: KeychainEntry[];
}
