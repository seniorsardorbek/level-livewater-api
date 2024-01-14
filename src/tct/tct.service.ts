import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosResponse } from 'axios'
import { Model } from 'mongoose'
import { getDataFromDevice } from 'src/_shared/utils/passport.utils'
import { getCurrentDateTime } from 'src/_shared/utils/utils'
import { Basedata } from 'src/basedata/Schema/Basedatas'
import { Device } from 'src/devices/Schema/Device'
import { Serverdata } from 'src/serverdata/Schema/Serverdata'

@Injectable()
export class TctService {
  constructor (
    private httpService: HttpService,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    @InjectModel(Basedata.name) private basedataModel: Model<Basedata>,
    @InjectModel(Serverdata.name) private serverDataModel: Model<Serverdata>
  ) {}
  @Cron(CronExpression.EVERY_HOUR)
  async create () {
    const devices = await this.deviceModel.find()
    const date_in_ms = new Date().getTime()
    devices.map(async dev => {
      const { level, volume, pressure } = await getDataFromDevice(
        5,
        59,
        dev.serie
      )
      this.fetchData(dev, level, volume, date_in_ms, pressure)
    })
  }

  fetchData (
    dev: Device,
    level: number,
    volume: number,
    date_in_ms: number,
    pressure: number
  ) {
    const url = 'http://94.228.112.211:2010'
    const data = {
      code: dev.device_privet_key,
      data: {
        level,
        volume,
        vaqt: getCurrentDateTime(date_in_ms),
      },
    }
    this.httpService
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .toPromise()
      .then(res => {
        this.saveData(data, dev, res, date_in_ms, pressure)
      })
      .catch(err => {
        this.saveData(data, dev, err, date_in_ms, pressure)
      })
  }

  async saveData (
    data: any,
    device: any,
    res: AxiosResponse,
    date_in_ms: number,
    pressure: number
  ) {
    const { level, volume } = data.data
    const signal = level && pressure  && volume ? 'good' : 'nosignal'
    const { _id } = await this.basedataModel.create({
      date_in_ms,
      device: device._id,
      level,
      pressure,
      volume,
      signal
    })
    this.serverDataModel.create({
      basedata: _id,
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
