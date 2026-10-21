import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: './data/app.sqlite',
  synchronize: true,
  autoLoadEntities: true,
  logging: false,
};
