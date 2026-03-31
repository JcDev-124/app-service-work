import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../modules/auth/domain/user.entity';
import { CreateUsersTable1710000000000 } from './migrations/1710000000000-create-users-table';

const dbType = (process.env.DB_TYPE ?? 'sqlite') as 'sqlite' | 'postgres';

export const AppDataSource = new DataSource(
  dbType === 'postgres'
    ? {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'app_service_work',
        entities: [User],
        migrations: [CreateUsersTable1710000000000],
        synchronize: false,
      }
    : {
        type: 'sqlite',
        database: process.env.DB_DATABASE ?? ':memory:',
        entities: [User],
        migrations: [CreateUsersTable1710000000000],
        synchronize: false,
      },
);
