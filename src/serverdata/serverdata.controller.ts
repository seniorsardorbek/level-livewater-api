import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { ServerdataService } from './serverdata.service'
import { SetRoles } from 'src/auth/set-roles.decorator'
import { IsLoggedIn } from 'src/auth/is-loggin.guard'
import { HasRole } from 'src/auth/has-roles.guard'

@Controller('serverdata')
@ApiTags('Serverdata')
export class ServerdataController {
  constructor (private readonly serverdataService: ServerdataService) {}
  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Get()
  findAll (@Query() query: QueryDto) {
    return this.serverdataService.findAll(query)
  }
  @Get("check")
  check () {
    return this.serverdataService.create()
  }

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Get(':id')
  findOne (@Param(ValidationPipe) id: ParamIdDto) {
    return this.serverdataService.findOne(id)
  }
}
