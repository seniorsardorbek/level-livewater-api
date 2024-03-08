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
  ValidationPipe
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
  // ?
  @Post()
  @ApiCreatedResponse({
    description: 'Automatically generated basedata ',
    type: Basedata,
  })
  create (@Body() createBasedatumDto: CreateBasedatumDto) {
    return this.basedataService.create(createBasedatumDto)
  }

  // ?
  // ?
  @Get()
  @ApiOperation({
    summary: 'Get all  basedata',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cats.' })
  findAll (@Query() query: BasedataQueryDto) {
    return this.basedataService.findAll(query)
  }
  // ?
  @Get('xlsx')
  async exportToExcel (@Res() res: Response, @Query() query: BasedataQueryDto) {
    return this.basedataService.xlsx(query, res)
  }
  // ?
  // ?
  @Get('last-updated')
  lastData () {
    return this.basedataService.lastData()
  }
  @Get('check')
  checkStatus () {
    return this.basedataService.checkStatus()
  }

  // ?
  // ?
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
  // ?
  // ?
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
  // ?
  // ! Operator sections (last-added , constructor ,constructor in XLSx )
  @SetRoles('operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('opr/lastadded')
  operatorLastData (@Req() req: CustomRequest) {
    return this.basedataService.operatorLastData(req)
  }
  @SetRoles('operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('opr/constructor')
  operatorDeviceBaseData (
    @Query() query: BasedataQueryDto,
    @Req() req: CustomRequest
  ) {
    return this.basedataService.operatorDeviceBaseData(query, req)
  }
  @SetRoles('operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get('opr/constructorxlsx')
  operatorDeviceBaseDataXLSX (
    @Req() req: CustomRequest,
    @Res() res: Response,
    @Query() query: BasedataQueryDto
  ) {
    return this.basedataService.operatorDeviceBaseDataXLSX(req, query, res)
  }
}
