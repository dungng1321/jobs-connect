import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: { message: string | undefined }) {
    if (err || !user) {
      throw err || new UnauthorizedException(info.message);
    }
    return user;
  }
}
