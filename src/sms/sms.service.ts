import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { CreateSmDto, TotalDto } from './dto/create-sm.dto'

@Injectable()
export class SmsService {
  constructor (
    private httpService: HttpService,
    private readonly configService: ConfigService
  ) {}
   sendMessage (createSmDto: CreateSmDto) {
    return  this.sender(createSmDto)

  }

  async getLimit () {
    try {
      const res = await this.httpService
        .get('http://notify.eskiz.uz/api/user/get-limit', {
          headers: {
            authorization: `Bearer ${this.configService.get<string>(
              'SMS_TOKEN'
            )}`,
          },
        })
        .toPromise()
      return res?.data
    } catch (error) {
      throw new BadRequestException({ msg: 'Keyinroq urinib koring', error })
    }
  }
  async refreshToken () {
    this.httpService
      .patch(
        'http://notify.eskiz.uz/api/auth/refresh',
        {},
        {
          headers: {
            authorization: `Bearer ${this.configService.get<string>(
              'SMS_TOKEN'
            )}`,
          },
        }
      )
      .toPromise()
      .then(res => {
        if (res?.data?.token_type === 'bearer') {
          this.configService.set<string>('SMS_TOKEN', res.data.data.token)
        }
      })
      .catch(err => {
        console.log(err)
      })
    return { msg: 'Token yangilandi' }
  }
  async total (body: TotalDto) {
    return this.httpService
      .post('https://notify.eskiz.uz/api/user/totals', body, {
        headers: {
          authorization: `Bearer ${this.configService.get<string>(
            'SMS_TOKEN'
          )}`,
        },
      })
      .toPromise()
      .then(res => {
        return res.data
      })
      .catch(err => {
        return err.response
      })
  }

  async sender (options: CreateSmDto) {
    const url = `https://notify.eskiz.uz/api/message/sms/send`
    const data =  await  this.httpService
      .post(url, options, {
        headers: {
          authorization: `Bearer ${this.configService.get<string>(
            'SMS_TOKEN'
          )}`,
          'Content-Type': 'application/json',
        },
      })
      .toPromise()
      .then((res: AxiosResponse) => {
        return res.data
      })
      .catch(error => {
        console.log(error)
        return error.response?.data 
      })
   return data
  }
}
