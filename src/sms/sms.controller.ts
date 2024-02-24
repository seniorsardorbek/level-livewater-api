import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  create(@Body() createSmDto: CreateSmDto) {
    return this.smsService.sendMessage(createSmDto);
  }

  @Get('limit')
  getlimit() {
    return this.smsService.getLimit();
  }
  @Get('refresh')
  refresh() {
    return this.smsService.refreshToken();
  }

}
