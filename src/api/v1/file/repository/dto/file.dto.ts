export interface FileDto {
  uuid?: string;
  name: string;
  storageKey: string;
  mime: string;
  size: number;
  status?: string;
  expiresAt?: Date | null;
  folderUuid?: string;
}
