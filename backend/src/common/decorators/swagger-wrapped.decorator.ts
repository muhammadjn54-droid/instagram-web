import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse as SwaggerResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse, PagedResult, ErrorResponseDto } from '../responses/api-response.js';

export const ApiOkWrapped = <DataDto extends Type<unknown>>(dataDto?: DataDto) => {
  if (!dataDto) {
    return applyDecorators(
      SwaggerResponse({
        status: 200,
        description: 'Success',
        schema: {
          properties: {
            statusCode: { type: 'number', example: 200 },
            data: { type: 'object', nullable: true },
            errors: { type: 'array', items: { type: 'string' }, nullable: true, example: null },
          },
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    SwaggerResponse({
      status: 200,
      description: 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCreatedWrapped = <DataDto extends Type<unknown>>(dataDto?: DataDto) => {
  if (!dataDto) {
    return applyDecorators(
      SwaggerResponse({
        status: 201,
        description: 'Created',
        schema: {
          properties: {
            statusCode: { type: 'number', example: 201 },
            data: { type: 'object', nullable: true },
            errors: { type: 'array', items: { type: 'string' }, nullable: true, example: null },
          },
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    SwaggerResponse({
      status: 201,
      description: 'Created',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dataDto),
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiPagedWrapped = <ItemDto extends Type<unknown>>(itemDto: ItemDto) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, PagedResult, itemDto),
    SwaggerResponse({
      status: 200,
      description: 'Paged items',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PagedResult) },
                  {
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: getSchemaPath(itemDto) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponses = () => {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    SwaggerResponse({
      status: 400,
      description: 'Bad Request / Validation Error',
      type: ErrorResponseDto,
    }),
    SwaggerResponse({
      status: 401,
      description: 'Unauthorized / Invalid credentials',
      type: ErrorResponseDto,
    }),
    SwaggerResponse({
      status: 403,
      description: 'Forbidden / Not the owner',
      type: ErrorResponseDto,
    }),
    SwaggerResponse({
      status: 404,
      description: 'Resource Not Found',
      type: ErrorResponseDto,
    }),
    SwaggerResponse({
      status: 409,
      description: 'Conflict / Already exists',
      type: ErrorResponseDto,
    }),
  );
};
