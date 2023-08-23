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
import { Public, RequestUser } from 'src/decorator/customize';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { ResponseMessage } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { MESSAGE_SUCCESS } from 'src/constants/constants.message';
import { IUser } from 'src/users/interface/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
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
      return await this.authService.register(registerUserDto);
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
    return { user };
  }
}
