import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { multerOptions } from 'src/_shared/multer.options'
import { ParamIdDto } from 'src/_shared/query.dto'
import { CustomRequest } from 'src/_shared/response'
import { HasRole } from 'src/auth/has-roles.guard'
import { IsLoggedIn } from 'src/auth/is-loggin.guard'
import { SetRoles } from 'src/auth/set-roles.decorator'
import { DevicesService } from './devices.service'
import { CreateDeviceDto } from './dto/create-device.dto'
import { DeviceQueryDto } from './dto/device.query.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'
@Controller('devices')
@ApiTags('Device')
export class DevicesController {
  constructor (private readonly devicesService: DevicesService) {}

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create (
    @Body() createDeviceDto: CreateDeviceDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.devicesService.create(createDeviceDto, file)
  }
  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get()
  findAll (@Req() req: CustomRequest, @Query() query: DeviceQueryDto) {
    return this.devicesService.findAll(req, query)
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('/:id')
  findOne (@Param(ValidationPipe) id: ParamIdDto) {
    return this.devicesService.findOne(id)
  }

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update (
    @Param(ValidationPipe) id: ParamIdDto,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.devicesService.update(id, updateDeviceDto, file)
  }

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Delete(':id')
  remove (@Param(ValidationPipe) id: ParamIdDto) {
    return this.devicesService.remove(id)
  }
}
