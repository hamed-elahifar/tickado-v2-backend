import { Injectable, NotFoundException } from '@nestjs/common';
import { Document, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { PaginationQueryDto } from '../dto';
import { Types } from 'mongoose';

@Injectable()
export abstract class BaseService<
  T extends Document,
  CreateDto = Record<string, any>,
  UpdateDto = Record<string, any>,
> {
  constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly entityName: string,
  ) {}

  async create(createDto: CreateDto): Promise<T> {
    return this.repository.create(createDto as Record<string, any>);
  }

  async findAll(
    filter: FilterQuery<T>,
    projection?: string[] | string,
    paginationQueryDto?: PaginationQueryDto,
  ): Promise<T[]> {
    const { limit = 10, offset = 0 } = paginationQueryDto || {};
    const normalizedProjection = this.normalizeProjection(projection);
    const entities = await this.repository.findAll(
      filter,
      normalizedProjection,
      {
        limit,
        offset,
      },
    );
    return entities || [];
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: string[] | string,
  ): Promise<T | null> {
    const normalizedProjection = this.normalizeProjection(projection);
    const entity = await this.repository.findOne(filter, normalizedProjection);
    return entity || null;
  }

  async findOneSafe(filter: FilterQuery<T>, projection?: string[]): Promise<T> {
    const normalizedProjection = this.normalizeProjection(projection);
    const entity = await this.repository.findOne(filter, normalizedProjection);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return entity;
  }

  async update(id: string, updateDto: UpdateDto): Promise<T> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundException(`${this.entityName} ${id} not found`);
    }

    const entity = await this.repository.update(
      { _id: id } as FilterQuery<T>,
      updateDto as Record<string, any>,
    );

    if (!entity) {
      throw new NotFoundException(`${this.entityName} ${id} not found`);
    }

    return entity;
  }

  protected isValidObjectId(id: string): boolean {
    const ObjectId: typeof Types.ObjectId = Types.ObjectId;
    return ObjectId.isValid(id);
  }

  private normalizeProjection(
    projection?: string[] | string,
  ): string[] | undefined {
    if (!projection) return undefined;

    const fields = Array.isArray(projection)
      ? projection
      : projection.split(',');

    const normalized = fields
      .map((field) => field.trim())
      .filter((field) => field.length > 0);

    return normalized.length > 0 ? normalized : undefined;
  }
}
