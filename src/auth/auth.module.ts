import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { User, UserSchema } from 'src/users/Schema/Users'
import config from 'src/_shared/config'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: config.jwt.secret,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
