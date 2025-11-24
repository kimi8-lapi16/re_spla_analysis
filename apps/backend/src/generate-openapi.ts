import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function generateOpenApiSpec() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
    });

    console.log('Building OpenAPI config...');
    const config = new DocumentBuilder()
      .setTitle('Re Spla Analysis API')
      .setDescription('API for Splatoon battle analysis application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    console.log('Generating OpenAPI document...');
    const document = SwaggerModule.createDocument(app, config);

    const outputPath = path.resolve(__dirname, '../openapi.json');
    console.log(`Writing to: ${outputPath}`);
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ OpenAPI specification generated at: ${outputPath}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    process.exit(1);
  }
}

generateOpenApiSpec();
