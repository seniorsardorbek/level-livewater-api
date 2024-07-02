import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ParamIdDto } from 'src/_shared/query.dto'
import { CustomRequest, PaginationResponse } from 'src/_shared/response'
import {
  deleteFile,
  write,
  xlsxToArray,
} from 'src/_shared/utils/passport.utils'
import { MqttService } from 'src/mqtt/mqtt.service'
import { Device } from './Schema/Device'
import { CreateDeviceDto } from './dto/create-device.dto'
import { DeviceQueryDto } from './dto/device.query.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'

@Injectable()
export class DevicesService {
  constructor (
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    private readonly MqttService: MqttService
  ) {
    this.deviceModel
      .find()
      .lean()
      .then(devices => {
        devices.map((device: any) => {
          return this.MqttService.subscribe(`${device?.serie}/up`)
        })
      })
  }

  async create (createDeviceDto: CreateDeviceDto, file: Express.Multer.File) {
    try {
      const data = xlsxToArray(file?.path)
      if (!data) {
        file?.filename && deleteFile('uploads', file.filename)
        throw new BadRequestException({ msg: 'Invalid xlsx file ' })
      }
      const dpkExist = await this.deviceModel.findOne({
        $or: [
          { device_privet_key: createDeviceDto.device_privet_key },
          { serie: createDeviceDto.serie },
        ],
      })
      if (dpkExist) {
        file.filename && deleteFile('uploads', file.filename)
        throw new BadRequestException({
          msg: `Device private key or serie already exists!`,
          exist: dpkExist,
        })
      }

      write(`./passports/${createDeviceDto.serie}.json`, data as any[])
      this.MqttService.subscribe(`${createDeviceDto?.serie}/up`)
      return this.deviceModel.create(createDeviceDto)
    } catch (error) {
      throw new BadRequestException({
        msg: "Keyinroq urinib ko'ring...",
        error,
      })
    }
  }

  async findAll (
    req: CustomRequest,
    { page, filter }: DeviceQueryDto
  ): Promise<PaginationResponse<Device>> {
    try {
      const { limit = 10, offset = 0 } = page || {}

      const userRole = req.user.role
      const userId = req.user.id
      const query: any = {}
      if (userRole === 'operator') {
        query.owner = userId
      }
      const total = await this.deviceModel
        .find({ ...query, ...filter })
        .populate([
          { path: 'region', select: 'name' },
          { path: 'owner', select: 'first_name last_name' },
        ])
        .countDocuments()
        
      const data = await this.deviceModel
        .find({ ...query, ...filter })
        .populate([
          { path: 'region', select: 'name' },
          { path: 'owner', select: 'first_name last_name' },
        ])
        .limit(limit)
        .skip(limit * offset)

      return { data, limit, offset, total }
    } catch (error) {
      throw new BadRequestException({
        msg: "Keyinroq urinib ko'ring...",
        error,
      })
    }
  }

  async findOne ({ id }: ParamIdDto) {
    try {
      return this.deviceModel.findById(id).populate([
        { path: 'region', select: 'name' },
        { path: 'owner', select: 'username first_name last_name' },
      ])
    } catch (error) {
      throw new BadRequestException({
        msg: "Keyinroq urinib ko'ring...",
        error,
      })
    }
  }

  async update (
    { id }: ParamIdDto,
    updateDeviceDto: UpdateDeviceDto,
    file: Express.Multer.File
  ) {
    try {
      const exist = await this.deviceModel.findById(id)
      if (!exist) {
        deleteFile('uploads', file?.filename)
        throw new BadRequestException({ msg: 'Device does not exist!' })
      }
      const dpkExist = await this.deviceModel.findOne({
        device_privet_key: updateDeviceDto.device_privet_key,
        _id: { $ne: id },
      })
      const serieExist = await this.deviceModel.findOne({
        serie: updateDeviceDto.serie,
        _id: { $ne: id },
      })
      if (serieExist || dpkExist) {
        file?.filename && deleteFile('uploads', file.filename)
        throw new BadRequestException({
          msg: 'Device private key or serie already exists!',
        })
      }
      if (file?.path && updateDeviceDto.serie) {
        const data = xlsxToArray(file.path)
        if (!data) {
          if (file.filename) deleteFile('uploads', file.filename)
          throw new BadRequestException({ msg: 'Invalid xlsx file' })
        }
        const targetFileName = updateDeviceDto.serie || exist.serie
        deleteFile('passports', `${exist.serie}.json`)
        if (file.filename)
          write(`./passports/${targetFileName}.json`, data as any)
      } else if (file?.path && !updateDeviceDto.serie) {
        if (file.filename) deleteFile('uploads', file.filename)
        throw new BadRequestException({ msg: 'Serie is required!' })
      } else if (!file?.path && updateDeviceDto?.serie) {
        throw new BadRequestException({ msg: 'File is required!' })
      }

      if (updateDeviceDto.serie) {
        this.MqttService.subscribe(`${updateDeviceDto?.serie}/up`)
      }
      const updated = await this.deviceModel.findByIdAndUpdate(
        id,
        updateDeviceDto,
        { new: true }
      )
      if (updated) {
        return { msg: 'Qurilma yangilandi.', updated }
      } else {
        throw new BadRequestException({ msg: 'Qurilmani yangilashda xatolik' })
      }
    } catch (error) {
      throw new BadRequestException({
        msg: "Keyinroq urinib ko'ring...",
        error,
      })
    }
  }

  async remove ({ id }: ParamIdDto) {
    try {
      const removed = await this.deviceModel.findById(id)
      deleteFile('passports', `${removed.serie}.json`)
      const deleted = await this.deviceModel.findByIdAndDelete(id, {
        new: true,
      })
      this.MqttService.unsubscribe(`${deleted.serie}/up`)
      if (deleted) {
        return { msg: "Qurilma o'chirildi." }
      } else {
        throw new BadRequestException({ msg: 'Qurilmani ochirishda xatolik' })
      }
    } catch (error) {
      throw new BadRequestException({
        msg: "Keyinroq urinib ko'ring...",
        error,
      })
    }
  }
}
