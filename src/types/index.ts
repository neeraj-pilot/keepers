export interface Keeper {
  id: string;
  name: string;
  phone: string;
  email: string;
  storageNote: string;
  language: string;
}

export interface SecretConfig {
  ownerName: string;
  ownerContact: string;
  secretType: string;
  customSecretType: string;
  toolName: string;
  toolWebsite: string;
  secret: string;
  keepers: Keeper[];
  threshold: number;
  message: string;
}

export interface Share {
  keeperId: string;
  keeperName: string;
  shareData: string;
}

export interface GeneratedShares {
  shares: Share[];
  config: Omit<SecretConfig, 'secret'>;
  createdAt: string;
}

export type SecretType =
  | 'ente-recovery'
  | 'crypto-wallet'
  | 'password-manager'
  | 'other';

export const SECRET_TYPE_LABELS: Record<SecretType, string> = {
  'ente-recovery': 'Ente.io Recovery Key',
  'crypto-wallet': 'Crypto wallet seed phrase',
  'password-manager': 'Password manager master password',
  'other': 'Other',
};

// Secret types that use BIP39 word lists and can be validated
export const BIP39_SECRET_TYPES: SecretType[] = ['ente-recovery', 'crypto-wallet'];

export const KEEPER_COUNT_OPTIONS = [3, 5, 7] as const;
export type KeeperCount = typeof KEEPER_COUNT_OPTIONS[number];
