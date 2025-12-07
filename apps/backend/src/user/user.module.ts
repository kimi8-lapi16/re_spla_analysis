import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserSecretRepository } from './user-secret.repository';
import { UserUseCase } from './user.usecase';
import { CommonModule } from '../common/common.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [CommonModule, TokenModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserSecretRepository, UserUseCase],
  exports: [UserService],
})
export class UserModule {}
