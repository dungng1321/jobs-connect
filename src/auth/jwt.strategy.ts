import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_AC_SECRET'),
    });
  }

  async validate(payload: any) {
    const expirationGMTPlus7 = new Date(
      payload.exp * 1000 + 7 * 60 * 60 * 1000,
    ).toISOString();
    return {
      userId: payload.sub,
      username: payload.username,
      expiration: expirationGMTPlus7,
    };
  }
}
