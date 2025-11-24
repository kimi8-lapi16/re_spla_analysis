import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSecretRepository } from './user-secret.repository';
import { UserUseCase } from './user.usecase';

@Module({
  imports: [JwtModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserSecretRepository, UserUseCase],
  exports: [UserService],
})
export class UserModule {}
