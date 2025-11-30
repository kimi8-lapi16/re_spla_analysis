import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

// Import all DTOs that should be included in OpenAPI
import { CreateUserDto, UserResponseDto, AuthTokenResponseDto } from './user/user.dto';
import { LoginDto } from './auth/auth.dto';
import { BulkCreateMatchesRequest, BulkCreateMatchesResponse, MatchData } from './match/match.dto';
import { GetWeaponsResponse, WeaponResponse, SubWeaponResponse, SpecialWeaponResponse } from './weapon/weapon.dto';
import { GetStagesResponse, StageResponse } from './stage/stage.dto';
import { GetRulesResponse, RuleResponse } from './rule/rule.dto';
import { GetBattleTypesResponse, BattleTypeResponse } from './battle-type/battle-type.dto';

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
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [
        CreateUserDto,
        UserResponseDto,
        AuthTokenResponseDto,
        LoginDto,
        BulkCreateMatchesRequest,
        BulkCreateMatchesResponse,
        MatchData,
        GetWeaponsResponse,
        WeaponResponse,
        SubWeaponResponse,
        SpecialWeaponResponse,
        GetStagesResponse,
        StageResponse,
        GetRulesResponse,
        RuleResponse,
        GetBattleTypesResponse,
        BattleTypeResponse,
      ],
    });

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
