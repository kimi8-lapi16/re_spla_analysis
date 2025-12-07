import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
