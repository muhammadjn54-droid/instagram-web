import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class LocationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by location name, city or country' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateLocationDto {
  @ApiProperty({ example: 'Rudaki Park', description: 'Location name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Dushanbe' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Dushanbe Region' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Tajikistan' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '734000' })
  @IsString()
  @IsOptional()
  zipCode?: string;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'Rudaki Park Central' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Dushanbe' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Dushanbe Region' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'Tajikistan' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '734000' })
  @IsString()
  @IsOptional()
  zipCode?: string;
}

export class LocationDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Rudaki Park' })
  name!: string;

  @ApiPropertyOptional({ example: 'Dushanbe' })
  city?: string;

  @ApiPropertyOptional({ example: 'Dushanbe Region' })
  state?: string;

  @ApiPropertyOptional({ example: 'Tajikistan' })
  country?: string;

  @ApiPropertyOptional({ example: '734000' })
  zipCode?: string;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}
