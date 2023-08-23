import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';
import { comparePassword } from 'src/util/hashPassword';
import { IUser } from 'src/users/interface/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const response = await this.usersService.findByUsername(username);
    const user = response as User;

    if (user && comparePassword(password, user.password)) {
      return user;
    }
  }

  // handle refresh token
  async createRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_RF_SECRET'),
      expiresIn: this.configService.get('JWT_RF_EXPIRATION_TIME'),
    });

    return refreshToken;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login system',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = await this.createRefreshToken(payload);

    // update user refresh token
    await this.usersService.updateRefreshToken(_id, refreshToken);

    // set cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms(
        this.configService.get<string>('JWT_RF_EXPIRATION_TIME') as string,
      ),
    });

    // delete  all cookie with destroy
    response.clearCookie('key1');

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  // register user by user
  async register(registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }
}
