import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common'
import { RegionsService } from './regions.service'
import { CreateRegionDto } from './dto/create-region.dto'
import { UpdateRegionDto } from './dto/update-region.dto'
import { ParamIdDto, QueryDto } from 'src/_shared/query.dto'
import { ApiTags } from '@nestjs/swagger'
import { SetRoles } from 'src/auth/set-roles.decorator'
import { IsLoggedIn } from 'src/auth/is-loggin.guard'
import { HasRole } from 'src/auth/has-roles.guard'

@Controller('regions')
@ApiTags('Regions')
export class RegionsController {
  constructor (private readonly regionsService: RegionsService) {}
  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Post()
  create (@Body() createRegionDto: CreateRegionDto) {
    return this.regionsService.create(createRegionDto)
  }

  @SetRoles('admin', 'operator')
  @UseGuards(IsLoggedIn, HasRole)
  @Get()
  findAll (@Query() query: QueryDto) {
    return this.regionsService.findAll(query)
  }

  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Patch(':id')
  update (
    @Param(ValidationPipe) id: ParamIdDto,
    @Body() updateRegionDto: UpdateRegionDto
  ) {
    return this.regionsService.update(id, updateRegionDto)
  }
  @SetRoles('admin')
  @UseGuards(IsLoggedIn, HasRole)
  @Delete(':id')
  remove (@Param(ValidationPipe) id: ParamIdDto) {
    return this.regionsService.remove(id)
  }
}
