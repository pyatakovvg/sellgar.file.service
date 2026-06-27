import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FileModel } from '../file/file.model';

@Entity('folder')
@Index('idx_folder_parent_uuid', ['parentUuid'])
export class FolderModel {
  @PrimaryColumn('uuid', { name: 'uuid', default: () => 'gen_random_uuid()' })
  uuid: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'parent_uuid', type: 'uuid', nullable: true })
  parentUuid: string | null;

  @ManyToOne(() => FolderModel, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: 'parent_uuid' })
  parent?: FolderModel | null;

  @OneToMany(() => FolderModel, (folder) => folder.parent)
  children: FolderModel[];

  @OneToMany(() => FileModel, (file) => file.folder)
  files: FileModel[];

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
