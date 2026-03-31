import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/domain/user.entity';
import { CreateUsersTable1710000000000 } from './migrations/1710000000000-create-users-table';

type SupportedDb = 'sqlite' | 'postgres';

export function buildTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const dbType = configService.get<SupportedDb>('DB_TYPE', 'sqlite');

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: Number(configService.get<number>('DB_PORT', 5432)),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_DATABASE', 'app_service_work'),
      entities: [User],
      migrations: [CreateUsersTable1710000000000],
      synchronize: false,
      migrationsRun: true,
    };
  }

  return {
    type: 'sqlite',
    database: configService.get<string>('DB_DATABASE', ':memory:'),
    entities: [User],
    migrations: [CreateUsersTable1710000000000],
    synchronize: false,
    migrationsRun: true,
  };
}
