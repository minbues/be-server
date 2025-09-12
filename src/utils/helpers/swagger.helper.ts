/* eslint-disable @typescript-eslint/require-await */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';

import { config } from '../../config/app.config';

const SERVICE_NAME: string = config.service.name;
const SERVICE_DESCRIPTION: string = config.service.description;
const API_VERSION: string = config.service.apiVersion;
const SWAGGER_BASE_URL: string = config.service.docsBaseUrl;
const swaggerBasicAuthPass: string = config.server.swaggerBasicAuthPass;
const swaggerBasicAuthUsername: string = config.server.swaggerBasicAuthUsername;

export const initializeSwagger = async (
  app: INestApplication,
): Promise<void> => {
  const server = app.getHttpAdapter();

  // Apply basic authentication to the Swagger UI
  app.use(
    ['/docs/fs'],
    expressBasicAuth({
      challenge: true,
      users: { [String(swaggerBasicAuthUsername)]: swaggerBasicAuthPass },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle(`${SERVICE_NAME} API spec`)
    .setDescription(`${SERVICE_DESCRIPTION} | | [swagger.json](swagger.json)`)
    .setVersion(API_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  server.get(`${SWAGGER_BASE_URL}/swagger.json`, (_, res) => {
    res.json(document);
  });

  SwaggerModule.setup(SWAGGER_BASE_URL, app, document, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });
};
