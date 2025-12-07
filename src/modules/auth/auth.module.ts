import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminModule } from '../admin/admin.module'
import { UserModule } from '../user/user.module'
import { JwtConfigModule, JwtConfigService } from '../config/jwt'
import { LegacyConfigModule } from '../config/legacy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AdminJwtStrategy } from './strategy/admin-jwt.strategy'
import { UserJwtStrategy } from './strategy/user-jwt.strategy'

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    JwtConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      inject: [JwtConfigService],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
      }),
    }),
    UserModule,
    AdminModule,
    LegacyConfigModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserJwtStrategy, AdminJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
