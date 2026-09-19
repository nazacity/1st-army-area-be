import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminModule } from '../admin/admin.module'
import { UserModule } from '../user/user.module'
import { PersonnelModule } from '../personnel/personnel.module'
import { PersonnelAdminModule } from '../personnel-admin/personnel-admin.module'
import { JwtConfigModule, JwtConfigService } from '../config/jwt'
import { LegacyConfigModule } from '../config/legacy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AdminJwtStrategy } from './strategy/admin-jwt.strategy'
import { UserJwtStrategy } from './strategy/user-jwt.strategy'
import { PersonnelJwtStrategy } from './strategy/personnel-jwt.strategy'
import { PersonnelAdminJwtStrategy } from './strategy/personnel-admin-jwt.strategy'

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
    PersonnelModule,
    PersonnelAdminModule,
    LegacyConfigModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserJwtStrategy,
    AdminJwtStrategy,
    PersonnelJwtStrategy,
    PersonnelAdminJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
