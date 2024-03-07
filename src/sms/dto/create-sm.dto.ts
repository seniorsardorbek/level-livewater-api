import { Transform } from 'class-transformer'
import { IsInt, IsNumber, IsPhoneNumber, IsString, Length, Min } from 'class-validator'

export class CreateSmDto {
  @IsString()
  mobile_phone: string
  @IsString()
  message: string
  @IsString()
  from: string
  @IsString()
  callback_url: string
}
export class TotalDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @IsNumber()
  year: number
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @IsNumber()
  month: number
}
