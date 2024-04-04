import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import config from './_shared/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { BasedataModule } from './basedata/basedata.module'
import { DevicesModule } from './devices/devices.module'
import { RegionsModule } from './regions/regions.module'
import { ServerdataModule } from './serverdata/serverdata.module'
import { UsersModule } from './users/users.module'
import { SmsModule } from './sms/sms.module';
import { MqttModule } from './mqtt/mqtt.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forRoot(`${config.db.host}/${config.db.name}`),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MqttModule,
    UsersModule,
    RegionsModule,
    DevicesModule,
    BasedataModule,
    ServerdataModule,
    AuthModule,
    SmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
