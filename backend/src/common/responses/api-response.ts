import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ required: false, nullable: true })
  data: T | null;

  @ApiProperty({ type: [String], required: false, nullable: true, example: null })
  errors: string[] | null;

  constructor(statusCode: number, data: T | null = null, errors: string[] | null = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.errors = errors;
  }

  static success<T>(data: T, statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, data, null);
  }

  static error(errors: string[] | string, statusCode: number = 400): ApiResponse<null> {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return new ApiResponse(statusCode, null, errorArray);
  }
}

export class PagedResult<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ example: 100 })
  totalCount: number;

  @ApiProperty({ example: 1 })
  pageNumber: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  constructor(items: T[], totalCount: number, pageNumber: number, pageSize: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalCount / (pageSize || 10)) || 1;
  }
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ type: [String], example: ['Bad request'] })
  errors!: string[];
}
