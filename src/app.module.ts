import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n'
import * as path from 'path'
import { AppConfigModule } from './modules/config/app'
import {
  ThrottleConfigModule,
  ThrottleConfigService,
} from './modules/config/throttle'
import { SqlConfigModule, SqlConfigService } from './modules/config/sql'
import { ThrottlerBehindProxyGuard } from './middlewares/throttler/throttler-behind-proxy.guard'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { AdminModule } from './modules/admin/admin.module'
import { R2Module } from './modules/r2/r2.module'
import { UserScoreInfoModule } from './modules/user-score-info/user-score-info.module';
import { UserScoreHistoryModule } from './modules/user-score-history/user-score-history.module';
import { SummaryModule } from './modules/summary/summary.module';
import { BuildingModule } from './modules/building/building.module';
import { UnitUserModule } from './modules/unit-user/unit-user.module';
import { NotUnitUserModule } from './modules/not-unit-user/not-unit-user.module';
import { UnitModule } from './modules/unit/unit.module';
import { UnitUserVehicleModule } from './modules/unit-user-vehicle/unit-user-vehicle.module';
import { UnitUserVehicleImageModule } from './modules/unit-user-vehicle-image/unit-user-vehicle-image.module';
import { UnitUserVehicleStickerModule } from './modules/unit-user-vehicle-sticker/unit-user-vehicle-sticker.module';
import { UnitUserDocumentModule } from './modules/unit-user-document/unit-user-document.module';
import { NotUnitUserDocumentModule } from './modules/not-unit-user-document/not-unit-user-document.module';
import { UnitUserVehicleDocumentModule } from './modules/unit-user-vehicle-document/unit-user-vehicle-document.module';
import { CavaryR2Module } from './modules/cavary-r2/cavary-r2.module';
import { UnitSummaryModule } from './modules/unit-summary/unit-summary.module';
import { UnitPublicModule } from './modules/unit-public/unit-public.module';

// Scheduler

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      resolvers: [AcceptLanguageResolver],
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [SqlConfigModule],
      useFactory: (sqlConfigService: SqlConfigService) => {
        return {
          type: 'postgres',
          host: sqlConfigService.host,
          port: sqlConfigService.port,
          username: sqlConfigService.username,
          password: sqlConfigService.password,
          database: sqlConfigService.database,
          synchronize: true,
          logging: sqlConfigService.logging,
          autoLoadEntities: true,
          entities: ['dist/**/*.entity.js'],
          // namingStrategy: new SnakeNamingStrategy(),
          useUTC: true,
          legacySpatialSupport: false,
        }
      },
      inject: [SqlConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ThrottleConfigModule],
      inject: [ThrottleConfigService],
      useFactory: (throttleConfigService: ThrottleConfigService) => [
        {
          ...throttleConfigService,
          ttl: throttleConfigService.throttleTtl,
          limit: throttleConfigService.throttleLimit,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AdminModule,
    R2Module,
    UserScoreInfoModule,
    UserScoreHistoryModule,
    SummaryModule,
    BuildingModule,
    UnitUserModule,
    NotUnitUserModule,
    UnitModule,
    UnitUserVehicleModule,
    UnitUserVehicleImageModule,
    UnitUserVehicleStickerModule,
    UnitUserDocumentModule,
    NotUnitUserDocumentModule,
    UnitUserVehicleDocumentModule,
    CavaryR2Module,
    UnitSummaryModule,
    UnitPublicModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
