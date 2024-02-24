import { IsPhoneNumber, IsString, Length } from 'class-validator'

export class CreateSmDto {
  @IsString()
  // @Length(12)
  // @IsPhoneNumber('UZ')
  mobile_phone: string
  @IsString()
  message: string
  @IsString()
  from: string
  @IsString()
  callback_url: string
}
