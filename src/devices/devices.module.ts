import { Module } from '@nestjs/common'
import { DevicesService } from './devices.service'
import { DevicesController } from './devices.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Device, DeviceSchema } from './Schema/Device'
import { MulterConfig } from 'src/_shared/multer.middleware'

@Module({
  imports: [
    MulterConfig ,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],

  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
