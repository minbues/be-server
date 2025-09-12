import '../polyfill';
import { Logger, ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config/app.config';
import { initializeSwagger } from './utils/helpers/swagger.helper';
import * as bodyParser from 'body-parser';

const SERVER_PORT: number = +config.server.port;
const SERVICE_NAME: string = config.service.name;
const HOST_NAME: string = config.server.hostname;
const SERVICE_BASE_URL: string = config.service.baseUrl;
const SERVICE_DOCS_BASE_URL: string = config.service.docsBaseUrl;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.enableCors({
    origin: '*',
  });
  await initializeSwagger(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(bodyParser.json({ limit: '200mb' }));
  app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
  await app.listen(SERVER_PORT, '0.0.0.0');
}
void bootstrap().then(() => {
  Logger.log(`${SERVICE_NAME} API service started`);
  Logger.log(`Started on http(s)://${HOST_NAME}${SERVICE_BASE_URL}`);
  Logger.log(
    `Docs available on http(s)://${HOST_NAME}${SERVICE_DOCS_BASE_URL}`,
  );
});
