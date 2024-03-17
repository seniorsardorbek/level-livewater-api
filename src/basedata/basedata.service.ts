import { BadRequestException, Injectable, Res } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Response } from 'express'
import { Model } from 'mongoose'
import { DataItem, DeviceFace } from 'src/_shared'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { CustomRequest, PaginationResponse } from 'src/_shared/response'
import { getDataFromDevice } from 'src/_shared/utils/passport.utils'
import { formatTimestamp } from 'src/_shared/utils/utils'
import { Device } from 'src/devices/Schema/Device'
import * as XLSX from 'xlsx'
import { SmsService } from '../sms/sms.service'
import { Basedata } from './Schema/Basedatas'
import { BasedataQueryDto } from './dto/basedata.query.dto'
import { CreateBasedatumDto } from './dto/create-basedatum.dto'

@Injectable()
export class BasedataService {
  constructor (
    @InjectModel(Basedata.name) private basedataModel: Model<Basedata>,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    private readonly SmsService: SmsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async checkStatus () {
    try {
      const now = new Date()
      const dayAgo = new Date(now.getTime() - 1440 * 60 * 1000)
      const timestampDayAgo = dayAgo.getTime()
      const devices: DeviceFace[] = await this.deviceModel
        .find({ isWorking: true })
        .populate({ path: 'owner', select: 'mobil_phone' })
        .lean()
      const data: DataItem[] = await this.basedataModel
        .find({
          date_in_ms: { $gte: timestampDayAgo },
        })
        .lean()

      this.processDevices(devices, data)
    } catch (error) {
      console.log(error)
    }
  }

// ! Malumotlarni saqlash
  async create (createBasedata: CreateBasedatumDto) {
    try {
      const device = await this.deviceModel.findOne({
        serie: createBasedata.serie,
      })
      if (!device) {
        throw new BadRequestException({ msg: 'Device not found!' })
      }
      if (!device.isWorking) {
        await  this.deviceModel.findByIdAndUpdate(device._id, { isWorking: true })
      }
      const deviceLevel =
        createBasedata.level > 59
          ? 59
          : createBasedata.level < 5
          ? 5
          : createBasedata.level
      const date_in_ms = new Date().getTime()
      const signal = deviceLevel ? 'good' : 'nosignal'
      const { volume } = await getDataFromDevice(
        deviceLevel,
        createBasedata.serie
      )
      this.basedataModel.create({
        date_in_ms,
        signal,
        level: createBasedata.level,
        device: device._id,
        volume,
      })
      return { msg: 'Malumot saqlandi!' }
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." , error })
    }
  }

  // ! Barcha ma'lumotlarni olish uchun
  async findAll ({
    page,
    filter,
    sort,
  }: BasedataQueryDto ,  req : CustomRequest): Promise<PaginationResponse<Basedata>> {
    try {
      const { limit = 10, offset = 0 } = page || {}
      const { by = 'date_in_ms', order = 'desc' } = sort || {}
      const { start, end, device, region } = filter || {}
      const query: any = {}
      const userRole = req.user.role
      const userId = req.user.id
      if (userRole === 'operator'){
        const devices = await this.deviceModel.find({ owner : userId }).lean()
        const devices_id = devices.map(device => device._id)
        query.device = { $in: devices_id }
      }
      if (start) {
        query.date_in_ms = query.date_in_ms || {}
        query.date_in_ms.$gte = start
      }
      if (end) {
        query.date_in_ms = query.date_in_ms || {}
        query.date_in_ms.$lte = end
      }
      if (device) {
        query.device = device
      }
      if (!device && region) {
        const devices = await this.deviceModel.find({ region }).lean()
        const devices_id = devices.map(device => device._id)
        query.device = { $in: devices_id }
      }
      const total = await this.basedataModel.find({ ...query }).countDocuments()
      const data = await this.basedataModel
        .find({ ...query })
        .sort({ [by]: order === 'desc' ? -1 : 1 })
        .populate([{ path: 'device', select: 'serie name' }])
        .limit(limit)
        .skip(limit * offset)
      return { data, limit, offset, total }
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }
   
  // !Oxirgi qo'shilgan malumotlarni olish
  async lastData ({ filter, page }: BasedataQueryDto , req: CustomRequest) {
    try {
      const userId = req.user.id
      const userRole = req.user.role
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const timestampOneHourAgo = oneHourAgo.getTime()
      const query : any = {
        date_in_ms: { $gte: timestampOneHourAgo },
      }
      if (userRole === 'operator'){
        const devices = await this.deviceModel.find({ owner : userId }).lean()
        const devices_id = devices.map(device => device._id)
        query.device = { $in: devices_id }
      }
      const data: DataItem[] = await this.basedataModel
        .find(query)
        .populate([{ path: 'device', select: 'serie name' }])
        .lean()
      let uniqueSeriesMap = {}

      data.forEach(item => {
        const serie = item?.device?.serie
        if (serie) {
          uniqueSeriesMap[serie] = item
        }
      })

      let uniqueSeriesArray = Object.values(uniqueSeriesMap)
      return uniqueSeriesArray
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }
  

  //! Bitta qurilma ma'lumotlarini olish uchun
  async findOneDevice (
    { page }: QueryDto,
    { id }: ParamIdDto
  ): Promise<PaginationResponse<Basedata>> {
    try {
      const { limit = 10, offset = 0 } = page || {}
      const total = await this.basedataModel
        .find({ device: id })
        .countDocuments()
      const data = await this.basedataModel
        .find({ device: id })
        .populate([{ path: 'device', select: 'serie  ' }])
        .limit(limit)
        .skip(limit * offset)
      return { data, limit, offset, total }
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

  //! Bitta malumotni olish uchun
  findOne ({ id }: ParamIdDto) {
    try {
      return this.basedataModel.findById(id)
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

  async xlsx (req : CustomRequest ,{ filter, page }: BasedataQueryDto, @Res() res: Response) {
    try {
      const { start, end, device, region } = filter || {}
      const { limit = 1000 } = page || {}
      const query: any = {}
      const userId = req.user.id
      if (req.user.id === 'operator'){
        const devices = await this.deviceModel.find({ owner : userId }).lean()
        const devices_id = devices.map(device => device._id)
        query.device = { $in: devices_id }
      }
      if (start) {
        query.date_in_ms = query.date_in_ms || {}
        query.date_in_ms.$gte = start
      }
      if (end) {
        query.date_in_ms = query.date_in_ms || {}
        query.date_in_ms.$lte = end
      }
      if (device) {
        query.device = device
      }
      if (!device && region) {
        const devices = await this.deviceModel.find({ region }).lean()
        const devices_id = devices.map(device => device._id)
        query.device = { $in: devices_id }
      }
      const data = await this.basedataModel
        .find({ ...query })
        .sort({ date_in_ms: -1 })
        .populate([{ path: 'device', select: 'serie' }])
        .limit(limit)
        .exec()
      const jsonData = data.map((item: any) => {
        const obj = item.toObject()
        obj._id = item?._id?.toString()
        obj.device = item?.device?.serie
        obj.pressure = item.pressure || 961.8
        obj.date_in_ms = formatTimestamp(item?.date_in_ms)
        return obj
      })
      const ws = XLSX.utils.json_to_sheet(jsonData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'DataSheet')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
      res.setHeader('Content-Disposition', 'attachment; filename=basedata.xlsx')
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.send(excelBuffer)
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

 

  private async processDevices (devices: DeviceFace[], data: DataItem[]) {
    for (const device of devices) {
      const isWorking = data.some(
        basedata =>
          basedata.signal === 'good' &&
          basedata.device.toString() === device._id.toString()
      )

      if (!isWorking) {
        try {
          // Update device status in the database
          await this.deviceModel.findByIdAndUpdate(device._id, {
            isWorking: false,
          })

          // Send SMS notification
          const ownerMobilePhone = device?.owner?.mobil_phone
          const message = `${device?.name || 'Qurilma'} ushbu IDli ${
            device?._id
          } 24 soat ichida server bilan boglanmadi. Iltimos qo'llanmaga asosan xatolikni bartaraf eting. Details: https://level.livewater.uz`
          await this.SmsService.sender({
            mobile_phone: ownerMobilePhone,
            message,
            callback_url: 'https://level.livewater.uz',
            from: '4546',
          })

          console.log(`SMS notification sent to ${ownerMobilePhone}`)
        } catch (error) {
          console.error(`Error processing device ${device._id}:`, error)
        }
      }
    }
  }
}
