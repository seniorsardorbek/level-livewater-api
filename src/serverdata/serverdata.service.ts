import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosResponse } from 'axios'
import { Model } from 'mongoose'
import { sendedDataFace } from 'src/_shared'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { PaginationResponse } from 'src/_shared/response'
import { getCurrentDateTime } from 'src/_shared/utils/utils'
import { Basedata } from 'src/basedata/Schema/Basedatas'
import { Device } from 'src/devices/Schema/Device'
import { Serverdata } from './Schema/Serverdata'

@Injectable()
export class ServerdataService {
  constructor (
    private httpService: HttpService,
    @InjectModel(Serverdata.name)
    private readonly serverdataModel: Model<Serverdata>,
    @InjectModel(Basedata.name) private readonly basedataModel: Model<Basedata>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>
  ) {}
  @Cron(CronExpression.EVERY_HOUR)
  async create () {
    try {
      const oneHourAgo = new Date(Date.now() - 59 * 60 * 1000).getTime()
      const lastAdded = await this.basedataModel
        .find({ date_in_ms: { $gte: oneHourAgo } })
        .lean()
      const devices = await this.deviceModel.find().lean()

      const date_in_ms = new Date().getTime()
      devices.map(async dev => {
        const basedata: Basedata = lastAdded
          .reverse()
          .find(basedata => basedata.device.toString() === dev._id.toString())
        if (basedata) {
          this.fetchData(dev, basedata, date_in_ms)
        } else {
          this.basedataModel.create({
            volume: 0,
            level: 0,
            date_in_ms,
            device: dev._id,
            signal: 'nosignal',
          })
        }
      })
      return {}
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

  async findAll ({ page }: QueryDto): Promise<PaginationResponse<Serverdata>> {
    try {
      const { limit = 10, offset = 0 } = page || {}
      const [result] = await this.serverdataModel
        .aggregate([
          {
            $facet: {
              data: [
                { $sort: { send_data_in_ms: -1 } },
                { $skip: limit * offset },
                { $limit: limit },
              ],
              total: [
                {
                  $count: 'count',
                },
              ],
            },
          },
          {
            $project: {
              data: 1,
              total: { $arrayElemAt: ['$total.count', 0] },
            },
          },
        ])
        .exec()
      const { data, total } = result

      return { data, limit, offset, total }
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

  findOne ({ id }: ParamIdDto) {
    try {
      return this.serverdataModel.findById(id).populate('basedata')
    } catch (error) {
      throw new BadRequestException({ msg: "Keyinroq urinib ko'ring..." })
    }
  }

  fetchData (dev: Device, basedata: any, date_in_ms: number) {
    const { level, volume } = basedata
    const url = 'http://94.228.112.211:2010'

    const data: sendedDataFace = {
      code: dev.device_privet_key,
      data: {
        level,
        volume,
        vaqt: getCurrentDateTime(date_in_ms),
      },
    }
    this.httpService
      .post(url, data, { headers: { 'Content-Type': 'application/json' } })
      .toPromise()
      .then(res => {
        this.saveData(basedata._id, data, res, date_in_ms)
      })
      .catch(err => {
        this.saveData(basedata._id, data, err, date_in_ms)
      })
  }

  async saveData (
    basedataId: string,
    data: sendedDataFace,
    res: AxiosResponse,
    date_in_ms: number
  ) {
    this.serverdataModel.create({
      basedata: basedataId,
      message:
        res.data?.message ||
        'Malumotlarni serverga yuborishda server tomondan xatolik',
      device_privet_key: data.code,
      send_data_in_ms: date_in_ms,
      status_code:
        res?.data?.status === 'success'
          ? 200
          : res.data?.status === 'error'
          ? 404
          : 500,
    })
  }
}
