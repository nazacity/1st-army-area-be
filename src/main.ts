import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AppConfigService } from './modules/config/app'
import * as basicAuth from 'express-basic-auth'
import * as helmet from 'helmet'
import { NestExpressApplication } from '@nestjs/platform-express'

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
      // close in production?
      // forbidNonWhitelisted: true,
    }),
  )
  app.setGlobalPrefix('/api/')
  const configService = app.get(ConfigService)
  const appConfigService: AppConfigService = configService.get('app')
  requestSecurityInit(app)
  app.use(
    ['/api/docs'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USERNAME || 'admin']:
          process.env.SWAGGER_PASSWORD || '123456',
      },
    }),
  )
  const config = new DocumentBuilder()
    .setTitle('Check running example')
    .setDescription('Check running API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        description: '##### Login by User',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
      },
      'User Authorization',
    )
    .addBearerAuth(
      {
        type: 'http',
        description: '##### Secret key for Admin Function',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
      },
      'Admin Authorization',
    )
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      filter: true,
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
  })

  await app.listen(appConfigService.port || 5001)
  console.log('Server started with port: ' + appConfigService.port)
}

function requestSecurityInit(app) {
  app.use(
    helmet.dnsPrefetchControl({
      allow: true,
    }),
    helmet.frameguard({
      action: 'deny',
    }),
    helmet.hsts({
      maxAge: 15552000,
      includeSubDomains: false,
    }),
    helmet.crossOriginEmbedderPolicy(),
    helmet.crossOriginOpenerPolicy(),
    helmet.crossOriginResourcePolicy(),
    helmet.hidePoweredBy(),
    helmet.ieNoOpen(),
    helmet.noSniff(),
    helmet.originAgentCluster(),
    helmet.permittedCrossDomainPolicies(),
    helmet.xssFilter(),
  )
}

main()
