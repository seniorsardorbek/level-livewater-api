import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
@Injectable()
export class IsLoggedIn implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException("Ruyxatdan o'ting!")
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
      })
      console.log(payload);
      request['user'] = payload
    } catch (e) {
      throw new UnauthorizedException('Token eskirgan!')
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
