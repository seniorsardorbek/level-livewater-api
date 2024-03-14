import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { CustomRequest } from 'src/_shared/response'
import { HasRole } from 'src/auth/has-roles.guard'
import { IsLoggedIn } from 'src/auth/is-loggin.guard'
import { SetRoles } from 'src/auth/set-roles.decorator'
import { Basedata } from './Schema/Basedatas'
import { BasedataService } from './basedata.service'
import { BasedataQueryDto } from './dto/basedata.query.dto'
import { CreateBasedatumDto } from './dto/create-basedatum.dto'

@Controller('basedata')
@ApiTags('Basedata')
export class BasedataController {
  constructor (private readonly basedataService: BasedataService) {}
  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Post()
  @ApiCreatedResponse({
    description: 'Automatically generated basedata ',
    type: Basedata,
  })
  create (@Body() createBasedatumDto: CreateBasedatumDto) {
    return this.basedataService.create(createBasedatumDto)
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get()
  @ApiOperation({
    summary: 'Get all  basedata',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cats.' })
  findAll (@Query() query: BasedataQueryDto, @Req() req: CustomRequest) {
    return this.basedataService.findAll(query, req)
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('xlsx')
  async exportToExcel (
    @Req() req: CustomRequest,
    @Res() res: Response,
    @Query() query: BasedataQueryDto
  ) {
    return this.basedataService.xlsx(req, query, res)
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('last-updated')
  lastData (@Query() query: BasedataQueryDto, @Req() req: CustomRequest) {
    return this.basedataService.lastData(query, req)
  }
  @Get('check')
  checkStatus () {
    return this.basedataService.checkStatus()
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('device/:id')
  @ApiOperation({
    summary: 'id orqali olish',
    description: 'Aynan bitta qurilma malumotlarini qaytarish.',
  })
  @ApiResponse({ status: 200, description: 'Muvavvaqqiyatli olindi' })
  @ApiResponse({ status: 404, description: 'Xatolik.' })
  findOneDevice (
    @Param(ValidationPipe) id: ParamIdDto,
    @Query() query: QueryDto
  ) {
    return this.basedataService.findOneDevice(query, id)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'id orqali olish',
    description: 'malumotni qaytarish qaytarish.',
  })
  @ApiResponse({ status: 200, description: 'Muvavvaqqiyatli olindi' })
  @ApiResponse({ status: 404, description: 'Xatolik.' })
  findOne (@Param(ValidationPipe) id: ParamIdDto) {
    return this.basedataService.findOne(id)
  }
}
