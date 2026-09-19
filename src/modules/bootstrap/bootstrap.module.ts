import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtConfigModule, JwtConfigService } from '../config/jwt'
import { PersonnelAdmin } from '../personnel-admin/entities/personnel-admin.entity'
import { BootstrapController } from './bootstrap.controller'
import { BootstrapGuard, ExportGuard } from './bootstrap.guard'
import { BootstrapService } from './bootstrap.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonnelAdmin]),
    JwtConfigModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      inject: [JwtConfigService],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
      }),
    }),
  ],
  controllers: [BootstrapController],
  providers: [BootstrapService, BootstrapGuard, ExportGuard],
})
export class BootstrapModule {}
