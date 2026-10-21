import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Location } from '../../entities/location.entity.js';
import type {
  CreateLocationDto,
  UpdateLocationDto,
  LocationQueryDto,
  LocationDto,
} from './dto/location.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(dto: CreateLocationDto): Promise<LocationDto> {
    const loc = this.locationRepository.create(dto);
    const saved = await this.locationRepository.save(loc);
    return this.findOne(saved.id);
  }

  async findAll(query: LocationQueryDto): Promise<PagedResult<LocationDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const where = query.search
      ? [
          { name: Like(`%${query.search}%`) },
          { city: Like(`%${query.search}%`) },
          { country: Like(`%${query.search}%`) },
        ]
      : {};

    const [locations, totalCount] = await this.locationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: LocationDto[] = locations.map((l) => ({
      id: l.id,
      name: l.name,
      city: l.city,
      state: l.state,
      country: l.country,
      zipCode: l.zipCode,
      createdAt: l.createdAt,
    }));

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async findOne(id: number): Promise<LocationDto> {
    const l = await this.locationRepository.findOne({ where: { id } });
    if (!l) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return {
      id: l.id,
      name: l.name,
      city: l.city,
      state: l.state,
      country: l.country,
      zipCode: l.zipCode,
      createdAt: l.createdAt,
    };
  }

  async update(id: number, dto: UpdateLocationDto): Promise<LocationDto> {
    const l = await this.locationRepository.findOne({ where: { id } });
    if (!l) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    if (dto.name !== undefined) l.name = dto.name;
    if (dto.city !== undefined) l.city = dto.city;
    if (dto.state !== undefined) l.state = dto.state;
    if (dto.country !== undefined) l.country = dto.country;
    if (dto.zipCode !== undefined) l.zipCode = dto.zipCode;

    await this.locationRepository.save(l);
    return this.findOne(id);
  }

  async remove(id: number): Promise<string> {
    const l = await this.locationRepository.findOne({ where: { id } });
    if (!l) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    await this.locationRepository.delete(id);
    return 'Location deleted successfully';
  }
}
