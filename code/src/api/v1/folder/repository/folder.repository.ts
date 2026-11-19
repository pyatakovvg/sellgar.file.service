import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { DataSource } from 'typeorm';

import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderEntity } from '../folder.entity';
import { FolderModel } from '../folder.model';
import { FileModel } from '../../file/file.model';

@Injectable()
export class FolderRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  count(parentUuid: string = null) {
    return this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .where(parentUuid ? 'folder.parentUuid = :parentUuid' : 'folder.parentUuid IS NULL', { parentUuid })
      .getCount();
  }

  async findAll(parentUuid: string = null) {
    const result = await this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .select(['folder.uuid', 'folder.name', 'folder.parentUuid', 'folder.createdAt', 'folder.updatedAt'])
      .where(parentUuid ? 'folder.parentUuid = :parentUuid' : 'folder.parentUuid IS NULL', { parentUuid })
      .orderBy('folder.createdAt', 'ASC')
      .getMany();

    const resultInstance = plainToInstance(FolderEntity, result, {
      strategy: 'excludeAll',
    });

    await Promise.all(resultInstance.map((folder) => validateOrReject(folder)));

    return resultInstance;
  }

  findByUuid(uuid: string) {
    return this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .select(['folder.uuid', 'folder.name', 'folder.parentUuid', 'folder.createdAt', 'folder.updatedAt'])
      .where('folder.uuid = :uuid', { uuid })
      .getOne();
  }

  async create(dto: CreateFolderDto) {
    await this.assertParentExists(dto.parentUuid);
    await this.assertNameAvailable(dto.name, dto.parentUuid ?? null);

    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(FolderModel)
      .values({
        name: dto.name,
        parentUuid: dto.parentUuid ?? null,
      })
      .execute();

    return this.findByUuid(result.raw[0].uuid);
  }

  async update(uuid: string, dto: UpdateFolderDto) {
    const current = await this.findByUuid(uuid);

    if (!current) {
      throw new NotFoundException(`Folder ${uuid} not found`);
    }

    const nextParentUuid = dto.parentUuid === undefined ? current.parentUuid : dto.parentUuid;
    const nextName = dto.name ?? current.name;

    await this.assertParentExists(nextParentUuid, uuid);
    await this.assertNoCycle(uuid, nextParentUuid);
    await this.assertNameAvailable(nextName, nextParentUuid ?? null, uuid);

    await this.dataSource
      .createQueryBuilder()
      .update(FolderModel)
      .set({
        name: nextName,
        parentUuid: nextParentUuid ?? null,
      })
      .where('uuid = :uuid', { uuid })
      .execute();

    return this.findByUuid(uuid);
  }

  async remove(uuid: string) {
    const current = await this.findByUuid(uuid);

    if (!current) {
      throw new NotFoundException(`Folder ${uuid} not found`);
    }

    const childCount = await this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .where('folder.parentUuid = :uuid', { uuid })
      .getCount();

    const fileCount = await this.dataSource
      .createQueryBuilder(FileModel, 'file')
      .where('file.folderUuid = :uuid', { uuid })
      .getCount();

    if (childCount > 0 || fileCount > 0) {
      throw new BadRequestException('Folder is not empty');
    }

    await this.dataSource.createQueryBuilder().delete().from(FolderModel).where('uuid = :uuid', { uuid }).execute();

    return current;
  }

  private async assertParentExists(parentUuid?: string | null, ownUuid?: string) {
    if (!parentUuid) {
      return;
    }

    if (parentUuid === ownUuid) {
      throw new BadRequestException('Folder cannot be its own parent');
    }

    const parentExists = await this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .where('folder.uuid = :parentUuid', { parentUuid })
      .getExists();

    if (!parentExists) {
      throw new NotFoundException(`Folder parent ${parentUuid} not found`);
    }
  }

  private async assertNoCycle(uuid: string, parentUuid?: string | null) {
    let nextParentUuid = parentUuid;

    while (nextParentUuid) {
      if (nextParentUuid === uuid) {
        throw new BadRequestException('Folder cannot be moved under its descendant');
      }

      const parent = await this.dataSource
        .createQueryBuilder(FolderModel, 'folder')
        .select(['folder.uuid', 'folder.parentUuid'])
        .where('folder.uuid = :uuid', { uuid: nextParentUuid })
        .getOne();

      nextParentUuid = parent?.parentUuid;
    }
  }

  private async assertNameAvailable(name: string, parentUuid: string | null, ownUuid?: string) {
    const builder = this.dataSource
      .createQueryBuilder(FolderModel, 'folder')
      .where(parentUuid ? 'folder.parentUuid = :parentUuid' : 'folder.parentUuid IS NULL', { parentUuid })
      .andWhere('folder.name = :name', { name });

    if (ownUuid) {
      builder.andWhere('folder.uuid <> :ownUuid', { ownUuid });
    }

    const duplicate = await builder.getExists();

    if (duplicate) {
      throw new ConflictException('Folder with this name already exists in the parent folder');
    }
  }
}
