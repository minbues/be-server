import { Module } from '@nestjs/common';
import databaseConfig from './database/config/database.config';
import { ConfigModule } from '@nestjs/config';
import appConfig from './database/config/app.config';
import authConfig from './modules/auth/config/auth.config';
import { ApiModule } from './modules/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig],
      envFilePath: ['.env'],
    }),
    ApiModule,
  ],
})
export class AppModule {}
