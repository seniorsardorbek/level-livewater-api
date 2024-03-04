import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateSmDto, TotalDto } from './dto/create-sm.dto';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  create(@Body() createSmDto: CreateSmDto) {
    return this.smsService.sender(createSmDto);
  }

  @Get('limit')
  getlimit() {
    return this.smsService.getLimit();
  }
  @Post('total')
  total(@Body() body : TotalDto) {
    return this.smsService.total(body);
  }
  @Get('refresh')
  refresh() {
    return this.smsService.refreshToken();
  }

}
