import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { UserEmailTemplate } from 'src/user-email-template-management/entities/userEmailTemplate.entity';

const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;
config({ path: envFilePath });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: configService.getOrThrow<number>('DB_PORT'),
  username: configService.getOrThrow<string>('DB_USERNAME'),
  password: configService.getOrThrow<string>('DB_PASSWORD'),
  database: configService.getOrThrow<string>('DB_NAME'),
  migrations: ['migrations/**'],
  entities: [User, UserEmailTemplate],
  subscribers: [],
});
