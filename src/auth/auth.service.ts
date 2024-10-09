import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { LoginDto, RefreshDto } from './dto/login.dto'
import { Model } from 'mongoose'
import { User } from 'src/users/Schema/Users'
import * as bcrypt from 'bcryptjs'
import { CustomRequest } from 'src/_shared/response'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async login({ username, password }: LoginDto) {
    const existing = await this.userModel.findOne({ username })
    if (!existing) {
      throw new UnauthorizedException('Username yoki parol xato')
    }

    const valid = bcrypt.compareSync(password, existing.password)
    if (!valid) {
      throw new UnauthorizedException('Username yoki parol xato')
    }

  const accsessToken = this.jwtService.sign(
      {
        id: existing._id,
        role: existing.role,
      },
      { expiresIn: '1m' },
    );
    const refreshToken = this.jwtService.sign(
      {
        id: existing._id,
        role: existing.role,
      },
      { expiresIn: '30d' },
    );
    return { msg: 'Muvaffaqqiyatli kirdingiz!', accsessToken, refreshToken };
  }

  async refreshAccessToken(body: RefreshDto) {
    try {
      const { refreshToken } = body;
      const decoded = this.jwtService.verify(refreshToken, );

      const payload = {
        id: decoded.id,
        role: decoded.role,
      };
      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1m' });

      return { access_token: newAccessToken };
    } catch (error) {
     return {success : false}
    }
  }
  async verifyWithToken(req: CustomRequest) {
    console.log(req.user);
    const { id } = req.user
    const user = await this.userModel.findById(id).select('-password')
    if (!user) {
      throw new BadRequestException({
        msg: 'Foydlanuvchi topilmadi yoki token eskirgan!',
      })
    }
    return { msg: 'Muvaffaqqiyatli kirdingiz', data: user , role :  user.role }
  }
}
