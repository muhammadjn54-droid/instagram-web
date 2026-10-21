import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service.js';
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationQueryDto,
  LocationDto,
} from './dto/location.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Locations')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of locations with pagination and search' })
  @ApiPagedWrapped(LocationDto)
  async findAll(@Query() query: LocationQueryDto) {
    return this.locationsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get location details by ID' })
  @ApiOkWrapped(LocationDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiCreatedWrapped(LocationDto)
  async create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update location by ID' })
  @ApiOkWrapped(LocationDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete location by ID' })
  @ApiOkWrapped()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.remove(id);
  }
}
