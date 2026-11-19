import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { FolderModel } from '../folder/folder.model';

@Entity('file')
@Index('idx_file_folder_uuid', ['folderUuid'])
@Index('uq_file_storage_key', ['storageKey'], { unique: true })
export class FileModel {
  @PrimaryColumn('uuid', { name: 'uuid', default: () => 'gen_random_uuid()' })
  uuid: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'storage_key', type: 'text' })
  storageKey: string;

  @Column({ name: 'mime', type: 'text' })
  mime: string;

  @Column({ name: 'size', type: 'int' })
  size: number;

  @Column({ name: 'status', type: 'text', default: 'ready' })
  status: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'folder_uuid', type: 'uuid', nullable: true })
  folderUuid: string | null;

  @ManyToOne(() => FolderModel, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folder_uuid' })
  folder?: FolderModel | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
