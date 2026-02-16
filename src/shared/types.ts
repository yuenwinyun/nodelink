export interface TunnelConfig {
  id: string;
  name: string;
  localPort: number;
  remoteHost: string;
  remotePort: number;
}

export interface Host {
  id: string;
  name: string;
  address: string;
  port: number;
  username: string;
  keychainId: string | null;
  tunnels: TunnelConfig[];
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

export interface Snippet {
  id: string;
  name: string;
  command: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  hosts: Host[];
  keychain: KeychainEntry[];
  snippets: Snippet[];
}
