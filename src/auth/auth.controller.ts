import {
  Post,
  Get,
  Controller,
  UseGuards,
  Req,
  Res,
  HttpException,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { Public, RequestUser, ResponseMessage } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';
import { IUser } from 'src/users/interface/user.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @UseGuards(LocalAuthGuard)
  @ResponseMessage(MESSAGE_SUCCESS.LOGIN_SUCCESS)
  @Post('/login')
  async handleLogin(
    @Req() req: Request & { user: IUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req.user, res);
  }

  @Public()
  @Post('/register')
  @ResponseMessage(MESSAGE_SUCCESS.REGISTER_NEW_USER_SUCCESS)
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      return await this.authService.registerUser(registerUserDto);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  // get profile of user after login success
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  // handle get user when f5
  @Get('/account')
  async handleGetUser(@RequestUser() user: IUser) {
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = temp?.permissions;

    return { user };
  }

  //handle refresh token to get new access token
  @Public()
  @Get('/refresh-token')
  @ResponseMessage(MESSAGE_SUCCESS.REFRESH_TOKEN_SUCCESS)
  async handleRefreshToken(@Req() req: Request) {
    try {
      const { refreshToken } = req.cookies;
      return this.authService.refreshAccessToken(refreshToken);
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }

  // handle logout
  @Post('/logout')
  @ResponseMessage(MESSAGE_SUCCESS.LOGOUT_SUCCESS)
  async handleLogout(
    @Res({ passthrough: true }) res: Response,
    @RequestUser() user: IUser,
  ) {
    try {
      await this.authService.logout(user, res);
      res.clearCookie('refreshToken');
    } catch (error) {
      throw new HttpException(error.message, error.statusCode);
    }
  }
}
