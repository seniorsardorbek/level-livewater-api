import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { CustomRequest, PaginationResponse } from 'src/_shared/response'
import {
  convertArrayToJSON,
  deleteFile,
  write,
  xlsxToArray
} from 'src/_shared/utils/passport.utils'
import { Device } from './Schema/Device'
import { CreateDeviceDto } from './dto/create-device.dto'
import { DeviceQueryDto } from './dto/device.query.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'

@Injectable()
export class DevicesService {
  constructor (@InjectModel(Device.name) private deviceModel: Model<Device>) {}

  async create (createDeviceDto: CreateDeviceDto, file: Express.Multer.File) {
    const dpkExist = await this.deviceModel.findOne({
      device_privet_key: createDeviceDto.device_privet_key,
    })
    const serieExist = await this.deviceModel.findOne({
      serie: createDeviceDto.serie,
    })
    if (serieExist || dpkExist) {
      deleteFile('uploads', file.filename)
      throw new BadRequestException({
        msg: `${serieExist ? serieExist.serie : ''} ${
          dpkExist ? dpkExist.serie : ''
        }  already exists!`,
      })
    }

    const data = xlsxToArray(file.path)
    if (data.length === 0) {
      deleteFile('uploads', file.filename)
      throw new BadRequestException({ msg: 'Invalid xlsx file ' })
    }
    write(
      `./passports/${createDeviceDto.serie}.json`,
      convertArrayToJSON(data)
    )
    return this.deviceModel.create(createDeviceDto)
  }

  async findAll ({ page }: QueryDto): Promise<PaginationResponse<Device>> {
    const { limit = 10, offset = 0 } = page || {}

    const total = await this.deviceModel.find().countDocuments()

    const data = await this.deviceModel
      .find()
      .populate([
        { path: 'region', select: 'name' },
        { path: 'owner', select: 'first_name last_name' },
      ])
      .limit(limit)
      .skip(limit * offset)

    return { data, limit, offset, total }
  }

  async regionAll ({
    filter,
  }: DeviceQueryDto): Promise<PaginationResponse<Device>> {
    const total = await this.deviceModel.find().countDocuments()
    const data = await this.deviceModel.find(filter)
    return { data, limit: 0, offset: 0, total }
  }

  async oneUserDevices (
    req: CustomRequest,
    { page }: QueryDto
  ): Promise<PaginationResponse<Device>> {
    const id = req.user.id
    const { limit = 10, offset = 0 } = page || {}
    const total = await this.deviceModel.find({ owner: id }).countDocuments()
    const data = await this.deviceModel
      .find({ owner: id })
      .populate([{ path: 'region', select: 'name' }])
      .limit(limit)
      .skip(limit * offset)
    return { data, limit, offset, total }
  }

  findOne ({ id }: ParamIdDto) {
    return this.deviceModel.findById(id).populate([
      { path: 'region', select: 'name' },
      { path: 'owner', select: 'username first_name last_name' },
    ])
  }

  async update (
    { id }: ParamIdDto,
    updateDeviceDto: UpdateDeviceDto,
    file: Express.Multer.File
  ) {
    const exist = await this.deviceModel.findById(id)
    if (!exist) {
      deleteFile('uploads', file?.filename)
      throw new BadRequestException({ msg: 'Device does not exist!' })
    }
    const dpkExist = await this.deviceModel.findOne({
      device_privet_key: updateDeviceDto.device_privet_key, _id : {$ne :id}
    })
    const serieExist = await this.deviceModel.findOne({
      serie: updateDeviceDto.serie, _id : {$ne :id}
    })
    if (serieExist && dpkExist) {
      file?.filename &&  deleteFile('uploads', file.filename)
      throw new BadRequestException({
        msg: 'Device private key or serie already exists!',
      })
    }
    const data = xlsxToArray(file?.path ) 
    if (data.length === 0 && file?.path) {
      file?.filename &&  deleteFile('uploads', file?.filename)
      throw new BadRequestException({ msg: 'Invalid xlsx file ' })
    }
  
    file?.filename &&  write(
      `./passports/${updateDeviceDto.serie||exist.serie}.json`,
      convertArrayToJSON(data)
    )
    deleteFile('passports',`${exist.serie}.json`)
    const updated = await this.deviceModel.findByIdAndUpdate(
      id,
      updateDeviceDto,
      { new: true }
    )
    if (updated) {
      return { msg: 'Qurilma yangilandi.' }
    } else {
      throw new BadRequestException({ msg: 'Qurilmani yangilashda xatolik' })
    }
  }

  async remove ({ id }: ParamIdDto) {
    const removed = await this.deviceModel.findById(id)
   deleteFile('passports',`${removed.serie}.json`)
   const deleted = await this.deviceModel.findByIdAndDelete(id)
    if (deleted) {
      return { msg: "Qurilma o'chirildi." }
    } else {
      throw new BadRequestException({ msg: 'Qurilmani ochirishda xatolik' })
    }
  }
}
