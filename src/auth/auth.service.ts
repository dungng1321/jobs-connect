import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';
import { comparePassword } from 'src/util/hashPassword';
import { IUser } from 'src/users/interface/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const response = await this.usersService.findByUsername(username);
    const user = response as User;

    if (user && comparePassword(password, user.password)) {
      const userRole = user.role as unknown as IUser;
      const role = await this.rolesService.findOne(userRole?._id);

      const objUser = {
        ...user,
        permissions: role?.permissions ?? [],
      };

      return objUser;
    }
  }

  // generate refresh token
  async generateRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_RF_SECRET'),
      expiresIn: this.configService.get('JWT_RF_EXPIRATION_TIME'),
    });

    return refreshToken;
  }

  // handle login api
  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'token login system',
      _id,
      name,
      email,
      role,
      permissions,
    };

    const refreshToken = await this.generateRefreshToken(payload);

    // save refresh token to db
    await this.usersService.updateRefreshTokenField(_id, refreshToken);

    // set refresh token to cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms(this.configService.get('JWT_RF_EXPIRATION_TIME') as string),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  // handle refresh token api, create new access token
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_RF_SECRET'),
      });

      const user = await this.usersService.findOne(payload._id);

      // fetch  role and permissions
      const userRole = user.role as unknown as IUser;
      const roleData = await this.rolesService.findOne(userRole?._id);
      const permissions = roleData?.permissions ?? [];

      // update  new access token
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          _id,
          name,
          email,
          role,
          permissions,
        };
        const newAccessToken = this.jwtService.sign(payload);

        return {
          access_token: newAccessToken,
          user: payload,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message, error.statusCode);
    }
  }

  // handle logout, set refresh token to null
  async logout(user: IUser, res: Response) {
    try {
      await this.usersService.updateRefreshTokenField(user._id, '');
      res.clearCookie('refreshToken');
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  // register new user by user
  async registerUser(registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }
}
