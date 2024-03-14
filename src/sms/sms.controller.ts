import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateSmDto, TotalDto } from './dto/create-sm.dto';
import { SmsService } from './sms.service';
import { SetRoles } from 'src/auth/set-roles.decorator';
import { IsLoggedIn } from 'src/auth/is-loggin.guard';
import { HasRole } from 'src/auth/has-roles.guard';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}


  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Post()
  create(@Body() createSmDto: CreateSmDto) {
    return this.smsService.sender(createSmDto);
  }

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('limit')
  getlimit() {
    return this.smsService.getLimit();
  }
  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Post('total')
  total(@Body() body : TotalDto) {
    return this.smsService.total(body);
  }
  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('refresh')
  refresh() {
    return this.smsService.refreshToken();
  }

}
