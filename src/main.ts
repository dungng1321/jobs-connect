import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { FormatResponseData } from './middleware/formatResponseData.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  // enable guard global
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // enable interceptor global
  app.useGlobalInterceptors(new FormatResponseData(reflector));

  // config version api and prefix, default is v1
  const version = configService.get('VERSION_API') || 'v2';
  const prefix = configService.get('PREFIX_API') || 'api';

  app.setGlobalPrefix(prefix);
  app.enableVersioning({
    type: VersioningType.URI,

    defaultVersion: version,
  });

  // config cors
  app.enableCors();
  const port = configService.get('PORT');
  await app.listen(port);
}
bootstrap();
