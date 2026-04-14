import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;

  // Global API prefix — exclude health endpoints so / and /health respond without prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health'],
  });

  // CORS
  app.enableCors();

  // Global Validation Pipe — strict, with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform types (e.g. string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (OpenAPI) Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hospital Management API')
    .setDescription(
      'REST API for managing hospital patients, doctors, appointments, and medical orders. ' +
        'All endpoints require JWT Bearer authentication unless otherwise noted.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication and user management')
    .addTag('Patients', 'Patient data management')
    .addTag('Doctors', 'Doctor data management')
    .addTag('Appointments', 'Medical appointments and orders')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
}
void bootstrap();
